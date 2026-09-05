#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { extractProductImageCandidates } from "../local-security-cameras/lib/image-candidates.mjs";
import { cyberPowerModelToken, exactCyberPowerImageLinks, exactCyberPowerProductLinks } from "./lib/cyberpower.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const cacheRoot = path.resolve(process.env.STACK127_NUT_CACHE ?? "/tmp/stack127-nut-hcl-cache");
const imageRoot = path.join(cacheRoot, "cyberpower-images");
const reportPath = path.join(repositoryRoot, "content_docs/nut-compatible-ups/cyberpower-image-research.json");
const staging = JSON.parse(await readFile(path.join(cacheRoot, "staging/nut-compatible-ups.json"), "utf8"));
const vendorRecords = staging.records.filter((record) => record.vendor === "Cyber Power Systems");
const candidates = staging.records.filter((record) => record.vendor === "Cyber Power Systems" && !record.image_source_url);

async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 stack127 catalog research (+https://stack127.com)" }, redirect: "follow", signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return { text: await response.text(), url: response.url };
}

async function fetchImage(url, target) {
  try {
    await access(target);
    return;
  } catch {
    // Download below.
  }
  const response = await fetch(url, { headers: { accept: "image/avif,image/webp,image/png,image/jpeg,*/*", "user-agent": "Mozilla/5.0 stack127 catalog research (+https://stack127.com)" }, redirect: "follow", signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const body = Buffer.from(await response.arrayBuffer());
  const metadata = await sharp(body).metadata();
  if (Math.min(metadata.width ?? 0, metadata.height ?? 0) < 180) throw new Error("Official image is below the 180-pixel minimum");
  await sharp(body).rotate().resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 80, effort: 4 }).toFile(target);
}

async function research(record) {
  const token = cyberPowerModelToken(record.model);
  if (!token) return { model: record.model, reason: "HCL model is a family expression, not one exact CyberPower model", slug: record.slug, status: "unresolved" };
  try {
    const searchUrl = `https://www.cyberpowersystems.com/?s=${encodeURIComponent(record.model)}`;
    const search = await fetchText(searchUrl);
    const productUrl = exactCyberPowerProductLinks(search.text, record.model, search.url)[0] ?? null;
    const product = productUrl ? await fetchText(productUrl) : search;
    const imageCandidates = productUrl
      ? extractProductImageCandidates(product.text, product.url, record.model)
      : exactCyberPowerImageLinks(search.text, record.model, search.url);
    if (imageCandidates.length === 0) throw new Error("Official search has no exact-model product page or image");
    const target = path.join(imageRoot, `${record.slug}.webp`);
    let imageSourceUrl = null;
    for (const imageUrl of imageCandidates) {
      try {
        await fetchImage(imageUrl.replace(/-\d+x\d+(?=\.[a-z]{2,5}(?:\?|$))/i, ""), target);
        imageSourceUrl = imageUrl.replace(/-\d+x\d+(?=\.[a-z]{2,5}(?:\?|$))/i, "");
        break;
      } catch {
        continue;
      }
    }
    if (!imageSourceUrl) throw new Error("Exact product page has no usable image at the minimum resolution");
    return {
      image_cache_file: path.relative(cacheRoot, target),
      image_source_url: imageSourceUrl,
      model: record.model,
      product_url: productUrl ? product.url : search.url,
      quality: "official-manufacturer-product-image",
      slug: record.slug,
      status: "resolved",
    };
  } catch (error) {
    return { model: record.model, reason: error.message, slug: record.slug, status: "unresolved" };
  }
}

async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await callback(values[index]);
      if ((index + 1) % 10 === 0 || index + 1 === values.length) console.log(`${index + 1}/${values.length} CyberPower models`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

await mkdir(imageRoot, { recursive: true });
const records = await mapConcurrent(candidates, 4, research);
let previousResolved = [];
try {
  const previous = JSON.parse(await readFile(reportPath, "utf8"));
  const currentSlugs = new Set(records.map((record) => record.slug));
  previousResolved = previous.records.filter((record) => record.status === "resolved" && !currentSlugs.has(record.slug));
} catch {
  // The first pass has no earlier report.
}
const preservedSlugs = new Set([...previousResolved, ...records].map((record) => record.slug));
for (const record of vendorRecords) {
  if (!record.image_source_url || preservedSlugs.has(record.slug)) continue;
  try {
    await access(path.join(imageRoot, `${record.slug}.webp`));
    previousResolved.push({
      image_cache_file: path.relative(cacheRoot, path.join(imageRoot, `${record.slug}.webp`)),
      image_source_url: record.image_source_url,
      model: record.model,
      quality: "official-manufacturer-product-image",
      slug: record.slug,
      status: "resolved",
    });
    preservedSlugs.add(record.slug);
  } catch {
    // A stale staged image claim is not carried into the durable report.
  }
}
const merged = [...previousResolved, ...records].sort((left, right) => left.slug.localeCompare(right.slug));
const resolvedTotal = merged.filter((record) => record.status === "resolved").length;
const report = { generated_at: new Date().toISOString(), source_total: vendorRecords.length, resolved_total: resolvedTotal, unresolved_total: vendorRecords.length - resolvedTotal, records: merged };
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ source_total: vendorRecords.length, resolved_total: resolvedTotal, unresolved_total: vendorRecords.length - resolvedTotal, report: path.relative(repositoryRoot, reportPath) }, null, 2));
