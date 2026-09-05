#!/usr/bin/env node

import { createRequire } from "node:module";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  buildCatalog,
  parseCompatibilityRecord,
} from "./lib/catalog.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "../..");
const outputPath = path.join(repositoryRoot, "lib/zigbee-devices/data/devices.json");
const imageOutputDirectory = path.join(repositoryRoot, "public/zigbee-device-images");
const supplementalImageDirectory = path.resolve(argument("--supplemental-image-dir") ?? process.env.ZIGBEE_SUPPLEMENTAL_IMAGE_DIR ?? "/tmp/stack127-zigbee-supplemental-images");

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const packageDirectory = path.resolve(
  argument("--z2m-package-dir") ?? process.env.ZIGBEE2MQTT_CONVERTERS_DIR ?? "",
);
const blakadderDirectory = path.resolve(
  argument("--blakadder-dir") ?? process.env.BLAKADDER_ZIGBEE_DIR ?? "",
);
const z2mIoDirectory = path.resolve(
  argument("--z2m-io-dir") ?? process.env.ZIGBEE2MQTT_IO_DIR ?? "",
);
const checkOnly = process.argv.includes("--check");
const reportOnly = process.argv.includes("--report");

if (!packageDirectory || packageDirectory === repositoryRoot) {
  throw new Error("Pass --z2m-package-dir with an installed zigbee-herdsman-converters package.");
}

if (!blakadderDirectory || blakadderDirectory === repositoryRoot) {
  throw new Error("Pass --blakadder-dir with a blakadder/zigbee checkout.");
}

if (!z2mIoDirectory || z2mIoDirectory === repositoryRoot) {
  throw new Error("Pass --z2m-io-dir with a pinned Koenkk/zigbee2mqtt.io checkout.");
}

const requireFromPackage = createRequire(path.join(packageDirectory, "package.json"));
const packageJson = requireFromPackage(path.join(packageDirectory, "package.json"));
const converterApi = requireFromPackage(path.join(packageDirectory, "dist/index.js"));
const rawDefinitions = requireFromPackage(path.join(packageDirectory, "dist/devices/index.js")).default;
const definitions = rawDefinitions.map((definition) => converterApi.prepareDefinition(definition));
const zigbeeDirectory = path.join(blakadderDirectory, "_zigbee");
const blakadderImageDirectory = path.join(blakadderDirectory, "assets/images/devices");
const records = [];

for (const fileName of (await readdir(zigbeeDirectory)).filter((name) => name.endsWith(".md")).sort()) {
  const text = await readFile(path.join(zigbeeDirectory, fileName), "utf8");
  const record = parseCompatibilityRecord(text, fileName);
  if (record) records.push(record);
}

async function readGitCommit(directory) {
  const explicit = argument("--blakadder-commit");
  if (explicit) return explicit.trim();

  const head = (await readFile(path.join(directory, ".git/HEAD"), "utf8")).trim();
  if (!head.startsWith("ref: ")) return head;

  return (await readFile(path.join(directory, ".git", head.slice(5)), "utf8")).trim();
}

const blakadderCommit = await readGitCommit(blakadderDirectory);
async function readRepositoryCommit(directory, argumentName) {
  const explicit = argument(argumentName);
  if (explicit) return explicit.trim();
  const head = (await readFile(path.join(directory, ".git/HEAD"), "utf8")).trim();
  if (!head.startsWith("ref: ")) return head;
  return (await readFile(path.join(directory, ".git", head.slice(5)), "utf8")).trim();
}

const z2mIoCommit = await readRepositoryCommit(z2mIoDirectory, "--z2m-io-commit");
const z2mImageDirectory = path.join(z2mIoDirectory, "public/images/devices");
const availableZ2mImages = (await readdir(z2mImageDirectory)).filter((name) => /\.(?:png|jpe?g|webp)$/i.test(name));
const blakadderImages = (await readdir(blakadderImageDirectory)).filter((name) => name.endsWith(".webp"));
const normalizeAssetName = (value) => value.replace(/\.(?:md|webp)$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const blakadderImagesByNormalizedName = new Map();
for (const image of blakadderImages) {
  const key = normalizeAssetName(image);
  const values = blakadderImagesByNormalizedName.get(key) ?? [];
  values.push(image);
  blakadderImagesByNormalizedName.set(key, values);
}
const blakadderImageFiles = {};
for (const record of records) {
  const exact = record.fileName.replace(/\.md$/i, ".webp");
  const matches = blakadderImagesByNormalizedName.get(normalizeAssetName(record.fileName)) ?? [];
  blakadderImageFiles[record.fileName] = blakadderImages.includes(exact) ? exact : matches.sort((left, right) => left.localeCompare(right))[0] ?? null;
}
await mkdir(supplementalImageDirectory, { recursive: true });
const imageEnrichment = JSON.parse(await readFile(path.join(scriptDirectory, "image-enrichment.json"), "utf8"));
const supplementalImageFiles = {};
const supplementalImageUrls = {};
for (const item of imageEnrichment) {
  const target = path.join(supplementalImageDirectory, item.file_name);
  try {
    await access(target);
  } catch {
    const response = await fetch(item.image_source_url, { headers: { accept: "image/avif,image/webp,image/png,image/jpeg,*/*", "user-agent": "stack127 catalog refresh (+https://stack127.com)" }, redirect: "follow", signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Supplemental Zigbee image failed: ${response.status} ${item.image_source_url}`);
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
  }
  supplementalImageFiles[item.source_record] = item.file_name;
  supplementalImageUrls[item.source_record] = item.image_source_url;
}
const z2mAddedAt = {};
for (const fileName of (await readdir(path.join(z2mIoDirectory, "docs/devices"))).filter((name) => name.endsWith(".md"))) {
  const text = await readFile(path.join(z2mIoDirectory, "docs/devices", fileName), "utf8");
  const model = text.match(/^\| Model \|\s*([^|]+?)\s*\|/m)?.[1]?.trim();
  const addedAt = text.match(/^addedAt:\s*([^\s]+)/m)?.[1]?.slice(0, 10);
  if (model && addedAt) z2mAddedAt[model] = addedAt;
}
const generatedAt = argument("--generated-at") ?? new Date().toISOString();
const catalog = buildCatalog({
  availableZ2mImages,
  blakadderCommit,
  blakadderImageFiles,
  compatibilityRecords: records,
  definitions,
  generatedAt,
  packageVersion: packageJson.version,
  supplementalImageFiles,
  supplementalImageUrls,
  z2mAddedAt,
  z2mIoCommit,
});
const publicCatalog = {
  ...catalog,
  devices: catalog.devices.map(({ image_source_file: _imageSourceFile, ...device }) => device),
};
const output = `${JSON.stringify(publicCatalog, null, 2)}\n`;

function sourceImagePath(device) {
  if (device.image_source_file?.startsWith("z2m:")) return path.join(z2mImageDirectory, device.image_source_file.slice(4));
  if (device.image_source_file?.startsWith("blakadder:")) return path.join(blakadderImageDirectory, device.image_source_file.slice("blakadder:".length));
  if (device.image_source_file?.startsWith("supplemental:")) return path.join(supplementalImageDirectory, device.image_source_file.slice("supplemental:".length));
  throw new Error(`Missing image source filename for ${device.slug}.`);
}

async function assertImageSources() {
  for (const device of catalog.devices) {
    await access(sourceImagePath(device));
  }
}

async function verifyGeneratedImages() {
  const files = (await readdir(imageOutputDirectory)).filter((file) => file.endsWith(".webp"));
  const expected = new Set(catalog.devices.map((device) => `${device.slug}.webp`));

  if (files.length !== expected.size || files.some((file) => !expected.has(file))) {
    throw new Error("The committed Zigbee image set does not match the device snapshot.");
  }

  await access(path.join(imageOutputDirectory, "LICENSE-MIT.txt"));
    await access(path.join(imageOutputDirectory, "LICENSE-EPL-2.0.txt"));
    await access(path.join(imageOutputDirectory, "LICENSE-GPL-3.0.txt"));
  await access(path.join(imageOutputDirectory, "NOTICE.txt"));
}

async function generateImages() {
  const publicDirectory = path.dirname(imageOutputDirectory);
  await mkdir(publicDirectory, { recursive: true });
  const temporaryDirectory = await mkdtemp(path.join(publicDirectory, ".zigbee-device-images-"));

  try {
    const concurrency = 8;
    for (let index = 0; index < catalog.devices.length; index += concurrency) {
      await Promise.all(catalog.devices.slice(index, index + concurrency).map(async (device) => {
        await sharp(sourceImagePath(device))
          .rotate()
          .resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .webp({ alphaQuality: 90, quality: 78, effort: 4, smartSubsample: true })
          .toFile(path.join(temporaryDirectory, `${device.slug}.webp`));
      }));
    }

    await writeFile(
      path.join(temporaryDirectory, "NOTICE.txt"),
      `Device images are normalized copies from Koenkk/zigbee2mqtt.io at commit ${z2mIoCommit} and blakadder/zigbee at commit ${blakadderCommit}.\nSources: https://github.com/Koenkk/zigbee2mqtt.io and https://github.com/blakadder/zigbee\n`,
    );
    await writeFile(
      path.join(temporaryDirectory, "LICENSE-MIT.txt"),
      await readFile(path.join(blakadderDirectory, "LICENSE"), "utf8"),
    );
    await writeFile(
      path.join(temporaryDirectory, "LICENSE-EPL-2.0.txt"),
      await readFile(path.join(blakadderDirectory, "LICENSE.md"), "utf8"),
    );
    await writeFile(
      path.join(temporaryDirectory, "LICENSE-GPL-3.0.txt"),
      await readFile(path.join(z2mIoDirectory, "LICENSE"), "utf8"),
    );

    await rm(imageOutputDirectory, { force: true, recursive: true });
    await rename(temporaryDirectory, imageOutputDirectory);
  } catch (error) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }
}

await assertImageSources();

if (reportOnly) {
  console.log(JSON.stringify({ devices: publicCatalog.devices.length, coverage: publicCatalog.meta.coverage }, null, 2));
  if (!publicCatalog.meta.ready_for_publication) process.exitCode = 1;
} else if (checkOnly) {
  const existing = await readFile(outputPath, "utf8");
  const existingCatalog = JSON.parse(existing);
  publicCatalog.meta.generated_at = existingCatalog.meta.generated_at;
  const comparable = `${JSON.stringify(publicCatalog, null, 2)}\n`;

  if (comparable !== existing) {
    throw new Error("The committed Zigbee device snapshot differs from these pinned sources.");
  }

  await verifyGeneratedImages();

  console.log(`Verified ${catalog.devices.length} Zigbee device records and images.`);
} else {
  await generateImages();
  await writeFile(outputPath, output);
  console.log(JSON.stringify({
    devices: publicCatalog.devices.length,
    coverage: publicCatalog.meta.coverage,
    output: path.relative(repositoryRoot, outputPath),
    sources: {
      blakadder: blakadderCommit,
      zigbee2mqtt: packageJson.version,
      zigbee2mqttIo: z2mIoCommit,
    },
  }, null, 2));
}
