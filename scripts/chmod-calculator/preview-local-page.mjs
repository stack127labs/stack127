#!/usr/bin/env node

import pg from "pg";

const DEVELOPMENT_PROJECT_REF = "phhrfvmncpqqmmgruktx";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const DEVELOPMENT_DATABASE_HOST = `db.${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const DEVELOPMENT_API_HOST = `${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const PRODUCTION_DATABASE_HOST = `db.${PRODUCTION_PROJECT_REF}.supabase.co`;
const PREVIEW_SLUG = "chmod-calculator";
const remove = process.argv.includes("--remove");

function fail(message) {
  throw new Error(`chmod calculator preview: ${message}`);
}

function databaseUrl() {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is required. Run with --env-file=.env.local.");
  if (process.env.NODE_ENV === "production") fail("Refusing production NODE_ENV.");
  const database = new URL(process.env.DATABASE_URL);
  if (database.hostname === PRODUCTION_DATABASE_HOST || database.hostname.includes(PRODUCTION_PROJECT_REF)) fail("Refusing the production database.");
  if (database.hostname !== DEVELOPMENT_DATABASE_HOST) fail(`Refusing a database other than ${DEVELOPMENT_DATABASE_HOST}.`);
  if (!process.env.SUPABASE_URL) fail("SUPABASE_URL is required.");
  const api = new URL(process.env.SUPABASE_URL);
  if (api.hostname !== DEVELOPMENT_API_HOST) fail(`Refusing a Supabase project other than ${DEVELOPMENT_API_HOST}.`);
  return process.env.DATABASE_URL;
}

function matchesPage(row, expectedPublished) {
  return row
    && row.slug === PREVIEW_SLUG
    && row.is_published === expectedPublished
    && row.page_family === "tool"
    && row.page_type === "WebApplication"
    && row.tool_title === "Chmod calculator"
    && row.content_revision === 2
    && row.tool_version === "1.0.0";
}

const pool = new pg.Pool({ connectionString: databaseUrl(), connectionTimeoutMillis: 15_000, idleTimeoutMillis: 10_000, max: 1, query_timeout: 15_000 });
try {
  await pool.query("begin");
  const existing = await pool.query(
    `select page.id, page.slug, page.is_published, page.published_at, page.updated_at,
            page.page_family, page.page_type, tool.title as tool_title,
            tool.content_revision, tool.tool_version
       from public.stack127_pages page
       left join public.stack127_tool_pages tool on tool.page_id = page.id
      where page.slug = $1
      limit 1`,
    [PREVIEW_SLUG],
  );
  const row = existing.rows[0];
  if (remove) {
    if (!matchesPage(row, true)) fail("the published preview row does not match the guarded contract.");
    await pool.query(
      `update public.stack127_pages
          set is_published = false, published_at = null, updated_at = null
        where id = $1`,
      [row.id],
    );
    await pool.query("commit");
    console.log("Unpublished the managed-development chmod calculator preview without changing its content.");
  } else {
    if (!matchesPage(row, false) || row.published_at !== null || row.updated_at !== null) {
      fail("the unpublished integrated row does not match the guarded contract.");
    }
    await pool.query(
      `update public.stack127_pages
          set is_published = true, published_at = now(), updated_at = now()
        where id = $1`,
      [row.id],
    );
    await pool.query("commit");
    console.log("Published the existing managed-development chmod calculator row for local preview.");
  }
} catch (error) {
  await pool.query("rollback").catch(() => undefined);
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await pool.end();
}
