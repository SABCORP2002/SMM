import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL manquant. En local : docker compose up -d (voir docker-compose.yml). " +
      "En production : URL Postgres (Neon, Vercel Postgres, Supabase…) dans les variables d'environnement.",
  );
}

/**
 * Pool réutilisé entre les rechargements à chaud de Next en dev
 * (évite d'épuiser les connexions Postgres à chaque HMR).
 */
const globalForDb = globalThis as unknown as { __jalPgPool?: Pool };

const pool =
  globalForDb.__jalPgPool ??
  new Pool({
    connectionString,
    // Neon/Vercel Postgres exigent TLS ; sans certificat local à valider.
    ssl: connectionString.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });
if (process.env.NODE_ENV !== "production") globalForDb.__jalPgPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
