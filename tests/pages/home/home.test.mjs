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
  "../../../scripts/version127/quality/seo-registry-check.mjs",
  import.meta.url,
);

const featuredToolSlugs = [
  "dockerignore-tester",
  "home-assistant-energy-entity-checker",
  "nginx-proxy-pass-calculator",
  "nfs-firewall-rules",
];

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
