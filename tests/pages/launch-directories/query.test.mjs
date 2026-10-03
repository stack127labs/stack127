import test from "node:test";
import assert from "node:assert/strict";
import { queryLaunchDirectories } from "../../../lib/launch-directories-query.ts";
import { launchDirectorySources, launchDirectoryRevisionMatches } from "../../../lib/launch-directories-data.ts";

const row = (slug, changes = {}) => ({
  slug, name: slug, website_url: `https://${slug}.com/`, summary: "A product listing",
  best_for: "Makers", eligibility_label: "Live products", categories: ["launch-boards"],
  submission_status: "verified", submit_url: `https://${slug}.com/submit`,
  cost_kind: "free", link_type_kind: "dofollow", ...changes,
});

test("domain search combines with category, price and submission availability", () => {
  const rows = [row("producthunt", { name: "Product Hunt", cost_kind: "free_and_paid" }), row("other")];
  const result = queryLaunchDirectories(rows, { q: " PRODUCTHUNT.COM ", categories: ["launch-boards"], costs: ["free_and_paid"], submission: "verified" });
  assert.deepEqual(result.items.map((item) => item.slug), ["producthunt"]);
  assert.equal(queryLaunchDirectories(rows, { q: "producthunt.com", links: ["nofollow"] }).total, 0);
});

test("verified submission paths come before unavailable sites without hiding unknowns", () => {
  const rows = [row("A", { submission_status: "unavailable", submit_url: null }), row("Z"), row("B", { cost_kind: "unknown" })];
  assert.deepEqual(queryLaunchDirectories(rows).items.map((item) => item.slug), ["Z", "B", "A"]);
  assert.deepEqual(queryLaunchDirectories(rows, { submission: "unverified" }).items.map((item) => item.slug), ["A"]);
  assert.deepEqual(queryLaunchDirectories(rows, { sort: "name" }).items.map((item) => item.slug), ["A", "B", "Z"]);
  assert.deepEqual(rows.map((item) => item.slug), ["A", "Z", "B"]);
});

test("pagination recovers from invalid and out-of-range URLs and empty results", () => {
  const rows = Array.from({ length: 50 }, (_, index) => row(String(index).padStart(3, "0")));
  const second = queryLaunchDirectories(rows, { page: "2" });
  assert.deepEqual([second.items.length, second.start, second.end, second.totalPages], [24, 25, 48, 3]);
  const last = queryLaunchDirectories(rows, { page: "999" });
  assert.deepEqual([last.currentPage, last.items.length, last.start, last.end], [3, 2, 49, 50]);
  for (const page of ["abc", "2.5", "-1", Infinity, 0]) assert.equal(queryLaunchDirectories(rows, { page }).currentPage, 1);
  const empty = queryLaunchDirectories(rows, { q: "no such product" });
  assert.deepEqual([empty.total, empty.start, empty.end, empty.currentPage], [0, 0, 0, 1]);
});

test("source links retain field-specific dates and conflicting sources without exposing research", () => {
  const sources = launchDirectorySources({
    cost: { source_url: "https://example.com/pricing", checked_at: "2026-10-02", related_source_urls: ["https://example.com/terms"], note: "private research" },
    submission: { source_url: "https://example.com/submit", checked_at: "2026-09-29T14:00:00Z" },
  }, ["https://example.com/pricing", "https://example.com/about", "javascript:alert(1)", "https://user:secret@example.com/"]);
  assert.deepEqual(sources, [
    { label: "Submission", url: "https://example.com/submit", checked_on: "2026-09-29" },
    { label: "Cost", url: "https://example.com/pricing", checked_on: "2026-10-02" },
    { label: "Cost", url: "https://example.com/terms", checked_on: "2026-10-02" },
    { label: "Source", url: "https://example.com/about", checked_on: null },
  ]);
  assert.deepEqual(launchDirectorySources(null, null), []);
  assert.equal(launchDirectorySources({ cost: { source_url: "https://example.com/pricing", checked_at: "2026-02-30" } }, [])[0].checked_on, null);
  assert.deepEqual(launchDirectorySources({ cost: { observations: [{ source_url: "https://example.com/pricing", checked_at: "2026-10-02" }] } }, []), [{ label: "Cost", url: "https://example.com/pricing", checked_on: "2026-10-02" }]);
});

test("cache verification rejects stale listing data even when the registry revision matches", () => {
  const oldRevision = "a".repeat(32), newRevision = "b".repeat(32);
  const html = `<meta name="stack127-content-revision" content="unchanged"><span hidden data-launch-directories-revision="${oldRevision}"></span>`;
  assert.equal(launchDirectoryRevisionMatches(html, oldRevision), true);
  assert.equal(launchDirectoryRevisionMatches(html, newRevision), false);
  assert.equal(launchDirectoryRevisionMatches('<meta name="stack127-content-revision" content="unchanged">', newRevision), false);
  assert.equal(launchDirectoryRevisionMatches(html, "unpublished"), false);
  assert.equal(launchDirectoryRevisionMatches('<meta name="stack127-content-revision" content="unchanged">', "unpublished"), true);
});
