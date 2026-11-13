#!/usr/bin/env node

// Build the files of the public awesome-self-hosted-apps repository from
// production data: a README with a category index, one Markdown table per
// category, and the same rows as CSV and JSON. Read-only; writes only --out.

import path from "node:path";
import { rmSync } from "node:fs";
import { withClient } from "../../self-host-apps/lib/db.mjs";
import { parseArgs, readEnvValues, requireArg, toCsv, writeText } from "./lib.mjs";
import { renderDatasetLicense } from "./render-readme.mjs";

const site = "https://stack127.com";
const labelSuffix = " self-hosted apps";
const statusText = { active: "Active", slow: "Slow", stale: "Stale", archived: "Archived" };
const dockerText = { official: "Official", community: "Community", none: "No" };
const csvColumns = [
  "slug", "name", "summary", "categories", "website_url", "source_code_url", "other_url", "license", "source_model",
  "maintenance_status", "last_commit_date", "docker_support", "stars", "ram_estimate_min_mb", "ram_estimate_max_mb",
];

const appsSql = `
  select app.slug, app.name, app.summary, app.website_url, app.source_code_url, app.docs_url, app.publisher_url, app.source_model,
    coalesce(nullif(project.license_spdx_id, 'NOASSERTION'), app.license) as license,
    app.maintenance_status, app.docker_support, project.stars,
    coalesce(project.last_commit_at, app.source_last_commit_at, app.github_last_commit_at) as last_commit_at,
    estimate.ram_estimate_min_mb, estimate.ram_estimate_max_mb,
    coalesce(array_agg(category.slug order by category.sort_order) filter (where category.slug is not null), '{}') as categories
  from public.self_host_apps app
  left join public.github_projects project on project.id = app.github_project_id
  left join public.self_host_app_resource_estimates estimate on estimate.app_id = app.id
  left join public.self_host_app_category_links link on link.app_id = app.id
  left join public.self_host_app_categories category on category.id = link.category_id
  where app.published and app.self_hosting_status = 'self_hostable'
  group by app.id, project.id, estimate.app_id
  order by lower(app.name), app.slug`;

// Only categories with a published, indexable page are listed, so every heading link works.
const categoriesSql = `
  select category.slug, page.label
  from public.self_host_app_categories category
  join public.stack127_pages page on page.slug = 'self-host-apps/categories/' || category.slug
  where page.is_published and page.is_indexable
  order by category.sort_order, category.slug`;

export const cell = (value) => String(value ?? "").replace(/\s+/g, " ").replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/([<>[\]`*_])/g, "\\$1").trim();
const count = (value) => Number(value).toLocaleString("en-US");
const httpUrl = (value) => (/^https?:\/\/[^\s()<>]+$/.test(value ?? "") ? value : "");

// Long names for the same license, as they appear in reviewed records.
const licenseIds = new Map([
  ["mit license", "MIT"],
  ["apache license 2.0", "Apache-2.0"],
  ["gnu affero general public license v3.0", "AGPL-3.0"],
  ["gnu affero general public license v3.0 only", "AGPL-3.0"],
  ["gnu affero general public license v3.0 or later", "AGPL-3.0-or-later"],
  ["gnu general public license v3.0", "GPL-3.0"],
  ["gnu general public license v3.0 or later", "GPL-3.0-or-later"],
  ["gnu general public license v2.0", "GPL-2.0"],
  ["gnu general public license v2.0 or later", "GPL-2.0-or-later"],
  ["mozilla public license 2.0", "MPL-2.0"],
  ["bsd 3-clause license", "BSD-3-Clause"],
  ["business source license 1.1", "BUSL-1.1"],
  ["elastic license 2.0", "Elastic-2.0"],
  ["server side public license v1", "SSPL-1.0"],
]);

export function licenseText(value) {
  if (!value) return "";
  if (/^(no (software |open-source )?license|license not publicly)/i.test(value)) return "None declared";
  return licenseIds.get(value.trim().toLowerCase()) ?? value.trim();
}

const short = (value, max) => (value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value);

export function normalizeApp(row) {
  return {
    slug: row.slug,
    name: row.name,
    summary: row.summary ?? "",
    categories: row.categories,
    website_url: httpUrl(row.website_url),
    source_code_url: httpUrl(row.source_code_url),
    // Some appliance plugins have neither; their docs or publisher page is the only public link.
    other_url: httpUrl(row.docs_url) || httpUrl(row.publisher_url),
    license: licenseText(row.license),
    source_model: row.source_model === "unknown" ? "" : row.source_model ?? "",
    maintenance_status: row.maintenance_status === "unknown" ? "" : row.maintenance_status ?? "",
    last_commit_date: row.last_commit_at ? new Date(row.last_commit_at).toISOString().slice(0, 10) : "",
    docker_support: row.docker_support === "unknown" ? "" : row.docker_support ?? "",
    stars: row.stars === null || row.stars === undefined ? null : Number(row.stars),
    ram_estimate_min_mb: row.ram_estimate_min_mb === null ? null : Number(row.ram_estimate_min_mb),
    ram_estimate_max_mb: row.ram_estimate_max_mb === null ? null : Number(row.ram_estimate_max_mb),
  };
}

// The directory can hold one project twice, for example an appliance repackage
// such as "binhex-jellyfin" beside "Jellyfin". The list shows each source
// repository once and keeps the plainest entry.
const repositoryKey = (url) => url.toLowerCase().replace(/\.git$/, "").replace(/\/+$/, "");
const repackaged = (name) => /^binhex-|-for-/i.test(name);

export function onePerRepository(apps) {
  const best = new Map();
  const better = (a, b) => Number(repackaged(a.name)) - Number(repackaged(b.name))
    || Number(!a.website_url) - Number(!b.website_url)
    || a.name.length - b.name.length
    || a.slug.localeCompare(b.slug);
  for (const app of apps) {
    if (!app.source_code_url) continue;
    const key = repositoryKey(app.source_code_url);
    if (!best.has(key) || better(app, best.get(key)) < 0) best.set(key, app);
  }
  return apps.filter((app) => !app.source_code_url || best.get(repositoryKey(app.source_code_url)) === app);
}

function appRow(app) {
  const home = app.website_url || app.source_code_url || app.other_url;
  const name = home ? `[${cell(app.name)}](${home})` : cell(app.name);
  const source = app.source_code_url && app.source_code_url !== home ? ` ([source](${app.source_code_url}))` : "";
  return `| ${name}${source} | ${cell(app.summary)} | ${cell(short(app.license, 40))} | ${statusText[app.maintenance_status] ?? ""} | ${dockerText[app.docker_support] ?? ""} | ${app.stars === null ? "" : count(app.stars)} |`;
}

export function renderCategory(category, apps, date) {
  const sorted = [...apps].sort((a, b) => (b.stars ?? -1) - (a.stars ?? -1) || a.name.localeCompare(b.name));
  return `# ${category.name} self-hosted apps

${count(apps.length)} apps you can run on your own server, sorted by GitHub stars. Search and filter them on [stack127](${site}/self-host-apps/categories/${category.slug}).

| App | What it does | License | Status | Docker | Stars |
| --- | --- | --- | --- | --- | ---: |
${sorted.map(appRow).join("\n")}

[Back to all categories](../README.md). Data from ${date}.
`;
}

export function renderReadme(categories, appsByCategory, total, date) {
  const rows = categories.map((category) => `| [${category.name}](categories/${category.slug}.md) | ${count(appsByCategory.get(category.slug).length)} | [stack127.com](${site}/self-host-apps/categories/${category.slug}) |`);
  return `# Awesome self-hosted apps

A list of ${count(total)} apps you can run on your own server, in ${categories.length} categories. Each app shows its license, whether it is still maintained, Docker support, and GitHub stars.

The list is generated from the [stack127 self-hosted apps directory](${site}/self-host-apps), where you can search, filter, and sort the same apps. Data from ${date}.

## Categories

| Category | Apps | Search and filter |
| --- | ---: | --- |
${rows.join("\n")}

An app can be in up to three categories.

## Columns

- **License**: the license the project declares. "None declared" means the repository has no license file, so all rights are reserved by default.
- **Status**: "Active", "Slow", "Stale", or "Archived", from the project's recent commits and releases.
- **Docker**: "Official" when the project publishes its own image, "Community" when someone else does, "No" when we found none.
- **Stars**: GitHub stars. Empty for apps hosted elsewhere or without public source.

An empty cell means we have not verified that fact.

## Data files

- [data/apps.csv](data/apps.csv) and [data/apps.json](data/apps.json) hold every app once, with its categories, links, last commit date, and estimated RAM range.

## Corrections

The files here are generated, so pull requests that edit them are overwritten. To fix a fact or suggest an app, [open an issue](../../issues) with the app name and a link to the official source.

## License

The list and data are available under [CC BY 4.0](LICENSE). Credit stack127 with a link to ${site}.
`;
}

async function main() {
  const args = parseArgs();
  const outDir = path.resolve(String(requireArg(args, "out")));
  const databaseUrl = readEnvValues(".env.database").DATABASE_URL;
  if (!databaseUrl) throw new Error("Production DATABASE_URL is required in .env.database. Local .env.local is intentionally not used.");

  const { apps, categoryRows } = await withClient(async (client) => {
    await client.query("set default_transaction_read_only = on");
    return {
      apps: onePerRepository((await client.query(appsSql)).rows.map(normalizeApp)),
      categoryRows: (await client.query(categoriesSql)).rows,
    };
  }, databaseUrl);

  const categories = categoryRows.map((row) => {
    if (!row.label?.endsWith(labelSuffix)) throw new Error(`Unexpected page label for ${row.slug}: ${row.label}`);
    return { slug: row.slug, name: row.label.slice(0, -labelSuffix.length) };
  });
  if (!categories.length || !apps.length) throw new Error("No published categories or apps to export");

  const appsByCategory = new Map(categories.map((category) => [category.slug, []]));
  for (const app of apps) {
    app.categories = app.categories.filter((slug) => appsByCategory.has(slug));
    for (const slug of app.categories) appsByCategory.get(slug).push(app);
  }
  const listed = apps.filter((app) => app.categories.length);
  const date = new Date().toISOString().slice(0, 10);

  // Start from an empty categories folder so a retired category leaves no stale file.
  rmSync(path.join(outDir, "categories"), { recursive: true, force: true });
  writeText(path.join(outDir, "README.md"), renderReadme(categories, appsByCategory, listed.length, date));
  writeText(path.join(outDir, "LICENSE"), renderDatasetLicense());
  for (const category of categories) {
    writeText(path.join(outDir, "categories", `${category.slug}.md`), renderCategory(category, appsByCategory.get(category.slug), date));
  }
  writeText(path.join(outDir, "data", "apps.csv"), toCsv(listed.map((app) => ({ ...app, categories: app.categories.join("|") })), csvColumns));
  writeText(path.join(outDir, "data", "apps.json"), JSON.stringify({ generated: date, source: `${site}/self-host-apps`, apps: listed }, null, 1));

  console.log(JSON.stringify({ out: outDir, apps: listed.length, withoutCategory: apps.length - listed.length, categories: categories.length }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exit(1);
  });
}
