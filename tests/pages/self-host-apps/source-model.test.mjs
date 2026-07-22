import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("open projects distinguish open source from source available", async () => {
  const schema = await read("scripts/self-host-apps/lib/schema.mjs");
  const migration = await read("supabase/migrations/20260719090000_add_open_project_source_model.sql");

  assert.match(schema, /source_model/);
  assert.match(schema, /open_source/);
  assert.match(schema, /source_available/);
  assert.match(migration, /create type public\.open_project_source_model/);
});

test("self-host app HTML and drawer expose the source model", async () => {
  const data = await read("lib/apps.ts");
  const page = await read("app/(site)/self-host-apps/page.tsx");
  const drawer = await read("app/(site)/self-host-apps/directory-app-browser.tsx");

  assert.match(data, /source_model/);
  assert.match(page, /source model/);
  assert.match(drawer, /source model/);
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
