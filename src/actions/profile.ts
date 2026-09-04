"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { passwordChangeSchema, profileSchema } from "@/lib/validation";
import { toFieldErrors } from "@/lib/form";

export type FormResult = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateProfileAction(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const user = await getCurrentUser();
  if (!user) return { message: "Session expirée. Reconnecte-toi." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const { name, phone, whatsapp } = parsed.data;
  await db
    .update(users)
    .set({
      name,
      phone: phone || null,
      whatsapp: whatsapp || null,
    })
    .where(eq(users.id, user.id));

  revalidatePath("/mon-espace/profil");
  revalidatePath("/mon-espace");
  return { ok: true, message: "Profil mis à jour." };
}

export async function changePasswordAction(
  _prev: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const user = await getCurrentUser();
  if (!user) return { message: "Session expirée. Reconnecte-toi." };

  const parsed = passwordChangeSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { fieldErrors: toFieldErrors(parsed.error) };
  }

  const okCurrent = await verifyPassword(parsed.data.current, user.passwordHash);
  if (!okCurrent) {
    return { fieldErrors: { current: "Mot de passe actuel incorrect" } };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.next) })
    .where(eq(users.id, user.id));

  return { ok: true, message: "Mot de passe modifié." };
}
