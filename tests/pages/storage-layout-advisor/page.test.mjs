import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("app/(site)/(tools)/storage-layout-advisor/page.tsx", "utf8");
const tool = readFileSync("app/(site)/(tools)/storage-layout-advisor/storage-layout-advisor.tsx", "utf8");
const guide = readFileSync("app/(site)/(tools)/storage-layout-advisor/storage-layout-advisor-guide.tsx", "utf8");
const manifest = JSON.parse(readFileSync("tests/pages/storage-layout-advisor/page.json", "utf8"));

test("owns one published flat route", () => {
  assert.equal(manifest.route, "/storage-layout-advisor");
  assert.equal(manifest.state, "published");
  assert.match(page, /<AppShell[\s\S]*sidebar=\{<StorageToolsSidebar active="layout-advisor" \/>\}/);
  assert.equal(page.includes("public.stack127_pages"), false);
  assert.equal(page.includes("generateMetadata"), false);
  assert.equal(page.includes("application/ld+json"), false);
});

test("keeps prose server-side and operational UI client-side", () => {
  assert.match(page, /Storage Layout Advisor/);
  assert.match(page, /<StorageLayoutAdvisor/);
  assert.match(page, /<StorageLayoutAdvisorGuide/);
  assert.match(guide, /inputs that represent/i);
  assert.match(guide, /usable (?:space|capacity)/i);
  assert.match(guide, /does not inspect/i);
  assert.match(guide, /browser/i);
  assert.match(guide, /verify/i);
  assert.match(guide, /zfs-capacity-calculator|raidz-expansion-planner/i);
  assert.doesNotMatch(tool, /fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage/);
  assert.doesNotMatch(tool, /dangerouslySetInnerHTML/);
  assert.match(tool, /window\.history\.replaceState\(null, "", window\.location\.pathname\)/);
});

test("uses shared navigation without modifying publication or storage ownership files", () => {
  assert.equal(page.includes("storage-tools-sidebar"), true);
  assert.equal(tool.includes("public.stack127_pages"), false);
});
