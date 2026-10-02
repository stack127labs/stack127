import assert from "node:assert/strict";
import test from "node:test";
import { paginationPages } from "../../../lib/pagination.ts";
import {
  filterApps,
  getPage,
  getValues,
  sortApps,
} from "../../../app/(site)/(directories)/cli-apps/filters.ts";

function app(overrides = {}) {
  return {
    slug: "test-app",
    name: "Test App",
    aliases: [],
    summary: "A test app",
    primary_type: "tui",
    additional_types: [],
    categories: ["development"],
    platforms: ["linux"],
    language: "go",
    install_methods: ["brew"],
    website_url: null,
    docs_url: null,
    repository_url: null,
    source_model: "open_source",
    pricing_model: "free",
    license: "MIT",
    latest_version: null,
    latest_release_at: null,
    stars: null,
    last_commit_at: null,
    maintenance_status: "unknown",
    icon_url: null,
    screenshot_url: null,
    last_verified_at: null,
    ...overrides,
  };
}

const apps = [
  app({ slug: "a", name: "alpha", stars: 100, pricing_model: "paid", platforms: ["macos"] }),
  app({ slug: "b", name: "beta", stars: 500, maintenance_status: "stale" }),
  app({
    slug: "c",
    name: "gamma",
    stars: 10,
    primary_type: "terminal_emulator",
    categories: ["terminal-ui"],
    install_methods: ["cargo"],
    source_model: "closed_source",
    latest_release_at: "2026-08-01",
  }),
];

test("search matches name, summary, aliases, and metadata", () => {
  assert.equal(filterApps(apps, { q: "alpha" }).length, 1);
  assert.equal(filterApps(apps, { q: "cargo" }).length, 1);
  assert.equal(filterApps(apps, { q: "zzz" }).length, 0);
  assert.equal(filterApps(apps, {}).length, 3);
});

test("type filter also reads additional types", () => {
  const params = { type: "terminal_emulator" };
  assert.deepEqual(filterApps(apps, params).map((a) => a.slug), ["c"]);
});

test("multi-select fields match any selected value and keep unknown selectable", () => {
  const paidOrFree = { pricing: ["paid", "free"] };
  assert.equal(filterApps(apps, paidOrFree).length, 3);

  const closedOnly = { source: ["closed_source"] };
  assert.deepEqual(filterApps(apps, closedOnly).map((a) => a.slug), ["c"]);

  const unknownPricing = { pricing: ["unknown"] };
  assert.equal(filterApps(apps, unknownPricing).length, 0);
});

test("category, platform, install, and language filters intersect the result set", () => {
  const platformResult = filterApps(apps, { platform: ["linux"] }).map((a) => a.slug);
  assert.equal(platformResult.includes("a"), false, `platform filter should exclude a; got ${JSON.stringify(platformResult)}`);
  assert.deepEqual(platformResult, ["b", "c"]);
  assert.deepEqual(filterApps(apps, { category: ["terminal-ui"] }).map((a) => a.slug), ["c"]);
  assert.deepEqual(filterApps(apps, { install: ["brew"] }).map((a) => a.slug), ["a", "b"]);
  assert.deepEqual(filterApps(apps, { language: ["go"] }).map((a) => a.slug), ["a", "b", "c"]);
});

test("license filter handles unknown values correctly", () => {
  assert.deepEqual(filterApps(apps, { license: ["mit"] }).map((a) => a.slug), ["a", "b", "c"].filter((s) => {
    const found = apps.find((x) => x.slug === s);
    return (found.license ?? "unknown").toLowerCase() === "mit";
  }));
  // All fixtures have MIT
  assert.equal(filterApps(apps, { license: ["mit"] }).length, 3);
  assert.equal(filterApps(apps, { license: ["unknown"] }).length, 0);
  const mixed = [
    app({ slug: "d", license: null }),
    app({ slug: "e", license: "Apache-2.0" }),
  ];
  assert.deepEqual(filterApps(mixed, { license: ["unknown"] }).map((a) => a.slug), ["d"]);
  assert.deepEqual(filterApps(mixed, { license: ["apache-2.0"] }).map((a) => a.slug), ["e"]);
});

test("sorting supports popularity, name, recency, and health", () => {
  assert.deepEqual(sortApps(apps, "popular").map((a) => a.slug), ["b", "a", "c"]);
  assert.deepEqual(sortApps(apps, "name").map((a) => a.slug), ["a", "b", "c"]);
  assert.deepEqual(sortApps(apps, "recent").map((a) => a.slug), ["c", "a", "b"]);
  // Stale sorts last; ties break by stars.
  assert.deepEqual(sortApps(apps, "healthy").map((a) => a.slug), ["a", "c", "b"]);
});

test("pagination renders first, last, and a window around the current page", () => {
  assert.deepEqual(paginationPages(1, 1), [1]);
  assert.deepEqual(paginationPages(2, 10), [1, 2, 3, null, 10]);
  assert.deepEqual(paginationPages(9, 10), [1, null, 8, 9, 10]);
});

test("page parsing ignores invalid values", () => {
  assert.equal(getPage({}), 1);
  assert.equal(getPage({ page: "0" }), 1);
  assert.equal(getPage({ page: "abc" }), 1);
  assert.equal(getPage({ page: "3" }), 3);
  assert.deepEqual(getValues({ category: ["a", "b"] }, "category"), ["a", "b"]);
});
