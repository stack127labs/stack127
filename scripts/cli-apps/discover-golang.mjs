#!/usr/bin/env node

// Go Packages discovery: pkg.go.dev keyword search, paginated. Most hits are
// libraries; they are queued anyway and excluded during review, because the
// plan forbids silently discarding records at discovery time.

import { parseArgs } from "./lib/args.mjs";
import { fetchText } from "./lib/http.mjs";
import { decodeEntities } from "./lib/html.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "go_packages";
const searchBase = "https://pkg.go.dev/search";

function parseSearchPage(html) {
  const results = [];
  const seen = new Set();

  for (const match of html.matchAll(/<a[^>]*href="(\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+)"[^>]*>/g)) {
    const path = match[1];
    if (path.startsWith("/search") || path.startsWith("/api")) continue;
    // Module root paths only: skip deep package paths under an already-seen module.
    const parts = path.split("/").filter(Boolean);
    const isGithub = parts[0] === "github.com" || parts[0] === "gitlab.com";
    const modulePath = isGithub ? parts.slice(0, 3).join("/") : parts.slice(0, 2).join("/");
    if (seen.has(modulePath)) continue;
    seen.add(modulePath);

    const snippetMatch = html.match(new RegExp(`href="/${modulePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]{0,600}?<p[^>]*>([\\s\\S]*?)</p>`));
    const summary = snippetMatch
      ? decodeEntities(snippetMatch[1]).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
      : null;

    results.push({ modulePath, summary });
  }

  return results;
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const terms = args.term ? [args.term] : ["tui", "terminal", "command-line"];

  const byModule = new Map();

  try {
    for (const term of terms) {
      for (let page = 1; page <= 5; page += 1) {
        // pkg.go.dev answers HTTP 400 past page 5; that API cap is recorded
        // in the run notes instead of being hidden.
        const html = await fetchText(`${searchBase}?q=${encodeURIComponent(term)}&m=package&page=${page}`, {
          minIntervalMs: 1200,
        });

        const results = parseSearchPage(html);
        if (results.length === 0) break;

        for (const result of results) {
          if (byModule.has(result.modulePath)) continue;

          const candidate = normalizeCandidate(
            {
              name: result.modulePath.split("/").pop(),
              summary: result.summary,
              repository_url: result.modulePath.startsWith("github.com/") || result.modulePath.startsWith("gitlab.com/")
                ? `https://${result.modulePath}`
                : null,
              install_methods: ["go"],
              source_key: `mod:${result.modulePath}`,
              payload: { module_path: result.modulePath, matched_term: term },
            },
            { source, sourceType: "package_registry", sourceUrl: `https://pkg.go.dev/${result.modulePath}` },
          );
          if (candidate) byModule.set(result.modulePath, candidate);
        }

        process.stdout.write(`go "${term}" page ${page}: ${byModule.size} kept\r`);
      }
      console.log(`\ngo "${term}" done`);
    }
  } catch (error) {
    console.error(`go packages failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: searchBase, error }));
    }
    process.exit(1);
  }

  const candidates = [...byModule.values()];
  console.log(`collected ${candidates.length} distinct go modules`);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: searchBase,
      notes: `keyword-scoped pkg.go.dev search over terms: ${terms.join(", ")}; the search endpoint rejects pagination past page 5 per term`,
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
