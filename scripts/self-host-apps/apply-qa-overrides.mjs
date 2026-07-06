#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const appColumns = [
  "summary",
  "license",
  "published",
  "requires_database",
  "database_types",
  "docker_support",
  "compose_support",
  "docker_url",
  "docs_url",
  "install_docs_url",
  "website_url",
  "repository_url",
];

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.apps)) return input.apps;
  return [input];
}

function sqlValue(column, parameter) {
  if (column === "database_types") return `${parameter}::text[]`;
  return parameter;
}

async function upsertFieldSources(client, appId, record) {
  for (const source of record.field_sources ?? []) {
    if (!source.field_name || !source.source_url) continue;
    await client.query(
      `
        insert into public.self_host_apps_field_sources (
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

  const columns = appColumns.filter((column) => Object.hasOwn(record, column));
  if (columns.length === 0 && !record.field_sources?.length) {
    console.log(`Skipped ${record.slug}: no fields to update`);
    return;
  }

  const current = await client.query("select id from public.self_host_apps where slug = $1", [record.slug]);
  if (current.rowCount === 0) throw new Error(`Missing app row: ${record.slug}`);

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

  await upsertFieldSources(client, current.rows[0].id, record);
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
