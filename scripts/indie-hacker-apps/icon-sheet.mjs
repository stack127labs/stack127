#!/usr/bin/env node
// Makes contact sheets of the saved icons, for checking them by eye.
// Usage: node scripts/indie-hacker-apps/icon-sheet.mjs <category> <out-dir> [--per 60] [--slugs a,b,c]
// Writes <out-dir>/<category>-<n>.html and, with Google Chrome installed, <out-dir>/<category>-<n>.png.
// Each tile shows the icon on light and dark backgrounds, the app name, its official domain and the icon's source host.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(readFileSync(path.join(root, "lib/indie-hacker-apps/categories.json"), "utf8"));
const args = process.argv.slice(2);
const flag = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const [categorySlug, outDir] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const per = Number(flag("per", "60"));
const only = flag("slugs", "") ? new Set(flag("slugs", "").split(",")) : null;
const category = config.categories.find((c) => c.slug === categorySlug || c.research_dir === categorySlug);
if (!category || !outDir) { console.error("usage: icon-sheet.mjs <category> <out-dir>"); process.exit(2); }
mkdirSync(outDir, { recursive: true });

const dir = path.join(root, "dev-space/indie-hacker-apps", category.research_dir);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const slugs = readdirSync(path.join(dir, "cards")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort().filter((s) => !only || only.has(s));
const tiles = slugs.map((slug) => {
  const card = JSON.parse(readFileSync(path.join(dir, "cards", `${slug}.json`), "utf8"));
  const pngPath = path.join(root, "public/indie-hacker-apps/icons", category.slug, `${slug}.png`);
  const recordPath = path.join(dir, "icons", `${slug}.json`);
  const record = existsSync(recordPath) ? JSON.parse(readFileSync(recordPath, "utf8")) : null;
  const img = existsSync(pngPath) ? `<img src="file://${pngPath}">` : `<div class="none">no icon</div>`;
  return `<div class="t"><div class="pair"><div class="l">${img}</div><div class="d">${img}</div></div>
    <b>${esc(card.name)}</b><span>${esc(host(card.url))}</span><span class="s">${record ? `${esc(record.source_host)} · ${esc(record.kind)}` : "—"}</span><span class="g">${esc(slug)}</span></div>`;
});

const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (let n = 0; n * per < tiles.length; n += 1) {
  const chunk = tiles.slice(n * per, (n + 1) * per);
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:12px;font:12px/1.3 -apple-system,Helvetica,sans-serif;background:#f4f4f4;color:#111}
    .grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
    .t{background:#fff;border:1px solid #ddd;padding:8px;display:grid;gap:2px}
    .pair{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:4px}
    .l,.d{height:72px;display:grid;place-items:center;border-radius:4px}.l{background:#fff;border:1px solid #eee}.d{background:#141414}
    img{width:64px;height:64px}.none{color:#c00;font-weight:600}
    b{font-size:13px}span{color:#555;overflow-wrap:anywhere}.s{color:#06c}.g{color:#999;font-size:11px}
  </style><div class="grid">${chunk.join("")}</div>`;
  const htmlPath = path.join(outDir, `${category.slug}-${n + 1}.html`);
  writeFileSync(htmlPath, html);
  if (existsSync(chrome)) {
    const rows = Math.ceil(chunk.length / 6);
    const height = 40 + rows * 240; // tiles with long names run taller than 200 px
    execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", `--window-size=1200,${height}`,
      `--screenshot=${path.join(outDir, `${category.slug}-${n + 1}.png`)}`, `file://${path.resolve(htmlPath)}`], { stdio: "ignore" });
  }
  console.log(path.join(outDir, `${category.slug}-${n + 1}.${existsSync(chrome) ? "png" : "html"}`));
}
