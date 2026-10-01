#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { buildInstallOptions } from "./lib/install-options.mjs";
import { installMethods, installOptionsToRow } from "./lib/streamlined-storage.mjs";

function rowValues(row, options, checkedAt) {
  const stored = installOptionsToRow(options, {
    catalogSources: row.install_sources ?? [],
    checkedAt,
  });
  return { app_id: row.id, ...stored };
}

async function upsertRows(client, rows) {
  if (rows.length === 0) return;
  const columns = [
    "app_id",
    "docker_urls",
    "docker_images",
    ...installMethods.filter((method) => method !== "docker").map((method) => `${method}_urls`),
    "options",
    "catalog_sources",
    "source_urls",
    "checked_at",
  ];
  const recordColumns = columns.map((column) => `${column} ${column.endsWith("_urls") || column.endsWith("_images") || column === "source_urls" ? "text[]" : column === "app_id" ? "uuid" : column === "checked_at" ? "timestamptz" : "jsonb"}`);
  const updates = columns.filter((column) => column !== "app_id").map((column) => `${column} = excluded.${column}`).join(",\n          ");
  await client.query(
    `
      insert into public.self_host_app_install_options (${columns.join(", ")})
      select ${columns.map((column) => `item.${column}`).join(", ")}
      from jsonb_to_recordset($1::jsonb) as item(${recordColumns.join(", ")})
      on conflict (app_id) do update set
        ${updates},
        updated_at = now()
    `,
    [JSON.stringify(rows)],
  );
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);
  const apply = Boolean(args.apply);
  const checkedAt = new Date().toISOString();

  const report = await withClient(async (client) => {
    const result = await client.query(
      `
        select
          app.id,
          app.slug,
          app.docker_support,
          app.docker_image,
          app.docker_url,
          app.install_docs_url,
          app.website_url,
          app.source_code_url,
          app.publisher_url,
          app.compose_url,
          coalesce(project.owner, app.github_owner) as github_owner,
          coalesce(project.repo, app.github_repo) as github_repo,
          app.deployment_methods,
          coalesce(install.catalog_sources, '[]'::jsonb) as install_sources
        from public.self_host_apps app
        left join public.github_projects project on project.id = app.github_project_id
        left join public.self_host_app_install_options install on install.app_id = app.id
        where app.published = true
          and app.self_hosting_status = 'self_hostable'
        order by app.popularity_score desc, app.name asc
        limit $1
      `,
      [limit],
    );

    const prepared = result.rows.map((row) => ({
      ...row,
      options: buildInstallOptions(row, row.install_sources ?? []),
    }));
    const storedRows = prepared.map((row) => rowValues(row, row.options, checkedAt));

    if (apply) {
      await client.query("begin");
      try {
        await upsertRows(client, storedRows);
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }

    const options = prepared.flatMap((row) => row.options.map((option) => ({ ...option, app_id: row.id, slug: row.slug })));
    const methodCounts = {};
    for (const option of options) methodCounts[option.method] = (methodCounts[option.method] ?? 0) + 1;
    return {
      mode: apply ? "apply" : "dry-run",
      apps: prepared.length,
      apps_with_options: new Set(options.map((option) => option.app_id)).size,
      options: options.length,
      method_counts: Object.fromEntries(Object.entries(methodCounts).sort((a, b) => a[0].localeCompare(b[0]))),
      docker_source_file_links_excluded: prepared.filter((row) => row.docker_url && /\/(?:blob|tree)\/[^/]+\/(?:.+\/)?(?:Dockerfile|docker-compose[^/]*\.ya?ml|compose[^/]*\.ya?ml)/i.test(row.docker_url) && !row.options.some((option) => option.method === "docker" && option.url === row.docker_url)).length,
      sample: options.slice(0, 20).map(({ slug, method, label, url, image, support_level }) => ({ slug, method, label, url, image, support_level })),
    };
  }, args["database-url"]);

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
