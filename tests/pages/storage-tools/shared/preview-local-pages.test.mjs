import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../../", import.meta.url);
const previewPath = new URL("scripts/storage-tools/preview-local-pages.mjs", root);
const previewSource = readFileSync(previewPath, "utf8");

const previewSlugs = [
  "shr-calculator",
  "unraid-calculator",
  "snapraid-mergerfs-planner",
  "drive-reliability",
  "rebuild-calculator",
  "ceph-capacity-calculator",
  "storage-growth-planner",
  "storage-layout-advisor",
];

test("the shared storage preview owns exactly the eight guarded publication routes", () => {
  for (const slug of previewSlugs) assert.match(previewSource, new RegExp(`slug: [\\"']${slug}[\\"']`), slug);
  assert.match(previewSource, /PREVIEW_ROWS/);
  assert.match(previewSource, /--remove/);
  assert.match(previewSource, /begin/i);
  assert.match(previewSource, /commit/i);
  assert.match(previewSource, /rollback/i);
  assert.match(previewSource, /remaining.*0|zero.*remaining/i);
});

test("the preview guard positively identifies managed development and rejects production", () => {
  assert.match(previewSource, /phhrfvmncpqqmmgruktx/);
  assert.match(previewSource, /tulgfrqamtcshdtmhvpx/);
  assert.match(previewSource, /SUPABASE_URL/);
  assert.match(previewSource, /Refusing.*production/i);
  assert.match(previewSource, /Refusing.*managed development/i);
  assert.match(previewSource, /127\\.0\\.0\\.1|localhost/);
});

test("preview insertion is temporary and cannot overwrite an existing registry row", () => {
  assert.match(previewSource, /select[\s\S]*where slug = any/i);
  assert.match(previewSource, /existing registry rows.*refusing|refusing.*existing registry rows/i);
  assert.doesNotMatch(previewSource, /on conflict/i);
  assert.match(previewSource, /delete from public\.stack127_pages/);
});

test("all eight route manifests use the shared preview script", () => {
  for (const slug of previewSlugs) {
    const manifest = JSON.parse(readFileSync(new URL(`tests/pages/${slug}/page.json`, root), "utf8"));
    assert.equal(manifest.state, "published", slug);
    assert.ok(manifest.scripts.includes("scripts/storage-tools/preview-local-pages.mjs"), slug);
  }
});
