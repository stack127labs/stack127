import assert from "node:assert/strict";
import test from "node:test";
import { targetsForEvents } from "../../scripts/stack127/cache/targets.mjs";
import { PAGE_REGISTRY_TAG, SITEMAP_TAG } from "../../lib/cache-tags.ts";

test("a page change invalidates its document, homepage, and sitemap", () => {
  const targets = targetsForEvents([{ entity_type: "page", slug: "dns-tools" }]);
  assert.ok(targets.paths.includes("/dns-tools"));
  assert.ok(targets.paths.includes("/sitemap.xml"));
  assert.ok(targets.edgeTags.includes("page:dns-tools"));
  assert.ok(targets.nextTags.includes("stack127-page:dns-tools"));
  assert.ok(targets.nextTags.includes("stack127-tool-catalog:dns-tools"));
  assert.ok(targets.nextTags.includes("stack127-tool-catalogs"));
  assert.ok(targets.nextTags.includes(`${PAGE_REGISTRY_TAG}:dns-tools`));
  assert.ok(targets.nextTags.includes(SITEMAP_TAG));
  assert.ok(targets.edgeTags.includes("sitemap"));
  assert.ok(targets.warmPaths.includes("/sitemap.xml"));
});

test("hardware directory publication changes invalidate the static index in Next.js and at the edge", () => {
  for (const slug of ["nut-compatible-ups", "local-security-cameras", "matter-devices", "z-wave-devices", "zigbee-devices"]) {
    const targets = targetsForEvents([{ entity_type: "page", slug }]);
    assert.ok(targets.paths.includes(`/api/hardware-directory/${slug}`));
    assert.ok(targets.edgeTags.includes(`page:api:hardware-directory:${slug}`));
    assert.ok(targets.verifyPaths.includes(`/api/hardware-directory/${slug}`));
    assert.ok(!targets.warmPaths.includes(`/api/hardware-directory/${slug}`));
  }
});

test("CLI app data and publication changes invalidate the static index and purge its edge cache", () => {
  for (const event of [
    { entity_type: "cli_apps", slug: "all" },
    { entity_type: "self_host_catalog", slug: "all" },
    { entity_type: "page", slug: "cli-apps" },
  ]) {
    const targets = targetsForEvents([event]);
    assert.ok(targets.paths.includes("/cli-apps"));
    assert.ok(targets.paths.includes("/api/cli-apps/index"));
    assert.ok(targets.edgeTags.includes("page:api:cli-apps:index"));
    assert.ok(targets.edgeTags.includes("cli-apps-catalog"));
    assert.ok(targets.verifyPaths.includes("/api/cli-apps/index"));
    assert.ok(!targets.warmPaths.includes("/api/cli-apps/index"));
    if (event.entity_type !== "page") assert.ok(targets.nextTags.includes("stack127-terminal-apps"));
  }
});

test("an app change invalidates both directory views and its detail APIs", () => {
  const targets = targetsForEvents([{ entity_type: "self_host_app", slug: "immich" }]);
  assert.ok(targets.paths.includes("/self-host-apps"));
  assert.ok(targets.paths.includes("/self-hosted-app-resource-planner"));
  assert.ok(targets.paths.includes("/api/self-host-apps/immich"));
  assert.ok(targets.edgeTags.includes("page:api:self-host-apps:immich"));
  assert.ok(targets.nextTags.includes("stack127-self-host-apps"));
});

test("a catalog change refreshes navigation on every catalog page", () => {
  const targets = targetsForEvents(
    [{ entity_type: "page", slug: "kdp-tools" }],
    ["dns-tools", "kdp-tools", "storage-tools"],
    ["kdp-royalty-calculator", "dns-lookup"],
  );
  assert.ok(targets.paths.includes("/dns-tools"));
  assert.ok(targets.paths.includes("/storage-tools"));
  assert.ok(targets.paths.includes("/kdp-royalty-calculator"));
  assert.ok(targets.paths.includes("/dns-lookup"));
  assert.ok(targets.nextTags.includes("stack127-tool-catalog:storage-tools"));
  assert.ok(targets.nextTags.includes("stack127-tool-primary-catalogs"));
  assert.ok(targets.verifyPaths.includes("/kdp-royalty-calculator"));
  assert.ok(targets.warmPaths.includes("/kdp-royalty-calculator"));
});

test("platform fee changes refresh all categories, including when a section moves", () => {
  const targets = targetsForEvents([{ entity_type: "platform_fees", slug: "paid-communities-and-memberships" }]);
  assert.equal(targets.paths.length, 9);
  assert.ok(targets.paths.includes('/platform-fees'));
  assert.ok(targets.paths.includes('/platform-fees/creators-and-communities'));
  assert.ok(targets.nextTags.includes("stack127-platform-fees"));
  assert.ok(targets.edgeTags.includes("platform-fees-catalog"));
  assert.ok(targets.warmPaths.includes("/platform-fees/creators-and-communities"));
  assert.ok(targets.verifyPaths.includes("/platform-fees/creators-and-communities"));
  const unchangedSlug = targetsForEvents([{ entity_type: "platform_fees", slug: "game-assets" }]);
  assert.deepEqual(unchangedSlug.paths, targets.paths);
  assert.deepEqual(targetsForEvents([{ entity_type: 'platform_fees', slug: 'all' }]).paths, targets.paths);
  assert.ok(targets.paths.every(path => !path.includes('#')));
});

test("ad network edits refresh their list and details by group and page tags", () => {
  const targets = targetsForEvents([{ entity_type: "ad_networks", slug: "mediavine" }]);
  for (const path of ["/ad-networks", "/ad-networks/mediavine", "/ad-networks/stats", "/ad-networks/niches", "/ad-networks/niches/food", "/ad-network-checker", "/api/ad-networks/sites", "/api/ad-networks/site", "/"]) assert.ok(targets.paths.includes(path));
  assert.ok(targets.nextTags.includes("stack127-ad-networks"));
  assert.ok(targets.edgeTags.includes("ad-networks-catalog"));
  assert.ok(targets.edgeTags.includes("page:ad-networks:mediavine"));
  assert.ok(targets.edgeTags.includes("page:home"));
  assert.deepEqual(targets.warmPaths, targets.paths.filter(path => !path.startsWith("/api/")));
});

test("launch directory edits refresh the directory and homepage counts", () => {
  const targets = targetsForEvents([{ entity_type: "launch_directories", slug: "launch-directories" }]);
  for (const path of ["/launch-directories", "/launch-directories/compare", "/"]) assert.ok(targets.paths.includes(path));
  assert.ok(targets.nextTags.includes("stack127-launch-directories"));
  assert.ok(targets.edgeTags.includes("page:launch-directories"));
  assert.ok(targets.edgeTags.includes("page:home"));
  assert.deepEqual(targets.warmPaths, targets.paths);
});

test("app, shared catalog, and publication edits purge every search query variant", () => {
  for (const event of [
    { entity_type: "self_host_app", slug: "immich" },
    { entity_type: "self_host_catalog", slug: "all" },
    { entity_type: "page", slug: "self-host-apps" },
  ]) {
    const targets = targetsForEvents([event]);
    assert.ok(targets.paths.includes("/api/self-host-apps/search"));
    assert.ok(targets.edgeTags.includes("self-host-catalog"));
    assert.ok(targets.verifyPaths.includes("/api/self-host-apps/search"));
    assert.ok(!targets.warmPaths.includes("/api/self-host-apps/search"));
  }
});


test("parent directory copy changes purge inherited child icons at the edge", () => {
  for (const slug of ["keyboard-shortcuts", "ad-networks"]) {
    const targets = targetsForEvents([{ entity_type: "page", slug }]);
    assert.ok(targets.edgeTags.includes(`${slug}-catalog`));
    assert.ok(targets.nextTags.includes(`stack127-directory-page:${slug}`));
    const childOnly = targetsForEvents([{ entity_type: "page", slug: `${slug}/example` }]);
    assert.equal(childOnly.edgeTags.includes(`${slug}-catalog`), slug === "ad-networks");
  }
});


test("ad-network publication changes purge cached table and checker responses", () => {
  for (const slug of ["ad-networks", "ad-networks/mediavine", "ad-networks/niches/food", "ad-network-checker"]) {
    const targets = targetsForEvents([{entity_type:"page",slug}]);
    assert.ok(targets.edgeTags.includes("ad-networks-catalog"));
    assert.ok(targets.paths.includes("/api/ad-networks/sites"));
    assert.ok(targets.paths.includes("/api/ad-networks/site"));
    assert.ok(targets.verifyPaths.includes("/api/ad-networks/sites"));
    assert.ok(targets.verifyPaths.includes("/api/ad-networks/site"));
  }
});
