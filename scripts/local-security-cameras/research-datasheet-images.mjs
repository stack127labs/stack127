#!/usr/bin/env node

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { parsePdfImageList, selectProductImage } from "../stack127/lib/pdf-product-images.mjs";

const execute = promisify(execFile);
const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const cacheRoot = path.resolve(process.env.STACK127_CAMERA_CACHE ?? "/tmp/stack127-camera-catalog-cache");
const pdfRoot = path.join(cacheRoot, "datasheet-pdfs");
const extractedRoot = path.join(cacheRoot, "datasheet-extracted");
const enrichedRoot = path.join(cacheRoot, "datasheet-images");
const staging = JSON.parse(await readFile(path.join(cacheRoot, "staging/local-security-cameras.json"), "utf8"));
const candidates = staging.records
  .filter((record) => !record.image_source_url)
  .map((record) => ({ ...record, pdf_sources: record.source_links.map((link) => link.url).filter((url) => /\.pdf(?:\?|$)/i.test(url)) }))
  .filter((record) => record.pdf_sources.length > 0);

function normalized(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

async function fetchPdf(url, target) {
  try {
    await access(target);
    return;
  } catch {
    // Download below.
  }
  const response = await fetch(url, {
    headers: { accept: "application/pdf,*/*", "user-agent": "Mozilla/5.0 stack127 device catalog (+https://stack127.com)" },
    redirect: "follow",
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > 50_000_000) throw new Error("Datasheet is larger than 50 MB");
  const body = Buffer.from(await response.arrayBuffer());
  if (!body.subarray(0, 4).equals(Buffer.from("%PDF"))) throw new Error("Evidence source is not a PDF response");
  await writeFile(target, body);
}

async function inspectPdf(record, sourceUrl) {
  const sourceKey = createHash("sha256").update(sourceUrl).digest("hex").slice(0, 12);
  const pdf = path.join(pdfRoot, `${record.slug}-${sourceKey}.pdf`);
  const prefix = path.join(extractedRoot, `${record.slug}-${sourceKey}`);
  await fetchPdf(sourceUrl, pdf);
  const { stdout: firstPages } = await execute("pdftotext", ["-f", "1", "-l", "2", pdf, "-"], { maxBuffer: 4_000_000 });
  if (!normalized(firstPages).includes(normalized(record.model))) throw new Error("First two pages do not identify the exact camera model");
  const { stdout: list } = await execute("pdfimages", ["-f", "1", "-l", "2", "-list", pdf]);
  const selected = selectProductImage(parsePdfImageList(list));
  if (!selected) throw new Error("No large product-photo candidate in the first two pages");
  const prefixName = path.basename(prefix);
  for (const file of await readdir(extractedRoot)) {
    if (file.startsWith(`${prefixName}-`)) await rm(path.join(extractedRoot, file), { force: true });
  }
  await execute("pdfimages", ["-f", "1", "-l", "2", "-png", pdf, prefix]);
  const base = `${path.basename(prefix)}-${String(selected.number).padStart(3, "0")}.`;
  const extracted = (await readdir(extractedRoot)).find((name) => name.startsWith(base));
  if (!extracted) throw new Error("Selected embedded image was not extracted");
  const extractedPath = path.join(extractedRoot, extracted);
  const stats = await sharp(extractedPath).stats();
  if (stats.entropy < 1.5) throw new Error("Selected image is too visually sparse to be a useful product photo");
  const dominant = stats.dominant;
  const dominantSpread = Math.max(dominant.r, dominant.g, dominant.b) - Math.min(dominant.r, dominant.g, dominant.b);
  if (stats.sharpness > 8 && dominant.r > 225 && dominant.g > 225 && dominant.b > 225 && dominantSpread < 8) {
    throw new Error("Selected image is a technical line drawing, not a product photo");
  }
  const target = path.join(enrichedRoot, `${record.slug}.webp`);
  await sharp(extractedPath).rotate().resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 80, effort: 4 }).toFile(target);
  return {
    image_cache_file: path.relative(cacheRoot, target),
    image_source_url: sourceUrl,
    quality: "exact-model-datasheet-product-image",
    slug: record.slug,
    status: "resolved",
  };
}

async function research(record) {
  const reasons = [];
  for (const sourceUrl of record.pdf_sources) {
    try {
      return await inspectPdf(record, sourceUrl);
    } catch (error) {
      reasons.push(`${sourceUrl}: ${error.message}`);
    }
  }
  return { model: record.model, reason: reasons.join(" | "), slug: record.slug, status: "unresolved", vendor: record.vendor };
}

async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await callback(values[index]);
      if ((index + 1) % 25 === 0 || index + 1 === values.length) console.log(`${index + 1}/${values.length} camera datasheets`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

await Promise.all([pdfRoot, extractedRoot, enrichedRoot].map((directory) => mkdir(directory, { recursive: true })));
const records = await mapConcurrent(candidates, 6, research);
const resolvedTotal = records.filter((record) => record.status === "resolved").length;
const report = { generated_at: new Date().toISOString(), source_total: candidates.length, resolved_total: resolvedTotal, unresolved_total: records.length - resolvedTotal, records };
const reportPath = path.join(repositoryRoot, "content_docs/local-security-cameras/datasheet-image-research.json");
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ source_total: candidates.length, resolved_total: resolvedTotal, unresolved_total: records.length - resolvedTotal, report: path.relative(repositoryRoot, reportPath) }, null, 2));
