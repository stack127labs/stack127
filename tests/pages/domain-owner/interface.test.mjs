import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  contactRoutes,
  isRegistrarHopIncomplete,
  ownerVerdict,
  publishedRegistrantRows,
  redactionRows,
} from "../../../app/(site)/(tools)/domain-owner/domain-owner-view.ts";
import { tldTypeFor } from "../../../lib/domain/tld-directory.ts";

const root = process.cwd();
const routePath = path.join(root, "app/(site)/(tools)/domain-owner/domain-owner-tool.tsx");
const stylesPath = path.join(root, "app/(site)/(tools)/domain-owner/domain-owner-tool.module.css");
const source = readFileSync(routePath, "utf8");
const styles = existsSync(stylesPath) ? readFileSync(stylesPath, "utf8") : "";

function entity(source, overrides = {}) {
  return {
    roles: ["registrant"], handle: null, name: null, organization: null,
    email: null, phone: null, country: null, stateProvince: null, contactUri: null,
    fields: [], source, ...overrides,
  };
}

function result(overrides = {}) {
  return {
    query: { input: "www.example.com", domain: "example.com", unicode: "example.com", tld: "com", tldType: "generic", suffix: "com", reduced: true, isIdn: false, guessedSuffix: false },
    coverage: { source: "iana_bootstrap", operator: null, url: null, unknownTld: false },
    status: "registered", checkedAt: "2026-09-05T10:00:00Z", durationMs: 100,
    registrationDate: null, reregistrationDate: null, registryExpiryDate: null, registrarExpiryDate: null,
    lastChangedDate: null, transferDate: null, lockedDate: null, registryDatabaseUpdated: null,
    events: [], statuses: [], nameservers: [], dnssecSigned: null, dsRecordCount: null,
    registrar: { name: "Example Registrar", ianaId: null, abuseEmail: null, abusePhone: null, url: null, rdapUrl: "https://rdap.registrar.test" },
    entities: [], redactions: [], redactionDeclared: false,
    registryFetch: { status: "registered", httpStatus: 200, url: "https://rdap.registry.test/domain/example.com", source: "registry", body: {}, error: null, fetchedAt: "2026-09-05T09:00:00Z", fromCache: false },
    registrarFetch: { status: "registered", httpStatus: 200, url: "https://rdap.registrar.test/domain/example.com", source: "registrar", body: {}, error: null, fetchedAt: "2026-09-05T09:01:00Z", fromCache: true },
    notes: [], ...overrides,
  };
}

test("owner verdict inspects every registrant and preserves provider disagreement", () => {
  const secondRegistrant = result({ entities: [
    entity("registry"),
    entity("registrar", { organization: "Privacy Proxy LLC", fields: [{ label: "Organization", value: "Privacy Proxy LLC" }] }),
  ] });
  assert.equal(ownerVerdict(secondRegistrant).value, "Published");
  assert.match(ownerVerdict(secondRegistrant).detail, /Privacy Proxy LLC/);
  assert.match(ownerVerdict(secondRegistrant).detail, /does not prove/i);

  const conflict = result({ entities: [
    entity("registry", { organization: "One Ltd", fields: [{ label: "Organization", value: "One Ltd" }] }),
    entity("registrar", { organization: "Two Ltd", fields: [{ label: "Organization", value: "Two Ltd" }] }),
  ] });
  assert.match(ownerVerdict(conflict).detail, /disagree/i);
  assert.equal(publishedRegistrantRows(conflict).length, 2);
});

test("identical fields merge across sources while contact routes are partitioned", () => {
  const registration = result({ entities: [
    entity("registry", { email: "relay@example.test", organization: "Example Ltd", fields: [
      { label: "Organization", value: "Example Ltd" }, { label: "Email", value: "relay@example.test" },
    ] }),
    entity("registrar", { contactUri: "https://contact.example.test/form", email: "relay@example.test", organization: "Example Ltd", fields: [
      { label: "Organization", value: "Example Ltd" }, { label: "Email", value: "relay@example.test" }, { label: "Contact form", value: "https://contact.example.test/form" },
    ] }),
  ] });
  const rows = publishedRegistrantRows(registration);
  assert.deepEqual(rows, [{ role: "Registrant", field: "Organization", value: "Example Ltd", source: "Registry and registrar" }]);
  assert.deepEqual(contactRoutes(registration).map(({ kind, value }) => ({ kind, value })), [
    { kind: "registrant-email", value: "relay@example.test" },
    { kind: "registrant-form", value: "https://contact.example.test/form" },
  ]);
});

test("unpublished, partial, no-record, and failed lookups remain distinct", () => {
  const undeclared = ownerVerdict(result());
  assert.equal(undeclared.value, "Not published");
  assert.match(undeclared.detail, /did not declare why/i);
  assert.doesNotMatch(undeclared.detail, /withheld|GDPR/i);

  const registrarFailure = ownerVerdict(result({ registrarFetch: { ...result().registrarFetch, status: "timeout", error: "Timed out" } }));
  assert.equal(registrarFailure.value, "Cannot determine");
  assert.match(registrarFailure.detail, /registrar response could not be retrieved/i);
  assert.equal(ownerVerdict(result({ status: "not_registered" })).value, "No registrant");
  assert.equal(ownerVerdict(result({ status: "no_service" })).value, "Cannot determine");
});

test("a missing advertised registrar response remains incomplete when the registry names a registrar", () => {
  const missingHop = result({ registrarFetch: null });
  assert.equal(isRegistrarHopIncomplete(missingHop), true);
  assert.equal(ownerVerdict(missingHop).value, "Cannot determine");
  assert.match(ownerVerdict(missingHop).detail, /no registrar response was advertised/i);

  const registryOnly = result({
    registrar: { name: null, ianaId: null, abuseEmail: null, abusePhone: null, url: null, rdapUrl: null },
    registrarFetch: null,
  });
  assert.equal(isRegistrarHopIncomplete(registryOnly), false);
  assert.equal(ownerVerdict(registryOnly).value, "Not published");
});

test("redactions retain their response source and raw method", () => {
  const registration = result({
    registryFetch: { ...result().registryFetch, body: { rdapConformance: ["redacted"], redacted: [{ name: { type: "Registrant Name" }, method: "removal" }] } },
    registrarFetch: { ...result().registrarFetch, body: { rdapConformance: ["redacted"], redacted: [{ name: { type: "Registrant Email" }, method: "emptyValue" }] } },
  });
  assert.deepEqual(redactionRows(registration).map(({ field, method, source }) => ({ field, method, source })), [
    { field: "Registrant Name", method: "removal", source: "Registry" },
    { field: "Registrant Email", method: "emptyValue", source: "Registrar" },
  ]);
});

test("duplicate declarations and equivalent role orders render once", () => {
  const duplicateRedaction = { name: { type: "Registrant Email" }, method: "emptyValue" };
  const registration = result({
    entities: [
      entity("registry", { roles: ["registrant", "administrative"], country: "IN" }),
      entity("registrar", { roles: ["administrative", "registrant"], country: "IN" }),
    ],
    registryFetch: { ...result().registryFetch, body: { redacted: [duplicateRedaction, duplicateRedaction] } },
  });

  assert.deepEqual(publishedRegistrantRows(registration), [{
    role: "Registrant, Administrative contact",
    field: "Country",
    value: "IN",
    source: "Registry and registrar",
  }]);
  assert.equal(redactionRows(registration).length, 1);
});

test("RDRS eligibility comes from the committed TLD directory", () => {
  assert.equal(tldTypeFor("com"), "generic");
  assert.equal(tldTypeFor("uk"), "country-code");
});

test("domain owner uses the contracted shared result regions", () => {
  for (const component of ["ToolTextField", "ToolButton", "ToolStatus", "ToolPrimaryResult", "ToolDataTable", "ToolKeyValueList", "ToolDownloadAction", "ToolDisclosure", "ToolRawOutput"]) {
    assert.match(source, new RegExp(component));
  }
  assert.equal((source.match(/<ToolPrimaryResult/g) ?? []).length, 1);
  assert.doesNotMatch(source, /DomainForm|ResultHeader|DomainFavicon|StatePill|EntityCard|ToolTimeline|ToolProgressBar/);
  assert.match(source, /https:\/\/www\.icann\.org\/rdrs-en/);
  assert.match(source, /Request nonpublic gTLD data through ICANN/);
  assert.match(source, /inFlightRef\.current/);
});

test("domain owner styles contain evidence and narrow layouts", () => {
  assert.match(styles, /\.workbench\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.results\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.sourceMap\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /@media\s*\(max-width:\s*640px\)/);
});
