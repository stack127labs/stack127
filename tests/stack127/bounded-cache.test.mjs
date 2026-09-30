import assert from "node:assert/strict";
import test from "node:test";
import { boundedCache, filterCacheKey, invalidateBoundedCaches } from "../../lib/bounded-cache.ts";
import { plannerSearchPattern } from "../../lib/planner-search.ts";

test("filters, sorts, and page numbers do not share the wrong result", async () => {
  let loads = 0;
  const read = params => boundedCache("filters-test", filterCacheKey(params), async () => { loads++; return params; }, ["apps"]);
  assert.deepEqual(await read({ q: "home", sort: "name", page: "2" }), { q: "home", sort: "name", page: "2" });
  await read({ page: "2", sort: "name", q: "home" });
  assert.equal(loads, 1);
  await read({ q: "home", sort: "popular", page: "2" });
  await read({ q: "home", sort: "name", page: "3" });
  assert.equal(loads, 3);
});

test("editing data invalidates in-flight results and retryable failures are not cached", async () => {
  let finish;
  const old = boundedCache("edit-test", "key", () => new Promise(resolve => { finish = resolve; }), ["changed"]);
  await Promise.resolve(); invalidateBoundedCaches(["changed"]);
  assert.equal(await boundedCache("edit-test", "key", async () => "new", ["changed"]), "new");
  finish("old"); await old;
  assert.equal(await boundedCache("edit-test", "key", async () => "incorrect", ["changed"]), "new");
  await assert.rejects(boundedCache("failure-test", "key", async () => { throw new Error("database unavailable"); }, []));
  assert.equal(await boundedCache("failure-test", "key", async () => "recovered", []), "recovered");
});

test("the least recently used query is evicted at the configured limit", async () => {
  const read = (key, value) => boundedCache("limit-test", key, async () => value, [], 900_000, 2);
  await read("a", 1); await read("b", 2); await read("a", 99); await read("c", 3);
  assert.equal(await read("a", 99), 1);
  assert.equal(await read("b", 22), 22);
});

test("SQL search preserves literal percent, underscore, and backslash", () => {
  assert.equal(plannerSearchPattern("a%_\\b"), "%a\\%\\_\\\\b%");
  assert.equal(plannerSearchPattern("ho"), "%ho%");
});
