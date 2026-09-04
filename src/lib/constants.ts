/** Valeurs de référence partagées (statuts, plateformes, rôles). */

export const ORDER_STATUSES = [
  "pending",
  "in_progress",
  "processing",
  "completed",
  "partial",
  "canceled",
  "error",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  in_progress: "En cours",
  processing: "Traitement",
  completed: "Terminée",
  partial: "Partielle",
  canceled: "Annulée",
  error: "Erreur",
};

/** Couleur de badge (classes Tailwind) par statut. */
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending: "bg-ink-100 text-ink-700",
  in_progress: "bg-brand-100 text-brand-800",
  processing: "bg-brand-100 text-brand-800",
  completed: "bg-brand-600 text-white",
  partial: "bg-gold-400/20 text-gold-600",
  canceled: "bg-red-100 text-red-700",
  error: "bg-red-100 text-red-700",
};

export const PAYMENT_STATUSES = [
  "pending",
  "completed",
  "failed",
  "canceled",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  completed: "Confirmé",
  failed: "Échoué",
  canceled: "Annulé",
  refunded: "Remboursé",
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-ink-100 text-ink-700",
  completed: "bg-brand-600 text-white",
  failed: "bg-red-100 text-red-700",
  canceled: "bg-red-100 text-red-700",
  refunded: "bg-gold-400/20 text-gold-600",
};

export const TRANSACTION_TYPES = [
  "deposit",
  "order",
  "refund",
  "referral_bonus",
  "admin_adjustment",
  "chargeback",
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  deposit: "Rechargement",
  order: "Commande",
  refund: "Remboursement",
  referral_bonus: "Commission de parrainage",
  admin_adjustment: "Ajustement (admin)",
  chargeback: "Rétrofacturation",
};

export const USER_ROLES = ["user", "admin", "support"] as const;
export type UserRole = (typeof USER_ROLES)[number];

/**
 * Plateformes prises en charge, avec le vocabulaire local.
 * `icon` pointe vers un SVG de /public (icône réelle) ; sans fichier
 * disponible, `emoji` sert de repli (Telegram, X pour l'instant).
 */
export const PLATFORMS = [
  { key: "tiktok", label: "TikTok", emoji: "🎵", icon: "/logo-tiktok.svg" },
  { key: "instagram", label: "Instagram", emoji: "📸", icon: "/logo-instagram.svg" },
  { key: "facebook", label: "Facebook", emoji: "👍", icon: "/logo-facebook.svg" },
  { key: "whatsapp", label: "WhatsApp", emoji: "💬", icon: "/logo-whatsapp.svg" },
  { key: "youtube", label: "YouTube", emoji: "▶️", icon: "/logo-youtube.svg" },
  { key: "telegram", label: "Telegram", emoji: "✈️", icon: "/telegram.svg" },
  { key: "twitter", label: "X (Twitter)", emoji: "𝕏", icon: null },
] as const;
export type PlatformKey = (typeof PLATFORMS)[number]["key"];

/** Opérateurs Mobile Money courants en Afrique francophone. */
export const MOBILE_MONEY_OPERATORS = [
  { key: "orange", label: "Orange Money" },
  { key: "mtn", label: "MTN MoMo" },
  { key: "moov", label: "Moov Money" },
  { key: "wave", label: "Wave" },
  { key: "airtel", label: "Airtel Money" },
] as const;
