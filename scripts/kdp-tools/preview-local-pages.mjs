#!/usr/bin/env node

import pg from "pg";

const DEVELOPMENT_PROJECT_REF = "phhrfvmncpqqmmgruktx";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const DEVELOPMENT_DATABASE_HOST = `db.${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const DEVELOPMENT_API_HOST = `${DEVELOPMENT_PROJECT_REF}.supabase.co`;
const PRODUCTION_DATABASE_HOST = `db.${PRODUCTION_PROJECT_REF}.supabase.co`;
const INITIAL_TOOL_VERSION = "1.0.0";
const CURRENT_TOOL_VERSION = "1.1.0";
const PREVIEWS = [
  {
    slug: "kdp-book-setup-calculator",
    title: "KDP book setup calculator",
    description: "Calculate trim, bleed, margins, spine, and cover dimensions for a KDP book.",
    intro: "Calculate a KDP print setup locally.",
    content: "Choose a binding, trim, paper, page count, and bleed setting. The calculator returns the interior page size, margins, spine, and full cover dimensions. Hardcover cover values are estimates and need a final check with KDP.",
  },
  {
    slug: "kdp-metadata-checker",
    title: "KDP metadata checker",
    description: "Check KDP title, description, HTML, and keyword fields before upload.",
    intro: "Check KDP listing fields locally.",
    content: "Paste existing title, subtitle, description, and keyword fields into the checker. It counts the raw fields, checks the documented description tags, and flags patterns that need a human review. It does not write listing copy.",
  },
  {
    slug: "kdp-royalty-calculator",
    title: "KDP royalty calculator",
    description: "Estimate KDP print and ebook royalties from current US Amazon.com rules.",
    intro: "Estimate KDP royalty per sale.",
    content: "Select paperback, hardcover, or Kindle ebook and enter the price and format details. The planner shows cost, effective royalty, a price comparison, break-even ad headroom, and copies for an optional monthly target. It covers US Amazon.com and excludes Expanded Distribution.",
  },
  {
    slug: "kdp-pdf-preflight-checker",
    title: "KDP PDF preflight checker",
    description: "Inspect a PDF locally for dimensions, boxes, fonts, and possible KDP issues.",
    intro: "Inspect a KDP PDF in this browser.",
    content: "Choose the expected interior or cover setup and select a PDF. The first pass checks page dimensions, mixed sizes, page count, box names, fonts, images, and encryption without uploading the file. Findings are possible issues, not an acceptance decision.",
  },
  {
    slug: "kdp-page-count-estimator",
    title: "KDP page count estimator",
    description: "Estimate a likely KDP page range from words and layout choices.",
    intro: "Estimate a likely KDP page range.",
    content: "Enter words, trim, typography, margins, chapter starts, image pages, and front or back matter. The result is an even-page range for planning. A final typeset PDF remains the source for the actual page count.",
  },
];

const remove = process.argv.includes("--remove");

function fail(message) {
  throw new Error(`KDP preview: ${message}`);
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

function matchesPage(row, preview) {
  return row
    && row.slug === preview.slug
    && row.label === preview.title
    && row.meta_title === preview.title
    && row.meta_description === preview.description
    && row.is_published === true
    && row.page_type === "WebApplication"
    && row.tool_title === preview.title
    && row.intro_markdown === preview.intro
    && row.content_markdown === preview.content
    && [INITIAL_TOOL_VERSION, CURRENT_TOOL_VERSION].includes(row.tool_version);
}

const pool = new pg.Pool({ connectionString: databaseUrl(), connectionTimeoutMillis: 15_000, idleTimeoutMillis: 10_000, max: 1, query_timeout: 15_000 });
try {
  await pool.query("begin");
  for (const preview of PREVIEWS) {
    const existing = await pool.query(
      `select page.id, page.slug, page.label, page.meta_title, page.meta_description, page.is_published, page.page_type,
              tool.title as tool_title, tool.intro_markdown, tool.content_markdown, tool.tool_version
         from public.stack127_pages page
         left join public.stack127_tool_pages tool on tool.page_id = page.id
        where page.slug = $1
        limit 1`,
      [preview.slug],
    );
    if (remove) {
      const row = existing.rows[0];
      if (!matchesPage(row, preview)) fail(`the ${preview.slug} preview row does not match the guarded contract.`);
      await pool.query("delete from public.stack127_pages where id = $1", [row.id]);
    } else {
      if (existing.rows.length) fail(`a registry row already exists for ${preview.slug}; refusing to overwrite it.`);
      const page = await pool.query(
        `insert into public.stack127_pages (
          slug, label, meta_title, meta_description, is_published, published_at, updated_at, cover_image_url, page_type, sitemap_priority, page_family
        ) values ($1, $2, $3, $4, true, now(), now(), null, 'WebApplication', 0.5, 'tool') returning id`,
        [preview.slug, preview.title, preview.title, preview.description],
      );
      await pool.query(
        `insert into public.stack127_tool_pages (
          page_id, title, intro_markdown, content_markdown, content_revision, tool_version, tool_version_updated_at
        ) values ($1, $2, $3, $4, 1, $5, now())`,
        [page.rows[0].id, preview.title, preview.intro, preview.content, INITIAL_TOOL_VERSION],
      );
    }
  }
  await pool.query("commit");
  console.log(remove ? "Removed the managed-development KDP preview rows." : "Added the managed-development KDP preview rows.");
} catch (error) {
  await pool.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await pool.end();
}
