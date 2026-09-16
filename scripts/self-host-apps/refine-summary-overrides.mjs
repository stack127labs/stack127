#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";
import { validateSummary } from "./lib/summary-rules.mjs";

function mapBySlug(records) {
  return new Map((records ?? []).filter((record) => record?.slug).map((record) => [record.slug, record]));
}

function inputRecords(input) {
  return Array.isArray(input) ? input : input.records ?? input.apps ?? [];
}

async function main() {
  const args = parseArgs();
  if (!args.research || !args.draft || !args.manual || !args.out) {
    throw new Error("Usage: node scripts/self-host-apps/refine-summary-overrides.mjs --research packet.json --draft draft.json --manual summary-manual-overrides.json [--polish summary-polish-overrides.json] [--final summary-final-overrides.json] [--cleanup summary-cleanup-overrides.json] [--linguistic summary-linguistic-overrides.json] [--final-sources summary-final-sources.json] --out review.json");
  }

  const [research, draft, manual, polish, finalOverrides, cleanupOverrides, linguisticOverrides, finalSources] = await Promise.all([
    readFile(args.research, "utf8").then(JSON.parse),
    readFile(args.draft, "utf8").then(JSON.parse),
    readFile(args.manual, "utf8").then(JSON.parse),
    args.polish ? readFile(args.polish, "utf8").then(JSON.parse) : Promise.resolve({}),
    args.final ? readFile(args.final, "utf8").then(JSON.parse) : Promise.resolve({}),
    args.cleanup ? readFile(args.cleanup, "utf8").then(JSON.parse) : Promise.resolve({}),
    args.linguistic ? readFile(args.linguistic, "utf8").then(JSON.parse) : Promise.resolve({}),
    args["final-sources"] ? readFile(args["final-sources"], "utf8").then(JSON.parse) : Promise.resolve({}),
  ]);
  const overrides = { ...manual, ...polish, ...finalOverrides, ...cleanupOverrides, ...linguisticOverrides };
  const draftBySlug = mapBySlug(inputRecords(draft));
  const records = inputRecords(research);
  const apps = [];
  const blocked = [];

  for (const record of records) {
    const proposed = Object.hasOwn(overrides, record.slug) ? overrides[record.slug] : draftBySlug.get(record.slug)?.summary;
    const sourceUrl = finalSources[record.slug] ?? draftBySlug.get(record.slug)?.source_url ?? record.recommended_source_url ?? record.source_urls?.[0] ?? null;
    const validation = validateSummary(proposed);
    const problems = [...validation.errors, ...validation.warnings];
    if (!proposed || !sourceUrl || !/^https?:\/\//i.test(sourceUrl) || problems.length > 0) {
      blocked.push({
        slug: record.slug,
        reasons: [
          ...(!proposed ? ["missing replacement"] : []),
          ...(!sourceUrl || !/^https?:\/\//i.test(sourceUrl) ? ["missing https source"] : []),
          ...problems,
        ],
        summary: proposed ?? null,
      });
      continue;
    }
    if (proposed === record.current_summary) {
      blocked.push({ slug: record.slug, reasons: ["replacement is unchanged"], summary: proposed });
      continue;
    }
    apps.push({
      slug: record.slug,
      review_scope: "partial",
      summary: proposed,
      summary_source: "curated",
      summary_confidence: "high",
      source_url: sourceUrl,
      expected: { summary: record.current_summary },
      data_source_urls: [sourceUrl],
    });
  }

  await writeFile(args.out, `${JSON.stringify({
    reviewed_at: new Date().toISOString(),
    scope: "Summary-only corrections from source-reviewed descriptions and manual editorial overrides.",
    apps,
    blocked,
  }, null, 2)}\n`);
  console.log(JSON.stringify({ research: records.length, apps: apps.length, blocked: blocked.length, output: args.out }, null, 2));
  if (blocked.length > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
