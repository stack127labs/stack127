#!/usr/bin/env node
// Shows every downloaded icon candidate for a list of apps, one row per app, so a person
// can pick the right one. Usage: node scripts/indie-hacker-apps/candidate-sheet.mjs <list-file> <out-dir> [--per 12]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const [listFile, outDir] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const per = Number(process.argv.includes("--per") ? process.argv[process.argv.indexOf("--per") + 1] : 12);
mkdirSync(outDir, { recursive: true });
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const entries = readFileSync(listFile, "utf8").split("\n").map((l) => l.trim().split(/\s+/)[0]).filter((l) => l.includes("/"));
const rows = entries.map((entry) => {
  const dir = path.join(root, "tmp/icon-candidates", entry);
  const index = existsSync(path.join(dir, "index.json")) ? JSON.parse(readFileSync(path.join(dir, "index.json"), "utf8")) : { name: entry, candidates: [] };
  const cells = index.candidates.map((c, i) => c.preview
    ? `<div class="c"><div class="p"><img src="file://${path.join(dir, c.preview)}"></div><div class="p d"><img src="file://${path.join(dir, c.preview)}"></div><small>#${i} ${esc(c.kind)} ${c.format} ${c.width ?? ""}×${c.height ?? ""}<br>${esc(host(c.url))}${c.note ? `<br><i>${esc(c.note.slice(0, 70))}</i>` : ""}</small></div>`
    : "").join("");
  return `<div class="r"><div class="n"><b>${esc(index.name)}</b><br>${esc(entry)}<br>${esc(host(index.official_url))}</div>${cells || "<em>no usable candidates</em>"}</div>`;
});
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
for (let n = 0; n * per < rows.length; n += 1) {
  const chunk = rows.slice(n * per, (n + 1) * per);
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:8px;font:11px/1.25 -apple-system,Helvetica;background:#eee}
  .r{display:flex;gap:6px;align-items:flex-start;background:#fff;border:1px solid #ccc;margin-bottom:6px;padding:6px;flex-wrap:wrap}
  .n{width:150px;flex:none;font-size:12px}.c{width:118px}.p{height:56px;display:grid;place-items:center;background:#fff;border:1px solid #eee}
  .d{background:#151515}img{width:48px;height:48px}small{color:#333;overflow-wrap:anywhere}i{color:#06c}</style>${chunk.join("")}`;
  const htmlPath = path.join(outDir, `cand-${n + 1}.html`);
  writeFileSync(htmlPath, html);
  execFileSync(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", "--window-size=1600,2400", `--screenshot=${path.join(outDir, `cand-${n + 1}.png`)}`, `file://${path.resolve(htmlPath)}`], { stdio: "ignore" });
  console.log(path.join(outDir, `cand-${n + 1}.png`));
}
