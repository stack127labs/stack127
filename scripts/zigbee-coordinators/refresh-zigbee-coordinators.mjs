#!/usr/bin/env node

import { copyFile, cp, mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { parseCompatibilityRecord } from "../zigbee-devices/lib/catalog.mjs";
import { buildCoordinatorRecord, findChipset, findConnection } from "./lib/catalog.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const sourceRoot = path.resolve(process.argv[2] ?? "/tmp/stack127-blakadder-source");
const commit = process.argv[3];
if (!/^[a-f0-9]{40}$/.test(commit ?? "")) throw new Error("Pass the pinned 40-character source revision as the second argument.");
const recordsRoot = path.join(sourceRoot, "_zigbee");
const sourceImages = path.join(sourceRoot, "assets/images/devices");
const cacheRoot = path.resolve(process.env.STACK127_ZIGBEE_COORDINATOR_CACHE ?? "/tmp/stack127-zigbee-coordinator-cache");
const stagingRoot = path.join(cacheRoot, "staging");
const stagingImages = path.join(stagingRoot, "images");
const stagingData = path.join(stagingRoot, "zigbee-coordinators.json");
const outputImages = path.join(repositoryRoot, "public/hardware-directory-images/zigbee-coordinators");
const outputData = path.join(repositoryRoot, "lib/hardware-directories/data/zigbee-coordinators.json");
const reportPath = path.join(repositoryRoot, "content_docs/zigbee-coordinators/refresh-report.json");

function frontmatterValue(text, key) {
  const block = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? "";
  const line = block.split(/\r?\n/).find((entry) => entry.startsWith(`${key}:`));
  return line ? line.slice(key.length + 1).trim().replace(/^['"]|['"]$/g, "") : "";
}

function slugify(value) {
  return String(value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

await mkdir(cacheRoot, { recursive: true });
await rm(stagingRoot, { force: true, recursive: true });
await mkdir(stagingImages, { recursive: true });

const files = (await readdir(recordsRoot)).filter((file) => file.endsWith(".md")).sort();
const sourceRecords = [];
for (const fileName of files) {
  const text = await readFile(path.join(recordsRoot, fileName), "utf8");
  const parsed = parseCompatibilityRecord(text, fileName);
  if (parsed?.category.toLowerCase() === "coordinator") sourceRecords.push({ fileName, parsed, text });
}

const records = [];
const failures = [];
const usedSlugs = new Set();
let imageTotal = 0;

for (const source of sourceRecords) {
  const { fileName, parsed, text } = source;
  const sourceImageName = fileName.replace(/\.md$/i, ".webp");
  const sourceImagePath = path.join(sourceImages, sourceImageName);
  let slug = slugify(`${parsed.vendor}-${parsed.model}`);
  if (usedSlugs.has(slug)) slug = `${slug}-${slugify(fileName.replace(/\.md$/i, ""))}`;
  usedSlugs.add(slug);
  try {
    await sharp(sourceImagePath).rotate().resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 78, effort: 4 }).toFile(path.join(stagingImages, `${slug}.webp`));
    imageTotal += 1;
  } catch (error) {
    failures.push({ file: fileName, reason: `Source product image failed: ${error.message}` });
    continue;
  }
  const combined = `${parsed.title} ${parsed.model} ${text}`;
  const recordUrl = `https://zigbee.blakadder.com/${fileName.replace(/\.md$/i, ".html")}`;
  records.push(buildCoordinatorRecord(parsed, {
    chipset: findChipset(combined),
    connection: findConnection(combined),
    imagePath: `/hardware-directory-images/zigbee-coordinators/${slug}.webp`,
    imageSourceUrl: `https://github.com/blakadder/zigbee/blob/${commit}/assets/images/devices/${encodeURIComponent(sourceImageName)}`,
    manufacturerUrl: frontmatterValue(text, "mlink"),
    pinnedRecordUrl: `https://github.com/blakadder/zigbee/blob/${commit}/_zigbee/${encodeURIComponent(fileName)}`,
    recordUrl,
    slug,
  }));
}

records.sort((left, right) => left.vendor.localeCompare(right.vendor) || left.model.localeCompare(right.model));
const readyForPublication = records.length === sourceRecords.length && imageTotal === sourceRecords.length && failures.length === 0;
const snapshot = {
  meta: {
    coverage: {
      detail_total: records.length,
      eligible_total: sourceRecords.length,
      excluded_total: files.length - sourceRecords.length,
      failures,
      image_total: imageTotal,
      missing_image_total: sourceRecords.length - imageTotal,
      record_total: records.length,
      source_total: files.length,
    },
    generated_at: new Date().toISOString(),
    ready_for_catalog: records.length === sourceRecords.length && failures.length === 0,
    ready_for_publication: readyForPublication,
    source_label: "Blakadder Zigbee coordinator records",
    source_revision: commit,
    source_url: "https://github.com/blakadder/zigbee",
  },
  records,
};
await writeFile(stagingData, `${JSON.stringify(snapshot, null, 2)}\n`);
await writeFile(reportPath, `${JSON.stringify(snapshot.meta, null, 2)}\n`);

if (!readyForPublication) {
  console.error(`Staged ${records.length}/${sourceRecords.length} Zigbee coordinators with ${imageTotal} product images. See ${reportPath}.`);
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
  console.log(`Wrote all ${records.length} Zigbee coordinators with product images and grouped details.`);
}
