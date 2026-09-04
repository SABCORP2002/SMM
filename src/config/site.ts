/**
 * Configuration statique du site. Les valeurs sensibles ou variables
 * (contacts, marges, devise réelle) viennent des variables d'environnement
 * ou de la table `Setting` en base — ceci n'est que le socle par défaut.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "JAL SMM",
  shortName: "JAL",
  tagline: "Le panneau SMM de l'Afrique francophone",
  description:
    "Le panneau SMM pensé pour l'Afrique francophone : abonnés, vues, likes et engagement sur TikTok, Instagram, Facebook, YouTube et WhatsApp. Paiement par Mobile Money, prix en francs CFA.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "fr",
  currency: "XOF",
  contact: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+2250000000000",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@jalsmm.com",
  },
  /** Rechargement minimum accepté (en francs CFA). */
  minDeposit: 500,
  nav: [
    { label: "Accueil", href: "/" },
    { label: "Nos services", href: "/services" },
    { label: "Comment ça marche", href: "/comment-ca-marche" },
    { label: "Tarifs", href: "/tarifs" },
    { label: "Tutoriels", href: "/tutoriels" },
    { label: "Aide", href: "/aide" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
