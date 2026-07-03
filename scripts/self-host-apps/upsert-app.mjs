#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { getSelfHostAppCategory } from "./lib/categories.mjs";
import { withClient } from "./lib/db.mjs";
import { normalizeRecord, readJson, validateRecord } from "./lib/schema.mjs";

const appColumns = [
  "slug",
  "name",
  "summary",
  "icon_url",
  "website_url",
  "repository_url",
  "docs_url",
  "install_docs_url",
  "docker_url",
  "license",
  "publisher_name",
  "publisher_type",
  "publisher_url",
  "published",
  "maintenance_status",
  "github_owner",
  "github_repo",
  "github_stars",
  "github_latest_release",
  "github_latest_release_at",
  "github_last_commit_at",
  "github_checked_at",
  "docker_support",
  "compose_support",
  "requires_database",
  "database_types",
  "ram_mb",
  "storage_profile",
  "platforms",
  "summary_source",
  "summary_confidence",
];

const preserveOnNullColumns = new Set([
  "github_owner",
  "github_repo",
  "github_stars",
  "github_latest_release",
  "github_latest_release_at",
  "github_last_commit_at",
  "github_checked_at",
]);

function sqlValue(column, index) {
  const parameter = `$${index + 1}`;
  if (["database_types", "platforms"].includes(column)) return `${parameter}::text[]`;
  return parameter;
}

function slugToName(slug) {
  return slug.replace(/-/g, " ");
}

async function ensureCategories(client, categories) {
  for (const slug of categories) {
    const category = getSelfHostAppCategory(slug);
    if (!category) throw new Error(`Unknown category: ${slug}`);
    await client.query(
      `
        insert into public.self_host_apps_categories (slug, name, icon_key, sort_order)
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
  await client.query("delete from public.self_host_apps_categories_join_table where app_id = $1", [appId]);
  if (categories.length === 0) return;

  const result = await client.query(
    "select id, slug from public.self_host_apps_categories where slug = any($1::text[])",
    [categories],
  );
  const ids = new Map(result.rows.map((row) => [row.slug, row.id]));
  const missing = categories.filter((slug) => !ids.has(slug));
  if (missing.length > 0) throw new Error(`Missing categories: ${missing.join(", ")}`);

  for (const slug of categories) {
    await client.query(
      `
        insert into public.self_host_apps_categories_join_table (app_id, category_id)
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
      insert into public.self_host_apps_sources (
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
        insert into public.self_host_apps_field_sources (
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
        values (${appColumns.map(sqlValue).join(", ")})
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
