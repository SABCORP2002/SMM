import { defineConfig } from "drizzle-kit";

const DEV_DEFAULT = "postgresql://jal:jal@localhost:5433/jal_smm";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL || DEV_DEFAULT,
  },
  verbose: true,
  strict: true,
});
