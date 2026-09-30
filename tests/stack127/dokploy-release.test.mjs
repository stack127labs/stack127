import test from "node:test";
import assert from "node:assert/strict";

import {
  assertLiveSmokeResponse,
  assertUncachedNotFound,
  assertBrowserRevalidation,
  deploymentId,
  deploymentState,
  extractDeploymentRecords,
  isFailureState,
  isSuccessState,
} from "../../scripts/stack127/deployment/dokploy-release.mjs";

test("release checks reject missing pages cached by either cache layer", () => {
  const safe = { status: 404, cacheControl: "private, no-store, max-age=0", edgeCache: "BYPASS", nextCache: null };
  assert.doesNotThrow(() => assertUncachedNotFound(safe));
  for (const change of [{ edgeCache: "HIT" }, { nextCache: "HIT" }, { cacheControl: "public, s-maxage=604800" }, { status: 200 }]) {
    assert.throws(() => assertUncachedNotFound({ ...safe, ...change }), /uncached 404/);
  }
});

test("release checks reject stale browser policies and private edge hits", () => {
  const safe = { status: 200, cacheControl: "max-age=0, must-revalidate, s-maxage=86400", edgeCache: "DYNAMIC", navigationTtl: "30" };
  assert.doesNotThrow(() => assertBrowserRevalidation(safe));
  assert.doesNotThrow(() => assertBrowserRevalidation({ ...safe, status: 304 }));
  for (const change of [{ edgeCache: "HIT" }, { navigationTtl: "300" }, { cacheControl: "max-age=600" }, { status: 500 }]) {
    assert.throws(() => assertBrowserRevalidation({ ...safe, ...change }), /browsers must revalidate/);
  }
});

test("Dokploy deployment responses are normalized across common wrappers", () => {
  const records = extractDeploymentRecords({ data: { deployments: [{ id: "new", status: "running" }] } });
  assert.deepEqual(records, [{ id: "new", status: "running" }]);
  assert.equal(deploymentId(records[0]), "new");
  assert.equal(deploymentState(records[0]), "running");
});

test("Dokploy deployment state helpers fail closed on explicit failures", () => {
  assert.equal(isSuccessState("completed"), true);
  assert.equal(isFailureState("failed"), true);
  assert.equal(isFailureState("running"), false);
});

test("live smoke validation accepts a URL-set sitemap", () => {
  assert.doesNotThrow(() =>
    assertLiveSmokeResponse({
      pathname: "/sitemap.xml",
      status: 200,
      body: '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      requiredAny: ["<urlset", "<sitemapindex"],
    }),
  );
});

test("live smoke validation rejects unrelated XML for the sitemap", () => {
  assert.throws(
    () =>
      assertLiveSmokeResponse({
        pathname: "/sitemap.xml",
        status: 200,
        body: '<?xml version="1.0"?><feed></feed>',
        requiredAny: ["<urlset", "<sitemapindex"],
      }),
    /missing one of the expected markers/u,
  );
});
