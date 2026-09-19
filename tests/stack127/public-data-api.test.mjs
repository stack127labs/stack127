import assert from "node:assert/strict";
import test from "node:test";
import {
  canReadPublicDataApi,
  preferPublicDataApi,
  readPublicData,
  selectPublicRows,
} from "../../lib/public-data-api.ts";

const configured = {
  NODE_ENV: "development",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "publishable-test-key",
};

test("local public reads prefer the Data API when its public credentials exist", () => {
  assert.equal(canReadPublicDataApi(configured), true);
  assert.equal(preferPublicDataApi(configured), true);
  assert.equal(preferPublicDataApi({ ...configured, NODE_ENV: "production" }), false);
  assert.equal(canReadPublicDataApi({ NODE_ENV: "development" }), false);
});

test("a local public read does not wait for Postgres when the Data API succeeds", async () => {
  const calls = [];
  const value = await readPublicData({
    dataApiRead: async () => { calls.push("api"); return "api-value"; },
    environment: configured,
    postgresRead: async () => { calls.push("postgres"); return "postgres-value"; },
  });

  assert.equal(value, "api-value");
  assert.deepEqual(calls, ["api"]);
});

test("public reads fall back in both directions without hiding the primary error", async () => {
  const localCalls = [];
  const localValue = await readPublicData({
    dataApiRead: async () => { localCalls.push("api"); throw new Error("api down"); },
    environment: configured,
    postgresRead: async () => { localCalls.push("postgres"); return "postgres-value"; },
  });
  assert.equal(localValue, "postgres-value");
  assert.deepEqual(localCalls, ["api", "postgres"]);

  const productionCalls = [];
  const productionValue = await readPublicData({
    dataApiRead: async () => { productionCalls.push("api"); return "api-value"; },
    environment: { ...configured, NODE_ENV: "production" },
    postgresRead: async () => { productionCalls.push("postgres"); throw new Error("database down"); },
  });
  assert.equal(productionValue, "api-value");
  assert.deepEqual(productionCalls, ["postgres", "api"]);
});

test("the Data API reader uses the publishable key and disables fetch caching", async () => {
  let request;
  const rows = await selectPublicRows(
    "stack127_pages",
    { is_published: "eq.true", limit: "1", select: "id,slug", slug: "eq.demo" },
    {
      environment: configured,
      fetchImplementation: async (input, init) => {
        request = { input: String(input), init };
        return new Response(JSON.stringify([{ id: 1, slug: "demo" }]), {
          headers: { "content-type": "application/json" },
          status: 200,
        });
      },
    },
  );

  assert.deepEqual(rows, [{ id: 1, slug: "demo" }]);
  const url = new URL(request.input);
  assert.equal(url.pathname, "/rest/v1/stack127_pages");
  assert.equal(url.searchParams.get("slug"), "eq.demo");
  assert.equal(request.init.cache, "no-store");
  assert.equal(request.init.headers.apikey, configured.SUPABASE_PUBLISHABLE_KEY);
  assert.equal(request.init.headers.Authorization, `Bearer ${configured.SUPABASE_PUBLISHABLE_KEY}`);
});

test("the Data API reader retries transient connection failures", async () => {
  let calls = 0;
  const rows = await selectPublicRows(
    "stack127_pages",
    { select: "id" },
    {
      environment: configured,
      fetchImplementation: async () => {
        calls += 1;
        if (calls === 1) throw new TypeError("connection timed out");
        return Response.json([{ id: 1 }]);
      },
    },
  );

  assert.deepEqual(rows, [{ id: 1 }]);
  assert.equal(calls, 2);
});

test("the Data API reader does not retry request errors", async () => {
  let calls = 0;

  await assert.rejects(
    selectPublicRows(
      "stack127_tool_pages",
      { select: "missing_column" },
      {
        environment: configured,
        fetchImplementation: async () => {
          calls += 1;
          return new Response("bad request", { status: 400 });
        },
      },
    ),
    /status 400/,
  );

  assert.equal(calls, 1);
});
