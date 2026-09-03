#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { parseArgs, numberArg } from "./lib/args.mjs";
import {
  contentDigest,
  isManagedMediaUrl,
  mediaObjectPath,
  uploadMediaObject,
} from "../stack127/media/storage.mjs";

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.apps)) return input.apps;
  if (Array.isArray(input.records)) return input.records.map((record) => record?.app ?? record?.project ?? record);
  return [input];
}

function iconDomain(app) {
  const candidates = [
    app.website_url,
    app.publisher_url,
    app.source_code_url,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      return url.hostname;
    } catch {
      continue;
    }
  }

  return null;
}

function iconCandidates(app) {
  const candidates = [];
  if (app.icon_source_url) {
    candidates.push({ kind: "official image", url: app.icon_source_url });
  }

  const domain = iconDomain(app);
  if (domain) {
    candidates.push({
      kind: "favicon fallback",
      url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=256`,
    });
  }

  return candidates;
}

async function fetchIcon(url) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "image/avif,image/webp,image/png,image/jpeg,image/svg+xml,image/*,*/*;q=0.8",
          "User-Agent": "stack127-icon-cache",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) throw new Error(`Icon fetch failed ${response.status}: ${url}`);
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
      fit: "contain",
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  const args = parseArgs();
  if (!args.file) {
    console.error("Usage: npm run self-host-apps:cache-icons -- --file apps.json [--refresh]");
    process.exit(1);
  }

  const raw = await readFile(args.file, "utf8");
  const input = JSON.parse(raw);
  const records = recordsFromInput(input);
  const limit = numberArg(args, "limit", records.length);
  const selected = records.slice(0, limit);
  const workerCount = Math.min(numberArg(args, "workers", 8), selected.length || 1);
  let cached = 0;
  let skipped = 0;
  let failed = 0;
  let nextIndex = 0;

  async function cacheRecord(app) {
    if (!args.refresh && isManagedMediaUrl(app.icon_url, { directory: "self-host-apps", kind: "icons" })) {
      skipped += 1;
      return;
    }
    const candidates = iconCandidates(app);
    if (candidates.length === 0) {
      console.warn(`warning ${app.slug}: no official image or icon domain`);
      skipped += 1;
      return;
    }

    let stored = false;
    for (const candidate of candidates) {
      try {
        const bytes = await fetchIcon(candidate.url);
        const png = await normalizeIcon(bytes);
        const objectPath = mediaObjectPath({
          directory: "self-host-apps",
          digest: contentDigest(png),
          extension: "png",
          kind: "icons",
          slug: app.slug,
        });
        app.icon_source_url = candidate.url;
        app.icon_url = await uploadMediaObject({ bytes: png, contentType: "image/png", objectPath });
        cached += 1;
        stored = true;
        console.log(`Cached icon: ${app.slug} (${candidate.kind})`);
        break;
      } catch (error) {
        console.warn(`warning ${app.slug} ${candidate.kind}: ${error.message}`);
      }
    }

    if (!stored) {
      failed += 1;
    }
  }

  async function worker() {
    while (nextIndex < selected.length) {
      const app = selected[nextIndex];
      nextIndex += 1;
      await cacheRecord(app);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  await writeFile(args.file, `${JSON.stringify(input, null, 2)}\n`);
  console.log(`Updated managed icon_url values in ${args.file}`);
  console.log(`Icon upload complete: ${cached} uploaded, ${skipped} skipped, ${failed} failed.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
