"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  AdminError,
  adjustBalance,
  createProvider,
  createService,
  setOrderStatus,
  setServiceActive,
  setUserStatus,
  updateProvider,
  updateService,
} from "@/lib/admin";

export type AdminFormState = { ok?: boolean; error?: string; message?: string };

export async function adjustBalanceAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  try {
    const userId = String(formData.get("userId"));
    const amount = Number(formData.get("amount"));
    const reason = String(formData.get("reason") ?? "");
    await adjustBalance(userId, amount, reason);
    revalidatePath("/admin/utilisateurs");
    return { ok: true, message: "Solde ajusté." };
  } catch (err) {
    return { error: err instanceof AdminError ? err.message : "Erreur." };
  }
}

export async function toggleUserStatusAction(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get("userId"));
  const next = String(formData.get("next")) as "active" | "suspended";
  await setUserStatus(userId, next);
  revalidatePath("/admin/utilisateurs");
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status"));
  await setOrderStatus(orderId, status);
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
}

export async function toggleServiceActiveAction(formData: FormData) {
  await requireAdmin();
  const serviceId = String(formData.get("serviceId"));
  const next = formData.get("next") === "true";
  await setServiceActive(serviceId, next);
  revalidatePath("/admin/services");
}

export async function updateServiceAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  try {
    await updateService(String(formData.get("serviceId")), {
      name: String(formData.get("name")),
      rate: Number(formData.get("rate")),
      minQuantity: Number(formData.get("minQuantity")),
      maxQuantity: Number(formData.get("maxQuantity")),
      averageTime: String(formData.get("averageTime") ?? ""),
    });
    revalidatePath("/admin/services");
    return { ok: true, message: "Service mis à jour." };
  } catch {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function createServiceAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  try {
    await createService({
      categoryId: String(formData.get("categoryId")),
      name: String(formData.get("name")),
      rate: Number(formData.get("rate")),
      minQuantity: Number(formData.get("minQuantity")),
      maxQuantity: Number(formData.get("maxQuantity")),
      platform: String(formData.get("platform") ?? "") || undefined,
    });
    revalidatePath("/admin/services");
    return { ok: true, message: "Service créé." };
  } catch {
    return { error: "Erreur lors de la création." };
  }
}

export async function updateProviderAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  try {
    await updateProvider(String(formData.get("providerId")), {
      name: String(formData.get("name")),
      apiUrl: String(formData.get("apiUrl") ?? ""),
      apiKey: String(formData.get("apiKey") ?? ""),
    });
    revalidatePath("/admin/fournisseurs");
    return { ok: true, message: "Fournisseur mis à jour." };
  } catch {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function createProviderAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  try {
    await createProvider({
      name: String(formData.get("name")),
      apiUrl: String(formData.get("apiUrl") ?? ""),
      apiKey: String(formData.get("apiKey") ?? ""),
    });
    revalidatePath("/admin/fournisseurs");
    return { ok: true, message: "Fournisseur créé." };
  } catch {
    return { error: "Erreur lors de la création." };
  }
}
