import assert from "node:assert/strict";
import test from "node:test";
import {
  canonicalRepoKey,
  canonicalWebsiteKey,
  dedupeKey,
  normalizeCandidate,
  normalizeName,
} from "../../../scripts/cli-apps/lib/normalize.mjs";

test("dedupe keys are deterministic across discovery order", () => {
  const first = dedupeKey({
    repositoryUrl: "https://github.com/jesseduffield/lazygit",
    websiteUrl: null,
    name: "lazygit",
  });
  const second = dedupeKey({
    repositoryUrl: "http://www.github.com/jesseduffield/lazygit.git",
    websiteUrl: "https://github.com/jesseduffield/lazygit",
    name: "LazyGit",
  });

  assert.equal(first, second);
  assert.equal(first, "repo:github.com/jesseduffield/lazygit");
});

test("website identity wins when no repository exists", () => {
  const key = dedupeKey({
    repositoryUrl: null,
    websiteUrl: "https://www.warp.dev/",
    name: "Warp",
  });

  assert.equal(key, "site:warp.dev");
});

test("name fallback normalizes punctuation and case", () => {
  assert.equal(normalizeName("h-m-m"), "h m m");
  assert.equal(
    dedupeKey({ repositoryUrl: null, websiteUrl: null, name: "h-m-m" }),
    dedupeKey({ repositoryUrl: null, websiteUrl: null, name: "H M M" }),
  );
});

test("repository keys only match known forges", () => {
  assert.equal(canonicalRepoKey("https://github.com/charmbracelet/gum"), "github.com/charmbracelet/gum");
  assert.equal(canonicalRepoKey("https://gitlab.com/group/project"), "gitlab.com/group/project");
  assert.equal(canonicalRepoKey("https://example.com/a/b"), null);
  assert.equal(canonicalWebsiteKey("https://example.com"), "example.com");
});

test("normalization keeps aliases and source evidence on the candidate", () => {
  const candidate = normalizeCandidate(
    {
      name: "btop++",
      summary: "Resource monitor",
      repository_url: "https://github.com/aristocratos/btop",
      categories: ["monitor"],
      payload: { source_row: 42 },
    },
    { source: "test_source", sourceType: "awesome_list", sourceUrl: "https://example.com/list" },
  );

  assert.equal(candidate.source, "test_source");
  assert.equal(candidate.source_type, "awesome_list");
  assert.equal(candidate.dedupe_key, "repo:github.com/aristocratos/btop");
  assert.equal(candidate.confidence_score > 0, true);
  assert.deepEqual(candidate.payload, { source_row: 42 });
});

test("candidates without a usable name are dropped, not guessed", () => {
  assert.equal(normalizeCandidate({ name: "" }, { source: "x" }), null);
  assert.equal(normalizeCandidate({}, { source: "x" }), null);
});
