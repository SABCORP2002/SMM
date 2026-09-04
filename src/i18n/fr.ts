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
    finalCtaPoints: ["Aucun frais caché", "Livraison automatique", "Support qui répond"],

    pricingTeaserTitle: "Des prix affichés, pas devinés",
    pricingTeaserSubtitle:
      "Un échantillon de nos tarifs les plus bas. Le catalogue complet est cent pour cent transparent.",

    comparisonTitle: "Pourquoi un panel pensé pour l'Afrique change tout",
    comparisonSubtitle: "Les mêmes services, une expérience complètement différente.",
    comparisonOtherLabel: "Panel classique",
    comparisonUsLabel: "JAL SMM",
    comparisonOther: [
      "Interface en anglais, prix en dollars à convertir",
      "Paiement par carte bancaire uniquement, souvent refusée",
      "Support dans un autre fuseau horaire, réponse en jours",
      "Revendeur qui revend un revendeur : prix gonflés",
      "Aucun conseil, tu es livré à toi-même",
    ],
    comparisonUs: [
      "100 % en français, prix affichés en francs CFA",
      "Orange Money, MTN MoMo, Moov Money, Wave",
      "Support humain sur WhatsApp, même fuseau horaire",
      "Connecté directement à la source, marge transparente",
      "Des tutoriels pour développer une vraie audience",
    ],

    earnTitle: "Fais aussi de JAL SMM une source de revenus",
    earnSubtitle: "Deux façons d'en tirer profit, en plus de tes propres commandes.",
    earn: [
      {
        badge: "Disponible maintenant",
        title: "Programme de parrainage",
        body: "Partage ton lien, touche une commission sur chaque recharge de tes filleuls. Suivi en temps réel depuis ton espace client.",
        cta: "Créer mon compte",
        href: "/inscription",
      },
      {
        badge: "Bientôt disponible",
        title: "Panel en marque blanche",
        body: "Ton propre panel SMM, à ton nom et sur ton domaine, sans rien développer. Tu fixes tes prix, on s'occupe du reste.",
        cta: "Être prévenu en priorité",
        href: "whatsapp",
      },
    ],

    personasTitle: "Quel que soit ton objectif, JAL SMM s'adapte",
    personas: [
      {
        title: "Créateurs & influenceurs",
        body: "Donne un coup d'accélérateur à tes nouvelles publications pendant que ton contenu fait le reste.",
      },
      {
        title: "Community managers & agences",
        body: "Gère plusieurs comptes clients et commande en quelques clics, avec un historique clair pour chaque facture.",
      },
      {
        title: "Commerces & entrepreneurs",
        body: "Une page qui a l'air déjà active inspire confiance à tes futurs clients dès le premier coup d'œil.",
      },
      {
        title: "Revendeurs",
        body: "Achète en gros grâce à nos tarifs, revends à ton réseau à ton propre prix, garde ta marge.",
      },
    ],

    faqTeaserTitle: "Les questions qu'on nous pose le plus",
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

  howPage: {
    title: "Comment ça marche",
    description:
      "De la création du compte à la livraison de ta commande : le déroulé complet, sans jargon.",
    steps: [
      {
        title: "1. Crée ton compte",
        body: "Il te faut une adresse e-mail et, idéalement, ton numéro WhatsApp pour le support. L'inscription est gratuite et immédiate. Aucun document, aucune carte bancaire demandée.",
      },
      {
        title: "2. Recharge ton portefeuille",
        body: "Depuis « Recharger mon compte », choisis un montant (dès 500 F) et ton moyen de paiement : Orange Money, MTN MoMo, Moov Money ou Wave. Tu valides avec ton code habituel ; le solde est crédité automatiquement, en général en moins d'une minute.",
      },
      {
        title: "3. Choisis un service",
        body: "Parcours le catalogue par plateforme (TikTok, Instagram, Facebook…). Chaque service indique son prix pour 1 000 unités, la quantité minimale et maximale, et le délai moyen constaté.",
      },
      {
        title: "4. Passe la commande",
        body: "Colle le lien exact (profil ou publication selon le service), saisis la quantité voulue : le prix se calcule tout seul. Tu confirmes, le montant est débité de ton solde.",
      },
      {
        title: "5. Suis la livraison",
        body: "La commande passe de « En attente » à « En cours » puis « Terminée ». Tu vois le compteur de départ et le reste à livrer. Si une commande ne démarre pas, elle est remboursée sur ton solde.",
      },
    ],
    noteTitle: "Bon à savoir",
    notes: [
      "Vérifie que ton compte est public avant de commander des abonnés ou des likes.",
      "Ne lance pas deux commandes identiques sur le même lien en même temps.",
      "Les délais annoncés sont des moyennes : un pic de demande peut les allonger.",
    ],
  },

  faq: {
    title: "Centre d'aide",
    description:
      "Les réponses aux questions les plus fréquentes. Si tu ne trouves pas, écris-nous sur WhatsApp.",
    items: [
      {
        q: "C'est quoi exactement un panneau SMM ?",
        a: "Un service qui te permet d'acheter de l'engagement pour les réseaux sociaux (abonnés, vues, likes, vues de vidéo…) à des tarifs de gros, via un tableau de bord unique.",
      },
      {
        q: "Est-ce que mon compte risque d'être banni ?",
        a: "Une partie des services repose sur des comptes automatisés, ce qui va à l'encontre des conditions d'utilisation des plateformes. Le risque existe surtout si tu en abuses. Utilise ces services comme un appui ponctuel, pas comme seule méthode de croissance.",
      },
      {
        q: "Comment je recharge mon compte ?",
        a: "Par Mobile Money : Orange Money, MTN MoMo, Moov Money, Wave. Le rechargement minimum est de 500 F. Le crédit est automatique après confirmation du paiement.",
      },
      {
        q: "En combien de temps ma commande est livrée ?",
        a: "Ça dépend du service : de quelques minutes à quelques jours. Le délai moyen est indiqué sur chaque service dans le catalogue.",
      },
      {
        q: "Je peux être remboursé ?",
        a: "Oui : une commande non démarrée ou annulée est recréditée sur ton solde. Le solde peut servir à d'autres commandes.",
      },
      {
        q: "Vous proposez un programme revendeur ?",
        a: "Oui. Tu peux parrainer et toucher une commission sur les recharges de tes filleuls, et une API est prévue pour connecter ton propre panneau.",
      },
    ],
  },

  apiPage: {
    title: "API revendeur",
    description:
      "Connecte ton propre panneau ou ton application à JAL SMM. API HTTP standard, compatible avec l'écosystème SMM habituel.",
    soon: "La documentation complète et les clés API arrivent avec la phase revendeur. Écris-nous sur WhatsApp pour être prévenu en priorité.",
    endpoints: [
      { method: "POST", path: "/api/v1/order", desc: "Créer une commande" },
      { method: "GET", path: "/api/v1/order/:id", desc: "Statut d'une commande" },
      { method: "GET", path: "/api/v1/services", desc: "Liste des services et tarifs" },
      { method: "GET", path: "/api/v1/balance", desc: "Solde du compte" },
    ],
  },

  tutorials: {
    title: "Tutoriels",
    description:
      "Des guides simples, en français, pour utiliser ces services intelligemment et vraiment faire grandir ton audience.",
    empty: "Les premiers tutoriels arrivent très bientôt.",
    readMore: "Lire le tutoriel",
    backToList: "← Tous les tutoriels",
    categories: {
      tutoriel: "Tutoriel",
      guide: "Guide",
      actualite: "Actualité",
    } as Record<string, string>,
  },

  auth: {
    signInTitle: "Se connecter",
    signUpTitle: "Créer un compte",
    soonTitle: "Bientôt disponible",
    soonBody:
      "L'espace client (connexion, inscription, commandes, portefeuille) est en cours de développement. En attendant, écris-nous sur WhatsApp : on ouvre ton compte manuellement.",
  },
} as const;

export type Dictionary = typeof fr;

/** Point d'entrée unique (prêt pour le multilingue). */
export function getDictionary(locale: string = "fr"): Dictionary {
  // v1 : une seule langue. `en.ts` viendra s'ajouter ici.
  const available: Record<string, Dictionary> = { fr };
  return available[locale] ?? fr;
}
