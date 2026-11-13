import assert from "node:assert/strict";
import test from "node:test";
import { cell, licenseText, normalizeApp, onePerRepository, renderCategory } from "../../scripts/stack127/repos/export-awesome-list.mjs";

const app = (overrides) => normalizeApp({ slug: "a", name: "A", summary: "S", categories: ["wikis"], website_url: null, source_code_url: null, docs_url: null, publisher_url: null, license: null, source_model: "open_source", maintenance_status: "active", docker_support: "official", stars: null, last_commit_at: null, ram_estimate_min_mb: null, ram_estimate_max_mb: null, ...overrides });

test("a repository appears once and the repackaged entry is dropped", () => {
  const kept = onePerRepository([
    app({ slug: "binhex-jellyfin", name: "binhex-jellyfin", source_code_url: "https://github.com/jellyfin/jellyfin/" }),
    app({ slug: "jellyfin", name: "Jellyfin", source_code_url: "https://github.com/Jellyfin/jellyfin" }),
    app({ slug: "closed", name: "Closed", website_url: "https://closed.example" }),
    app({ slug: "closed-2", name: "Closed 2", website_url: "https://closed.example" }),
  ]);
  assert.deepEqual(kept.map((item) => item.slug), ["jellyfin", "closed", "closed-2"]);
});

test("table cells cannot break the Markdown table or inject markup", () => {
  assert.equal(cell("a | b\n<img> [x](y)"), "a \\| b \\<img\\> \\[x\\](y)");
  const page = renderCategory({ slug: "wikis", name: "Wikis" }, [app({ name: "Pipe|Name", website_url: "javascript:alert(1)", docs_url: "https://docs.example/a" })], "2026-11-13");
  assert.match(page, /\| \[Pipe\\\|Name\]\(https:\/\/docs\.example\/a\) \| S \|/);
  assert.doesNotMatch(page, /javascript:/);
});

test("license names are normalized", () => {
  assert.equal(licenseText("MIT License"), "MIT");
  assert.equal(licenseText("No license file declared (all rights reserved by default)"), "None declared");
  assert.equal(licenseText(null), "");
});
