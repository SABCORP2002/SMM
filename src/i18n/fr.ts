/**
 * Dictionnaire français — langue unique de la v1.
 * TOUT texte affiché passe par ici : ajouter `en.ts` + le routage `/[lang]`
 * plus tard ne demandera aucune retouche des composants.
 */
export const fr = {
  common: {
    brand: "JAL SMM",
    tagline: "Le panneau SMM de l'Afrique francophone",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    dashboard: "Mon espace",
    getStarted: "Commencer maintenant",
    orderNow: "Commander",
    learnMore: "En savoir plus",
    addFunds: "Recharger mon compte",
    contactWhatsapp: "Écrire sur WhatsApp",
    perThousand: "pour 1 000",
    from: "à partir de",
    loading: "Chargement…",
    all: "Tous",
  },

  nav: {
    services: "Nos services",
    howItWorks: "Comment ça marche",
    pricing: "Tarifs",
    tutorials: "Tutoriels",
    help: "Aide",
  },

  home: {
    heroBadge: "Pensé ici, pour nos réalités",
    heroTitle: "Fais grandir ta présence sur les réseaux, sans te ruiner",
    heroSubtitle:
      "Abonnés, vues, likes et engagement pour TikTok, Instagram, Facebook, WhatsApp et YouTube. Paiement par Orange Money, MTN, Moov ou Wave. Prix en francs CFA, tout en français.",
    heroPrimaryCta: "Créer mon compte gratuit",
    heroSecondaryCta: "Voir les tarifs",
    heroPoints: [
      "Rechargement dès 500 F par Mobile Money",
      "Livraison automatique, 24h/24",
      "Support humain sur WhatsApp",
    ],

    statsTitle: "Des chiffres clairs",
    stats: [
      { value: "24h/24", label: "Traitement automatique des commandes" },
      { value: "500 F", label: "Montant de recharge minimum" },
      { value: "5 min", label: "Pour créer un compte et commander" },
      { value: "100 %", label: "En français, prix en FCFA" },
    ],

    howTitle: "Commander prend 3 étapes",
    howSteps: [
      {
        title: "Crée ton compte",
        body: "Inscription gratuite en 2 minutes avec ton e-mail et ton numéro WhatsApp.",
      },
      {
        title: "Recharge par Mobile Money",
        body: "Orange Money, MTN MoMo, Moov ou Wave. Ton solde est crédité automatiquement.",
      },
      {
        title: "Choisis un service et lance",
        body: "Colle le lien de ta publication ou de ton profil, indique la quantité, valide. C'est parti.",
      },
    ],

    servicesTitle: "Les réseaux que nous couvrons",
    servicesSubtitle:
      "Un catalogue clair, des prix affichés au grand jour. Choisis ta plateforme.",

    whyTitle: "Pourquoi JAL SMM",
    why: [
      {
        title: "Tout en français, prix en FCFA",
        body: "Pas de dictionnaire anglais, pas de conversion de dollars. Tu vois exactement ce que tu paies.",
      },
      {
        title: "Mobile Money d'abord",
        body: "Le paiement se fait avec ce que tu as déjà dans la poche : Orange, MTN, Moov, Wave.",
      },
      {
        title: "Léger sur ta connexion",
        body: "Le site est optimisé pour la 3G/4G et les forfaits data. Il s'ouvre vite, même en zone faible.",
      },
      {
        title: "On t'explique",
        body: "Nos tutoriels montrent comment utiliser ces services intelligemment pour vraiment développer ton audience.",
      },
      {
        title: "Support qui répond",
        body: "Une vraie personne sur WhatsApp, pas un robot. On parle la même langue.",
      },
      {
        title: "Revends autour de toi",
        body: "Crée des sous-comptes, parraine tes amis et gagne une commission sur leurs recharges.",
      },
    ],

    honestyTitle: "On joue franc jeu",
    honestyBody:
      "Une partie de ces services s'appuie sur des comptes automatisés et ne respecte pas toujours les conditions d'utilisation des réseaux sociaux. Utilise-les comme un coup de pouce, jamais comme unique stratégie : le vrai moteur reste ton contenu. Nos tutoriels sont là pour ça.",

    finalCtaTitle: "Prêt à passer la vitesse supérieure ?",
    finalCtaBody:
      "Rejoins les créateurs, community managers et petites entreprises qui utilisent JAL SMM pour donner de l'élan à leurs réseaux.",
  },

  footer: {
    about:
      "JAL SMM est un panneau de services marketing pour réseaux sociaux conçu pour l'Afrique francophone : vocabulaire local, paiement Mobile Money, accompagnement pédagogique.",
    columnsServices: "Services",
    columnsCompany: "L'entreprise",
    columnsLegal: "Informations légales",
    legalTerms: "Conditions d'utilisation",
    legalPrivacy: "Politique de confidentialité",
    legalRefund: "Politique de remboursement",
    rights: "Tous droits réservés.",
    disclaimer:
      "JAL SMM n'est affilié à aucun réseau social. Les marques citées appartiennent à leurs propriétaires respectifs.",
  },
} as const;

export type Dictionary = typeof fr;

/** Point d'entrée unique (prêt pour le multilingue). */
export function getDictionary(locale: string = "fr"): Dictionary {
  // v1 : une seule langue. `en.ts` viendra s'ajouter ici.
  const available: Record<string, Dictionary> = { fr };
  return available[locale] ?? fr;
}
