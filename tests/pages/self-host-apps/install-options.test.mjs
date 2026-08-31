import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInstallOptions,
  registryUrlForImage,
} from "../../../scripts/self-host-apps/lib/install-options.mjs";

test("registry URLs point to browsable image pages", () => {
  assert.equal(registryUrlForImage("nginx:latest"), "https://hub.docker.com/_/nginx");
  assert.equal(
    registryUrlForImage("ghcr.io/owner/app:1.2.3", { githubOwner: "owner", githubRepo: "app" }),
    "https://github.com/owner/app/pkgs/container/app",
  );
  assert.equal(
    registryUrlForImage("quay.io/keycloak/keycloak:latest"),
    "https://quay.io/repository/keycloak/keycloak",
  );
  assert.equal(
    registryUrlForImage("ghcr.io/getumbrel/app:latest", { githubOwner: "publisher", githubRepo: "app" }),
    "https://ghcr.io/getumbrel/app",
  );
  assert.equal(registryUrlForImage("not an image"), null);
});

test("Dockerfile links become source evidence, never Docker install links", () => {
  const options = buildInstallOptions({
    docker_support: "official",
    docker_image: "ghcr.io/owner/app:1.2.3",
    docker_url: "https://github.com/owner/app/blob/HEAD/Dockerfile",
    compose_url: "https://github.com/owner/app/blob/HEAD/compose.yml",
    github_owner: "owner",
    github_repo: "app",
    deployment_methods: ["docker", "compose"],
  });

  assert.equal(options.find((option) => option.method === "docker")?.url, "https://github.com/owner/app/pkgs/container/app");
  assert.equal(options.find((option) => option.method === "compose")?.url, "https://github.com/owner/app/blob/HEAD/compose.yml");
  assert.equal(options.some((option) => option.url.includes("Dockerfile")), false);
});

test("a registry URL for a different image host is replaced by the image registry", () => {
  const options = buildInstallOptions({
    docker_support: "official",
    docker_image: "ghcr.io/publisher/app:1.2.3",
    docker_url: "https://hub.docker.com/r/another/app",
    compose_url: null,
    github_owner: "publisher",
    github_repo: "app",
    deployment_methods: ["docker"],
  });

  assert.equal(options.find((option) => option.method === "docker")?.url, "https://github.com/publisher/app/pkgs/container/app");
});

test("official appliance catalogs become install options", () => {
  const options = buildInstallOptions(
    { docker_support: "official", docker_image: null, docker_url: null, compose_url: null, deployment_methods: [] },
    [
      { source: "truenas_apps", source_url: "https://apps.truenas.com/catalog/app_community/", payload: {} },
      { source: "umbrel_apps", source_url: "https://github.com/getumbrel/umbrel-apps/tree/master/app", payload: {} },
    ],
  );

  assert.deepEqual(
    options.filter((option) => option.method.endsWith("_scale") || option.method === "umbrel").map((option) => option.method),
    ["truenas_scale", "umbrel"],
  );
});
