#!/usr/bin/env node

import { copyFile, cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { extractProductImageCandidates } from "../local-security-cameras/lib/image-candidates.mjs";
import { addZWaveRecordToGroups, buildAllianceRecord, finalizeZWaveGroups, parseAllianceProductDetail } from "./lib/catalog.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const zwaveJsRoot = path.resolve(process.argv[2] ?? "/tmp/stack127-zwave-js-source");
const zwaveJsRevision = process.argv[3];
if (!/^[a-f0-9]{40}$/.test(zwaveJsRevision ?? "")) throw new Error("Pass the pinned 40-character Z-Wave JS revision as the second argument.");

const limitFlag = process.argv.indexOf("--limit");
const limit = limitFlag >= 0 ? Number.parseInt(process.argv[limitFlag + 1], 10) : null;
const cacheRoot = path.resolve(process.env.STACK127_ZWAVE_CACHE ?? "/tmp/stack127-z-wave-alliance-cache");
const stagingRoot = path.join(cacheRoot, "staging");
const stagingImages = path.join(stagingRoot, "images");
const groupedImages = path.join(stagingRoot, "product-images");
const stagingData = path.join(stagingRoot, "z-wave-devices.json");
const processedImages = path.join(cacheRoot, "processed-images");
const processedImageManifestPath = path.join(cacheRoot, "processed-images.json");
const outputImages = path.join(repositoryRoot, "public/hardware-directory-images/z-wave-devices");
const outputData = path.join(repositoryRoot, "lib/hardware-directories/data/z-wave-devices.json");
const reportPath = path.join(repositoryRoot, "content_docs/z-wave-devices/refresh-report.json");
const openSmartHouseResearchPath = path.join(repositoryRoot, "content_docs/z-wave-devices/opensmarthouse-image-research.json");
const allianceApi = "https://products.z-wavealliance.org/wp-json/wp/v2/z-wave-product";

function parseConfig(text) {
  return JSON.parse(text.replace(/^\s*\/\/.*$/gm, ""));
}

function normalize(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function fetchWithRetry(url, options = {}, attempts = 4) {
  let error;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          accept: options.accept ?? "application/json,text/html;q=0.9,image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
          "user-agent": "stack127 catalog refresh (+https://stack127.com)",
          ...options.headers,
        },
        redirect: "follow",
        signal: AbortSignal.timeout(options.timeout ?? 45_000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (current) {
      error = current;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw new Error(`${url}: ${error?.message ?? error}`);
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

async function loadAllianceIndex() {
  const cacheFile = path.join(cacheRoot, "alliance-index.json");
  let records;
  let total;
  try {
    const firstUrl = `${allianceApi}?per_page=100&page=1&orderby=id&order=asc`;
    const first = await fetchWithRetry(firstUrl);
    total = Number.parseInt(first.headers.get("x-wp-total") ?? "0", 10);
    const pages = Number.parseInt(first.headers.get("x-wp-totalpages") ?? "1", 10);
    records = await first.json();
    if (!limit) {
      const pageNumbers = Array.from({ length: Math.max(0, pages - 1) }, (_, index) => index + 2);
      const batches = await mapConcurrent(pageNumbers, 8, async (pageNumber) => {
        const response = await fetchWithRetry(`${allianceApi}?per_page=100&page=${pageNumber}&orderby=id&order=asc`);
        return response.json();
      });
      records.push(...batches.flat());
      if (records.length !== total) throw new Error(`Alliance API reported ${total} records but returned ${records.length}.`);
      await writeFile(cacheFile, `${JSON.stringify(records)}\n`);
    }
  } catch (error) {
    records = JSON.parse(await readFile(cacheFile, "utf8"));
    total = records.length;
    console.warn(`Z-Wave Alliance index unavailable; using ${total} cached official product records: ${error.message}`);
  }
  return { records: limit ? records.slice(0, limit) : records, sourceTotal: total };
}

async function walkJsonFiles(root) {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

async function loadZwaveJsConfigs() {
  const configsRoot = path.join(zwaveJsRoot, "packages/config/config/devices");
  const files = await walkJsonFiles(configsRoot);
  const configs = [];
  for (const file of files) {
    try {
      const config = parseConfig(await readFile(file, "utf8"));
      if (!config.manufacturer || !config.label || !Array.isArray(config.devices)) continue;
      configs.push({
        associations: config.associations ? Object.keys(config.associations).length : 0,
        description: config.description ?? "",
        firmware: `${config.firmwareVersion?.min ?? "Not published"} to ${config.firmwareVersion?.max ?? "Not published"}`,
        identifiers: config.devices.map((device) => `${device.productType}/${device.productId}`),
        label: config.label,
        manufacturer: config.manufacturer,
        manufacturerId: config.manufacturerId,
        parameters: Array.isArray(config.paramInformation) ? config.paramInformation.length : 0,
        url: `https://github.com/zwave-js/zwave-js/blob/${zwaveJsRevision}/${path.relative(zwaveJsRoot, file)}`,
      });
    } catch {
      continue;
    }
  }
  return configs;
}

function matchZwaveJs(fields, configs) {
  const manufacturerId = String(fields.get("Manufacturer ID") ?? "").toLowerCase();
  const productTypeId = String(fields.get("Product Type ID") ?? "").toLowerCase();
  const productId = String(fields.get("Product ID") ?? "").toLowerCase();
  if (manufacturerId && productTypeId && productId) {
    const identifier = `${productTypeId}/${productId}`;
    const exact = configs.filter((config) => String(config.manufacturerId).toLowerCase() === manufacturerId
      && config.identifiers.some((value) => value.toLowerCase() === identifier));
    if (exact.length > 0) return exact;
  }
  const brand = normalize(fields.get("Brand"));
  const identifier = normalize(fields.get("Identifier") ?? fields.get("Product Identifier"));
  const name = normalize(fields.get("Name"));
  if (!brand || (!identifier && !name)) return [];
  return configs.filter((config) => {
    const configBrand = normalize(config.manufacturer);
    if (configBrand !== brand && !configBrand.includes(brand) && !brand.includes(configBrand)) return false;
    const labels = [normalize(config.label), normalize(config.description)];
    return (identifier && labels.includes(identifier)) || (name && labels.includes(name));
  });
}

async function cachedDetail(apiRecord) {
  const file = path.join(cacheRoot, "details", `${apiRecord.id}.html`);
  try {
    return await readFile(file, "utf8");
  } catch {
    const response = await fetchWithRetry(apiRecord.link, { accept: "text/html" });
    const html = await response.text();
    await writeFile(file, html);
    return html;
  }
}

async function loadProcessedImageManifest() {
  try {
    return JSON.parse(await readFile(processedImageManifestPath, "utf8"));
  } catch {
    return {};
  }
}

async function buildImage(apiRecord, detail, processedImageManifest, researchedImages) {
  const cached = processedImageManifest[apiRecord.slug];
  const cachedPath = path.join(processedImages, `${apiRecord.slug}.webp`);
  if (cached?.source_url) {
    try {
      const imagePath = path.join(stagingImages, `${apiRecord.slug}.webp`);
      await copyFile(cachedPath, imagePath);
      return {
        imagePath: `/hardware-directory-images/z-wave-devices/${apiRecord.slug}.webp`,
        imageQuality: cached.quality ?? "official-source",
        imageSourceUrl: cached.source_url,
      };
    } catch {
      // A stale manifest entry is repaired by downloading the source again.
    }
  }

  const embedded = apiRecord._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const researchedImage = researchedImages.get(apiRecord.id) ?? null;
  const candidates = [...new Set([embedded, ...detail.imageUrls, researchedImage?.image_source_url].filter(Boolean))];
  let smallestCandidate = null;
  for (const imageUrl of candidates) {
    try {
      const response = await fetchWithRetry(imageUrl, { accept: "image/avif,image/webp,image/png,image/jpeg,*/*", timeout: 60_000 });
      const body = Buffer.from(await response.arrayBuffer());
      const metadata = await sharp(body).metadata();
      const shortestSide = Math.min(metadata.width ?? 0, metadata.height ?? 0);
      if (shortestSide < 64) {
        smallestCandidate = smallestCandidate === null ? shortestSide : Math.min(smallestCandidate, shortestSide);
        continue;
      }
      const imageQuality = imageUrl === researchedImage?.image_source_url
        ? "opensmarthouse-exact-product-image"
        : shortestSide < 180 ? "official-low-resolution" : "official-high-resolution";
      const imagePath = path.join(stagingImages, `${apiRecord.slug}.webp`);
      await sharp(body)
        .rotate()
        .resize(440, 440, { background: { alpha: 0, b: 0, g: 0, r: 0 }, fit: "contain", withoutEnlargement: false })
        .webp({ effort: 4, quality: 76 })
        .toFile(imagePath);
      const processedPath = path.join(processedImages, `${apiRecord.slug}.webp`);
      await copyFile(imagePath, processedPath);
      processedImageManifest[apiRecord.slug] = { quality: imageQuality, source_url: imageUrl };
      return {
        imagePath: `/hardware-directory-images/z-wave-devices/${apiRecord.slug}.webp`,
        imageQuality,
        imageSourceUrl: imageUrl,
      };
    } catch {
      continue;
    }
  }
  const manufacturerProductUrl = detail.fields.get("Product URL");
  if (/^https?:\/\//i.test(manufacturerProductUrl ?? "") && !/\.(?:pdf|docx?|zip)(?:\?|$)/i.test(manufacturerProductUrl)) {
    try {
      const page = await fetchWithRetry(manufacturerProductUrl, { accept: "text/html,application/xhtml+xml", timeout: 30_000 }, 2);
      const pageHtml = await page.text();
      const model = detail.fields.get("Identifier") ?? detail.fields.get("Product Identifier") ?? detail.fields.get("Name") ?? apiRecord.title?.rendered;
      for (const imageUrl of extractProductImageCandidates(pageHtml, page.url, model)) {
        try {
          const response = await fetchWithRetry(imageUrl, { accept: "image/avif,image/webp,image/png,image/jpeg,*/*", timeout: 45_000 }, 2);
          const body = Buffer.from(await response.arrayBuffer());
          const metadata = await sharp(body).metadata();
          if (Math.min(metadata.width ?? 0, metadata.height ?? 0) < 180) continue;
          const imagePath = path.join(stagingImages, `${apiRecord.slug}.webp`);
          await sharp(body).rotate().resize(440, 440, { background: { alpha: 0, b: 0, g: 0, r: 0 }, fit: "contain" }).webp({ effort: 4, quality: 76 }).toFile(imagePath);
          await copyFile(imagePath, path.join(processedImages, `${apiRecord.slug}.webp`));
          processedImageManifest[apiRecord.slug] = { quality: "manufacturer-product-page-image", source_url: imageUrl };
          return {
            imagePath: `/hardware-directory-images/z-wave-devices/${apiRecord.slug}.webp`,
            imageQuality: "manufacturer-product-page-image",
            imageSourceUrl: imageUrl,
          };
        } catch {
          continue;
        }
      }
    } catch {
      // Dead or generic manufacturer links remain explicit image failures.
    }
  }
  if (candidates.length === 0) throw new Error("Official certification record publishes no product image");
  throw new Error(`Official product image is below the 64-pixel minimum${smallestCandidate === null ? "" : ` (${smallestCandidate}px shortest side)`}`);
}

await mkdir(path.join(cacheRoot, "details"), { recursive: true });
await mkdir(processedImages, { recursive: true });
await rm(stagingRoot, { force: true, recursive: true });
await mkdir(stagingImages, { recursive: true });

const startedAt = new Date().toISOString();
const { records: allianceRecords, sourceTotal } = await loadAllianceIndex();
const zwaveJsConfigs = await loadZwaveJsConfigs();
const processedImageManifest = await loadProcessedImageManifest();
let researchedImages = new Map();
try {
  const research = JSON.parse(await readFile(openSmartHouseResearchPath, "utf8"));
  researchedImages = new Map(research.records
    .filter((record) => record.status === "resolved" && record.image_source_url)
    .map((record) => [record.alliance_id, record]));
} catch {
  // The Alliance catalog remains usable without optional OpenSmartHouse enrichment.
}
const detailFailures = [];
const sourceImageFailures = [];
let detailTotal = 0;
let imageTotal = 0;
let lowResolutionImageTotal = 0;
let zwaveJsMatchTotal = 0;

const certificationRecords = (await mapConcurrent(allianceRecords, 8, async (apiRecord, index) => {
  try {
    const detail = parseAllianceProductDetail(await cachedDetail(apiRecord));
    if (!detail.fields.get("Name")) throw new Error("Certification detail table has no product name");
    detailTotal += 1;
    const zwaveJsMatches = matchZwaveJs(detail.fields, zwaveJsConfigs);
    if (zwaveJsMatches.length > 0) zwaveJsMatchTotal += 1;
    let image = {};
    try {
      image = await buildImage(apiRecord, detail, processedImageManifest, researchedImages);
      imageTotal += 1;
      if (image.imageQuality === "official-low-resolution") lowResolutionImageTotal += 1;
    } catch (error) {
      sourceImageFailures.push({ id: apiRecord.id, name: apiRecord.title?.rendered ?? apiRecord.slug, reason: error.message, url: apiRecord.link });
    }
    if ((index + 1) % 100 === 0 || index + 1 === allianceRecords.length) console.log(`${index + 1}/${allianceRecords.length} Alliance products`);
    return buildAllianceRecord(apiRecord, detail, { ...image, zwaveJsMatches });
  } catch (error) {
    detailFailures.push({ id: apiRecord.id, name: apiRecord.title?.rendered ?? apiRecord.slug, reason: error.message, url: apiRecord.link });
    return null;
  }
})).filter(Boolean);

const productGroups = new Map();
for (const record of certificationRecords) addZWaveRecordToGroups(productGroups, record);
const records = finalizeZWaveGroups(productGroups, { slugify: (value) => normalize(value).replaceAll(" ", "-") });
await rm(groupedImages, { force: true, recursive: true });
await mkdir(groupedImages, { recursive: true });
for (const record of records) {
  if (!record.image_source_slug) continue;
  await copyFile(path.join(stagingImages, `${record.image_source_slug}.webp`), path.join(groupedImages, `${record.slug}.webp`));
}
await rm(stagingImages, { force: true, recursive: true });
await rename(groupedImages, stagingImages);
const imageFailures = records.filter((record) => !record.image_path || !record.image_source_url).map((record) => ({
    name: record.name,
    reason: "No exact product image found for any certification in this product group",
    slug: record.slug,
    vendor: record.vendor,
  }));
const groupedImageTotal = records.filter((record) => record.image_path && record.image_source_url).length;
const isLimitedRun = Number.isInteger(limit);
const readyForCatalog = !isLimitedRun && certificationRecords.length === sourceTotal && detailTotal === sourceTotal && detailFailures.length === 0;
const readyForPublication = readyForCatalog && groupedImageTotal === records.length;
const snapshot = {
  meta: {
    coverage: {
      detail_total: detailTotal,
      certification_total: certificationRecords.length,
      eligible_total: records.length,
      excluded_total: 0,
      failures: detailFailures,
      image_failures: imageFailures,
      image_total: groupedImageTotal,
      low_resolution_image_total: lowResolutionImageTotal,
      missing_image_total: records.length - groupedImageTotal,
      record_total: records.length,
      source_image_failure_total: sourceImageFailures.length,
      source_total: sourceTotal,
      zwave_js_match_total: zwaveJsMatchTotal,
    },
    generated_at: new Date().toISOString(),
    ready_for_catalog: readyForCatalog,
    ready_for_publication: readyForPublication,
    source_label: "Z-Wave Alliance Product Catalog with Z-Wave JS enrichment",
    source_revision: `Alliance ${startedAt}; Z-Wave JS ${zwaveJsRevision}`,
    source_url: "https://products.z-wavealliance.org/",
  },
  records,
};
await writeFile(stagingData, `${JSON.stringify(snapshot, null, 2)}\n`);
await writeFile(reportPath, `${JSON.stringify(snapshot.meta, null, 2)}\n`);
await writeFile(processedImageManifestPath, `${JSON.stringify(processedImageManifest, null, 2)}\n`);

if (!readyForCatalog) {
  console.error(`Staged ${records.length} product groups covering ${certificationRecords.length}/${sourceTotal} certifications, ${detailTotal} details, and ${groupedImageTotal} images. See ${reportPath}.`);
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
  console.log(`Wrote ${records.length} Z-Wave product groups covering all ${certificationRecords.length} Alliance certifications with ${groupedImageTotal} exact product images; ${imageFailures.length} records retain an explicit missing-image state.`);
}
