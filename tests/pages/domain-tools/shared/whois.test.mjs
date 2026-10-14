import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseWhoisResponse, parseWhoisDate } from "../../../../lib/domain/whois-parser.ts";
import { buildRegistration } from "../../../../lib/domain/normalize.ts";
import { parseIanaDomain, parseIanaWhoisServer } from "../../../../scripts/domain-tools/iana-whois.mjs";
import { assessTransfer } from "../../../../lib/domain/transfer-readiness.ts";
import reviewed from "../../../../lib/domain/data/whois-reviewed.json" with { type: "json" };

const services = {
  it: { parser: "blocks", notFoundPattern: "^Status:[\\t ]*AVAILABLE[\\t ]*\\r?$" },
  eu: { parser: "blocks", notFoundPattern: "^Status:[\\t ]*AVAILABLE[\\t ]*\\r?$" },
  jp: { parser: "bracket", notFoundPattern: "^No match!![\\t ]*\\r?$" },
  se: { parser: "key-value", notFoundPattern: '^domain "{domain}" not found\\.[\\t ]*\\r?$' },
  gg: { parser: "blocks", notFoundPattern: "^NOT FOUND[\\t ]*\\r?$" },
  ws: { parser: "key-value", notFoundPattern: "^The queried object does not exist: {domain}\\.[\\t ]*\\r?$" },
  sk: reviewed.services.sk,
};
async function fixture(tld) { return readFile(new URL(`./fixtures/whois/${tld}.txt`, import.meta.url), "utf8"); }
function normalized(tld, domain, text, profile = {}) {
  const parsed = parseWhoisResponse(text, domain, { server: `whois.${tld}`, ...reviewed.services[tld], ...services[tld], ...profile });
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

test("maximum-query notices and long quota/error lines override verified availability", () => {
  const available = "Domain: example.it\nStatus: AVAILABLE\n";
  const notices = [
    "Maximum number of queries exceeded",
    "Maximum number of connections reached",
    "x".repeat(700) + " Quota exceeded",
    "Quota " + "x".repeat(700) + " exceeded",
    "x".repeat(700) + " Maximum number of queries exceeded",
    "ERROR: " + "x".repeat(700) + " lookup failed",
    "x".repeat(700) + " ERROR: registry problem",
    "WHOIS temporarily unavailable",
  ];
  for (const notice of notices) {
    const result = parseWhoisResponse(available + notice, "example.it", services.it);
    assert.ok(["rate_limited", "registry_error"].includes(result.status), notice);
    assert.equal(result.body, null);
  }
  const conditionalThenFailure = "Terms: If too many queries are received, access may stop. " + "x".repeat(700) + " Quota exceeded";
  assert.equal(parseWhoisResponse(available + conditionalThenFailure, "example.it", services.it).status, "rate_limited");
  assert.equal(parseWhoisResponse(available + "ERROR: request failed\nMaximum number of queries exceeded", "example.it", services.it).status, "rate_limited");
});

test("availability plus a contradictory status is a non-answer without any record facts", () => {
  for (const status of ["inactive / clientHold", "clientHold", "Registered", "locked", "we cannot confirm"]) {
    const result = parseWhoisResponse(`Domain: example.it\nStatus: AVAILABLE\nStatus: ${status}\n`, "example.it", services.it);
    assert.equal(result.status, "registry_error", status);
    assert.equal(result.body, null);
  }
});

test("privacy placeholders never become registrant identities or contact values", () => {
  for (const placeholder of ["hidden", "HIDDEN", "[hidden]", "redacted", "REDACTED FOR PRIVACY", "not disclosed", "NOT SHOWN!", "data protected", "private", "withheld", "non-public data"]) {
    const result = normalized("it", "example.it", `Domain: example.it\nStatus: ok\n\nRegistrant\n  Name: ${placeholder}\n  Organization: ${placeholder}\n  Phone: ${placeholder}\n`);
    assert.equal(result.status, "registered");
    assert.deepEqual(result.entities.filter(entity => entity.roles.includes("registrant")), [], placeholder);
  }
  const published = normalized("it", "example.it", "Domain: example.it\nStatus: ok\n\nRegistrant\n  Organization: Hidden Hands LLC\n");
  assert.equal(published.entities.find(entity => entity.roles.includes("registrant")).organization, "Hidden Hands LLC");
});

test("SK sections separate domain dates, registrant organization and registrar handles", async () => {
  const text = await fixture("sk");
  const result = normalized("sk", "google.sk", text);
  assert.equal(result.status, "registered");
  assert.equal(result.registrationDate, "2003-07-24");
  assert.equal(result.registryExpiryDate, "2027-07-24");
  assert.equal(result.lastChangedDate, "2026-06-22");
  assert.equal(result.registrar.name, "MarkMonitor International Limited");
  assert.equal(result.registrar.ianaId, null);
  assert.equal(result.registryFetch.body.whois.registrarHandle, "MARK-0292");
  assert.equal(result.entities.find(entity => entity.roles.includes("registrant")).organization, "Google Ireland Holdings Unlimited Company");
  const partial = normalized("sk", "google.sk", text.replace(/^Created: +2003-07-24\n/m, "").replace(/^Updated: +2026-06-22\n/m, ""));
  assert.equal(partial.registrationDate, null, "contact Created is not domain Created");
  assert.equal(partial.lastChangedDate, null, "contact Updated is not domain Updated");
});

test("other block and contact-reference formats cannot supply missing domain dates", () => {
  const blocks = "Domain: example.it\nStatus: ok\n\nRegistrant\n  Organization: Example LLC\n  Created: 2018-01-02\n\nAdmin Contact\n  Created: 2020-01-02\n\nRegistrar\n  Name: Example Registrar\n  Created: 2021-01-02\n  DNSSEC: yes\n\nName servers:\n  nserver: ns1.example.net\n  Changed: 2026-01-02\n";
  const result = normalized("it", "example.it", blocks);
  assert.equal(result.registrationDate, null);
  assert.equal(result.lastChangedDate, null);
  assert.equal(result.dnssecSigned, null, "registrar DNSSEC capability is not the domain's delegation state");
  const reference = "Domain: example.ls\nregistrar: REG-LS\n\ncontact: ADMIN-LSNIC\nCreated: 2018-01-02\nchanged: 2020-01-02\n\nnserver: ns1.example.net\ntech-c: TECH-LSNIC\nCreated: 2021-01-02\n";
  const ls = normalized("ls", "example.ls", reference, reviewed.services.ls);
  assert.equal(ls.status, "registered");
  assert.equal(ls.registrationDate, null);
  assert.equal(ls.lastChangedDate, null);
  assert.equal(ls.registrar.name, null);
  assert.equal(ls.registrar.ianaId, null);
  assert.equal(ls.registryFetch.body.whois.registrarHandle, "REG-LS");
});

test("WHOIS database dates cannot turn a not-found response into a registration", () => {
  const result = parseWhoisResponse("[Domain]\nDomain: missing.lv\nStatus: free\n\n[Whois]\nUpdated: 2026-10-14T00:00:00Z\n", "missing.lv", reviewed.services.lv);
  assert.equal(result.status, "not_registered");
});

test("a partial WHOIS EPP list cannot rule out transfer locks, while proven blockers survive", () => {
  const partial = normalized("it", "example.it", "Domain: example.it\nCreated: 2000-01-01\nstatus: clientUpdateProhibited\ntransfer status: locked\n");
  assert.equal(partial.status, "registered");
  assert.equal(partial.statuses[0].epp, "clientUpdateProhibited");
  assert.equal(partial.registryFetch.body.whois.statusesComplete, false);
  const assessed = assessTransfer(partial);
  for (const id of ["client-lock", "server-lock", "pending-transfer", "lifecycle"]) assert.equal(assessed.findings.find(f => f.id === id).state, "unknown");
  for (const [status, id] of [["clientTransferProhibited", "client-lock"], ["serverTransferProhibited", "server-lock"], ["pendingTransfer", "pending-transfer"], ["redemptionPeriod", "lifecycle"]]) {
    const proven = normalized("it", "example.it", `Domain: example.it\nCreated: 2000-01-01\nstatus: ${status}\n`);
    assert.equal(assessTransfer(proven).findings.find(f => f.id === id).state, "blocked");
  }
});

test("only reviewed complete exact EPP lists can establish absence, with unknown status text downgrading completeness", () => {
  const text = "Domain: example.it\nCreated: 2000-01-01\nstatus: clientUpdateProhibited\n";
  const complete = normalized("it", "example.it", text, { completeStatusList: true });
  assert.equal(complete.registryFetch.body.whois.statusesComplete, true);
  assert.equal(assessTransfer(complete).findings.find(f => f.id === "client-lock").state, "clear");
  const mixed = normalized("it", "example.it", text + "transfer status: locked\n", { completeStatusList: true });
  assert.equal(mixed.registryFetch.body.whois.statusesComplete, false);
  assert.equal(assessTransfer(mixed).findings.find(f => f.id === "client-lock").state, "unknown");
});

test("explicit domain statuses override availability inside every contact or raw-value block", () => {
  for (const heading of ["Registrant", "Registrar", "Admin Contact", "Technical Contact", "Nameservers"]) {
    for (const field of ["Domain Status", "Flags", "Transfer Status", "Lock Status", "Registration Status"]) {
      for (const statusLine of [`  ${field}: inactive / clientHold`, `${field}:\n  clientHold`]) {
        const text = `Domain: example.it\nStatus: AVAILABLE\n${heading}\n${statusLine}\n`;
        const parsed = parseWhoisResponse(text, "example.it", services.it);
        assert.equal(parsed.status, "registry_error", text);
        assert.equal(parsed.body, null);
      }
    }
  }
  const scoped = normalized("it", "example.it", "Domain: example.it\nStatus: ok\nRegistrant\n  Domain Status: clientHold\n  Created: 2018-01-02\n");
  assert.deepEqual(scoped.statuses.map(status => status.epp), ["clientHold", "ok"]);
  assert.equal(scoped.registrationDate, null, "an explicit domain field does not change the contact's ownership");
});

test("Belgian footer flags retain the proven registrar transfer blocker", async () => {
  const result = normalized("be", "google.be", await fixture("be"));
  assert.equal(result.status, "registered");
  assert.equal(result.registrationDate, "2000-12-12");
  assert.equal(result.registrar.name, "Markmonitor Inc.");
  assert.equal(result.nameservers.length, 4);
  assert.deepEqual(result.statuses.map(status => status.epp), ["clientTransferProhibited"]);
  assert.equal(assessTransfer(result).findings.find(f => f.id === "client-lock").state, "blocked");
});

test("Armenian domain footer dates survive contact sections", async () => {
  const text = (await fixture("am")).replace("   Technical contact:\n", "   Technical contact:\n      Created: 2020-01-02\n");
  const result = normalized("am", "nic.am", text);
  assert.equal(result.status, "registered");
  assert.equal(result.registrationDate, "1997-01-01");
  assert.equal(result.lastChangedDate, "2017-12-28");
  assert.equal(result.registrar.name, "amnic");
  assert.deepEqual(result.registryFetch.body.whois.rawStatuses, ["active"]);
  const partial = normalized("am", "nic.am", text.replace(/^   Registered:.*\n/m, ""));
  assert.equal(partial.registrationDate, null, "contact Created is still scoped");
});

test("Kazakh domain footer dates and statuses survive contact sections", async () => {
  const result = normalized("kz", "google.kz", await fixture("kz"));
  assert.equal(result.status, "registered");
  assert.equal(result.registrationDate, "1999-06-07");
  assert.equal(result.registryExpiryDate, "2027-06-06");
  assert.equal(result.lastChangedDate, "2012-11-28");
  assert.equal(result.nameservers.length, 2);
  assert.deepEqual(result.registryFetch.body.whois.rawStatuses, ["ok - Normal state."]);
  assert.deepEqual(result.statuses, [], "free-text normal state is not an EPP code");
});

test("Manx Domain Details returns from contacts to the domain expiry", async () => {
  const text = (await fixture("im")).replace("Technical Contact\nRedacted", "Technical Contact\nRedacted\nCreated: 2020-01-02\nExpiry Date: 01/01/2030");
  const result = normalized("im", "google.im", text);
  assert.equal(result.status, "registered");
  assert.equal(result.registrationDate, null);
  assert.equal(result.registryExpiryDate, "2027-08-16");
  assert.equal(result.nameservers.length, 4);
});

test("Åland's registrar-labelled field is not prefixed by its Registrar heading", async () => {
  const result = normalized("ax", "nic.ax", await fixture("ax"));
  assert.equal(result.status, "registered");
  assert.equal(result.registrar.name, "NETIM");
  assert.equal(result.registrationDate, "2016-09-05");
  assert.equal(result.registryExpiryDate, "2027-09-05");
  assert.equal(result.lastChangedDate, "2026-08-29");
  assert.deepEqual(result.registryFetch.body.whois.rawStatuses, ["Registered"]);
});

test("standalone protected and privacy-qualified placeholders never become owner identities", () => {
  for (const placeholder of ["protected", "PROTECTED", "[protected]", "protected by GDPR", "Protected by the GDPR", "undisclosed for privacy", "undisclosed for privacy reasons", "withheld under data protection law", "hidden due to GDPR"]) {
    const result = normalized("it", "example.it", `Domain: example.it\nStatus: ok\nRegistrant\n  Name: ${placeholder}\n  Organization: ${placeholder}\n  Phone: ${placeholder}\n`);
    assert.equal(result.status, "registered");
    assert.deepEqual(result.entities.filter(entity => entity.roles.includes("registrant")), [], placeholder);
  }
  for (const organization of ["Google Ireland Holdings Unlimited Company", "MarkMonitor International Limited", "NETIM", "Protected Trust, LLC", "Private Internet Access", "HiddenLayer"]) {
    const result = normalized("it", "example.it", `Domain: example.it\nStatus: ok\nRegistrant\n  Organization: ${organization}\n`);
    assert.equal(result.entities.find(entity => entity.roles.includes("registrant")).organization, organization);
  }
});

test("Manx manager and owner headings isolate contact evidence until Domain Details", async () => {
  const fixtureText = await fixture("im");
  for (const heading of ["Domain Managers", "Domain Owners / Registrant"]) {
    const contact = `${heading}\n\nCreated: 2020-01-02\nStatus: ok\nStatus: clientTransferProhibited\nExpiry Date: 01/01/2030\n`;
    const bare = parseWhoisResponse(`Domain Name: google.im\n${contact}`, "google.im", reviewed.services.im);
    assert.equal(bare.status, "registry_error", heading);
    assert.equal(bare.body, null);
    const text = fixtureText.replace(`${heading}\n`, contact);
    const result = normalized("im", "google.im", text);
    assert.equal(result.status, "registered");
    assert.equal(result.registrationDate, null, heading);
    assert.equal(result.registryExpiryDate, "2027-08-16", "Domain Details restores domain ownership");
    assert.deepEqual(result.statuses, [], heading);
    assert.equal(assessTransfer(result).findings.find(f => f.id === "client-lock").state, "unknown");
    const explicit = normalized("im", "google.im", text.replace("Status: clientTransferProhibited", "Domain Status: clientTransferProhibited"));
    assert.equal(explicit.registrationDate, null);
    assert.deepEqual(explicit.statuses.map(status => status.epp), ["clientTransferProhibited"]);
    assert.equal(assessTransfer(explicit).findings.find(f => f.id === "client-lock").state, "blocked");
  }
});

// Exact contact/registrar headings observed in the 77 reviewed captures. The
// other profiles have flat fields or inline contact references, covered above.
const capturedContactHeadings = {
  am: ["Registrant:", "Administrative contact:", "Technical contact:"],
  ax: ["Holder", "Registrar"],
  be: ["Registrant:", "Registrar Technical Contacts:", "Registrar:"],
  bn: ["Registrant:", "Administrative Contact:", "Technical Contact:"],
  edu: ["Registrant:", "Administrative Contact:", "Technical Contact:"],
  ee: ["Registrant:", "Administrative contact:", "Technical contact:", "Registrar:"],
  eu: ["Registrant:", "Technical:", "Registrar:"],
  gf: ["[holder]", "[admin_c]", "[tech_c]", "[zone_c]"],
  gg: ["Registrant:", "Registrar:"],
  hk: ["Registrant Contact Information:"],
  im: ["Domain Managers", "Domain Owners / Registrant", "Administrative Contact", "Billing Contact", "Technical Contact"],
  it: ["Registrant", "Admin Contact", "Technical Contacts", "Registrar"],
  je: ["Registrant:", "Registrar:"],
  jp: ["Contact Information:"],
  kz: ["Registrant", "Administrative Contact"],
  lv: ["[Holder]", "[Tech]", "[Registrar]"],
  mq: ["[holder]", "[admin_c]", "[tech_c]", "[zone_c]"],
  mx: ["Registrant:", "Administrative Contact:", "Technical Contact:", "Billing Contact:"],
  sm: ["Owner:", "Technical Contact:"],
  tn: ["Owner Contact", "Administrativ contact", "Technical contact"],
  tr: ["** Registrant:", "** Registrar:"],
  ug: ["Registrant Contact Information:", "Administrative Contact Information:", "Technical Contact Information:"],
};

test("every captured standalone contact heading excludes generic contact dates and statuses", () => {
  for (const [tld, headings] of Object.entries(capturedContactHeadings)) {
    for (const heading of headings) {
      const domain = `example.${tld}`;
      // TN explicitly publishes DNSSEC as a domain footer field; its exception
      // is tested with the captured footer below, rather than contact data here.
      const dnssec = tld === "tn" ? "" : "DNSSEC: yes\n";
      const contact = `${heading}\n\nStatus: ok\nCreated: 2020-01-02\nUpdated: 2021-01-02\nStatus: clientTransferProhibited\n${dnssec}`;
      const bare = parseWhoisResponse(`Domain: ${domain}\n${contact}`, domain, reviewed.services[tld]);
      assert.equal(bare.status, "registry_error", `${tld} ${heading}`);
      const text = `Domain: ${domain}\nName Server: ns1.example.net\n${contact}`;
      const result = normalized(tld, domain, text);
      assert.equal(result.status, "registered", `${tld} ${heading}`);
      assert.equal(result.registrationDate, null, `${tld} ${heading} Created`);
      assert.equal(result.lastChangedDate, null, `${tld} ${heading} Updated`);
      assert.deepEqual(result.statuses, [], `${tld} ${heading} Status`);
      assert.equal(result.dnssecSigned, null, `${tld} ${heading} DNSSEC`);
      const explicit = normalized(tld, domain, text + "Domain Status: clientTransferProhibited\n");
      assert.deepEqual(explicit.statuses.map(status => status.epp), ["clientTransferProhibited"], `${tld} ${heading} Domain Status`);
    }
  }
});

test("privacy markers suppress punctuation and qualifier variants while keeping organization words", () => {
  for (const placeholder of [
    "protected for privacy purposes", "protected (GDPR)", "undisclosed for privacy protection",
    "[Protected] (GDPR)", "PROTECTED—GDPR", "private, per policy request", "redacted: data protection; purpose",
    "not/disclosed for privacy purposes", "N/A", "[N / A]", "none", "---",
  ]) {
    const result = normalized("it", "example.it", `Domain: example.it\nStatus: ok\nRegistrant\n  Name: ${placeholder}\n  Organization: ${placeholder}\n  Phone: ${placeholder}\n`);
    assert.deepEqual(result.entities.filter(entity => entity.roles.includes("registrant")), [], placeholder);
  }
  for (const organization of ["Protected Trust Ltd", "Protected by Design Ltd", "Privacy International"]) {
    const result = normalized("it", "example.it", `Domain: example.it\nStatus: ok\nRegistrant\n  Name: ${organization}\n  Organization: ${organization}\n`);
    const registrant = result.entities.find(entity => entity.roles.includes("registrant"));
    assert.equal(registrant.name, organization);
    assert.equal(registrant.organization, organization);
  }
  const notice = normalized("be", "example.be", "Domain: example.be\nRegistered: 2000-01-01\nRegistrant:\n  Not shown, please visit www.dnsbelgium.be for webbased whois.\n");
  assert.deepEqual(notice.entities.filter(entity => entity.roles.includes("registrant")), []);
});

test("Burkina Faso registry-policy redactions never become published registrant fields", async () => {
  const result = normalized("bf", "nic.bf", await fixture("bf"));
  assert.equal(result.status, "registered");
  assert.equal(result.registrationDate, "2021-01-01T00:00:00.000Z");
  assert.equal(result.nameservers.length, 3);
  const registrant = result.entities.find(entity => entity.roles.includes("registrant"));
  assert.equal(registrant.name, null);
  assert.equal(registrant.phone, null);
  assert.equal(registrant.email, null);
  assert.equal(registrant.organization, "MIGRATION-ORG", "the separately published organization field is kept");
});

test("privacy token values require a marker, while absent values remain absent", () => {
  for (const placeholder of [
    "Redacted | Registry Policy", "REDACTED FOR PRIVACY", "Data Protected", "Confidential | Registrar Policy",
    "redacted (registry) / per policy request", "protected for privacy purposes", "protected (GDPR)", "undisclosed for privacy protection",
    "n/a", "[N / A]", "none", "null", "---",
  ]) {
    const result = normalized("it", "example.it", `Domain: example.it\nStatus: ok\nRegistrant\n  Name: ${placeholder}\n  Organization: ${placeholder}\n  Phone: ${placeholder}\n`);
    assert.deepEqual(result.entities.filter(entity => entity.roles.includes("registrant")), [], placeholder);
  }
  for (const name of ["Protected Trust Ltd", "Protected by Design Ltd", "Privacy International", "Law", "Na", "Registry", "Policy Request", "Data", "The Law", "Redacted Na"]) {
    const result = normalized("it", "example.it", `Domain: example.it\nStatus: ok\nRegistrant\n  Name: ${name}\n  Organization: ${name}\n`);
    const registrant = result.entities.find(entity => entity.roles.includes("registrant"));
    assert.equal(registrant.name, name);
    assert.equal(registrant.organization, name);
  }
});

test("Tunisian DNSSEC footer is a reviewed domain field after contacts", async () => {
  const text = (await fixture("tn")).replace("Technical contact\n", "Technical contact\nCreated: 2020-01-02\n");
  const result = normalized("tn", "google.tn", text);
  assert.equal(result.status, "registered");
  assert.equal(result.registrar.name, "ELB");
  assert.equal(result.dnssecSigned, false);
  assert.equal(result.registrationDate, null, "contact Created remains scoped and the domain's local time is ambiguous");
  const partial = normalized("tn", "google.tn", text.replace(/^dnssec.*\n/m, ""));
  assert.equal(partial.dnssecSigned, null, "no DNSSEC answer is invented when the footer is missing");
  const other = normalized("it", "example.it", "Domain: example.it\nStatus: ok\nTechnical Contacts\nDNSSEC: unsigned\n");
  assert.equal(other.dnssecSigned, null, "the reviewed exception is limited to TN");
});
