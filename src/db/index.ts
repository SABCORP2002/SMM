import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { schema } from "./schema";

const url = process.env.DATABASE_URL || "file:./dev.db";

/**
 * Client unique réutilisé entre les rechargements à chaud de Next
 * (évite d'ouvrir une connexion par requête en développement).
 */
const globalForDb = globalThis as unknown as {
  __jalDbClient?: ReturnType<typeof createClient>;
};

const client = globalForDb.__jalDbClient ?? createClient({ url });
if (process.env.NODE_ENV !== "production") globalForDb.__jalDbClient = client;

export const db = drizzle(client, { schema });
export { schema };
