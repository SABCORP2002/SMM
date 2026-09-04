import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, orders, providers, services, transactions, users } from "@/db/schema";
import { refund } from "@/lib/orders";

export class AdminError extends Error {}

/** Crédit/débit manuel du portefeuille d'un client, journalisé. */
export async function adjustBalance(userId: string, amount: number, reason: string) {
  if (!Number.isFinite(amount) || amount === 0) {
    throw new AdminError("Montant invalide.");
  }
  await db.transaction(async (tx) => {
    const [u] = await tx.select({ balance: users.balance }).from(users).where(eq(users.id, userId)).limit(1);
    if (!u) throw new AdminError("Utilisateur introuvable.");
    const newBalance = Number(u.balance) + amount;
    await tx.update(users).set({ balance: newBalance }).where(eq(users.id, userId));
    await tx.insert(transactions).values({
      userId,
      type: "admin_adjustment",
      amount,
      balanceAfter: newBalance,
      description: reason || "Ajustement manuel",
    });
  });
}

export async function setUserStatus(userId: string, status: "active" | "suspended") {
  await db.update(users).set({ status }).where(eq(users.id, userId));
}

/** Change le statut d'une commande. Rembourse automatiquement en cas d'annulation. */
export async function setOrderStatus(orderId: string, status: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new AdminError("Commande introuvable.");

  if (status === "canceled" && order.status !== "canceled") {
    await refund(order.id, order.userId, Number(order.charge), "Remboursement — commande annulée (admin)");
  }
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}

export async function setServiceActive(serviceId: string, isActive: boolean) {
  await db.update(services).set({ isActive }).where(eq(services.id, serviceId));
}

export async function updateService(
  serviceId: string,
  patch: { name: string; rate: number; minQuantity: number; maxQuantity: number; averageTime?: string },
) {
  await db.update(services).set(patch).where(eq(services.id, serviceId));
}

export async function createService(input: {
  categoryId: string;
  name: string;
  rate: number;
  minQuantity: number;
  maxQuantity: number;
  platform?: string;
}) {
  await db.insert(services).values(input);
}

export async function updateProvider(
  providerId: string,
  patch: { name: string; apiUrl: string; apiKey: string },
) {
  await db.update(providers).set(patch).where(eq(providers.id, providerId));
}

export async function createProvider(input: { name: string; apiUrl: string; apiKey: string }) {
  await db.insert(providers).values(input);
}

export async function getCategoriesForForm() {
  return db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(categories.sortOrder);
}
