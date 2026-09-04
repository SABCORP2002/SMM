"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  InsufficientFundsError,
  OrderError,
  placeOrder,
  syncActiveOrders,
} from "@/lib/orders";

export type OrderFormState = {
  ok?: boolean;
  orderId?: string;
  error?: string;
  warning?: string;
};

export async function createOrderAction(
  _prev: OrderFormState,
  formData: FormData,
): Promise<OrderFormState> {
  const user = await requireUser();

  try {
    const result = await placeOrder({
      userId: user.id,
      serviceId: String(formData.get("serviceId") ?? ""),
      link: String(formData.get("link") ?? ""),
      quantity: Number(formData.get("quantity") ?? 0),
    });

    revalidatePath("/mon-espace");
    revalidatePath("/mon-espace/commandes");

    return {
      ok: true,
      orderId: result.orderId,
      warning: result.warning,
    };
  } catch (err) {
    if (err instanceof InsufficientFundsError || err instanceof OrderError) {
      return { error: err.message };
    }
    console.error("createOrderAction", err);
    return { error: "Une erreur est survenue. Réessaie dans un instant." };
  }
}

export async function syncMyOrdersAction() {
  const user = await requireUser();
  await syncActiveOrders({ userId: user.id, limit: 40 });
  revalidatePath("/mon-espace/commandes");
  revalidatePath("/mon-espace");
}
