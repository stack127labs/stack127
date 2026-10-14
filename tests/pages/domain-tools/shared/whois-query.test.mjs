import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDomainInput, DomainInputError } from "../../../../lib/domain/public-suffix.ts";
import { whoisQueryFor } from "../../../../lib/domain/whois-query.ts";
import { readWhois } from "../../../../lib/domain/whois-transport.ts";

test("ASCII and mapped fullwidth hyphens cannot produce option-shaped WHOIS domains", () => {
  for (const input of ["-x.eu", "－x.eu", "x-.eu", "x－.eu"]) {
    assert.throws(() => normalizeDomainInput(input), error => error instanceof DomainInputError && error.code === "invalid_name", input);
  }
});

test("outbound WHOIS label validation runs before decoration or any socket", async () => {
  let sockets = 0;
  const profile = { queryPrefix: "-T dn ", querySuffix: "/e" };
  for (const domain of ["-x.eu", "x-.eu", "example..eu", "a_b.eu", "a/b.eu", "a\r\n.eu", "é.eu", "example.eu.", "a".repeat(64) + ".eu", "xn--.eu"]) {
    await assert.rejects(async () => readWhois("whois.example.test", whoisQueryFor(domain, profile), {}, () => { sockets += 1; assert.fail("must not connect"); }), DomainInputError, domain);
  }
  assert.equal(sockets, 0);
  assert.equal(whoisQueryFor("a-b.eu", profile), "-T dn a-b.eu/e");
  const idn = normalizeDomainInput("bücher.eu");
  assert.equal(whoisQueryFor(idn.domain, { querySuffix: "/e" }), "xn--bcher-kva.eu/e");
});
