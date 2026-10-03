#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { launchChromium, parseOptions, requiredOption } from "./browser-runtime.mjs";

const help = `Usage: node scripts/launch-directories/import-icons.mjs --input <snapshot.json> --icons-dir <directory> --url-prefix <public-url-prefix> --manifest <manifest.json> --sources <icon-sources.json> [--slugs <slugs.json>] [--extra-sources <official-alternatives.json>] [--only-missing] [--concurrency 4]

The input is a JSON array of launch-directory rows. --slugs takes a JSON array of slugs. --extra-sources maps slugs to reviewed official image candidates shaped as [{"url":"https://...","page_url":"https://...","basis":"official profile/logo link"}]. Use --only-missing to merge the current manifest and source file and inspect rows without a usable local icon.

Playwright resolves from the installed package, or from STACK127_PLAYWRIGHT_MODULE. Set STACK127_BROWSER_EXECUTABLE only when Playwright cannot find the browser.`;
const parsed = parseOptions(process.argv.slice(2), {
  valueOptions: ["--input", "--icons-dir", "--url-prefix", "--manifest", "--sources", "--slugs", "--extra-sources", "--concurrency"],
  booleanOptions: ["--only-missing"],
});
if (parsed.help) {
  console.log(help);
  process.exit(0);
}
const inputPath = resolve(requiredOption(parsed, "--input"));
const iconsDir = resolve(requiredOption(parsed, "--icons-dir"));
const urlPrefix = requiredOption(parsed, "--url-prefix").replace(/\/$/, "");
const manifestPath = resolve(requiredOption(parsed, "--manifest"));
const sourcesPath = resolve(requiredOption(parsed, "--sources"));
const concurrency = Number(parsed.values.get("--concurrency") ?? 4);
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 8) throw new Error("--concurrency must be an integer from 1 to 8");
if (!urlPrefix.startsWith("/")) throw new Error("--url-prefix must be a local public URL path");

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
async function readOptionalJson(path) {
  try { return await readJson(path); } catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

const inputRows = await readJson(inputPath);
if (!Array.isArray(inputRows)) throw new Error("--input must contain a JSON array");
const visibleRows = inputRows.filter((row) => row.is_published);
const requestedSlugs = parsed.values.has("--slugs") ? await readJson(resolve(parsed.values.get("--slugs"))) : null;
if (requestedSlugs && (!Array.isArray(requestedSlugs) || requestedSlugs.some((slug) => typeof slug !== "string"))) throw new Error("--slugs must contain a JSON array of slug strings");
const requested = requestedSlugs ? new Set(requestedSlugs) : null;
let manifest = {};
let sources = {};
if (parsed.values.get("--only-missing")) {
  const [existingManifest, existingSources] = await Promise.all([readOptionalJson(manifestPath), readOptionalJson(sourcesPath)]);
  if (!existingManifest || !existingSources) throw new Error("--only-missing requires existing --manifest and --sources files");
  manifest = existingManifest;
  sources = existingSources;
}
const extraSources = parsed.values.has("--extra-sources") ? await readJson(resolve(parsed.values.get("--extra-sources"))) : {};
const rows = visibleRows.filter((row) => (!requested || requested.has(row.slug)) && (!parsed.values.get("--only-missing") || !manifest[row.slug] || sources[row.slug]?.status !== "usable"));
if (requested && rows.length !== requested.size) {
  const found = new Set(visibleRows.filter((row) => requested.has(row.slug)).map((row) => row.slug));
  const unknown = [...requested].filter((slug) => !found.has(slug));
  if (unknown.length) throw new Error(`Unknown or hidden slugs: ${unknown.join(", ")}`);
}
await mkdir(iconsDir, { recursive: true });

const browser = await launchChromium();
const context = await browser.newContext({
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36 stack127-directory-research/1.0",
  ignoreHTTPSErrors: true,
});
const parkedHosts = ["hugedomains.com", "betatesting.com", "sedoparking.com", "afternic.com", "dan.com", "parkingcrew.net"];
const challengeHosts = ["challenges.cloudflare.com", "cloudflare.com", "recaptcha.net", "google.com"];
const commonPaths = ["/favicon.ico", "/favicon.png", "/apple-touch-icon.png", "/icon.png", "/logo.svg", "/logo.png"];
let next = 0;

function absoluteUrl(value, base) {
  try {
    const url = new URL(value, base);
    if (["http:", "https:"].includes(url.protocol)) return url.href;
  } catch {}
  return null;
}
function hostIs(value, blocked) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return blocked.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch { return false; }
}
function isParked(value) { return hostIs(value, parkedHosts); }
function isBlockedAsset(value) { return isParked(value) || hostIs(value, challengeHosts) || /(?:challenge|captcha|verify-browser)/i.test(value); }
function parseIconCandidates(html, base) {
  const found = [];
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = (tag.match(/\brel=["']([^"']+)["']/i)?.[1] ?? "").toLowerCase();
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href || !(rel.includes("icon") || rel.includes("apple-touch-icon") || rel.includes("mask-icon"))) continue;
    const url = absoluteUrl(href, base);
    if (url) found.push({ url, kind: rel.includes("apple") ? "apple-touch-icon" : rel.includes("mask") ? "mask-icon" : "favicon" });
  }
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const property = (tag.match(/\b(?:property|name)=["']([^"']+)["']/i)?.[1] ?? "").toLowerCase();
    const content = tag.match(/\bcontent=["']([^"']+)["']/i)?.[1];
    if (!content || !["og:image", "twitter:image"].includes(property) || !/logo|brand|icon|avatar/i.test(content)) continue;
    const url = absoluteUrl(content, base);
    if (url) found.push({ url, kind: property });
  }
  return [...new Map(found.map((item) => [item.url, item])).values()];
}
async function fetchBytes(url, timeout = 4000) {
  const response = await context.request.get(url, { timeout, failOnStatusCode: false });
  return {
    status: response.status(),
    bytes: response.ok() ? await response.body() : null,
    contentType: response.headers()["content-type"] ?? "",
    finalUrl: response.url(),
  };
}
async function normalizeImage(bytes) {
  if (!bytes?.length) return null;
  try {
    const image = sharp(bytes, { failOn: "none" });
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height || metadata.width < 8 || metadata.height < 8) return null;
    const stats = await image.stats();
    if (stats.channels?.length && stats.channels.every((channel) => Number.isFinite(channel.stdev) && channel.stdev <= 1)) return null;
    const output = await image.resize({ width: Math.min(metadata.width, 96), height: Math.min(metadata.height, 96), fit: "inside", withoutEnlargement: true }).webp({ quality: 88, effort: 4 }).toBuffer();
    return { output, width: metadata.width, height: metadata.height, format: metadata.format };
  } catch { return null; }
}
async function browserDecode(url) {
  const page = await context.newPage();
  try {
    await page.setContent(`<img id="icon" src="${url.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}">`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("#icon")?.complete, { timeout: 7000 }).catch(() => {});
    const size = await page.locator("#icon").evaluate((image) => ({ width: image.naturalWidth, height: image.naturalHeight }));
    if (!size.width || !size.height || size.width < 8 || size.height < 8) return null;
    const png = await page.locator("#icon").screenshot({ type: "png" });
    const normalized = await normalizeImage(png);
    return normalized ? { ...normalized, width: size.width, height: size.height } : null;
  } finally { await page.close(); }
}
async function addManifestIcons(page, base, candidates, attempts) {
  const href = await page.locator('link[rel="manifest"]').first().getAttribute("href").catch(() => null);
  const manifestUrl = href ? absoluteUrl(href, base) : null;
  if (!manifestUrl || isBlockedAsset(manifestUrl)) return;
  attempts.push({ url: manifestUrl, kind: "webmanifest" });
  const fetched = await fetchBytes(manifestUrl, 4000).catch(() => null);
  if (!fetched?.bytes || !fetched.contentType.toLowerCase().includes("json")) return;
  try {
    const manifestData = JSON.parse(fetched.bytes.toString("utf8"));
    for (const icon of manifestData.icons ?? []) {
      const url = absoluteUrl(icon.src, manifestUrl);
      if (url && !isBlockedAsset(url)) candidates.push({ url, kind: "webmanifest-icon" });
    }
  } catch {}
}

async function inspectRow(row) {
  const checkedAt = new Date().toISOString();
  const page = await context.newPage();
  let homeUrl = row.website_url;
  let pageStatus = null;
  let pageTitle = "";
  let pageChallenge = false;
  let candidates = [];
  const attempts = [];
  try {
    const response = await page.goto(row.website_url, { waitUntil: "domcontentloaded", timeout: 8000 });
    pageStatus = response?.status() ?? null;
    homeUrl = page.url();
    pageTitle = await page.title().catch(() => "");
    const body = (await page.locator("body").innerText({ timeout: 1500 }).catch(() => "")).slice(0, 2500);
    pageChallenge = /just a moment|checking your browser|attention required|verify you are human|captcha challenge|enable javascript and cookies/i.test(`${pageTitle} ${body}`);
    if (!isParked(homeUrl) && !pageChallenge) {
      candidates = parseIconCandidates(await page.content(), homeUrl);
      await addManifestIcons(page, homeUrl, candidates, attempts);
    }
  } catch (error) {
    pageTitle = error.name ?? "browser error";
  } finally { await page.close(); }

  if (isParked(homeUrl)) {
    sources[row.slug] = {
      status: "unavailable",
      source_url: row.website_url,
      page_url: homeUrl,
      checked_at: checkedAt,
      note: `The current domain redirects to a parked sales page (${new URL(homeUrl).hostname}); that page's icon was not used.`,
      alternatives_attempted: attempts,
    };
    return;
  }
  if (pageChallenge) candidates = [];

  const origins = new Set();
  for (const value of [homeUrl, row.website_url]) {
    try { origins.add(new URL(value).origin); } catch {}
  }
  for (const origin of origins) {
    for (const path of commonPaths) candidates.push({ url: `${origin}${path}`, kind: `same-origin ${path}` });
  }
  for (const extra of extraSources[row.slug] ?? []) {
    if (!extra?.url || !extra?.page_url || !extra?.basis) throw new Error(`Extra source for ${row.slug} needs url, page_url, and basis`);
    const url = absoluteUrl(extra.url, extra.page_url);
    if (url && !isBlockedAsset(url)) candidates.push({ url, kind: extra.kind ?? "verified official profile or repository", basis: extra.basis, page_url: extra.page_url });
  }
  candidates = [...new Map(candidates.filter((item) => item.url && !isBlockedAsset(item.url)).map((item) => [item.url, item])).values()];

  const fetchedCandidates = await Promise.all(candidates.map(async (candidate) => {
    const fetched = await fetchBytes(candidate.url).catch(() => null);
    const finalUrl = fetched?.finalUrl ?? candidate.url;
    const blockedRedirect = isBlockedAsset(finalUrl);
    let image = !blockedRedirect && fetched?.bytes ? await normalizeImage(fetched.bytes) : null;
    if (!blockedRedirect && !image && fetched?.bytes && (fetched.contentType.toLowerCase().includes("icon") || finalUrl.toLowerCase().split(/[?#]/, 1)[0].endsWith(".ico"))) {
      image = await browserDecode(finalUrl).catch(() => null);
    }
    return { candidate, fetched, finalUrl, image, blockedRedirect };
  }));
  attempts.push(...fetchedCandidates.map(({ candidate, fetched, blockedRedirect }) => ({ url: candidate.url, status: blockedRedirect ? "blocked redirect" : fetched?.status ?? "request-failed", kind: candidate.kind })));
  const usable = fetchedCandidates.find(({ image }) => image);
  const selected = usable ? {
    ...usable.image,
    sourceUrl: usable.finalUrl,
    kind: usable.candidate.kind,
    status: usable.fetched?.status ?? 200,
    basis: usable.candidate.basis,
    pageUrl: usable.candidate.page_url,
  } : null;

  if (selected) {
    const fileName = `${row.slug}.webp`;
    await writeFile(join(iconsDir, fileName), selected.output);
    manifest[row.slug] = `${urlPrefix}/${fileName}`;
    sources[row.slug] = {
      status: "usable",
      source_url: selected.sourceUrl,
      page_url: selected.pageUrl ?? homeUrl,
      checked_at: checkedAt,
      kind: selected.kind,
      source_dimensions: `${selected.width}x${selected.height}`,
      note: selected.basis ? `Official source asset; ${selected.basis}.` : `Official site image returned HTTP ${selected.status}${pageStatus ? `; homepage returned HTTP ${pageStatus}` : ""}.`,
    };
  } else {
    const reason = pageChallenge
      ? "The homepage presented a browser or CAPTCHA challenge; its challenge assets were not used."
      : pageStatus ? `No valid brand image was found among the official page metadata and checked same-origin image paths (homepage HTTP ${pageStatus}).` : "The official page and checked same-origin image paths did not provide a valid brand image.";
    sources[row.slug] = {
      status: "unavailable",
      source_url: row.website_url,
      page_url: homeUrl,
      checked_at: checkedAt,
      note: reason,
      alternatives_attempted: attempts.slice(0, 12),
    };
  }
}

async function worker() {
  while (true) {
    const index = next++;
    if (index >= rows.length) return;
    const row = rows[index];
    if (manifest[row.slug] && sources[row.slug]?.status === "usable") {
      console.log(`${index + 1}/${rows.length} ${row.slug}: kept existing official icon`);
      continue;
    }
    try {
      await inspectRow(row);
      console.log(`${index + 1}/${rows.length} ${row.slug}: ${sources[row.slug]?.status}`);
    } catch (error) {
      sources[row.slug] = { status: "failed", source_url: row.website_url, checked_at: new Date().toISOString(), note: `Could not inspect official or verified source images (${error.name ?? "error"}).` };
      console.log(`${index + 1}/${rows.length} ${row.slug}: failed`);
    }
  }
}

try {
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(rows.length, 1)) }, worker));
} finally {
  await context.close();
  await browser.close();
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(sourcesPath, `${JSON.stringify(sources, null, 2)}\n`);
console.log(`Wrote ${Object.keys(manifest).length} icon mappings and ${Object.keys(sources).length} source records.`);
