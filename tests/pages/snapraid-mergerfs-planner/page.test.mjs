import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const route = new URL("../../../app/(site)/(tools)/snapraid-mergerfs-planner/", import.meta.url);
const files = {
  page: new URL("page.tsx", route),
  client: new URL("snapraid-mergerfs-planner.tsx", route),
  engine: new URL("snapraid-merfs-engine.ts", route),
  guide: new URL("snapraid-merfs-guide.tsx", route),
  styles: new URL("snapraid-mergerfs-planner.module.css", route),
  preview: new URL("../../../scripts/storage-tools/preview-local-pages.mjs", import.meta.url),
  manifest: new URL("page.json", import.meta.url),
};

const source = (url) => readFileSync(url, "utf8");

test("owns one published flat route and only route-local build files", () => {
  for (const [label, url] of Object.entries(files)) assert.equal(existsSync(url), true, `${label}: ${url.pathname}`);
  const manifest = JSON.parse(source(files.manifest));
  assert.equal(manifest.route, "/snapraid-mergerfs-planner");
  assert.equal(manifest.state, "published");
  assert.deepEqual(manifest.repositories, []);
  assert.equal(manifest.docs[0], "content_docs/snapraid-mergerfs-planner");
  assert.equal(manifest.scripts[0], "scripts/storage-tools/preview-local-pages.mjs");
});

test("keeps identity and supporting content server rendered", () => {
  const page = source(files.page);
  const client = source(files.client);
  const guide = source(files.guide);
  assert.match(page, /<h1>[\s\S]*SnapRAID and mergerfs/);
  assert.match(page, /<AppShell[\s\S]*sidebar=\{<StorageToolsSidebar active="snapraid-mergerfs" \/>\}/);
  assert.match(page, /<SnapraidMergerfsPlanner \/>/);
  assert.match(page, /<SnapraidMergerfsGuide \/>/);
  assert.match(page, /snapraid\.conf/);
  assert.match(page, /fstab/);
  assert.match(page, /do not inspect or change/i);
  assert.doesNotMatch(guide, /^\s*["']use client["'];/m);
  assert.match(guide, /Keep parity outside the pool/);
  assert.match(guide, /Choose paths and verify boundaries/);
  assert.match(guide, /What happens to entered paths/);
  assert.match(guide, /findmnt/);
  assert.match(guide, /lsblk/);
  assert.match(guide, /physical disk separation/i);
  assert.match(guide, /installed.*versions/i);
  assert.match(guide, /backup/i);
  assert.match(guide, /does not save or send/i);
  assert.match(guide, /href="\/privacy"/);
  assert.match(guide, /manpages\.debian\.org/);
  assert.match(guide, /trapexit\.github\.io\/mergerfs/);
  assert.match(guide, /role="region"[\s\S]*<table/);
  assert.doesNotMatch(`${page}\n${guide}`, /<h2>FAQ|Methodology|Related reading|How to use|[—–]/i);
  assert.match(client, /Check and generate/);
  assert.match(client, /Configuration ready for review/);
  assert.match(client, /Copy snapraid\.conf/);
  assert.match(client, /Copy fstab line/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/i);
});

test("keeps the engine pure and input text inert", () => {
  const engine = source(files.engine);
  const client = source(files.client);
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|history\.|document\.|window\.|eval\(|Function\(/i);
  assert.doesNotMatch(client, /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML|eval\(|Function\(/i);
  assert.match(client, /navigator\.clipboard\.writeText/);
  assert.doesNotMatch(`${engine}\n${client}`, /child_process|exec\(|spawn\(|shell/i);
});

test("protects route-local visual constraints and contained code output", () => {
  const styles = source(files.styles);
  assert.match(styles, /\.tool\s*\{[^}]*border:\s*1\.5px solid var\(--color-border-strong\);/s);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow:\s*auto/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
});

test("guards local preview mutations and supports cleanup", () => {
  const preview = source(files.preview);
  assert.match(preview, /phhrfvmncpqqmmgruktx/);
  assert.match(preview, /Refusing.*production/i);
  assert.match(preview, /Refusing.*managed development/i);
  assert.match(preview, /--remove/);
  assert.match(preview, /snapraid-mergerfs-planner/);
});
