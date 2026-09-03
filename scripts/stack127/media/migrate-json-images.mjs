#!/usr/bin/env node

import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  contentDigest,
  extensionForContentType,
  imageContentType,
  mediaObjectPath,
  uploadMediaObject,
} from "./storage.mjs";

function parseArgs(argv = process.argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

function safeSlugFromPath(imagePath) {
  return path.posix.basename(imagePath, path.posix.extname(imagePath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectImagePaths(value, localPrefix, output = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectImagePaths(item, localPrefix, output);
    return output;
  }
  if (!value || typeof value !== "object") return output;
  for (const [key, item] of Object.entries(value)) {
    if (key === "image_path" && typeof item === "string" && item.startsWith(localPrefix)) {
      output.add(item);
    } else {
      collectImagePaths(item, localPrefix, output);
    }
  }
  return output;
}

function replaceImagePaths(value, replacements) {
  if (Array.isArray(value)) {
    for (const item of value) replaceImagePaths(item, replacements);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    if (key === "image_path" && replacements.has(item)) value[key] = replacements.get(item);
    else replaceImagePaths(item, replacements);
  }
}

async function mapConcurrent(items, workerCount, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await callback(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(workerCount, items.length || 1) }, () => worker()));
  return results;
}

async function main() {
  const args = parseArgs();
  if (!args.file || !args.directory || !args["local-prefix"]) {
    throw new Error("Usage: migrate-json-images.mjs --file <snapshot.json> --directory <slug> --local-prefix </public-path/> [--asset-root <repo>] [--write]");
  }

  const file = path.resolve(args.file);
  const assetRoot = path.resolve(args["asset-root"] ?? process.cwd());
  const localPrefix = String(args["local-prefix"]);
  if (!localPrefix.startsWith("/") || !localPrefix.endsWith("/")) {
    throw new Error("local-prefix must start and end with /");
  }

  const data = JSON.parse(await readFile(file, "utf8"));
  const imagePaths = [...collectImagePaths(data, localPrefix)].sort();
  const workers = Math.max(1, Math.min(Number(args.workers) || 24, 32));
  let completed = 0;
  const uploaded = await mapConcurrent(imagePaths, workers, async (imagePath) => {
    const sourceFile = path.resolve(assetRoot, "public", imagePath.slice(1));
    const expectedRoot = path.resolve(assetRoot, "public", localPrefix.slice(1));
    if (!sourceFile.startsWith(`${expectedRoot}${path.sep}`)) throw new Error(`unsafe image path: ${imagePath}`);
    const bytes = await readFile(sourceFile);
    const contentType = imageContentType(bytes);
    const objectPath = mediaObjectPath({
      directory: args.directory,
      digest: contentDigest(bytes),
      extension: extensionForContentType(contentType),
      kind: "images",
      slug: safeSlugFromPath(imagePath),
    });
    const managedUrl = await uploadMediaObject({ bytes, contentType, objectPath });
    completed += 1;
    if (completed % 100 === 0 || completed === imagePaths.length) {
      console.log(`uploaded ${completed}/${imagePaths.length}`);
    }
    return [imagePath, managedUrl];
  });

  const replacements = new Map(uploaded);
  replaceImagePaths(data, replacements);
  if (args.write) {
    const tempFile = `${file}.stack127-media-${process.pid}.tmp`;
    await writeFile(tempFile, `${JSON.stringify(data, null, 2)}\n`);
    await rename(tempFile, file);
  }
  console.log(JSON.stringify({ directory: args.directory, images: imagePaths.length, written: Boolean(args.write) }));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
