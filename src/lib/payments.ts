import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { payments, referrals, transactions, users } from "@/db/schema";
import { getPaymentGateway } from "@/lib/payment";
import { siteConfig } from "@/config/site";
import { getDepositBonusPercent } from "@/lib/constants";
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
  amount: number;
  bonusPercent: number;
  creditedAmount: number;
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
  const bonusPercent = getDepositBonusPercent(amount);
  const creditedAmount = Math.round(amount * (1 + bonusPercent / 100));

  const [payment] = await db
    .insert(payments)
    .values({
      userId: user.id,
      amount,
      creditedAmount,
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
      amount,
      bonusPercent,
      creditedAmount,
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

/** Verse sa commission au parrain, s'il y en a un. N'échoue jamais l'appelant. */
async function payReferralCommission(depositorId: string, depositAmount: number) {
  const [depositor] = await db
    .select({ referredById: users.referredById })
    .from(users)
    .where(eq(users.id, depositorId))
    .limit(1);
  if (!depositor?.referredById) return;

  const [ref] = await db
    .select()
    .from(referrals)
    .where(eq(referrals.refereeId, depositorId))
    .limit(1);
  if (!ref) return;

  const commission = Math.round((depositAmount * ref.commissionPercent) / 100);
  if (commission <= 0) return;

  await db.transaction(async (tx) => {
    const [sponsor] = await tx
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, ref.referrerId))
      .limit(1);
    if (!sponsor) return;

    const newBalance = Number(sponsor.balance) + commission;
    await tx.update(users).set({ balance: newBalance }).where(eq(users.id, ref.referrerId));
    await tx
      .update(referrals)
      .set({ totalEarned: Number(ref.totalEarned) + commission })
      .where(eq(referrals.id, ref.id));
    await tx.insert(transactions).values({
      userId: ref.referrerId,
      type: "referral_bonus",
      amount: commission,
      balanceAfter: newBalance,
      description: "Commission de parrainage — recharge d'un filleul",
    });
  });
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

  await payReferralCommission(userId, amount);
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
        // creditedAmount inclut déjà la prime de recharge, fixée au moment de la demande.
        await creditWallet(p.id, p.userId, Number(p.creditedAmount ?? p.amount), p.reference);
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
