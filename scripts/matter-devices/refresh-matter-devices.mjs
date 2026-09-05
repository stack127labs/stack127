#!/usr/bin/env node

import { appendFile, copyFile, cp, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { addMatterRecordToGroups, buildMatterRecord, finalizeMatterGroups, parseMatterProductDetail } from "./lib/catalog.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const communityRoot = path.resolve(process.argv[2] ?? "/tmp/stack127-matter-source");
const communityRevision = process.argv[3];
if (!/^[a-f0-9]{40}$/.test(communityRevision ?? "")) throw new Error("Pass the pinned 40-character Matter Database revision as the second argument.");

const limitFlag = process.argv.indexOf("--limit");
const limit = limitFlag >= 0 ? Number.parseInt(process.argv[limitFlag + 1], 10) : null;
const cacheRoot = path.resolve(process.env.STACK127_MATTER_CACHE ?? "/tmp/stack127-matter-csa-cache");
const detailsRoot = path.join(cacheRoot, "details");
const processedImages = path.join(cacheRoot, "processed-images");
const stagingRoot = path.join(cacheRoot, "staging");
const stagingImages = path.join(stagingRoot, "images");
const stagingRecordBatches = path.join(stagingRoot, "record-batches");
const stagingData = path.join(stagingRoot, "matter-devices.json");
const outputImages = path.join(repositoryRoot, "public/hardware-directory-images/matter-devices");
const outputData = path.join(repositoryRoot, "lib/hardware-directories/data/matter-devices.json");
const reportPath = path.join(repositoryRoot, "content_docs/matter-devices/refresh-report.json");
const csaApi = "https://csa-iot.org/wp-json/wp/v2/product";

function slugify(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function fetchWithRetry(url, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { accept: "application/json,text/html,image/avif,image/webp,image/png,image/jpeg,*/*", "user-agent": "stack127 catalog refresh (+https://stack127.com)" },
        redirect: "follow",
        signal: AbortSignal.timeout(45_000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
  throw new Error(`${url}: ${lastError?.message ?? lastError}`);
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

async function loadAllPages(baseUrl, fields) {
  const separator = baseUrl.includes("?") ? "&" : "?";
  const fieldParam = fields ? `&_fields=${fields}` : "";
  const first = await fetchWithRetry(`${baseUrl}${separator}per_page=100&page=1${fieldParam}`);
  const total = Number(first.headers.get("x-wp-total") ?? 0);
  const totalPages = Number(first.headers.get("x-wp-totalpages") ?? 1);
  const values = await first.json();
  const pages = Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 2);
  const rest = await mapConcurrent(pages, 8, async (page) => {
    const response = await fetchWithRetry(`${baseUrl}${separator}per_page=100&page=${page}${fieldParam}`);
    return response.json();
  });
  values.push(...rest.flat());
  if (values.length !== total) throw new Error(`${baseUrl} reported ${total} records but returned ${values.length}.`);
  return values;
}

async function loadTerms(taxonomy) {
  const cacheFile = path.join(cacheRoot, `taxonomy-${taxonomy}.json`);
  try {
    const terms = await loadAllPages(`https://csa-iot.org/wp-json/wp/v2/${taxonomy}`, "id,name");
    await writeFile(cacheFile, `${JSON.stringify(terms)}\n`);
    return new Map(terms.map((term) => [term.id, term.name]));
  } catch (error) {
    try {
      const terms = JSON.parse(await readFile(cacheFile, "utf8"));
      console.warn(`CSA taxonomy ${taxonomy} unavailable; using the cached official taxonomy.`);
      return new Map(terms.map((term) => [term.id, term.name]));
    } catch {
      console.warn(`CSA taxonomy ${taxonomy} unavailable: ${error.message}`);
      return new Map();
    }
  }
}

async function loadCsaIndex() {
  const fields = "id,slug,link,title,content,excerpt,date,modified,product_company,product_device_type,product_type";
  const cacheFile = path.join(cacheRoot, "csa-index.json");
  let values;
  try {
    values = await loadAllPages(`${csaApi}?product_category=1049&orderby=id&order=asc`, fields);
    await writeFile(cacheFile, `${JSON.stringify(values)}\n`);
  } catch (error) {
    values = JSON.parse(await readFile(cacheFile, "utf8"));
    console.warn(`CSA index unavailable; using ${values.length} cached official certification records: ${error.message}`);
  }
  return { records: limit ? values.slice(0, limit) : values, sourceTotal: values.length };
}

async function cachedDetail(record) {
  const file = path.join(detailsRoot, `${record.id}.html`);
  try {
    return await readFile(file, "utf8");
  } catch {
    const html = await (await fetchWithRetry(record.link)).text();
    await writeFile(file, html);
    return html;
  }
}

async function loadCommunityRecords() {
  const records = JSON.parse(await readFile(path.join(communityRoot, "devices/devices.json"), "utf8"));
  return new Map(records
    .map((record) => [String(record.certification_id ?? "").replace(/^Certificate ID:\s*/i, "").trim(), record])
    .filter(([id]) => id));
}

async function buildImage(record, detail, community, slug) {
  const target = path.join(stagingImages, `${slug}.webp`);
  const processed = path.join(processedImages, `${slug}.webp`);
  if (detail.imageUrl || community?.image) {
    try {
      await copyFile(processed, target);
      return {
        imagePath: `/hardware-directory-images/matter-devices/${slug}.webp`,
        imageQuality: "cached-product-image",
        imageSourceUrl: detail.imageUrl || `https://github.com/matterdatabase/matterdatabase/blob/${communityRevision}/devices/${community.image}`,
      };
    } catch {
      // Missing cached image continues to the verified source below.
    }
  }
  if (detail.imageUrl) {
    try {
      const body = Buffer.from(await (await fetchWithRetry(detail.imageUrl)).arrayBuffer());
      const metadata = await sharp(body).metadata();
      await sharp(body).rotate().resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 78, effort: 4 }).toFile(target);
      await copyFile(target, processed);
      return {
        imagePath: `/hardware-directory-images/matter-devices/${slug}.webp`,
        imageQuality: Math.min(metadata.width ?? 0, metadata.height ?? 0) >= 180 ? "official-high-resolution" : "official-low-resolution",
        imageSourceUrl: detail.imageUrl,
      };
    } catch {
      // A broken official image can still be satisfied by verified community enrichment.
    }
  }
  if (community?.image) {
    try {
      const source = path.join(communityRoot, "devices", community.image);
      await sharp(source).rotate().resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 78, effort: 4 }).toFile(target);
      await copyFile(target, processed);
      return {
        imagePath: `/hardware-directory-images/matter-devices/${slug}.webp`,
        imageQuality: "community-product-image",
        imageSourceUrl: `https://github.com/matterdatabase/matterdatabase/blob/${communityRevision}/devices/${community.image}`,
      };
    } catch {
      return {};
    }
  }
  return {};
}

await mkdir(cacheRoot, { recursive: true });
await mkdir(detailsRoot, { recursive: true });
await mkdir(processedImages, { recursive: true });
await rm(stagingRoot, { force: true, recursive: true });
await mkdir(stagingImages, { recursive: true });
await mkdir(stagingRecordBatches, { recursive: true });

const startedAt = new Date().toISOString();
const [{ records: csaRecords, sourceTotal }, companies, deviceTypes, productTypes, communityByCertificate] = await Promise.all([
  loadCsaIndex(),
  loadTerms("product_company"),
  loadTerms("product_device_type"),
  loadTerms("product_type"),
  loadCommunityRecords(),
]);
const failures = [];
let detailTotal = 0;
let imageTotal = 0;
let communityMatchTotal = 0;
let certificationRecordTotal = 0;
const batchFiles = [];
const productGroups = new Map();

const batchSize = 250;
for (let offset = 0; offset < csaRecords.length; offset += batchSize) {
  const sourceBatch = csaRecords.slice(offset, offset + batchSize);
  const batch = await mapConcurrent(sourceBatch, 10, async (apiRecord) => {
    try {
      const detail = parseMatterProductDetail(await cachedDetail(apiRecord));
      const certificate = detail.fields.get("Certificate ID");
      if (!certificate) throw new Error("CSA detail page has no certificate ID");
      detailTotal += 1;
      const community = communityByCertificate.get(certificate) ?? null;
      if (community) communityMatchTotal += 1;
      const company = companies.get(apiRecord.product_company?.[0]) ?? detail.company;
      const deviceType = deviceTypes.get(apiRecord.product_device_type?.[0])
        ?? (detail.fields.get("Primary Device Type ID") ? `Device type ${detail.fields.get("Primary Device Type ID")}` : "Device type not published");
      const productType = productTypes.get(apiRecord.product_type?.[0]) ?? detail.fields.get("Product Type") ?? "";
      const slug = slugify(`${company}-${apiRecord.title?.rendered}-${certificate}`) || `matter-${apiRecord.id}`;
      const image = await buildImage(apiRecord, detail, community, slug);
      if (image.imagePath) imageTotal += 1;
      return buildMatterRecord(apiRecord, detail, { ...image, community, company, deviceType, productType, slug });
    } catch (error) {
      failures.push({ id: apiRecord.id, name: apiRecord.title?.rendered ?? apiRecord.slug, reason: error.message, url: apiRecord.link });
      return null;
    }
  });
  const validBatch = batch.filter(Boolean);
  certificationRecordTotal += validBatch.length;
  for (const record of validBatch) addMatterRecordToGroups(productGroups, record);
  const batchFile = path.join(stagingRecordBatches, `${String(offset / batchSize).padStart(4, "0")}.json`);
  await writeFile(batchFile, JSON.stringify(validBatch));
  batchFiles.push(batchFile);
  for (let index = offset; index < Math.min(offset + batchSize, csaRecords.length); index += 1) csaRecords[index] = null;
  console.log(`${Math.min(offset + batchSize, csaRecords.length)}/${csaRecords.length} CSA certifications`);
}

const groupedRecords = finalizeMatterGroups(productGroups, { slugify });
const groupedImageDirectory = path.join(stagingRoot, "product-images");
await mkdir(groupedImageDirectory, { recursive: true });
for (const record of groupedRecords) {
  if (!record.image_source_slug) continue;
  await copyFile(path.join(stagingImages, `${record.image_source_slug}.webp`), path.join(groupedImageDirectory, `${record.slug}.webp`));
}
await rm(stagingImages, { force: true, recursive: true });
await rename(groupedImageDirectory, stagingImages);
const imageFailures = groupedRecords
  .filter((record) => !record.image_path || !record.image_source_url)
  .map((record) => ({ name: record.name, reason: "No exact product image found for any certification in this product group", slug: record.slug, vendor: record.vendor }));
const groupedImageTotal = groupedRecords.length - imageFailures.length;
const eligibleTotal = groupedRecords.length;
const readyForCatalog = !Number.isInteger(limit)
  && certificationRecordTotal === sourceTotal
  && detailTotal === sourceTotal
  && failures.length === 0;
const readyForPublication = readyForCatalog && groupedImageTotal === groupedRecords.length;
const meta = {
  coverage: {
    certification_detail_total: detailTotal,
    certification_total: certificationRecordTotal,
    community_match_total: communityMatchTotal,
    detail_total: groupedRecords.length,
    eligible_total: eligibleTotal,
    excluded_total: 0,
    failures,
    image_failures: imageFailures,
    image_total: groupedImageTotal,
    missing_image_total: groupedRecords.length - groupedImageTotal,
    record_total: groupedRecords.length,
    source_total: sourceTotal,
  },
  generated_at: new Date().toISOString(),
  ready_for_catalog: readyForCatalog,
  ready_for_publication: readyForPublication,
  source_label: "Connectivity Standards Alliance Matter certifications with Matter Database enrichment",
  source_revision: `CSA ${startedAt}; Matter Database ${communityRevision}`,
  source_url: "https://csa-iot.org/csa-iot_products/",
};
await writeFile(stagingData, `{\n  "meta": ${JSON.stringify(meta, null, 2).replaceAll("\n", "\n  ")},\n  "records": [\n`);
let firstRecord = true;
for (const groupedRecord of groupedRecords) {
  const { image_source_slug: _imageSourceSlug, ...record } = groupedRecord;
  await appendFile(stagingData, `${firstRecord ? "" : ",\n"}${JSON.stringify(record)}`);
  firstRecord = false;
}
await appendFile(stagingData, "\n  ]\n}\n");
await writeFile(reportPath, `${JSON.stringify(meta, null, 2)}\n`);

if (!readyForCatalog) {
  console.error(`Staged ${groupedRecords.length} Matter product groups covering ${certificationRecordTotal}/${sourceTotal} certifications with ${groupedImageTotal} product images. See ${reportPath}.`);
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
  console.log(`Wrote ${groupedRecords.length} Matter product groups covering all ${certificationRecordTotal} certifications with ${groupedImageTotal} exact product images; ${imageFailures.length} records retain an explicit missing-image state.`);
}
