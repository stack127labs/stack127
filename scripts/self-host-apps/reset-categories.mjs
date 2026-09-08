#!/usr/bin/env node

// Retain the old entry point so saved commands cannot silently rewrite categories.
console.error(
  "Category reset is retired. Use source-reviewed category corrections through " +
  "apply-qa-overrides.mjs with review_scope=partial, expected categories, and evidence URLs. " +
  "Run its --dry-run before applying. No database connection was opened.",
);
process.exitCode = 1;
