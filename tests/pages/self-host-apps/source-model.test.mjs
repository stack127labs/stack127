import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("self-host apps include open, source-available, and closed-source software", async () => {
  const schema = await read("scripts/self-host-apps/lib/schema.mjs");
  const migration = await read("supabase/migrations/20260829090000_make_self_host_apps_page_owned.sql");

  assert.match(schema, /source_model/);
  assert.match(schema, /open_source/);
  assert.match(schema, /source_available/);
  assert.match(schema, /closed_source/);
  assert.match(migration, /alter table public\.open_projects rename to self_host_apps/);
  assert.match(migration, /alter type public\.open_project_source_model rename to self_host_app_source_model/);
  assert.match(migration, /add value if not exists 'closed_source'/);
});

test("self-host app data and drawer expose the source model", async () => {
  const data = await read("lib/apps.ts");
  const page = await read("app/(site)/(catalogs)/self-host-apps/page.tsx");
  const drawer = await read("app/(site)/(catalogs)/self-host-apps/directory-app-browser.tsx");

  assert.match(data, /source_model/);
  assert.match(page, /<DirectoryAppBrowser/);
  assert.match(drawer, /source model/);
});

test("closed-source publication does not require a source repository", async () => {
  const applyReview = await read("scripts/self-host-apps/apply-candidate-review.mjs");

  assert.match(applyReview, /record\.source_model !== "closed_source" && !record\.source_code_url/);
  assert.match(applyReview, /record\.source_model === "closed_source" && !record\.website_url/);
  assert.doesNotMatch(applyReview, /source_code_url is required for an open project/);
});

test("active self-host app code uses the page-owned table names", async () => {
  const data = await read("lib/apps.ts");
  const candidates = await read("scripts/self-host-apps/lib/candidates.mjs");
  const workflow = await read("content_docs/self-host-apps/data-workflow.md");

  assert.match(data, /public\.self_host_apps/);
  assert.match(candidates, /public\.self_host_app_candidates/);
  assert.match(workflow, /self_host_app_candidates/);
  assert.doesNotMatch(data, /public\.open_projects/);
  assert.doesNotMatch(candidates, /public\.open_project_/);
});

test("candidate rejection decisions use the database rejected status", async () => {
  const applyReview = await read("scripts/self-host-apps/apply-candidate-review.mjs");

  assert.match(applyReview, /decision === "reject" \? "rejected" : decision/);
});

test("dedupe only revisits unresolved identity reviews", async () => {
  const dedupeCandidates = await read("scripts/self-host-apps/dedupe-candidates.mjs");

  assert.match(dedupeCandidates, /status = 'new'/);
  assert.match(dedupeCandidates, /status = 'needs_review'/);
  assert.match(dedupeCandidates, /duplicate_reason = 'possible_name_match'/);
  assert.doesNotMatch(dedupeCandidates, /where status in \('new', 'needs_review', 'duplicate'\)/);
});
