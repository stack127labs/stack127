#!/usr/bin/env node
// Second-pass icon harvest with real Chrome, for apps whose sites block scripts or only
// publish tiny favicons. Opens the official page, collects icon links, header logo images
// and the GitHub organization avatar, downloads them inside the page, and appends them to
// tmp/icon-candidates/<category>/<slug>/index.json (marked "via": "browser").
//
// Usage: node scripts/indie-hacker-apps/harvest-icons-browser.mjs <list-file>
// The list file has one "<category>/<slug>" per line.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "lib/indie-hacker-apps/categories.json"), "utf8"));
const list = readFileSync(process.argv[2], "utf8").split("\n").map((l) => l.trim().split(" ")[0]).filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(path.join(tmpdir(), "iha-icons-"))}`,
  "--window-size=1366,900", "about:blank",
], { stdio: "ignore" });

let ws;
for (let i = 0; i < 60 && !ws; i += 1) {
  try { const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const tab = tabs.find((t) => t.type === "page"); if (tab) ws = new WebSocket(tab.webSocketDebuggerUrl); } catch { /* not up yet */ }
  if (!ws) await sleep(250);
}
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression, timeout = 30_000) => {
  const r = await Promise.race([send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }), sleep(timeout).then(() => ({ timeout: true }))]);
  return r?.result?.result?.value;
};
await send("Page.enable");
await send("Network.setUserAgentOverride", { userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" });

const collect = `(() => {
  const out = [];
  const add = (href, kind, sizes = "") => { try { if (href && !href.startsWith("data:")) out.push({ url: new URL(href, location.href).href, kind, sizes }); } catch {} };
  for (const l of document.querySelectorAll("link[rel]")) {
    const rel = l.rel.toLowerCase();
    if (rel.includes("apple-touch-icon")) add(l.href, "apple-touch-icon", l.sizes?.value || "");
    else if (rel.includes("mask-icon")) add(l.href, "svg-icon", "mask");
    else if (rel.split(/\\s+/).includes("icon")) add(l.href, /svg/.test(l.type) || /\\.svg/.test(l.href) ? "svg-icon" : "favicon", l.sizes?.value || "");
    else if (rel.includes("manifest")) add(l.href, "manifest");
  }
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
    for (const m of s.textContent.matchAll(/"logo"\\s*:\\s*(?:\\{[^}]*?"url"\\s*:\\s*)?"([^"]+)"/g)) add(m[1], "logo-mark", "json-ld");
  }
  const header = document.querySelector("header, nav, [class*=header], [class*=navbar]") || document.body;
  for (const img of [...header.querySelectorAll("img, svg image")].slice(0, 40)) {
    const src = img.currentSrc || img.src || img.getAttribute("href");
    const label = ((img.alt || "") + " " + (img.className?.baseVal ?? img.className ?? "") + " " + (src || "")).toLowerCase();
    if (src && /logo|brand|mark|icon/.test(label)) add(src, "logo-mark", "header image");
  }
  const gh = [...document.querySelectorAll('a[href*="github.com/"]')].map((a) => a.href.match(/github\\.com\\/([A-Za-z0-9-]+)/)?.[1]).find((o) => o && !["sponsors", "features", "about", "login"].includes(o));
  if (gh) add("https://github.com/" + gh + ".png?size=256", "github-avatar", "256");
  return { page: location.href, title: document.title, out };
})()`;

const download = (url) => `fetch(${JSON.stringify(url)}, { credentials: "omit" }).then(async (r) => {
  if (!r.ok) return { error: "HTTP " + r.status };
  const type = r.headers.get("content-type") || "";
  const buf = new Uint8Array(await r.arrayBuffer());
  let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { type, b64: btoa(s) };
}).catch((e) => ({ error: String(e) }))`;

let done = 0, gained = 0;
for (const entry of list) {
  const [categorySlug, slug] = entry.split("/");
  const category = config.categories.find((c) => c.slug === categorySlug);
  if (!category) continue;
  const card = JSON.parse(readFileSync(path.join(root, "dev-space/indie-hacker-apps", category.research_dir, "cards", `${slug}.json`), "utf8"));
  const dir = path.join(root, "tmp/icon-candidates", category.slug, slug);
  mkdirSync(dir, { recursive: true });
  const indexPath = path.join(dir, "index.json");
  const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : { slug, name: card.name, official_url: card.url, page_url: card.url, candidates: [] };
  await send("Page.navigate", { url: card.url });
  await sleep(6000);
  const found = (await evaluate(collect)) ?? { out: [] };
  if (found.page) index.browser_page_url = found.page;
  // Expand manifests.
  const items = [];
  for (const item of found.out) {
    if (item.kind !== "manifest") { items.push(item); continue; }
    const res = await evaluate(`fetch(${JSON.stringify(item.url)}).then(r => r.json()).then(m => (m.icons || []).map(i => ({ src: new URL(i.src, ${JSON.stringify(item.url)}).href, sizes: i.sizes || "" }))).catch(() => [])`);
    for (const icon of res ?? []) items.push({ url: icon.src, kind: "manifest-icon", sizes: icon.sizes });
  }
  const known = new Set(index.candidates.map((c) => c.url));
  let n = index.candidates.length;
  let added = 0;
  for (const item of items) {
    if (known.has(item.url) || added >= 12) continue;
    known.add(item.url);
    n += 1;
    const cand = { ...item, via: "browser", file: null, preview: null, format: null, width: null, height: null, error: null };
    const res = await evaluate(download(item.url), 20_000);
    try {
      if (!res || res.error) throw new Error(res?.error ?? "download timed out");
      const bytes = Buffer.from(res.b64, "base64");
      if (/text\/html/i.test(res.type)) throw new Error("returned an HTML page");
      const ext = (item.url.split("?")[0].match(/\.(png|svg|ico|jpe?g|webp|gif|avif)$/i)?.[1] ?? (res.type.split("/")[1] ?? "bin").split(";")[0].replace("x-icon", "ico").replace("svg+xml", "svg")).toLowerCase();
      const file = path.join(dir, `b${n}.${ext}`);
      writeFileSync(file, bytes);
      if (ext === "ico") throw new Error("ico from browser pass; use the first-pass converter");
      const meta = await sharp(bytes, { density: 384 }).metadata();
      const preview = path.join(dir, `b${n}-preview.png`);
      await sharp(bytes, { density: 384 }).resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(preview);
      Object.assign(cand, { file: path.basename(file), preview: path.basename(preview), format: meta.format, width: meta.width ?? null, height: meta.height ?? null });
      added += 1;
    } catch (error) { cand.error = error.message; }
    index.candidates.push(cand);
  }
  writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  done += 1;
  if (added) gained += 1;
  console.log(`${entry}: ${added} new usable candidates (page ${found.page ?? "not loaded"})`);
}
console.log(`browser pass: ${done} apps, ${gained} gained usable candidates`);
ws.close();
chrome.kill();
