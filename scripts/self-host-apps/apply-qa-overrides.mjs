#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { appColumns, appColumnTypes } from "./lib/schema.mjs";

const editableColumns = appColumns.filter((column) => column !== "slug");

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.apps)) return input.apps;
  if (input.overrides && typeof input.overrides === "object") {
    return Object.entries(input.overrides).map(([slug, record]) => ({ slug, ...record }));
  }
  return [input];
}

function sqlValue(column, parameter) {
  const type = appColumnTypes[column];
  if (type === "text[]" || type === "jsonb" || type.startsWith("public.")) {
    return `${parameter}::${type}`;
  }
  return parameter;
}

async function replaceCategoryLinks(client, appId, categories) {
  await client.query("delete from public.self_host_app_category_links where app_id = $1", [appId]);
  if (!Array.isArray(categories) || categories.length === 0) return;

  const categoryResult = await client.query(
    "select id, slug from public.self_host_app_categories where slug = any($1::text[])",
    [categories],
  );
  const idsBySlug = new Map(categoryResult.rows.map((row) => [row.slug, row.id]));
  const missing = categories.filter((slug) => !idsBySlug.has(slug));
  if (missing.length > 0) throw new Error(`Missing categories: ${missing.join(", ")}`);

  for (const slug of categories) {
    await client.query(
      `
        insert into public.self_host_app_category_links (app_id, category_id)
        values ($1, $2)
        on conflict (app_id, category_id) do nothing
      `,
      [appId, idsBySlug.get(slug)],
    );
  }
}

async function upsertFieldSources(client, appId, record, currentRow) {
  const explicitSources = record.field_sources ?? [];
  const fallbackSourceUrl = record.source_url ?? currentRow.source_code_url ?? currentRow.website_url;
  const generatedSources =
    fallbackSourceUrl && explicitSources.length === 0
      ? editableColumns
          .filter((column) => Object.hasOwn(record, column))
          .map((column) => ({
            field_name: column,
            source: record.source ?? "official_source_qa",
            source_url: fallbackSourceUrl,
            confidence: record.confidence ?? "high",
            note: record.note ?? null,
          }))
      : [];

  for (const source of [...explicitSources, ...generatedSources]) {
    if (!source.field_name || !source.source_url) continue;
    await client.query(
      `
        insert into public.self_host_app_field_sources (
          app_id,
          field_name,
          source,
          source_url,
          confidence,
          checked_at,
          note
        )
        values ($1, $2, $3, $4, $5, now(), $6)
        on conflict (app_id, field_name) do update set
          source = excluded.source,
          source_url = excluded.source_url,
          confidence = excluded.confidence,
          checked_at = excluded.checked_at,
          note = excluded.note
      `,
      [
        appId,
        source.field_name,
        source.source ?? "official_source_qa",
        source.source_url,
        source.confidence ?? "high",
        source.note ?? null,
      ],
    );
  }
}

async function applyRecord(client, record, dryRun) {
  if (!record.slug) throw new Error("record.slug is required");

  const columns = editableColumns.filter((column) => Object.hasOwn(record, column));
  if (columns.length === 0 && !record.field_sources?.length) {
    console.log(`Skipped ${record.slug}: no fields to update`);
    return;
  }

  const current = await client.query("select id, source_code_url, website_url from public.self_host_apps where slug = $1", [
    record.slug,
  ]);
  if (current.rowCount === 0) throw new Error(`Missing app row: ${record.slug}`);
  const currentRow = current.rows[0];
  const appId = currentRow.id;

  if (columns.length > 0) {
    const values = [record.slug, ...columns.map((column) => record[column])];
    const assignments = columns
      .map((column, index) => `${column} = ${sqlValue(column, `$${index + 2}`)}`)
      .join(",\n          ");

    await client.query(
      `
        update public.self_host_apps
        set
          ${assignments},
          updated_at = now()
        where slug = $1
      `,
      values,
    );
  }

  if (Object.hasOwn(record, "categories")) {
    await replaceCategoryLinks(client, appId, record.categories);
  }

  await upsertFieldSources(client, appId, record, currentRow);
  console.log(`${dryRun ? "Checked" : "Applied"} QA override: ${record.slug}`);
}

async function main() {
  const args = parseArgs();
  if (!args.file) {
    console.error("Usage: node scripts/self-host-apps/apply-qa-overrides.mjs --file overrides.json [--dry-run]");
    process.exit(1);
  }

  const input = JSON.parse(await readFile(args.file, "utf8"));
  const records = recordsFromInput(input).slice(0, numberArg(args, "limit", Number.MAX_SAFE_INTEGER));
  const dryRun = Boolean(args["dry-run"]);

  await withClient(async (client) => {
    await client.query("begin");
    try {
      for (const record of records) {
        await applyRecord(client, record, dryRun);
      }

      if (dryRun) {
        await client.query("rollback");
        console.log(`Dry run OK. Checked ${records.length} QA override(s).`);
      } else {
        await client.query("commit");
        console.log(`Committed ${records.length} QA override(s).`);
      }
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
