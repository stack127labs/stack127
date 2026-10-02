import assert from "node:assert/strict";
import test from "node:test";
import { refreshTargets, selectRevalidationBatch } from "../../scripts/stack127/cache/refresh.mjs";
import { targetsForEvents } from "../../scripts/stack127/cache/targets.mjs";

test("related catalog updates rebuild their shared tool sidebars once", () => {
  const catalogs = ["saas-tools", "dns-tools", "storage-tools"];
  const queued = catalogs.map(slug => ({ entity_type: "page", slug }));
  queued.splice(1, 0, { entity_type: "platform_fees", slug: "courses" });
  const batch = selectRevalidationBatch(queued);
  assert.deepEqual(batch.map(event => event.slug), catalogs);
  const targets = targetsForEvents(batch, catalogs, ["raid-calculator", "dns-lookup"]);
  assert.equal(targets.verifyPaths.filter(path => path === "/raid-calculator").length, 1);
  assert.equal(targets.verifyPaths.filter(path => path === "/").length, 1);
});

test("the oldest ready source determines a bounded refresh batch", () => {
  for (const [entity_type, limit] of [["page", 8], ["platform_fees", 20], ["ad_networks", 20]]) {
    const events = Array.from({ length: 40 }, (_, index) => ({ entity_type, slug: String(index) }));
    events.splice(2, 0, { entity_type: "cli_apps", slug: "cli-apps" });
    const batch = selectRevalidationBatch(events);
    assert.equal(batch.length, limit);
    assert.equal(batch[0].slug, "0");
    assert.equal(batch.at(-1).slug, String(limit - 1));
    assert.ok(batch.every(event => event.entity_type === entity_type));
  }
  assert.deepEqual(selectRevalidationBatch([]), []);
});

test("a changed app refreshes its facts, planner, license counts, and homepage", () => {
  const t = targetsForEvents([{ entity_type: "self_host_app", slug: "immich" }]);
  for (const path of ["/software-licenses-for-self-hosting", "/self-host-apps", "/self-hosted-app-resource-planner", "/api/self-host-apps/immich", "/api/resource-planner-app/immich", "/"]) assert.ok(t.paths.includes(path), path);
  assert.ok(t.nextTags.includes("stack127-self-host-app:immich"));
  assert.ok(t.verifyPaths.includes("/api/self-host-apps/immich"));
});

test("shared GitHub facts also refresh CLI data and all cached app details", () => {
  const t = targetsForEvents([{ entity_type: "self_host_catalog", slug: "all" }]);
  assert.ok(t.paths.includes("/cli-apps"));
  assert.ok(t.nextTags.includes("stack127-terminal-apps"));
  assert.ok(t.nextTags.includes("stack127-self-host-details"));
  assert.ok(t.edgeTags.includes("self-host-detail"));
});

test("unpublishing the planner also removes cached search and detail API responses", () => {
  const targets = targetsForEvents([{ entity_type: "page", slug: "self-hosted-app-resource-planner" }]);
  assert.ok(targets.paths.includes("/api/resource-planner-index"));
  assert.ok(targets.edgeTags.includes("page:api:resource-planner-index"));
  assert.ok(targets.edgeTags.includes("self-host-detail"));
});

test("Cloudflare is cleared only after the origin has verified fresh content", async () => {
  const calls = [];
  await refreshTargets({ verifyPaths: ["/about"], edgeTags: ["page:about"] }, {
    invalidate: async () => calls.push("invalidate"),
    rebuild: async () => { calls.push("verify"); return [{ path: "/about", revision: "new" }]; },
    purge: async () => calls.push("purge"),
    warm: async () => calls.push("warm"),
  });
  assert.deepEqual(calls, ["invalidate", "verify", "purge", "warm"]);
});

test("stale origin content leaves Cloudflare and the queued update untouched", async () => {
  let purged = false;
  await assert.rejects(refreshTargets({ verifyPaths: ["/about"], edgeTags: [] }, {
    invalidate: async () => {}, rebuild: async () => { throw new Error("stale content"); },
    purge: async () => { purged = true; }, warm: async () => {},
  }), /stale content/);
  assert.equal(purged, false);
});

test("a failed public refresh cannot be acknowledged as a successful update", async () => {
  await assert.rejects(refreshTargets({ verifyPaths: ["/about"], edgeTags: [] }, {
    invalidate: async () => {}, rebuild: async () => [{ path: "/about" }],
    purge: async () => {}, warm: async () => { throw new Error("public response is stale"); },
  }), /public response is stale/);
});
