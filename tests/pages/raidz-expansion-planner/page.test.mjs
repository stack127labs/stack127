import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const route = new URL("../../../app/(site)/(tools)/raidz-expansion-planner/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("raidz-expansion-planner.tsx", route);
const stylesPath = new URL("raidz-expansion-planner.module.css", route);
const enginePath = new URL("../../../lib/storage/zfs-expansion.ts", import.meta.url);
const hubPath = new URL("../../../app/(site)/(catalogs)/storage-tools/page.tsx", import.meta.url);
const sidebarPath = new URL("../../../app/(site)/(catalogs)/storage-tools/storage-tools-sidebar.tsx", import.meta.url);
const previewPath = new URL("../../../scripts/storage-tools/preview-local-pages.mjs", import.meta.url);
const migrationPath = new URL(
  "../../../supabase/migrations/20260813000000_publish_raidz_expansion_planner.sql",
  import.meta.url,
);

test("owns a published flat tool route", () => {
  for (const file of [pagePath, clientPath, stylesPath, enginePath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(new URL("page.json", import.meta.url), "utf8"));
  assert.equal(manifest.route, "/raidz-expansion-planner");
  assert.equal(manifest.state, "published");
  assert.equal(existsSync(migrationPath), true);
  const migration = readFileSync(migrationPath, "utf8");
  assert.match(migration, /'raidz-expansion-planner'/);
  assert.match(migration, /'WebApplication'/);
  assert.doesNotMatch(readFileSync(previewPath, "utf8"), /slug:\s*"raidz-expansion-planner"/);
});

test("keeps formula offline and outside React", () => {
  const engine = readFileSync(enginePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(engine, /calculateRaidzAllocation/);
  assert.match(engine, /bigint/);
  assert.doesNotMatch(engine, /react|fetch\(|navigator\.|history\.|localStorage|sessionStorage/i);
  assert.doesNotMatch(client, /fetch\(|localStorage|sessionStorage|WebSocket|Worker/);
});

test("renders concise server content around the operational tool", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  const guide = readToolPageSeed("raidz-expansion-planner");
  assert.match(page, /getRequiredToolPage\("raidz-expansion-planner"\)/);
  assert.match(page, /RaidzExpansionPlanner[\s\S]*ToolPageMarkdown/);
  for (const label of ["Current width", "Final width", "Smallest existing member", "Each added disk", "Current physical allocation", "Workload", "recordsize", "ashift", "Plan expansion", "Modeled capacity gained", "Expansion steps", "Calculation details", "Copy summary", "Share plan"]) assert.match(client, new RegExp(label));
  assert.doesNotMatch(client, /<ToolDisclosure label={`Allocation model:/);
  for (const copy of [
    "Get the inputs from the vdev you are widening",
    "zpool list -vp -o name,alloc",
    "representative block size",
    "Why immediate capacity can be lower than a fresh vdev",
    "Reflow",
    "Rewrite",
    "reported capacity",
    "Check the pool before you widen the vdev",
    "OpenZFS 2.3",
    "raidz_expansion",
    "healthy",
    "smallest existing member",
    "What this model does not know",
    "never been expanded",
    "no writes, deletes, or rewrites",
    "stays in this browser",
    "normalized configuration in the URL",
    "/zfs-capacity-calculator",
    "/zfs-padding-calculator",
  ]) assert.match(guide, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.match(guide, /^\| Current physical allocation/m);
  assert.doesNotMatch(`${page}\n${client}\n${guide}`, /FAQ|How to use|Methodology|Related reading|—|–/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots/);
});

test("implements the ready interface contract without duplicate result regions", () => {
  const client = readFileSync(clientPath, "utf8");
  for (const primitive of [
    "ToolActionRow",
    "ToolAllocationBar",
    "ToolButton",
    "ToolChoiceGroup",
    "ToolDataTable",
    "ToolDisclosure",
    "ToolKeyValueList",
    "ToolPrimaryResult",
    "ToolQuantityInput",
    "ToolSelect",
    "ToolStatus",
    "ToolTextField",
  ]) assert.match(client, new RegExp(`\\b${primitive}\\b`));
  assert.match(client, /values\.steps\.map/);
  assert.match(client, /Live reported capacity is not predicted by this model\./);
  assert.doesNotMatch(client, /Capacity plan|Fix these inputs|errorSummary|Reported capacity[\s\S]*Unknown|ToolTimeline|ToolProgressBar/);
  assert.doesNotMatch(client, /Number\([^)]*(?:bytes|Bytes)|parseFloat\([^)]*(?:bytes|Bytes)/);
});

test("uses one responsive shared workbench", () => {
  const styles = readFileSync(stylesPath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(client, /data-tool-workbench/);
  assert.doesNotMatch(styles, /\.tool\s*\{[^}]*(?:border:\s*1\.5px|border-radius:)/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
});

test("hub and sidebar use the flat route and same identity", () => {
  const hub = readFileSync(hubPath, "utf8");
  const sidebar = readFileSync(sidebarPath, "utf8");
  for (const source of [hub, sidebar]) {
    assert.match(source, /\/raidz-expansion-planner/);
    assert.doesNotMatch(source, /\/storage-tools\/raidz-expansion-planner/);
  }
  assert.match(hub, /raidzExpansionArt/);
  assert.match(sidebar, /ChevronsRight/);
});
