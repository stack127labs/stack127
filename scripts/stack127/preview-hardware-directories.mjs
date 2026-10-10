#!/usr/bin/env node

import pg from "pg";
import { previewDirectoryPages } from "./directory-pages/lib.mjs";

const MANAGED_DEVELOPMENT_PROJECT_REF = "phhrfvmncpqqmmgruktx";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const MANAGED_DATABASE_HOST = `db.${MANAGED_DEVELOPMENT_PROJECT_REF}.supabase.co`;
const MANAGED_API_HOST = `${MANAGED_DEVELOPMENT_PROJECT_REF}.supabase.co`;
const pages = [
  { slug: "zigbee-coordinators", label: "Zigbee coordinators", title: "Zigbee coordinators for ZHA and Zigbee2MQTT", description: "Compare exact Zigbee coordinator models, chipsets, connections, firmware families, and documented integration support." },
  { slug: "z-wave-devices", label: "Z-Wave devices", title: "Z-Wave devices with exact product IDs", description: "Search Z-Wave models with Z-Wave JS identifiers, firmware ranges, configuration depth, Alliance records, and verified product images where available." },
  { slug: "nut-compatible-ups", label: "NUT-compatible UPS", title: "UPS models with Network UPS Tools drivers", description: "Find exact UPS models with NUT drivers, connection records, support levels, and manufacturer specifications." },
  { slug: "local-security-cameras", label: "Local security cameras", title: "Local security cameras for Frigate and Home Assistant", description: "Compare exact camera models by RTSP, ONVIF, PoE, substreams, audio, Frigate configuration, and verified product images where available." },
  { slug: "matter-devices", label: "Matter devices", title: "Matter devices with certification evidence", description: "Search certified Matter products by certificate ID, category, manufacturer, version, transport, and verified product images where available." },
];

function fail(message) {
  throw new Error(`Hardware directory preview: ${message}`);
}

function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) fail("DATABASE_URL is required. Run with --env-file=.env.local.");
  if (process.env.NODE_ENV === "production") fail("Refusing production NODE_ENV.");
  const database = new URL(value);
  if (database.hostname.includes(PRODUCTION_PROJECT_REF)) fail("Refusing the production database.");
  if (database.hostname !== MANAGED_DATABASE_HOST) fail(`Refusing a database other than ${MANAGED_DATABASE_HOST}.`);
  const api = new URL(process.env.SUPABASE_URL ?? "https://invalid.example");
  if (api.hostname !== MANAGED_API_HOST) fail(`Refusing a Supabase project other than ${MANAGED_API_HOST}.`);
  return value;
}

const remove = process.argv.includes("--remove");
const refresh = process.argv.includes("--refresh");
const dryRun = process.argv.includes("--dry-run");
const pool = new pg.Pool({ connectionString: databaseUrl(), connectionTimeoutMillis: 15_000, idleTimeoutMillis: 10_000, max: 1, query_timeout: 15_000 });

try {
  const count = await previewDirectoryPages(pool, pages, { remove, refresh, dryRun });
  console.log(`${dryRun ? "Would " : ""}${remove ? (dryRun ? "unpublish" : "Unpublished") : (dryRun ? "publish" : "Published")} ${count} managed-development hardware directory preview rows.${dryRun ? " Rolled back." : ""}`);
} finally {
  await pool.end();
}
