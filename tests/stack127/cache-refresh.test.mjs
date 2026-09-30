import assert from "node:assert/strict";
import test from "node:test";
import { refreshTargets } from "../../scripts/stack127/cache/refresh.mjs";
import { targetsForEvents } from "../../scripts/stack127/cache/targets.mjs";

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
