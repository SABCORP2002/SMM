import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";

const COOKIE = "jal_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 jours

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/** Crée une session en base et pose le cookie. */
export async function createSession(userId: string, meta?: { ip?: string; userAgent?: string }) {
  const expiresAt = new Date(Date.now() + MAX_AGE_SECONDS * 1000);
  const [session] = await db
    .insert(sessions)
    .values({ userId, expiresAt, ip: meta?.ip, userAgent: meta?.userAgent })
    .returning();

  const store = await cookies();
  store.set(COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, userId));

  return session;
}

/** Détruit la session courante (base + cookie). */
export async function destroySession() {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (id) {
    await db.delete(sessions).where(eq(sessions.id, id));
    store.delete(COOKIE);
  }
}

/** Utilisateur courant, ou null. Mémoïsé par requête. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const store = await cookies();
  const id = store.get(COOKIE)?.value;
  if (!id) return null;

  const [row] = await db
    .select({ user: users, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, id))
    .limit(1);

  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }
  if (row.user.status === "suspended") return null;

  return row.user;
});

/** À utiliser dans les layouts/pages protégés. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/mon-espace");
  return user;
}
