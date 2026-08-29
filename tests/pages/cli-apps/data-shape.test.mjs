import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("terminal apps schema supports every source and pricing model", async () => {
  const migration = await read("supabase/migrations/20260821120000_create_terminal_apps.sql");

  assert.match(migration, /create type public\.terminal_app_source_model as enum/);
  for (const model of ["open_source", "source_available", "closed_source", "freeware", "unknown"]) {
    assert.match(migration, new RegExp(model));
  }

  assert.match(migration, /create type public\.terminal_app_pricing_model as enum/);
  for (const pricing of ["free", "freemium", "paid", "subscription", "usage_based", "unknown"]) {
    assert.match(migration, new RegExp(pricing));
  }
});

test("terminal apps remain separate while their optional catalog link follows the table rename", async () => {
  const original = await read("supabase/migrations/20260821120000_create_terminal_apps.sql");
  const rename = await read("supabase/migrations/20260829090000_make_self_host_apps_page_owned.sql");

  assert.match(original, /create table if not exists public\.terminal_apps/);
  assert.match(original, /create table if not exists public\.terminal_app_candidates/);
  assert.match(rename, /alter table public\.terminal_apps rename column open_project_id to self_host_app_id/);
});

test("candidate queue preserves duplicates, exclusions, and failures", async () => {
  const migration = await read("supabase/migrations/20260821120000_create_terminal_apps.sql");
  const statusBlock = migration.match(
    /create type public\.terminal_app_candidate_status as enum \(([\s\S]*?)\);/,
  );

  assert.ok(statusBlock, "candidate status enum exists");
  for (const status of [
    "'discovered'",
    "'duplicate'",
    "'needs_review'",
    "'enriched'",
    "'published'",
    "'excluded'",
    "'failed'",
  ]) {
    assert.ok(statusBlock[1].includes(status), `status ${status} exists`);
  }

  assert.match(migration, /duplicate_of_id uuid references public\.terminal_app_candidates/);
  assert.match(migration, /exclusion_reason text/);
  assert.match(migration, /payload jsonb not null default '\{\}'::jsonb/);
});

test("published records carry verification dates and provenance", async () => {
  const migration = await read("supabase/migrations/20260821120000_create_terminal_apps.sql");

  assert.match(migration, /last_verified_at date/);
  assert.match(migration, /create table if not exists public\.terminal_app_field_sources/);
  assert.match(migration, /confidence text not null default 'unknown'/);
});

test("the data layer exposes the fields the directory renders", async () => {
  const dataLayer = await read("lib/terminal-apps.ts");

  for (const field of [
    "slug",
    "aliases",
    "primary_type",
    "categories",
    "platforms",
    "install_methods",
    "website_url",
    "repository_url",
    "source_model",
    "pricing_model",
    "maintenance_status",
    "last_verified_at",
  ]) {
    assert.match(dataLayer, new RegExp(field));
  }
});

test("the page renders unknown values instead of hiding them", async () => {
  const page = await read("app/(site)/(catalogs)/cli-apps/page.tsx");
  const browser = await read("app/(site)/(catalogs)/cli-apps/cli-app-browser.tsx");

  assert.match(page, /"unknown"/);
  assert.match(browser, /app\.license \?\? "unknown"/);
  assert.match(browser, /app\.latest_version \?\? "unknown"/);
  assert.match(browser, /app\.platforms\.length > 0[\s\S]*: "unknown"/);
});

test("last_commit_at is only set from repository push dates, not release dates", async () => {
  const publish = await read("scripts/cli-apps/publish-apps.mjs");

  assert.match(publish, /const lastCommitAt = github\?\.pushed_at \?\? null/);
  assert.doesNotMatch(publish, /lastCommitAt = github\?\.pushed_at \?\? record\.latest_release_at/);
});

test("closed-source tools without repositories have unknown commit dates", async () => {
  const publish = await read("scripts/cli-apps/publish-apps.mjs");

  // last_commit_at provenance only comes from github_api, not from discovery fallback.
  assert.match(publish, /\["last_commit_at", "github_api"/);
});
