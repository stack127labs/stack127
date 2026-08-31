#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

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

    if (apply) {
      await client.query("begin");
      try {
        const appliedRecords = records.map((record) => ({
          ...record,
          app_id: appIds.get(record.slug),
        }));
        await client.query(
          `
            insert into public.self_host_app_resource_estimates (
              app_id, resource_kind, estimate_min, estimate_max, unit,
              estimate_kind, confidence, basis, source_urls, note, checked_at
            )
            select
              estimate.app_id,
              estimate.resource_kind,
              estimate.estimate_min,
              estimate.estimate_max,
              estimate.unit,
              estimate.estimate_kind,
              estimate.confidence,
              estimate.basis,
              array(select jsonb_array_elements_text(estimate.source_urls)),
              estimate.note,
              now()
            from jsonb_to_recordset($1::jsonb) as estimate(
              app_id uuid,
              resource_kind text,
              estimate_min numeric,
              estimate_max numeric,
              unit text,
              estimate_kind text,
              confidence text,
              basis text,
              source_urls jsonb,
              note text
            )
            on conflict (app_id, resource_kind) do update set
              estimate_min = excluded.estimate_min,
              estimate_max = excluded.estimate_max,
              unit = excluded.unit,
              estimate_kind = excluded.estimate_kind,
              confidence = excluded.confidence,
              basis = excluded.basis,
              source_urls = excluded.source_urls,
              note = excluded.note,
              checked_at = excluded.checked_at
          `,
          [JSON.stringify(appliedRecords)],
        );
        await client.query(
          `
            insert into public.self_host_app_field_sources (
              app_id, field_name, source, source_url, confidence, checked_at, note
            )
            select
              estimate.app_id,
              estimate.resource_kind || $$_estimate$$,
              case when estimate.estimate_kind = $$derived$$ then $$derived_estimate$$ else $$manual_estimate$$ end,
              (estimate.source_urls ->> 0),
              estimate.confidence,
              now(),
              coalesce(estimate.note, $$Reviewed estimate from $$ || estimate.basis)
            from jsonb_to_recordset($1::jsonb) as estimate(
              app_id uuid,
              resource_kind text,
              estimate_kind text,
              confidence text,
              basis text,
              source_urls jsonb,
              note text
            )
            on conflict (app_id, field_name) do update set
              source = excluded.source,
              source_url = excluded.source_url,
              confidence = excluded.confidence,
              checked_at = excluded.checked_at,
              note = excluded.note
          `,
          [JSON.stringify(appliedRecords)],
        );
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }

    return {
      mode: apply ? "apply" : "dry-run",
      records: records.length,
      apps: slugs.length,
      resource_counts: records.reduce((counts, record) => ({
        ...counts,
        [record.resource_kind]: (counts[record.resource_kind] ?? 0) + 1,
      }), {}),
      confidence_counts: records.reduce((counts, record) => ({
        ...counts,
        [record.confidence]: (counts[record.confidence] ?? 0) + 1,
      }), {}),
    };
  }, args["database-url"]);

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
