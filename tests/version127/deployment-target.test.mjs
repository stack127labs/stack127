import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  parseEnvText,
  validateDeploymentEnvironment,
  verifyCloudflare,
} from "../../scripts/version127/deployment/preflight.mjs";

const manifestUrl = new URL("../../scripts/version127/deployment/targets.json", import.meta.url);

test("the deployment manifest makes OVH the only production target", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));

  assert.equal(manifest.production.id, "version127-production-ovh");
  assert.equal(manifest.production.provider, "ovh");
  assert.equal(manifest.production.lifecycle, "production");
  assert.equal(manifest.production.dokploy.url, "https://dokploy.version127.com");
  assert.equal(manifest.production.dokploy.applicationId, "_oKhy4YdVBc513i_qjVHC");
  assert.equal(manifest.production.repository.branch, "main");

  assert.equal(manifest.legacy.id, "version127-legacy-hostinger");
  assert.equal(manifest.legacy.lifecycle, "removed");
  assert.equal(manifest.legacy.dokploy.url, "https://dokploy.ravitejaknts.com");
});

test("deployment preflight accepts an explicit OVH production environment", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  const environment = parseEnvText(`
VERSION127_PRODUCTION_TARGET=version127-production-ovh
VERSION127_PRODUCTION_PROVIDER=ovh
VERSION127_PRODUCTION_HOST=54.39.99.47
VERSION127_PRODUCTION_IPV6=2607:5300:205:200::6d20
VERSION127_PRODUCTION_SSH_USER=ubuntu
VERSION127_PRODUCTION_DOKPLOY_URL=https://dokploy.version127.com
VERSION127_PRODUCTION_DOKPLOY_APP_ID=_oKhy4YdVBc513i_qjVHC
VERSION127_PRODUCTION_DOKPLOY_APP_NAME=app-navigate-1080p-matrix-3pmfy6
VERSION127_PRODUCTION_REPOSITORY=RaviTejaKNTS/version127
VERSION127_PRODUCTION_BRANCH=main
`);

  assert.deepEqual(validateDeploymentEnvironment(environment, manifest), []);
});

test("deployment preflight rejects ambiguous legacy target keys", async () => {
  const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
  const environment = {
    VERSION127_PRODUCTION_TARGET: "version127-production-ovh",
    VERSION127_PRODUCTION_PROVIDER: "ovh",
    VERSION127_PRODUCTION_HOST: "54.39.99.47",
    VERSION127_PRODUCTION_IPV6: "2607:5300:205:200::6d20",
    VERSION127_PRODUCTION_SSH_USER: "ubuntu",
    VERSION127_PRODUCTION_DOKPLOY_URL: "https://dokploy.version127.com",
    VERSION127_PRODUCTION_DOKPLOY_APP_ID: "_oKhy4YdVBc513i_qjVHC",
    VERSION127_PRODUCTION_DOKPLOY_APP_NAME: "app-navigate-1080p-matrix-3pmfy6",
    VERSION127_PRODUCTION_REPOSITORY: "RaviTejaKNTS/version127",
    VERSION127_PRODUCTION_BRANCH: "main",
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

test("the release workflow keeps quality, immutable images, and live SHA checks in one path", async () => {
  const workflow = await readFile(".github/workflows/version127-release-e2e.yml", "utf8");

  assert.match(workflow, /npm run quality/);
  assert.match(workflow, /version127:deploy:preflight/);
  assert.match(workflow, /docker\/build-push-action@v6/);
  assert.match(workflow, /VERSION127_BUILD_SHA=/);
  assert.match(workflow, /dokploy-release\.mjs release/);
  assert.doesNotMatch(workflow, /OVH_DOKPLOY_PASSWORD|DOKPLOY_PUBLIC_URL|VPS_HOST/);
});

test("the runtime image and health route expose the immutable build SHA", () => {
  const dockerfile = readFileSync("Dockerfile", "utf8");
  const healthRoute = readFileSync("app/api/health/route.ts", "utf8");

  assert.match(dockerfile, /ARG VERSION127_BUILD_SHA=unknown/);
  assert.match(dockerfile, /\/app\/build-sha/);
  assert.match(dockerfile, /\/api\/health/);
  assert.match(healthRoute, /build: \{ sha: readBuildSha\(\) \}/);
});
