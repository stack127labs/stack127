import assert from "node:assert/strict";
import test from "node:test";
import {
  buildInstallOptions,
  registryUrlForImage,
} from "../../../scripts/self-host-apps/lib/install-options.mjs";
import {
  installOptionsToRow,
  rowToInstallOptions,
  resourceEstimatesToRow,
  rowToResourceEstimates,
} from "../../../scripts/self-host-apps/lib/streamlined-storage.mjs";

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

test("new appliance catalogs and their compose files become install options", () => {
  const options = buildInstallOptions(
    { docker_support: "community", docker_image: null, docker_url: null, compose_url: null, deployment_methods: [] },
    [
      {
        source: "unraid_apps",
        source_url: "https://raw.githubusercontent.com/example/unraid/main/app.xml",
        payload: { registry_url: "https://hub.docker.com/r/example/app" },
      },
      {
        source: "casaos_apps",
        source_url: "https://github.com/IceWhaleTech/CasaOS-AppStore/tree/main/Apps/Example",
        payload: {
          compose_url: "https://raw.githubusercontent.com/IceWhaleTech/CasaOS-AppStore/main/Apps/Example/docker-compose.yml",
          image: "example/app:latest",
        },
      },
      {
        source: "yunohost_apps",
        source_url: "https://apps.yunohost.org/app/example",
        payload: {},
      },
    ],
  );

  assert.deepEqual(options.map((option) => option.method), ["docker", "compose", "unraid", "casaos", "yunohost"]);
  assert.equal(options.find((option) => option.method === "unraid")?.support_level, "community");
  assert.equal(options.find((option) => option.method === "casaos")?.support_level, "official");
  assert.equal(options.find((option) => option.method === "compose")?.url, "https://raw.githubusercontent.com/IceWhaleTech/CasaOS-AppStore/main/Apps/Example/docker-compose.yml");
});

test("streamlined install storage keeps one row with multiple destination links", () => {
  const options = [
    { method: "docker", label: "Docker Hub", url: "https://hub.docker.com/r/example/app", image: "example/app:latest", support_level: "official", source_url: "https://example.org/install", sort_order: 0 },
    { method: "docker", label: "GHCR", url: "https://ghcr.io/example/app", image: "ghcr.io/example/app:latest", support_level: "official", source_url: "https://example.org/install", sort_order: 1 },
    { method: "compose", label: "Compose", url: "https://example.org/compose.yml", image: null, support_level: "community", source_url: "https://example.org/compose.yml", sort_order: 0 },
  ];

  const row = installOptionsToRow(options, { checkedAt: "2026-09-01T00:00:00.000Z" });
  assert.deepEqual(row.docker_urls, ["https://hub.docker.com/r/example/app", "https://ghcr.io/example/app"]);
  assert.deepEqual(row.docker_images, ["example/app:latest", "ghcr.io/example/app:latest"]);
  assert.deepEqual(row.compose_urls, ["https://example.org/compose.yml"]);
  assert.equal(row.checked_at, "2026-09-01T00:00:00.000Z");
  assert.deepEqual(rowToInstallOptions(row), row.options);
});

test("streamlined resource storage keeps RAM and storage in one app row", () => {
  const records = [
    { resource_kind: "ram", estimate_min: 512, estimate_max: 2048, estimate_kind: "estimated", confidence: "low", basis: "single-container baseline", source_urls: ["https://example.org/docs"], note: "Plan for the app and its worker." },
    { resource_kind: "storage", estimate_min: 5, estimate_max: 50, estimate_kind: "derived", confidence: "medium", basis: "persistent media volume", source_urls: ["https://example.org/storage"], note: null },
  ];
  const row = resourceEstimatesToRow(records, { checkedAt: "2026-09-01T00:00:00.000Z" });
  assert.equal(row.ram_estimate_min_mb, 512);
  assert.equal(row.storage_estimate_max_gb, 50);
  assert.deepEqual(rowToResourceEstimates(row), {
    ram: { estimate_min: 512, estimate_max: 2048, unit: "mb", estimate_kind: "estimated", confidence: "low", basis: "single-container baseline", source_urls: ["https://example.org/docs"], note: "Plan for the app and its worker.", checked_at: "2026-09-01T00:00:00.000Z" },
    storage: { estimate_min: 5, estimate_max: 50, unit: "gb", estimate_kind: "derived", confidence: "medium", basis: "persistent media volume", source_urls: ["https://example.org/storage"], note: null, checked_at: "2026-09-01T00:00:00.000Z" },
  });
});
