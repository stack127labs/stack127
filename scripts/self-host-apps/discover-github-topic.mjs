#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import {
  normalizeCandidate,
  storeCandidates,
} from "./lib/candidates.mjs";
import { withClient } from "./lib/db.mjs";
import { searchTopic } from "./lib/github.mjs";

async function writeCandidates(candidates, { source, sourceUrl, databaseUrl }) {
  await withClient(async (client) => {
    const result = await storeCandidates(client, candidates, {
      source,
      sourceUrl,
      notes: `GitHub topic discovery from ${sourceUrl}`,
    });
    console.log(JSON.stringify(result, null, 2));
  }, databaseUrl);
}

async function main() {
  const args = parseArgs();
  if (!args.topic) {
    throw new Error("Usage: npm run self-host-apps:discover-github-topic -- --topic self-hosted [--limit 100] [--write] [--out file.json]");
  }

  const limit = numberArg(args, "limit", 100);
  const source = "github_topic";
  const sourceUrl = `https://github.com/topics/${encodeURIComponent(args.topic)}`;
  const repositories = await searchTopic(args.topic, { limit });
  const candidates = repositories
    .slice(0, limit)
    .map((repository) => normalizeCandidate({
      source_key: `${args.topic}:${repository.full_name}`,
      source_url: repository.html_url,
      name: repository.name,
      summary: repository.description,
      website_url: repository.homepage,
      source_code_url: repository.html_url,
      categories: repository.topics ?? [],
      self_hosting_status: "unknown",
      payload: repository,
    }, { source, sourceUrl }))
    .filter(Boolean);

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, source_url: sourceUrl, candidates }, null, 2)}\n`);
    console.log(`Wrote ${candidates.length} candidate(s) to ${args.out}`);
  }

  if (args.write) {
    await writeCandidates(candidates, { source, sourceUrl, databaseUrl: args["database-url"] });
  } else if (!args.out) {
    console.log(JSON.stringify({ candidate_count: candidates.length, candidates: candidates.slice(0, 20) }, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
