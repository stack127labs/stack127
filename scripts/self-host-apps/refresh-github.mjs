#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { collectGitHubFacts } from "./lib/github.mjs";

async function rowsToRefresh(client, args) {
  if (args.repo) return [{ slug: args.slug ?? args.repo, repository_url: args.repo }];
  const limit = numberArg(args, "limit", 100);
  const params = [];
  let where = "where repository_url like 'https://github.com/%'";
  if (args.slug) {
    params.push(args.slug);
    where += " and slug = $1";
  }

  const result = await client.query(
    `
      select slug, repository_url
      from public.self_host_apps
      ${where}
      order by github_checked_at nulls first, slug
      limit $${params.length + 1}
    `,
    [...params, limit],
  );
  return result.rows;
}

async function main() {
  const args = parseArgs();

  await withClient(async (client) => {
    const rows = await rowsToRefresh(client, args);

    let refreshed = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        const facts = await collectGitHubFacts(row.repository_url);
        if (!args["dry-run"]) {
          await client.query(
            `
              update public.self_host_apps
              set
                github_owner = $2,
                github_repo = $3,
                github_stars = $4,
                github_latest_release = $5,
                github_latest_release_at = $6,
                github_last_commit_at = $7,
                github_checked_at = $8,
                license = coalesce(license, $9),
                updated_at = now()
              where slug = $1
            `,
            [
              row.slug,
              facts.github_owner,
              facts.github_repo,
              facts.github_stars,
              facts.github_latest_release,
              facts.github_latest_release_at,
              facts.github_last_commit_at,
              facts.github_checked_at,
              facts.license,
            ],
          );
        }
        refreshed += 1;
        console.log(`Refreshed GitHub facts: ${row.slug}`);
      } catch (error) {
        failed += 1;
        console.warn(`warning ${row.slug}: ${error.message}`);
      }
    }

    if (args["dry-run"]) console.log("Dry run OK. No GitHub facts committed.");
    console.log(`GitHub refresh complete: ${refreshed} refreshed, ${failed} failed.`);
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
