#!/usr/bin/env node

import { parseArgs, readCategories, readJson, validateAppContent } from "./lib/content-schema.mjs";

function usage() {
  console.error("Usage: npm run selfhost:validate -- --file content/apps/name.json [--draft]");
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.file) {
    usage();
    process.exit(1);
  }

  const app = await readJson(args.file);
  const categories = await readCategories();
  const result = validateAppContent(app, categories, { strict: !args.draft });

  for (const warning of result.warnings) console.warn(`warning: ${warning}`);
  for (const error of result.errors) console.error(`error: ${error}`);

  if (result.errors.length > 0) {
    console.error(`Validation failed: ${result.errors.length} error(s), ${result.warnings.length} warning(s)`);
    process.exit(1);
  }

  console.log(`Validation passed: ${args.file}`);
  if (result.warnings.length > 0) {
    console.log(`${result.warnings.length} warning(s) need review.`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
