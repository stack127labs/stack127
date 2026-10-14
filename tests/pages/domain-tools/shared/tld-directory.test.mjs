import { test } from "node:test";
import assert from "node:assert/strict";
import directory from "../../../../lib/domain/data/tld-directory.json" with { type: "json" };
import { allRootZoneTlds, coverageSummary } from "../../../../lib/domain/bootstrap.ts";

test("covers every ending in the root zone", () => {
  assert.equal(directory.rows.length, allRootZoneTlds().length);
  assert.equal(directory.counts.total, directory.rows.length);
});

test("every row has a type", () => {
  // Right-to-left endings are the trap here: IANA wraps their displayed name in
  // bidi control marks, so matching on visible text silently loses 34 of them.
  const missing = directory.rows.filter((row) => !row.type);
  assert.deepEqual(missing.map((row) => row.tld), [], "every ending should carry a type from IANA");
  assert.equal(directory.counts.missingType, 0);
});

test("internationalised endings keep both forms", () => {
  const idn = directory.rows.filter((row) => row.isIdn);
  assert.ok(idn.length > 100, "the root zone has plenty of IDN endings");
  for (const row of idn) {
    assert.ok(row.tld.startsWith("xn--"), `${row.tld} should be an A-label`);
  }
  const china = directory.rows.find((row) => row.tld === "xn--fiqs8s");
  assert.equal(china?.unicode, "中国");
});

test("bidi control characters are stripped from displayed names", () => {
  const israel = directory.rows.find((row) => row.tld === "xn--4dbrk0ce");
  assert.ok(israel?.unicode, "a right-to-left ending should still have a readable name");
  assert.doesNotMatch(israel.unicode, /[‎‏‪-‮⁦-⁩]/, "no bidi marks should survive");
  assert.doesNotMatch(israel.unicode, /&#/, "no raw HTML entities should survive");
});

test("coverage agrees with the bootstrap", () => {
  const summary = coverageSummary();
  assert.equal(directory.counts.rdapCovered, summary.bootstrapCovered + summary.overrideCovered);
  assert.equal(directory.counts.whoisCovered, summary.whoisCovered);
  assert.equal(directory.counts.lookupCovered, summary.covered);
  assert.equal(directory.counts.uncovered, summary.uncovered);
  assert.equal(directory.rows.filter(row => row.lookupSource === "whois").length, summary.whoisCovered);
  const io = directory.rows.find((row) => row.tld === "io");
  assert.equal(io?.rdap, "override");
  assert.equal(io?.rdapOperator, "Identity Digital");
});

test("DNSSEC is measured, not assumed", () => {
  assert.ok(directory.counts.signed > 1000, "most endings are signed today");
  assert.ok(directory.counts.signed < directory.counts.total, "and some are not");
  assert.equal(directory.rows.find((row) => row.tld === "com")?.dnssec, true);
});

test("records its sources and when it ran", () => {
  assert.match(directory.fetchedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(directory.sources.rootDb.startsWith("https://"));
  assert.ok(directory.sources.rootZone.startsWith("https://"));
  assert.ok(directory.tldListVersion);
});
