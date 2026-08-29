#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import pg from "pg";
import { parseArgs } from "./lib/args.mjs";

const { Pool } = pg;
const applicationTables = [
  "self_host_app_category_links",
  "self_host_app_field_sources",
  "self_host_app_curated_overrides",
  "self_host_app_sources",
  "self_host_app_candidates",
  "self_host_app_import_runs",
  "self_host_app_categories",
  "self_host_apps",
  "stack127_pages",
];

function envValue(filePath, key) {
  if (!existsSync(filePath)) return null;
  const line = readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .find((item) => item.trim().startsWith(`${key}=`));
  if (!line) return null;
  return line.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, "");
}

function run(command, args) {
  execFileSync(command, args, { cwd: process.cwd(), stdio: "inherit" });
}

function assertLocalDatabase(value) {
  const url = new URL(value);
  if (!["127.0.0.1", "localhost", "host.docker.internal"].includes(url.hostname)) {
    throw new Error(`Refusing to reset non-local database host: ${url.hostname}`);
  }
}

async function tableCounts(connectionString) {
  const pool = new Pool({ connectionString, max: 1 });
  try {
    const counts = {};
    for (const table of applicationTables) {
      const result = await pool.query(`select count(*)::integer as count from public.${table}`);
      counts[table] = result.rows[0].count;
    }
    return counts;
  } finally {
    await pool.end();
  }
}

async function main() {
  const args = parseArgs();
  if (!args["confirm-local-reset"]) {
    throw new Error("Pass --confirm-local-reset to replace the disposable local database with production data.");
  }
  const productionUrl = args["prod-database-url"] ?? envValue(".env.database", "DATABASE_URL");
  const localUrl = args["local-database-url"] ?? envValue(".env.local", "DATABASE_URL");
  if (!productionUrl || !localUrl) throw new Error("Both production and local DATABASE_URL values are required.");
  if (productionUrl === localUrl) throw new Error("Production and local DATABASE_URL values are identical.");
  assertLocalDatabase(localUrl);

  const tempDirectory = mkdtempSync(path.join(os.tmpdir(), "stack127-prod-sync-"));
  const archive = path.join(tempDirectory, "public-data.dump");

  run("supabase", ["db", "reset", "--local", "--yes"]);
  run("pg_dump", [
    "--format=custom",
    "--data-only",
    "--schema=public",
    "--no-owner",
    "--no-privileges",
    `--file=${archive}`,
    productionUrl,
  ]);
  run("psql", [
    localUrl,
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    `truncate table ${applicationTables.map((table) => `public.${table}`).join(", ")} cascade`,
  ]);
  run("pg_restore", [
    "--dbname",
    localUrl,
    "--data-only",
    "--disable-triggers",
    "--no-owner",
    "--no-privileges",
    "--exit-on-error",
    archive,
  ]);

  const [productionCounts, localCounts] = await Promise.all([
    tableCounts(productionUrl),
    tableCounts(localUrl),
  ]);
  const mismatches = applicationTables.filter((table) => productionCounts[table] !== localCounts[table]);
  console.log(JSON.stringify({ production: productionCounts, local: localCounts, mismatches }, null, 2));
  if (mismatches.length > 0) throw new Error(`Count mismatch after sync: ${mismatches.join(", ")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
