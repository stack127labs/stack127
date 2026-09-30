#!/usr/bin/env node

import pg from "pg";

const DEVELOPMENT_PROJECT_REF = "yzasonowwlvritqicatj";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const PREVIEW = {
  slug: "saas-metrics-calculator",
  title: "SaaS metrics calculator",
  description: "Calculate recurring revenue, retention, acquisition cost, margin, and burn efficiency from one month of SaaS figures.",
  intro: "Development preview placeholder. Enter one SaaS reporting month to see its recurring-revenue and unit-economics snapshot.",
  content: "Development preview content placeholder. This temporary row exists to review the interactive calculator. The writing stage will replace this text before any production publication.",
};

function fail(message) {
  throw new Error("SaaS metrics preview: " + message);
}

function databaseUrl() {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is required. Run with --env-file=.env.local.");
  if (process.env.NODE_ENV === "production") fail("Refusing production NODE_ENV.");
  const database = new URL(process.env.DATABASE_URL);
  if (database.hostname !== "db." + DEVELOPMENT_PROJECT_REF + ".supabase.co") {
    if (database.hostname.includes(PRODUCTION_PROJECT_REF)) fail("Refusing the production database.");
    fail("Refusing a database other than the managed development database.");
  }
  if (!process.env.SUPABASE_URL) fail("SUPABASE_URL is required.");
  const api = new URL(process.env.SUPABASE_URL);
  if (api.hostname !== DEVELOPMENT_PROJECT_REF + ".supabase.co") {
    fail("Refusing a Supabase project other than the managed development project.");
  }
  return process.env.DATABASE_URL;
}

function matchesPreview(row) {
  return row
    && row.slug === PREVIEW.slug
    && row.page_family === "tool"
    && row.label === PREVIEW.title
    && row.meta_title === PREVIEW.title
    && row.meta_description === PREVIEW.description
    && row.is_published === true
    && row.page_type === "WebApplication"
    && row.tool_title === PREVIEW.title
    && row.intro_markdown === PREVIEW.intro
    && row.content_markdown === PREVIEW.content
    && row.tool_version === "1.0.0";
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
    `select page.id, page.slug, page.page_family, page.label, page.meta_title, page.meta_description,
            page.is_published, page.page_type, tool.title as tool_title, tool.intro_markdown,
            tool.content_markdown, tool.tool_version
       from public.stack127_pages page
       left join public.stack127_tool_pages tool on tool.page_id = page.id
      where page.slug = $1
      limit 1`,
    [PREVIEW.slug],
  );

  if (existing.rows.length) {
    if (!matchesPreview(existing.rows[0])) {
      fail("a registry row already exists and does not match this preview; refusing to overwrite it.");
    }
    await pool.query("commit");
    console.log("The managed-development SaaS metrics preview row already exists.");
  } else {
    const page = await pool.query(
      `insert into public.stack127_pages (
        slug, label, meta_title, meta_description, is_published, published_at, updated_at,
        cover_image_url, page_type, sitemap_priority, page_family
      ) values ($1, $2, $3, $4, true, now(), now(), null, 'WebApplication', 0.5, 'tool')
      returning id`,
      [PREVIEW.slug, PREVIEW.title, PREVIEW.title, PREVIEW.description],
    );
    await pool.query(
      `insert into public.stack127_tool_pages (
        page_id, title, intro_markdown, content_markdown, content_revision,
        tool_version, tool_version_updated_at
      ) values ($1, $2, $3, $4, 1, '1.0.0', now())`,
      [page.rows[0].id, PREVIEW.title, PREVIEW.intro, PREVIEW.content],
    );
    await pool.query("commit");
    console.log("Added the managed-development SaaS metrics preview row.");
  }
} catch (error) {
  await pool.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await pool.end();
}
