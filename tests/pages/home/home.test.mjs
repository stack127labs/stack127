import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("home features the four uncollected tools with icons and marker spots", () => {
  const home = readFileSync(homePath, "utf8");
  const helpers = readFileSync(helpersPath, "utf8");

  for (const slug of featuredToolSlugs) {
    assert.match(helpers, new RegExp(`["]${slug}["]`), `${slug} is home eligible`);
    assert.match(home, new RegExp(`["]${slug}["]:\\s*[A-Z]`), `${slug} has an icon`);
    assert.match(home, new RegExp(`["]${slug}["]:\\s*siteSpot`), `${slug} has marker art`);
  }

  for (const artSlug of ["dockerignore", "home-assistant-energy", "nginx-proxy-pass", "nfs-firewall"]) {
    assert.match(home, new RegExp(`siteSpot${artSlug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("")}Art`));
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
