#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";

function recordsFromInput(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.apps)) return input.apps;
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

async function fetchIcon(domain) {
  const url = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "stack127-icon-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Icon fetch failed ${response.status}: ${domain}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function main() {
  const args = parseArgs();
  if (!args.file) {
    console.error("Usage: npm run self-host-apps:cache-icons -- --file apps.json [--out public/app-icons]");
    process.exit(1);
  }

  const outputDir = args.out ?? "public/app-icons";
  const raw = await readFile(args.file, "utf8");
  const input = JSON.parse(raw);
  const records = recordsFromInput(input);
  const limit = numberArg(args, "limit", records.length);
  let cached = 0;
  let skipped = 0;
  let failed = 0;

  await mkdir(outputDir, { recursive: true });

  for (const app of records.slice(0, limit)) {
    const domain = iconDomain(app);
    if (!domain) {
      console.warn(`warning ${app.slug}: no icon domain`);
      skipped += 1;
      continue;
    }

    try {
      const bytes = await fetchIcon(domain);
      const filename = `${app.slug}.png`;
      await writeFile(path.join(outputDir, filename), bytes);
      app.icon_url = `/app-icons/${filename}`;
      cached += 1;
      console.log(`Cached icon: ${app.slug} (${domain})`);
    } catch (error) {
      failed += 1;
      console.warn(`warning ${app.slug}: ${error.message}`);
    }
  }

  await writeFile(args.file, `${JSON.stringify(input, null, 2)}\n`);
  console.log(`Updated icon_url values in ${args.file}`);
  console.log(`Icon cache complete: ${cached} cached, ${skipped} skipped, ${failed} failed.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
