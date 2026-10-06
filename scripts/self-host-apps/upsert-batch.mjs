#!/usr/bin/env node

import { changedColumns } from '../stack127/database/sync-records.mjs';
import { pathToFileURL } from 'node:url';
import { parseArgs, numberArg } from "./lib/args.mjs";
import { getSelfHostAppCategory } from "./lib/categories.mjs";
import { withClient } from "./lib/db.mjs";
import { normalizeRecord, appColumns, appSqlValue, readJson, validateRecord } from "./lib/schema.mjs";

const preserveOnNullColumns = new Set([
  "github_owner",
  "github_repo",
  "github_repo_id",
  "github_project_id",
  "github_node_id",
  "github_full_name",
  "github_owner_type",
  "github_stars",
  "github_forks",
  "github_watchers",
  "github_open_issues",
  "github_primary_language",
  "github_languages",
  "github_topics",
  "github_created_at",
  "github_updated_at",
  "github_pushed_at",
  "github_default_branch",
  "github_repo_size_kb",
  "github_archived",
  "github_disabled",
  "github_is_fork",
  "github_is_template",
  "source_repo_id",
  "source_full_name",
  "source_stars",
  "source_forks",
  "source_watchers",
  "source_open_issues",
  "source_primary_language",
  "source_languages",
  "source_topics",
  "source_created_at",
  "source_updated_at",
  "source_pushed_at",
  "source_default_branch",
  "source_repo_size_kb",
  "source_archived",
  "source_disabled",
  "source_is_fork",
  "source_is_template",
  "source_latest_release",
  "source_latest_release_at",
  "source_last_commit_at",
  "source_checked_at",
  "github_latest_release",
  "github_latest_release_at",
  "github_last_commit_at",
  "github_checked_at",
]);

function slugToName(slug) {
  return slug.replace(/-/g, " ");
}

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.apps)) return input.apps;
  return [input];
}

function applyPublishMode(record, args) {
  if (args.publish) return { ...record, published: true };
  if (args.draft) return { ...record, published: false };
  return record;
}

async function ensureCategories(client, categories) {
  for (const slug of categories) {
    const category = getSelfHostAppCategory(slug);
    if (!category) throw new Error(`Unknown category: ${slug}`);
    await client.query(
      `
        insert into public.self_host_app_categories (slug, name, icon_key, sort_order)
        values ($1, $2, $3, $4)
        on conflict (slug) do update set
          name = excluded.name,
          icon_key = excluded.icon_key,
          sort_order = excluded.sort_order
        where ${changedColumns('self_host_app_categories',['name','icon_key','sort_order'])}
      `,
      [category.slug, category.name ?? slugToName(slug), category.icon_key, category.sort_order],
    );
  }
}

async function replaceCategoryLinks(client, appId, categories) {
  await client.query("delete from public.self_host_app_category_links link where app_id=$1 and not exists(select 1 from public.self_host_app_categories category where category.id=link.category_id and category.slug=any($2::text[]))", [appId,categories]);
  if (categories.length === 0) return;

  const result = await client.query(
    "select id, slug from public.self_host_app_categories where slug = any($1::text[])",
    [categories],
  );
  const ids = new Map(result.rows.map((row) => [row.slug, row.id]));
  const missing = categories.filter((slug) => !ids.has(slug));
  if (missing.length > 0) throw new Error(`Missing categories: ${missing.join(", ")}`);

  for (const slug of categories) {
    await client.query(
      `
        insert into public.self_host_app_category_links (app_id, category_id)
        values ($1, $2)
        on conflict (app_id, category_id) do nothing
      `,
      [appId, ids.get(slug)],
    );
  }
}

export async function upsertRecord(client, record) {
  await ensureCategories(client, record.categories);

  const values = appColumns.map((column) => record[column]);
  const updates = appColumns
    .filter((column) => column !== "slug")
    .map((column) => {
      if (preserveOnNullColumns.has(column)) {
        return `${column} = coalesce(excluded.${column}, self_host_apps.${column})`;
      }
      return `${column} = excluded.${column}`;
    })
    .join(",\n          ");

  const result = await client.query(
    `
      insert into public.self_host_apps (${appColumns.join(", ")})
      values (${appColumns.map(appSqlValue).join(", ")})
      on conflict (slug) do update set
        ${updates},
        updated_at = now()
      where ${changedColumns('self_host_apps',appColumns,{preserveOnNull:preserveOnNullColumns,exclude:['slug']})}
      returning id
    `,
    values,
  );

  const appId = result.rows[0]?.id ?? (await client.query('select id from public.self_host_apps where slug=$1',[record.slug])).rows[0].id;
  await replaceCategoryLinks(client, appId, record.categories);
}

async function main() {
  const args = parseArgs();
  if (!args.file) {
    console.error("Usage: npm run self-host-apps:upsert-batch -- --file apps.json [--draft|--publish] [--dry-run]");
    process.exit(1);
  }

  const input = await readJson(args.file);
  const allRecords = recordsFromInput(input);
  const offset = Number(args.offset ?? 0);
  const limit = numberArg(args, "limit", allRecords.length);
  const rawRecords = allRecords.slice(offset, offset + limit).map((record) => applyPublishMode(record, args));
  const validatedRecords = [];

  for (const rawRecord of rawRecords) {
    const validation = validateRecord(rawRecord);
    for (const warning of validation.warnings) console.warn(`warning ${validation.record.slug}: ${warning}`);
    if (validation.errors.length > 0) {
      for (const error of validation.errors) console.error(`error ${validation.record.slug}: ${error}`);
      throw new Error(`Fix validation errors before batch upsert: ${validation.record.slug}`);
    }
    validatedRecords.push(normalizeRecord(rawRecord));
  }

  await withClient(async (client) => {
    const chunkSize = numberArg(args, "chunk-size", validatedRecords.length);
    let completed = 0;

    for (let start = 0; start < validatedRecords.length; start += chunkSize) {
      const chunk = validatedRecords.slice(start, start + chunkSize);
      await client.query("begin");

      try {
        for (const record of chunk) {
          await upsertRecord(client, record);
          console.log(`${args["dry-run"] ? "Checked" : "Upserted"}: ${record.slug}`);
        }

        if (args["dry-run"]) {
          await client.query("rollback");
          console.log(`Dry run chunk OK: ${chunk.length} record(s), offset ${offset + start}.`);
        } else {
          await client.query("commit");
          console.log(`Committed chunk: ${chunk.length} record(s), offset ${offset + start}.`);
        }
        completed += chunk.length;
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }

    console.log(`${args["dry-run"] ? "Dry run OK" : "Batch upserted"}: ${completed} record(s), offset ${offset}.`);
  }, args["database-url"]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
