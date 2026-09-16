#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";

const clauseBreak = /,\s+(?:(?:This|It|For example|Note|When|Once|Please|But|If|After|Before|You|Most|Designed|Supports|Requires|Each|Use|Available|Also|There|Then|Upon|Inside|Outside|Attention)\b|(?:[A-Z][A-Za-z0-9+.-]*|[a-z][a-z-]*)\s+(?:is|are|was|were|has|have|can|will|allows|provides|supports|includes|uses|works|runs|requires|designed|built|created|offers|lets|helps|contains|exposes|connects|controls|monitors|tracks|manages|generates|hosts)\b)/i;

const artifact = /[\u200B-\u200F\u202A-\u202E]|`|\*\*|\[[^\]]+\]\([^)]*\)|<\/?[a-z][^>]*>|&#(?:x[0-9a-f]+|[0-9]+);|https?:\/\/|\b(?:dockerfile|docker[- ]compose\.(?:ya?ml)|locustfile(?:\.py)?|the readme|this repo|this repository|note\s*:)|\/(?:mnt|app|config|data)\//i;

const instruction = /\b(?:see here|for examples|required in|click here|learn more|visit|how to run|quick setup|environment variables?|setup process|before installing|after installing|please)\b/i;

const dangling = /(?:,|;|\s)\s*(?:and|or|the|a|an|your|when|which|that|it|this|for|to|with|from|of|like|via|because|including|such as|is|are|has|have|can|will|requires|provides|supports)\s*[.!?]*$/i;

function decodeEntities(value) {
  return String(value ?? "")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&(nbsp|amp|lt|gt|quot|apos);/gi, (_, name) => ({
      nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
    })[name.toLowerCase()]);
}

function plainText(value) {
  return decodeEntities(value)
    .replace(/[\u200B-\u200F\u202A-\u202E]/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[\/?(?:br|b|i|u|url|img|span|color|size)(?:=[^\]]+)?\]/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/`{1,3}/g, "")
    .replace(/[*_~>#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value) {
  let text = plainText(value).replace(/\s*[,;:]\s*$/g, "").trim();
  if (!text) return "";
  if (!/[.!?]$/.test(text)) text += ".";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function currentCore(value) {
  let text = plainText(value);
  text = text.split(/(?<=[.!?])\s+/)[0] ?? text;
  text = text.split(clauseBreak)[0];
  text = text.split(/\s+(?=(?:This is|It is|It can|ATTENTION|Quick setup|How to run|Environment Variables?\b|Setup Process|Installation|Configuration)\b)/i)[0];
  return normalize(text);
}

function isUseful(value) {
  const text = String(value ?? "");
  const words = text.split(/\s+/).filter(Boolean);
  return words.length >= 8
    && text.length >= 35
    && !artifact.test(text)
    && !instruction.test(text)
    && !dangling.test(text)
    && !/^\s*(?:this|the|a|an)\s+(?:docker|container|package|image)\b/i.test(text);
}

function needsReview(value) {
  return clauseBreak.test(String(value ?? ""))
    || artifact.test(String(value ?? ""))
    || instruction.test(String(value ?? ""))
    || dangling.test(String(value ?? ""))
    || /;\s+/.test(String(value ?? ""));
}

function inputRecords(input) {
  return Array.isArray(input) ? input : input.records ?? input.apps ?? [];
}

async function main() {
  const args = parseArgs();
  if (!args.research || !args.draft || !args.out) {
    throw new Error("Usage: node scripts/self-host-apps/build-summary-broad-proposals.mjs --research packet.json --draft draft.json --out proposals.json");
  }

  const [research, draft] = await Promise.all([
    readFile(args.research, "utf8").then(JSON.parse),
    readFile(args.draft, "utf8").then(JSON.parse),
  ]);
  const draftBySlug = new Map(inputRecords(draft).map((record) => [record.slug, record]));
  const apps = [];
  const blocked = [];

  for (const record of inputRecords(research)) {
    if (!needsReview(record.current_summary)) continue;
    const current = normalize(record.current_summary);
    const core = currentCore(record.current_summary);
    const sourceDraft = normalize(draftBySlug.get(record.slug)?.summary);
    const summary = isUseful(core) ? core : isUseful(sourceDraft) ? sourceDraft : core || sourceDraft;
    const sourceUrl = draftBySlug.get(record.slug)?.source_url ?? record.recommended_source_url ?? record.source_urls?.[0] ?? null;
    if (!summary || summary === current || !sourceUrl) {
      blocked.push({ slug: record.slug, current_summary: record.current_summary, core, source_draft: sourceDraft, reason: !sourceUrl ? "missing source" : "no useful changed replacement" });
      continue;
    }
    apps.push({ slug: record.slug, summary, source_url: sourceUrl, expected: { summary: record.current_summary }, basis: isUseful(core) ? "current-summary-core" : "official-source-draft" });
  }

  await writeFile(args.out, `${JSON.stringify({
    reviewed_at: new Date().toISOString(),
    scope: "Source-linked broad summary cleanup proposals; requires editorial review and live guarded preparation.",
    apps,
    blocked,
  }, null, 2)}\n`);
  console.log(JSON.stringify({ input: inputRecords(research).length, proposals: apps.length, blocked: blocked.length, output: args.out }, null, 2));
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
