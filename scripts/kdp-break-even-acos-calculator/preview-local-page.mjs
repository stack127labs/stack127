#!/usr/bin/env node

import pg from "pg";

const DEVELOPMENT_PROJECT_REF = "yzasonowwlvritqicatj";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const DEVELOPMENT_DATABASE_HOST = `db.${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const DEVELOPMENT_API_HOST = `${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const PREVIEW = {
  slug: "kdp-break-even-acos-calculator",
  title: "KDP Break-Even ACoS Calculator",
  description: "Development preview placeholder for checking an Amazon Ads CPC against KDP royalty and a per-sale target.",
  intro: "[Development preview placeholder. Final introduction awaits the writing stage.]",
  content: "## Development preview placeholder\nReplace this content during the writing stage.",
};

function fail(message) {
  throw new Error(`KDP break-even ACoS calculator preview: ${message}`);
}

function databaseUrl() {
  const connectionString = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
  if (!connectionString) fail("DATABASE_URL or DATABASE_POOLER_URL is required. Run with --env-file=.env.local.");
  if (process.env.NODE_ENV === "production") fail("Refusing production NODE_ENV.");

  const database = new URL(connectionString);
  if (database.hostname.includes(PRODUCTION_PROJECT_REF)) fail("Refusing the production database.");
  const isDevelopmentDirect = database.hostname === DEVELOPMENT_DATABASE_HOST;
  const isDevelopmentPooler = database.hostname.endsWith(".pooler.supabase.com")
    && decodeURIComponent(database.username) === `postgres.${DEVELOPMENT_PROJECT_REF}`;
  if (!isDevelopmentDirect && !isDevelopmentPooler) {
    fail(`Refusing a database other than ${DEVELOPMENT_DATABASE_HOST} or its project-scoped session pooler.`);
  }
  if (!process.env.SUPABASE_URL) fail("SUPABASE_URL is required.");

  const api = new URL(process.env.SUPABASE_URL);
  if (api.hostname !== DEVELOPMENT_API_HOST) fail(`Refusing a Supabase project other than ${DEVELOPMENT_API_HOST}.`);
  return connectionString;
}

const pool = new pg.Pool({
  connectionString: databaseUrl(),
  connectionTimeoutMillis: 15_000,
  idleTimeoutMillis: 10_000,
  max: 1,
  query_timeout: 15_000,
});

try {
  await pool.query("begin");
  const existing = await pool.query(
    "select slug from public.stack127_pages where slug = $1 limit 1",
    [PREVIEW.slug],
  );
  if (existing.rows.length) fail("a registry row already exists; refusing to overwrite it.");

  const page = await pool.query(
    `insert into public.stack127_pages (
      slug, label, meta_title, meta_description, is_published, published_at, updated_at,
      cover_image_url, page_type, sitemap_priority, page_family
    ) values ($1, $2, $2, $3, true, now(), now(), null, 'WebApplication', 0.5, 'tool')
    returning id`,
    [PREVIEW.slug, PREVIEW.title, PREVIEW.description],
  );

  await pool.query(
    `insert into public.stack127_tool_pages (
      page_id, title, intro_markdown, content_markdown, content_revision, tool_version, tool_version_updated_at
    ) values ($1, $2, $3, $4, 1, '1.0.0', now())`,
    [page.rows[0].id, PREVIEW.title, PREVIEW.intro, PREVIEW.content],
  );
  await pool.query("commit");
  console.log("Added the managed-development KDP break-even ACoS calculator preview row.");
} catch (error) {
  await pool.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await pool.end();
}
