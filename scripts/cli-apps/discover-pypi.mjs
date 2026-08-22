#!/usr/bin/env node

// PyPI discovery: the simple index lists every project name in one document.
// There is no bulk description API, so records are name-matched against
// terminal-relevant patterns and stored with low-confidence summaries; the
// method and counts land in the run notes.

import { parseArgs } from "./lib/args.mjs";
import { fetchText } from "./lib/http.mjs";
import { normalizeCandidate } from "./lib/normalize.mjs";
import { storeCandidates, recordFailedRun } from "./lib/store.mjs";
import { withClient } from "./lib/db.mjs";

const source = "pypi";

const namePattern = /(^|[-_.])(tui|cli|term|terminal|shell|prompt|repl)([-_.]|$)|terminal|command.?line/i;

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  let candidates = [];
  let scanned = 0;

  try {
    const indexHtml = await fetchText("https://pypi.org/simple/", {
      minIntervalMs: 2000,
      accept: "text/html",
    });

    const names = [...indexHtml.matchAll(/<a href="[^"]*">([^<]+)<\/a>/g)].map((m) => m[1]);
    scanned = names.length;
    console.log(`pypi simple index: ${scanned} projects`);

    for (const rawName of names) {
      const name = rawName.replace(/[-_.]+$/, "");
      if (!namePattern.test(name)) continue;

      const candidate = normalizeCandidate(
        {
          name,
          install_methods: ["pip"],
          source_key: `pkg:${name.toLowerCase()}`,
          payload: {
            match_basis: "project name keyword only; no bulk description API exists",
          },
        },
        { source, sourceType: "package_registry", sourceUrl: `https://pypi.org/project/${name}/` },
      );
      if (candidate) candidates.push(candidate);
    }

    console.log(`name filter kept ${candidates.length} of ${scanned}`);
  } catch (error) {
    console.error(`pypi failed: ${error.message}`);
    if (!dryRun) {
      await withClient((client) => recordFailedRun(client, { source, sourceUrl: "https://pypi.org/simple/", error }));
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
      sourceUrl: "https://pypi.org/simple/",
      notes: `full simple index scanned (${scanned} projects); name-keyword filter kept ${candidates.length}; descriptions unavailable in bulk`,
    }));
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
