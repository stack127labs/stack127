#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { numberArg, parseArgs } from "./lib/args.mjs";

const genericWebsiteHosts = new Set([
  "crates.io",
  "github.com",
  "gitlab.com",
  "npmjs.com",
  "pypi.org",
  "www.npmjs.com",
]);

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.records)) return input.records;
  return [input];
}

function validUrl(value) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function faviconCandidate(value) {
  const url = validUrl(value);
  if (!url || genericWebsiteHosts.has(url.hostname.toLowerCase())) return null;
  return {
    kind: "official site favicon",
    url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url.hostname)}&sz=256`,
  };
}

function githubOwnerCandidate(value) {
  const url = validUrl(value);
  if (!url || url.hostname.toLowerCase() !== "github.com") return null;
  const owner = url.pathname.split("/").filter(Boolean)[0];
  if (!owner) return null;
  return { kind: "official repository owner", url: `https://github.com/${owner}.png?size=256` };
}

function iconCandidates(record) {
  const candidates = [];
  const explicit = validUrl(record.icon_source_url);
  if (explicit) candidates.push({ kind: "reviewed icon", url: explicit.href });

  const website = record.review?.website_url ?? record.website_url;
  const docs = record.review?.docs_url ?? record.docs_url;
  const repository = record.review?.repository_url ?? record.repository_url;

  for (const candidate of [
    faviconCandidate(website),
    githubOwnerCandidate(website),
    githubOwnerCandidate(repository),
    faviconCandidate(docs),
    githubOwnerCandidate(docs),
    faviconCandidate(repository),
  ]) {
    if (candidate && !candidates.some((existing) => existing.url === candidate.url)) {
      candidates.push(candidate);
    }
  }

  return candidates;
}

function iconLabel(record) {
  const words = record.name.match(/[A-Za-z0-9]+/g) ?? [record.name];
  return (words.length > 1
    ? `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`
    : (words[0] ?? record.name).slice(0, 2)
  ).toUpperCase();
}

function generatedIcon(record) {
  const colors = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#ca8a04", "#0891b2", "#be123c", "#4b5563"];
  const hash = [...record.slug].reduce((total, character) => total + character.charCodeAt(0), 0);
  const label = iconLabel(record).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <rect width="256" height="256" rx="56" fill="${colors[hash % colors.length]}"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="ui-sans-serif, system-ui, sans-serif" font-size="92" font-weight="700">${label}</text>
    </svg>
  `.trim());
}

async function fetchIcon(url) {
  let lastError;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.8",
          "User-Agent": "stack127-cli-icon-cache",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function normalizeIcon(bytes) {
  return sharp(bytes, { density: 256 })
    .resize(256, 256, {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      fit: "contain",
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  const args = parseArgs();
  if (!args.file) {
    console.error("Usage: node scripts/cli-apps/cache-icons.mjs --file <batch.json> [--out public/cli-app-icons] [--refresh]");
    process.exit(1);
  }

  const outputDir = args.out ?? "public/cli-app-icons";
  const raw = await readFile(args.file, "utf8");
  const input = JSON.parse(raw);
  const records = recordsFromInput(input);
  const limit = numberArg(args, "limit", records.length);
  const selected = (args.slug
    ? records.filter((record) => record.slug === args.slug)
    : records
  ).slice(0, limit);
  const refresh = Boolean(args.refresh);
  const workerCount = Math.min(numberArg(args, "workers", 8), selected.length || 1);
  const result = { cached: 0, existing: 0, generated: 0, failed_sources: 0 };
  let nextIndex = 0;

  await mkdir(outputDir, { recursive: true });

  async function cacheRecord(record) {
    const filename = `${record.slug}.png`;
    const outputPath = path.join(outputDir, filename);
    const publicUrl = `/${path.relative("public", outputPath).split(path.sep).join("/")}`;

    if (!refresh && record.icon_source_url) {
      try {
        await access(outputPath);
        record.icon_url = publicUrl;
        result.existing += 1;
        return;
      } catch {
        // A missing file must be rebuilt even if the batch still has its source URL.
      }
    }

    for (const candidate of iconCandidates(record)) {
      try {
        const bytes = await fetchIcon(candidate.url);
        const png = await normalizeIcon(bytes);
        await writeFile(outputPath, png);
        record.icon_source_url = candidate.url;
        record.icon_url = publicUrl;
        result.cached += 1;
        return;
      } catch (error) {
        result.failed_sources += 1;
        console.warn(`warning ${record.slug} ${candidate.kind}: ${error.message}`);
      }
    }

    const png = await normalizeIcon(generatedIcon(record));
    await writeFile(outputPath, png);
    record.icon_source_url = "generated:stack127-initials";
    record.icon_url = publicUrl;
    result.generated += 1;
  }

  async function worker() {
    while (nextIndex < selected.length) {
      const record = selected[nextIndex];
      nextIndex += 1;
      await cacheRecord(record);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  await writeFile(args.file, `${JSON.stringify(input, null, 2)}\n`);
  console.log(JSON.stringify({ records: selected.length, ...result, output: outputDir }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
