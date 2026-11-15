#!/usr/bin/env node
// Third-pass icon candidates for apps still missing an icon: official GitHub organization
// avatars (from GitHub links in the app's research file and card) and App Store app icons
// (Apple's public search API, with the developer name so agents can confirm the match).
// Appends to tmp/icon-candidates/<category>/<slug>/index.json with "via": "extra".
//
// Usage: node scripts/indie-hacker-apps/harvest-icons-extra.mjs <list-file>   (lines: "<category>/<slug>")
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "lib/indie-hacker-apps/categories.json"), "utf8"));
const list = readFileSync(process.argv[2], "utf8").split("\n").map((l) => l.trim().split(/\s+/)[0]).filter((l) => l.includes("/"));
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SKIP_ORGS = new Set(["sponsors", "features", "about", "login", "orgs", "topics", "marketplace", "apps", "settings", "site", "collections", "github", "advisories", "notifications", "pricing", "enterprise", "security", "explore", "trending", "readme"]);

async function get(url) {
  const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20_000), headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return { bytes: Buffer.from(await r.arrayBuffer()), type: r.headers.get("content-type") ?? "", finalUrl: r.url };
}

async function addCandidate(dir, index, item, n) {
  const cand = { ...item, via: "extra", file: null, preview: null, format: null, width: null, height: null, error: null };
  try {
    const { bytes, type } = await get(item.url);
    if (/text\/html/i.test(type)) throw new Error("returned an HTML page");
    let ext = (type.split("/")[1] ?? "png").split(";")[0].replace("jpeg", "jpg");
    let file = path.join(dir, `x${n}.${ext}`);
    writeFileSync(file, bytes);
    let image = bytes;
    try { await sharp(image).metadata(); } catch {
      // Some WebP/HEIF files need macOS sips.
      const out = path.join(dir, `x${n}-converted.png`);
      execFileSync("sips", ["-s", "format", "png", file, "--out", out], { stdio: "ignore" });
      image = readFileSync(out); cand.converted = path.basename(out);
    }
    const meta = await sharp(image).metadata();
    const preview = path.join(dir, `x${n}-preview.png`);
    await sharp(image).resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(preview);
    Object.assign(cand, { file: path.basename(file), preview: path.basename(preview), format: meta.format, width: meta.width ?? null, height: meta.height ?? null });
  } catch (error) { cand.error = error.message; }
  index.candidates.push(cand);
  return Boolean(cand.preview);
}

let gained = 0;
for (const entry of list) {
  const [categorySlug, slug] = entry.split("/");
  const category = config.categories.find((c) => c.slug === categorySlug);
  if (!category) continue;
  const base = path.join(root, "dev-space/indie-hacker-apps", category.research_dir);
  const card = JSON.parse(readFileSync(path.join(base, "cards", `${slug}.json`), "utf8"));
  const dir = path.join(root, "tmp/icon-candidates", category.slug, slug);
  mkdirSync(dir, { recursive: true });
  const indexPath = path.join(dir, "index.json");
  const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : { slug, name: card.name, official_url: card.url, page_url: card.url, candidates: [] };
  const known = new Set(index.candidates.map((c) => c.url));
  let n = 0, usable = 0;

  // GitHub organizations named in the card URL and the research file, most-mentioned first.
  const research = existsSync(path.join(base, "apps", `${slug}.md`)) ? readFileSync(path.join(base, "apps", `${slug}.md`), "utf8") : "";
  const counts = new Map();
  for (const m of `${card.url} ${research}`.matchAll(/github\.com\/([A-Za-z0-9][A-Za-z0-9-]{0,38})(?=[\/\s)"'|]|$)/g)) {
    const org = m[1];
    if (!SKIP_ORGS.has(org.toLowerCase())) counts.set(org, (counts.get(org) ?? 0) + 1);
  }
  for (const [org] of [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2)) {
    const url = `https://github.com/${org}.png?size=460`;
    if (known.has(url)) continue;
    known.add(url);
    n += 1;
    if (await addCandidate(dir, index, { url, kind: "github-avatar", sizes: "460", page: `https://github.com/${org}`, note: `GitHub organization "${org}" (${counts.get(org)} mentions in the research file)` }, n)) usable += 1;
  }

  // App Store: top results for the app name, with developer names for checking.
  try {
    const term = encodeURIComponent(card.name.replace(/\(.*?\)/g, "").trim());
    const res = JSON.parse((await get(`https://itunes.apple.com/search?term=${term}&entity=software&limit=3&country=us`)).bytes.toString("utf8"));
    for (const app of res.results ?? []) {
      const url = app.artworkUrl512 || app.artworkUrl100;
      if (!url || known.has(url)) continue;
      known.add(url);
      n += 1;
      if (await addCandidate(dir, index, { url, kind: "app-store", sizes: "512", page: app.trackViewUrl, note: `App Store: "${app.trackName}" by ${app.sellerName || app.artistName}` }, n)) usable += 1;
    }
    await sleep(400);
  } catch { /* search unavailable */ }

  writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  if (usable) gained += 1;
  console.log(`${entry}: ${usable} new usable candidates`);
}
console.log(`extra pass: ${list.length} apps, ${gained} gained usable candidates`);
