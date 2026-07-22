#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const inputPath = process.argv[2];
const outputDir = process.argv[3] ?? "public/app-icons";
if (!inputPath) throw new Error("Usage: cache-reviewed-icons.mjs <reviewed.json> [output-dir]");

const input = JSON.parse(await readFile(inputPath, "utf8"));
const reviews = (input.records ?? []).filter((review) => review.decision === "publish");
await mkdir(outputDir, { recursive: true });

let cursor = 0;
const results = [];
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "version127-icon-cache" },
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await wait(750 * (attempt + 1));
    }
  }
  throw lastError;
}

const workers = Array.from({ length: 4 }, async () => {
  while (cursor < reviews.length) {
    const review = reviews[cursor++];
    const sourceUrl = review.project.icon_url;
    try {
      const response = await fetchWithRetry(sourceUrl);
      const bytes = Buffer.from(await response.arrayBuffer());
      const filename = `${review.project.slug}.png`;
      await sharp(bytes, { failOn: "error" })
        .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9, palette: true })
        .toFile(path.join(outputDir, filename));
      review.project.icon_url = `/app-icons/${filename}`;
      results.push({ slug: review.project.slug, ok: true, source_url: sourceUrl, icon_url: review.project.icon_url });
    } catch (error) {
      results.push({ slug: review.project.slug, ok: false, source_url: sourceUrl, error: String(error.message ?? error) });
    }
  }
});

await Promise.all(workers);
const failures = results.filter((result) => !result.ok);
if (failures.length === 0) await writeFile(inputPath, `${JSON.stringify(input, null, 2)}\n`);
console.log(JSON.stringify({ cached: results.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length > 0) process.exitCode = 1;
