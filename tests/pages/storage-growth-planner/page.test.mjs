import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const route = new URL("../../../app/(site)/(tools)/storage-growth-planner/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("storage-growth-planner.tsx", route);
const enginePath = new URL("storage-growth-planner-engine.ts", route);
const stylesPath = new URL("storage-growth-planner.module.css", route);
const guidePath = new URL("storage-growth-planner-guide.tsx", route);
const previewPath = new URL("../../../scripts/storage-tools/preview-local-pages.mjs", import.meta.url);
const manifestPath = new URL("page.json", import.meta.url);

test("owns one published flat route without shared storage edits", () => {
  for (const file of [pagePath, clientPath, enginePath, stylesPath, previewPath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/storage-growth-planner");
  assert.equal(manifest.state, "published");
  assert.deepEqual(manifest.repositories, []);
});

test("keeps the engine pure and the route free of publication metadata", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const page = readFileSync(pagePath, "utf8");
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|history\.|document\.|window\.|eval\(|Function\(/i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML|eval\(|Function\(/i);
  assert.doesNotMatch(`${page}\n${client}`, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap|public\.stack127_pages|migration/i);
  assert.match(page, /Storage Growth and TCO/);
  assert.match(page, /Planner/);
  assert.match(client, /Calculate plan/);
  assert.match(client, /Growth runway/);
});

test("keeps the tool-only styles compact and responsive", () => {
  const styles = readFileSync(stylesPath, "utf8");
  assert.match(styles, /\.tool\s*\{[^}]*border:\s*1\.5px solid var\(--color-border-strong\);/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
});

test("guards local preview mutations", () => {
  const preview = readFileSync(previewPath, "utf8");
  assert.match(preview, /phhrfvmncpqqmmgruktx/);
  assert.match(preview, /Refusing.*production/i);
  assert.match(preview, /Refusing.*managed development/i);
  assert.match(preview, /--remove/);
});

test("serves a concise server-rendered guide after the calculator", () => {
  assert.equal(existsSync(guidePath), true);
  const page = readFileSync(pagePath, "utf8");
  const guide = readFileSync(guidePath, "utf8");
  assert.match(page, /Plan a local storage purchase/);
  assert.match(page, /not installed filesystem free space/);
  assert.match(page, /StorageGrowthGuide/);
  assert.match(guide, /Choose inputs that match your homelab/);
  assert.match(guide, /Know what this model leaves out/);
  assert.match(guide, /Verify the plan before buying/);
  assert.match(guide, /zfs-capacity-calculator/);
  assert.match(guide, /zfs-padding-calculator/);
  assert.match(guide, /CISA|backup/);
  assert.match(guide, /proseClassName/);
  assert.doesNotMatch(`${page}\n${guide}`, /FAQ|best NAS|guarantee|always correct|—|–/i);
});
