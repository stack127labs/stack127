#!/usr/bin/env node

import { copyFile, cp, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { buildCameraRecord, isLocalCamera } from "./lib/catalog.mjs";
import { extractExactModelImageCandidates, extractProductImageCandidates } from "./lib/image-candidates.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const sourceRoot = path.resolve(process.argv[2] ?? "/tmp/stack127-camera-source");
const commit = process.argv[3];
if (!/^[a-f0-9]{40}$/.test(commit ?? "")) throw new Error("Pass the pinned 40-character source revision as the second argument.");

const limitFlag = process.argv.indexOf("--limit");
const limit = limitFlag >= 0 ? Number.parseInt(process.argv[limitFlag + 1], 10) : null;
const cacheRoot = path.resolve(process.env.STACK127_CAMERA_CACHE ?? "/tmp/stack127-camera-catalog-cache");
const processedImages = path.join(cacheRoot, "processed-images");
const processedMetadata = path.join(cacheRoot, "processed-metadata");
const stagingRoot = path.join(cacheRoot, "staging");
const stagingImages = path.join(stagingRoot, "images");
const stagingData = path.join(stagingRoot, "local-security-cameras.json");
const outputImages = path.join(repositoryRoot, "public/hardware-directory-images/local-security-cameras");
const outputData = path.join(repositoryRoot, "lib/hardware-directories/data/local-security-cameras.json");
const reportPath = path.join(repositoryRoot, "content_docs/local-security-cameras/refresh-report.json");
const datasheetResearchPath = path.join(repositoryRoot, "content_docs/local-security-cameras/datasheet-image-research.json");
const skipHosts = /amazon\.|aliexpress\.|ebay\.|youtube\.|reddit\./i;

function slugify(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function fetchWithTimeout(url, accept, timeout = 12_000) {
  const response = await fetch(url, {
    headers: { accept, "user-agent": "Mozilla/5.0 stack127 device catalog (+https://stack127.com)" },
    redirect: "follow",
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response;
}

async function cachedImage(slug) {
  try {
    const metadata = JSON.parse(await readFile(path.join(processedMetadata, `${slug}.json`), "utf8"));
    await copyFile(path.join(processedImages, `${slug}.webp`), path.join(stagingImages, `${slug}.webp`));
    return metadata;
  } catch {
    return null;
  }
}

async function findProductImage(camera, slug) {
  const cached = await cachedImage(slug);
  if (cached) return cached;

  for (const sourceUrl of camera.sources ?? []) {
    if (skipHosts.test(sourceUrl) || /\.(?:pdf|docx?|zip)(?:\?|$)/i.test(sourceUrl)) continue;
    try {
      const page = await fetchWithTimeout(sourceUrl, "text/html,application/xhtml+xml");
      const contentType = page.headers.get("content-type") ?? "";
      if (!contentType.includes("html")) continue;
      const html = await page.text();
      const imageUrls = [...new Set([
        ...extractProductImageCandidates(html, page.url, camera.model),
        ...extractExactModelImageCandidates(html, page.url, camera.model),
      ])];
      for (const imageUrl of imageUrls) {
        if (/(?:logo|favicon|icon|sprite)/i.test(new URL(imageUrl).pathname)) continue;
        try {
          const response = await fetchWithTimeout(imageUrl, "image/avif,image/webp,image/png,image/jpeg,*/*", 20_000);
          const body = Buffer.from(await response.arrayBuffer());
          const metadata = await sharp(body).metadata();
          const width = metadata.width ?? 0;
          const height = metadata.height ?? 0;
          if (Math.min(width, height) < 180 || Math.min(width, height) / Math.max(width, height) < 0.35) continue;
          const target = path.join(stagingImages, `${slug}.webp`);
          await sharp(body).rotate().resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 78, effort: 4 }).toFile(target);
          await copyFile(target, path.join(processedImages, `${slug}.webp`));
          const result = { imagePath: `/hardware-directory-images/local-security-cameras/${slug}.webp`, imageQuality: "source-page-product-image", imageSourceUrl: imageUrl, productUrl: sourceUrl };
          await writeFile(path.join(processedMetadata, `${slug}.json`), `${JSON.stringify(result)}\n`);
          return result;
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await callback(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

async function loadLegacyImages() {
  try {
    const snapshot = JSON.parse(await readFile(outputData, "utf8"));
    return new Map(snapshot.records.filter((record) => record.image_path && record.image_source_url).map((record) => [record.slug, record]));
  } catch {
    return new Map();
  }
}

async function loadDatasheetImages() {
  try {
    const report = JSON.parse(await readFile(datasheetResearchPath, "utf8"));
    return new Map(report.records
      .filter((record) => record.status === "resolved" && record.image_cache_file && record.image_source_url)
      .map((record) => [record.slug, record]));
  } catch {
    return new Map();
  }
}

await mkdir(cacheRoot, { recursive: true });
await mkdir(processedImages, { recursive: true });
await mkdir(processedMetadata, { recursive: true });
await rm(stagingRoot, { force: true, recursive: true });
await mkdir(stagingImages, { recursive: true });

const sourceData = JSON.parse(await readFile(path.join(sourceRoot, "data/cameras.json"), "utf8"));
const allEligible = sourceData.filter(isLocalCamera);
const eligible = Number.isInteger(limit) ? allEligible.slice(0, limit) : allEligible;
const legacyImages = await loadLegacyImages();
const datasheetImages = await loadDatasheetImages();
const imageFailures = [];
let imageTotal = 0;
let verifiedFrigateTotal = 0;

const records = await mapConcurrent(eligible, 10, async (camera, index) => {
  const slug = slugify(camera.id || `${camera.brand}-${camera.model}`);
  let image = await cachedImage(slug);
  if (!image) {
    const researched = datasheetImages.get(slug);
    if (researched) {
      try {
        const source = path.join(cacheRoot, researched.image_cache_file);
        const target = path.join(stagingImages, `${slug}.webp`);
        await copyFile(source, target);
        await copyFile(source, path.join(processedImages, `${slug}.webp`));
        image = { imagePath: `/hardware-directory-images/local-security-cameras/${slug}.webp`, imageQuality: researched.quality, imageSourceUrl: researched.image_source_url };
        await writeFile(path.join(processedMetadata, `${slug}.json`), `${JSON.stringify(image)}\n`);
      } catch {
        image = null;
      }
    }
  }
  if (!image) {
    const legacy = legacyImages.get(slug);
    if (legacy) {
      try {
        await copyFile(path.join(repositoryRoot, "public", legacy.image_path.replace(/^\//, "")), path.join(stagingImages, `${slug}.webp`));
        image = { imagePath: `/hardware-directory-images/local-security-cameras/${slug}.webp`, imageQuality: "source-page-product-image", imageSourceUrl: legacy.image_source_url };
      } catch {
        image = null;
      }
    }
  }
  if (!image) image = await findProductImage(camera, slug);
  if (image) imageTotal += 1;
  else imageFailures.push({ brand: camera.brand, model: camera.model, reason: "No usable product image found in declared evidence sources", slug, sources: camera.sources ?? [] });
  if (camera.configs?.frigate?.verified === true) verifiedFrigateTotal += 1;
  if ((index + 1) % 50 === 0 || index + 1 === eligible.length) console.log(`${index + 1}/${eligible.length} eligible cameras`);
  return buildCameraRecord(camera, { ...(image ?? {}), commit, slug });
});

records.sort((left, right) => left.vendor.localeCompare(right.vendor) || left.model.localeCompare(right.model));
const eligibleTotal = Number.isInteger(limit) ? eligible.length : allEligible.length;
const readyForCatalog = !Number.isInteger(limit) && records.length === allEligible.length;
const readyForPublication = readyForCatalog && imageTotal === allEligible.length;
const snapshot = {
  meta: {
    coverage: {
      detail_total: records.length,
      eligible_total: eligibleTotal,
      excluded_total: sourceData.length - allEligible.length,
      failures: [],
      image_failures: imageFailures,
      image_total: imageTotal,
      missing_image_total: eligibleTotal - imageTotal,
      record_total: records.length,
      source_total: sourceData.length,
      verified_frigate_total: verifiedFrigateTotal,
    },
    generated_at: new Date().toISOString(),
    ready_for_catalog: readyForCatalog,
    ready_for_publication: readyForPublication,
    source_label: "CCTV Camera Database CC0 snapshot",
    source_revision: commit,
    source_url: "https://github.com/ch-bas/cctv-camera-database",
  },
  records,
};
await writeFile(stagingData, `${JSON.stringify(snapshot, null, 2)}\n`);
await writeFile(reportPath, `${JSON.stringify(snapshot.meta, null, 2)}\n`);

if (!readyForCatalog) {
  console.error(`Staged ${records.length}/${allEligible.length} eligible cameras with ${imageTotal} product images. See ${reportPath}.`);
  process.exitCode = 1;
} else {
  const previousImages = `${outputImages}.previous`;
  const nextImages = `${outputImages}.next`;
  const nextData = `${outputData}.next`;
  await rm(nextImages, { force: true, recursive: true });
  await cp(stagingImages, nextImages, { recursive: true });
  await copyFile(stagingData, nextData);
  await rm(previousImages, { force: true, recursive: true });
  try {
    await stat(outputImages);
    await rename(outputImages, previousImages);
  } catch {
    // The first complete refresh has no previous image directory.
  }
  await rename(nextImages, outputImages);
  await rename(nextData, outputData);
  await rm(previousImages, { force: true, recursive: true });
  console.log(`Wrote all ${records.length} local-camera records with ${imageTotal} exact product images; ${imageFailures.length} records retain an explicit missing-image state.`);
}
