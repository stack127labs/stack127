#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { readJson, validateRecord } from "./lib/schema.mjs";

function usage() {
  console.error("Usage: npm run self-host-apps:validate -- --file app.json [--draft]");
}

async function main() {
  const args = parseArgs();
  if (!args.file) {
    usage();
    process.exit(1);
  }

  const input = await readJson(args.file);
  const { record, errors, warnings } = validateRecord(input, { draft: Boolean(args.draft) });

  for (const warning of warnings) console.warn(`warning: ${warning}`);
  for (const error of errors) console.error(`error: ${error}`);

  if (errors.length > 0) {
    throw new Error(`Validation failed for ${record.slug || args.file}`);
  }

  console.log(`Validation passed: ${record.slug}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
