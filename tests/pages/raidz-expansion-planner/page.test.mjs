import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const route = new URL("../../../app/(site)/(tools)/raidz-expansion-planner/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("raidz-expansion-planner.tsx", route);
const guidePath = new URL("raidz-expansion-guide.tsx", route);
const stylesPath = new URL("raidz-expansion-planner.module.css", route);
const enginePath = new URL("../../../lib/storage/zfs-expansion.ts", import.meta.url);
const hubPath = new URL("../../../app/(site)/storage-tools/page.tsx", import.meta.url);
const sidebarPath = new URL("../../../app/(site)/storage-tools/storage-tools-sidebar.tsx", import.meta.url);
const previewPath = new URL("../../../scripts/storage-tools/preview-local-pages.mjs", import.meta.url);
const migrationPath = new URL(
  "../../../supabase/migrations/20260813000000_publish_raidz_expansion_planner.sql",
  import.meta.url,
);

test("owns a published flat tool route", () => {
  for (const file of [pagePath, clientPath, guidePath, stylesPath, enginePath]) assert.equal(existsSync(file), true, file.pathname);
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
  const guide = readFileSync(guidePath, "utf8");
  assert.match(page, /RAIDZ expansion/);
  assert.match(page, /one existing, never-expanded RAIDZ vdev/i);
  assert.match(page, /reported by .*zfs list.*df.*unknown/is);
  assert.match(page, /RaidzExpansionPlanner[\s\S]*RaidzExpansionGuide/);
  for (const label of ["Current width", "Final width", "Smallest member", "Each added disk", "Current physical allocation", "Plan expansion", "Capacity plan", "Expansion steps", "Show calculation", "Copy summary", "Share plan"]) assert.match(client, new RegExp(label));
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
  assert.match(guide, /proseClassName/);
  assert.match(guide, /proseFlowClassName/);
  assert.match(guide, /<table/);
  assert.doesNotMatch(`${page}\n${client}\n${guide}`, /FAQ|How to use|Methodology|Related reading|—|–/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots/);
});

test("uses one responsive framed tool", () => {
  const styles = readFileSync(stylesPath, "utf8");
  assert.match(styles, /\.tool\s*\{[^}]*border:\s*1\.5px solid var\(--color-border-strong\);/s);
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
    assert.match(source, /ChevronsRight/);
    assert.doesNotMatch(source, /\/storage-tools\/raidz-expansion-planner/);
  }
});
