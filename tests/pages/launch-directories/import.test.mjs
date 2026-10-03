import test from "node:test";
import assert from "node:assert/strict";
import { validateLaunchDirectoryUpdates, applyLaunchDirectoryUpdates } from "../../../scripts/stack127/database/update-launch-directories.mjs";
import { validateLaunchPublication } from "../../../scripts/stack127/database/publish-launch-directories.mjs";

test("listing imports cannot change publication, identity or categories", () => {
  for (const field of ["is_published", "id", "slug", "name", "categories"]) {
    assert.throws(() => validateLaunchDirectoryUpdates([{ slug: "product-hunt", changes: { [field]: true } }]), /cannot be changed/);
  }
  assert.throws(() => validateLaunchDirectoryUpdates([{ slug: "a", changes: {} }, { slug: "a", changes: {} }]), /unique/);
  assert.throws(() => validateLaunchDirectoryUpdates([{ slug: "a", changes: { submit_url: "javascript:alert(1)" } }]), /URL/);
  assert.throws(() => validateLaunchDirectoryUpdates([{ slug: "a", changes: { checked_on: "2026-02-30" } }]), /date/);
  assert.throws(() => validateLaunchDirectoryUpdates([{ slug: "a", changes: { evidence: { cost: { observations: [{ checked_at: "2026-02-30" }] } } } }]), /date/);
  assert.throws(() => validateLaunchDirectoryUpdates([{ slug: "a", changes: { evidence: { cost: { source_url: "https://user:secret@example.com/pricing" } } } }]), /source URL/);
});

test("a record date cannot predate newer source observations", async () => {
  const client = { query: async () => ({ rows: [{ record: { slug: "a", checked_on: "2026-09-29", submission_status: "verified", submit_url: "https://example.com/submit" } }] }) };
  await assert.rejects(applyLaunchDirectoryUpdates(client, [{ slug: "a", changes: { evidence: { cost: { observations: [{ source_url: "https://example.com/pricing", checked_at: "2026-10-02" }] } } } }]), /older than its evidence/);
});

test("bulk updates reject a listing changed since editorial review", async () => {
  let calls = 0;
  const client = { query: async () => {
    calls++;
    return { rows: [{ record: { slug: "a", updated_at: "2026-10-02T12:00:00Z", submission_status: "verified", submit_url: "https://example.com/submit", summary: "A newer description" } }] };
  } };
  await assert.rejects(applyLaunchDirectoryUpdates(client, [{ slug: "a", expected_updated_at: "2026-09-29T12:00:00Z", changes: { summary: "An older description" } }]), /changed after the reviewed snapshot/);
  assert.equal(calls, 1);
});

test("database version checks reject timestamps that differ below millisecond precision", async () => {
  const client = { query: async (sql, values) => {
    if (sql.startsWith("select")) return { rows: [{ record: { slug: "a", updated_at: "2026-10-02T12:00:00.000123Z", submission_status: "verified", submit_url: "https://example.com/submit", summary: "Current" } }] };
    const patch = JSON.parse(values[0])[0];
    assert.equal(patch.expected_updated_at, "2026-10-02T12:00:00.000999Z");
    return { rowCount: 0 };
  } };
  await assert.rejects(applyLaunchDirectoryUpdates(client, [{ slug: "a", expected_updated_at: "2026-10-02T12:00:00.000999Z", changes: { summary: "Changed" } }]), /update count changed/);
});

test("publication rejects partial data, community posts and missing public evidence", () => {
  const rows = Array.from({ length: 165 }, (_, index) => ({
    slug: `site-${index}`, name: `Site ${index}`, is_published: true, categories: ["launch-boards"],
    website_url: "https://example.com/", summary: "Product listings", best_for: "Makers",
    cost_label: "Couldn't verify", review_time_label: "Not stated", link_type_label: "Couldn't verify",
    eligibility_label: "Live products", checked_on: "2026-10-02", sources: ["https://example.com/terms"], evidence: {},
    submission_status: "not_found", submit_url: null,
  }));
  assert.equal(validateLaunchPublication(rows), 165);
  assert.throws(() => validateLaunchPublication(rows.slice(1)), /Expected 165/);
  assert.throws(() => validateLaunchPublication(rows.map((row, i) => i ? row : { ...row, categories: ["community-posts"] })), /Community post/);
  assert.throws(() => validateLaunchPublication(rows.map((row, i) => i ? row : { ...row, sources: [] })), /No usable public sources/);
  assert.throws(() => validateLaunchPublication(rows.map((row, i) => i ? row : { ...row, checked_on: null })), /record check date/);
});

test("an unavailable submission cannot keep a clickable destination", async () => {
  const client = { query: async () => ({ rows: [{ record: { slug: "a", submission_status: "verified", submit_url: "https://example.com/submit" } }] }) };
  await assert.rejects(applyLaunchDirectoryUpdates(client, [{ slug: "a", changes: { submission_status: "unavailable" } }]), /disagree/);
});

test("hidden community rows cannot be imported through the visible directory workflow", async () => {
  const client = { query: async () => ({ rows: [] }) };
  await assert.rejects(applyLaunchDirectoryUpdates(client, [{ slug: "show-hn", changes: { summary: "Changed" } }]), /Visible listing not found/);
});

test("unchanged evidence is skipped regardless of JSON object key order", async () => {
  let calls = 0;
  const client = { query: async () => {
    calls++;
    return { rows: [{ record: { slug: "a", submission_status: "verified", submit_url: "https://example.com/submit", evidence: { cost: { status: "verified", source_url: "https://example.com/pricing" } } } }] };
  } };
  const result = await applyLaunchDirectoryUpdates(client, [{ slug: "a", changes: { evidence: { cost: { source_url: "https://example.com/pricing", status: "verified" } } } }]);
  assert.equal(result.changed_count, 0);
  assert.equal(calls, 1);
});
