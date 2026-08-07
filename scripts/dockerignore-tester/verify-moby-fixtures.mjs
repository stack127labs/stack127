import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  MOBY_PATTERNMATCHER_COMMIT,
  MOBY_PATTERNMATCHER_VERSION,
  evaluateDockerignore,
} from "../../lib/dockerignore/evaluate.ts";

const upstreamSourceSha256 = "28b52905be3e5b7bb2a5a62bd572e17004bd7739984cba98d3b9b5cac11a4154";
const fixtureUrl = new URL("../../tests/pages/dockerignore-tester/fixtures/moby-v0.6.1.json", import.meta.url);

const testMatches = [
  ["**", "file", true], ["**/", "file", true], ["**", "dir/file", true],
  ["**/**", "dir/file", true], ["dir/**", "dir/file", true], ["dir/**", "dir/dir2/file", true],
  ["**/dir", "dir", true], ["**/dir", "dir/file", true], ["**/dir2/*", "dir/dir2/file", true],
  ["**/dir2/**", "dir/dir2/dir3/file", true], ["**file", "file", true], ["**file", "dir/file", true],
  ["**/file", "dir/file", true], ["**file", "dir/dir/file", true], ["**/file", "dir/dir/file", true],
  ["**/file*", "dir/dir/file", true], ["**/file*", "dir/dir/file.txt", true], ["**/file*txt", "dir/dir/file.txt", true],
  ["**/file*.txt", "dir/dir/file.txt", true], ["**/file*.txt*", "dir/dir/file.txt", true],
  ["**/**/*.txt", "dir/dir/file.txt", true], ["**/**/*.txt2", "dir/dir/file.txt", false],
  ["**/*.txt", "file.txt", true], ["**/**/*.txt", "file.txt", true], ["a**/*.txt", "a/file.txt", true],
  ["a**/*.txt", "a/dir/file.txt", true], ["a**/*.txt", "a/dir/dir/file.txt", true],
  ["a/*.txt", "a/dir/file.txt", false], ["a/*.txt", "a/file.txt", true], ["a/*.txt**", "a/file.txt", true],
  ["a[b-d]e", "ae", false], ["a[b-d]e", "ace", true], ["a[b-d]e", "aae", false],
  ["a[^b-d]e", "aze", true], [".*", ".foo", true], [".*", "foo", false],
  ["abc.def", "abcdef", false], ["abc.def", "abc.def", true], ["abc.def", "abcZdef", false],
  ["abc?def", "abcZdef", true], ["abc?def", "abcdef", false], ["**/foo/bar", "foo/bar", true],
  ["**/foo/bar", "dir/foo/bar", true], ["**/foo/bar", "dir/dir2/foo/bar", true], ["abc/**", "abc", false],
  ["abc/**", "abc/def", true], ["abc/**", "abc/def/ghi", true], ["**/.foo", ".foo", true],
  ["**/.foo", "bar.foo", false], ["a(b)c/def", "a(b)c/def", true], ["a(b)c/def", "a(b)c/xyz", false],
  ["a.|)$(}+{bc", "a.|)$(}+{bc", true],
  ["dist/proxy.py-2.4.0rc3.dev36+g08acad9-py3-none-any.whl", "dist/proxy.py-2.4.0rc3.dev36+g08acad9-py3-none-any.whl", true],
  ["dist/*.whl", "dist/proxy.py-2.4.0rc3.dev36+g08acad9-py3-none-any.whl", true],
  ["a\\*b", "a*b", true],
];

const goMatchTests = [
  ["abc", "abc", true, null], ["*", "abc", true, null], ["*c", "abc", true, null],
  ["a*", "a", true, null], ["a*", "abc", true, null], ["a*", "ab/c", true, null],
  ["a*/b", "abc/b", true, null], ["a*/b", "a/c/b", false, null],
  ["a*b*c*d*e*/f", "axbxcxdxe/f", true, null], ["a*b*c*d*e*/f", "axbxcxdxexxx/f", true, null],
  ["a*b*c*d*e*/f", "axbxcxdxe/xxx/f", false, null], ["a*b*c*d*e*/f", "axbxcxdxexxx/fff", false, null],
  ["a*b?c*x", "abxbbxdbxebxczzx", true, null], ["a*b?c*x", "abxbbxdbxebxczzy", false, null],
  ["ab[c]", "abc", true, null], ["ab[b-d]", "abc", true, null], ["ab[e-g]", "abc", false, null],
  ["ab[^c]", "abc", false, null], ["ab[^b-d]", "abc", false, null], ["ab[^e-g]", "abc", true, null],
  ["a\\*b", "a*b", true, null], ["a\\*b", "ab", false, null], ["a?b", "a☺b", true, null],
  ["a[^a]b", "a☺b", true, null], ["a???b", "a☺b", false, null], ["a[^a][^a][^a]b", "a☺b", false, null],
  ["[a-ζ]*", "α", true, null], ["*[a-ζ]", "A", false, null], ["a?b", "a/b", false, null],
  ["a*b", "a/b", false, null], ["[\\]a]", "]", true, null], ["[\\-]", "-", true, null],
  ["[x\\-]", "x", true, null], ["[x\\-]", "-", true, null], ["[x\\-]", "z", false, null],
  ["[\\-x]", "x", true, null], ["[\\-x]", "-", true, null], ["[\\-x]", "a", false, null],
  ["[]a]", "]", false, "bad-pattern"], ["[-]", "-", false, "bad-pattern"],
  ["[x-]", "x", false, "bad-pattern"], ["[-x]", "x", false, "bad-pattern"],
  ["\\", "a", false, "bad-pattern"], ["[a-b-c]", "a", false, "bad-pattern"],
  ["[", "a", false, "bad-pattern"], ["[^", "a", false, "bad-pattern"],
  ["[^bc", "a", false, "bad-pattern"], ["a[", "a", false, "bad-pattern"],
  ["a[", "ab", false, "bad-pattern"], ["*x", "xxx", true, null],
];

const multiPatternTests = [
  [["**", "!util/docker/web"], "util/docker/web/foo", false],
  [["**", "!util/docker/web", "util/docker/web/foo"], "util/docker/web/foo", true],
  [["**", "!dist/proxy.py-2.4.0rc3.dev36+g08acad9-py3-none-any.whl"], "dist/proxy.py-2.4.0rc3.dev36+g08acad9-py3-none-any.whl", false],
  [["**", "!dist/*.whl"], "dist/proxy.py-2.4.0rc3.dev36+g08acad9-py3-none-any.whl", false],
];

function upstreamCase(id, upstreamTestName, patterns, path, expectedIgnored, error = null) {
  return {
    id,
    sourceKind: "moby-upstream",
    tag: MOBY_PATTERNMATCHER_VERSION,
    commit: MOBY_PATTERNMATCHER_COMMIT,
    sourceFile: "patternmatcher_test.go",
    upstreamTestName,
    sourceSha256: upstreamSourceSha256,
    platform: "linux",
    patterns,
    path,
    expectedIgnored,
    error,
  };
}

const cases = [
  ...testMatches.map(([pattern, path, expected], index) => upstreamCase(`moby-matches-${String(index + 1).padStart(3, "0")}`, "TestMatches", [pattern], path, expected)),
  ...goMatchTests.map(([pattern, path, expected, error], index) => upstreamCase(`moby-match-${String(index + 1).padStart(3, "0")}`, "TestMatch", [pattern], path, expected, error)),
  ...multiPatternTests.map(([patterns, path, expected], index) => upstreamCase(`moby-multi-${String(index + 1).padStart(3, "0")}`, "TestMatches", patterns, path, expected)),
  upstreamCase("moby-single-exclamation", "TestSingleExclamationError", ["!"], "fileutils.go", false, "bad-pattern"),
  upstreamCase("moby-malformed-repeat", "TestMatchesOrParentMatchesMalformedPatternDoesNotPanicOnRepeatedCall", ["[Local-Only]/"], "x", false, "bad-pattern"),
];

const corpus = {
  schema: 1,
  tag: MOBY_PATTERNMATCHER_VERSION,
  commit: MOBY_PATTERNMATCHER_COMMIT,
  sourceUrl: "https://github.com/moby/patternmatcher/blob/v0.6.1/patternmatcher_test.go",
  sourceSha256: upstreamSourceSha256,
  cases,
};

if (process.argv.includes("--write")) {
  writeFileSync(fixtureUrl, `${JSON.stringify(corpus, null, 2)}\n`);
  console.log(`Wrote ${cases.length} pinned matcher fixtures.`);
  process.exit(0);
}

const fixture = JSON.parse(readFileSync(fixtureUrl, "utf8"));
assert.deepEqual(fixture, corpus, "fixture differs from its pinned generator");
for (const candidate of fixture.cases) {
  const result = evaluateDockerignore({ rules: candidate.patterns.join("\n"), paths: candidate.path, sourceMode: "root" });
  if (candidate.error) assert.equal(result.status, "invalid", candidate.id);
  else {
    assert.equal(result.status, "valid", candidate.id);
    assert.equal(result.rows[0].ignored, candidate.expectedIgnored, candidate.id);
  }
}
console.log(`Verified ${fixture.cases.length} Moby v0.6.1 fixtures.`);
