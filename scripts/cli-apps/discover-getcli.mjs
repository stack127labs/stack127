#!/usr/bin/env node

// getcli.dev discovery: the registry renders every tool card inline on the
// home page; the /cli/* detail pages 404 for direct fetches, so the home page
// is the exhaustable surface.

import { parseArgs } from "./lib/args.mjs";
import { fetchText } from "./lib/http.mjs";
import { decodeEntities } from "./lib/html.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "getcli";
const baseUrl = "https://getcli.dev";

function parseRegistryPage(html) {
  const entries = [];

  for (const match of html.matchAll(
    /href="\/cli\/([^"#?]+)"[^>]*><p class="font-medium">([^<]+)<\/p><p class="mt-1 text-sm text-gray-600">([\s\S]*?)<\/p>/g,
  )) {
    const [, slug, name, description] = match;
    entries.push({
      slug,
      name: decodeEntities(name).trim(),
      summary: decodeEntities(description.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim(),
    });
  }

  return entries;
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates;
  try {
    const registryHtml = await fetchText(`${baseUrl}/`, { minIntervalMs: 400 });
    const entries = parseRegistryPage(registryHtml);

    console.log(`getcli registry: ${entries.length} tool cards`);

    candidates = [];
    for (const entry of entries) {
      const normalized = normalizeCandidate(
        {
          name: entry.name,
          summary: entry.summary,
          source_key: `card:${entry.slug}`,
          payload: { getcli_slug: entry.slug },
        },
        { source, sourceType: "directory", sourceUrl: `${baseUrl}/cli/${entry.slug}` },
      );
      if (normalized) candidates.push(normalized);
    }

    console.log(`parsed ${candidates.length} getcli candidates`);
  } catch (error) {
    console.error(`getcli failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: `${baseUrl}/`, error }));
    }
    process.exit(1);
  }

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: baseUrl,
      notes: "getcli.dev home page registry cards; detail pages 404 for direct fetches",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
