/**
 * Jeu de données de démonstration JAL SMM.
 *   npm run db:seed
 *
 * Rien de tout ceci n'est « réel » : les fournisseurs, prix et services
 * seront remplacés par les données du client. On peuple juste de quoi
 * faire vivre le site et le back-office.
 */
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  categories,
  orders,
  pages,
  payments,
  posts,
  providers,
  referrals,
  services,
  sessions,
  settings,
  ticketMessages,
  tickets,
  transactions,
  users,
} from "./schema";
import { makeReferralCode, slugify } from "../lib/utils";

async function reset() {
  // Ordre inverse des dépendances.
  await db.delete(ticketMessages);
  await db.delete(tickets);
  await db.delete(transactions);
  await db.delete(orders);
  await db.delete(payments);
  await db.delete(referrals);
  await db.delete(sessions);
  await db.delete(services);
  await db.delete(providers);
  await db.delete(categories);
  await db.delete(posts);
  await db.delete(pages);
  await db.delete(settings);
  await db.delete(users);
}

async function seedSettings() {
  const rows = [
    { key: "currency", value: "XOF", group: "general" },
    { key: "min_deposit", value: "500", group: "payments" },
    { key: "default_markup_percent", value: "30", group: "pricing" },
    { key: "referral_commission_percent", value: "5", group: "referral" },
    { key: "support_whatsapp", value: "+2250000000000", group: "contact" },
    { key: "support_email", value: "support@jalsmm.com", group: "contact" },
    { key: "maintenance_mode", value: "false", group: "general" },
  ];
  await db.insert(settings).values(rows);
}

async function seedUsers() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin1234";
  const [admin] = await db
    .insert(users)
    .values({
      email: process.env.SEED_ADMIN_EMAIL || "admin@jalsmm.com",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Administrateur JAL",
      role: "admin",
      whatsapp: "+2250000000000",
      referralCode: makeReferralCode(),
      balance: 0,
    })
    .returning();

  const [demo] = await db
    .insert(users)
    .values({
      email: "client@example.com",
      passwordHash: await bcrypt.hash("client1234", 10),
      name: "Awa Traoré",
      role: "user",
      phone: "+22507000000",
      whatsapp: "+22507000000",
      referralCode: makeReferralCode(),
      balance: 12500,
    })
    .returning();

  return { admin, demo };
}

/** Catégories + services de démonstration, prix en francs CFA / 1000. */
const CATALOG: {
  category: string;
  platform: string;
  description: string;
  services: {
    name: string;
    rate: number;
    min: number;
    max: number;
    refill?: boolean;
    time?: string;
    desc?: string;
  }[];
}[] = [
  {
    category: "TikTok — Abonnés",
    platform: "tiktok",
    description: "Gagne des abonnés sur ton compte TikTok.",
    services: [
      { name: "Abonnés TikTok — Démarrage rapide", rate: 1500, min: 50, max: 50000, time: "0-2 h" },
      { name: "Abonnés TikTok — Profils africains 🌍", rate: 2200, min: 100, max: 20000, refill: true, time: "2-12 h", desc: "Comptes ciblés Afrique de l'Ouest et centrale." },
      { name: "Abonnés TikTok — Garantie 30 jours", rate: 3000, min: 100, max: 100000, refill: true, time: "0-6 h" },
    ],
  },
  {
    category: "TikTok — Vues & Likes",
    platform: "tiktok",
    description: "Booste la visibilité de tes vidéos.",
    services: [
      { name: "Vues TikTok", rate: 120, min: 100, max: 10000000, time: "0-1 h" },
      { name: "Likes TikTok", rate: 800, min: 20, max: 200000, time: "0-3 h" },
      { name: "Partages TikTok", rate: 500, min: 50, max: 100000, time: "0-6 h" },
    ],
  },
  {
    category: "Instagram — Abonnés",
    platform: "instagram",
    description: "Développe ta communauté Instagram.",
    services: [
      { name: "Abonnés Instagram — Standard", rate: 2000, min: 50, max: 60000, time: "0-6 h" },
      { name: "Abonnés Instagram — Qualité premium", rate: 3500, min: 100, max: 30000, refill: true, time: "1-12 h" },
    ],
  },
  {
    category: "Instagram — Engagement",
    platform: "instagram",
    description: "Likes, vues et commentaires pour tes publications.",
    services: [
      { name: "Likes Instagram", rate: 700, min: 20, max: 150000, time: "0-2 h" },
      { name: "Vues Reels Instagram", rate: 150, min: 100, max: 5000000, time: "0-1 h" },
      { name: "Commentaires Instagram (personnalisés)", rate: 6000, min: 10, max: 2000, time: "1-24 h", desc: "Tu fournis la liste des commentaires." },
    ],
  },
  {
    category: "Facebook",
    platform: "facebook",
    description: "Pages, publications et vidéos Facebook.",
    services: [
      { name: "J'aime de Page Facebook", rate: 2500, min: 100, max: 100000, time: "1-24 h" },
      { name: "Abonnés de profil Facebook", rate: 2300, min: 100, max: 50000, time: "1-24 h" },
      { name: "Vues de vidéo Facebook", rate: 200, min: 100, max: 1000000, time: "0-6 h" },
    ],
  },
  {
    category: "WhatsApp & Telegram",
    platform: "whatsapp",
    description: "Chaînes WhatsApp et canaux Telegram.",
    services: [
      { name: "Abonnés de chaîne WhatsApp", rate: 4000, min: 100, max: 50000, time: "1-24 h" },
      { name: "Réactions sur publication de chaîne WhatsApp", rate: 1200, min: 50, max: 20000, time: "0-6 h" },
      { name: "Membres de canal Telegram", rate: 1800, min: 100, max: 100000, time: "0-12 h" },
    ],
  },
  {
    category: "YouTube",
    platform: "youtube",
    description: "Vues, abonnés et heures de visionnage.",
    services: [
      { name: "Vues YouTube", rate: 900, min: 500, max: 1000000, time: "1-48 h" },
      { name: "Abonnés YouTube", rate: 9000, min: 50, max: 20000, refill: true, time: "1-72 h" },
      { name: "Likes YouTube", rate: 1500, min: 20, max: 50000, time: "0-12 h" },
    ],
  },
];

async function seedProvider() {
  // apiUrl vide → le panel bascule automatiquement sur le fournisseur de
  // démonstration (src/lib/provider/mock.ts). Renseigner apiUrl/apiKey ici
  // (ou via le futur back-office) pour brancher un vrai fournisseur.
  const [provider] = await db
    .insert(providers)
    .values({
      name: "Fournisseur de démonstration",
      apiUrl: "",
      apiKey: "",
      balance: 0,
      currency: "USD",
      notes: "Bac à sable — aucune requête réseau, cycle de vie simulé.",
    })
    .returning();
  return provider;
}

async function seedCatalog(providerId: string) {
  let categorySort = 0;
  let serviceCounter = 1000;
  for (const block of CATALOG) {
    const [cat] = await db
      .insert(categories)
      .values({
        name: block.category,
        slug: slugify(block.category),
        description: block.description,
        platform: block.platform,
        sortOrder: categorySort++,
      })
      .returning();

    let serviceSort = 0;
    for (const s of block.services) {
      await db.insert(services).values({
        categoryId: cat.id,
        providerId,
        providerServiceId: String(serviceCounter++),
        name: s.name,
        description: s.desc,
        platform: block.platform,
        rate: s.rate,
        providerRate: Math.round(s.rate / 1.3),
        markupPercent: 30,
        minQuantity: s.min,
        maxQuantity: s.max,
        refill: s.refill ?? false,
        cancelable: true,
        averageTime: s.time,
        sortOrder: serviceSort++,
      });
    }
  }
}

async function seedContent(authorId: string) {
  await db.insert(posts).values([
    {
      slug: "gagner-de-l-argent-avec-tiktok-en-afrique",
      title: "Gagner de l'argent avec TikTok en Afrique : par où commencer",
      excerpt:
        "Programme de créativité, partenariats de marque, ventes directes : les vraies pistes de revenus pour un créateur francophone, et le rôle réel des vues.",
      body: "## Le contenu d'abord\n\nLes chiffres (vues, abonnés) ouvrent des portes, mais ce sont ton **régularité** et ta **niche** qui font vivre une chaîne...\n\n### 1. Les partenariats locaux\n\n### 2. La vente de tes propres produits ou services\n\n### 3. Les programmes de monétisation\n",
      category: "guide",
      status: "published",
      publishedAt: new Date(),
      authorId,
    },
    {
      slug: "vraies-vues-vs-fausses-vues",
      title: "Vraies vues contre fausses vues : ce que ça change vraiment",
      excerpt:
        "Un coup de pouce au démarrage peut aider l'algorithme à tester ta vidéo. Mais sans rétention réelle, l'effet retombe. Explications.",
      body: "## L'algorithme regarde la rétention\n\nUne vue qui dure 2 secondes ne vaut pas une vue qui va au bout...\n",
      category: "tutoriel",
      status: "published",
      publishedAt: new Date(),
      authorId,
    },
    {
      slug: "recharger-son-compte-par-mobile-money",
      title: "Recharger son compte JAL SMM par Mobile Money, étape par étape",
      excerpt:
        "Orange Money, MTN MoMo, Moov, Wave : le guide illustré pour créditer ton solde en moins de 2 minutes.",
      body: "## Étape 1 — Choisis « Recharger mon compte »\n\n## Étape 2 — Saisis le montant en FCFA\n\n## Étape 3 — Valide avec ton code Mobile Money\n",
      category: "tutoriel",
      status: "published",
      publishedAt: new Date(),
      authorId,
    },
  ]);

  await db.insert(pages).values([
    {
      slug: "conditions",
      title: "Conditions d'utilisation",
      body: "_Modèle à faire valider par un juriste._\n\nEn utilisant JAL SMM, vous acceptez...\n",
    },
    {
      slug: "confidentialite",
      title: "Politique de confidentialité",
      body: "_Modèle à faire valider par un juriste._\n\nNous collectons votre e-mail, votre numéro et l'historique de vos commandes...\n",
    },
    {
      slug: "remboursement",
      title: "Politique de remboursement",
      body: "_Modèle à faire valider par un juriste._\n\nUne commande non démarrée est remboursée sur votre solde...\n",
    },
    {
      slug: "a-propos",
      title: "À propos de JAL SMM",
      body: "JAL SMM est né d'un constat : les panneaux SMM existants ignorent l'Afrique francophone...\n",
    },
  ]);
}

async function main() {
  console.log("→ Réinitialisation…");
  await reset();
  console.log("→ Paramètres…");
  await seedSettings();
  console.log("→ Utilisateurs…");
  const { admin, demo } = await seedUsers();
  console.log("→ Fournisseur de démonstration…");
  const provider = await seedProvider();
  console.log("→ Catalogue…");
  await seedCatalog(provider.id);
  console.log("→ Contenu (blog + pages)…");
  await seedContent(admin.id);

  console.log("\n✅ Terminé.");
  console.log(`   Admin  : ${admin.email} / ${process.env.SEED_ADMIN_PASSWORD || "admin1234"}`);
  console.log(`   Client : ${demo.email} / client1234`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
