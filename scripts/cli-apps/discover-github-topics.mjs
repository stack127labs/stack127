#!/usr/bin/env node

// GitHub topic discovery via the repository search API.
//
// The search API caps every query at 1000 results, so large topics are split
// into star-range buckets that each stay under the cap. Buckets that still
// return exactly 1000 results are recorded as truncated in the run notes;
// a later run can pass --min-stars/--max-stars to drill into them.

import { parseArgs } from "./lib/args.mjs";
import { fetchJson } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "github_topics";
const apiBase = "https://api.github.com/search/repositories";

const defaultTopics = ["cli", "tui", "terminal", "command-line", "terminal-emulator", "shell"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchPage(query, page, minIntervalMs) {
  const url = `${apiBase}?q=${encodeURIComponent(query)}&per_page=100&page=${page}&sort=stars&order=desc`;
  const data = await fetchJson(url, { minIntervalMs });
  return {
    total: data.total_count ?? 0,
    items: Array.isArray(data.items) ? data.items : [],
  };
}

/**
 * Collect one query exhaustively. Returns items plus whether the API's
 * 1000-result ceiling truncated the query.
 */
async function collectQuery(query, { minIntervalMs = 6500 } = {}) {
  const items = [];
  let total = 0;

  for (let page = 1; page <= 10; page += 1) {
    let result;
    try {
      result = await searchPage(query, page, minIntervalMs);
    } catch (error) {
      return { items, total, truncated: true, rateLimited: true, error: error.message };
    }

    total = result.total;
    items.push(...result.items);

    if (result.items.length < 100) break;
    if (items.length >= 1000) break;
  }

  return { items, total, truncated: items.length >= 1000 && total > 1000, rateLimited: false };
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const topics = args.topic ? [args.topic] : defaultTopics;
  const minIntervalMs = Number(args["min-interval-ms"] ?? 6500);

  // Star buckets keep most queries under the API's 1000-result ceiling.
  const starBuckets = [
    "stars:>3000",
    "stars:1000..3000",
    "stars:400..999",
    "stars:150..399",
    "stars:60..149",
    "stars:20..59",
    "stars:5..19",
    "stars:1..4",
    "stars:0",
  ];

  const candidatesByRepo = new Map();
  const truncations = [];

  try {
    for (const topic of topics) {
      for (const bucket of starBuckets) {
        const query = `topic:${topic} ${bucket}`;
        const { items, total, truncated, rateLimited, error } = await collectQuery(query, { minIntervalMs });

        console.log(`${query}: ${total} total, fetched ${items.length}${truncated ? " TRUNCATED" : ""}${rateLimited ? ` RATE-LIMITED (${error})` : ""}`);

        if (truncated) {
          truncations.push({ query, total, fetched: items.length });
        }

        for (const repo of items) {
          if (repo.fork) continue;

          // One queue row per repository; matched topics accumulate.
          const existing = candidatesByRepo.get(repo.full_name);
          if (existing) {
            existing.payload.matched_topics.push(topic);
            existing.categories_raw = [...new Set([...existing.categories_raw, `topic:${topic}`])];
            continue;
          }

          const candidate = normalizeCandidate(
            {
              name: repo.name,
              summary: repo.description,
              website_url: repo.homepage,
              repository_url: repo.html_url,
              language: repo.language,
              stars: repo.stargazers_count,
              latest_release_at: repo.pushed_at,
              license: repo.license?.spdx_id ?? null,
              categories: [`topic:${topic}`],
              platforms: [],
              source_key: `repo:${repo.full_name}`,
              payload: {
                matched_topics: [topic],
                github_full_name: repo.full_name,
                topics: repo.topics ?? [],
                archived: repo.archived,
                pushed_at: repo.pushed_at,
                created_at: repo.created_at,
                open_issues: repo.open_issues,
                bucket,
              },
            },
            { source, sourceType: "github_topic", sourceUrl: repo.html_url },
          );

          if (candidate) candidatesByRepo.set(repo.full_name, candidate);
        }
      }
    }
  } catch (error) {
    console.error(`github topics failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: apiBase, error }));
    }
    process.exit(1);
  }

  const candidates = [...candidatesByRepo.values()];
  console.log(`collected ${candidates.length} distinct repositories`);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates, truncations }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const notes = truncations.length > 0
      ? `star-bucketed crawl; truncated buckets: ${truncations.map((t) => `${t.query} (${t.fetched}/${t.total})`).join("; ")}`
      : "star-bucketed crawl; no bucket hit the API ceiling";
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: "https://github.com/topics",
      notes,
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
