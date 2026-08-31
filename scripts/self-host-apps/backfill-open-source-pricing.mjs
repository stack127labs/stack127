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
            insert into public.self_host_app_field_sources (
              app_id, field_name, source, source_url, confidence, checked_at, note
            )
            select
              candidate.id,
              'pricing_model',
              'reviewed_open_source_license',
              coalesce(candidate.source_code_url, candidate.website_url),
              'high',
              now(),
              'The reviewed ' || candidate.license || ' open-source license permits self-hosting without a software license fee. Paid hosting, support, or enterprise services may still exist.'
            from pricing_backfill_candidates candidate
            on conflict (app_id, field_name) do update set
              source = excluded.source,
              source_url = excluded.source_url,
              confidence = excluded.confidence,
              checked_at = excluded.checked_at,
              note = excluded.note
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
