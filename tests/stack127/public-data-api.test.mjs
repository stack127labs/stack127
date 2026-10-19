import test from "node:test";
import assert from "node:assert/strict";
import { readPublicData } from "../../lib/public-data-api.ts";

const apiEnvironment = {
  SUPABASE_URL: "https://retained-project.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "test-only",
};

test("production returns SQL data without reading the retained Supabase project", async () => {
  const rows = [{ slug: "current-production-page" }];
  assert.equal(await readPublicData({
    environment: { ...apiEnvironment, NODE_ENV: "production" },
    postgresRead: async () => rows,
    dataApiRead: async () => assert.fail("Production must not read Supabase REST"),
  }), rows);
});

test("production preserves SQL failures without falling back to stale Supabase data", async () => {
  const failure = new Error("OVH unavailable");
  let restReads = 0;
  await assert.rejects(readPublicData({
    environment: { ...apiEnvironment, NODE_ENV: "production" },
    postgresRead: async () => { throw failure; },
    dataApiRead: async () => { restReads += 1; return [{ slug: "stale-page" }]; },
  }), error => error === failure);
  assert.equal(restReads, 0);
});

test("development still prefers the public Data API", async () => {
  const rows = [{ slug: "development-page" }];
  assert.equal(await readPublicData({
    environment: { ...apiEnvironment, NODE_ENV: "development" },
    postgresRead: async () => assert.fail("Development prefers REST"),
    dataApiRead: async () => rows,
  }), rows);
});

test("development still falls back to SQL after a Data API failure", async () => {
  const rows = [{ slug: "development-sql-page" }];
  assert.equal(await readPublicData({
    environment: { ...apiEnvironment, NODE_ENV: "development" },
    postgresRead: async () => rows,
    dataApiRead: async () => { throw new Error("REST unavailable"); },
  }), rows);
});

test("development preserves the Data API error when both reads fail", async () => {
  const failure = new Error("REST unavailable");
  await assert.rejects(readPublicData({
    environment: { ...apiEnvironment, NODE_ENV: "development" },
    postgresRead: async () => { throw new Error("SQL unavailable"); },
    dataApiRead: async () => { throw failure; },
  }), error => error === failure);
});
