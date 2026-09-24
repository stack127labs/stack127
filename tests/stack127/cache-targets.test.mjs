import assert from "node:assert/strict";
import test from "node:test";
import { targetsForEvents } from "../../scripts/stack127/cache/targets.mjs";

test("a page change invalidates its document, homepage, and sitemap", () => {
  const targets = targetsForEvents([{ entity_type: "page", slug: "dns-tools" }]);
  assert.ok(targets.paths.includes("/dns-tools"));
  assert.ok(targets.paths.includes("/sitemap.xml"));
  assert.ok(targets.edgeTags.includes("page:dns-tools"));
  assert.ok(targets.nextTags.includes("stack127-page:dns-tools"));
  assert.ok(targets.nextTags.includes("stack127-tool-catalog:dns-tools"));
  assert.ok(targets.nextTags.includes("stack127-tool-catalogs"));
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
  );
  assert.ok(targets.paths.includes("/dns-tools"));
  assert.ok(targets.paths.includes("/storage-tools"));
  assert.ok(targets.nextTags.includes("stack127-tool-catalog:storage-tools"));
});
