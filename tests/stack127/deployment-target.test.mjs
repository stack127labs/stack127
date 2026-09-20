import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  parseEnvText,
  validateDeploymentEnvironment,
  verifyCloudflare,
} from "../../scripts/stack127/deployment/preflight.mjs";

const manifestUrl = new URL("../../scripts/stack127/deployment/targets.json", import.meta.url);

test("the deployment manifest makes OVH the only production target", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));

  assert.equal(manifest.production.id, "stack127-production-ovh");
  assert.equal(manifest.production.provider, "ovh");
  assert.equal(manifest.production.lifecycle, "production");
  assert.equal(manifest.production.dokploy.url, "https://dokploy.stack127.com");
  assert.equal(manifest.production.dokploy.applicationId, "_oKhy4YdVBc513i_qjVHC");
  assert.equal(manifest.production.repository.branch, "main");

  assert.equal(manifest.legacy.id, "stack127-legacy-hostinger");
  assert.equal(manifest.legacy.lifecycle, "removed");
  assert.equal(manifest.legacy.dokploy.url, "https://dokploy.ravitejaknts.com");
});

test("deployment preflight accepts an explicit OVH production environment", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  const environment = parseEnvText(`
STACK127_PRODUCTION_TARGET=stack127-production-ovh
STACK127_PRODUCTION_PROVIDER=ovh
STACK127_PRODUCTION_HOST=54.39.99.47
STACK127_PRODUCTION_IPV6=2607:5300:205:200::6d20
STACK127_PRODUCTION_SSH_USER=ubuntu
STACK127_PRODUCTION_DOKPLOY_URL=https://dokploy.stack127.com
STACK127_PRODUCTION_DOKPLOY_APP_ID=_oKhy4YdVBc513i_qjVHC
STACK127_PRODUCTION_DOKPLOY_APP_NAME=app-navigate-1080p-matrix-3pmfy6
STACK127_PRODUCTION_REPOSITORY=stack127labs/stack127
STACK127_PRODUCTION_BRANCH=main
`);

  assert.deepEqual(validateDeploymentEnvironment(environment, manifest), []);
});

test("deployment preflight rejects ambiguous legacy target keys", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  const environment = {
    STACK127_PRODUCTION_TARGET: "stack127-production-ovh",
    STACK127_PRODUCTION_PROVIDER: "ovh",
    STACK127_PRODUCTION_HOST: "54.39.99.47",
    STACK127_PRODUCTION_IPV6: "2607:5300:205:200::6d20",
    STACK127_PRODUCTION_SSH_USER: "ubuntu",
    STACK127_PRODUCTION_DOKPLOY_URL: "https://dokploy.stack127.com",
    STACK127_PRODUCTION_DOKPLOY_APP_ID: "_oKhy4YdVBc513i_qjVHC",
    STACK127_PRODUCTION_DOKPLOY_APP_NAME: "app-navigate-1080p-matrix-3pmfy6",
    STACK127_PRODUCTION_REPOSITORY: "stack127labs/stack127",
    STACK127_PRODUCTION_BRANCH: "main",
    VPS_HOST: "187.124.68.197",
    DOKPLOY_PUBLIC_URL: "https://dokploy.ravitejaknts.com",
  };

  const errors = validateDeploymentEnvironment(environment, manifest);

  assert.ok(errors.some((error) => error.includes("VPS_HOST")));
  assert.ok(errors.some((error) => error.includes("DOKPLOY_PUBLIC_URL")));
});

test("deployment preflight reports a Cloudflare connection failure cleanly", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  const errors = await verifyCloudflare(
    {
      CLOUDFLARE_API_TOKEN: "token",
      CLOUDFLARE_ZONE_ID: "zone",
    },
    manifest,
    async () => {
      throw new Error("connection timed out");
    },
  );

  assert.deepEqual(errors, ["Cloudflare DNS check failed: connection timed out"]);
});

test("the release workflow runs the small gate, builds once, and verifies the live revision", async () => {
  const workflow = await readFile(".github/workflows/stack127-release-e2e.yml", "utf8");

  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /push:/);
  assert.doesNotMatch(workflow, /workflow_run:/);
  assert.match(workflow, /npm run test:core/);
  assert.doesNotMatch(workflow, /npm run quality/);
  assert.doesNotMatch(workflow, /quality:release|test:seo:registry/);
  assert.doesNotMatch(workflow, /\n\s+npm run build\s*\n/);
  assert.match(workflow, /stack127:deploy:preflight/);
  assert.match(workflow, /docker\/build-push-action@v6/);
  assert.match(workflow, /push: true/);
  assert.doesNotMatch(workflow, /playwright|test:smoke/u);
  assert.match(workflow, /STACK127_BUILD_SHA=/);
  assert.match(workflow, /dokploy-release\.mjs release/);
  assert.doesNotMatch(workflow, /OVH_DOKPLOY_PASSWORD|DOKPLOY_PUBLIC_URL|VPS_HOST/);
});

test("the runtime image and health route expose the immutable build SHA", () => {
  const dockerfile = readFileSync("Dockerfile", "utf8");
  const healthRoute = readFileSync("app/api/health/route.ts", "utf8");

  assert.match(dockerfile, /ARG STACK127_BUILD_SHA=unknown/);
  assert.match(dockerfile, /\/app\/build-sha/);
  assert.match(dockerfile, /\/api\/health/);
  assert.match(healthRoute, /build: \{ sha: readBuildSha\(\) \}/);
});
