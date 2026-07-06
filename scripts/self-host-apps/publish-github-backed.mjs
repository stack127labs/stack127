#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

async function counts(client) {
  const result = await client.query(`
    select
      count(*)::int as total,
      count(*) filter (where published)::int as published,
      count(*) filter (where not published)::int as draft,
      count(*) filter (where repository_url like 'https://github.com/%')::int as github_total,
      count(*) filter (where repository_url like 'https://github.com/%' and published)::int as github_published,
      count(*) filter (where repository_url like 'https://github.com/%' and not published)::int as github_draft,
      count(*) filter (where repository_url is null or repository_url not like 'https://github.com/%')::int as non_github_total,
      count(*) filter (where (repository_url is null or repository_url not like 'https://github.com/%') and published)::int as non_github_published
    from public.self_host_apps
  `);
  return result.rows[0];
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const keepNonGithub = Boolean(args["keep-non-github"]);
  const keepStaleGithub = Boolean(args["keep-stale-github"]);
  const maxAgeHours = numberArg(args, "max-age-hours", 24);

  await withClient(async (client) => {
    await client.query("begin");

    const before = await counts(client);

    const publishedGithub = await client.query(`
      update public.self_host_apps
      set published = true, updated_at = now()
      where repository_url like 'https://github.com/%'
        and github_checked_at >= now() - $1::interval
        and published = false
      returning slug
    `, [`${maxAgeHours} hours`]);

    let draftedStaleGithub = { rowCount: 0, rows: [] };
    if (!keepStaleGithub) {
      draftedStaleGithub = await client.query(`
        update public.self_host_apps
        set published = false, updated_at = now()
        where repository_url like 'https://github.com/%'
          and (github_checked_at is null or github_checked_at < now() - $1::interval)
          and published = true
        returning slug
      `, [`${maxAgeHours} hours`]);
    }

    let draftedNonGithub = { rowCount: 0, rows: [] };
    if (!keepNonGithub) {
      draftedNonGithub = await client.query(`
        update public.self_host_apps
        set published = false, updated_at = now()
        where (repository_url is null or repository_url not like 'https://github.com/%')
          and published = true
        returning slug
      `);
    }

    const after = await counts(client);

    if (dryRun) {
      await client.query("rollback");
    } else {
      await client.query("commit");
    }

    console.log(
      JSON.stringify(
        {
          dry_run: dryRun,
          keep_non_github: keepNonGithub,
          keep_stale_github: keepStaleGithub,
          max_age_hours: maxAgeHours,
          published_github_rows: publishedGithub.rowCount,
          drafted_stale_github_rows: draftedStaleGithub.rowCount,
          drafted_non_github_rows: draftedNonGithub.rowCount,
          before,
          after,
          sample_published_github_slugs: publishedGithub.rows.slice(0, 20).map((row) => row.slug),
          sample_drafted_stale_github_slugs: draftedStaleGithub.rows.slice(0, 20).map((row) => row.slug),
          sample_drafted_non_github_slugs: draftedNonGithub.rows.slice(0, 20).map((row) => row.slug),
        },
        null,
        2,
      ),
    );
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
