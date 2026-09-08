#!/usr/bin/env node

import { execFile } from "node:child_process";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import { exactDatasheetModel, parsePdfImageList, selectProductImage } from "../stack127/lib/pdf-product-images.mjs";

const execute = promisify(execFile);
const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const cacheRoot = path.resolve(process.env.STACK127_NUT_CACHE ?? "/tmp/stack127-nut-hcl-cache");
const pdfRoot = path.join(cacheRoot, "tripp-lite-pdfs");
const extractedRoot = path.join(cacheRoot, "tripp-lite-extracted");
const enrichedRoot = path.join(cacheRoot, "enriched-images");
const staging = JSON.parse(await readFile(path.join(cacheRoot, "staging/nut-compatible-ups.json"), "utf8"));
const candidates = staging.records.filter((record) => record.vendor === "Tripp Lite" && !record.image_source_url);

function normalized(value) {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

async function downloadPdf(model, target) {
  try {
    await access(target);
    return;
  } catch {
    // Download below.
  }
  const url = `https://assets.tripplite.com/product-pdfs/en/${model.toLowerCase()}.pdf`;
  const curlArgs = ["-L", "-sS", "--fail", "-o", target, url];
  if (process.env.TRIPPLITE_ASSET_IP) curlArgs.unshift("--resolve", `assets.tripplite.com:443:${process.env.TRIPPLITE_ASSET_IP}`);
  await execute("curl", curlArgs, { timeout: 60_000 });
  const magic = await readFile(target);
  if (!magic.subarray(0, 4).equals(Buffer.from("%PDF"))) throw new Error("Vendor response is not a PDF");
}

async function research(record) {
  const model = exactDatasheetModel(record.model);
  if (!model) return { model: record.model, reason: "Model is not an exact datasheet token", slug: record.slug, status: "unresolved" };
  const pdf = path.join(pdfRoot, `${record.slug}.pdf`);
  const prefix = path.join(extractedRoot, record.slug);
  try {
    await downloadPdf(model, pdf);
    const { stdout: firstPageText } = await execute("pdftotext", ["-f", "1", "-l", "1", pdf, "-"]);
    if (!normalized(firstPageText).includes(normalized(model))) throw new Error("First page does not identify the exact model");
    const { stdout: list } = await execute("pdfimages", ["-f", "1", "-l", "1", "-list", pdf]);
    const selected = selectProductImage(parsePdfImageList(list));
    if (!selected) throw new Error("No unambiguous large first-page product image");
    await execute("pdfimages", ["-f", "1", "-l", "1", "-j", pdf, prefix]);
    const base = `${prefix}-${String(selected.number).padStart(3, "0")}`;
    const extracted = (await readdir(extractedRoot)).find((name) => name.startsWith(path.basename(base) + "."));
    if (!extracted) throw new Error("Selected embedded image was not extracted");
    const target = path.join(enrichedRoot, `${record.slug}.webp`);
    await sharp(path.join(extractedRoot, extracted)).rotate().resize(440, 440, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 80, effort: 4 }).toFile(target);
    return {
      image_cache_file: path.relative(cacheRoot, target),
      image_source_url: `https://assets.tripplite.com/product-pdfs/en/${model.toLowerCase()}.pdf`,
      model,
      quality: "official-datasheet-product-image",
      slug: record.slug,
      status: "resolved",
    };
  } catch (error) {
    return { model, reason: error.message, slug: record.slug, status: "unresolved" };
  }
}

async function mapConcurrent(values, concurrency, callback) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await callback(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

await Promise.all([pdfRoot, extractedRoot, enrichedRoot].map((directory) => mkdir(directory, { recursive: true })));
const records = await mapConcurrent(candidates, 4, research);
const resolvedTotal = records.filter((record) => record.status === "resolved").length;
const report = { generated_at: new Date().toISOString(), source_total: candidates.length, resolved_total: resolvedTotal, unresolved_total: records.length - resolvedTotal, records };
const reportPath = path.join(repositoryRoot, "content_docs/nut-compatible-ups/tripp-lite-image-research.json");
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ source_total: candidates.length, resolved_total: resolvedTotal, unresolved_total: records.length - resolvedTotal, report: path.relative(repositoryRoot, reportPath) }, null, 2));
