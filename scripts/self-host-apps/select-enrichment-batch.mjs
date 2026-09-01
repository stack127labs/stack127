#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const defaultOut = "scripts/self-host-apps/batches/enrichment-batch.json";

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.apps)) return input.apps;
  return [input];
}

async function excludedSlugsFromFiles(value) {
  if (!value) return [];
  const files = Array.isArray(value) ? value : String(value).split(",");
  const slugs = new Set();

  for (const file of files.map((item) => item.trim()).filter(Boolean)) {
    const input = JSON.parse(await readFile(file, "utf8"));
    for (const record of recordsFromInput(input)) {
      if (record?.slug) slugs.add(record.slug);
    }
  }

  return [...slugs];
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 100);
  const out = args.out ?? defaultOut;
  const excludeSlugs = await excludedSlugsFromFiles(args["exclude-file"]);

  await withClient(async (client) => {
    const result = await client.query(
      `
        with scored as (
          select
            app.slug,
            app.name,
            app.summary,
            app.icon_url,
            app.website_url,
            app.source_code_url,
            app.source_code_host,
            app.docs_url,
            app.install_docs_url,
            app.docker_url,
            app.license,
            app.license_type,
            app.license_spdx_id,
            app.publisher_name,
            app.publisher_type,
            app.publisher_url,
            app.self_hosting_status,
            app.maintenance_status,
            coalesce(project.owner, app.github_owner) as github_owner,
            coalesce(project.repo, app.github_repo) as github_repo,
            coalesce(project.stars, app.github_stars) as github_stars,
            coalesce(project.latest_release, app.github_latest_release) as github_latest_release,
            coalesce(project.latest_release_at, app.github_latest_release_at) as github_latest_release_at,
            coalesce(project.last_commit_at, app.github_last_commit_at) as github_last_commit_at,
            coalesce(project.checked_at, app.github_checked_at) as github_checked_at,
            app.docker_support,
            app.compose_support,
            app.requires_database,
            app.database_types,
            app.ram_mb,
            app.storage_profile,
            app.surfaces,
            app.summary_source,
            app.summary_confidence,
            coalesce(
              array_agg(category.slug order by category.slug)
                filter (where category.slug is not null),
              array[]::text[]
            ) as categories,
            (
              (app.docs_url is null)::int +
              (app.install_docs_url is null)::int +
              (app.docker_url is null)::int +
              (app.publisher_type = 'unknown')::int +
              (app.maintenance_status = 'unknown')::int +
              (coalesce(project.stars, app.github_stars) is null)::int +
              (coalesce(project.last_commit_at, app.github_last_commit_at) is null)::int +
              (app.compose_support is null)::int +
              (app.requires_database is null)::int +
              (app.ram_mb is null)::int +
              (app.storage_profile = 'unknown')::int +
              (app.icon_url is null)::int
            ) as missing_score
          from public.self_host_apps app
          left join public.self_host_app_category_links app_category
            on app_category.app_id = app.id
          left join public.self_host_app_categories category
            on category.id = app_category.category_id
          left join public.github_projects project
            on project.id = app.github_project_id
          where app.published = false
            and app.self_hosting_status = 'self_hostable'
            and app.source_code_url ~ '^https://github.com/[^/]+/[^/#?]+/?$'
            and not (app.slug = any($2::text[]))
          group by app.id, project.id
        )
        select *
        from scored
        order by missing_score desc, name asc
        limit $1
      `,
      [limit, excludeSlugs],
    );

    const batch = {
      generated_at: new Date().toISOString(),
      selection: {
        limit,
        order: "missing_score desc, name asc",
        source: "local draft self_host_apps rows with GitHub repository URLs",
        excluded_slugs: excludeSlugs.length,
      },
      apps: result.rows,
    };

    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, `${JSON.stringify(batch, null, 2)}\n`);
    console.log(`Wrote ${result.rows.length} apps to ${out}`);
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
