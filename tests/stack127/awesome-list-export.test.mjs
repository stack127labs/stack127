import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { cell, httpUrl, licenseText, normalizeApp, onePerRepository, prepareOutDir, renderCategory, repositoryKey } from "../../scripts/stack127/repos/export-awesome-list.mjs";

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

test("links are public http URLs that cannot end a cell or a link", () => {
  for (const bad of ["javascript:alert(1)", "https://good.example\\@evil.example", "https://user:pass@example.com", "http://localhost:3000", "http://192.168.1.4/app", "https://nas.local/x", "http://localhost./", "http://nas.local./", "http://0.0.0.0/", "http://[::1]/", "https://nas.home/", "ftp://example.com"]) {
    assert.equal(httpUrl(bad), "", bad);
  }
  assert.equal(httpUrl("https://example.com/a_b"), "https://example.com/a_b");
  for (const good of ["https://10.example.com/", "https://100.64.example.com/", "https://home.example.com/"]) assert.equal(httpUrl(good), good);
  const entity = renderCategory({ slug: "wikis", name: "Wikis" }, [app({ website_url: "https://good.example&commat;evil.example/?a=1&copy=2" })], "2026-11-13");
  assert.ok(entity.includes("(https://good.example&amp;commat;evil.example/?a=1&amp;copy=2)"));
  const page = renderCategory({ slug: "wikis", name: "Wi|kis" }, [app({ website_url: "https://example.com/a|b(c)" })], "2026-11-13");
  assert.ok(page.includes("(https://example.com/a%7Cb%28c%29)"));
  const row = page.split("\n").find((line) => line.startsWith("| [A]"));
  assert.equal(row.split(/(?<!\\)\|/).length - 2, 6);
  assert.match(page, /^# Wi\\\|kis self-hosted apps/);
});

test("repository URLs that differ only in form are the same repository", () => {
  const key = repositoryKey("https://github.com/Owner/Repo");
  for (const same of ["http://github.com/owner/repo.git/", "https://www.github.com/owner/repo/#readme", "https://github.com/owner/repo.git"]) assert.equal(repositoryKey(same), key);
  assert.notEqual(repositoryKey("https://git.example.org/Team/App"), repositoryKey("https://git.example.org/team/app"));
  assert.notEqual(repositoryKey("https://git.example.org/team/app"), repositoryKey("https://git.example.org:8443/team/app"));
});

test("only an earlier export is cleaned", () => {
  const foreign = mkdtempSync(path.join(os.tmpdir(), "awesome-list-"));
  mkdirSync(path.join(foreign, "categories"));
  writeFileSync(path.join(foreign, "categories", "keep.md"), "mine");
  assert.throws(() => prepareOutDir(foreign), /not an earlier export/);
  assert.ok(existsSync(path.join(foreign, "categories", "keep.md")));

  writeFileSync(path.join(foreign, "README.md"), "# Awesome self-hosted apps\n");
  writeFileSync(path.join(foreign, "categories", "notes.txt"), "kept");
  prepareOutDir(foreign);
  assert.ok(!existsSync(path.join(foreign, "categories", "keep.md")));
  assert.ok(existsSync(path.join(foreign, "categories", "notes.txt")));

  const linked = mkdtempSync(path.join(os.tmpdir(), "awesome-list-"));
  writeFileSync(path.join(linked, "README.md"), "# Awesome self-hosted apps\n");
  symlinkSync(path.join(foreign, "categories"), path.join(linked, "categories"));
  writeFileSync(path.join(foreign, "categories", "other.md"), "not ours");
  assert.throws(() => prepareOutDir(linked), /symbolic link/);
  assert.ok(existsSync(path.join(foreign, "categories", "other.md")));
});
