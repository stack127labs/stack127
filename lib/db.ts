import dns from "node:dns";
import { Pool } from "pg";
import { observePoolErrors } from "./database-errors";

dns.setDefaultResultOrder("ipv4first");

function databaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Use .env.local locally and production env values in deploy.");
  }

  return process.env.DATABASE_URL;
}

const globalForPg = globalThis as typeof globalThis & {
  homeLabHqPgPool?: Pool;
};

export function getPool() {
  if (!globalForPg.homeLabHqPgPool) {
    globalForPg.homeLabHqPgPool = new Pool({
      connectionString: databaseUrl(),
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 10000,
      max: 4,
      query_timeout: 15000,
    });
    observePoolErrors(globalForPg.homeLabHqPgPool);
  }

  return globalForPg.homeLabHqPgPool;
}
