#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { readJson, validateRecord } from "./lib/schema.mjs";
import { validateSummary } from "./lib/summary-rules.mjs";

async function auditFile(file) {
  const input = await readJson(file);
  const records = Array.isArray(input) ? input : Array.isArray(input.apps) ? input.apps : [input];
  return records.map((item) => {
    const { record, errors, warnings } = validateRecord(item, { draft: true });
    return { slug: record.slug, errors, warnings };
  });
}

async function auditDatabase(args) {
  return withClient(async (client) => {
    const result = await client.query(
      `
        select slug, summary
        from public.open_projects
        where published = true
          and self_hosting_status = 'self_hostable'
        order by slug
      `,
    );

    return result.rows.map((row) => ({
      slug: row.slug,
      ...validateSummary(row.summary),
    }));
  }, args["database-url"]);
}

async function main() {
  const args = parseArgs();
  const results = args.file ? await auditFile(args.file) : await auditDatabase(args);
  let issueCount = 0;

  for (const result of results) {
    for (const error of result.errors) {
      issueCount += 1;
      console.error(`error ${result.slug}: ${error}`);
    }
    for (const warning of result.warnings) {
      issueCount += 1;
      console.warn(`warning ${result.slug}: ${warning}`);
    }
  }

  if (issueCount > 0) throw new Error(`Summary audit found ${issueCount} issue(s).`);
  console.log(`Summary audit passed: ${results.length} record(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
