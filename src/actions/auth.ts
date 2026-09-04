"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema, signupSchema } from "@/lib/validation";
import { toFieldErrors } from "@/lib/form";
import { makeReferralCode } from "@/lib/utils";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
    password: formData.get("password"),
    referralCode: formData.get("referralCode") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const { name, email, whatsapp, password, referralCode } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { fieldErrors: { email: "Un compte existe déjà avec cet e-mail" } };
  }

  let referredById: string | undefined;
  if (referralCode) {
    const [sponsor] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, referralCode))
      .limit(1);
    if (sponsor) referredById = sponsor.id;
  }

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      whatsapp,
      phone: whatsapp,
      passwordHash: await hashPassword(password),
      referralCode: makeReferralCode(),
      referredById,
    })
    .returning();

  if (referredById) {
    await db
      .insert(referrals)
      .values({ referrerId: referredById, refereeId: user.id })
      .onConflictDoNothing();
  }

  await createSession(user.id);
  redirect("/mon-espace");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const { email, password } = parsed.data;
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const ok = user && (await verifyPassword(password, user.passwordHash));
  if (!ok) {
    return { error: "E-mail ou mot de passe incorrect." };
  }
  if (user.status === "suspended") {
    return { error: "Ce compte est suspendu. Contacte le support." };
  }

  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/mon-espace");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
