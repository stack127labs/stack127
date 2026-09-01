#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import pg from "pg";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { appColumns, appRecordsetColumns } from "./lib/schema.mjs";

const { Pool } = pg;

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")];
      }),
  );
}

function databaseUrl(args, key, filePath) {
  const value = args[key] ?? readEnvFile(filePath).DATABASE_URL;
  if (!value) throw new Error(`DATABASE_URL is required in ${filePath} or --${key}.`);
  return value;
}

function createPool(connectionString) {
  return new Pool({ connectionString, connectionTimeoutMillis: 15000, idleTimeoutMillis: 10000, max: 4, query_timeout: 120000 });
}

function chunks(rows, size) {
  const result = [];
  for (let index = 0; index < rows.length; index += size) result.push(rows.slice(index, index + size));
  return result;
}

async function fetchLocalState(client) {
  const [categories, apps, links, resources, installs, githubProjects] = await Promise.all([
    client.query("select slug, name, icon_key, sort_order from public.self_host_app_categories order by sort_order, slug"),
    client.query(`select ${appColumns.join(", ")} from public.self_host_apps order by slug`),
    client.query(`select app.slug app_slug, category.slug category_slug from public.self_host_app_category_links link join public.self_host_apps app on app.id = link.app_id join public.self_host_app_categories category on category.id = link.category_id order by app.slug, category.slug`),
    client.query(`select app.slug app_slug, resource.* from public.self_host_app_resource_estimates resource join public.self_host_apps app on app.id = resource.app_id order by app.slug`),
    client.query(`select app.slug app_slug, install.* from public.self_host_app_install_options install join public.self_host_apps app on app.id = install.app_id order by app.slug`),
    client.query("select * from public.github_projects order by owner, repo"),
  ]);
  return {
    categories: categories.rows,
    apps: apps.rows,
    categoryLinks: links.rows,
    resourceEstimates: resources.rows,
    installOptions: installs.rows,
    githubProjects: githubProjects.rows,
  };
}

async function upsertCategories(client, categories) {
  for (const category of categories) {
    await client.query(
      `insert into public.self_host_app_categories (slug, name, icon_key, sort_order)
       values ($1, $2, $3, $4)
       on conflict (slug) do update set name = excluded.name, icon_key = excluded.icon_key, sort_order = excluded.sort_order, updated_at = now()`,
      [category.slug, category.name, category.icon_key, category.sort_order],
    );
  }
}

async function upsertApps(client, apps) {
  const updates = appColumns.filter((column) => column !== "slug" && column !== "github_project_id").map((column) => `${column} = excluded.${column}`).join(",\n          ");
  const rows = apps.map((app) => ({ ...app, github_project_id: null }));
  await client.query(
    `insert into public.self_host_apps (${appColumns.join(", ")})
     select ${appColumns.map((column) => `item.${column}`).join(", ")}
     from jsonb_to_recordset($1::jsonb) as item(${appRecordsetColumns.join(", ")})
     on conflict (slug) do update set ${updates}, updated_at = now()`,
    [JSON.stringify(rows)],
  );
}

async function appAndCategoryIds(client, state) {
  const [apps, categories] = await Promise.all([
    client.query("select id, slug from public.self_host_apps where slug = any($1::text[])", [state.apps.map((app) => app.slug)]),
    client.query("select id, slug from public.self_host_app_categories where slug = any($1::text[])", [state.categories.map((category) => category.slug)]),
  ]);
  return {
    appIds: new Map(apps.rows.map((row) => [row.slug, row.id])),
    categoryIds: new Map(categories.rows.map((row) => [row.slug, row.id])),
  };
}

async function replaceCategoryLinks(client, state, maps) {
  const ids = [...maps.appIds.values()];
  if (ids.length > 0) await client.query("delete from public.self_host_app_category_links where app_id = any($1::uuid[])", [ids]);
  for (const link of state.categoryLinks) {
    const appId = maps.appIds.get(link.app_slug);
    const categoryId = maps.categoryIds.get(link.category_slug);
    if (!appId || !categoryId) continue;
    await client.query("insert into public.self_host_app_category_links (app_id, category_id) values ($1, $2) on conflict do nothing", [appId, categoryId]);
  }
}

async function upsertGithubProjects(client, projects) {
  for (const project of projects) {
    await client.query(
      `insert into public.github_projects (
        owner, repo, full_name, repository_url, repo_id, node_id, owner_type,
        stars, forks, watchers, open_issues, primary_language, languages, topics,
        created_at, updated_at, pushed_at, default_branch, repo_size_kb, archived,
        disabled, is_fork, is_template, latest_release, latest_release_at,
        last_commit_at, license_spdx_id, checked_at, source_url
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb,
        $14::text[], $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
      on conflict (owner, repo) do update set
        full_name = excluded.full_name, repository_url = excluded.repository_url,
        repo_id = excluded.repo_id, node_id = excluded.node_id, owner_type = excluded.owner_type,
        stars = excluded.stars, forks = excluded.forks, watchers = excluded.watchers,
        open_issues = excluded.open_issues, primary_language = excluded.primary_language,
        languages = excluded.languages, topics = excluded.topics, created_at = excluded.created_at,
        updated_at = excluded.updated_at, pushed_at = excluded.pushed_at, default_branch = excluded.default_branch,
        repo_size_kb = excluded.repo_size_kb, archived = excluded.archived, disabled = excluded.disabled,
        is_fork = excluded.is_fork, is_template = excluded.is_template, latest_release = excluded.latest_release,
        latest_release_at = excluded.latest_release_at, last_commit_at = excluded.last_commit_at,
        license_spdx_id = excluded.license_spdx_id, checked_at = excluded.checked_at,
        source_url = excluded.source_url, row_updated_at = now()`,
      [
        project.owner, project.repo, project.full_name, project.repository_url, project.repo_id,
        project.node_id, project.owner_type, project.stars, project.forks, project.watchers,
        project.open_issues, project.primary_language, JSON.stringify(project.languages ?? {}),
        project.topics ?? [], project.created_at, project.updated_at, project.pushed_at,
        project.default_branch, project.repo_size_kb, project.archived, project.disabled,
        project.is_fork, project.is_template, project.latest_release, project.latest_release_at,
        project.last_commit_at, project.license_spdx_id, project.checked_at, project.source_url,
      ],
    );
  }
}

async function linkGithubProjects(client, apps) {
  for (const app of apps) {
    if (!app.github_owner || !app.github_repo) continue;
    await client.query(
      `update public.self_host_apps app set github_project_id = project.id, updated_at = now()
       from public.github_projects project where app.slug = $1 and lower(project.owner) = lower($2) and lower(project.repo) = lower($3)`,
      [app.slug, app.github_owner, app.github_repo],
    );
  }
}

async function replaceResources(client, state, appIds) {
  const ids = [...appIds.values()];
  if (ids.length > 0) await client.query("delete from public.self_host_app_resource_estimates where app_id = any($1::uuid[])", [ids]);
  for (const row of state.resourceEstimates) {
    const columns = Object.keys(row).filter((column) => column !== "app_slug" && column !== "app_id" && !["created_at", "updated_at"].includes(column));
    const values = [appIds.get(row.app_slug), ...columns.map((column) => row[column])];
    if (!values[0]) continue;
    await client.query(
      `insert into public.self_host_app_resource_estimates (app_id, ${columns.join(", ")}) values ($1, ${columns.map((column, index) => `$${index + 2}${column.endsWith("_urls") ? "::text[]" : column === "checked_at" ? "::timestamptz" : ""}`).join(", ")})`,
      values,
    );
  }
}

async function replaceInstalls(client, state, appIds) {
  const ids = [...appIds.values()];
  if (ids.length > 0) await client.query("delete from public.self_host_app_install_options where app_id = any($1::uuid[])", [ids]);
  for (const row of state.installOptions) {
    const columns = Object.keys(row).filter((column) => column !== "app_slug" && column !== "app_id" && !["created_at", "updated_at"].includes(column));
    const values = [appIds.get(row.app_slug), ...columns.map((column) => row[column])];
    if (!values[0]) continue;
    await client.query(
      `insert into public.self_host_app_install_options (app_id, ${columns.join(", ")}) values ($1, ${columns.map((column, index) => `$${index + 2}${column.endsWith("_urls") || column.endsWith("_images") || column === "source_urls" ? "::text[]" : column === "checked_at" ? "::timestamptz" : column === "options" || column === "catalog_sources" ? "::jsonb" : ""}`).join(", ")})`,
      values,
    );
  }
}

async function draftMissingProdRows(client, localSlugs) {
  const result = await client.query(
    "update public.self_host_apps set published = false, updated_at = now() where not (slug = any($1::text[])) and published = true returning slug",
    [localSlugs],
  );
  return result.rows.map((row) => row.slug);
}

async function main() {
  const args = parseArgs();
  if (!args["confirm-reviewed-push"]) throw new Error("Pass --confirm-reviewed-push to push reviewed local data to production.");
  const localPool = createPool(databaseUrl(args, "local-database-url", ".env.local"));
  const prodPool = createPool(databaseUrl(args, "prod-database-url", ".env.database"));
  const localClient = await localPool.connect();
  const prodClient = await prodPool.connect();
  try {
    const state = await fetchLocalState(localClient);
    await prodClient.query("begin");
    await upsertCategories(prodClient, state.categories);
    await upsertApps(prodClient, state.apps);
    const maps = await appAndCategoryIds(prodClient, state);
    await replaceCategoryLinks(prodClient, state, maps);
    await upsertGithubProjects(prodClient, state.githubProjects);
    await linkGithubProjects(prodClient, state.apps);
    await replaceResources(prodClient, state, maps.appIds);
    await replaceInstalls(prodClient, state, maps.appIds);
    const drafted = args["draft-missing"]
      ? await draftMissingProdRows(prodClient, state.apps.map((app) => app.slug))
      : [];
    if (args["dry-run"]) await prodClient.query("rollback");
    else await prodClient.query("commit");
    console.log(JSON.stringify({ mode: args["dry-run"] ? "dry-run" : "applied", apps: state.apps.length, categories: state.categories.length, github_projects: state.githubProjects.length, resource_rows: state.resourceEstimates.length, install_rows: state.installOptions.length, drafted_missing: drafted }, null, 2));
  } catch (error) {
    try { await prodClient.query("rollback"); } catch {}
    throw error;
  } finally {
    localClient.release();
    prodClient.release();
    await localPool.end();
    await prodPool.end();
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
