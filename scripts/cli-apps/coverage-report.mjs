#!/usr/bin/env node

// Write the per-source coverage report for the cli-apps pipeline.

import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { buildCoverage, coverageToMarkdown } from "./lib/coverage.mjs";

async function main() {
  const args = parseArgs();

  const report = await withClient((client) => buildCoverage(client), args["database-url"]);

  if (args.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    const path = await import("node:path");
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`wrote ${args.out}`);
  }

  if (args.markdown) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    const path = await import("node:path");
    await mkdir(path.dirname(args.markdown), { recursive: true });
    await writeFile(args.markdown, coverageToMarkdown(report));
    console.log(`wrote ${args.markdown}`);
  }

  if (!args.out && !args.markdown) {
    console.log(JSON.stringify(report, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
