import { test } from "node:test";
import assert from "node:assert/strict";
import { publicSuffix, normalizeDomainInput, DomainInputError } from "../../../../lib/domain/public-suffix.ts";

test("finds the registrable domain under a multi label suffix", () => {
  assert.equal(publicSuffix("www.example.co.uk").registrableDomain, "example.co.uk");
  assert.equal(publicSuffix("a.b.c.example.com").registrableDomain, "example.com");
  assert.equal(publicSuffix("test.k12.ak.us").registrableDomain, "test.k12.ak.us");
});

test("applies wildcard and exception rules", () => {
  // *.ck makes any single label under .ck a suffix.
  assert.equal(publicSuffix("foo.bar.ck").registrableDomain, "foo.bar.ck");
  // !www.ck is an exception, so www.ck is itself registrable.
  assert.equal(publicSuffix("www.ck").registrableDomain, "www.ck");
  // *.sch.uk means bar.sch.uk is the suffix, not sch.uk.
  assert.equal(publicSuffix("foo.bar.sch.uk").suffix, "bar.sch.uk");
});

test("uses the ICANN section only", () => {
  // github.io is a PRIVATE rule. Including it would make myproject.github.io
  // reduce to itself, so we would ask a registry about a name that has no
  // registration. This is a deliberate choice, not an oversight.
  assert.equal(publicSuffix("myproject.github.io").registrableDomain, "github.io");
  assert.equal(publicSuffix("example.uk.com").registrableDomain, "uk.com");
});

test("rejects a name with an empty label", () => {
  assert.equal(publicSuffix(".example.com").registrableDomain, null);
  assert.equal(publicSuffix("a..com").registrableDomain, null);
});

test("a public suffix on its own is not registrable", () => {
  assert.equal(publicSuffix("co.uk").registrableDomain, null);
  assert.equal(publicSuffix("com").registrableDomain, null);
});

test("an unknown ending falls back and says it guessed", () => {
  const result = publicSuffix("thing.notarealtldxyz");
  assert.equal(result.guessed, true);
  assert.equal(result.registrableDomain, "thing.notarealtldxyz");
});

test("normalizes the shapes people actually paste", () => {
  assert.equal(normalizeDomainInput("https://www.example.co.uk/a/b?c=1").domain, "example.co.uk");
  assert.equal(normalizeDomainInput("  Example.COM  ").domain, "example.com");
  assert.equal(normalizeDomainInput("example.com:8443").domain, "example.com");
  assert.equal(normalizeDomainInput("example.com.").domain, "example.com");
  assert.equal(normalizeDomainInput("user@example.com").domain, "example.com");
});

test("converts an IDN and keeps both forms", () => {
  const result = normalizeDomainInput("münchen.de");
  assert.equal(result.domain, "xn--mnchen-3ya.de");
  assert.equal(result.unicode, "münchen.de");
  assert.equal(result.isIdn, true);
});

test("reports when it shortened the input", () => {
  assert.equal(normalizeDomainInput("www.example.com").reduced, true);
  assert.equal(normalizeDomainInput("example.com").reduced, false);
});

test("gives a clear reason for every rejection", () => {
  const cases = [
    ["", "empty"],
    ["localhost", "no_tld"],
    ["1.1.1.1", "ip_address"],
    ["2001:db8::1", "ip_address"],
    ["co.uk", "suffix_only"],
    ["bad_name.com", "invalid_name"],
  ];
  for (const [input, code] of cases) {
    assert.throws(
      () => normalizeDomainInput(input),
      (error) => error instanceof DomainInputError && error.code === code,
      `${JSON.stringify(input)} should fail with ${code}`,
    );
  }
});
