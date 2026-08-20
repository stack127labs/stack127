#!/usr/bin/env node

import path from "node:path";
import { withClient } from "../../self-host-apps/lib/db.mjs";
import { parseArgs, readEnvValues, toCsv, writeText, isoDate } from "./lib.mjs";
import {
  renderContributing,
  renderDatasetLicense,
  renderDatasetRootReadme,
  renderSelfHostAppsReadme,
} from "./render-readme.mjs";

const publicColumns = [
  "slug",
  "name",
  "summary",
  "category_names",
  "website_url",
  "source_code_url",
  "source_code_host",
  "docs_url",
  "license",
  "license_type",
  "source_model",
  "docker_support",
  "compose_support",
  "requires_database",
  "database_types",
  "surfaces",
  "github_primary_language",
  "github_topics",
];

const categoryJoin = `
  left join lateral (
    select
      coalesce(array_agg(category.slug order by category.sort_order, category.name), array[]::text[]) as category_slugs,
      coalesce(array_agg(category.name order by category.sort_order, category.name), array[]::text[]) as category_names
    from public.open_project_categories_join_table project_category
    join public.open_project_categories category on category.id = project_category.category_id
    where project_category.project_id = app.id
  ) category_set on true
`;

function listValue(value) {
  return Array.isArray(value) ? value.filter(Boolean).join("|") : "";
}

function booleanValue(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  return "";
}

function numberValue(value) {
  return value === null || value === undefined ? "" : Number(value);
}

function normalizeRow(row) {
  return {
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    category_slugs: listValue(row.category_slugs),
    category_names: listValue(row.category_names),
    website_url: row.website_url,
    source_code_url: row.source_code_url,
    source_code_host: row.source_code_host,
    docs_url: row.docs_url,
    install_docs_url: row.install_docs_url,
    docker_url: row.docker_url,
    license: row.license,
    license_type: row.license_type,
    source_model: row.source_model,
    publisher_name: row.publisher_name,
    publisher_type: row.publisher_type,
    publisher_url: row.publisher_url,
    maintenance_status: row.maintenance_status,
    github_latest_release: row.github_latest_release,
    github_latest_release_at: isoDate(row.github_latest_release_at),
    github_last_commit_at: isoDate(row.github_last_commit_at),
    github_checked_at: isoDate(row.github_checked_at),
    docker_support: row.docker_support,
    compose_support: booleanValue(row.compose_support),
    requires_database: booleanValue(row.requires_database),
    database_types: listValue(row.database_types),
    ram_mb: numberValue(row.ram_mb),
    storage_profile: row.storage_profile,
    surfaces: listValue(row.surfaces),
    github_primary_language: row.github_primary_language,
    github_topics: listValue(row.github_topics),
  };
}

function productionDatabaseUrl(args) {
  if (args["database-url"]) return args["database-url"];

  const envValues = readEnvValues(".env.database");
  const databaseUrl = envValues.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Production DATABASE_URL is required for dataset exports. Add it to .env.database or pass --database-url. Local .env.local is intentionally not used.",
    );
  }

  return databaseUrl;
}

async function exportSelfHostApps({ outDir, databaseUrl }) {
  const rows = await withClient(async (client) => {
    const result = await client.query(
      `
        select
          app.slug,
          app.name,
          app.summary,
          category_set.category_slugs,
          category_set.category_names,
          app.website_url,
          app.source_code_url,
          app.source_code_host,
          app.docs_url,
          app.install_docs_url,
          app.docker_url,
          app.license,
          app.license_type,
          app.source_model,
          app.publisher_name,
          app.publisher_type,
          app.publisher_url,
          app.maintenance_status,
          app.github_latest_release,
          app.github_latest_release_at,
          app.github_last_commit_at,
          app.github_checked_at,
          app.docker_support,
          app.compose_support,
          app.requires_database,
          app.database_types,
          app.ram_mb,
          app.storage_profile,
          app.surfaces,
          app.github_primary_language,
          app.github_topics,
          app.updated_at
        from public.open_projects app
        ${categoryJoin}
        where app.published = true
          and app.self_hosting_status = 'self_hostable'
        order by lower(app.name), app.slug
      `,
    );

    return result.rows;
  }, databaseUrl);

  const normalizedRows = rows.map(normalizeRow);
  const generatedAt = new Date().toISOString();
  const updatedAt =
    rows.reduce((latest, row) => {
      const timestamp = new Date(row.updated_at).getTime();
      return Number.isFinite(timestamp) && timestamp > latest ? timestamp : latest;
    }, 0) || Date.now();
  const updatedAtIso = new Date(updatedAt).toISOString();

  const datasetMeta = {
    generatedAt,
    rowCount: normalizedRows.length,
    updatedAt: updatedAtIso,
  };

  const rootMeta = {
    generatedAt,
    datasets: [
      {
        title: "Self-Host Apps",
        path: "self-host-apps",
        description: "Published Stack127 self-host app directory records.",
        rowCount: normalizedRows.length,
        updatedAt: updatedAtIso,
      },
    ],
  };

  writeText(path.join(outDir, "README.md"), renderDatasetRootReadme(rootMeta));
  writeText(path.join(outDir, "LICENSE"), renderDatasetLicense());
  writeText(path.join(outDir, "CONTRIBUTING.md"), renderContributing());
  writeText(path.join(outDir, "self-host-apps", "README.md"), renderSelfHostAppsReadme(datasetMeta));
  writeText(path.join(outDir, "self-host-apps", "apps.csv"), toCsv(normalizedRows, publicColumns));

  console.log(`Exported self-host-apps dataset: ${normalizedRows.length} row(s) -> ${outDir}`);
}

async function main() {
  const args = parseArgs();
  const surface = args.surface ?? "self-host-apps";
  const outDir = path.resolve(String(args.out ?? "/tmp/stack127-datasets"));

  if (surface !== "self-host-apps") {
    throw new Error(`Unsupported dataset surface: ${surface}`);
  }

  await exportSelfHostApps({
    outDir,
    databaseUrl: productionDatabaseUrl(args),
  });
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
