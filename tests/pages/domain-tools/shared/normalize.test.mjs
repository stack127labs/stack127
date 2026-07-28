import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRegistration } from "../../../../lib/domain/normalize.ts";
import { parseRedactions, declaresRedaction } from "../../../../lib/domain/redaction.ts";
import { collectEntities, findByRole } from "../../../../lib/domain/vcard.ts";

const query = {
  input: "example.com", domain: "example.com", unicode: "example.com", tld: "com",
  suffix: "com", reduced: false, isIdn: false, guessedSuffix: false,
};
const coverage = { source: "bootstrap", operator: null, url: "https://rdap.example/", unknownTld: false };

function fetchOf(body, overrides = {}) {
  return { status: "registered", httpStatus: 200, url: "https://rdap.example/domain/example.com",
    source: "registry", body, error: null, fetchedAt: "2026-07-28T00:00:00Z", fromCache: false, ...overrides };
}

test("keeps registry and registrar expiry as two separate fields", () => {
  const registry = fetchOf({ events: [{ eventAction: "expiration", eventDate: "2027-01-01T00:00:00Z" }] });
  const registrar = fetchOf({ events: [{ eventAction: "registrar expiration", eventDate: "2027-02-02T00:00:00Z" }] }, { source: "registrar" });
  const result = buildRegistration({ query, coverage, registry, registrar, startedAt: Date.now() });
  assert.equal(result.registryExpiryDate, "2027-01-01T00:00:00Z");
  assert.equal(result.registrarExpiryDate, "2027-02-02T00:00:00Z");
  assert.ok(result.notes.some((note) => note.includes("different expiry dates")), "a disagreement must be surfaced");
});

test("reads the optional transfer and reregistration events", () => {
  const registry = fetchOf({ events: [
    { eventAction: "registration", eventDate: "2003-03-04T00:00:00Z" },
    { eventAction: "reregistration", eventDate: "2026-02-02T00:00:00Z" },
    { eventAction: "transfer", eventDate: "2025-05-05T00:00:00Z" },
  ] });
  const result = buildRegistration({ query, coverage, registry, registrar: null, startedAt: Date.now() });
  assert.equal(result.registrationDate, "2003-03-04T00:00:00Z");
  assert.equal(result.reregistrationDate, "2026-02-02T00:00:00Z");
  assert.equal(result.transferDate, "2025-05-05T00:00:00Z");
});

test("a missing event is unknown, never a default", () => {
  const result = buildRegistration({ query, coverage, registry: fetchOf({}), registrar: null, startedAt: Date.now() });
  assert.equal(result.registrationDate, null);
  assert.equal(result.transferDate, null);
  assert.equal(result.lastChangedDate, null);
  assert.equal(result.dnssecSigned, null, "no secureDNS object means unknown, not unsigned");
});

test("delegationSigned false is different from unknown", () => {
  const result = buildRegistration({
    query, coverage, registry: fetchOf({ secureDNS: { delegationSigned: false } }), registrar: null, startedAt: Date.now(),
  });
  assert.equal(result.dnssecSigned, false);
});

test("strips the trailing dot registries disagree about", () => {
  const result = buildRegistration({
    query, coverage,
    registry: fetchOf({ nameservers: [{ ldhName: "NS1.EXAMPLE.COM." }, { ldhName: "ns2.example.com" }] }),
    registrar: null, startedAt: Date.now(),
  });
  assert.deepEqual(result.nameservers.map((ns) => ns.hostname), ["ns1.example.com", "ns2.example.com"]);
});

test("maps RDAP status values to the EPP spelling people have seen", () => {
  const result = buildRegistration({
    query, coverage, registry: fetchOf({ status: ["client transfer prohibited", "some registry invention"] }),
    registrar: null, startedAt: Date.now(),
  });
  assert.equal(result.statuses[0].epp, "clientTransferProhibited");
  assert.equal(result.statuses[0].known, true);
  assert.equal(result.statuses[1].known, false, "an unknown code stays visible rather than being dropped");
  assert.equal(result.statuses[1].rdap, "some registry invention");
});

test("notes when the input was shortened", () => {
  const result = buildRegistration({
    query: { ...query, reduced: true, input: "www.example.com" }, coverage,
    registry: fetchOf({}), registrar: null, startedAt: Date.now(),
  });
  assert.ok(result.notes.some((note) => note.includes("example.com")));
});

test("parses RFC 9537 redaction and translates the method", () => {
  const body = {
    rdapConformance: ["rdap_level_0", "redacted"],
    redacted: [
      { name: { type: "Registrant Name" }, method: "emptyValue" },
      { name: { type: "Registrant Phone" }, method: "removal" },
      { name: { type: "Registrant Email" }, method: "replacementValue" },
      { name: { type: "Nonsense" } },
    ],
  };
  const fields = parseRedactions(body);
  assert.equal(fields.length, 4);
  assert.equal(fields[0].method, "emptyValue");
  assert.equal(fields[1].method, "removal");
  assert.equal(fields[3].method, "unknown");
  assert.ok(fields[0].explanation.length > 0, "every method needs a plain explanation");
  assert.equal(declaresRedaction(body), true);
  assert.equal(declaresRedaction({}), false);
});

test("parses jCard including the parts redaction empties", () => {
  const entities = collectEntities([
    {
      roles: ["registrar"], handle: "1636",
      vcardArray: ["vcard", [["version", {}, "text", "4.0"], ["fn", {}, "text", "Example Registrar"]]],
      entities: [{ roles: ["abuse"], vcardArray: ["vcard", [["email", {}, "text", "abuse@example.com"]]] }],
    },
    {
      roles: ["registrant"],
      vcardArray: ["vcard", [
        ["fn", {}, "text", ""],
        ["contact-uri", {}, "uri", "https://example.com/contact"],
        ["adr", { cc: "LT" }, "text", ["", "", "", "", "", "", ""]],
      ]],
    },
  ], "registry");

  const registrar = findByRole(entities, "registrar");
  assert.equal(registrar.name, "Example Registrar");
  assert.equal(registrar.handle, "1636");
  assert.equal(findByRole(entities, "abuse").email, "abuse@example.com", "nested entities must be collected");

  const registrant = findByRole(entities, "registrant");
  assert.equal(registrant.name, null, "an emptied fn is redacted, not a name");
  assert.equal(registrant.contactUri, "https://example.com/contact");
  assert.equal(registrant.country, "LT", "the cc parameter survives when the address does not");
});
