#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { canonicalUrl, normalizeName } from "./lib/candidates.mjs";
import { withClient } from "./lib/db.mjs";

function indexesFromApps(apps) {
  const bySlug = new Map();
  const byRepo = new Map();
  const byWebsite = new Map();
  const byName = new Map();

  for (const app of apps) {
    bySlug.set(app.slug, app);
    const repo = canonicalUrl(app.source_code_url);
    if (repo && !byRepo.has(repo)) byRepo.set(repo, app);
    const website = canonicalUrl(app.website_url);
    if (website && !byWebsite.has(website)) byWebsite.set(website, app);
    const name = normalizeName(app.name);
    if (name && !byName.has(name)) byName.set(name, app);
  }

  return { bySlug, byRepo, byWebsite, byName };
}

function appDuplicate(candidate, indexes) {
  if (candidate.canonical_source_code_key && indexes.byRepo.has(candidate.canonical_source_code_key)) {
    return { reason: "source_code_url", app: indexes.byRepo.get(candidate.canonical_source_code_key) };
  }
  if (candidate.slug && indexes.bySlug.has(candidate.slug)) return { reason: "slug", app: indexes.bySlug.get(candidate.slug) };
  if (candidate.canonical_website_key && indexes.byWebsite.has(candidate.canonical_website_key)) {
    return { reason: "website_url", app: indexes.byWebsite.get(candidate.canonical_website_key) };
  }
  if (candidate.normalized_name && indexes.byName.has(candidate.normalized_name)) {
    return { reason: "name", app: indexes.byName.get(candidate.normalized_name) };
  }
  return null;
}

function candidateDuplicate(candidate, seen) {
  const checks = [
    ["source_code_url", candidate.canonical_source_code_key],
    ["slug", candidate.slug],
    ["website_url", candidate.canonical_website_key],
    ["name", candidate.normalized_name],
  ];

  for (const [reason, key] of checks) {
    if (!key) continue;
    const bucketKey = `${reason}:${key}`;
    if (seen.has(bucketKey)) return { reason, candidate: seen.get(bucketKey) };
  }

  for (const [reason, key] of checks) {
    if (!key) continue;
    seen.set(`${reason}:${key}`, candidate);
  }

  return null;
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);

  await withClient(async (client) => {
    const appsResult = await client.query(
      "select id, slug, name, website_url, source_code_url from public.open_projects order by slug",
    );
    const candidatesResult = await client.query(
      `
        select *
        from public.open_project_candidates
        where status in ('new', 'needs_review', 'duplicate')
        order by confidence_score desc, last_seen_at desc
        limit $1
      `,
      [limit],
    );

    const appIndexes = indexesFromApps(appsResult.rows);
    const seenCandidates = new Map();
    let appDuplicates = 0;
    let candidateDuplicates = 0;
    let queued = 0;

    await client.query("begin");
    try {
      for (const candidate of candidatesResult.rows) {
        const appMatch = appDuplicate(candidate, appIndexes);
        if (appMatch) {
          appDuplicates += 1;
          await client.query(
            `
              update public.open_project_candidates
              set status = 'duplicate',
                  duplicate_project_id = $2,
                  duplicate_candidate_id = null,
                  duplicate_reason = $3,
                  updated_at = now()
              where id = $1
            `,
            [candidate.id, appMatch.app.id, appMatch.reason],
          );
          continue;
        }

        const candidateMatch = candidateDuplicate(candidate, seenCandidates);
        if (candidateMatch) {
          candidateDuplicates += 1;
          await client.query(
            `
              update public.open_project_candidates
              set status = 'duplicate',
                  duplicate_project_id = null,
                  duplicate_candidate_id = $2,
                  duplicate_reason = $3,
                  updated_at = now()
              where id = $1
            `,
            [candidate.id, candidateMatch.candidate.id, candidateMatch.reason],
          );
          continue;
        }

        queued += 1;
        await client.query(
          `
            update public.open_project_candidates
            set status = 'queued',
                duplicate_project_id = null,
                duplicate_candidate_id = null,
                duplicate_reason = null,
                updated_at = now()
            where id = $1
          `,
          [candidate.id],
        );
      }

      if (args["dry-run"]) {
        await client.query("rollback");
      } else {
        await client.query("commit");
      }
    } catch (error) {
      await client.query("rollback");
      throw error;
    }

    console.log(
      JSON.stringify(
        {
          checked: candidatesResult.rows.length,
          queued,
          app_duplicates: appDuplicates,
          candidate_duplicates: candidateDuplicates,
          dry_run: Boolean(args["dry-run"]),
        },
        null,
        2,
      ),
    );
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
