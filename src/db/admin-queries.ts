import "server-only";
import { desc, eq, gte, sql } from "drizzle-orm";
import { db } from "./index";
import {
  categories,
  orders,
  payments,
  providers,
  services,
  users,
} from "./schema";

export async function getAdminStats() {
  const [userCount] = await db.select({ n: sql<number>`count(*)` }).from(users);
  const [orderCount] = await db.select({ n: sql<number>`count(*)` }).from(orders);
  const [revenue] = await db
    .select({ total: sql<number>`coalesce(sum(${orders.charge}), 0)` })
    .from(orders)
    .where(sql`${orders.status} != 'error'`);
  const [pendingOrders] = await db
    .select({ n: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.status, "pending"));
  const [pendingPayments] = await db
    .select({ n: sql<number>`count(*)` })
    .from(payments)
    .where(eq(payments.status, "pending"));
  const [walletTotal] = await db
    .select({ total: sql<number>`coalesce(sum(${users.balance}), 0)` })
    .from(users);
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [newUsers30d] = await db
    .select({ n: sql<number>`count(*)` })
    .from(users)
    .where(gte(users.createdAt, since));

  return {
    userCount: Number(userCount?.n ?? 0),
    orderCount: Number(orderCount?.n ?? 0),
    revenue: Number(revenue?.total ?? 0),
    pendingOrders: Number(pendingOrders?.n ?? 0),
    pendingPayments: Number(pendingPayments?.n ?? 0),
    walletTotal: Number(walletTotal?.total ?? 0),
    newUsers30d: Number(newUsers30d?.n ?? 0),
  };
}

export async function getAllOrdersAdmin(opts?: { status?: string; limit?: number }) {
  return db
    .select({
      id: orders.id,
      link: orders.link,
      quantity: orders.quantity,
      charge: orders.charge,
      cost: orders.cost,
      status: orders.status,
      remains: orders.remains,
      createdAt: orders.createdAt,
      serviceName: services.name,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .innerJoin(services, eq(orders.serviceId, services.id))
    .innerJoin(users, eq(orders.userId, users.id))
    .where(opts?.status ? eq(orders.status, opts.status) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(opts?.limit ?? 100);
}

export async function getAllUsersAdmin(limit = 200) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      balance: users.balance,
      currency: users.currency,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

export async function getAllServicesAdmin() {
  return db
    .select({
      id: services.id,
      name: services.name,
      rate: services.rate,
      providerRate: services.providerRate,
      markupPercent: services.markupPercent,
      minQuantity: services.minQuantity,
      maxQuantity: services.maxQuantity,
      isActive: services.isActive,
      platform: services.platform,
      categoryId: services.categoryId,
      categoryName: categories.name,
      providerId: services.providerId,
    })
    .from(services)
    .innerJoin(categories, eq(services.categoryId, categories.id))
    .orderBy(categories.sortOrder, services.sortOrder);
}

export async function getAllCategoriesAdmin() {
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function getAllProvidersAdmin() {
  return db.select().from(providers).orderBy(desc(providers.createdAt));
}

export async function getAllPaymentsAdmin(limit = 100) {
  return db
    .select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      gateway: payments.gateway,
      status: payments.status,
      operator: payments.operator,
      reference: payments.reference,
      createdAt: payments.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(payments)
    .innerJoin(users, eq(payments.userId, users.id))
    .orderBy(desc(payments.createdAt))
    .limit(limit);
}

export async function getUserDetailAdmin(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user ?? null;
}
