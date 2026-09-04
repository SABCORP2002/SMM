import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{8,20}$/, "Numéro de téléphone invalide");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Indique ton nom").max(80),
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide"),
  whatsapp: phone,
  password: z
    .string()
    .min(8, "Le mot de passe doit faire au moins 8 caractères")
    .max(128),
  referralCode: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Indique ton nom").max(80),
  phone: phone.optional().or(z.literal("")),
  whatsapp: phone.optional().or(z.literal("")),
});

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Mot de passe actuel requis"),
    next: z.string().min(8, "Au moins 8 caractères").max(128),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
