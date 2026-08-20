import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  DOCKERIGNORE_CONTRACT,
  MOBY_PATTERNMATCHER_COMMIT,
  MOBY_PATTERNMATCHER_VERSION,
  buildDockerignoreCopySummary,
  evaluateDockerignore,
} from "../../../lib/dockerignore/evaluate.ts";
import { parseIgnoreRules, parseProbePaths } from "../../../lib/dockerignore/parser.ts";

const fixturePath = new URL("fixtures/moby-v0.6.1.json", import.meta.url);
const receiptPath = new URL("fixtures/buildkit-current-receipt.json", import.meta.url);
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8"));

function valid(rules, paths, sourceMode = "root") {
  const result = evaluateDockerignore({ rules, paths, sourceMode });
  assert.equal(result.status, "valid", JSON.stringify(result));
  return result;
}

test("pins the exact matcher contract and complete fixture provenance", () => {
  assert.equal(MOBY_PATTERNMATCHER_VERSION, "v0.6.1");
  assert.equal(MOBY_PATTERNMATCHER_COMMIT, "5a6d8429a19bb6948a372ff19e86fe83599a04b7");
  assert.equal(DOCKERIGNORE_CONTRACT, "moby-patternmatcher-v0.6.1-linux-slash");
  assert.equal(fixtures.tag, MOBY_PATTERNMATCHER_VERSION);
  assert.equal(fixtures.commit, MOBY_PATTERNMATCHER_COMMIT);
  assert.ok(fixtures.cases.length >= 70, `expected full corpus, got ${fixtures.cases.length}`);
  const identities = new Set();
  for (const fixture of fixtures.cases) {
    assert.match(fixture.id, /^(?:moby|stack127)-/);
    assert.ok(["moby-upstream", "stack127"].includes(fixture.sourceKind));
    assert.equal(fixture.tag, MOBY_PATTERNMATCHER_VERSION);
    assert.equal(fixture.commit, MOBY_PATTERNMATCHER_COMMIT);
    assert.match(fixture.sourceSha256, /^[a-f0-9]{64}$/);
    assert.ok(!identities.has(fixture.id), `duplicate ${fixture.id}`);
    identities.add(fixture.id);
  }
});

test("matches every pinned Moby final boolean and error", () => {
  for (const fixture of fixtures.cases) {
    const result = evaluateDockerignore({
      rules: fixture.patterns.join("\n"),
      paths: fixture.path,
      sourceMode: "root",
    });
    if (fixture.error) {
      assert.equal(result.status, "invalid", fixture.id);
      assert.equal(result.field, "rules", fixture.id);
      continue;
    }
    assert.equal(result.status, "valid", fixture.id);
    assert.equal(result.rows[0].ignored, fixture.expectedIgnored, fixture.id);
  }
});

test("preserves physical rule lines and Docker preprocessing", () => {
  const parsed = parseIgnoreRules("\uFEFF/test1\r\n# comment\r\n  /a/file/here/  \r\n\r\n.\r\n! /keep/file");
  assert.equal(parsed.status, "valid");
  assert.deepEqual(parsed.lines.map((line) => [line.sourceLine, line.normalized, line.active, line.reason]), [
    [1, "test1", true, null],
    [2, "", false, "comment"],
    [3, "a/file/here", true, null],
    [4, "", false, "blank"],
    [5, ".", false, "historical-dot"],
    [6, "!keep/file", true, null],
  ]);
  const result = valid("\uFEFF/test1\r\n# comment\r\n  /a/file/here/  \r\n\r\n.\r\n! /keep/file", "test1\na/file/here\nkeep/file");
  assert.deepEqual(result.rows.map((row) => [row.verdict, row.decidingLine]), [
    ["Excluded", 1],
    ["Excluded", 3],
    ["Included", null],
  ]);
});

test("normalizes pasted paths but retains pattern escapes", () => {
  const parsed = parseProbePaths("docs\\README.md\n.\\docs\\guide.md\na*b\na\\x");
  assert.equal(parsed.status, "valid");
  assert.deepEqual(parsed.paths.map((path) => path.normalized), ["docs/README.md", "docs/guide.md", "a*b", "a/x"]);
  const result = valid("docs/*.md\na\\*b", "docs\\README.md\n.\\docs\\guide.md\na*b\na\\x");
  assert.deepEqual(result.rows.map((row) => row.verdict), ["Excluded", "Excluded", "Excluded", "Included"]);
});

test("rejects path controls before trimming without rejecting ordinary spaces", () => {
  for (const path of ["debug.log\t", "\tdebug.log", "debug.log\r", "debug\t.log"]) {
    const result = evaluateDockerignore({ rules: "*.log", paths: path, sourceMode: "root" });
    assert.equal(result.status, "invalid", JSON.stringify(path));
    assert.equal(result.field, "paths", JSON.stringify(path));
    assert.equal("rows" in result, false, JSON.stringify(path));
  }

  const parsed = parseProbePaths("\t\r\n  debug.log  ");
  assert.equal(parsed.status, "valid");
  assert.deepEqual(parsed.paths, [{ sourceLine: 2, raw: "  debug.log  ", normalized: "debug.log" }]);
});

test("applies ordered negation and records the complete trace", () => {
  const excluded = valid("!fileutils.go\n*.go", "fileutils.go");
  const included = valid("*.go\n!fileutils.go", "fileutils.go");
  assert.equal(excluded.rows[0].verdict, "Excluded");
  assert.equal(excluded.rows[0].decidingLine, 2);
  assert.equal(included.rows[0].verdict, "Included");
  assert.equal(included.rows[0].decidingLine, 2);
  assert.deepEqual(included.rows[0].trace.map((row) => [row.sourceLine, row.matched, row.eligible, row.ignoredAfter]), [
    [1, true, true, true],
    [2, true, true, false],
  ]);
});

test("includes a parent exception and matches the current BuildKit receipt", () => {
  const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
  assert.equal(receipt.classification, "copy-succeeded");
  assert.equal(receipt.exitCode, 0);
  assert.match(receipt.outputSha256, /^[a-f0-9]{64}$/);
  for (const runtime of [receipt.runtime.engine, receipt.runtime.buildkit, receipt.runtime.buildx]) assert.ok(runtime.version);
  const result = valid("docs\n!docs/README.md", "docs/README.md");
  assert.equal(result.rows[0].verdict, "Included");
  assert.equal(result.rows[0].ignored, false);
  assert.equal(result.rows[0].decidingLine, 2);
  assert.deepEqual(result.counts, { excluded: 0, included: 1, total: 1 });
  assert.deepEqual(result.rows[0].trace.map((row) => [row.sourceLine, row.matchSource, row.ignoredAfter]), [
    [1, "parent", true],
    [2, "self", false],
  ]);
});

test("is all-or-nothing for malformed rules and unsafe paths", () => {
  for (const rules of ["!", "[", "a[", "\\", "[Local-Only]/"]) {
    const first = evaluateDockerignore({ rules, paths: "safe/file", sourceMode: "root" });
    const second = evaluateDockerignore({ rules, paths: "safe/file", sourceMode: "root" });
    assert.equal(first.status, "invalid", rules);
    assert.equal(first.field, "rules", rules);
    assert.deepEqual(second, first, rules);
    assert.equal("rows" in first, false, rules);
  }
  for (const path of ["/", ".", "././", "a/../../secret", `nul\0byte`, `bad\u007fpath`]) {
    const result = evaluateDockerignore({ rules: "*", paths: `safe/file\n${path}`, sourceMode: "root" });
    assert.equal(result.status, "invalid", JSON.stringify(path));
    assert.equal(result.field, "paths");
    assert.equal("rows" in result, false);
  }
});

test("accepts exact boundaries and rejects every just-over boundary", () => {
  const codePoints1024 = "a".repeat(1024);
  assert.equal(parseIgnoreRules(codePoints1024).status, "valid");
  assert.equal(parseIgnoreRules(`${codePoints1024}a`).status, "invalid");
  assert.equal(parseIgnoreRules(Array.from({ length: 200 }, (_, index) => `r${index}`).join("\n")).status, "valid");
  assert.equal(parseIgnoreRules(Array.from({ length: 201 }, (_, index) => `r${index}`).join("\n")).status, "invalid");
  assert.equal(parseProbePaths(Array.from({ length: 500 }, (_, index) => `p${index}`).join("\n")).status, "valid");
  assert.equal(parseProbePaths(Array.from({ length: 501 }, (_, index) => `p${index}`).join("\n")).status, "invalid");
  assert.equal(parseProbePaths(Array.from({ length: 64 }, () => "a").join("/")).status, "valid");
  assert.equal(parseProbePaths(Array.from({ length: 65 }, () => "a").join("/")).status, "invalid");
  const exactBytes = [...Array.from({ length: 63 }, () => "a".repeat(1_024)), "a".repeat(961)].join("\n");
  assert.equal(new TextEncoder().encode(exactBytes).byteLength, 65_536);
  assert.equal(parseIgnoreRules(exactBytes).status, "valid");
  assert.equal(parseIgnoreRules(`${exactBytes}a`).status, "invalid");
  assert.equal(parseProbePaths(exactBytes).status, "valid");
  assert.equal(parseProbePaths(`${exactBytes}a`).status, "invalid");
});

test("keeps duplicates as path lines and copies only result fields", () => {
  const result = valid("*.log\nrule\tthat-never-matches", "debug.log\n./debug.log\nsrc/index.ts\nsrc//index.ts", "dockerfile-specific");
  assert.deepEqual(result.counts, { excluded: 2, included: 2, total: 4 });
  assert.deepEqual(result.rows.map((row) => row.normalizedPath), ["debug.log", "debug.log", "src/index.ts", "src/index.ts"]);
  const copy = buildDockerignoreCopySummary(result);
  assert.match(copy, /schema\t1/);
  assert.match(copy, /source\tdockerfile-specific/);
  assert.match(copy, /excluded\t2/);
  assert.match(copy, /debug\.log\tdebug\.log\tExcluded\tline 1/);
  assert.doesNotMatch(copy, /that-never-matches/);
});

test("marks builder control files without changing truth", () => {
  const result = valid("**", "Dockerfile\n.dockerignore\nlint.Dockerfile.dockerignore\nsrc/Dockerfile.txt");
  assert.ok(result.rows.every((row) => row.verdict === "Excluded"));
  assert.deepEqual(result.rows.map((row) => row.builderControlFile), [true, true, true, false]);
});

test("maximum accepted input is deterministic and synchronous", () => {
  const rules = Array.from({ length: 200 }, () => "a/**").join("\n");
  const shared = ["a", ...Array.from({ length: 62 }, () => "x")];
  const paths = Array.from({ length: 500 }, (_, index) => [...shared, index.toString(36)].join("/")).join("\n");
  assert.ok(new TextEncoder().encode(paths).byteLength <= 65_536);
  const first = evaluateDockerignore({ rules, paths, sourceMode: "root" });
  assert.equal(first.status, "valid");
  const samples = [];
  for (let index = 0; index < 20; index += 1) {
    const started = performance.now();
    const next = evaluateDockerignore({ rules, paths, sourceMode: "root" });
    const elapsed = performance.now() - started;
    assert.deepEqual(next, first);
    samples.push(elapsed);
  }
  samples.sort((a, b) => a - b);
  assert.ok(samples[18] <= 150, `p95 ${samples[18].toFixed(2)}ms`);
});
