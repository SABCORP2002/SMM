import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind sans conflit. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate un montant en francs CFA (XOF) façon locale FR : « 1 500 F ».
 * Le franc CFA n'a pas de sous-unité : on arrondit à l'entier.
 */
export function formatMoney(amount: number | string, currency = "XOF"): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  const safe = Number.isFinite(value) ? value : 0;

  if (currency === "XOF" || currency === "XAF") {
    return `${new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: 0,
    }).format(Math.round(safe))} F`;
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(safe);
}

/** Prix d'une commande : (tarif pour 1000) × quantité / 1000. */
export function computeCharge(ratePer1000: number, quantity: number): number {
  return Math.round((ratePer1000 * quantity) / 1000);
}

/** « il y a 3 heures », « il y a 2 jours »… */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [number, string, string][] = [
    [31536000, "an", "ans"],
    [2592000, "mois", "mois"],
    [86400, "jour", "jours"],
    [3600, "heure", "heures"],
    [60, "minute", "minutes"],
  ];
  for (const [secs, one, many] of units) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `il y a ${n} ${n > 1 ? many : one}`;
  }
  return "à l'instant";
}

/** Génère un code de parrainage court et lisible. */
export function makeReferralCode(length = 7): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** Référence de paiement interne : JAL-20260904-XXXXXX */
export function makePaymentReference(): string {
  const now = new Date();
  const ymd =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JAL-${ymd}-${rand}`;
}

/** Transforme un titre en slug URL sans accents. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
