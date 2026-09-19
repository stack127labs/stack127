import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_RSYNC_INPUT,
  formatRsyncResult,
  testRsyncFilters,
} from "../../../lib/rsync-filter-tester/engine.ts";

function input(overrides = {}) {
  return { ...DEFAULT_RSYNC_INPUT, ...overrides };
}

test("RF-001 uses the first matching rule", () => {
  const result = testRsyncFilters(input({
    rules: "- *.log\n+ keep.log",
    paths: "keep.log\nreadme.md",
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.rows.find((row) => row.path === "keep.log").state, "excluded");
  assert.equal(result.values.rows.find((row) => row.path === "keep.log").matchingRule.line, 1);
  assert.match(formatRsyncResult(result), /keep\.log/);
});

test("RF-002 makes star slash-aware and double-star recursive", () => {
  const result = testRsyncFilters(input({
    rules: "+ **/*.conf\n- *.tmp",
    paths: "etc/app.conf\napp.conf\nlogs/a.tmp",
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.rows.find((row) => row.path === "etc/app.conf").state, "included");
  assert.equal(result.values.rows.find((row) => row.path === "app.conf").state, "included");
  assert.equal(result.values.rows.find((row) => row.path === "logs/a.tmp").state, "excluded");
});

test("RF-003 reports a child as unvisited when its parent is excluded", () => {
  const result = testRsyncFilters(input({
    rules: "- cache/\n+ cache/keep.txt",
    paths: "cache/\ncache/keep.txt",
  }));
  assert.equal(result.status, "valid");
  const child = result.values.rows.find((row) => row.path === "cache/keep.txt");
  assert.equal(child.state, "unvisited");
  assert.match(child.note, /cache\//);
});

test("reset rules discard earlier rules", () => {
  const result = testRsyncFilters(input({ rules: "- *.tmp\n!\n+ keep.tmp", paths: "keep.tmp\nother.tmp" }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.rows.find((row) => row.path === "keep.tmp").state, "included");
  assert.equal(result.values.rows.find((row) => row.path === "other.tmp").state, "included");
});

test("rejects malformed rules, absolute paths, and duplicate paths", () => {
  for (const candidate of [
    input({ rules: "", paths: "a" }),
    input({ rules: "logs/**", paths: "a" }),
    input({ rules: "+ a", paths: "/absolute" }),
    input({ rules: "+ a", paths: "a\na" }),
  ]) assert.equal(testRsyncFilters(candidate).status, "invalid");
});

test("resolves every ancestor with the first matching rule", () => {
  const includeFirst = testRsyncFilters(input({
    rules: "+ cache/\n- cache/",
    paths: "cache/\ncache/keep.txt",
  }));
  assert.equal(includeFirst.status, "valid");
  assert.equal(includeFirst.values.rows.find((row) => row.path === "cache/keep.txt").state, "included");

  const normalTraversal = testRsyncFilters(input({
    rules: "+ */\n+ *.txt\n- *",
    paths: "src/\nsrc/readme.txt",
  }));
  assert.equal(normalTraversal.values.rows.find((row) => row.path === "src/readme.txt").state, "included");
});

test("distinguishes directory-only patterns from ordinary basename patterns", () => {
  const directoryOnly = testRsyncFilters(input({ rules: "- cache/", paths: "cache" }));
  assert.equal(directoryOnly.status, "valid");
  assert.equal(directoryOnly.values.rows[0].state, "included");

  const basename = testRsyncFilters(input({ rules: "- cache", paths: "cache/\ncache/keep.txt" }));
  assert.equal(basename.status, "valid");
  assert.equal(basename.values.rows[0].state, "excluded");
  assert.equal(basename.values.rows[1].state, "unvisited");
});

test("does not visit a child whose unmatched parent uses the exclude default", () => {
  const result = testRsyncFilters(input({
    rules: "+ src/readme.txt",
    paths: "src/\nsrc/readme.txt",
    unmatched: "exclude",
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.rows.find((row) => row.path === "src/readme.txt").state, "unvisited");
});

test("rejects unsupported modifiers and character classes", () => {
  for (const rules of ["-p *.log", "- [!a].txt", "- [z-a]"]) {
    const result = testRsyncFilters(input({ rules, paths: "a.txt" }));
    assert.equal(result.status, "invalid");
    assert.match(result.issues.join(" "), /not supported/);
  }
});

test("handles the documented 1000 by 1000 input bound without blocking work", () => {
  const candidate = input({
    rules: Array.from({ length: 1000 }, (_, index) => `- excluded-${index}`).join("\n"),
    paths: Array.from({ length: 1000 }, (_, index) => `folder/file-${index}`).join("\n"),
  });
  const started = performance.now();
  const result = testRsyncFilters(candidate);
  const elapsed = performance.now() - started;
  assert.equal(result.status, "valid");
  assert.ok(elapsed < 1000, `Expected under 1000ms, got ${Math.round(elapsed)}ms`);
});
