import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const homePath = new URL("../../../app/(site)/page.tsx", import.meta.url);
const helpersPath = new URL("../../../lib/page-registry-helpers.ts", import.meta.url);
const migrationPath = new URL(
  "../../../supabase/migrations/20260809120000_publish_three_tools.sql",
  import.meta.url,
);
const registryCheckPath = new URL(
  "../../../scripts/stack127/quality/seo-registry-check.mjs",
  import.meta.url,
);
const storageMigrationPath = new URL(
  "../../../supabase/migrations/20260809140000_publish_storage_tools.sql",
  import.meta.url,
);

const featuredToolSlugs = [
  "dockerignore-tester",
  "home-assistant-energy-entity-checker",
  "nginx-proxy-pass-calculator",
  "nfs-firewall-rules",
];

test("home hero uses one simple software stack without labels or connectors", () => {
  const spec = JSON.parse(readFileSync(new URL("../../../app/(site)/art/site--hero-stack127.spec.json", import.meta.url), "utf8"));
  assert.equal(spec.type, "toolSpot");
  assert.equal(spec.data.icon, "softwareStack");
  assert.equal(spec.data.motif, undefined);
  const svg = readFileSync(new URL("../../../app/(site)/art/site--hero-stack127.svg", import.meta.url), "utf8");
  assert.doesNotMatch(svg, /<text\b/);
  assert.match(svg, /A terminal prompt on stacked app windows/);
});

test("home includes the keyboard shortcuts directory in the curated feature set", () => {
  const home = readFileSync(homePath, "utf8");
  const helpers = readFileSync(helpersPath, "utf8");

  assert.match(helpers, /"keyboard-shortcuts"/);
  assert.match(home, /"keyboard-shortcuts":\s*Keyboard/);
});

test("labs, keyboard shortcuts, and cli apps have homepage marker spots", () => {
  const home = readFileSync(homePath, "utf8");

  for (const [slug, artName] of [
    ["labs", "siteSpotLabsArt"],
    ["keyboard-shortcuts", "siteSpotKeyboardShortcutsArt"],
    ["cli-apps", "siteSpotCliAppsArt"],
  ]) {
    assert.match(home, new RegExp(`import \\{ ${artName} \\}`), `${slug} imports its marker art`);
    assert.match(home, new RegExp(`[\"]${slug}[\"]:\\s*${artName}`), `${slug} maps to its marker art`);
  }
});

test("home excludes individual tools and includes every top-level directory, catalog, and reference", () => {
  const home = readFileSync(homePath, "utf8");
  const helpers = readFileSync(helpersPath, "utf8");

  for (const slug of featuredToolSlugs) {
    assert.doesNotMatch(helpers, new RegExp(`["]${slug}["]`), `${slug} is not home eligible`);
    assert.doesNotMatch(home, new RegExp(`["]${slug}["]:`), `${slug} has no home card`);
  }

  const toolsRoot = new URL("../../../app/(site)/(tools)/", import.meta.url);
  for (const slug of readdirSync(toolsRoot)) {
    if (!existsSync(new URL(`${slug}/page.tsx`, toolsRoot))) continue;
    assert.doesNotMatch(helpers, new RegExp(`"${slug}"`), `${slug} stays inside a collection`);
  }

  for (const family of ["directories", "catalogs", "references"]) {
    const root = new URL(`../../../app/(site)/(${family})/`, import.meta.url);
    for (const slug of readdirSync(root)) {
      if (!existsSync(new URL(`${slug}/page.tsx`, root))) continue;
      assert.match(helpers, new RegExp(`"${slug}"`), `${slug} is home eligible`);
      assert.match(home, new RegExp(`"${slug}":\\s*[A-Z]`), `${slug} has an icon`);
    }
  }
});

test("the release publishes the three new tools and keeps registry approval manifest-driven", () => {
  assert.equal(existsSync(migrationPath), true);
  const migration = readFileSync(migrationPath, "utf8");
  const registryCheck = readFileSync(registryCheckPath, "utf8");

  assert.match(registryCheck, /pageManifests\(\)/);
  assert.match(registryCheck, /entry\.state === "published"/);
  assert.match(registryCheck, /expectedPublishedSlugs/);

  for (const slug of featuredToolSlugs.slice(1)) {
    assert.match(migration, new RegExp(`'${slug}'`), `${slug} is published by migration`);
  }
});

test("home carries a storage collection card with its own art and tool count", () => {
  const home = readFileSync(homePath, "utf8");
  const helpers = readFileSync(helpersPath, "utf8");

  assert.match(helpers, /"storage-tools"/);
  assert.match(home, /"storage-tools":\s*[A-Z]/);
  assert.match(home, /"storage-tools":\s*siteSpotStorageToolsArt/);
  assert.match(home, /storageToolCount/);
});

test("the storage release publishes the hub and all three calculators", () => {
  assert.equal(existsSync(storageMigrationPath), true);
  const migration = readFileSync(storageMigrationPath, "utf8");

  for (const slug of [
    "storage-tools",
    "raid-calculator",
    "zfs-capacity-calculator",
    "zfs-padding-calculator",
  ]) {
    assert.match(migration, new RegExp(`'${slug}'`), `${slug} is published by migration`);
  }
});

test("every homepage identity has generated marker art, never an enlarged UI icon", () => {
  const home = readFileSync(homePath, "utf8");
  const icons = home.match(/const pageIcons[^=]*= \{([\s\S]*?)\n\};/)[1];
  const art = home.match(/const pageArt[^=]*= \{([\s\S]*?)\n\};/)[1];
  for (const [, slug] of icons.matchAll(/"([^"]+)":/g)) {
    assert.match(art, new RegExp(`"${slug}":`), `${slug} needs its own marker spot`);
  }
  assert.doesNotMatch(home, /home-page-card-symbol|art \? <Doodle/);
  for (const slug of ["local-security-cameras", "nut-compatible-ups", "zigbee-coordinators", "zigbee-devices", "matter-devices", "z-wave-devices"]) {
    const base = new URL(`../../../app/(site)/art/site--spot-${slug}`, import.meta.url);
    assert.ok(existsSync(`${base.pathname}.spec.json`));
    assert.ok(existsSync(`${base.pathname}.ts`));
    const svg = readFileSync(`${base.pathname}.svg`, "utf8");
    assert.doesNotMatch(svg, /<text\b|lucide/);
    assert.match(svg, /--ma-primary/);
  }
});
