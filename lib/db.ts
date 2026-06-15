import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54332/postgres";

const globalForPg = globalThis as typeof globalThis & {
  homeLabHqPgPool?: Pool;
};

export const pool =
  globalForPg.homeLabHqPgPool ??
  new Pool({
    connectionString,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: 4,
    query_timeout: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.homeLabHqPgPool = pool;
}
