#!/usr/bin/env node

// CLIs.dev discovery: one API call exposes every record in their catalogue.

import { parseArgs } from "./lib/args.mjs";
import { fetchJson } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "clis_dev";
const apiUrl = "https://clis.dev/api/clis";

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates;
  try {
    const data = await fetchJson(apiUrl, { minIntervalMs: 500 });
    const clis = Array.isArray(data?.clis) ? data.clis : [];

    candidates = clis
      .map((item) =>
        normalizeCandidate(
          {
            name: item.name ?? item.slug,
            summary: item.description,
            website_url: item.website,
            repository_url: item.github,
            language: item.language,
            stars: item.stars,
            categories: [item.category].filter(Boolean),
            install_hint: item.install,
            source_key: `${apiUrl}#${item.slug}`,
            payload: {
              slug: item.slug,
              category: item.category,
              is_tui: item.is_tui,
              is_official: item.is_official,
              vendor_name: item.vendor_name,
              has_mcp: item.has_mcp,
              source_type: item.source_type,
            },
          },
          { source, sourceType: "directory", sourceUrl: `https://clis.dev/cli/${item.slug}` },
        ),
      )
      .filter(Boolean);

    console.log(`clis.dev api: ${data?.count ?? clis.length} records, parsed ${candidates.length}`);
  } catch (error) {
    console.error(`clis.dev failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: apiUrl, error }));
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
      sourceUrl: apiUrl,
      notes: "CLIs.dev catalogue API",
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
