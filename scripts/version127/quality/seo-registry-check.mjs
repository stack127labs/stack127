#!/usr/bin/env node

import dns from "node:dns";
import { Pool } from "pg";

dns.setDefaultResultOrder("ipv4first");

const expectedPublishedSlugs = ["", "about", "privacy", "self-host-apps", "terms"];
const blockedPublishedPrefixes = ["self-hosting-for-beginners"];

function databaseUrl() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required. Use .env.database for production registry checks.");
  }
  return process.env.DATABASE_URL;
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

async function main() {
  const pool = new Pool({
    connectionString: databaseUrl(),
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: 2,
    query_timeout: 15000,
  });

  try {
    const result = await pool.query(
      `
        select slug, meta_title, meta_description, is_published, page_type, sitemap_priority
        from public.version127_pages
        where is_published = true
        order by slug
      `,
    );

    const actual = sorted(result.rows.map((row) => row.slug));
    const expected = sorted(expectedPublishedSlugs);
    const failures = [];

    for (const slug of expected) {
      if (!actual.includes(slug)) failures.push(`Missing published slug: ${slug || "/"}`);
    }

    for (const slug of actual) {
      if (!expected.includes(slug)) failures.push(`Unexpected published slug: ${slug || "/"}`);
      if (blockedPublishedPrefixes.some((prefix) => slug === prefix || slug.startsWith(`${prefix}/`))) {
        failures.push(`Blocked in-development slug is published: ${slug}`);
      }
    }

    for (const row of result.rows) {
      if (!String(row.meta_title ?? "").trim()) failures.push(`Missing meta_title for ${row.slug || "/"}`);
      if (!String(row.meta_description ?? "").trim()) {
        failures.push(`Missing meta_description for ${row.slug || "/"}`);
      }
      const priority = Number(row.sitemap_priority);
      if (!Number.isFinite(priority) || priority < 0 || priority > 1) {
        failures.push(`Invalid sitemap_priority for ${row.slug || "/"}: ${row.sitemap_priority}`);
      }
    }

    if (failures.length > 0) {
      console.error("Version127 SEO registry check failed:");
      for (const failure of failures) console.error(`- ${failure}`);
      console.error(JSON.stringify({ expected, actual }, null, 2));
      process.exit(1);
    }

    console.log(JSON.stringify({ published_slugs: actual }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
