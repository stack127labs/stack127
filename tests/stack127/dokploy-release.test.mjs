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
  verifyBackendHealth,
  verifyLiveSite,
} from "../../scripts/stack127/deployment/dokploy-release.mjs";

const sha = "a".repeat(40);
const siteConfig = { siteUrl: "https://stack127.com", releaseSha: sha, deployTimeoutSeconds: 0, deployPollSeconds: 0 };

function liveResponse(url, { frontendSha = sha, legacy = false } = {}) {
  const path = new URL(url).pathname;
  if (path === "/api/health") return new Response(JSON.stringify({ ok: true, build: { sha } }));
  if (path.includes("-missing-")) return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  const body = path === "/frontend-release.json" ? JSON.stringify({ sha: frontendSha })
    : path === "/sitemap.xml" ? "<urlset></urlset>" : path === "/robots.txt" ? "Sitemap: https://stack127.com/sitemap.xml" : "<title>stack127</title><main>Pages</main>";
  return new Response(body, { headers: legacy
    ? { "cache-control": "max-age=0, must-revalidate", "cf-cache-status": "DYNAMIC", etag: '"page"' }
    : { "x-stack127-frontend-sha": frontendSha, "cf-cache-status": "HIT", "cache-control": "public, max-age=3600" } });
}

test("a Cloudflare backend release checks only health while old assets remain live", async () => {
  const requests = [];
  await verifyLiveSite({ ...siteConfig, frontendHosting: "cloudflare" }, { backendOnly: true, fetchImplementation: async url => {
    requests.push(url);
    return liveResponse(url, { frontendSha: "b".repeat(40) });
  } });
  assert.deepEqual(requests.map(url => new URL(url).pathname), ["/api/health"]);
});

test("the final Cloudflare release checks frontend SHA without the OVH document cache policy", async () => {
  const requests = [];
  await verifyLiveSite({ ...siteConfig, frontendHosting: "cloudflare" }, { fetchImplementation: async url => {
    requests.push(url);
    return liveResponse(url);
  } });
  assert(requests.some(url => new URL(url).pathname === "/frontend-release.json"));
  assert(requests.some(url => url.includes("-missing-")));
});

test("matching backend health cannot hide an older static frontend", async () => {
  await assert.rejects(verifyLiveSite({ ...siteConfig, frontendHosting: "cloudflare" }, {
    fetchImplementation: async url => liveResponse(url, { frontendSha: "b".repeat(40) }),
  }), /frontend|SHA|commit/i);
});

test("backend health rejects a stale SHA even before frontend deployment", async () => {
  await assert.rejects(verifyBackendHealth(siteConfig, {
    fetchImplementation: async () => new Response(JSON.stringify({ ok: true, build: { sha: "b".repeat(40) } })),
  }), /did not reach/);
});

test("legacy release smoke still checks missing pages and conditional cookie requests", async () => {
  const requests = [];
  await verifyLiveSite(siteConfig, { fetchImplementation: async (url, options) => {
    requests.push({ path: new URL(url).pathname, headers: options.headers });
    return liveResponse(url, { legacy: true });
  } });
  assert.equal(requests.filter(request => request.path.includes("-missing-")).length, 2);
  assert.equal(requests.filter(request => request.path === "/about" && request.headers.cookie).length, 2);
  assert(requests.some(request => request.headers["if-none-match"]));
});

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
