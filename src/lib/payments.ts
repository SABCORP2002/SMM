import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, transactions, users } from "@/db/schema";
import { getPaymentGateway } from "@/lib/payment";
import { siteConfig } from "@/config/site";
import { makePaymentReference } from "@/lib/utils";

export class PaymentError extends Error {}

type TopUpInput = {
  userId: string;
  amount: number;
  phone: string;
  operator: string;
};

export type TopUpResult = {
  paymentId: string;
  reference: string;
  redirectUrl: string | null;
  /** true en mode bac à sable : le client peut afficher un message adapté. */
  isMock: boolean;
};

export async function initiateTopUp(input: TopUpInput): Promise<TopUpResult> {
  const amount = Math.round(Number(input.amount));
  if (!Number.isFinite(amount) || amount < siteConfig.minDeposit) {
    throw new PaymentError(
      `Le montant minimum est de ${siteConfig.minDeposit} F.`,
    );
  }
  if (!/^\+?[0-9\s-]{8,20}$/.test(input.phone)) {
    throw new PaymentError("Numéro de téléphone invalide.");
  }

  const [user] = await db
    .select({ id: users.id, currency: users.currency })
    .from(users)
    .where(eq(users.id, input.userId))
    .limit(1);
  if (!user) throw new PaymentError("Session invalide.");

  const gateway = getPaymentGateway();
  const reference = makePaymentReference();

  const [payment] = await db
    .insert(payments)
    .values({
      userId: user.id,
      amount,
      currency: user.currency,
      method: "mobile_money",
      gateway: gateway.kind,
      status: "pending",
      reference,
      payerPhone: input.phone,
      operator: input.operator,
    })
    .returning();

  try {
    const result = await gateway.initiate({
      reference,
      amount,
      currency: user.currency,
      phone: input.phone,
      operator: input.operator,
      description: `Rechargement JAL SMM — ${reference}`,
    });

    await db
      .update(payments)
      .set({ externalReference: result.externalReference })
      .where(eq(payments.id, payment.id));

    return {
      paymentId: payment.id,
      reference,
      redirectUrl: result.redirectUrl,
      isMock: gateway.kind === "mock",
    };
  } catch (err) {
    await db
      .update(payments)
      .set({
        status: "failed",
        metadata: err instanceof Error ? err.message : "Erreur passerelle",
      })
      .where(eq(payments.id, payment.id));
    throw new PaymentError(
      "La passerelle de paiement n'a pas répondu. Réessaie dans un instant.",
    );
  }
}

/** Crédite le portefeuille (transaction atomique), une seule fois par paiement. */
async function creditWallet(paymentId: string, userId: string, amount: number, reference: string) {
  await db.transaction(async (tx) => {
    const [u] = await tx
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const newBalance = Number(u?.balance ?? 0) + amount;

    await tx.update(users).set({ balance: newBalance }).where(eq(users.id, userId));
    await tx
      .update(payments)
      .set({ status: "completed", creditedAmount: amount })
      .where(eq(payments.id, paymentId));
    await tx.insert(transactions).values({
      userId,
      type: "deposit",
      amount,
      balanceAfter: newBalance,
      description: `Rechargement Mobile Money — ${reference}`,
      paymentId,
    });
  });
}

/** Interroge la passerelle pour les paiements en attente et crédite si confirmés. */
export async function syncPendingPayments(opts?: {
  userId?: string;
  limit?: number;
}) {
  const rows = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.status, "pending"),
        opts?.userId ? eq(payments.userId, opts.userId) : undefined,
      ),
    )
    .limit(opts?.limit ?? 30);

  const gateway = getPaymentGateway();
  let credited = 0;

  for (const p of rows) {
    if (!p.externalReference) continue;
    try {
      const res = await gateway.verify(p.externalReference);
      if (res.status === "completed") {
        await creditWallet(p.id, p.userId, res.amount ?? Number(p.amount), p.reference);
        credited++;
      } else if (res.status === "failed" || res.status === "canceled") {
        await db
          .update(payments)
          .set({ status: res.status === "canceled" ? "canceled" : "failed" })
          .where(eq(payments.id, p.id));
      }
    } catch {
      // Passerelle injoignable : on retentera à la prochaine synchro.
    }
  }

  return { checked: rows.length, credited };
}
