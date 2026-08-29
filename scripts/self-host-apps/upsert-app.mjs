#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { getSelfHostAppCategory } from "./lib/categories.mjs";
import { withClient } from "./lib/db.mjs";
import { normalizeRecord, appColumns, appSqlValue, readJson, validateRecord } from "./lib/schema.mjs";

const preserveOnNullColumns = new Set([
  "github_owner",
  "github_repo",
  "github_repo_id",
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
      `,
      [category.slug, category.name ?? slugToName(slug), category.icon_key, category.sort_order],
    );
  }
}

async function replaceCategoryLinks(client, appId, categories) {
  await client.query("delete from public.self_host_app_category_links where app_id = $1", [appId]);
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

async function upsertSource(client, appId, record) {
  const payload = record.source_payload;
  if (!payload?.source || !payload?.source_key) return;

  await client.query(
    `
      insert into public.self_host_app_sources (
        app_id,
        source,
        source_key,
        source_url,
        payload
      )
      values ($1, $2, $3, $4, $5::jsonb)
      on conflict (source, source_key) do update set
        app_id = excluded.app_id,
        source_url = excluded.source_url,
        payload = excluded.payload,
        imported_at = now()
    `,
    [
      appId,
      payload.source,
      payload.source_key,
      payload.source_url ?? null,
      JSON.stringify(payload.payload ?? payload),
    ],
  );
}

async function upsertFieldSources(client, appId, record) {
  const fieldSources = record.field_sources ?? [];

  for (const fieldSource of fieldSources) {
    if (!fieldSource.field_name || !fieldSource.source) continue;
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
        values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()), $7)
        on conflict (app_id, field_name) do update set
          source = excluded.source,
          source_url = excluded.source_url,
          confidence = excluded.confidence,
          checked_at = excluded.checked_at,
          note = excluded.note
      `,
      [
        appId,
        fieldSource.field_name,
        fieldSource.source,
        fieldSource.source_url ?? null,
        fieldSource.confidence ?? "unknown",
        fieldSource.checked_at ?? null,
        fieldSource.note ?? null,
      ],
    );
  }
}

async function main() {
  const args = parseArgs();
  if (!args.file) {
    console.error("Usage: npm run self-host-apps:upsert -- --file app.json [--dry-run]");
    process.exit(1);
  }

  const input = await readJson(args.file);
  const validation = validateRecord(input);
  for (const warning of validation.warnings) console.warn(`warning: ${warning}`);
  if (validation.errors.length > 0) {
    for (const error of validation.errors) console.error(`error: ${error}`);
    throw new Error("Fix validation errors before upsert.");
  }

  const record = normalizeRecord(input);
  await withClient(async (client) => {
    await client.query("begin");
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
        returning id
      `,
      values,
    );

    const appId = result.rows[0].id;
    await replaceCategoryLinks(client, appId, record.categories);
    await upsertSource(client, appId, record);
    await upsertFieldSources(client, appId, record);

    if (args["dry-run"]) {
      await client.query("rollback");
      console.log(`Dry run OK: ${record.slug}`);
    } else {
      await client.query("commit");
      console.log(`Upserted: ${record.slug}`);
    }
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
