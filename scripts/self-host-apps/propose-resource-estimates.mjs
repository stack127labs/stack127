#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const modelVersion = "deployment-shape-v1";
const urlPattern = /^https?:\/\//i;

function firstSourceUrl(row) {
  return [row.install_docs_url, row.docs_url, row.website_url, row.source_code_url]
    .find((value) => typeof value === "string" && urlPattern.test(value)) ?? null;
}

function hasExactRam(row) {
  return row.ram_min_mb !== null ||
    row.ram_recommended_mb !== null ||
    row.ram_default_limit_mb !== null;
}

function ramRange(row) {
  if (hasExactRam(row)) return null;

  const databaseCount = Array.isArray(row.database_types) ? row.database_types.length : 0;
  const needsDatabase = row.requires_database === true || databaseCount > 0;
  let minimum = needsDatabase ? 512 : 256;

  if (databaseCount >= 3) minimum += 512;
  if (row.storage_profile === "high") minimum += 256;

  const maximum = Math.min(
    8192,
    Math.max(minimum * 2, databaseCount >= 3 ? 4096 : needsDatabase ? 2048 : 1024),
  );

  return { minimum, maximum };
}

function storageRange(row) {
  if (row.storage_min_gb !== null || row.storage_profile !== "unknown") return null;

  const databaseCount = Array.isArray(row.database_types) ? row.database_types.length : 0;
  const needsDatabase = row.requires_database === true || databaseCount > 0;

  if (row.persistent_storage === true) {
    return needsDatabase
      ? { minimum: 10, maximum: 100 }
      : { minimum: 5, maximum: 50 };
  }

  return needsDatabase
    ? { minimum: 5, maximum: 50 }
    : { minimum: 1, maximum: 20 };
}

function estimateRecord(row, resourceKind, range, sourceUrl) {
  const unit = resourceKind === "ram" ? "mb" : "gb";
  const signal = resourceKind === "ram"
    ? "database services, retained-data profile, and deployment shape"
    : "persistent-storage and database signals";

  return {
    slug: row.slug,
    resource_kind: resourceKind,
    estimate_min: range.minimum,
    estimate_max: range.maximum,
    unit,
    estimate_kind: "estimated",
    confidence: "low",
    basis: `${modelVersion}: ${signal}`,
    source_urls: [sourceUrl],
    note: "Editorial planning range, not a publisher requirement. Actual usage depends on workload, concurrency, retained data, and enabled features.",
  };
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);
  const report = await withClient(async (client) => {
    const result = await client.query(
      `
        select slug, install_docs_url, docs_url, website_url, source_code_url,
               requires_database, database_types, ram_min_mb, ram_recommended_mb,
               ram_default_limit_mb, storage_min_gb, storage_profile,
               persistent_storage
        from public.self_host_apps
        where published = true
          and self_hosting_status = 'self_hostable'
        order by popularity_score desc, name asc
        limit $1
      `,
      [limit],
    );

    const estimates = [];
    let skipped = 0;
    for (const row of result.rows) {
      const sourceUrl = firstSourceUrl(row);
      if (!sourceUrl) {
        skipped += 1;
        continue;
      }

      const ram = ramRange(row);
      if (ram) estimates.push(estimateRecord(row, "ram", ram, sourceUrl));

      const storage = storageRange(row);
      if (storage) estimates.push(estimateRecord(row, "storage", storage, sourceUrl));
    }

    return {
      generated_at: new Date().toISOString(),
      model: modelVersion,
      apps_checked: result.rows.length,
      skipped_without_source: skipped,
      estimate_count: estimates.length,
      estimates,
    };
  }, args["database-url"]);

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
  }

  console.log(JSON.stringify({
    generated_at: report.generated_at,
    model: report.model,
    apps_checked: report.apps_checked,
    skipped_without_source: report.skipped_without_source,
    estimate_count: report.estimate_count,
    resource_counts: report.estimates.reduce((counts, estimate) => ({
      ...counts,
      [estimate.resource_kind]: (counts[estimate.resource_kind] ?? 0) + 1,
    }), {}),
    mode: "proposal",
    out: args.out ?? null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
