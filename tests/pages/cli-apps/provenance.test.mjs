import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("publishing requires provenance and verification dates", async () => {
  const publishScript = await read("scripts/cli-apps/publish-apps.mjs");

  assert.match(publishScript, /terminal_app_field_sources/);
  assert.match(publishScript, /last_verified_at/);
  assert.match(publishScript, /missing last_verified_at/);
  // Publication is blocked without an official URL.
  assert.match(publishScript, /no official website or repository URL/);
});

test("every published field records where it came from", async () => {
  const publishScript = await read("scripts/cli-apps/publish-apps.mjs");

  for (const field of ["summary", "website_url", "repository_url", "stars", "license"]) {
    assert.match(
      publishScript,
      new RegExp(`\\["${field}"`),
      `provenance row for ${field}`,
    );
  }
});

test("verification uses official sources, not directory copies", async () => {
  const verifyScript = await read("scripts/cli-apps/verify-candidates.mjs");

  assert.match(verifyScript, /api\.github\.com\/repos/);
  assert.match(verifyScript, /evidence/);
});

test("published summaries are original stack127 writing", async () => {
  const publishScript = await read("scripts/cli-apps/publish-apps.mjs");

  assert.match(publishScript, /original stack127 summary/);
});

test("candidate review decisions keep the queue honest", async () => {
  const publishScript = await read("scripts/cli-apps/publish-apps.mjs");

  assert.match(publishScript, /decision === "exclude"/);
  assert.match(publishScript, /exclusion_reason/);
  assert.match(publishScript, /needs_review/);
});
