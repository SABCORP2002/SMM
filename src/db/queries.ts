import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "./index";
import { categories, pages, posts, services } from "./schema";

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
