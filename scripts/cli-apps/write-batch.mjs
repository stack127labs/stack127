#!/usr/bin/env node

// Store candidates from a saved discovery report JSON (the --out files the
// discover-* scripts write). This makes collection resumable: crawl once,
// write when ready, and re-write after interruptions without re-crawling.

import { parseArgs } from "./lib/args.mjs";
import { readFile } from "node:fs/promises";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

async function main() {
  const args = parseArgs();

  if (!args.file) {
    console.error("Pass --file <report.json> [--source <override-source>]");
    process.exit(1);
  }

  const report = JSON.parse(await readFile(args.file, "utf8"));
  const source = args.source ?? report.source;
  const rawCandidates = Array.isArray(report.candidates) ? report.candidates : [];

  // Reports written by older collector versions may hold raw rows; normalize
  // defensively so every row lands with a dedupe key.
  const candidates = rawCandidates
    .map((row) => (row.dedupe_key ? row : normalizeCandidate(row, {
      source,
      sourceType: row.source_type ?? "directory",
      sourceUrl: row.source_url ?? null,
    })))
    .filter(Boolean);

  console.log(`storing ${candidates.length} candidates from ${args.file} as ${source}`);

  try {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: report.source_url ?? null,
      notes: report.notes ?? `batch write from ${args.file}`,
    }));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`write failed: ${error.message}`);
    await withClient((client) => recordFailedRun(client, { source, sourceUrl: null, error }));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
