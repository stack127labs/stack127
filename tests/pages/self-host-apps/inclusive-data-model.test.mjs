import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("the page-owned migration preserves deployment, resource, popularity, and image facts", async () => {
  const migration = await read("supabase/migrations/20260829090000_make_self_host_apps_page_owned.sql");

  for (const field of [
    "deployment_methods",
    "docker_image",
    "compose_url",
    "ram_min_mb",
    "ram_recommended_mb",
    "storage_min_gb",
    "resource_requirement_kind",
    "pricing_model",
    "popularity_score",
    "popularity_basis",
    "icon_source_url",
    "release_version",
    "release_url",
  ]) {
    assert.match(migration, new RegExp(`\\b${field}\\b`));
  }

  assert.match(migration, /create view public\.open_projects as/);
  assert.match(migration, /source = 'official_documentation'/);
  assert.doesNotMatch(migration, /set storage_profile = 'unknown'/);
  assert.doesNotMatch(migration, /set ram_mb = null/);
});

test("the public directory can filter every source model without assuming GitHub", async () => {
  const page = await read("app/(site)/(catalogs)/self-host-apps/page.tsx");
  const card = await read("app/(site)/(catalogs)/self-host-apps/directory-app-card.tsx");
  const drawer = await read("app/(site)/(catalogs)/self-host-apps/directory-app-browser.tsx");

  assert.match(page, /name="source"/);
  assert.match(page, /Closed source/);
  assert.match(page, /popularity_score/);
  assert.match(card, /sourceModelLabel/);
  assert.doesNotMatch(card, /<FaGithub[^>]*>[\s\S]*formatStars/);
  assert.match(drawer, /formatComposeSupport/);
});

test("QA treats missing decision facts and weak resource provenance as visible work", async () => {
  const report = await read("scripts/self-host-apps/qa-report.mjs");
  const gate = await read("scripts/self-host-apps/qa-gate.mjs");

  assert.match(report, /ram_min_missing/);
  assert.match(report, /storage_unknown/);
  assert.match(report, /pricing_unknown/);
  assert.match(report, /docker_image_missing/);
  assert.match(gate, /official_docker_without_image_or_docs/);
  assert.match(gate, /published_not_self_hostable/);
});

test("the icon cache accepts an official image URL before falling back to a favicon", async () => {
  const icons = await read("scripts/self-host-apps/cache-icons.mjs");

  assert.match(icons, /icon_source_url/);
  assert.match(icons, /sharp/);
  assert.match(icons, /official image/i);
});

test("official appliance catalogs feed candidates without publishing them", async () => {
  const collector = await read("scripts/self-host-apps/discover-app-catalogs.mjs");
  const packageJson = await read("package.json");

  assert.match(collector, /truenas\/apps/);
  assert.match(collector, /getumbrel\/umbrel-apps/);
  assert.match(collector, /storeCandidates/);
  assert.doesNotMatch(collector, /published\s*:\s*true/);
  assert.match(packageJson, /self-host-apps:discover-app-catalogs/);
});

test("the deployment cleanup records official container documentation without broad unpublishing", async () => {
  const cleanup = await read("supabase/migrations/20260829093000_clean_self_host_app_publication.sql");

  assert.doesNotMatch(cleanup, /set published = false/);
  assert.match(cleanup, /help\.form\.io\/deployments\/deployment-guide/);
  assert.match(cleanup, /docs\.taiga\.io\/setup-production\.html/);
});

test("the GitHub refresher can close reviewed source-model gaps from detected licenses", async () => {
  const refresh = await read("scripts/self-host-apps/refresh-github.mjs");

  assert.match(refresh, /args\["source-model"\]/);
  assert.match(refresh, /sourceModelFromSpdx/);
  assert.match(refresh, /source_model = case/);
  assert.match(refresh, /field_name.*source_model/s);
});
