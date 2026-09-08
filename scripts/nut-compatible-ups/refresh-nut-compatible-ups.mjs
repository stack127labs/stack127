#!/usr/bin/env node

import { copyFile, cp, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { buildNutRecord, groupUpsRows, parseNutHcl } from "./lib/catalog.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const sourceRoot = path.resolve(process.argv[2] ?? "/tmp/stack127-nut-source");
const commit = process.argv[3];
if (!/^[a-f0-9]{40}$/.test(commit ?? "")) throw new Error("Pass the pinned 40-character NUT source revision as the second argument.");

const cacheRoot = path.resolve(process.env.STACK127_NUT_CACHE ?? "/tmp/stack127-nut-hcl-cache");
const stagingRoot = path.join(cacheRoot, "staging");
const stagingImages = path.join(stagingRoot, "images");
const stagingData = path.join(stagingRoot, "nut-compatible-ups.json");
const outputImages = path.join(repositoryRoot, "public/hardware-directory-images/nut-compatible-ups");
const outputData = path.join(repositoryRoot, "lib/hardware-directories/data/nut-compatible-ups.json");
const reportPath = path.join(repositoryRoot, "content_docs/nut-compatible-ups/refresh-report.json");

function slugify(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function loadLegacyImages() {
  try {
    const snapshot = JSON.parse(await readFile(outputData, "utf8"));
    return new Map(snapshot.records.map((record) => {
      const hclModel = record.facts?.find((fact) => fact.label === "HCL model record")?.value ?? record.model;
      return [`${record.vendor}\u0000${hclModel}`, record];
    }));
  } catch {
    return new Map();
  }
}

async function loadResearchedImages() {
  const records = [];
  for (const reportName of ["tripp-lite-image-research.json", "cyberpower-image-research.json"]) {
    try {
      const report = JSON.parse(await readFile(path.join(repositoryRoot, "content_docs/nut-compatible-ups", reportName), "utf8"));
      records.push(...report.records.filter((record) => record.status === "resolved" && record.image_cache_file && record.image_source_url));
    } catch {
      // A vendor report is optional until that vendor's research pass is complete.
    }
  }
  return new Map(records.map((record) => [record.slug, record]));
}

await mkdir(cacheRoot, { recursive: true });
await rm(stagingRoot, { force: true, recursive: true });
await mkdir(stagingImages, { recursive: true });

const sourceText = await readFile(path.join(sourceRoot, "data/driver.list.in"), "utf8");
const sourceRows = parseNutHcl(sourceText);
const upsRows = sourceRows.filter((row) => row.type === "ups");
const groups = groupUpsRows(sourceRows);
const legacyImages = await loadLegacyImages();
const researchedImages = await loadResearchedImages();
const imageFailures = [];
let imageTotal = 0;
let familyTotal = 0;

const records = [];
const usedSlugs = new Set();
for (const group of groups) {
  const baseSlug = slugify(`${group.manufacturer}-${group.model}`) || "ups-record";
  let slug = baseSlug;
  let suffix = 2;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  usedSlugs.add(slug);
  const legacy = legacyImages.get(`${group.manufacturer}\u0000${group.model}`);
  const researchedCandidate = researchedImages.get(baseSlug);
  const researched = researchedCandidate?.model === group.model ? researchedCandidate : null;
  let image = {};
  if (researched) {
    try {
      await copyFile(path.join(cacheRoot, researched.image_cache_file), path.join(stagingImages, `${slug}.webp`));
      image = {
        imagePath: `/hardware-directory-images/nut-compatible-ups/${slug}.webp`,
        imageQuality: researched.quality,
        imageSourceUrl: researched.image_source_url,
      };
      imageTotal += 1;
    } catch {
      // The record is added to the explicit image research queue below.
    }
  }
  if (!image.imagePath && legacy?.image_path && legacy?.image_source_url) {
    try {
      await copyFile(path.join(repositoryRoot, "public", legacy.image_path.replace(/^\//, "")), path.join(stagingImages, `${slug}.webp`));
      image = {
        imagePath: `/hardware-directory-images/nut-compatible-ups/${slug}.webp`,
        imageQuality: "official-product-image",
        imageSourceUrl: legacy.image_source_url,
      };
      imageTotal += 1;
    } catch {
      // The record is added to the explicit image research queue below.
    }
  }
  const record = buildNutRecord(group, { ...image, commit, slug });
  if (record.category === "Product family") familyTotal += 1;
  if (!record.image_path) imageFailures.push({ manufacturer: group.manufacturer, model: group.model, reason: "Official product image not researched", slug });
  records.push(record);
}

records.sort((left, right) => left.vendor.localeCompare(right.vendor) || left.model.localeCompare(right.model));
const excludedByType = Object.fromEntries([...new Set(sourceRows.filter((row) => row.type !== "ups").map((row) => row.type))]
  .sort()
  .map((type) => [type, sourceRows.filter((row) => row.type === type).length]));
const readyForCatalog = records.length === groups.length;
const readyForPublication = readyForCatalog && imageTotal === groups.length;
const snapshot = {
  meta: {
    coverage: {
      detail_total: records.length,
      eligible_total: groups.length,
      exact_model_total: groups.length - familyTotal,
      excluded_by_type: excludedByType,
      excluded_total: sourceRows.length - upsRows.length,
      failures: [],
      image_failures: imageFailures,
      family_record_total: familyTotal,
      image_total: imageTotal,
      missing_image_total: groups.length - imageTotal,
      record_total: records.length,
      source_total: sourceRows.length,
      ups_source_row_total: upsRows.length,
    },
    generated_at: new Date().toISOString(),
    ready_for_catalog: readyForCatalog,
    ready_for_publication: readyForPublication,
    source_label: "Network UPS Tools hardware compatibility list",
    source_revision: commit,
    source_url: `https://github.com/networkupstools/nut/blob/${commit}/data/driver.list.in`,
  },
  records,
};
await writeFile(stagingData, `${JSON.stringify(snapshot, null, 2)}\n`);
await writeFile(reportPath, `${JSON.stringify(snapshot.meta, null, 2)}\n`);

if (!readyForCatalog) {
  console.error(`Staged ${records.length} UPS cards from ${upsRows.length} HCL rows with ${imageTotal} researched product images. See ${reportPath}.`);
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
  console.log(`Wrote all ${records.length} NUT-compatible UPS cards with ${imageTotal} exact product images; ${imageFailures.length} records retain an explicit missing-image state.`);
}
