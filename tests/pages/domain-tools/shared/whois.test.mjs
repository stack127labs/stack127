import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseWhoisResponse, parseWhoisDate } from "../../../../lib/domain/whois-parser.ts";
import { buildRegistration } from "../../../../lib/domain/normalize.ts";
import { parseIanaDomain, parseIanaWhoisServer } from "../../../../scripts/domain-tools/iana-whois.mjs";

const services = {
  it: { parser: "blocks", notFoundPattern: "^Status:[\\t ]*AVAILABLE[\\t ]*\\r?$" },
  eu: { parser: "blocks", notFoundPattern: "^Status:[\\t ]*AVAILABLE[\\t ]*\\r?$" },
  jp: { parser: "bracket", notFoundPattern: "^No match!![\\t ]*\\r?$" },
  se: { parser: "key-value", notFoundPattern: '^domain "{domain}" not found\\.[\\t ]*\\r?$' },
  gg: { parser: "blocks", notFoundPattern: "^NOT FOUND[\\t ]*\\r?$" },
  ws: { parser: "key-value", notFoundPattern: "^The queried object does not exist: {domain}\\.[\\t ]*\\r?$" },
};
async function fixture(tld) { return readFile(new URL(`./fixtures/whois/${tld}.txt`, import.meta.url), "utf8"); }
function normalized(tld, domain, text) {
  const parsed = parseWhoisResponse(text, domain, { server: `whois.${tld}`, ...services[tld] });
  return buildRegistration({
    query: { input: domain, domain, unicode: domain, tld, suffix: tld, reduced: false, isIdn: false, guessedSuffix: false },
    coverage: { source: "whois", operator: null, url: `whois://whois.${tld}/`, host: `whois.${tld}`, unknownTld: false },
    registry: { ...parsed, protocol: "whois", source: "registry", httpStatus: null, fetchedAt: "2026-10-14T00:00:00Z", fromCache: false, url: `whois://whois.${tld}/${domain}` },
    registrar: null, startedAt: Date.now(),
  });
}

test("Italian blocks keep domain dates separate from contacts and parse registrar and DNSSEC", async () => {
  const text = (await fixture("it")).replace("\nRegistrar\n", "\nRegistrant\n  Created: 2018-03-02 19:04:02\n\nRegistrar\n");
  const result = normalized("it", "google.it", text);
  assert.equal(result.status, "registered");
  assert.equal(result.registrationDate, "1999-12-10");
  assert.equal(result.registryExpiryDate, "2027-04-21");
  assert.equal(result.lastChangedDate, "2026-06-09");
  assert.equal(result.registrar.name, "MarkMonitor International Limited");
  assert.equal(result.dnssecSigned, false);
  assert.equal(result.nameservers.length, 2);
});

test("EU blocks publish nameservers and registrar, while dates and DNSSEC remain unknown", async () => {
  const result = normalized("eu", "europa.eu", await fixture("eu"));
  assert.equal(result.status, "registered");
  assert.equal(result.registrar.name, "ClearMedia NV");
  assert.equal(result.nameservers[1].hostname, "ns1bru.europa.eu");
  assert.equal(result.nameservers[3].hostname, "ns4az1.europa.eu");
  assert.equal(result.registrationDate, null);
  assert.equal(result.registryExpiryDate, null);
  assert.equal(result.dnssecSigned, null);
  assert.equal(result.registrarFetch, null);
});

test("Japanese bracket fields keep local dates and never invent EPP codes from lock text", async () => {
  const result = normalized("jp", "google.jp", await fixture("jp"));
  assert.equal(result.registrationDate, "2005-05-30");
  assert.equal(result.registryExpiryDate, "2027-05-31");
  assert.equal(result.lastChangedDate, "2026-06-01");
  assert.deepEqual(result.statuses, []);
  assert.equal(result.registrar.name, null);
});

test("Swedish key-value fields map only exact EPP tokens", async () => {
  const result = normalized("se", "google.se", await fixture("se"));
  assert.equal(result.registrationDate, "2003-08-27");
  assert.equal(result.lastChangedDate, "2026-09-18");
  assert.equal(result.registryExpiryDate, "2027-10-20");
  assert.equal(result.dnssecSigned, false);
  assert.deepEqual(result.statuses.map(s => s.epp), ["serverUpdateProhibited", "serverDeleteProhibited", "serverTransferProhibited"]);
});

test("Channel Islands prose gives a registration date, never a made-up yearly expiry or lock code", async () => {
  const result = normalized("gg", "google.gg", await fixture("gg"));
  assert.equal(result.status, "registered");
  assert.equal(result.registrationDate, "2003-04-30");
  assert.equal(result.registrar.name, "MarkMonitor Inc. (http://www.markmonitor.com)");
  assert.equal(result.registryExpiryDate, null);
  assert.deepEqual(result.statuses, []);
});

test("registrar expiry stays distinct from registry expiry in WHOIS", async () => {
  const result = normalized("ws", "google.ws", await fixture("ws"));
  assert.equal(result.registryExpiryDate, null);
  assert.equal(result.registrarExpiryDate, "2027-03-04T00:00:26.000Z");
  assert.equal(result.registrar.ianaId, "292");
});

test("only verified not-found patterns decide availability", () => {
  for (const [tld, text] of [["it", "Domain: missing.it\nStatus: AVAILABLE\n"], ["eu", "Domain: missing.eu\nStatus: AVAILABLE\n"], ["jp", "No match!!\r\n"], ["gg", "NOT FOUND\r\n"], ["se", 'domain "missing.se" not found.\n']]) {
    assert.equal(parseWhoisResponse(text, `missing.${tld}`, services[tld]).status, "not_registered");
  }
  for (const text of ["", "Domain: missing.it\n", "No match!!\n", "Domain: other.it\nRegistrar: Example\n", "Domain: other.it\nStatus: AVAILABLE\n", "Status: RESERVED\n", "Domain is blocked\n", "WHOIS temporarily unavailable\n"]) {
    assert.equal(parseWhoisResponse(text, "missing.it", services.it).status, "registry_error", text);
  }
});

test("quota, blocks and conflicting responses are non-answers, even with domain echoes", () => {
  for (const text of ["Domain: missing.it\nStatus: AVAILABLE\nQuota exceeded\n", "Too many requests", "WHOIS LIMIT EXCEEDED", "Rate limited\n"]) {
    assert.equal(parseWhoisResponse(text, "missing.it", services.it).status, "rate_limited");
  }
  assert.equal(parseWhoisResponse("Requests of this client are not permitted.", "missing.it", services.it).status, "blocked");
  assert.equal(parseWhoisResponse("Domain: missing.it\nStatus: AVAILABLE\nName Server: ns.example.com", "missing.it", services.it).status, "registry_error");
  assert.equal(parseWhoisResponse("Domain: missing.it\nStatus: Reserved by the registry\nRegistrar: Example\nName Server: ns.example.com", "missing.it", services.it).status, "registry_error");
});

test("a rate-limit policy in a footer is not an actual throttle", () => {
  const text = "Domain: example.ws\nRegistrar: Example\n\nAccess to the whois service is rate limited. For more information, please see our policy.\n";
  assert.equal(parseWhoisResponse(text, "example.ws", services.ws).status, "registered");
  const terms = "Terms of Use: If too many queries are received from a single IP address within a specified time, the service will begin to reject further queries.";
  assert.equal(parseWhoisResponse(text + terms, "example.ws", services.ws).status, "registered");
  const copyrighted = "Domain: missing.eu\nStatus: AVAILABLE\n\nAll rights\nreserved.\n";
  assert.equal(parseWhoisResponse(copyrighted, "missing.eu", services.eu).status, "not_registered");
});

test("dates preserve precision, validate calendars and leave ambiguous forms unknown", () => {
  assert.equal(parseWhoisDate("2026-02-30"), null);
  assert.equal(parseWhoisDate("2026-02-30T00:00:00Z"), null);
  assert.equal(parseWhoisDate("2026-10-14 02:00:00"), "2026-10-14");
  assert.equal(parseWhoisDate("02/03/2026"), null);
  assert.equal(parseWhoisDate("02/03/2026", "dmy"), "2026-03-02");
  assert.equal(parseWhoisDate("Tue Dec 12 2000"), "2000-12-12");
  assert.equal(parseWhoisDate("20001204 20:03:13"), "2000-12-04");
  assert.equal(parseWhoisDate("2026-10-14T06:00:00+0100"), "2026-10-14T05:00:00.000Z");
});

test("IANA empty whois lines never eat the next status line", () => {
  for (const text of ["whois:        \nstatus: ACTIVE\n", "whois:\r\nstatus: ACTIVE\r\n", "status: ACTIVE\n"]) assert.equal(parseIanaWhoisServer(text), null);
  assert.equal(parseIanaWhoisServer("whois: WHOIS.NIC.IT\r\nstatus: ACTIVE\r\n"), "whois.nic.it");
  assert.equal(parseIanaWhoisServer("whois: status:\n"), null);
  assert.equal(parseIanaDomain("domain: 中国\ndomain-ace: XN--FIQS8S\n"), "xn--fiqs8s");
});
