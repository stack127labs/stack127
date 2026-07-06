#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const weakDockerPattern =
  /github\.com\/.+\/(blob|tree)\/|github\.com\/.+#readme|devcontainer|dev-container|compose\.dev|docker-compose\.dev|\/test|testing|ci|e2e|vendor|\.github|\.ddev/i;

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  await withClient(async (client) => {
    await client.query("begin");

    try {
      const databaseResult = await client.query(
        `
          update public.self_host_apps app
          set
            requires_database = null,
            database_types = '{}'::text[],
            updated_at = now()
          where exists (
            select 1
            from public.self_host_apps_field_sources source
            where source.app_id = app.id
              and source.field_name in ('requires_database', 'database_types')
              and source.source = 'version127_enrichment'
          )
          returning slug
        `,
      );

      const dockerResult = await client.query(
        `
          update public.self_host_apps
          set
            docker_url = null,
            docker_support = case
              when docker_support = 'official' then 'unknown'
              else docker_support
            end,
            compose_support = null,
            updated_at = now()
          where docker_url ~* $1
          returning slug
        `,
        [weakDockerPattern.source],
      );

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
          select id, field_name, 'version127_sanitizer', null, 'unknown', now(), 'Removed risky inferred database facts before publication.'
          from public.self_host_apps
          cross join (values ('requires_database'), ('database_types')) fields(field_name)
          where slug = any($1::text[])
          on conflict (app_id, field_name) do update set
            source = excluded.source,
            source_url = excluded.source_url,
            confidence = excluded.confidence,
            checked_at = excluded.checked_at,
            note = excluded.note
        `,
        [databaseResult.rows.map((row) => row.slug)],
      );

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
          select id, field_name, 'version127_sanitizer', null, 'unknown', now(), 'Removed weak Docker URL proof before publication.'
          from public.self_host_apps
          cross join (values ('docker_url'), ('docker_support'), ('compose_support')) fields(field_name)
          where slug = any($1::text[])
          on conflict (app_id, field_name) do update set
            source = excluded.source,
            source_url = excluded.source_url,
            confidence = excluded.confidence,
            checked_at = excluded.checked_at,
            note = excluded.note
        `,
        [dockerResult.rows.map((row) => row.slug)],
      );

      if (dryRun) {
        await client.query("rollback");
      } else {
        await client.query("commit");
      }

      console.log(JSON.stringify({
        dry_run: dryRun,
        database_facts_reset: databaseResult.rowCount,
        weak_docker_links_reset: dockerResult.rowCount,
      }, null, 2));
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
