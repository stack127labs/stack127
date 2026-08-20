import test from "node:test";
import assert from "node:assert/strict";

import {
  assertLiveSmokeResponse,
  deploymentId,
  deploymentState,
  extractDeploymentRecords,
  isFailureState,
  isSuccessState,
} from "../../scripts/stack127/deployment/dokploy-release.mjs";

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
