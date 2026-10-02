import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "../../helpers/load-typescript.mjs";

function library(rows, fail = false) {
  const calls = [];
  const exports = loadTypeScript(new URL("../../../lib/ad-networks.ts", import.meta.url), {
    "./db": { getPool: () => ({
      query: async (sql, args) => {
        calls.push({ sql, args });
        if (fail) throw new Error("database unavailable");
        assert.match(sql, /r.status = 'confirmed'/);
        return /count\(\*\)/.test(sql) ? { rows: [{ total: String(rows.length) }] }
          : { rows: rows.slice(args[2], args[2] + args[1]) };
      },
    }) },
    "next/cache": { unstable_cache: fn => {
      const cache = new Map();
      return (...args) => {
        const key = JSON.stringify(args);
        if (!cache.has(key)) cache.set(key, fn(...args));
        return cache.get(key);
      };
    } },
    "./cache-tags": { AD_NETWORKS_TAG: "stack127-ad-networks" },
  });
  return { ...exports, calls };
}

test("all verified sites load through one caller request across cached batches, including the last partial batch", async () => {
  const rows = Array.from({ length: 781 }, (_, index) => ({ normalized_domain: `${String(index).padStart(4, "0")}.example.com` }));
  const { listAllVerifiedPublishers, listVerifiedPublishers, calls } = library(rows);
  assert.deepEqual(Array.from(await listAllVerifiedPublishers("network")), rows);
  assert.equal(calls.length, 3);
  assert.deepEqual(calls.map(call => Array.from(call.args)), [["network"], ["network", 750, 0], ["network", 750, 750]]);
  const filtered = await listVerifiedPublishers("network", "007", 99);
  assert.equal(filtered.total, 11);
  assert.equal(filtered.currentPage, 1);
  assert.equal(filtered.rows.length, 11);
  assert.equal(calls.length, 3);
  assert.deepEqual(Array.from(await listAllVerifiedPublishers("network")), rows);
  assert.equal(calls.length, 3);
});

test("empty networks return no sites and database failures propagate", async () => {
  const empty = library([]);
  assert.deepEqual(Array.from(await empty.listAllVerifiedPublishers("empty")), []);
  assert.equal(empty.calls.length, 1);
  const failed = library([], true);
  await assert.rejects(failed.listAllVerifiedPublishers("network"), /database unavailable/);
});
