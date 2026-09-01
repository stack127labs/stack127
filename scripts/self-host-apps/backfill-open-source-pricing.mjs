#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  await withClient(async (client) => {
    await client.query("begin");
    try {
      await client.query(
        `
          create temporary table pricing_backfill_candidates on commit drop as
          select id, source_code_url, website_url, license
          from public.self_host_apps
          where published = true
            and self_hosting_status = 'self_hostable'
            and source_model = 'open_source'
            and pricing_model = 'unknown'
            and license is not null
            and lower(license) <> 'unknown'
        `,
      );
      const candidates = await client.query("select count(*)::int as count from pricing_backfill_candidates");

      if (!dryRun) {
        await client.query(
          `
            update public.self_host_apps app
            set pricing_model = 'free', updated_at = now()
            from pricing_backfill_candidates candidate
            where app.id = candidate.id
          `,
        );

        await client.query(
          `
            update public.self_host_apps app
            set data_source_urls = coalesce((
              select array_agg(distinct url order by url)
              from unnest(coalesce(app.data_source_urls, '{}') ||
                array_remove(array[candidate.source_code_url, candidate.website_url], null)::text[]) as values(url)
            ), '{}'),
            data_checked_at = now(),
            data_confidence = 'high',
            updated_at = now()
            from pricing_backfill_candidates candidate
            where app.id = candidate.id
          `,
        );
      }

      if (dryRun) await client.query("rollback");
      else await client.query("commit");
      console.log(JSON.stringify({ dry_run: dryRun, eligible: candidates.rows[0].count, pricing_model: "free" }, null, 2));
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
