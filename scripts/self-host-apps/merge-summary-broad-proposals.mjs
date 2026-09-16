#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";

function inputRecords(input) {
  if (Array.isArray(input)) return input;
  return input.records ?? input.apps ?? [];
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function main() {
  const args = parseArgs();
  if (!args.research || !args.generated || !args.out) {
    throw new Error("Usage: node scripts/self-host-apps/merge-summary-broad-proposals.mjs --research packet.json --generated proposals.json --out review.json [--draft drafts.json]");
  }

  const research = await readJson(args.research);
  const generated = await readJson(args.generated);
  const draft = args.draft ? await readJson(args.draft) : null;
  const overridePaths = [
    "scripts/self-host-apps/summary-broad-manual-overrides.json",
    "scripts/self-host-apps/summary-broad-editorial-overrides-v2.json",
    "scripts/self-host-apps/summary-broad-editorial-overrides-v3.json",
    "scripts/self-host-apps/summary-broad-editorial-overrides-v4.json",
    "scripts/self-host-apps/summary-broad-editorial-overrides-v5.json",
  ];
  const overrides = Object.assign({}, ...await Promise.all(overridePaths.map(readJson)));
  const sourceOverrides = await readJson("scripts/self-host-apps/summary-broad-source-overrides-v1.json");
  const generatedBySlug = new Map(inputRecords(generated).map((record) => [record.slug, record]));
  const draftBySlug = new Map(inputRecords(draft ?? {}).map((record) => [record.slug, record]));
  const apps = [];
  const blocked = [];

  for (const record of inputRecords(research)) {
    const generatedRecord = generatedBySlug.get(record.slug);
    const draftRecord = draftBySlug.get(record.slug);
    const summary = overrides[record.slug] ?? generatedRecord?.summary ?? draftRecord?.summary ?? null;
    const sourceUrl = sourceOverrides[record.slug]
      ?? generatedRecord?.source_url
      ?? draftRecord?.source_url
      ?? record.recommended_source_url
      ?? record.source_urls?.[0]
      ?? null;
    if (!summary || !sourceUrl) {
      blocked.push({
        slug: record.slug,
        current_summary: record.current_summary,
        reason: !summary ? "missing replacement summary" : "missing source URL",
      });
      continue;
    }
    apps.push({
      slug: record.slug,
      summary,
      source_url: sourceUrl,
      expected: { summary: record.current_summary },
      basis: overrides[record.slug] ? "editorial-override" : generatedRecord ? generatedRecord.basis : "official-source-draft",
    });
  }

  await writeFile(args.out, `${JSON.stringify({
    reviewed_at: new Date().toISOString(),
    scope: "Source-linked broad summary cleanup proposals; requires live guarded preparation.",
    apps,
    blocked,
  }, null, 2)}\n`);
  console.log(JSON.stringify({
    research: inputRecords(research).length,
    generated: inputRecords(generated).length,
    overrides: Object.keys(overrides).length,
    apps: apps.length,
    blocked: blocked.length,
    output: args.out,
  }, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
