import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("the page-owned migrations preserve facts and finish the streamlined model", async () => {
  const migration = await read("supabase/migrations/20260829090000_make_self_host_apps_page_owned.sql");
  const streamlined = await read("supabase/migrations/20260901060529_streamline_self_host_apps_data_model.sql");

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

  for (const table of [
    "github_projects",
    "self_host_app_resource_estimates",
    "self_host_app_install_options",
  ]) {
    assert.match(streamlined, new RegExp(`create table public\\.${table}`));
  }
  assert.match(streamlined, /github_project_id uuid references public\.github_projects/);
  assert.match(streamlined, /technical_fact_status jsonb/);
  assert.match(streamlined, /data_source_urls text\[\]/);
  assert.match(streamlined, /docker_urls text\[\]/);
  assert.match(streamlined, /truenas_scale_urls text\[\]/);
  assert.match(streamlined, /primary key references public\.self_host_apps/);
  assert.match(streamlined, /alter table public\.self_host_app_candidates drop column import_run_id/);
  assert.match(streamlined, /drop table public\.self_host_app_sources/);
  assert.match(streamlined, /drop table public\.self_host_app_field_sources/);
  assert.match(streamlined, /drop table public\.self_host_app_import_runs/);
  assert.match(streamlined, /drop view if exists public\.open_projects/);
});

test("the public directory can filter every source model without assuming GitHub", async () => {
  const page = await read("app/(site)/(directories)/self-host-apps/page.tsx");
  const card = await read("app/(site)/(directories)/self-host-apps/directory-app-card.tsx");
  const drawer = await read("app/(site)/(directories)/self-host-apps/directory-app-browser.tsx");

  assert.match(page, /name="source"/);
  assert.match(page, /Closed source/);
  assert.match(page, /label: "Not verified", value: "unknown"/);
  assert.match(page, /popularity_score/);
  assert.match(page, /“Not published” means the official source/);
  assert.match(card, /sourceModelLabel/);
  assert.match(card, /maintenance_status === "unknown"/);
  assert.doesNotMatch(card, /<FaGithub[^>]*>[\s\S]*formatStars/);
  assert.match(drawer, /formatComposeSupport/);
  assert.match(drawer, /maintenance_status === "unknown"/);
});

test("QA treats missing decision facts and weak resource provenance as visible work", async () => {
  const report = await read("scripts/self-host-apps/qa-report.mjs");
  const gate = await read("scripts/self-host-apps/qa-gate.mjs");

  assert.match(report, /ram_pending/);
  assert.match(report, /ram_not_published/);
  assert.match(report, /storage_pending/);
  assert.match(report, /storage_not_published/);
  assert.match(report, /technical_fact_status/);
  assert.match(report, /factWasChecked/);
  assert.match(report, /researched_null_counts/);
  assert.match(report, /technical_pending_count/);
  assert.match(report, /researchedNullOutcomes/);
  assert.match(report, /ram_estimated/);
  assert.match(report, /storage_estimated/);
  assert.match(report, /technical_fact_status/);
  assert.match(report, /docker_image_not_published/);
  assert.match(report, /pricing_unknown/);
  assert.match(report, /docker_image_missing/);
  assert.match(gate, /official_docker_without_image_or_docs/);
  assert.match(gate, /published_not_self_hostable/);
});

test("storage tiers and drawer facts use reviewed profiles when no exact minimum exists", async () => {
  const card = await read("app/(site)/(directories)/self-host-apps/directory-app-card.tsx");
  const drawer = await read("app/(site)/(directories)/self-host-apps/directory-app-browser.tsx");

  assert.match(card, /app\.storage_profile !== "unknown"/);
  assert.match(drawer, /depends on retained data/);
  assert.match(drawer, /app\.ram_researched \? "not published" : "not checked"/);
  assert.match(drawer, /app\.storage_researched \? "not published" : "not checked"/);
  assert.match(drawer, /app\.docker_image_researched \? "not published" : "not checked"/);
  assert.match(card, /app\.ram_min_mb \?\? app\.ram_recommended_mb \?\? app\.ram_default_limit_mb/);
});

test("resource estimates and install options stay separate from exact facts", async () => {
  const migration = await read("supabase/migrations/20260901060529_streamline_self_host_apps_data_model.sql");
  const apps = await read("lib/apps.ts");
  const card = await read("app/(site)/(directories)/self-host-apps/directory-app-card.tsx");
  const drawer = await read("app/(site)/(directories)/self-host-apps/directory-app-browser.tsx");
  const proposer = await read("scripts/self-host-apps/propose-resource-estimates.mjs");
  const applier = await read("scripts/self-host-apps/apply-resource-estimates.mjs");
  const prodSync = await read("scripts/self-host-apps/sync-prod-to-local.mjs");
  const localSync = await read("scripts/self-host-apps/sync-local-to-prod.mjs");
  const storage = await read("scripts/self-host-apps/lib/streamlined-storage.mjs");

  assert.match(migration, /self_host_app_resource_estimates/);
  assert.match(migration, /self_host_app_install_options/);
  assert.match(migration, /ram_estimate_kind/);
  assert.match(migration, /storage_estimate_kind/);
  assert.match(migration, /truenas_scale/);
  assert.match(migration, /primary key references public\.self_host_apps/);
  assert.match(apps, /install_options/);
  assert.match(apps, /resource_estimates/);
  assert.match(card, /estimated/);
  assert.match(drawer, /installOptions/);
  assert.match(proposer, /mode: "proposal"/);
  assert.match(proposer, /confidence: "low"/);
  assert.match(applier, /apply-reviewed/);
  assert.match(prodSync, /self_host_app_install_options/);
  assert.match(localSync, /replaceResources/);
  assert.match(localSync, /replaceInstalls/);
  assert.match(storage, /installOptionsToRow/);
  assert.match(storage, /resourceEstimatesToRow/);
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
  assert.match(refresh, /technical_fact_status/);
  assert.match(refresh, /catalog_sources/);
  assert.match(migration, /ram_default_limit_mb/);
  assert.match(migration, /persistent_storage/);
});

test("primary-source refresh closes researched gaps without inventing values", async () => {
  const refresh = await read("scripts/self-host-apps/refresh-primary-technical-facts.mjs");

  assert.match(refresh, /technicalStatusFor/);
  assert.match(refresh, /"ram"/);
  assert.match(refresh, /storage:/);
  assert.match(refresh, /database:/);
  assert.match(refresh, /docker:/);
  assert.match(refresh, /compose:/);
  assert.match(refresh, /ramMinMb: null/);
  assert.match(refresh, /--apply-reviewed/);
  assert.match(refresh, /--requirements-file/);
  assert.match(refresh, /--refresh-all/);
  assert.match(refresh, /technicalGapPredicate/);
  assert.match(refresh, /persistentStorage/);
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
  assert.match(refresh, /github_projects/);
  assert.doesNotMatch(refresh, /self_host_app_field_sources/);
});

test("secondary self-host jobs read mutable GitHub facts from the shared project table", async () => {
  const audit = await read("scripts/self-host-apps/audit-data-quality.mjs");
  const enrichment = await read("scripts/self-host-apps/select-enrichment-batch.mjs");
  const exportDataset = await read("scripts/stack127/repos/export-dataset.mjs");

  for (const source of [audit, enrichment, exportDataset]) {
    assert.match(source, /public\.github_projects/);
  }
  assert.match(audit, /github_project\.latest_release/);
  assert.match(enrichment, /coalesce\(project\.stars/);
  assert.match(exportDataset, /coalesce\(github_project\.latest_release/);
});
