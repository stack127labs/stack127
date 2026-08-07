#!/usr/bin/env node

import dns from "node:dns";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

dns.setDefaultResultOrder("ipv4first");

const blockedPublishedPrefixes = [];

function pageManifests(directory = path.join(process.cwd(), "tests", "pages")) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return pageManifests(entryPath);
    if (entry.name !== "page.json") return [];
    return [JSON.parse(readFileSync(entryPath, "utf8"))];
  });
}

const expectedPublishedSlugs = pageManifests()
  .filter((entry) => entry.state === "published")
  .map((entry) => entry.route === "/" ? "" : entry.route.replace(/^\/+|\/+$/gu, ""));

const flatSlugByLegacySlug = new Map([
  ...[
    "caa-checker",
    "dns-change-checker",
    "dns-lookup",
    "dns-trace",
    "dnssec-checker",
    "nameserver-checker",
    "soa-checker",
  ].map((slug) => [`dns-tools/${slug}`, slug]),
  ...[
    "domain-age",
    "domain-availability",
    "domain-expiry",
    "domain-lookup",
    "domain-owner",
    "domain-registrar",
    "domain-report",
    "epp-status-codes",
    "multi-tld-availability",
    "punycode-converter",
    "tld-directory",
    "transfer-readiness",
  ].map((slug) => [`domain-tools/${slug}`, slug]),
]);

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
        select slug, label, meta_title, meta_description, is_published, page_type, sitemap_priority
        from public.version127_pages
        where is_published = true
        order by slug
      `,
    );

    const actual = sorted(
      new Set(result.rows.map((row) => flatSlugByLegacySlug.get(row.slug) ?? row.slug)),
    );
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
      if (!String(row.label ?? "").trim()) failures.push(`Missing label for ${row.slug || "/"}`);
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
