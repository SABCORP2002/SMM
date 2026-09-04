import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "./index";
import {
  categories,
  orders,
  pages,
  posts,
  referrals,
  services,
  transactions,
  users,
} from "./schema";

/** Catégories actives triées, avec leurs services actifs. */
export async function getCatalog(platform?: string) {
  const cats = await db
    .select()
    .from(categories)
    .where(
      platform
        ? and(eq(categories.isActive, true), eq(categories.platform, platform))
        : eq(categories.isActive, true),
    )
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  const svc = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.sortOrder), asc(services.name));

  return cats.map((cat) => ({
    ...cat,
    services: svc.filter((s) => s.categoryId === cat.id),
  }));
}

/** Liste distincte des plateformes présentes dans les catégories actives. */
export async function getActivePlatforms() {
  const rows = await db
    .select({ platform: categories.platform })
    .from(categories)
    .where(eq(categories.isActive, true));
  return [...new Set(rows.map((r) => r.platform).filter(Boolean))] as string[];
}

/** Fourchette de prix (min rate) — utile pour la vitrine. */
export async function getServiceCount() {
  const rows = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.isActive, true));
  return rows.length;
}

export async function getPublishedPosts(category?: string) {
  return db
    .select()
    .from(posts)
    .where(
      category
        ? and(eq(posts.status, "published"), eq(posts.category, category))
        : eq(posts.status, "published"),
    )
    .orderBy(desc(posts.publishedAt));
}

export async function getPostBySlug(slug: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);
  return post ?? null;
}

export async function getPage(slug: string) {
  const [page] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return page ?? null;
}

export async function getAllPageSlugs() {
  const rows = await db.select({ slug: pages.slug }).from(pages);
  return rows.map((r) => r.slug);
}

/* ─── Espace client ───────────────────────────────────────────────── */

export async function getUserDashboard(userId: string) {
  const userOrders = await db
    .select({
      id: orders.id,
      quantity: orders.quantity,
      charge: orders.charge,
      status: orders.status,
      link: orders.link,
      createdAt: orders.createdAt,
      serviceName: services.name,
    })
    .from(orders)
    .innerJoin(services, eq(orders.serviceId, services.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  const allCharges = await db
    .select({ charge: orders.charge, status: orders.status })
    .from(orders)
    .where(eq(orders.userId, userId));

  const totalSpent = allCharges
    .filter((o) => o.status !== "canceled")
    .reduce((sum, o) => sum + Number(o.charge), 0);

  const lastTx = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(5);

  return {
    ordersCount: allCharges.length,
    totalSpent,
    recentOrders: userOrders,
    recentTransactions: lastTx,
  };
}

export async function getUserOrders(userId: string, limit = 50) {
  return db
    .select({
      id: orders.id,
      link: orders.link,
      quantity: orders.quantity,
      charge: orders.charge,
      status: orders.status,
      startCount: orders.startCount,
      remains: orders.remains,
      createdAt: orders.createdAt,
      serviceName: services.name,
      platform: services.platform,
    })
    .from(orders)
    .innerJoin(services, eq(orders.serviceId, services.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getReferralInfo(userId: string) {
  const [me] = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const filleuls = await db
    .select({
      id: users.id,
      name: users.name,
      createdAt: users.createdAt,
    })
    .from(referrals)
    .innerJoin(users, eq(referrals.refereeId, users.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(users.createdAt));

  const [agg] = await db
    .select({ totalEarned: referrals.totalEarned })
    .from(referrals)
    .where(eq(referrals.referrerId, userId))
    .limit(1);

  return {
    referralCode: me?.referralCode ?? "",
    filleuls,
    totalEarned: filleuls.length ? Number(agg?.totalEarned ?? 0) : 0,
  };
}
