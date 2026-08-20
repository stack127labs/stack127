#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { normalizeCandidate, storeCandidates } from "./lib/candidates.mjs";
import { withClient } from "./lib/db.mjs";

const softwareUrl = "https://selfhst.github.io/cdn/directory/software.json";
const tagsUrl = "https://selfhst.github.io/cdn/directory/tags.json";

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "stack127-self-host-apps-discovery/1.0" },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

function sourceRow(row, tagNames) {
  const tagIds = Array.isArray(row[17]) ? row[17].map(Number) : [];
  const tags = tagIds.map((id) => tagNames.get(id)).filter(Boolean);
  return {
    source_key: `software:${String(row[0] ?? row[2] ?? row[1])}`,
    name: row[1] ?? "",
    slug: row[2] ?? null,
    website_url: row[3] ?? null,
    source_code_url: row[4] ?? null,
    summary: row[5] ?? null,
    categories: tags,
    self_hosting_status: "unknown",
    payload: {
      selfhst_id: String(row[0] ?? ""),
      source_type: row[6] ?? null,
      license_id: row[7] ?? null,
      language_id: row[8] ?? null,
      icon_state: row[9] ?? null,
      theme: row[11] ?? null,
      github_stars: Number(row[13] || 0) || null,
      github_forks: Number(row[14] || 0) || null,
      github_checked_at: row[15] ?? null,
      repository_kind: row[16] ?? null,
      tag_ids: tagIds,
      tags,
      alternative_ids: Array.isArray(row[18]) ? row[18].map(Number) : [],
    },
  };
}

async function main() {
  const args = parseArgs();
  const source = "selfhst";
  const limit = numberArg(args, "limit", Number.MAX_SAFE_INTEGER);
  const [softwareRows, tagRows] = await Promise.all([fetchJson(softwareUrl), fetchJson(tagsUrl)]);
  const tagNames = new Map(tagRows.map((tag) => [Number(tag[0]), tag[1]]));
  const candidates = softwareRows
    .map((row) => normalizeCandidate(sourceRow(row, tagNames), { source, sourceUrl: softwareUrl }))
    .filter(Boolean)
    .slice(0, limit);

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, source_url: softwareUrl, candidates }, null, 2)}\n`);
    console.log(`Wrote ${candidates.length} candidate(s) to ${args.out}`);
  }

  if (args.write) {
    await withClient(async (client) => {
      const result = await storeCandidates(client, candidates, {
        source,
        sourceUrl: softwareUrl,
        notes: `selfh.st discovery with tags from ${tagsUrl}`,
      });
      console.log(JSON.stringify(result, null, 2));
    }, args["database-url"]);
  } else if (!args.out) {
    console.log(JSON.stringify({ candidate_count: candidates.length, candidates: candidates.slice(0, 20) }, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
