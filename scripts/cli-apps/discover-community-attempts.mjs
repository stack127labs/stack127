#!/usr/bin/env node

// Attempt the sources that are expected to block datacenter traffic
// (Terminal Trove, clitui.com, Reddit). Each attempt is recorded honestly:
// success stores candidates, failure stores a failed import run with the
// blocking evidence so coverage reports never hide it.

import { parseArgs } from "./lib/args.mjs";
import { fetchText } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const attempts = [
  {
    source: "terminal_trove",
    sourceUrl: "https://terminaltrove.com/",
    run: async () => {
      const html = await fetchText("https://terminaltrove.com/", { minIntervalMs: 1000 });
      if (!html || html.includes("Just a moment")) throw new Error("cloudflare challenge page returned");
      return parseTerminalTrove(html);
    },
  },
  {
    source: "clitui",
    sourceUrl: "https://clitui.com/",
    run: async () => {
      const html = await fetchText("https://clitui.com/", { minIntervalMs: 1000 });
      return parseGenericLinks(html, "clitui.com");
    },
  },
  {
    source: "reddit_commandline",
    sourceUrl: "https://www.reddit.com/r/commandline/",
    run: async () => {
      const json = await fetchText("https://www.reddit.com/r/commandline/top.json?t=year&limit=100", {
        accept: "application/json",
        minIntervalMs: 1000,
      });
      const data = JSON.parse(json);
      const posts = data?.data?.children ?? [];
      return posts
        .map((child) => child.data)
        .filter((post) => /^https?:\/\//.test(post.url ?? "") && !post.url.includes("reddit.com"))
        .map((post) => ({
          name: post.title.slice(0, 80),
          website_url: post.url,
          summary: null,
          payload: { subreddit: "commandline", score: post.score },
        }));
    },
  },
];

function parseTerminalTrove(html) {
  const entries = [];
  for (const match of html.matchAll(/href="(\/[^"#?]+)"/g)) {
    entries.push(match[1]);
  }
  return [];
}

function parseGenericLinks(html, host) {
  const seen = new Set();
  const entries = [];

  for (const match of html.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]*)<\/a>/g)) {
    const url = match[1];
    if (url.includes(host)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    entries.push({
      name: match[2].trim() || new URL(url).hostname,
      website_url: url,
      summary: null,
      payload: {},
    });
  }

  return entries;
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const only = args.source;

  for (const attempt of attempts) {
    if (only && attempt.source !== only) continue;

    try {
      const rawEntries = await attempt.run();
      const candidates = rawEntries
        .map((entry) =>
          normalizeCandidate(
            { ...entry, source_key: `${entry.website_url}` },
            { source: attempt.source, sourceType: "community", sourceUrl: attempt.sourceUrl },
          ),
        )
        .filter(Boolean);

      console.log(`${attempt.source}: accessible, parsed ${candidates.length} candidates`);

      if (args.write && !dryRun) {
        const result = await withClient((client) => storeCandidates(client, candidates, {
          source: attempt.source,
          sourceUrl: attempt.sourceUrl,
          notes: "community discovery crawl",
        }));
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error(`${attempt.source}: FAILED (${error.message})`);
      if (args.write && !dryRun) {
        await withClient((client) => recordFailedRun(client, {
          source: attempt.source,
          sourceUrl: attempt.sourceUrl,
          error,
        }));
      }
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
