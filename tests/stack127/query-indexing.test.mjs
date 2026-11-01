import test from "node:test";
import assert from "node:assert/strict";
import { queryNeedsNoindex, trackingQueryNames, queryNoindexExpression } from "../../lib/seo/query-indexing.mjs";
import { activateFrontend, deactivateFrontend } from "../../scripts/stack127/frontend/cloudflare.mjs";

test("clean URLs and tracking-only combinations rely on the clean canonical", () => {
  for (const search of ["", "?", "?utm_source=x", "?utm_custom=x&utm_medium=email", "?utm_source=x&gclid=123&ref=newsletter", "?utm_source=x&utm_source=y", "?utm_source=", "?ref", ...trackingQueryNames.map(name => `?${name}=123`)]) {
    assert.equal(queryNeedsNoindex(search), false, search);
  }
});

test("tool state, search, filters, pagination and unknown names remain noindex, including tracking mixes", () => {
  for (const name of ["state", "name", "type", "site", "query", "niche", "pv", "apps", "d", "q", "category", "sort", "page", "pageSize", "unknown", "_rsc", "UTM_SOURCE", "%75tm_source", "gcl%69d", "", "utm"]) {
    for (const search of [`?${name}=x`, `?utm_source=email&${name}=x`, `?${name}=x&gclid=123`]) {
      assert.equal(queryNeedsNoindex(search), true, search);
    }
  }
  assert.equal(queryNeedsNoindex("?utm_source=x&q="), true);
  assert.equal(queryNeedsNoindex("?utm_source=x%26q%3Dy"), false);
  assert.equal(queryNeedsNoindex("?&&"), true);
});

test("activation patches the existing query rule on every run without replacing unrelated rules or routes", async () => {
  const writes = [];
  const rules = [{ id: "other", description: "Unrelated" }, { id: "query", description: "Stack127 query pages: noindex", enabled: false }];
  const routes = [
    { id: "api", pattern: "stack127.com/api/*", script: null },
    { id: "vitals", pattern: "stack127.com/vitals/*", script: null },
    { id: "frontend", pattern: "stack127.com/*", script: "stack127-frontend" },
  ];
  const api = async (url, options = {}) => {
    if (options.method) { writes.push({ url, ...options }); return {}; }
    if (url.endsWith("/workers/routes")) return routes;
    if (url.endsWith("/rulesets")) return [{ id: "headers", phase: "http_response_headers_transform", kind: "zone" }];
    if (url.endsWith("/rulesets/headers")) return { rules };
    throw new Error(`Unexpected API call: ${url}`);
  };
  const settings = { environment: { CLOUDFLARE_ZONE_ID: "zone" }, api };
  await activateFrontend(settings);
  await activateFrontend(settings);
  assert.equal(writes.length, 2);
  for (const write of writes) {
    assert.equal(write.method, "PATCH");
    assert.equal(write.url, "/zones/zone/rulesets/headers/rules/query");
    assert.equal(write.body.expression, queryNoindexExpression());
    assert.equal(write.body.enabled, true);
    assert.equal(write.body.action_parameters.headers["X-Robots-Tag"].value, "noindex, follow");
  }
  writes.length = 0;
  await deactivateFrontend(settings);
  assert.deepEqual(writes.map(({ url, method }) => ({ url, method })), [{ url: "/zones/zone/workers/routes/frontend", method: "DELETE" }]);
});

test("activation adds a missing query rule to an existing header ruleset", async () => {
  let installed;
  await activateFrontend({ environment: { CLOUDFLARE_ZONE_ID: "zone" }, api: async (url, options = {}) => {
    if (options.method) { if (url.endsWith("/rules")) installed = { url, ...options }; return {}; }
    if (url.endsWith("/workers/routes")) return [];
    if (url.endsWith("/rulesets")) return [{ id: "headers", phase: "http_response_headers_transform", kind: "zone" }];
    return { rules: [{ id: "other", description: "Unrelated" }] };
  } });
  assert.equal(installed.method, "POST");
  assert.equal(installed.body.expression, queryNoindexExpression());
});
