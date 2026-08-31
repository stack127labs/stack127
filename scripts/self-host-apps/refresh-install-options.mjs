#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { buildInstallOptions } from "./lib/install-options.mjs";

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);
  const apply = Boolean(args.apply);

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
          app.compose_url,
          app.github_owner,
          app.github_repo,
          app.deployment_methods,
          coalesce(
            (
              select jsonb_agg(
                jsonb_build_object(
                  'source', app_source.source,
                  'source_url', app_source.source_url,
                  'payload', app_source.payload
                )
                order by app_source.source
              )
              from public.self_host_app_sources app_source
              where app_source.app_id = app.id
                and app_source.source in ('truenas_apps', 'umbrel_apps')
            ),
            '[]'::jsonb
          ) as install_sources
        from public.self_host_apps app
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
    const options = prepared.flatMap((row) => row.options.map((option) => ({ ...option, app_id: row.id, slug: row.slug })));
    let prunedGenericPackageLinks = 0;

    if (apply) {
      await client.query("begin");
      try {
        await client.query(
          `
            insert into public.self_host_app_install_options (
              app_id, method, label, url, image, support_level,
              source_url, note, sort_order, checked_at
            )
            select
              option.app_id,
              option.method,
              option.label,
              option.url,
              option.image,
              option.support_level,
              option.source_url,
              option.note,
              option.sort_order,
              now()
            from jsonb_to_recordset($1::jsonb) as option(
              app_id uuid,
              method text,
              label text,
              url text,
              image text,
              support_level text,
              source_url text,
              note text,
              sort_order integer
            )
            on conflict (app_id, method, url) do update set
              label = excluded.label,
              image = excluded.image,
              support_level = excluded.support_level,
              source_url = excluded.source_url,
              note = excluded.note,
              sort_order = excluded.sort_order,
              checked_at = excluded.checked_at
          `,
          [JSON.stringify(options)],
        );
        const pruned = await client.query(
          `
            delete from public.self_host_app_install_options
            where method = 'docker'
              and url ~ 'github\\.com/[^/]+\\?tab=packages$'
            returning id
          `,
        );
        await client.query("commit");
        prunedGenericPackageLinks = pruned.rowCount ?? 0;
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }

    const methodCounts = {};
    for (const option of options) methodCounts[option.method] = (methodCounts[option.method] ?? 0) + 1;
    return {
      mode: apply ? "apply" : "dry-run",
      apps: prepared.length,
      apps_with_options: new Set(options.map((option) => option.app_id)).size,
      options: options.length,
      pruned_generic_package_links: apply ? prunedGenericPackageLinks : 0,
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
