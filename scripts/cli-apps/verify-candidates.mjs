#!/usr/bin/env node

// Official-source verification for candidate batches.
//
// For every selected candidate this fetches the owning repository's API
// record (GitHub is the official source for code, license, activity, and
// star facts) and probes the candidate's official website. Results are
// written to a batch file for editorial review; nothing is published here.

import { parseArgs } from "./lib/args.mjs";
import { numberArg } from "./lib/args.mjs";
import { fetchJson, fetchText, mapConcurrent } from "./lib/http.mjs";
import { withClient } from "./lib/db.mjs";

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 200);
  const minConfidence = numberArg(args, "min-confidence", 40);
  const concurrency = Number(args.concurrency ?? 4);
  const out = args.out;

  if (!out) {
    console.error("Pass --out <batch.json>");
    process.exit(1);
  }

  const selected = await withClient(async (client) => {
    const result = await client.query(
      `
        select
          id, source, source_url, name, slug, dedupe_key,
          canonical_repo_key, website_url, repository_url, docs_url,
          summary_raw, license_raw, language_raw, stars,
          categories_raw, platforms_raw, install_methods_raw,
          latest_version, latest_release_at, payload
        from public.terminal_app_candidates
        where status in ('discovered', 'needs_review')
          and confidence_score >= $2
          and ($3::boolean = false or canonical_repo_key is null)
        order by confidence_score desc, stars desc nulls last, first_seen_at asc
        limit $1
      `,
      [limit, minConfidence, Boolean(args["website-only"])],
    );
    return result.rows;
  });

  console.log(`verifying ${selected.length} candidates`);

  const verified = await mapConcurrent(selected, concurrency, async (candidate) => {
    const evidence = { github: null, website: null };

    if (candidate.canonical_repo_key?.startsWith("github.com/")) {
      const [owner, repo] = candidate.canonical_repo_key.split("/").slice(1);
      try {
        const data = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`, {
          minIntervalMs: 700,
        });
        evidence.github = {
          full_name: data.full_name,
          description: data.description,
          homepage: data.homepage || null,
          license_spdx_id: data.license?.spdx_id ?? null,
          license_name: data.license?.name ?? null,
          stars: data.stargazers_count,
          language: data.language,
          archived: data.archived,
          pushed_at: data.pushed_at,
          created_at: data.created_at,
          topics: data.topics ?? [],
          open_issues: data.open_issues,
          forks: data.forks_count,
          fetched_at: new Date().toISOString(),
        };
      } catch (error) {
        evidence.github = { error: error.message };
      }
    }

    if (candidate.website_url) {
      try {
        await fetchText(candidate.website_url, { minIntervalMs: 500 });
        evidence.website = { reachable: true, checked_at: new Date().toISOString() };
      } catch (error) {
        evidence.website = { reachable: false, error: error.message.slice(0, 120) };
      }
    }

    return { ...candidate, evidence };
  });

  const clean = verified.map((entry) => (entry.ok ? entry.value : { id: null, verification_error: String(entry.error) }));

  const { writeFile, mkdir } = await import("node:fs/promises");
  const path = await import("node:path");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify({ generated_at: new Date().toISOString(), records: clean }, null, 2)}\n`);

  const githubOk = clean.filter((r) => r.evidence?.github && !r.evidence.github.error).length;
  const siteOk = clean.filter((r) => r.evidence?.website?.reachable).length;
  console.log(`verified: ${clean.length} records, ${githubOk} with fresh GitHub evidence, ${siteOk} websites reachable`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
