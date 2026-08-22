#!/usr/bin/env node

// npm discovery: the registry search API is text-scoped, so discovery runs one
// exhaustive keyword query at a time. The API caps offset+size at 10000 per
// query; any query that hits the cap is recorded in the run notes.

import { parseArgs } from "./lib/args.mjs";
import { fetchJson } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "npm";
const apiBase = "https://registry.npmjs.org/-/v1/search";

const defaultTerms = ["tui", "terminal", "command line", "cli tool"];

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const terms = args.term ? [args.term] : defaultTerms;
  const size = 250;

  const byPackage = new Map();
  const cappedQueries = [];

  try {
    for (const term of terms) {
      let total = Infinity;

      for (let from = 0; from < total && from < 10000; from += size) {
        const data = await fetchJson(`${apiBase}?text=${encodeURIComponent(term)}&size=${size}&from=${from}`, {
          minIntervalMs: 400,
        });
        total = data.total ?? 0;
        const objects = Array.isArray(data.objects) ? data.objects : [];

        for (const object of objects) {
          const pkg = object.package;
          if (!pkg?.name) continue;

          const existing = byPackage.get(pkg.name);
          if (existing) continue;

          const candidate = normalizeCandidate(
            {
              name: pkg.name,
              summary: pkg.description || null,
              website_url: pkg.links?.homepage ?? null,
              repository_url: pkg.links?.repository?.startsWith("git+") === true
                ? pkg.links.repository.slice(4)
                : pkg.links?.repository ?? null,
              latest_version: pkg.version,
              latest_release_at: pkg.date,
              license: pkg.license,
              install_methods: ["npm"],
              source_key: `pkg:${pkg.name}`,
              payload: {
                matched_terms: [term],
                npm_publisher: pkg.publisher?.username ?? null,
                npm_page: `https://www.npmjs.com/package/${pkg.name}`,
              },
            },
            { source, sourceType: "package_registry", sourceUrl: `https://www.npmjs.com/package/${pkg.name}` },
          );
          if (candidate) {
            candidate.payload.matched_terms = [term];
            byPackage.set(pkg.name, candidate);
          }
        }

        process.stdout.write(`npm "${term}": ${from + objects.length}/${total}\r`);
        if (objects.length < size) break;
      }

      if (total > 10000) {
        cappedQueries.push({ term, total, fetched: Math.min(total, 10000) });
      }
      console.log(`\nnpm "${term}" done: total ${total}`);
    }
  } catch (error) {
    console.error(`npm failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: apiBase, error }));
    }
    process.exit(1);
  }

  // Merge matched terms across queries.
  for (const candidate of byPackage.values()) {
    // matched_terms already recorded on first sight; cross-query merges are
    // unnecessary because each package keeps its first matching term.
  }

  const candidates = [...byPackage.values()];
  console.log(`collected ${candidates.length} distinct npm packages`);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates, cappedQueries }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const notes = cappedQueries.length > 0
      ? `keyword-scoped search; API 10000-result ceiling hit for: ${cappedQueries.map((q) => `"${q.term}" (${q.fetched}/${q.total})`).join(", ")}`
      : "keyword-scoped search; no query hit the API ceiling";
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: "https://www.npmjs.com/search",
      notes,
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
