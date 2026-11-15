#!/usr/bin/env node
// Downloads every icon candidate an app's official site publishes, so agents without
// reliable network access can pick the right one offline with save-icon.mjs --file.
//
// Usage: node scripts/indie-hacker-apps/harvest-icons.mjs [category] [--only-missing] [--slugs a,b] [--concurrency 12]
// Writes tmp/icon-candidates/<category>/<slug>/index.json plus one original file and one
// 128px preview PNG per candidate. Candidates come from the official page only: <link rel=icon>,
// apple-touch-icon, mask-icon, the web manifest, JSON-LD "logo", common favicon paths, and the
// GitHub organization avatar when the official URL is a GitHub repository.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "lib/indie-hacker-apps/categories.json"), "utf8"));
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const categoryArg = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const onlyMissing = args.includes("--only-missing");
const onlySlugs = flag("slugs") ? new Set(flag("slugs").split(",")) : null;
const concurrency = Number(flag("concurrency", "12"));
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

async function get(url, accept, timeout = 20_000) {
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeout), headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "en" } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  return { bytes, type: response.headers.get("content-type") ?? "", finalUrl: response.url };
}

const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")) ?? [])[2] ?? (tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")) ?? [])[3] ?? (tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")) ?? [])[4];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/").replace(/&quot;/g, '"');

function candidatesFromHtml(html, pageUrl) {
  const found = [];
  const add = (href, kind, sizes = "") => {
    if (!href || href.startsWith("data:")) return;
    try { found.push({ url: new URL(decode(href), pageUrl).href, kind, sizes }); } catch { /* bad URL */ }
  };
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = (attr(tag, "rel") ?? "").toLowerCase();
    const href = attr(tag, "href");
    if (/apple-touch-icon/.test(rel)) add(href, "apple-touch-icon", attr(tag, "sizes") ?? "");
    else if (/mask-icon/.test(rel)) add(href, "svg-icon", "mask");
    else if (/\bicon\b/.test(rel)) add(href, /\.svg(\?|$)/i.test(href ?? "") || /svg/i.test(attr(tag, "type") ?? "") ? "svg-icon" : "favicon", attr(tag, "sizes") ?? "");
    else if (/manifest/.test(rel)) add(href, "manifest");
  }
  for (const block of html.match(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/gi) ?? []) {
    for (const m of block.matchAll(/"logo"\s*:\s*(?:\{[^}]*?"url"\s*:\s*)?"([^"]+)"/g)) add(m[1], "logo-mark", "json-ld");
  }
  return found;
}

function pngFromIco(bytes) {
  if (bytes.length < 6 || bytes.readUInt16LE(0) !== 0 || bytes.readUInt16LE(2) !== 1) return null;
  let best = null;
  for (let i = 0; i < bytes.readUInt16LE(4); i += 1) {
    const at = 6 + i * 16;
    const width = bytes[at] || 256;
    const data = bytes.subarray(bytes.readUInt32LE(at + 12), bytes.readUInt32LE(at + 12) + bytes.readUInt32LE(at + 8));
    if (data.subarray(0, 4).toString("hex") === "89504e47" && (!best || width > best.width)) best = { width, data };
  }
  return best?.data ?? null;
}

// macOS sips can read BMP-based .ico files that sharp can't.
function icoToPngWithSips(icoPath, outPath) {
  try { execFileSync("sips", ["-s", "format", "png", icoPath, "--out", outPath], { stdio: "ignore" }); return existsSync(outPath) ? readFileSync(outPath) : null; }
  catch { return null; }
}

async function harvest(category, card) {
  const outDir = path.join(root, "tmp/icon-candidates", category.slug, card.slug);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const index = { slug: card.slug, name: card.name, official_url: card.url, page_url: card.url, page_error: null, candidates: [] };
  let list = [];
  try {
    const page = await get(card.url, "text/html,application/xhtml+xml");
    index.page_url = page.finalUrl;
    const html = page.bytes.toString("utf8");
    list = candidatesFromHtml(html, page.finalUrl);
  } catch (error) { index.page_error = error.message; }
  const origin = (() => { try { return new URL(index.page_url).origin; } catch { return null; } })();
  if (origin) for (const p of ["/apple-touch-icon.png", "/apple-touch-icon-precomposed.png", "/favicon.svg", "/favicon.png", "/favicon.ico"]) list.push({ url: origin + p, kind: p.includes("apple") ? "apple-touch-icon" : p.endsWith(".svg") ? "svg-icon" : "favicon", sizes: "default path" });
  const gh = card.url.match(/^https?:\/\/(?:www\.)?github\.com\/([^/]+)/i);
  if (gh) list.push({ url: `https://github.com/${gh[1]}.png?size=256`, kind: "github-avatar", sizes: "256" });
  // Expand web manifests into their icons.
  const expanded = [];
  for (const item of list) {
    if (item.kind !== "manifest") { expanded.push(item); continue; }
    try {
      const manifest = JSON.parse((await get(item.url, "application/manifest+json,application/json")).bytes.toString("utf8"));
      for (const icon of manifest.icons ?? []) if (icon.src) expanded.push({ url: new URL(icon.src, item.url).href, kind: "manifest-icon", sizes: icon.sizes ?? "", purpose: icon.purpose ?? "" });
    } catch { /* manifest not readable */ }
  }
  const seen = new Set();
  let n = 0;
  for (const item of expanded) {
    if (seen.has(item.url) || n >= 14) continue;
    seen.add(item.url);
    n += 1;
    const entry = { ...item, file: null, preview: null, format: null, width: null, height: null, error: null };
    try {
      const { bytes, type } = await get(item.url, "image/avif,image/webp,image/png,image/svg+xml,image/x-icon,image/*,*/*;q=0.8", 15_000);
      if (/text\/html/i.test(type) || /^\s*<(!doctype|html)/i.test(bytes.subarray(0, 200).toString())) throw new Error("returned an HTML page");
      const ext = (item.url.split("?")[0].match(/\.(png|svg|ico|jpe?g|webp|gif|avif)$/i)?.[1] ?? (type.split("/")[1] ?? "bin").split(";")[0].replace("x-icon", "ico").replace("svg+xml", "svg")).toLowerCase();
      const file = path.join(outDir, `c${n}.${ext}`);
      writeFileSync(file, bytes);
      let image = bytes;
      if (ext === "ico" || (bytes.length > 4 && bytes.readUInt16LE(0) === 0 && bytes.readUInt16LE(2) === 1)) {
        image = pngFromIco(bytes) ?? icoToPngWithSips(file, path.join(outDir, `c${n}-from-ico.png`));
        if (!image) throw new Error("unreadable .ico");
        if (image !== bytes) { writeFileSync(path.join(outDir, `c${n}-from-ico.png`), image); entry.converted = `c${n}-from-ico.png`; }
      }
      const meta = await sharp(image, { density: 384 }).metadata();
      const preview = path.join(outDir, `c${n}-preview.png`);
      await sharp(image, { density: 384 }).resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(preview);
      Object.assign(entry, { file: path.basename(file), preview: path.basename(preview), format: meta.format, width: meta.width ?? null, height: meta.height ?? null });
    } catch (error) { entry.error = error.message; }
    index.candidates.push(entry);
  }
  writeFileSync(path.join(outDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  return index;
}

const jobs = [];
for (const category of config.categories.filter((c) => !categoryArg || c.slug === categoryArg || c.research_dir === categoryArg)) {
  const dir = path.join(root, "dev-space/indie-hacker-apps", category.research_dir);
  for (const f of readdirSync(path.join(dir, "cards")).filter((x) => x.endsWith(".json")).sort()) {
    const card = JSON.parse(readFileSync(path.join(dir, "cards", f), "utf8"));
    if (onlySlugs && !onlySlugs.has(card.slug)) continue;
    if (onlyMissing && existsSync(path.join(root, "public/indie-hacker-apps/icons", category.slug, `${card.slug}.png`))) continue;
    jobs.push([category, card]);
  }
}
let done = 0, noUsable = 0;
const failures = [];
async function worker() {
  while (jobs.length) {
    const [category, card] = jobs.shift();
    const index = await harvest(category, card).catch((error) => ({ slug: card.slug, page_error: error.message, candidates: [] }));
    done += 1;
    if (!index.candidates.some((c) => c.preview)) { noUsable += 1; failures.push(`${category.slug}/${card.slug}${index.page_error ? ` (page: ${index.page_error})` : ""}`); }
    if (done % 50 === 0) console.log(`${done} done, ${noUsable} without a usable candidate`);
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`harvested ${done} apps; ${noUsable} without any usable candidate`);
if (failures.length) writeFileSync(path.join(root, "tmp/icon-candidates/no-candidates.txt"), `${failures.join("\n")}\n`);
