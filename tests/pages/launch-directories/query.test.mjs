import test from "node:test";
import assert from "node:assert/strict";
import { queryLaunchDirectories, sortLaunchDirectories } from "../../../lib/launch-directories-query.ts";
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

test("recommended pins come first in editorial order regardless of other ranks", () => {
  const pins = ["product-hunt", "betalist", "devhunt", "peerlist-launchpad", "alternativeto", "saashub"];
  const rows = [row("a-unpinned"), ...pins.toReversed().map((slug) => row(slug, {
    submission_status: "unavailable", submit_url: null, categories: [], cost_kind: "unknown", link_type_kind: "unknown",
  }))];
  assert.deepEqual(sortLaunchDirectories(rows, "recommended").map((item) => item.slug), [...pins, "a-unpinned"]);
});

test("recommended working submit pages beat tier-zero rows without a verified URL", () => {
  const rows = [
    row("a-no-url", { submit_url: null }),
    row("b-unverified", { submission_status: "not_found" }),
    row("z-working", { categories: ["specialist-regional"], cost_kind: "unknown", link_type_kind: "unknown" }),
  ];
  assert.deepEqual(sortLaunchDirectories(rows, "recommended").map((item) => item.slug), ["z-working", "a-no-url", "b-unverified"]);
});

test("recommended category tiers use the best category and take priority over cost", () => {
  const rows = [
    row("a-other", { categories: ["community-posts"] }),
    row("b-specialist", { categories: ["specialist-regional"] }),
    row("c-startup", { categories: ["startup-software"], cost_kind: "paid" }),
    row("d-beta", { categories: ["ai-tools", "unrecognized", "prelaunch-beta"], cost_kind: "unknown" }),
    row("e-empty", { categories: [] }),
  ];
  assert.deepEqual(sortLaunchDirectories(rows, "recommended").map((item) => item.slug), ["d-beta", "c-startup", "b-specialist", "a-other", "e-empty"]);
});

test("recommended cost ranks take priority over link ranks", () => {
  const rows = [
    row("a-unknown", { cost_kind: "unknown" }),
    row("b-paid", { cost_kind: "paid" }),
    row("c-free-and-paid", { cost_kind: "free_and_paid", link_type_kind: "unknown" }),
    row("d-free", { link_type_kind: "unknown" }),
  ];
  assert.deepEqual(sortLaunchDirectories(rows, "recommended").map((item) => item.slug), ["c-free-and-paid", "d-free", "b-paid", "a-unknown"]);
});

test("recommended link ranks put unknown last and use name then slug to break ties", () => {
  const rows = [
    row("a-unknown", { link_type_kind: "unknown" }),
    ...["none", "estimated_nofollow", "sponsored", "ugc", "nofollow"].map((link_type_kind) => row(`b-${link_type_kind}`, { link_type_kind })),
    row("c-varies", { name: "Same name", link_type_kind: "varies" }),
    row("c-multiple", { name: "same NAME", link_type_kind: "multiple" }),
    row("z-dofollow"),
  ];
  assert.deepEqual(sortLaunchDirectories(rows, "recommended").map((item) => item.slug), [
    "z-dofollow", "c-multiple", "c-varies", "b-estimated_nofollow", "b-nofollow", "b-none", "b-sponsored", "b-ugc", "a-unknown",
  ]);
});

test("recommended is the default sort while ready and name retain their ordering", () => {
  const rows = [row("a-free"), row("z-paid-pin", { slug: "saashub", cost_kind: "paid" })];
  assert.deepEqual(sortLaunchDirectories(rows).map((item) => item.slug), ["saashub", "a-free"]);
  assert.deepEqual(queryLaunchDirectories(rows).items.map((item) => item.slug), ["saashub", "a-free"]);
  for (const sort of ["ready", "name"]) {
    assert.deepEqual(sortLaunchDirectories(rows, sort).map((item) => item.slug), ["a-free", "saashub"]);
  }
  const readyRows = [row("a-paid", { cost_kind: "paid" }), row("b-free"), row("c-unknown", { cost_kind: "unknown" }), row("d-unavailable", { submission_status: "unavailable" })];
  assert.deepEqual(sortLaunchDirectories(readyRows, "ready").map((item) => item.slug), ["a-paid", "b-free", "c-unknown", "d-unavailable"]);
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
