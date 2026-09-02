import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const root = new URL("../../../app/(site)/(tools)/ceph-capacity-calculator/", import.meta.url);
const pagePath = new URL("page.tsx", root);
const clientPath = new URL("ceph-capacity-calculator.tsx", root);
const enginePath = new URL("ceph-capacity-engine.ts", root);
const stylesPath = new URL("ceph-capacity-calculator.module.css", root);
const manifestPath = new URL("page.json", import.meta.url);
const previewPath = new URL("../../../scripts/storage-tools/preview-local-pages.mjs", import.meta.url);

test("the published route owns its source, tests, and guarded preview", () => {
  for (const file of [pagePath, clientPath, enginePath, stylesPath, previewPath]) {
    assert.equal(existsSync(file), true, file.pathname);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/ceph-capacity-calculator");
  assert.equal(manifest.state, "published");
  assert.deepEqual(manifest.scripts, ["scripts/storage-tools/preview-local-pages.mjs"]);
});

test("the route is a tool-only server shell with no page-owned SEO metadata", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const guide = readToolPageSeed("ceph-capacity-calculator");
  assert.match(page, /getRequiredToolPage\("ceph-capacity-calculator"\)/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<CephCapacityCalculator/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(client, /Plan capacity/);
  assert.match(client, /Failure-domain/);
  assert.match(client, /Largest-domain loss/);
  assert.match(guide, /Replicated/);
  assert.match(guide, /Erasure coding/);
  assert.match(guide, /CRUSH/);
  assert.match(guide, /ceph df/);
  assert.match(guide, /calculation.*browser/i);
  assert.match(guide, /storage-tools|zfs-capacity-calculator/);
  assert.ok((guide.match(/^## /gm) ?? []).length <= 5, "guide stays focused");
  const visibleWords = guide
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}()=\"'`;,:./]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  assert.ok(visibleWords.length <= 800, `guide source contains ${visibleWords.length} tokens`);
  assert.doesNotMatch(`${page}\n${guide}`, /FAQ|Methodology/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots|sitemap/);
  assert.doesNotMatch(`${page}\n${client}\n${guide}`, /—|–/);
});

test("the engine remains route-local and free of UI or network dependencies", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(engine, /bigint/);
  assert.match(engine, /calculateCephCapacity/);
  assert.match(engine, /serializeCephInput/);
  assert.doesNotMatch(engine, /react|fetch\(|XMLHttpRequest|WebSocket|Worker|localStorage|sessionStorage|document\.|window\./i);
  assert.doesNotMatch(client, /fetch\(|localStorage|sessionStorage|WebSocket|Worker/);
});

test("styles use a single framed tool and responsive, non-global selectors", () => {
  const styles = readFileSync(stylesPath, "utf8");
  assert.match(styles, /\.tool\s*\{/);
  assert.match(styles, /@media/);
  assert.match(styles, /min-width:\s*0/);
  assert.doesNotMatch(styles, /(^|\n)\s*(body|html|:root)\s*\{/);
  assert.doesNotMatch(styles, /linear-gradient|box-shadow/);
  assert.doesNotMatch(styles, /border-left/);
});
