#!/usr/bin/env node

// Arch Linux discovery: the official package search JSON API, paginated until
// exhausted. Records pass the documented relevance predicate; rejected counts
// land in the run notes.

import { parseArgs } from "./lib/args.mjs";
import { fetchJson } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";
import { isTerminalRelevant } from "./lib/relevance.mjs";

const source = "arch_linux";
const apiBase = "https://archlinux.org/packages/search/json/";

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates = [];
  let scanned = 0;
  let rejected = 0;

  try {
    for (let page = 1; ; page += 1) {
      const data = await fetchJson(`${apiBase}?page=${page}`, { minIntervalMs: 700 });
      const results = Array.isArray(data.results) ? data.results : [];
      scanned += results.length;

      for (const pkg of results) {
        if (!isTerminalRelevant({ name: pkg.pkgname, description: pkg.pkgdesc })) {
          rejected += 1;
          continue;
        }

        const candidate = normalizeCandidate(
          {
            name: pkg.pkgname,
            summary: pkg.pkgdesc,
            website_url: pkg.url || null,
            latest_version: pkg.pkgver ? `${pkg.pkgver}-${pkg.pkgrel}` : null,
            install_methods: ["pacman"],
            license: Array.isArray(pkg.licenses) ? pkg.licenses[0] : null,
            platforms: [pkg.arch].filter(Boolean),
            source_key: `arch:${pkg.pkgname}`,
            payload: {
              repo: pkg.repo,
              arch: pkg.arch,
              last_update: pkg.last_update,
              licenses: pkg.licenses,
            },
          },
          { source, sourceType: "package_registry", sourceUrl: `https://archlinux.org/packages/${pkg.repo}/${pkg.arch}/${pkg.pkgname}/` },
        );
        if (candidate) candidates.push(candidate);
      }

      console.log(`arch page ${page}: ${results.length} rows (scanned ${scanned})`);

      if (results.length === 0 || page >= Number(data.num_pages ?? 1)) break;
    }
  } catch (error) {
    console.error(`arch linux failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: apiBase, error }));
    }
    process.exit(1);
  }

  console.log(`relevance filter: kept ${candidates.length}, rejected ${rejected} of ${scanned}`);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir((await import("node:path")).dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, candidates }, null, 2)}\n`);
  }

  if (args.write && !dryRun) {
    const result = await withClient((client) => storeCandidates(client, candidates, {
      source,
      sourceUrl: apiBase,
      notes: `official repos fully scanned (${scanned}); relevance filter kept ${candidates.length}, rejected ${rejected}`,
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
