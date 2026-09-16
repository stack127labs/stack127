#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { validateSummary } from "./lib/summary-rules.mjs";

function inputRecords(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.apps)) return input.apps;
  if (Array.isArray(input.records)) return input.records;
  return [input];
}

function artifactIssues(summary) {
  const text = String(summary ?? "");
  const issues = [];
  if (/\[\/?(?:br|b|i|u|url|img|span|color|size)(?:\]|[=\s])/i.test(text)) issues.push("markup");
  if (/<\/?[a-z][^>]*>/i.test(text)) issues.push("html");
  if (/&#(?:x[0-9a-f]+|[0-9]+);|&(?:nbsp|amp|lt|gt|quot|apos);/i.test(text)) issues.push("html_entity");
  if (/https?:\/\/|www\./i.test(text)) issues.push("url");
  if (/\b(?:see here|for examples|required in|click here|learn more|visit)\b/i.test(text)) issues.push("instruction");
  return issues;
}

async function main() {
  const args = parseArgs();
  if (!args.file || !args.out) throw new Error("Usage: node scripts/self-host-apps/prepare-summary-overrides.mjs --file review.json --out prepared.json");
  const input = JSON.parse(await readFile(args.file, "utf8"));
  const proposed = inputRecords(input);
  const prepared = [];
  const blocked = [];

  await withClient(async (client) => {
    const slugs = proposed.map((record) => record.slug).filter(Boolean);
    const result = await client.query(
      "select slug, summary, summary_source, summary_confidence from public.self_host_apps where published = true and self_hosting_status = 'self_hostable' and slug = any($1::text[])",
      [slugs],
    );
    const currentBySlug = new Map(result.rows.map((row) => [row.slug, row]));

    for (const record of proposed) {
      const current = currentBySlug.get(record.slug);
      const problems = [];
      if (!record.slug) problems.push("missing slug");
      if (!current) problems.push("missing published production row");
      if (!record.summary) problems.push("missing replacement summary");
      if (!record.source_url || !/^https?:\/\//i.test(record.source_url)) problems.push("missing https source_url");
      if (!record.expected || record.expected.summary !== current?.summary) problems.push("expected summary is not the current production value");
      if (current && record.summary === current.summary) problems.push("replacement is unchanged");
      const validation = validateSummary(record.summary);
      if (validation.errors.length > 0) problems.push(...validation.errors);
      if (validation.warnings.length > 0) problems.push(...validation.warnings);
      problems.push(...artifactIssues(record.summary));
      if (problems.length > 0) {
        blocked.push({ slug: record.slug ?? null, reasons: [...new Set(problems)] });
        continue;
      }
      prepared.push({
        slug: record.slug,
        review_scope: "partial",
        summary: String(record.summary).trim(),
        summary_source: "curated",
        summary_confidence: "high",
        expected: {
          summary: current.summary,
          summary_source: current.summary_source,
          summary_confidence: current.summary_confidence,
        },
        data_source_urls: [record.source_url],
      });
    }
  }, args["database-url"]);

  await writeFile(args.out, `${JSON.stringify({
    reviewed_at: new Date().toISOString(),
    scope: "Summary-only corrections prepared from source-reviewed descriptions.",
    apps: prepared,
    blocked,
  }, null, 2)}\n`);
  console.log(JSON.stringify({ input: proposed.length, prepared: prepared.length, blocked: blocked.length, output: args.out }, null, 2));
  if (blocked.length > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
