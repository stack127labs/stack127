import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("owns one published flat route with the requested files", () => {
  const manifest = JSON.parse(read("tests/pages/unraid-calculator/page.json"));
  assert.deepEqual(manifest.route, "/unraid-calculator");
  assert.equal(manifest.state, "published");
  for (const path of [
    "app/(site)/(tools)/unraid-calculator/page.tsx",
    "app/(site)/(tools)/unraid-calculator/unraid-calculator.tsx",
    "app/(site)/(tools)/unraid-calculator/unraid-calculator-guide.tsx",
    "app/(site)/(tools)/unraid-calculator/unraid-calculator.module.css",
    "app/(site)/(tools)/unraid-calculator/unraid-calculator-engine.ts",
  ]) assert.equal(existsSync(new URL(path, root)), true, path);
});

test("keeps the server route identity and COPY-01 intro at the array boundary", () => {
  const page = read("app/(site)/(tools)/unraid-calculator/page.tsx");
  assert.match(page, /Unraid Main Array/);
  assert.match(page, /Plan a Main Array for a homelab from explicit parity and data roles/);
  assert.match(page, /array-level data capacity/);
  assert.match(page, /Filesystem-visible space remains unknown/);
  assert.match(page, /<UnraidCalculatorGuide \/>/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json|canonical|robots/);
  assert.doesNotMatch(page, /FAQ|How to use|Related/);
});

test("covers COPY-02 through COPY-05 in a concise server-rendered guide", () => {
  const page = read("app/(site)/(tools)/unraid-calculator/page.tsx");
  const guide = read("app/(site)/(tools)/unraid-calculator/unraid-calculator-guide.tsx");
  const routeSource = `${page}\n${guide}`;

  assert.match(guide, /<article/);
  assert.match(guide, /proseClassName/);
  assert.match(guide, /proseFlowClassName/);
  for (const heading of [
    "Read the headline as array-level data capacity, not filesystem free space",
    "Verify a planned disk change in the official Unraid docs",
    "The model leaves filesystem and operational space unknown",
    "Your drive list stays in the browser",
  ]) assert.match(guide, new RegExp(heading));
  assert.match(guide, /Protection modes/);
  assert.match(guide, /<table className=\{styles\.guideTable\}>/);
  assert.match(guide, /tabIndex=\{0\}/);
  for (const phrase of [
    "planning envelope",
    "filesystem metadata",
    "cache pools",
    "parity is not a backup",
    "local calculation",
    "share URL",
  ]) assert.match(guide, new RegExp(phrase, "i"));
  for (const href of [
    "https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/adding-disks-to-array/",
    "https://docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/",
    "/raid-calculator",
    "/zfs-capacity-calculator",
    "/raidz-expansion-planner",
  ]) assert.match(guide, new RegExp(`href=\"${href.replaceAll("/", "\\/")}\"`));

  const visibleWords = guide
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}()=\"'`;,:./]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  assert.ok(visibleWords.length <= 435, `guide source contains ${visibleWords.length} tokens`);
  assert.doesNotMatch(routeSource, /FAQ|How to use|Methodology|—|–/);
  assert.doesNotMatch(routeSource, /best|optimal|recommended|free space estimate|safe to proceed/i);
});

test("keeps formula logic outside React and avoids shared registry mutation", () => {
  const client = read("app/(site)/(tools)/unraid-calculator/unraid-calculator.tsx");
  const engine = read("app/(site)/(tools)/unraid-calculator/unraid-calculator-engine.ts");
  assert.match(client, /unraid-calculator-engine/);
  assert.doesNotMatch(client, /createStorageCalculatorRegistry|registry\.register/);
  assert.match(client, /calculateUnraidCapacity\(/);
  assert.match(engine, /calculateUnraidCapacity/);
  assert.doesNotMatch(`${client}\n${engine}`, /fetch\s*\(|localStorage|sessionStorage|navigator\.clipboard\.read|dangerouslySetInnerHTML|innerHTML\s*=/);
  assert.doesNotMatch(engine, /lib\/storage\/index/);
});

test("uses the approved result structures and input-only versioned state", () => {
  const client = read("app/(site)/(tools)/unraid-calculator/unraid-calculator.tsx");
  const engine = read("app/(site)/(tools)/unraid-calculator/unraid-calculator-engine.ts");
  assert.match(client, /Calculate capacity/);
  assert.match(client, /Copy summary/);
  assert.match(client, /Share configuration/);
  assert.match(client, /Reset/);
  assert.match(client, /aria-live="polite"/);
  assert.match(client, /history\.replaceState/);
  assert.match(engine, /UNRAID_CALCULATION_VERSION\s*=\s*1/);
  assert.match(engine, /UNRAID_INPUT_VERSION\s*=\s*1/);
  assert.match(engine, /encodeStorageState/);
  assert.match(engine, /decodeStorageState/);
});

test("keeps route CSS local, responsive, and free of banned visual treatments", () => {
  const styles = read("app/(site)/(tools)/unraid-calculator/unraid-calculator.module.css");
  assert.doesNotMatch(styles, /border-left\s*:|linear-gradient|box-shadow\s*:/);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)/);
  assert.match(styles, /min-width:\s*0/);
  for (const declaration of styles.match(/font-size\s*:[^;]+;/g) ?? []) {
    assert.match(declaration, /var\(--text-(?:body|small|h1|h2|h3)\)/);
  }
});

test("does not add collection, registry, migration, or shared storage ownership", () => {
  const manifest = JSON.parse(read("tests/pages/unraid-calculator/page.json"));
  assert.deepEqual(manifest.repositories, []);
  assert.deepEqual(manifest.scripts, ["scripts/storage-tools/preview-local-pages.mjs"]);
  const page = read("app/(site)/(tools)/unraid-calculator/page.tsx");
  assert.doesNotMatch(page, /storageToolCount|availableStorageTools|stack127_pages|supabase|migration/);
});
