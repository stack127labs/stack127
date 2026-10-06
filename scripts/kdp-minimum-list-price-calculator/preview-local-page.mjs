#!/usr/bin/env node

import pg from "pg";

const DEVELOPMENT_PROJECT_REF = "yzasonowwlvritqicatj";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const DEVELOPMENT_DATABASE_HOST = `db.${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const DEVELOPMENT_API_HOST = `${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const PREVIEW = {
  slug: "kdp-minimum-list-price-calculator",
  title: "KDP Minimum List Price Calculator",
  description: "Development preview placeholder for a KDP minimum list price estimate.",
  intro: "[Development preview placeholder. Final introduction awaits the writing stage.]",
  content: "## Development preview placeholder\nReplace this content during the writing stage.",
};

function fail(message) {
  throw new Error(`KDP minimum list price preview: ${message}`);
}

function databaseUrl() {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is required. Run with --env-file=.env.local.");
  if (process.env.NODE_ENV === "production") fail("Refusing production NODE_ENV.");

  const database = new URL(process.env.DATABASE_URL);
  if (database.hostname.includes(PRODUCTION_PROJECT_REF)) fail("Refusing the production database.");
  if (database.hostname !== DEVELOPMENT_DATABASE_HOST) fail(`Refusing a database other than ${DEVELOPMENT_DATABASE_HOST}.`);
  if (!process.env.SUPABASE_URL) fail("SUPABASE_URL is required.");

  const api = new URL(process.env.SUPABASE_URL);
  if (api.hostname !== DEVELOPMENT_API_HOST) fail(`Refusing a Supabase project other than ${DEVELOPMENT_API_HOST}.`);
  return process.env.DATABASE_URL;
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
      page_id, title, intro_markdown, content_markdown, tool_version, tool_version_updated_at
    ) values ($1, $2, $3, $4, '1.0.0', now())`,
    [page.rows[0].id, PREVIEW.title, PREVIEW.intro, PREVIEW.content],
  );
  await pool.query("commit");
  console.log("Added the managed-development KDP minimum list price calculator preview row.");
} catch (error) {
  await pool.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await pool.end();
}
