#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { normalizeCandidate, storeCandidates } from "./lib/candidates.mjs";
import { withClient } from "./lib/db.mjs";
import { readSource } from "./lib/sources.mjs";

const defaultSourceUrl = "https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md";
const skippedHeadings = new Set([
  "anti-features",
  "contributing",
  "external-links",
  "license",
  "list-of-licenses",
  "software",
  "table-of-contents",
]);

function cleanText(value) {
  return String(value ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/[_*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function linksFrom(value) {
  return Array.from(value.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g), (match) => ({
    label: cleanText(match[1]).toLowerCase(),
    url: match[2],
  }));
}

function isSourceCodeUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return ["github.com", "gitlab.com", "codeberg.org", "git.sr.ht"].includes(host);
  } catch {
    return false;
  }
}

function parseEntry(line, category) {
  const match = line.match(/^-\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)(.*?)\s+-\s+(.+)$/);
  if (!match) return null;

  const [, rawName, primaryUrl, nameSuffix, rawDescription] = match;
  const links = linksFrom(rawDescription);
  const sourceLink = links.find(({ label }) => label === "source code" || label === "source");
  const docsLink = links.find(({ label }) => label.includes("documentation") || label === "docs");
  const tokens = Array.from(rawDescription.matchAll(/`([^`]+)`/g), (token) => token[1]);
  const sourceCodeUrl = sourceLink?.url ?? (isSourceCodeUrl(primaryUrl) ? primaryUrl : null);

  return {
    source_key: `${slugify(`${rawName}${nameSuffix}`)}:${slugify(category)}`,
    name: cleanText(`${rawName}${nameSuffix}`).replace(/\s+warning$/i, "").trim(),
    summary: cleanText(rawDescription),
    website_url: primaryUrl,
    source_code_url: sourceCodeUrl,
    docs_url: docsLink?.url ?? null,
    categories: [category, ...tokens],
    self_hosting_status: "unknown",
    payload: {
      category,
      metadata_tokens: tokens,
      markdown: line,
    },
  };
}

function parseCandidates(markdown, sourceUrl) {
  const source = "awesome_selfhosted";
  const candidates = [];
  const seen = new Set();
  let category = null;

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^###\s+(.+)$/);
    if (heading) {
      const name = cleanText(heading[1]).replace(/\s+\(.+?\)\s*$/g, "").trim();
      category = skippedHeadings.has(slugify(name)) ? null : name;
      continue;
    }
    if (!category || !line.startsWith("- [")) continue;

    const raw = parseEntry(line, category);
    const candidate = raw ? normalizeCandidate(raw, { source, sourceUrl }) : null;
    if (!candidate) continue;
    const key = candidate.canonical_source_code_key ?? `${candidate.slug}:${candidate.normalized_name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push(candidate);
  }

  return candidates;
}

async function main() {
  const args = parseArgs();
  const source = "awesome_selfhosted";
  const sourceUrl = args.url ?? defaultSourceUrl;
  const limit = numberArg(args, "limit", Number.MAX_SAFE_INTEGER);
  const markdown = await readSource({ file: args.file, url: args.file ? undefined : sourceUrl });
  const candidates = parseCandidates(markdown, sourceUrl).slice(0, limit);

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, source_url: sourceUrl, candidates }, null, 2)}\n`);
    console.log(`Wrote ${candidates.length} candidate(s) to ${args.out}`);
  }

  if (args.write) {
    await withClient(async (client) => {
      const result = await storeCandidates(client, candidates, {
        source,
        sourceUrl,
        notes: "Awesome Selfhosted candidate discovery",
      });
      console.log(JSON.stringify(result, null, 2));
    }, args["database-url"]);
  } else if (!args.out) {
    console.log(JSON.stringify({ candidate_count: candidates.length, candidates: candidates.slice(0, 20) }, null, 2));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
