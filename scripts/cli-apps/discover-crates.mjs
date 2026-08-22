#!/usr/bin/env node

// crates.io discovery: keyword-scoped search API queries, each exhausted
// through seek pagination. crates.io asks for ~1 request/second.

import { parseArgs } from "./lib/args.mjs";
import { fetchJson } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "crates_io";
const apiBase = "https://crates.io/api/v1/crates";

const defaultTerms = ["tui", "terminal", "cli"];

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const terms = args.term ? [args.term] : defaultTerms;
  const perPage = 100;

  const byName = new Map();

  try {
    for (const term of terms) {
      let nextSeek = null;
      let total = 0;

      for (let page = 1; ; page += 1) {
        const url = nextSeek
          ? `${apiBase}?q=${encodeURIComponent(term)}&per_page=${perPage}&seek=${encodeURIComponent(nextSeek)}`
          : `${apiBase}?q=${encodeURIComponent(term)}&per_page=${perPage}`;

        const data = await fetchJson(url, {
          minIntervalMs: 1100,
          headers: { "User-Agent": "stack127-terminal-apps-discovery/1.0 (+https://stack127.com)" },
        });

        total = data.meta?.total ?? total;
        const crates = Array.isArray(data.crates) ? data.crates : [];

        for (const crate of crates) {
          if (byName.has(crate.name)) continue;

          const candidate = normalizeCandidate(
            {
              name: crate.name,
              summary: crate.description,
              website_url: crate.homepage ?? crate.documentation ?? null,
              repository_url: crate.repository ?? null,
              latest_version: crate.max_version ?? null,
              latest_release_at: crate.updated_at ?? null,
              license: crate.license ?? null,
              install_methods: ["cargo"],
              source_key: `crate:${crate.name}`,
              payload: {
                matched_term: term,
                downloads: crate.downloads,
                crates_page: `https://crates.io/crates/${crate.name}`,
              },
            },
            { source, sourceType: "package_registry", sourceUrl: `https://crates.io/crates/${crate.name}` },
          );
          if (candidate) byName.set(crate.name, candidate);
        }

        process.stdout.write(`crates "${term}": page ${page}, ${byName.size} kept, total ${total}\r`);

        nextSeek = data.meta?.next_page?.match(/seek=([^&]+)/)?.[1] ?? null;
        if (!nextSeek || crates.length === 0) break;
      }

      console.log(`\ncrates "${term}" done`);
    }
  } catch (error) {
    console.error(`crates.io failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: apiBase, error }));
    }
    process.exit(1);
  }

  const candidates = [...byName.values()];
  console.log(`collected ${candidates.length} distinct crates`);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: "https://crates.io/search",
      notes: `keyword-scoped search over terms: ${terms.join(", ")}`,
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
