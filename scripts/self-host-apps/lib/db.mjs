import pg from "pg";
import { existsSync, readFileSync } from "node:fs";

const { Pool } = pg;

function unquote(value) {
  return value.replace(/^['"]|['"]$/g, "");
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = unquote(trimmed.slice(equalsIndex + 1).trim());
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function loadDatabaseEnv() {
  if (process.env.DATABASE_URL) return;

  if (process.env.NODE_ENV === "production") {
    loadEnvFile(".env.database");
  } else {
    loadEnvFile(".env.local");
  }
}

function databaseUrl(databaseUrl) {
  loadDatabaseEnv();
  const connectionString = databaseUrl ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required. Use .env.local locally, .env.database for production jobs, or pass --database-url.");
  }

  return connectionString;
}

export function createPool(databaseUrlOverride) {
  return new Pool({
    connectionString: databaseUrl(databaseUrlOverride),
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: 4,
    query_timeout: 60000,
  });
}

export async function withClient(callback, databaseUrl) {
  const pool = createPool(databaseUrl);
  const client = await pool.connect();

  try {
    return await callback(client);
  } finally {
    client.release();
    await pool.end();
  }
}
