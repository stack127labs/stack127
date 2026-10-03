#!/usr/bin/env node

import pg from "pg";

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
const pool = new pg.Pool({ connectionString: databaseUrl(), connectionTimeoutMillis: 15_000, idleTimeoutMillis: 10_000, max: 1, query_timeout: 15_000 });

try {
  if (remove) {
    await pool.query("delete from public.stack127_pages where slug = any($1::text[])", [pages.map((page) => page.slug)]);
    console.log(`Removed ${pages.length} managed-development hardware directory preview rows.`);
  } else if (refresh) {
    const existing = await pool.query("select slug from public.stack127_pages where slug = any($1::text[])", [pages.map((page) => page.slug)]);
    const existingSlugs = new Set(existing.rows.map((row) => row.slug));
    const missing = pages.filter((page) => !existingSlugs.has(page.slug)).map((page) => page.slug);
    if (missing.length > 0) fail(`refusing to refresh because preview rows are missing: ${missing.join(", ")}`);
    for (const page of pages) {
      await pool.query(
        `update public.stack127_pages
         set label = $2, meta_title = $3, meta_description = $4
         where slug = $1`,
        [page.slug, page.label, page.title, page.description],
      );
    }
    console.log(`Refreshed metadata for ${pages.length} managed-development hardware directory preview rows.`);
  } else {
    const existing = await pool.query("select slug from public.stack127_pages where slug = any($1::text[])", [pages.map((page) => page.slug)]);
    if (existing.rows.length > 0) fail(`refusing to overwrite existing rows: ${existing.rows.map((row) => row.slug).join(", ")}`);
    for (const page of pages) {
      await pool.query(
        `insert into public.stack127_pages (
          slug, label, meta_title, meta_description, is_published,
          published_at, updated_at, cover_image_url, page_type, sitemap_priority, page_family
        ) values ($1, $2, $3, $4, true, now(), now(), null, 'CollectionPage', 0.5, 'directory')`,
        [page.slug, page.label, page.title, page.description],
      );
    }
    console.log(`Added ${pages.length} managed-development hardware directory preview rows.`);
  }
} finally {
  await pool.end();
}
