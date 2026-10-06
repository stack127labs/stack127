#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { resourceEstimatesToRow } from "./lib/streamlined-storage.mjs";

import { validateResourceEstimate } from "./lib/resource-review.mjs";

function fail(message) {
  throw new Error(message);
}

function readRecords(file) {
  if (!file || !existsSync(file)) fail(`Estimate file not found: ${file ?? "<missing>"}`);
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  const records = Array.isArray(parsed) ? parsed : parsed.estimates;
  if (!Array.isArray(records)) fail("Estimate file must contain an array or an { estimates: [] } object.");
  return records;
}

function validateRecords(records) {
  const seen = new Set();
  return records.map(record => {
    const validated = validateResourceEstimate(record);
    const key = `${validated.slug}|${validated.resource_kind}`;
    if (seen.has(key)) fail(`Duplicate estimate for ${key}.`);
    seen.add(key);
    return validated;
  });
}

async function main() {
  const args = parseArgs();
  const records = validateRecords(readRecords(args.file));
  const apply = Boolean(args["apply-reviewed"]);
  const checkedAt = new Date().toISOString();

  const report = await withClient(async (client) => {
    const slugs = [...new Set(records.map((record) => record.slug))];
    const result = await client.query(
      `
        select id, slug
        from public.self_host_apps
        where published = true
          and self_hosting_status = 'self_hostable'
          and slug = any($1::text[])
      `,
      [slugs],
    );
    const appIds = new Map(result.rows.map((row) => [row.slug, row.id]));
    const missing = slugs.filter((slug) => !appIds.has(slug));
    if (missing.length > 0) fail(`Published self-hostable app not found: ${missing.join(", ")}`);

    const byApp = new Map();
    for (const record of records) {
      const list = byApp.get(record.slug) ?? [];
      list.push(record);
      byApp.set(record.slug, list);
    }

    if (apply) {
      const columns = [
        "app_id",
        "ram_estimate_min_mb",
        "ram_estimate_max_mb",
        "ram_estimate_kind",
        "ram_estimate_confidence",
        "ram_estimate_basis",
        "ram_source_urls",
        "ram_note",
        "storage_estimate_min_gb",
        "storage_estimate_max_gb",
        "storage_estimate_kind",
        "storage_estimate_confidence",
        "storage_estimate_basis",
        "storage_source_urls",
        "storage_note",
        "checked_at",
      ];
      const recordTypes = [
        "uuid",
        "numeric", "numeric", "text", "text", "text", "text[]", "text",
        "numeric", "numeric", "text", "text", "text", "text[]", "text",
        "timestamptz",
      ];
      const storedRows = [...byApp].map(([slug, appRecords]) => ({
        app_id: appIds.get(slug),
        ...resourceEstimatesToRow(appRecords, { checkedAt }),
      }));
      const facts = columns.filter(column => !['app_id', 'checked_at'].includes(column));
      const currentFacts = facts.map(column => `self_host_app_resource_estimates.${column}`);
      const incomingFacts = facts.map((column, index) => column.endsWith('_urls')
        ? `case when cardinality(excluded.${column}) > 0 then excluded.${column} else ${currentFacts[index]} end`
        : `coalesce(excluded.${column}, ${currentFacts[index]})`);
      await client.query("begin");
      try {
        await client.query(
          `
            insert into public.self_host_app_resource_estimates (${columns.join(", ")})
            select ${columns.map((column) => `item.${column}`).join(", ")}
            from jsonb_to_recordset($1::jsonb) as item(${columns.map((column, index) => `${column} ${recordTypes[index]}`).join(", ")})
            on conflict (app_id) do update set
              ram_estimate_min_mb = coalesce(excluded.ram_estimate_min_mb, self_host_app_resource_estimates.ram_estimate_min_mb),
              ram_estimate_max_mb = coalesce(excluded.ram_estimate_max_mb, self_host_app_resource_estimates.ram_estimate_max_mb),
              ram_estimate_kind = coalesce(excluded.ram_estimate_kind, self_host_app_resource_estimates.ram_estimate_kind),
              ram_estimate_confidence = coalesce(excluded.ram_estimate_confidence, self_host_app_resource_estimates.ram_estimate_confidence),
              ram_estimate_basis = coalesce(excluded.ram_estimate_basis, self_host_app_resource_estimates.ram_estimate_basis),
              ram_source_urls = case when cardinality(excluded.ram_source_urls) > 0 then excluded.ram_source_urls else self_host_app_resource_estimates.ram_source_urls end,
              ram_note = coalesce(excluded.ram_note, self_host_app_resource_estimates.ram_note),
              storage_estimate_min_gb = coalesce(excluded.storage_estimate_min_gb, self_host_app_resource_estimates.storage_estimate_min_gb),
              storage_estimate_max_gb = coalesce(excluded.storage_estimate_max_gb, self_host_app_resource_estimates.storage_estimate_max_gb),
              storage_estimate_kind = coalesce(excluded.storage_estimate_kind, self_host_app_resource_estimates.storage_estimate_kind),
              storage_estimate_confidence = coalesce(excluded.storage_estimate_confidence, self_host_app_resource_estimates.storage_estimate_confidence),
              storage_estimate_basis = coalesce(excluded.storage_estimate_basis, self_host_app_resource_estimates.storage_estimate_basis),
              storage_source_urls = case when cardinality(excluded.storage_source_urls) > 0 then excluded.storage_source_urls else self_host_app_resource_estimates.storage_source_urls end,
              storage_note = coalesce(excluded.storage_note, self_host_app_resource_estimates.storage_note),
              checked_at = excluded.checked_at,
              updated_at = now()
            where row(${currentFacts.join(', ')}) is distinct from row(${incomingFacts.join(', ')})
          `,
          [JSON.stringify(storedRows)],
        );
        await client.query("commit");
      } catch (error) {
        try {
          await client.query("rollback");
        } catch (rollbackError) {
          error.message = `${error.message}; rollback failed: ${rollbackError.message}`;
        }
        throw error;
      }
    }

    return {
      mode: apply ? "apply" : "dry-run",
      records: records.length,
      apps: byApp.size,
      resource_counts: Object.fromEntries(
        [...records.reduce((counts, record) => counts.set(record.resource_kind, (counts.get(record.resource_kind) ?? 0) + 1), new Map()).entries()],
      ),
    };
  }, args["database-url"]);

  console.log(JSON.stringify(report, null, 2));
}

function columnCast(column) {
  if (column.endsWith("_urls")) return "::text[]";
  if (column === "checked_at") return "::timestamptz";
  return "";
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
