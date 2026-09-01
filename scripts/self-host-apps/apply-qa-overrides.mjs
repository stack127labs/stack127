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

async function recordDataSources(client, appId, record, currentRow) {
  const urls = [
    record.source_url,
    ...(record.data_source_urls ?? []),
    currentRow.source_code_url,
    currentRow.website_url,
  ].filter((value) => typeof value === "string" && /^https?:\/\//i.test(value));
  if (urls.length === 0) return;
  await client.query(
    `
      update public.self_host_apps
      set data_source_urls = coalesce((
        select array_agg(distinct url order by url)
        from unnest(coalesce(data_source_urls, '{}') || $2::text[]) as values(url)
      ), '{}'),
      data_checked_at = now(),
      data_confidence = coalesce(nullif($3, ''), data_confidence),
      updated_at = now()
      where id = $1
    `,
    [appId, urls, record.confidence ?? "high"],
  );
}

async function applyRecord(client, record, dryRun) {
  if (!record.slug) throw new Error("record.slug is required");

  const columns = editableColumns.filter((column) => Object.hasOwn(record, column));
  if (columns.length === 0 && !(record.sources?.length || record.data_source_urls?.length)) {
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

  await recordDataSources(client, appId, record, currentRow);
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
