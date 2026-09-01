import assert from "node:assert/strict";
import test from "node:test";
import {
  dockerImageUrl,
  parseCasaOSCompose,
  parseDockerHubSearch,
  parseUnraidFeed,
  parseYunoHostAppsToml,
} from "../../scripts/self-host-apps/lib/catalog-adapters.mjs";

test("Docker Hub search results become bounded image candidates", () => {
  const [candidate] = parseDockerHubSearch({
    results: [{
      repo_name: "acme/ledger",
      short_description: "A private ledger server.",
      star_count: 12,
      is_official: false,
    }],
  }, { query: "self-hosted" });

  assert.equal(candidate.source_key, "repository:acme/ledger");
  assert.equal(candidate.name, "Ledger");
  assert.equal(candidate.docker_url, "https://hub.docker.com/r/acme/ledger");
  assert.deepEqual(candidate.surfaces, ["docker"]);
  assert.equal(candidate.self_hosting_status, "unknown");
  assert.equal(dockerImageUrl("nginx:latest"), "https://hub.docker.com/_/nginx");
});

test("Unraid feed parsing keeps install evidence and removes deprecated entries", () => {
  const candidates = parseUnraidFeed({
    applist: [
      {
        Name: "Example",
        Repository: "ghcr.io/acme/example:latest",
        Registry: "https://ghcr.io/acme/example",
        Project: "https://github.com/acme/example",
        TemplateURL: "https://raw.githubusercontent.com/acme/example/main/example.xml",
        CategoryList: ["Tools"],
        Overview: "Run Example on Unraid.",
      },
      {
        Name: "Old",
        Repository: "acme/old",
        TemplateURL: "https://example.test/old.xml",
      },
    ],
    deprecated: { "acme/old": true },
  });

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].name, "Example");
  assert.equal(candidates[0].source_code_url, "https://github.com/acme/example");
  assert.equal(candidates[0].docker_url, "https://ghcr.io/acme/example");
  assert.deepEqual(candidates[0].categories, ["Tools"]);
  assert.equal(candidates[0].payload.template_url, "https://raw.githubusercontent.com/acme/example/main/example.xml");
});

test("CasaOS Compose parsing extracts x-casaos metadata and the image", () => {
  const candidate = parseCasaOSCompose(`
services:
  app:
    image: acme/example:1.2.3
    ports:
      - 8080:8080
x-casaos:
  id: com.acme.example
  main: app
  title:
    en_US: Example
  tagline:
    en_US: A private example service
  category: Utilities
  website: https://example.test
  repo: https://github.com/acme/example
  docs: https://example.test/docs
  description:
    en_US: |
      Run Example on your own server.
      Keep control of your data.
`, {
    appId: "Example",
    composeUrl: "https://raw.example.test/example/docker-compose.yml",
  });

  assert.equal(candidate.source_key, "app:com.acme.example");
  assert.equal(candidate.name, "Example");
  assert.equal(candidate.summary, "A private example service");
  assert.equal(candidate.source_code_url, "https://github.com/acme/example");
  assert.equal(candidate.docker_url, "https://hub.docker.com/r/acme/example");
  assert.deepEqual(candidate.categories, ["Utilities"]);
  assert.equal(candidate.payload.image, "acme/example:1.2.3");
});

test("YunoHost apps.toml parsing keeps package state and repository evidence", () => {
  const candidates = parseYunoHostAppsToml(`
[actual]
category = "productivity_and_management"
state = "working"
subtags = ["accounting", "budget"]
url = "https://github.com/YunoHost-Apps/actual_ynh"

[oldapp]
category = "system_tools"
state = "notworking"
url = "https://github.com/YunoHost-Apps/oldapp_ynh"
`, { limit: 10 });

  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].name, "Actual");
  assert.equal(candidates[0].source_code_url, "https://github.com/yunohost-apps/actual_ynh");
  assert.equal(candidates[0].payload.app.state, "working");
  assert.deepEqual(candidates[0].categories, ["productivity_and_management"]);
  assert.equal(candidates[1].payload.app.state, "notworking");
});
