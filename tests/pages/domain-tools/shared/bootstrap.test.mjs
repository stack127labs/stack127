import { test } from "node:test";
import assert from "node:assert/strict";
import { coverageSummary, rdapServiceForTld, overrideEntries, allRootZoneTlds } from "../../../../lib/domain/bootstrap.ts";

test("resolves a bootstrapped TLD", () => {
  const com = rdapServiceForTld("com");
  assert.equal(com.source, "bootstrap");
  assert.ok(com.url?.startsWith("https://"));
  assert.ok(com.url?.endsWith("/"), "the base URL must end in a slash so joining is predictable");
});

test("resolves an overridden TLD and names who runs it", () => {
  const io = rdapServiceForTld("io");
  assert.equal(io.source, "override");
  assert.equal(io.operator, "Identity Digital");
});

test("reports no service rather than guessing", () => {
  const aq = rdapServiceForTld("aq");
  assert.equal(aq.source, "none");
  assert.equal(aq.url, null);
});

test("accepts a leading dot and mixed case", () => {
  assert.equal(rdapServiceForTld(".COM").source, "bootstrap");
});

test("flags an ending that is not in the root zone", () => {
  assert.equal(rdapServiceForTld("notarealtldxyz").unknownTld, true);
  assert.equal(rdapServiceForTld("com").unknownTld, false);
});

test("coverage is derived from the data, not hardcoded", () => {
  const summary = coverageSummary();
  assert.equal(summary.covered + summary.uncovered, summary.rootZoneTlds);
  assert.equal(summary.covered, summary.bootstrapCovered + summary.overrideCovered + summary.whoisCovered);
  assert.equal(summary.rootZoneTlds, allRootZoneTlds().length);
  assert.ok(summary.overrideCovered >= 1, "at least one override should count toward coverage");
  assert.match(summary.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
});

test("WHOIS coverage enables only reviewed services and exposes the transport host", () => {
  const eu = rdapServiceForTld("eu");
  assert.equal(eu.source, "whois");
  assert.equal(eu.host, "whois.eu");
  assert.equal(eu.url, "whois://whois.eu/");
  assert.equal(rdapServiceForTld("co").source, "override");
  const counts = { bootstrap: 0, override: 0, whois: 0, none: 0 };
  for (const tld of allRootZoneTlds()) counts[rdapServiceForTld(tld).source] += 1;
  const summary = coverageSummary();
  assert.equal(summary.bootstrapCovered, counts.bootstrap);
  assert.equal(summary.overrideCovered, counts.override);
  assert.equal(summary.whoisCovered, counts.whois);
  assert.equal(summary.uncovered, counts.none);
});

test("every override records how it was verified", () => {
  for (const entry of overrideEntries()) {
    assert.ok(entry.url.startsWith("https://"), `${entry.tld} needs an https URL`);
    assert.ok(entry.operator, `${entry.tld} needs a named operator`);
    assert.ok(entry.verifiedWith, `${entry.tld} needs a domain it was verified against`);
    assert.match(entry.verifiedAt, /^\d{4}-\d{2}-\d{2}$/, `${entry.tld} needs a verification date`);
  }
});
