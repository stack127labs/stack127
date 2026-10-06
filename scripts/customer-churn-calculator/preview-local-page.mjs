#!/usr/bin/env node

import pg from "pg";

const DEVELOPMENT_PROJECT_REF = "yzasonowwlvritqicatj";
const PREVIEW = {
  slug: "customer-churn-calculator",
  title: "Customer churn calculator",
  metaTitle: "Development preview: Customer churn calculator",
  metaDescription: "Temporary development preview for the Customer Churn Calculator.",
  intro: "Development preview placeholder. Enter the opening paying-account count and the number of those accounts still lost at the end of one reporting period.",
  content: "Development preview content placeholder. This temporary copy supports local review of the calculator. Replace it with reviewed page content before production publication.",
  artKey: "customer-churn-calculator",
};

function fail(message) {
  throw new Error("Customer churn preview: " + message);
}

function databaseUrl() {
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is required. Run with --env-file=.env.local.");
  if (process.env.NODE_ENV === "production") fail("Refusing a production NODE_ENV.");

  const database = new URL(process.env.DATABASE_URL);
  if (database.hostname !== `db.${DEVELOPMENT_PROJECT_REF}.supabase.co`) {
    fail("Refusing a database other than the managed development database.");
  }

  if (!process.env.SUPABASE_URL) fail("SUPABASE_URL is required.");
  const api = new URL(process.env.SUPABASE_URL);
  if (api.hostname !== `${DEVELOPMENT_PROJECT_REF}.supabase.co`) {
    fail("Refusing a Supabase project other than the managed development project.");
  }

  return process.env.DATABASE_URL;
}

function matchesPreview(row) {
  return row
    && row.slug === PREVIEW.slug
    && row.page_family === "tool"
    && row.label === PREVIEW.title
    && row.meta_title === PREVIEW.metaTitle
    && row.meta_description === PREVIEW.metaDescription
    && row.is_published === true
    && row.page_type === "WebApplication"
    && row.tool_title === PREVIEW.title
    && row.intro_markdown === PREVIEW.intro
    && row.usage_markdown === null
    && row.content_markdown === PREVIEW.content
    && row.tool_version === "1.0.0"
    && row.card_art_key === PREVIEW.artKey;
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
            tool.usage_markdown, tool.content_markdown, tool.tool_version, tool.card_art_key
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
    console.log("The managed-development Customer Churn Calculator preview row already exists.");
  } else {
    const page = await pool.query(
      `insert into public.stack127_pages (
        slug, label, meta_title, meta_description, is_published, published_at, updated_at,
        cover_image_url, page_type, sitemap_priority, page_family
      ) values ($1, $2, $3, $4, true, now(), now(), null, 'WebApplication', 0.5, 'tool')
      returning id`,
      [PREVIEW.slug, PREVIEW.title, PREVIEW.metaTitle, PREVIEW.metaDescription],
    );
    await pool.query(
      `insert into public.stack127_tool_pages (
        page_id, title, intro_markdown, usage_markdown, content_markdown,
        tool_version, tool_version_updated_at, card_art_key
      ) values ($1, $2, $3, null, $4, '1.0.0', now(), $5)`,
      [page.rows[0].id, PREVIEW.title, PREVIEW.intro, PREVIEW.content, PREVIEW.artKey],
    );
    await pool.query("commit");
    console.log("Added the managed-development Customer Churn Calculator preview row.");
  }
} catch (error) {
  await pool.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await pool.end();
}
