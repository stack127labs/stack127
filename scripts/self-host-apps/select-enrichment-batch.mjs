#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const defaultOut = "scripts/self-host-apps/batches/enrichment-batch.json";

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 100);
  const out = args.out ?? defaultOut;

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
            app.repository_url,
            app.docs_url,
            app.install_docs_url,
            app.docker_url,
            app.license,
            app.publisher_name,
            app.publisher_type,
            app.publisher_url,
            app.maintenance_status,
            app.github_owner,
            app.github_repo,
            app.github_stars,
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
            app.platforms,
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
              (app.github_stars is null)::int +
              (app.github_last_commit_at is null)::int +
              (app.compose_support is null)::int +
              (app.requires_database is null)::int +
              (app.ram_mb is null)::int +
              (app.storage_profile = 'unknown')::int +
              (app.icon_url is null)::int
            ) as missing_score
          from public.self_host_apps app
          left join public.self_host_apps_categories_join_table app_category
            on app_category.app_id = app.id
          left join public.self_host_apps_categories category
            on category.id = app_category.category_id
          where app.published = false
            and app.repository_url ~ '^https://github.com/[^/]+/[^/#?]+/?$'
          group by app.id
        )
        select *
        from scored
        order by missing_score desc, name asc
        limit $1
      `,
      [limit],
    );

    const batch = {
      generated_at: new Date().toISOString(),
      selection: {
        limit,
        order: "missing_score desc, name asc",
        source: "local draft self_host_apps rows with GitHub repository URLs",
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
