#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { collectGitHubFacts } from "./lib/github.mjs";
import { githubUrlFromCandidate, parseAwesomeSource, readSource, writeJsonl } from "./lib/sources.mjs";
import { rewriteSummaryFromInputs, slugify } from "./lib/summary-rules.mjs";

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 100);
  const text = await readSource(args);
  const candidates = parseAwesomeSource(text).slice(0, limit);
  const records = [];

  for (const candidate of candidates) {
    const githubUrl = githubUrlFromCandidate(candidate);
    let record;

    if (githubUrl && !args["no-github"]) {
      record = await collectGitHubFacts(githubUrl);
    } else {
      record = {
        slug: slugify(candidate.slug ?? candidate.name),
        name: candidate.name,
        summary: rewriteSummaryFromInputs({
          name: candidate.name,
          description: candidate.description,
          topics: candidate.tags ?? [],
        }),
        website_url: candidate.website_url ?? candidate.url ?? null,
        repository_url: githubUrl,
        published: false,
        maintenance_status: "unknown",
        docker_support: "unknown",
        database_types: [],
        storage_profile: "unknown",
        platforms: ["web"],
        categories: [],
        summary_source: "awesome_rewrite",
        summary_confidence: "low",
      };
    }

    record.source_payload = {
      source: args.source ?? "awesome",
      source_key: candidate.slug ?? candidate.name ?? candidate.url ?? record.slug,
      source_url: candidate.url ?? githubUrl ?? args.url ?? null,
      payload: candidate,
    };
    records.push(record);
    console.log(`candidate ${record.slug}`);
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
