import test from "node:test";
import assert from "node:assert/strict";
import { validateLaunchDirectoryRecords, importLaunchDirectoryRecords } from "../../../scripts/stack127/database/import-launch-directories.mjs";

function record(overrides = {}) {
  const evidence = Object.fromEntries(["submission", "cost", "review_time", "eligibility", "link_type"].map(key => [key, {
    source_url: "https://example.com/submit", checked_at: "2026-10-05",
    status: "verified", method: "official-page", note: "Checked the official page.",
  }]));
  return {
    slug: "example", name: "Example", website_url: "https://example.com/", submit_url: "https://example.com/submit",
    submission_status: "verified", categories: ["launch-boards"], summary: "A launch board.", best_for: "Live products",
    cost_kind: "free", cost_label: "Free", cost_tag: "Free", cost_note: null,
    review_time_label: "Not stated", link_type_kind: "unknown", link_type_label: "Couldn't verify",
    eligibility_label: "Live products", example_listing_url: null, sources: ["https://example.com/submit"],
    research_notes: "", evidence, checked_on: "2026-10-05", is_published: true, ...overrides,
  };
}

test("new listing imports reject incomplete, unsafe, duplicate and out-of-scope records", () => {
  assert.equal(validateLaunchDirectoryRecords([record()]).length, 1);
  for (const overrides of [
    { id: 1 }, { name: " " }, { categories: ["community-posts"] }, { categories: ["launch-boards", "launch-boards"] },
    { cost_kind: "freemium" }, { link_type_kind: "follow" }, { is_published: false },
    { submit_url: "https://user:secret@example.com/submit" }, { evidence: {} }, { checked_on: "2026-10-04" },
  ]) assert.throws(() => validateLaunchDirectoryRecords([record(overrides)]));
  const missing = record();
  delete missing.cost_note;
  assert.throws(() => validateLaunchDirectoryRecords([missing]), /Missing cost_note/);
  assert.throws(() => validateLaunchDirectoryRecords([record(), record()]), /unique/);
  assert.throws(() => validateLaunchDirectoryRecords([record(), record({ slug: "another", website_url: "https://www.example.com/" })]), /Duplicate website host/);
});

function clientWith(existing) {
  const calls = [];
  return { calls, query: async (sql, values) => {
    calls.push({ sql, values });
    if (sql.startsWith("select")) return { rows: existing.map(record => ({ record })) };
    if (sql.startsWith("insert")) return { rowCount: JSON.parse(values[0]).length };
    return {};
  } };
}

test("retry skips identical records without overwriting other listings", async () => {
  const existing = record({ id: "42", created_at: "2026-10-05T10:00:00Z" });
  const client = clientWith([existing]);
  assert.deepEqual(await importLaunchDirectoryRecords(client, [record()]), { inserted_count: 0, inserted: [], skipped: ["example"] });
  assert.equal(client.calls.length, 2);
});

test("slug conflicts and existing website hosts stop the entire batch before insertion", async () => {
  for (const existing of [record({ summary: "Already edited" }), record({ slug: "old-name", website_url: "https://www.example.com/" })]) {
    const client = clientWith([existing]);
    await assert.rejects(importLaunchDirectoryRecords(client, [record({ slug: "new-site", website_url: "https://new.example/" }), record()]), /differs|already listed/);
    assert.equal(client.calls.some(call => call.sql.startsWith("insert")), false);
  }
});

test("inserts only selected new records and lets the database assign IDs and dates", async () => {
  const client = clientWith([]);
  const result = await importLaunchDirectoryRecords(client, [record()]);
  assert.deepEqual(result, { inserted_count: 1, inserted: ["example"], skipped: [] });
  assert.match(client.calls[0].sql, /lock table/);
  const insert = client.calls.at(-1);
  assert.doesNotMatch(insert.sql, /"id"|"created_at"|"updated_at"/);
  assert.deepEqual(JSON.parse(insert.values[0]), [record()]);
});
