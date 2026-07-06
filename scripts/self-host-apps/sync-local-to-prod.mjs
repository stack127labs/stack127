#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import pg from "pg";
import { parseArgs, numberArg } from "./lib/args.mjs";

const { Pool } = pg;

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

const appRecordsetColumns = [
  "slug text",
  "name text",
  "summary text",
  "icon_url text",
  "website_url text",
  "repository_url text",
  "docs_url text",
  "install_docs_url text",
  "docker_url text",
  "license text",
  "publisher_name text",
  "publisher_type text",
  "publisher_url text",
  "published boolean",
  "maintenance_status text",
  "github_owner text",
  "github_repo text",
  "github_stars integer",
  "github_latest_release text",
  "github_latest_release_at timestamptz",
  "github_last_commit_at timestamptz",
  "github_checked_at timestamptz",
  "docker_support text",
  "compose_support boolean",
  "requires_database boolean",
  "database_types text[]",
  "ram_mb integer",
  "storage_profile text",
  "platforms text[]",
  "summary_source text",
  "summary_confidence text",
];

function unquote(value) {
  return value.replace(/^['"]|['"]$/g, "");
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = unquote(trimmed.slice(equalsIndex + 1).trim());
    if (key) env[key] = value;
  }

  return env;
}

function databaseUrl(args, key, filePath) {
  const explicit = args[key];
  if (explicit) return explicit;

  const env = readEnvFile(filePath);
  if (env.DATABASE_URL) return env.DATABASE_URL;

  throw new Error(`DATABASE_URL is required in ${filePath} or --${key}.`);
}

function createPool(connectionString) {
  return new Pool({
    connectionString,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 10000,
    max: 4,
    query_timeout: 120000,
  });
}

async function fetchLocalState(client) {
  const categories = await client.query(
    `
      select slug, name, icon_key, sort_order
      from public.self_host_apps_categories
      order by sort_order, slug
    `,
  );
  const apps = await client.query(
    `
      select ${appColumns.join(", ")}
      from public.self_host_apps
      order by slug
    `,
  );
  const categoryLinks = await client.query(
    `
      select app.slug as app_slug, category.slug as category_slug
      from public.self_host_apps_categories_join_table link
      join public.self_host_apps app on app.id = link.app_id
      join public.self_host_apps_categories category on category.id = link.category_id
      order by app.slug, category.slug
    `,
  );
  const sources = await client.query(
    `
      select app.slug as app_slug, source.source, source.source_key, source.source_url, source.payload
      from public.self_host_apps_sources source
      left join public.self_host_apps app on app.id = source.app_id
      order by source.source, source.source_key
    `,
  );
  const fieldSources = await client.query(
    `
      select app.slug as app_slug, field.field_name, field.source, field.source_url, field.confidence, field.checked_at, field.note
      from public.self_host_apps_field_sources field
      join public.self_host_apps app on app.id = field.app_id
      order by app.slug, field.field_name
    `,
  );

  return {
    categories: categories.rows,
    apps: apps.rows,
    categoryLinks: categoryLinks.rows,
    sources: sources.rows,
    fieldSources: fieldSources.rows,
  };
}

function chunks(rows, size) {
  const result = [];
  for (let start = 0; start < rows.length; start += size) {
    result.push(rows.slice(start, start + size));
  }
  return result;
}

async function upsertCategories(client, categories) {
  for (const category of categories) {
    await client.query(
      `
        insert into public.self_host_apps_categories (slug, name, icon_key, sort_order)
        values ($1, $2, $3, $4)
        on conflict (slug) do update set
          name = excluded.name,
          icon_key = excluded.icon_key,
          sort_order = excluded.sort_order,
          updated_at = now()
      `,
      [category.slug, category.name, category.icon_key, category.sort_order],
    );
  }
}

async function upsertApps(client, apps) {
  const updates = appColumns
    .filter((column) => column !== "slug")
    .map((column) => `${column} = excluded.${column}`)
    .join(",\n          ");

  await client.query(
    `
      insert into public.self_host_apps (${appColumns.join(", ")})
      select ${appColumns.map((column) => `item.${column}`).join(", ")}
      from jsonb_to_recordset($1::jsonb) as item(${appRecordsetColumns.join(", ")})
      on conflict (slug) do update set
        ${updates},
        updated_at = now()
    `,
    [JSON.stringify(apps)],
  );
}

async function fetchIdMaps(client, state) {
  const appSlugs = state.apps.map((app) => app.slug);
  const categorySlugs = state.categories.map((category) => category.slug);

  const [apps, categories] = await Promise.all([
    client.query("select id, slug from public.self_host_apps where slug = any($1::text[])", [appSlugs]),
    client.query("select id, slug from public.self_host_apps_categories where slug = any($1::text[])", [categorySlugs]),
  ]);

  return {
    appIds: new Map(apps.rows.map((row) => [row.slug, row.id])),
    categoryIds: new Map(categories.rows.map((row) => [row.slug, row.id])),
  };
}

async function replaceCategoryLinks(client, state, appIds, categoryIds) {
  console.log(`Replacing category links: ${state.categoryLinks.length}`);
  const ids = [...appIds.values()];
  if (ids.length > 0) {
    await client.query("delete from public.self_host_apps_categories_join_table where app_id = any($1::uuid[])", [ids]);
  }

  const appMap = [...appIds.entries()];
  const categoryMap = [...categoryIds.entries()];
  const linkChunks = chunks(state.categoryLinks, 1000);
  for (let index = 0; index < linkChunks.length; index += 1) {
    await client.query(
      `
        insert into public.self_host_apps_categories_join_table (app_id, category_id)
        select app_map.app_id, category_map.category_id
        from jsonb_to_recordset($1::jsonb) as item(app_slug text, category_slug text)
        join unnest($2::text[], $3::uuid[]) as app_map(app_slug, app_id)
          on app_map.app_slug = item.app_slug
        join unnest($4::text[], $5::uuid[]) as category_map(category_slug, category_id)
          on category_map.category_slug = item.category_slug
        on conflict (app_id, category_id) do nothing
      `,
      [
        JSON.stringify(linkChunks[index]),
        appMap.map(([slug]) => slug),
        appMap.map(([, id]) => id),
        categoryMap.map(([slug]) => slug),
        categoryMap.map(([, id]) => id),
      ],
    );
    console.log(`Replaced category link chunks: ${index + 1}/${linkChunks.length}`);
  }
  console.log(`Replaced category links: ${state.categoryLinks.length}`);
}

async function upsertSources(client, state, appIds) {
  console.log(`Syncing source payloads: ${state.sources.length}`);
  const appSlugMap = [...appIds.entries()];
  const appSlugs = appSlugMap.map(([slug]) => slug);
  const ids = appSlugMap.map(([, id]) => id);

  const sourceChunks = chunks(state.sources, 500);
  for (let index = 0; index < sourceChunks.length; index += 1) {
    const chunk = sourceChunks[index];
    await client.query(
      `
        insert into public.self_host_apps_sources (app_id, source, source_key, source_url, payload)
        select
          map.app_id,
          item.source,
          item.source_key,
          item.source_url,
          item.payload
        from jsonb_to_recordset($1::jsonb) as item(
          app_slug text,
          source text,
          source_key text,
          source_url text,
          payload jsonb
        )
        left join unnest($2::text[], $3::uuid[]) as map(app_slug, app_id)
          on map.app_slug = item.app_slug
        on conflict (source, source_key) do update set
          app_id = excluded.app_id,
          source_url = excluded.source_url,
          payload = excluded.payload,
          imported_at = now()
      `,
      [
        JSON.stringify(chunk.map((source) => ({
          app_slug: source.app_slug,
          source: source.source,
          source_key: source.source_key,
          source_url: source.source_url,
          payload: source.payload ?? {},
        }))),
        appSlugs,
        ids,
      ],
    );
    console.log(`Synced source payload chunks: ${index + 1}/${sourceChunks.length}`);
  }
}

async function replaceFieldSources(client, state, appIds) {
  console.log(`Replacing field sources: ${state.fieldSources.length}`);
  const ids = [...appIds.values()];
  if (ids.length > 0) {
    await client.query("delete from public.self_host_apps_field_sources where app_id = any($1::uuid[])", [ids]);
  }

  const appSlugMap = [...appIds.entries()];
  const appSlugs = appSlugMap.map(([slug]) => slug);
  const appIdValues = appSlugMap.map(([, id]) => id);

  const fieldChunks = chunks(state.fieldSources, 1000);
  for (let index = 0; index < fieldChunks.length; index += 1) {
    const chunk = fieldChunks[index];
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
        select
          map.app_id,
          item.field_name,
          item.source,
          item.source_url,
          item.confidence,
          coalesce(item.checked_at::timestamptz, now()),
          item.note
        from jsonb_to_recordset($1::jsonb) as item(
          app_slug text,
          field_name text,
          source text,
          source_url text,
          confidence text,
          checked_at text,
          note text
        )
        join unnest($2::text[], $3::uuid[]) as map(app_slug, app_id)
          on map.app_slug = item.app_slug
        on conflict (app_id, field_name) do update set
          source = excluded.source,
          source_url = excluded.source_url,
          confidence = excluded.confidence,
          checked_at = excluded.checked_at,
          note = excluded.note
      `,
      [
        JSON.stringify(chunk.map((field) => ({
          app_slug: field.app_slug,
          field_name: field.field_name,
          source: field.source,
          source_url: field.source_url,
          confidence: field.confidence,
          checked_at: field.checked_at?.toISOString?.() ?? field.checked_at ?? null,
          note: field.note,
        }))),
        appSlugs,
        appIdValues,
      ],
    );
    console.log(`Synced field source chunks: ${index + 1}/${fieldChunks.length}`);
  }
}

async function draftMissingProdRows(client, localSlugs) {
  const result = await client.query(
    `
      update public.self_host_apps
      set published = false, updated_at = now()
      where not (slug = any($1::text[]))
        and published = true
      returning slug
    `,
    [localSlugs],
  );

  return result.rows.map((row) => row.slug);
}

async function counts(client) {
  const result = await client.query(
    `
      select
        count(*) filter (where published) as published,
        count(*) filter (where not published) as draft,
        count(*) as total
      from public.self_host_apps
    `,
  );
  return result.rows[0];
}

async function main() {
  const args = parseArgs();
  const localUrl = databaseUrl(args, "local-database-url", ".env.local");
  const prodUrl = databaseUrl(args, "prod-database-url", ".env.database");
  const dryRun = Boolean(args["dry-run"]);
  const chunkSize = numberArg(args, "chunk-size", 250);

  if (localUrl === prodUrl) {
    throw new Error("Local and production DATABASE_URL values are identical. Refusing to sync.");
  }

  const localPool = createPool(localUrl);
  const prodPool = createPool(prodUrl);

  try {
    const state = await localPool.connect().then(async (client) => {
      try {
        return await fetchLocalState(client);
      } finally {
        client.release();
      }
    });

    const prodClient = await prodPool.connect();
    try {
      const before = await counts(prodClient);
      await prodClient.query("begin");

      try {
        await upsertCategories(prodClient, state.categories);

        for (let start = 0; start < state.apps.length; start += chunkSize) {
          const chunk = state.apps.slice(start, start + chunkSize);
          await upsertApps(prodClient, chunk);
          console.log(`${dryRun ? "Checked" : "Synced"} app rows: ${Math.min(start + chunk.length, state.apps.length)}/${state.apps.length}`);
        }

        const { appIds, categoryIds } = await fetchIdMaps(prodClient, state);
        await replaceCategoryLinks(prodClient, state, appIds, categoryIds);
        await upsertSources(prodClient, state, appIds);
        await replaceFieldSources(prodClient, state, appIds);
        const draftedMissing = await draftMissingProdRows(prodClient, state.apps.map((app) => app.slug));

        const after = await counts(prodClient);
        if (dryRun) {
          await prodClient.query("rollback");
        } else {
          await prodClient.query("commit");
        }

        console.log(JSON.stringify({
          dry_run: dryRun,
          local: {
            categories: state.categories.length,
            apps: state.apps.length,
            category_links: state.categoryLinks.length,
            sources: state.sources.length,
            field_sources: state.fieldSources.length,
          },
          prod_before: before,
          prod_after: after,
          drafted_missing_prod_slugs: draftedMissing,
        }, null, 2));
      } catch (error) {
        await prodClient.query("rollback");
        throw error;
      }
    } finally {
      prodClient.release();
    }
  } finally {
    await localPool.end();
    await prodPool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
