#!/usr/bin/env node

// Ubuntu discovery: packages.ubuntu.com exposes the full package list for a
// release as one plain-text page. Records pass the documented relevance
// predicate; rejected counts land in the run notes.

import { parseArgs } from "./lib/args.mjs";
import { fetchText } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";
import { isTerminalRelevant } from "./lib/relevance.mjs";

const source = "ubuntu";

function parseAllPackages(html) {
  const packages = [];
  // The all-packages page is a definition list: one dt/dd pair per package.
  const pattern = /<dt><a href='([^']+)'[^>]*>[^<]+<\/a>\s*\(([^)]*)\)[\s\S]*?<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g;

  for (const match of html.matchAll(pattern)) {
    const description = match[3].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!description) continue;
    packages.push({ name: match[1], version: match[2], description });
  }

  return packages;
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const release = args.release ?? "noble";

  let candidates = [];
  let scanned = 0;
  let rejected = 0;

  try {
    // ?format=txt answers 406; the HTML list is the exhaustable surface.
    const html = await fetchText(`https://packages.ubuntu.com/${release}/en/allpackages`, {
      minIntervalMs: 2000,
      timeoutMs: 180000,
    });
    const packages = parseAllPackages(html);

    console.log(`ubuntu ${release}: ${packages.length} package rows`);

    for (const pkg of packages) {
      scanned += 1;

      if (!isTerminalRelevant({ name: pkg.name, description: pkg.description })) {
        rejected += 1;
        continue;
      }

      const candidate = normalizeCandidate(
        {
          name: pkg.name,
          summary: pkg.description,
          install_methods: ["apt"],
          source_key: `ubuntu:${release}:${pkg.name}`,
          payload: { release },
        },
        { source, sourceType: "package_registry", sourceUrl: `https://packages.ubuntu.com/${release}/${pkg.name}` },
      );
      if (candidate) candidates.push(candidate);
    }

    console.log(`relevance filter: kept ${candidates.length}, rejected ${rejected} of ${scanned}`);
  } catch (error) {
    console.error(`ubuntu failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: `https://packages.ubuntu.com/${release}/en/allpackages`, error }));
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
      sourceUrl: `https://packages.ubuntu.com/${release}/en/allpackages`,
      notes: `${release} fully scanned (${scanned}); relevance filter kept ${candidates.length}, rejected ${rejected}; format=txt endpoint answers 406 so the HTML list is used`,
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
