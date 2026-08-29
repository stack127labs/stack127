import assert from "node:assert/strict";
import test from "node:test";
import {
  databaseTypesFromText,
  parseComposeFacts,
  parseTrueNasImage,
  trueNasMemoryLimit,
} from "../../../scripts/self-host-apps/lib/catalog-facts.mjs";
import {
  dockerHubImage,
  likelyAppImage,
  likelyAppImageFromCompose,
  likelyAppImageFromText,
  parsePublishedRequirements,
} from "../../../scripts/self-host-apps/lib/primary-facts.mjs";

test("compose facts keep the app image and detect declared datastores", () => {
  const compose = `
services:
  app:
    image: ghcr.io/example/app:2.4.1
    environment:
      DATABASE_URL: postgres://app:secret@db/app
    volumes:
      - \${APP_DATA_DIR}/data/app:/app/data
  db:
    image: postgres:17
    volumes:
      - \${APP_DATA_DIR}/data/db:/var/lib/postgresql/data
  cache:
    image: redis:7
`;

  assert.deepEqual(parseComposeFacts(compose), {
    databaseTypes: ["postgres", "redis"],
    dockerImage: "ghcr.io/example/app:2.4.1",
    persistentStorage: true,
  });
});

test("database detection normalizes PostgreSQL and avoids substring matches", () => {
  assert.deepEqual(
    databaseTypesFromText("POSTGRES_HOST=db MARIADB_DATABASE=app redis:7"),
    ["postgres", "mariadb", "redis"],
  );
  assert.deepEqual(databaseTypesFromText("A redistributable static binary"), []);
});

test("TrueNAS facts read the main image and package memory limit without calling it a minimum", () => {
  const values = `
images:
  image:
    repository: actualbudget/actual-server
    tag: 26.8.1
  redis_image:
    repository: valkey/valkey
    tag: 9.1.1
`;
  const schema = {
    questions: [{
      variable: "resources",
      schema: {
        attrs: [{
          variable: "limits",
          schema: { attrs: [{ variable: "memory", schema: { default: 4096 } }] },
        }],
      },
    }],
  };

  assert.equal(parseTrueNasImage(values), "actualbudget/actual-server:26.8.1");
  assert.equal(trueNasMemoryLimit(schema), 4096);
});

test("published requirement parsing accepts explicit minima and ignores ordinary numbers", () => {
  const text = `
## Minimum system requirements
- 2 GB RAM
- 10 GB disk space

The web server listens on port 8080.
`;

  assert.deepEqual(parsePublishedRequirements(text), {
    ramMinMb: 2048,
    ramRecommendedMb: null,
    storageMinGb: 10,
  });
  assert.deepEqual(parsePublishedRequirements("Runs on port 4096 and stores user data."), {
    ramMinMb: null,
    ramRecommendedMb: null,
    storageMinGb: null,
  });
});

test("primary-source image selection rejects unrelated helper containers", () => {
  const app = { slug: "abby", name: "Abby", source_code_url: "https://github.com/tryabby/abby" };
  assert.equal(likelyAppImage("mailhog/mailhog", app), null);
  assert.equal(likelyAppImage("ghcr.io/tryabby/abby:latest", app), "ghcr.io/tryabby/abby:latest");
  assert.equal(likelyAppImage("abby-development", app), null);
  assert.equal(likelyAppImage("ghcr.io/tryabby/abby:${TAG:-latest}", app), "ghcr.io/tryabby/abby");
  assert.equal(likelyAppImage("internal/abby:latest", app), null);
  assert.equal(likelyAppImage("ghcr.io/tryabby/abby:canary", app), null);
  assert.equal(likelyAppImage("hyvor/smtp-simulator:latest", {
    slug: "hyvor-relay",
    name: "Hyvor Relay",
    source_code_url: "https://github.com/hyvor/relay",
  }), null);
  assert.equal(likelyAppImageFromCompose(`
services:
  rspamd:
    image: billionmail/rspamd:1.2
  db:
    image: postgres:17
`, { slug: "billion-mail", name: "BillionMail", source_code_url: "https://github.com/Billionmail/BillionMail" }), null);
  assert.equal(likelyAppImageFromCompose(`
services:
  web:
    image: ghcr.io/capsoftware/cap-web:latest
`, { slug: "cap", name: "Cap", source_code_url: "https://github.com/CapSoftware/Cap" }), "ghcr.io/capsoftware/cap-web:latest");
  assert.equal(likelyAppImageFromCompose(`
services:
  app:
    image: registry.example.net/example/product:2
  smtp:
    image: mailhog/mailhog
`, { slug: "product", name: "Product", source_code_url: "https://github.com/example/product" }), "registry.example.net/example/product:2");
  assert.equal(likelyAppImageFromCompose(`
services:
  langfuse-worker:
    image: docker.langfuse.com/langfuse/langfuse-worker:4
  langfuse-web:
    image: docker.langfuse.com/langfuse/langfuse:4
`, { slug: "langfuse", name: "Langfuse", source_code_url: "https://github.com/langfuse/langfuse" }), "docker.langfuse.com/langfuse/langfuse:4");
  assert.equal(likelyAppImageFromCompose(`
services:
  datalens-ui:
    image: ghcr.io/datalens-tech/datalens-ui:1
  datalens-control-api:
    image: ghcr.io/datalens-tech/datalens-control-api:1
`, { slug: "datalens", name: "DataLens", source_code_url: "https://github.com/datalens-tech/datalens" }), null);
  assert.equal(likelyAppImageFromText("docker pull ghcr.io/example/product:2", {
    slug: "product",
    name: "Product",
    source_code_url: "https://github.com/example/product",
  }), "ghcr.io/example/product:2");
  assert.equal(dockerHubImage("https://hub.docker.com/r/resilio/sync/tags"), "resilio/sync");
});
