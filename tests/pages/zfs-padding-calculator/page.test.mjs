import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const route = new URL("../../../app/(site)/(tools)/zfs-padding-calculator/", import.meta.url);
const pagePath = new URL("page.tsx", route);
const clientPath = new URL("zfs-padding-calculator.tsx", route);
const stylesPath = new URL("zfs-padding-calculator.module.css", route);
const enginePath = new URL("../../../lib/storage/zfs-padding.ts", import.meta.url);
const primitivePath = new URL("../../../lib/storage/zfs-raidz-allocation.ts", import.meta.url);
const hubPath = new URL("../../../app/(site)/(catalogs)/storage-tools/page.tsx", import.meta.url);
const sidebarPath = new URL("../../../app/(site)/(catalogs)/storage-tools/storage-tools-sidebar.tsx", import.meta.url);
const previewPath = new URL("../../../scripts/storage-tools/preview-local-pages.mjs", import.meta.url);

const manifestPath = new URL("page.json", import.meta.url);
const migrationPath = new URL(
  "../../../supabase/migrations/20260809140000_publish_storage_tools.sql",
  import.meta.url,
);

test("the published padding route owns every source file", () => {
  for (const file of [pagePath, clientPath, stylesPath, enginePath, primitivePath, migrationPath]) assert.equal(existsSync(file), true, file.pathname);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/zfs-padding-calculator");
  assert.equal(manifest.state, "published");
  assert.match(readFileSync(migrationPath, "utf8"), /'zfs-padding-calculator'/);
});

test("server identity, simple introduction, and concise tool UI stay inside the page boundary", () => {
  const page = readFileSync(pagePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(page, /getRequiredToolPage\("zfs-padding-calculator"\)/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(page, /<ToolPageMarkdown/);
  for (const label of ["Geometry", "RAIDZ level", "Vdev width", "Block model", "Workload", "recordsize", "ashift", "Calculate allocation", "Physical allocation", "Allocation composition", "Nearby block sizes", "Calculation details", "Copy summary", "Share configuration"]) assert.match(client, new RegExp(label));
  assert.doesNotMatch(`${page}\n${client}`, /FAQ|How to use|Methodology|—|–/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots/);
  assert.doesNotMatch(client, /best|optimal|recommended|installed free space|predict compression/i);
});

test("implements the ready interface contract with shared controls and no duplicate result facts", () => {
  const client = readFileSync(clientPath, "utf8");
  for (const primitive of [
    "ToolActionRow",
    "ToolAllocationBar",
    "ToolButton",
    "ToolChoiceGroup",
    "ToolCopyAction",
    "ToolDataTable",
    "ToolDisclosure",
    "ToolKeyValueList",
    "ToolPrimaryResult",
    "ToolQuantityInput",
    "ToolSelect",
    "ToolTextField",
  ]) assert.match(client, new RegExp(`\\b${primitive}\\b`));
  assert.match(client, /palette="categorical"/);
  assert.match(client, /tone: "chartreuse"/);
  assert.match(client, /tone: "cyan"/);
  assert.match(client, /tone: "blue"/);
  assert.match(client, /tone: "violet"/);
  assert.match(client, /row\.selected \? `\$\{formatZfsPaddingBytes\(row\.blockSizeBytes\)\} Current`/);
  assert.doesNotMatch(client, /primaryMetrics|sectorEquation|comparisonTrack|formatZfsPaddingMultiplier|>Overhead<|>Multiplier<|Show calculation/);
  assert.doesNotMatch(client, /Number\([^)]*(?:bytes|Bytes)|parseFloat\([^)]*(?:bytes|Bytes)/);
});

test("the guide explains the controls, one exact example, limits, privacy, and next step", () => {
  const guide = readToolPageSeed("zfs-padding-calculator");
  for (const copy of [
    "What each option changes",
    "recordsize.*volblocksize.*describe different blocks",
    "Why an 8 KiB block can occupy 24 KiB",
    "Space efficiency is not a performance recommendation",
    "What this calculator leaves out",
    "Your calculation stays in your browser",
    "Need whole-pool capacity",
  ]) assert.match(guide, new RegExp(copy));
  for (const value of ["Logical data", "Parity", "Padding", "Physical allocation", "24 KiB"]) assert.match(guide, new RegExp(value));
  assert.match(guide, /\]\(\/zfs-capacity-calculator\)/);
  assert.doesNotMatch(guide, /FAQ|How to use|Methodology|best|optimal|recommended|—|–/i);
});

test("formula and state behavior remain outside React and offline", () => {
  const engine = readFileSync(enginePath, "utf8");
  const primitive = readFileSync(primitivePath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(engine, /calculateZfsPadding/);
  assert.match(primitive, /calculateRaidzAllocation/);
  assert.match(engine, /bigint/);
  assert.doesNotMatch(`${engine}\n${primitive}`, /react|fetch\(|XMLHttpRequest|WebSocket|Worker|localStorage|sessionStorage|navigator\.|history\./i);
  assert.doesNotMatch(client, /fetch\(|localStorage|sessionStorage|WebSocket|Worker/);
});

test("the shared workbench reflows without clipped results", () => {
  const styles = readFileSync(stylesPath, "utf8");
  const client = readFileSync(clientPath, "utf8");
  assert.match(client, /data-tool-workbench/);
  assert.doesNotMatch(styles, /\.tool\s*\{[^}]*(?:border:\s*1\.5px|border-radius:)/s);
  assert.match(styles, /@media \(max-width: 760px\)/);
  assert.match(styles, /@media \(max-width: 390px\)/);
  assert.match(styles, /min-height:\s*44px/);
  assert.match(styles, /min-width:\s*0/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.match(styles, /\.calculationDetails\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(styles, /border-left\s*:|box-shadow\s*:|linear-gradient|radial-gradient/);
  for (const declaration of styles.match(/font-size\s*:[^;]+;/g) ?? []) assert.match(declaration, /var\(--text-(?:body|small|h1|h2|h3)\)/);
});

test("route identity agrees across hub, sidebar, and the registry migration", () => {
  for (const file of [hubPath, sidebarPath, migrationPath]) assert.match(readFileSync(file, "utf8"), /zfs-padding-calculator/);
  assert.match(readFileSync(previewPath, "utf8"), /127\.0\.0\.1|localhost/);
});
