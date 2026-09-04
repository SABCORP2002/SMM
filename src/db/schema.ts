/**
 * Schéma de base de données JAL SMM (Drizzle ORM · SQLite en dev).
 *
 * Portabilité PostgreSQL : aucun type exotique. L'argent est stocké en `real`
 * (franc CFA → on arrondit à l'entier via `computeCharge` / `formatMoney`).
 * Les "enum" sont des `text` dont les valeurs autorisées sont documentées
 * dans `src/lib/constants.ts`.
 */
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

/* ─── Utilisateurs & sessions ─────────────────────────────────────── */

export const users = sqliteTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    role: text("role").notNull().default("user"), // user | admin | support
    status: text("status").notNull().default("active"), // active | suspended
    balance: real("balance").notNull().default(0),
    currency: text("currency").notNull().default("XOF"),
    locale: text("locale").notNull().default("fr"),
    customRatePercent: real("custom_rate_percent"),
    apiKey: text("api_key"),
    referralCode: text("referral_code").notNull(),
    referredById: text("referred_by_id"),
    emailVerifiedAt: integer("email_verified_at", { mode: "timestamp" }),
    lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("users_email_unique").on(t.email),
    uniqueIndex("users_referral_code_unique").on(t.referralCode),
    uniqueIndex("users_api_key_unique").on(t.apiKey),
    index("users_referred_by_idx").on(t.referredById),
    index("users_status_idx").on(t.status),
  ],
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    ip: text("ip"),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/* ─── Fournisseurs, catégories, services ──────────────────────────── */

export const providers = sqliteTable("providers", {
  id: id(),
  name: text("name").notNull(),
  apiUrl: text("api_url").notNull(),
  apiKey: text("api_key").notNull(),
  balance: real("balance").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("active"), // active | disabled
  notes: text("notes"),
  lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const categories = sqliteTable(
  "categories",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    platform: text("platform"), // tiktok | instagram | ...
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("categories_slug_unique").on(t.slug)],
);

export const services = sqliteTable(
  "services",
  {
    id: id(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    providerId: text("provider_id").references(() => providers.id),
    providerServiceId: text("provider_service_id"),
    name: text("name").notNull(),
    description: text("description"),
    type: text("type").notNull().default("default"),
    platform: text("platform"),
    /** Prix public / 1000, devise du panel. */
    rate: real("rate").notNull(),
    /** Coût fournisseur / 1000 (devise du panel). */
    providerRate: real("provider_rate"),
    markupPercent: real("markup_percent").notNull().default(30),
    minQuantity: integer("min_quantity").notNull().default(10),
    maxQuantity: integer("max_quantity").notNull().default(100000),
    dripfeed: integer("dripfeed", { mode: "boolean" }).notNull().default(false),
    refill: integer("refill", { mode: "boolean" }).notNull().default(false),
    cancelable: integer("cancelable", { mode: "boolean" })
      .notNull()
      .default(false),
    averageTime: text("average_time"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("services_category_idx").on(t.categoryId),
    index("services_provider_idx").on(t.providerId),
    index("services_active_idx").on(t.isActive),
  ],
);

/* ─── Commandes ───────────────────────────────────────────────────── */

export const orders = sqliteTable(
  "orders",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id),
    link: text("link").notNull(),
    quantity: integer("quantity").notNull(),
    charge: real("charge").notNull(),
    cost: real("cost"),
    startCount: integer("start_count"),
    remains: integer("remains"),
    status: text("status").notNull().default("pending"),
    providerId: text("provider_id"),
    providerOrderId: text("provider_order_id"),
    externalStatus: text("external_status"),
    note: text("note"),
    isDripfeed: integer("is_dripfeed", { mode: "boolean" })
      .notNull()
      .default(false),
    runs: integer("runs"),
    interval: integer("interval"),
    syncAttempts: integer("sync_attempts").notNull().default(0),
    lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("orders_user_idx").on(t.userId),
    index("orders_service_idx").on(t.serviceId),
    index("orders_status_idx").on(t.status),
  ],
);

/* ─── Portefeuille : paiements & grand livre ──────────────────────── */

export const payments = sqliteTable(
  "payments",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    amount: real("amount").notNull(),
    creditedAmount: real("credited_amount"),
    currency: text("currency").notNull().default("XOF"),
    method: text("method").notNull().default("mobile_money"),
    gateway: text("gateway").notNull().default("manual"),
    status: text("status").notNull().default("pending"),
    reference: text("reference").notNull(),
    externalReference: text("external_reference"),
    payerPhone: text("payer_phone"),
    operator: text("operator"),
    metadata: text("metadata"), // JSON brut de la passerelle
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("payments_reference_unique").on(t.reference),
    index("payments_user_idx").on(t.userId),
    index("payments_status_idx").on(t.status),
  ],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    amount: real("amount").notNull(),
    balanceAfter: real("balance_after").notNull(),
    description: text("description").notNull(),
    orderId: text("order_id").references(() => orders.id),
    paymentId: text("payment_id").references(() => payments.id),
    createdAt: createdAt(),
  },
  (t) => [
    index("transactions_user_idx").on(t.userId),
    index("transactions_type_idx").on(t.type),
  ],
);

/* ─── Parrainage ──────────────────────────────────────────────────── */

export const referrals = sqliteTable(
  "referrals",
  {
    id: id(),
    referrerId: text("referrer_id")
      .notNull()
      .references(() => users.id),
    refereeId: text("referee_id")
      .notNull()
      .references(() => users.id),
    commissionPercent: real("commission_percent").notNull().default(5),
    totalEarned: real("total_earned").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("referrals_referee_unique").on(t.refereeId),
    index("referrals_referrer_idx").on(t.referrerId),
  ],
);

/* ─── Support ─────────────────────────────────────────────────────── */

export const tickets = sqliteTable(
  "tickets",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    subject: text("subject").notNull(),
    category: text("category").notNull().default("other"),
    status: text("status").notNull().default("open"),
    priority: text("priority").notNull().default("normal"),
    orderId: text("order_id").references(() => orders.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("tickets_user_idx").on(t.userId),
    index("tickets_status_idx").on(t.status),
  ],
);

export const ticketMessages = sqliteTable(
  "ticket_messages",
  {
    id: id(),
    ticketId: text("ticket_id")
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    isStaff: integer("is_staff", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("ticket_messages_ticket_idx").on(t.ticketId)],
);

/* ─── Contenu (blog / pages / config) ─────────────────────────────── */

export const posts = sqliteTable(
  "posts",
  {
    id: id(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull(), // Markdown
    coverImage: text("cover_image"),
    category: text("category").notNull().default("tutoriel"),
    status: text("status").notNull().default("draft"),
    authorId: text("author_id").references(() => users.id),
    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("posts_slug_unique").on(t.slug),
    index("posts_status_idx").on(t.status),
    index("posts_category_idx").on(t.category),
  ],
);

export const pages = sqliteTable(
  "pages",
  {
    id: id(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(), // Markdown
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("pages_slug_unique").on(t.slug)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  group: text("group").notNull().default("general"),
  updatedAt: updatedAt(),
});

/* ─── Types déduits ───────────────────────────────────────────────── */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Service = typeof services.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Post = typeof posts.$inferSelect;

export const schema = {
  users,
  sessions,
  providers,
  categories,
  services,
  orders,
  payments,
  transactions,
  referrals,
  tickets,
  ticketMessages,
  posts,
  pages,
  settings,
};

/** Rend `sql` importable ailleurs sans réimporter drizzle-orm. */
export { sql };
