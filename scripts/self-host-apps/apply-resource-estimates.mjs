#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { resourceEstimatesToRow } from "./lib/streamlined-storage.mjs";

const resourceKinds = new Set(["ram", "storage"]);
const units = new Set(["mb", "gb"]);
const estimateKinds = new Set(["derived", "estimated"]);
const confidences = new Set(["high", "medium", "low"]);
const urlPattern = /^https?:\/\//i;

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
  return records.map((record, index) => {
    const prefix = `Estimate ${index + 1}`;
    const slug = String(record?.slug ?? "").trim();
    const resourceKind = String(record?.resource_kind ?? "").trim();
    const unit = String(record?.unit ?? "").trim();
    const estimateKind = String(record?.estimate_kind ?? "").trim();
    const confidence = String(record?.confidence ?? "").trim();
    const estimateMin = Number(record?.estimate_min);
    const estimateMax = Number(record?.estimate_max);
    const sourceUrls = Array.isArray(record?.source_urls)
      ? record.source_urls.map((url) => String(url).trim()).filter(Boolean)
      : [];

    if (!slug) fail(`${prefix} is missing slug.`);
    if (!resourceKinds.has(resourceKind)) fail(`${prefix} has invalid resource_kind: ${resourceKind}`);
    if (!units.has(unit)) fail(`${prefix} has invalid unit: ${unit}`);
    if (!estimateKinds.has(estimateKind)) fail(`${prefix} has invalid estimate_kind: ${estimateKind}`);
    if (!confidences.has(confidence)) fail(`${prefix} has invalid confidence: ${confidence}`);
    if (!Number.isFinite(estimateMin) || estimateMin < 0) fail(`${prefix} has invalid estimate_min.`);
    if (!Number.isFinite(estimateMax) || estimateMax < estimateMin) fail(`${prefix} has invalid estimate_max.`);
    if (resourceKind === "ram" && unit !== "mb") fail(`${prefix} RAM estimates must use MB.`);
    if (resourceKind === "storage" && unit !== "gb") fail(`${prefix} storage estimates must use GB.`);
    if (sourceUrls.length === 0 || sourceUrls.some((url) => !urlPattern.test(url))) fail(`${prefix} needs at least one HTTP source URL.`);

    const key = `${slug}|${resourceKind}`;
    if (seen.has(key)) fail(`Duplicate estimate for ${key}.`);
    seen.add(key);

    return {
      slug,
      resource_kind: resourceKind,
      estimate_min: estimateMin,
      estimate_max: estimateMax,
      unit,
      estimate_kind: estimateKind,
      confidence,
      basis: String(record?.basis ?? "").trim() || "editorial_review",
      source_urls: sourceUrls,
      note: record?.note ? String(record.note).trim() : null,
    };
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
      await client.query("begin");
      try {
        for (const [slug, appRecords] of byApp) {
          const row = resourceEstimatesToRow(appRecords, { checkedAt });
          const columns = Object.keys(row);
          const values = [appIds.get(slug), ...columns.map((column) => row[column])];
          await client.query(
            `
              insert into public.self_host_app_resource_estimates (app_id, ${columns.join(", ")})
              values ($1, ${columns.map((_, index) => `$${index + 2}${columnCast(columns[index])}`).join(", ")})
              on conflict (app_id) do update set
                ${columns.map((column) => `${column} = excluded.${column}`).join(",\n                ")},
                updated_at = now()
            `,
            values,
          );
        }
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
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
