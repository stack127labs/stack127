#!/usr/bin/env node

import pg from "pg";

const DEVELOPMENT_PROJECT_REF = "phhrfvmncpqqmmgruktx";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const DEVELOPMENT_DATABASE_HOST = `db.${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const DEVELOPMENT_API_HOST = `${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const PRODUCTION_DATABASE_HOST = `db.${PRODUCTION_PROJECT_REF}.supabase.co`;
const PREVIEW = {
  slug: "self-hosted-app-resource-planner",
  label: "Self-hosted app resource planner",
  title: "Self-hosted app resource planner",
  description: "Estimate RAM and storage envelopes for a set of self-hosted apps.",
  pageType: "WebApplication",
  priority: 0.5,
  intro: "Plan a self-hosted app mix locally.",
  content: "Preview route for the interactive resource planner.",
};
const remove = process.argv.includes("--remove");

function fail(message) {
  throw new Error(`Self-hosted app resource planner preview: ${message}`);
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

function matchesPage(row) {
  return row
    && row.slug === PREVIEW.slug
    && row.label === PREVIEW.label
    && row.meta_title === PREVIEW.title
    && row.meta_description === PREVIEW.description
    && row.is_published === true
    && row.page_type === PREVIEW.pageType
    && row.tool_version === "1.0.0";
}

const pool = new pg.Pool({ connectionString: databaseUrl(), connectionTimeoutMillis: 15_000, idleTimeoutMillis: 10_000, max: 1, query_timeout: 15_000 });
try {
  await pool.query("begin");
  const existing = await pool.query(
    `select page.id, page.slug, page.label, page.meta_title, page.meta_description, page.is_published, page.page_type,
            tool.tool_version
       from public.stack127_pages page
       left join public.stack127_tool_pages tool on tool.page_id = page.id
      where page.slug = $1
      limit 1`,
    [PREVIEW.slug],
  );
  if (remove) {
    const row = existing.rows[0];
    if (!matchesPage(row)) fail("the preview row does not match the guarded contract.");
    await pool.query("delete from public.stack127_pages where id = $1", [row.id]);
    await pool.query("commit");
    console.log("Removed the temporary managed-development self-hosted app resource planner preview row.");
  } else {
    if (existing.rows.length) fail("a registry row already exists; refusing to overwrite it.");
    const page = await pool.query(
      `insert into public.stack127_pages (
        slug, label, meta_title, meta_description, is_published, published_at, updated_at, cover_image_url, page_type, sitemap_priority, page_family
      ) values ($1, $2, $3, $4, true, now(), now(), null, $5, $6, 'tool') returning id`,
      [PREVIEW.slug, PREVIEW.label, PREVIEW.title, PREVIEW.description, PREVIEW.pageType, PREVIEW.priority],
    );
    await pool.query(
      `insert into public.stack127_tool_pages (
        page_id, title, intro_markdown, content_markdown, tool_version, tool_version_updated_at
      ) values ($1, $2, $3, $4, '1.0.0', now())`,
      [page.rows[0].id, PREVIEW.title, PREVIEW.intro, PREVIEW.content],
    );
    await pool.query("commit");
    console.log("Added the temporary managed-development self-hosted app resource planner preview row.");
  }
} catch (error) {
  await pool.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await pool.end();
}
