#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { collectGitHubFacts, searchTopic } from "./lib/github.mjs";
import { writeJsonl } from "./lib/sources.mjs";

async function main() {
  const args = parseArgs();
  if (!args.topic) throw new Error("Usage: npm run self-host-apps:import-github-topic -- --topic self-hosted [--limit 50] [--out file.jsonl]");

  const limit = numberArg(args, "limit", 30);
  const repos = await searchTopic(args.topic, { limit });
  const records = [];

  for (const repo of repos.slice(0, limit)) {
    const record = await collectGitHubFacts(repo.html_url);
    record.source_payload = {
      source: "github_topic",
      source_key: `${args.topic}:${repo.full_name}`,
      source_url: repo.html_url,
      payload: repo,
    };
    records.push(record);
    console.log(`candidate ${record.slug} ${repo.html_url}`);
  }

  if (args.out) {
    await writeJsonl(args.out, records);
    console.log(`Wrote ${records.length} candidate(s) to ${args.out}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
