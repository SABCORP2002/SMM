"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { PaymentError, initiateTopUp, syncPendingPayments } from "@/lib/payments";

export type TopUpFormState = {
  ok?: boolean;
  error?: string;
  redirectUrl?: string | null;
  isMock?: boolean;
};

export async function createTopUpAction(
  _prev: TopUpFormState,
  formData: FormData,
): Promise<TopUpFormState> {
  const user = await requireUser();

  try {
    const result = await initiateTopUp({
      userId: user.id,
      amount: Number(formData.get("amount") ?? 0),
      phone: String(formData.get("phone") ?? ""),
      operator: String(formData.get("operator") ?? ""),
    });

    revalidatePath("/mon-espace/recharger");
    revalidatePath("/mon-espace/historique");
    revalidatePath("/mon-espace");

    return { ok: true, redirectUrl: result.redirectUrl, isMock: result.isMock };
  } catch (err) {
    if (err instanceof PaymentError) return { error: err.message };
    console.error("createTopUpAction", err);
    return { error: "Une erreur est survenue. Réessaie dans un instant." };
  }
}

export async function syncMyPaymentsAction() {
  const user = await requireUser();
  await syncPendingPayments({ userId: user.id, limit: 20 });
  revalidatePath("/mon-espace/historique");
  revalidatePath("/mon-espace/recharger");
  revalidatePath("/mon-espace");
}
