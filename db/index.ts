import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

function createDb() {
  if (databaseUrl) {
    // Remote Neon Database
    const { neon } = require("@neondatabase/serverless");
    const { drizzle } = require("drizzle-orm/neon-http");
    const sql = neon(databaseUrl);
    return drizzle(sql, { schema });
  } else {
    // Local embedded PostgreSQL (PGlite)
    const { PGlite } = require("@electric-sql/pglite");
    const { drizzle } = require("drizzle-orm/pglite");
    const path = require("path");
    const dbPath = path.join(process.cwd(), "db", "data");
    const client = new PGlite(dbPath);
    return drizzle(client, { schema });
  }
}

export const db = createDb();
