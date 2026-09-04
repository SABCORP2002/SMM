import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { orders, providers, services, transactions, users } from "@/db/schema";
import { getProviderClient } from "@/lib/provider";
import { computeCharge } from "@/lib/utils";

export class OrderError extends Error {}
export class InsufficientFundsError extends OrderError {
  constructor() {
    super("Solde insuffisant. Recharge ton compte avant de commander.");
  }
}

type PlaceOrderInput = {
  userId: string;
  serviceId: string;
  link: string;
  quantity: number;
};

export type PlaceOrderResult = {
  orderId: string;
  charge: number;
  status: string;
  /** Message d'avertissement non bloquant (ex : fournisseur injoignable, remboursé). */
  warning?: string;
};

/** Prix client TTC pour une quantité, en tenant compte d'une remise éventuelle. */
export function priceFor(
  ratePer1000: number,
  quantity: number,
  customRatePercent?: number | null,
) {
  let charge = computeCharge(ratePer1000, quantity);
  if (customRatePercent) {
    charge = Math.round(charge * (1 + customRatePercent / 100));
  }
  return Math.max(charge, 1);
}

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const link = input.link.trim();
  const quantity = Math.floor(Number(input.quantity));

  if (!/^https?:\/\/.+/i.test(link)) {
    throw new OrderError("Le lien doit commencer par http:// ou https://");
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new OrderError("Quantité invalide.");
  }

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, input.serviceId), eq(services.isActive, true)))
    .limit(1);
  if (!service) throw new OrderError("Ce service n'est pas disponible.");

  if (quantity < service.minQuantity || quantity > service.maxQuantity) {
    throw new OrderError(
      `Quantité hors limites (${service.minQuantity.toLocaleString(
        "fr-FR",
      )} – ${service.maxQuantity.toLocaleString("fr-FR")}).`,
    );
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);
  if (!user) throw new OrderError("Session invalide.");

  const charge = priceFor(service.rate, quantity, user.customRatePercent);
  const cost = service.providerRate
    ? computeCharge(service.providerRate, quantity)
    : null;

  if (Number(user.balance) < charge) throw new InsufficientFundsError();

  // Débit + création de la commande, atomiquement.
  const orderId = await db.transaction(async (tx) => {
    const newBalance = Number(user.balance) - charge;
    await tx
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, user.id));

    const [order] = await tx
      .insert(orders)
      .values({
        userId: user.id,
        serviceId: service.id,
        link,
        quantity,
        charge,
        cost,
        status: "pending",
        providerId: service.providerId,
      })
      .returning({ id: orders.id });

    await tx.insert(transactions).values({
      userId: user.id,
      type: "order",
      amount: -charge,
      balanceAfter: newBalance,
      description: `Commande — ${service.name}`,
      orderId: order.id,
    });

    return order.id;
  });

  // Envoi au fournisseur (best-effort). Sans fournisseur → traitement manuel.
  if (service.providerId && service.providerServiceId) {
    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, service.providerId))
      .limit(1);

    if (provider) {
      try {
        const client = getProviderClient(provider);
        const { providerOrderId } = await client.addOrder({
          providerServiceId: service.providerServiceId,
          link,
          quantity,
        });
        await db
          .update(orders)
          .set({
            providerOrderId,
            status: "in_progress",
            lastSyncAt: new Date(),
          })
          .where(eq(orders.id, orderId));
        return { orderId, charge, status: "in_progress" };
      } catch (err) {
        // Remboursement immédiat, commande marquée en erreur.
        await refund(
          orderId,
          user.id,
          charge,
          `Remboursement — commande non transmise (${service.name})`,
        );
        await db
          .update(orders)
          .set({
            status: "error",
            note: err instanceof Error ? err.message : "Fournisseur injoignable",
          })
          .where(eq(orders.id, orderId));
        return {
          orderId,
          charge,
          status: "error",
          warning:
            "Le fournisseur n'a pas pu être joint. Ta commande a été annulée et le montant recrédité sur ton solde.",
        };
      }
    }
  }

  return { orderId, charge, status: "pending" };
}

/** Recrédite le portefeuille (transaction atomique). */
async function refund(
  orderId: string,
  userId: string,
  amount: number,
  description: string,
) {
  await db.transaction(async (tx) => {
    const [u] = await tx
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const newBalance = Number(u?.balance ?? 0) + amount;
    await tx.update(users).set({ balance: newBalance }).where(eq(users.id, userId));
    await tx.insert(transactions).values({
      userId,
      type: "refund",
      amount,
      balanceAfter: newBalance,
      description,
      orderId,
    });
  });
}

const ACTIVE_STATUSES = ["pending", "in_progress", "processing"] as const;

/**
 * Interroge le fournisseur pour les commandes encore actives et met à jour
 * leur statut. Remboursement au prorata en cas d'annulation / livraison partielle.
 */
export async function syncActiveOrders(opts?: {
  userId?: string;
  limit?: number;
}) {
  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        inArray(orders.status, [...ACTIVE_STATUSES]),
        isNotNull(orders.providerOrderId),
        opts?.userId ? eq(orders.userId, opts.userId) : undefined,
        // Ne pas marteler une commande qui échoue en boucle.
        lt(orders.syncAttempts, 8),
      ),
    )
    .limit(opts?.limit ?? 50);

  if (rows.length === 0) return { checked: 0, updated: 0 };

  const providerCache = new Map<string, typeof providers.$inferSelect>();
  let updated = 0;

  for (const order of rows) {
    if (!order.providerId || !order.providerOrderId) continue;

    let provider = providerCache.get(order.providerId);
    if (!provider) {
      const [p] = await db
        .select()
        .from(providers)
        .where(eq(providers.id, order.providerId))
        .limit(1);
      if (!p) continue;
      provider = p;
      providerCache.set(order.providerId, p);
    }

    try {
      const client = getProviderClient(provider);
      const res = await client.orderStatus(order.providerOrderId);

      const patch: Partial<typeof orders.$inferSelect> = {
        status: res.status,
        startCount: res.startCount ?? order.startCount,
        remains: res.remains ?? order.remains,
        externalStatus: res.status,
        lastSyncAt: new Date(),
        syncAttempts: 0,
      };

      // Remboursements sur annulation / livraison partielle (une seule fois).
      if (res.status === "canceled" && order.status !== "canceled") {
        await refund(
          order.id,
          order.userId,
          Number(order.charge),
          "Remboursement — commande annulée par le fournisseur",
        );
      } else if (
        res.status === "partial" &&
        order.status !== "partial" &&
        res.remains &&
        res.remains > 0
      ) {
        const refundAmount = Math.round(
          (Number(order.charge) * res.remains) / order.quantity,
        );
        if (refundAmount > 0) {
          await refund(
            order.id,
            order.userId,
            refundAmount,
            "Remboursement partiel — livraison incomplète",
          );
        }
      }

      await db.update(orders).set(patch).where(eq(orders.id, order.id));
      updated++;
    } catch {
      await db
        .update(orders)
        .set({
          syncAttempts: order.syncAttempts + 1,
          lastSyncAt: new Date(),
        })
        .where(eq(orders.id, order.id));
    }
  }

  return { checked: rows.length, updated };
}
