#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import {
  absoluteUrl,
  canonicalSourceCodeUrl,
  normalizeCandidate,
  storeCandidates,
} from "./lib/candidates.mjs";
import { withClient } from "./lib/db.mjs";

const blockedNames = new Set([
  "api",
  "explore",
  "foss",
  "new",
  "submit",
  "top",
  "trending",
  "weekly recap",
]);

function decodeHtml(value) {
  return String(value ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return decodeHtml(String(value ?? "").replace(/<[^>]+>/g, " "));
}

function extractJsonLdCandidates(html, sourceUrl) {
  const candidates = [];
  const scriptPattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(decodeHtml(match[1]));
      const values = Array.isArray(parsed) ? parsed : [parsed];
      for (const value of values) {
        const graph = Array.isArray(value["@graph"]) ? value["@graph"] : [value];
        for (const item of graph) {
          if (!item?.name) continue;
          candidates.push({
            name: item.name,
            summary: item.description ?? null,
            website_url: item.url ?? null,
            source_url: item.url ?? sourceUrl,
            payload: item,
          });
        }
      }
    } catch {
      // Keep HTML parsing resilient; invalid JSON-LD should not stop discovery.
    }
  }

  return candidates;
}

function extractNextDataCandidates(html, sourceUrl) {
  const match = html.match(/<script id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) return [];

  try {
    const parsed = JSON.parse(decodeHtml(match[1]));
    const seen = new Set();
    const candidates = [];
    const stack = [parsed];

    while (stack.length > 0) {
      const value = stack.pop();
      if (!value || typeof value !== "object") continue;
      if (Array.isArray(value)) {
        for (const item of value) stack.push(item);
        continue;
      }

      const name = value.name ?? value.title;
      const repo = value.source_code_url ?? value.repo_url ?? value.github_url ?? value.github;
      const website = value.website_url ?? value.homepage_url ?? value.homepage ?? value.url;
      const description = value.summary ?? value.description ?? value.short_description;
      if (name && (repo || website || description)) {
        const key = `${name}:${repo ?? website ?? description}`;
        if (!seen.has(key)) {
          seen.add(key);
          candidates.push({
            name,
            summary: description ?? null,
            source_code_url: repo ?? null,
            website_url: website ?? null,
            source_url: website ?? sourceUrl,
            categories: Array.isArray(value.categories) ? value.categories : [],
            surfaces: Array.isArray(value.surfaces) ? value.surfaces : [],
            payload: value,
          });
        }
      }

      for (const item of Object.values(value)) {
        if (item && typeof item === "object") stack.push(item);
      }
    }

    return candidates;
  } catch {
    return [];
  }
}

function extractAnchorCandidates(html, sourceUrl) {
  const candidates = [];
  const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = anchorPattern.exec(html)) !== null) {
    const [, attrs, innerHtml] = match;
    const hrefMatch = attrs.match(/\bhref=["']([^"']+)["']/i);
    if (!hrefMatch) continue;

    const href = absoluteUrl(hrefMatch[1], sourceUrl);
    if (!href) continue;

    const name = stripTags(innerHtml)
      .replace(/\bstars?\b.*$/i, "")
      .replace(/\bgithub\b$/i, "")
      .trim();
    const normalized = name.toLowerCase();
    if (!name || name.length < 2 || name.length > 80 || blockedNames.has(normalized)) continue;

    const sourceCodeUrl = canonicalSourceCodeUrl(href);
    const sameSite = new URL(href).hostname === new URL(sourceUrl).hostname;
    if (!sourceCodeUrl && !sameSite) continue;

    candidates.push({
      name,
      source_code_url: sourceCodeUrl,
      website_url: sourceCodeUrl ? null : href,
      source_url: href,
      payload: { href, name, html: innerHtml.slice(0, 1000) },
    });
  }

  return candidates;
}

function uniqueCandidates(candidates) {
  const seen = new Set();
  const unique = [];

  for (const candidate of candidates) {
    const key = `${candidate.source_code_url ?? ""}:${candidate.website_url ?? ""}:${candidate.source_url ?? ""}:${candidate.name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(candidate);
  }

  return unique;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "stack127-self-host-apps-discovery/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

async function main() {
  const args = parseArgs();
  const source = args.source;
  const sourceUrl = args.url;
  if (!source || !sourceUrl) {
    throw new Error("Usage: npm run self-host-apps:discover-html-directory -- --source <name> --url <url> [--write] [--out file.json]");
  }

  const limit = numberArg(args, "limit", 500);
  const fetchedAt = new Date().toISOString();
  const html = await fetchText(sourceUrl);
  const rawCandidates = uniqueCandidates([
    ...extractJsonLdCandidates(html, sourceUrl),
    ...extractNextDataCandidates(html, sourceUrl),
    ...extractAnchorCandidates(html, sourceUrl),
  ]);
  const candidates = rawCandidates
    .map((candidate) => normalizeCandidate(candidate, { source, sourceUrl, baseUrl: sourceUrl }))
    .filter(Boolean)
    .slice(0, limit);

  if (args.out) {
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, `${JSON.stringify({ source, source_url: sourceUrl, fetched_at: fetchedAt, candidates }, null, 2)}\n`);
    console.log(`Wrote ${candidates.length} candidate(s) to ${args.out}`);
  }

  if (!args.write) {
    console.log(JSON.stringify({ source, source_url: sourceUrl, fetched_at: fetchedAt, candidate_count: candidates.length, candidates: candidates.slice(0, 20) }, null, 2));
    return;
  }

  await withClient(async (client) => {
    const result = await storeCandidates(client, candidates, {
      source,
      sourceUrl,
      notes: `HTML directory discovery from ${sourceUrl}`,
    });
    console.log(JSON.stringify(result, null, 2));
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
