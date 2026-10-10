#!/usr/bin/env node

import pg from "pg";
import { previewDirectoryPages } from "../stack127/directory-pages/lib.mjs";

const MANAGED_DEVELOPMENT_PROJECT_REF = "phhrfvmncpqqmmgruktx";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const MANAGED_DEVELOPMENT_DATABASE_HOST = `db.${MANAGED_DEVELOPMENT_PROJECT_REF}.supabase.co`;
const MANAGED_DEVELOPMENT_API_HOST = `${MANAGED_DEVELOPMENT_PROJECT_REF}.supabase.co`;
const PRODUCTION_DATABASE_HOST = `db.${PRODUCTION_PROJECT_REF}.supabase.co`;
const PREVIEW_ROW = {
  description: "Check exact Zigbee models with current Zigbee2MQTT converter evidence and community-confirmed ZHA records.",
  label: "Zigbee devices",
  pageType: "CollectionPage",
  priority: 0.5,
  slug: "zigbee-devices",
  title: "Zigbee devices with ZHA and Zigbee2MQTT evidence",
};

function fail(message) {
  throw new Error(`Zigbee preview: ${message}`);
}

function requireManagedDevelopmentEnvironment() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) fail("DATABASE_URL is required. Run with --env-file=.env.local.");
  if (process.env.NODE_ENV === "production") fail("Refusing production NODE_ENV.");

  const database = new URL(databaseUrl);
  if (database.hostname === PRODUCTION_DATABASE_HOST || database.hostname.includes(PRODUCTION_PROJECT_REF)) {
    fail("Refusing the production database.");
  }
  if (database.hostname !== MANAGED_DEVELOPMENT_DATABASE_HOST) {
    fail(`Refusing a database other than ${MANAGED_DEVELOPMENT_DATABASE_HOST}.`);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) fail("SUPABASE_URL is required.");
  const api = new URL(supabaseUrl);
  if (api.hostname !== MANAGED_DEVELOPMENT_API_HOST) {
    fail(`Refusing a Supabase project other than ${MANAGED_DEVELOPMENT_API_HOST}.`);
  }

  return databaseUrl;
}

function matchesPreview(row) {
  return row
    && row.slug === PREVIEW_ROW.slug
    && row.label === PREVIEW_ROW.label
    && row.meta_title === PREVIEW_ROW.title
    && row.meta_description === PREVIEW_ROW.description
    && row.page_family === "directory"
    && row.page_type === PREVIEW_ROW.pageType
    && Number(row.sitemap_priority) === PREVIEW_ROW.priority;
}

const remove = process.argv.includes("--remove");
const refresh = process.argv.includes("--refresh");
const dryRun = process.argv.includes("--dry-run");
const pool = new pg.Pool({
  connectionString: requireManagedDevelopmentEnvironment(),
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 10_000,
  max: 1,
  query_timeout: 15_000,
});

try {
  await previewDirectoryPages(pool, [PREVIEW_ROW], { remove, refresh, dryRun, matchesRemoval: matchesPreview });
  console.log(`${dryRun ? "Would " : ""}${remove ? (dryRun ? "unpublish" : "Unpublished") : (dryRun ? "publish" : "Published")} the managed-development Zigbee directory preview row.${dryRun ? " Rolled back." : ""}`);
} finally {
  await pool.end();
}
