#!/usr/bin/env node

import pg from "pg";
import {
  appContentToDbRow,
  parseArgs,
  readCategories,
  readJson,
  validateAppContent,
} from "./lib/content-schema.mjs";

const { Pool } = pg;

const defaultDatabaseUrl = "postgresql://postgres:postgres@127.0.0.1:54332/postgres";
const jsonbColumns = new Set(["screenshots", "client_apps", "hardware_recommendations"]);
const textArrayColumns = new Set([
  "best_for",
  "not_best_for",
  "good_fit",
  "watch_outs",
  "known_issues",
  "deployment_methods",
  "database_types",
  "supported_platforms",
  "replaces_apps",
]);
const uuidArrayColumns = new Set(["alternative_app_ids"]);

function usage() {
  console.error("Usage: npm run selfhost:upsert -- --file content/apps/name.json [--database-url postgres://...] [--dry-run]");
}

function sqlValuePlaceholder(column, index) {
  const placeholder = `$${index}`;
  if (jsonbColumns.has(column)) return `${placeholder}::jsonb`;
  if (textArrayColumns.has(column)) return `${placeholder}::text[]`;
  if (uuidArrayColumns.has(column)) return `${placeholder}::uuid[]`;
  return placeholder;
}

function dbValue(column, value) {
  if (jsonbColumns.has(column)) return JSON.stringify(value ?? []);
  return value;
}

async function upsertCategories(client, categories) {
  for (const category of categories) {
    await client.query(
      `
        insert into public.categories (slug, name, description, icon_key)
        values ($1, $2, $3, $4)
        on conflict (slug) do update set
          name = excluded.name,
          description = excluded.description,
          icon_key = excluded.icon_key,
          updated_at = now()
      `,
      [category.slug, category.name, category.description ?? null, category.icon_key ?? null],
    );
  }
}

async function replaceCategoryLinks(client, appId, categorySlugs) {
  const categoriesResult = await client.query(
    "select id, slug from public.categories where slug = any($1::text[])",
    [categorySlugs],
  );
  const categoryIdsBySlug = new Map(categoriesResult.rows.map((category) => [category.slug, category.id]));
  const missing = categorySlugs.filter((slug) => !categoryIdsBySlug.has(slug));
  if (missing.length > 0) throw new Error(`Missing categories in database: ${missing.join(", ")}`);

  await client.query("delete from public.self_host_app_categories where app_id = $1", [appId]);
  for (const slug of categorySlugs) {
    await client.query(
      `
        insert into public.self_host_app_categories (app_id, category_id)
        values ($1, $2)
        on conflict (app_id, category_id) do nothing
      `,
      [appId, categoryIdsBySlug.get(slug)],
    );
  }
}

async function upsertSnapshot(client, appId, github) {
  if (!github?.owner || !github?.repo || !github?.checked_at) return;

  const snapshotDate = github.checked_at.slice(0, 10);
  await client.query(
    `
      insert into public.self_host_app_github_snapshots (
        app_id,
        snapshot_date,
        stars,
        forks,
        open_issues,
        open_pull_requests,
        latest_release,
        latest_release_at,
        last_commit_at,
        commit_count_90d,
        release_count_90d,
        release_count
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      on conflict (app_id, snapshot_date) do update set
        stars = excluded.stars,
        forks = excluded.forks,
        open_issues = excluded.open_issues,
        open_pull_requests = excluded.open_pull_requests,
        latest_release = excluded.latest_release,
        latest_release_at = excluded.latest_release_at,
        last_commit_at = excluded.last_commit_at,
        commit_count_90d = excluded.commit_count_90d,
        release_count_90d = excluded.release_count_90d,
        release_count = excluded.release_count
    `,
    [
      appId,
      snapshotDate,
      github.stars ?? null,
      github.forks ?? null,
      github.open_issues ?? null,
      github.open_pull_requests ?? null,
      github.latest_release ?? null,
      github.latest_release_at ?? null,
      github.last_commit_at ?? null,
      github.commit_count_90d ?? null,
      github.release_count_90d ?? null,
      github.release_count ?? null,
    ],
  );
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.file) {
    usage();
    process.exit(1);
  }

  const app = await readJson(args.file);
  const categories = await readCategories();
  const validation = validateAppContent(app, categories, { strict: true });
  for (const warning of validation.warnings) console.warn(`warning: ${warning}`);
  if (validation.errors.length > 0) {
    for (const error of validation.errors) console.error(`error: ${error}`);
    throw new Error("Fix validation errors before database upsert.");
  }

  const databaseUrl = args["database-url"] ?? process.env.DATABASE_URL ?? defaultDatabaseUrl;
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("begin");
    await upsertCategories(client, categories);

    const row = appContentToDbRow(app);
    const columns = Object.keys(row);
    const values = columns.map((column) => dbValue(column, row[column]));
    const placeholders = columns.map((column, index) => sqlValuePlaceholder(column, index + 1));
    const updates = columns
      .filter((column) => column !== "slug")
      .map((column) => `${column} = excluded.${column}`)
      .join(",\n          ");

    const result = await client.query(
      `
        insert into public.self_host_apps (${columns.join(", ")})
        values (${placeholders.join(", ")})
        on conflict (slug) do update set
          ${updates},
          updated_at = now()
        returning id, slug
      `,
      values,
    );

    const appId = result.rows[0].id;
    await replaceCategoryLinks(client, appId, app.categories ?? []);
    await upsertSnapshot(client, appId, app.github);

    if (args["dry-run"]) {
      await client.query("rollback");
      console.log(`Dry run OK for ${app.slug}. No database changes were committed.`);
    } else {
      await client.query("commit");
      console.log(`Upserted ${app.slug} and ${app.categories?.length ?? 0} category link(s).`);
      if (app.github?.checked_at) console.log("GitHub snapshot upserted for current checked date.");
    }
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
