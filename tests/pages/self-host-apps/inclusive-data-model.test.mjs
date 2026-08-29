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

  assert.match(report, /ram_pending/);
  assert.match(report, /ram_not_published/);
  assert.match(report, /storage_pending/);
  assert.match(report, /storage_not_published/);
  assert.match(report, /ram_researched/);
  assert.match(report, /storage_researched/);
  assert.match(report, /researched_null_counts/);
  assert.match(report, /technical_pending_count/);
  assert.match(report, /researchedNullOutcomes/);
  assert.match(report, /docker_image_not_published/);
  assert.match(report, /pricing_unknown/);
  assert.match(report, /docker_image_missing/);
  assert.match(gate, /official_docker_without_image_or_docs/);
  assert.match(gate, /published_not_self_hostable/);
});

test("storage tiers and drawer facts use reviewed profiles when no exact minimum exists", async () => {
  const card = await read("app/(site)/(catalogs)/self-host-apps/directory-app-card.tsx");
  const drawer = await read("app/(site)/(catalogs)/self-host-apps/directory-app-browser.tsx");

  assert.match(card, /app\.storage_profile !== "unknown"/);
  assert.match(drawer, /depends on retained data/);
  assert.match(drawer, /app\.ram_researched \? "not published" : "not checked"/);
  assert.match(drawer, /app\.storage_researched \? "not published" : "not checked"/);
  assert.match(drawer, /app\.docker_image_researched \? "not published" : "not checked"/);
});

test("official appliance catalog refresh extracts direct deployment facts", async () => {
  const parser = await read("scripts/self-host-apps/lib/catalog-facts.mjs");
  const refresh = await read("scripts/self-host-apps/refresh-app-catalog-facts.mjs");
  const migration = await read("supabase/migrations/20260829151412_enrich_self_host_app_technical_facts.sql");

  assert.match(parser, /parseComposeFacts/);
  assert.match(parser, /databaseTypes/);
  assert.match(parser, /persistentStorage/);
  assert.match(refresh, /truenas_apps/);
  assert.match(refresh, /umbrel_apps/);
  assert.match(refresh, /--apply-reviewed/);
  assert.match(refresh, /self_host_app_field_sources/);
  assert.match(migration, /ram_default_limit_mb/);
  assert.match(migration, /persistent_storage/);
});

test("primary-source refresh closes researched gaps without inventing values", async () => {
  const refresh = await read("scripts/self-host-apps/refresh-primary-technical-facts.mjs");

  assert.match(refresh, /ram_researched/);
  assert.match(refresh, /storage_researched/);
  assert.match(refresh, /database_researched/);
  assert.match(refresh, /docker_researched/);
  assert.match(refresh, /compose_researched/);
  assert.match(refresh, /value remains null/);
  assert.match(refresh, /--apply-reviewed/);
  assert.match(refresh, /--requirements-file/);
  assert.match(refresh, /parsed numeric requirements are never published without editorial review/);
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
