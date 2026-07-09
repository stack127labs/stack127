#!/usr/bin/env node

/**
 * Upserts the /self-hosting-for-beginners course rows into public.version127_pages from
 * scripts/self-hosting-for-beginners/pages.json (the durable home of the course's SEO
 * meta titles and descriptions).
 *
 * Usage:
 *   node scripts/self-hosting-for-beginners/publish-pages.mjs                 # .env.local (local dev preview)
 *   node scripts/self-hosting-for-beginners/publish-pages.mjs --unpublish     # set is_published=false
 *   node scripts/self-hosting-for-beginners/publish-pages.mjs --database-url <url>
 *
 * Production note: scripts/version127/quality/seo-registry-check.mjs is the
 * expected-slug gate for published SEO pages. Keep that list aligned with this
 * file before publishing or unpublishing course pages.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

function unquote(value) {
  return value.replace(/^['"]|['"]$/g, "");
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = unquote(trimmed.slice(equalsIndex + 1).trim());
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

const args = process.argv.slice(2);
const unpublish = args.includes("--unpublish");
const urlFlagIndex = args.indexOf("--database-url");
const databaseUrlOverride = urlFlagIndex !== -1 ? args[urlFlagIndex + 1] : null;

if (!process.env.DATABASE_URL && !databaseUrlOverride) {
  loadEnvFile(".env.local");
}
const connectionString = databaseUrlOverride ?? process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "DATABASE_URL is required. Use .env.local locally, or pass --database-url.",
  );
  process.exit(1);
}

const pages = JSON.parse(
  readFileSync(path.join(process.cwd(), "scripts/self-hosting-for-beginners/pages.json"), "utf8"),
);

const pool = new Pool({ connectionString, max: 2 });

try {
  for (const page of pages) {
    await pool.query(
      `
        insert into public.version127_pages
          (slug, label, meta_title, meta_description, is_published, published_at, page_type, sitemap_priority)
        values ($1, $2, $3, $4, $5, case when $5 then now() else null end, $6, $7)
        on conflict (slug) do update set
          label = excluded.label,
          meta_title = excluded.meta_title,
          meta_description = excluded.meta_description,
          page_type = excluded.page_type,
          sitemap_priority = excluded.sitemap_priority,
          is_published = excluded.is_published,
          published_at = coalesce(public.version127_pages.published_at, excluded.published_at),
          updated_at = now()
      `,
      [
        page.slug,
        page.label,
        page.meta_title,
        page.meta_description,
        !unpublish,
        page.page_type,
        page.sitemap_priority,
      ],
    );
    console.log(`${unpublish ? "unpublished" : "upserted"}: ${page.slug}`);
  }
  console.log(
    `\n${pages.length} rows ${unpublish ? "unpublished" : "upserted"}.` +
      "\nReminder: production publication must stay aligned with" +
      "\nscripts/version127/quality/seo-registry-check.mjs.",
  );
} finally {
  await pool.end();
}
