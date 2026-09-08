import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { buildRegistration } from "../../../lib/domain/normalize.ts";
import { dateRows, lookupVerdict, sourceForRecordGroup } from "../../../app/(site)/(tools)/domain-lookup/domain-lookup-view.ts";

const root = process.cwd();
const routePath = path.join(root, "app/(site)/(tools)/domain-lookup/domain-lookup-tool.tsx");
const stylesPath = path.join(root, "app/(site)/(tools)/domain-lookup/domain-lookup-tool.module.css");
const source = readFileSync(routePath, "utf8");
const styles = existsSync(stylesPath) ? readFileSync(stylesPath, "utf8") : "";

function result(overrides = {}) {
  return {
    query: { input: "www.example.com", domain: "example.com", unicode: "example.com", tld: "com", suffix: "com", reduced: true, isIdn: false, guessedSuffix: false },
    coverage: { source: "iana_bootstrap", operator: null, url: null, unknownTld: false },
    status: "registered", checkedAt: "2026-09-05T10:00:00Z", durationMs: 100,
    registrationDate: "2020-01-02T00:00:00Z", reregistrationDate: null,
    registryExpiryDate: "2029-08-20T00:00:00Z", registrarExpiryDate: "2029-08-21T00:00:00Z",
    lastChangedDate: null, transferDate: null, lockedDate: null, registryDatabaseUpdated: null,
    events: [
      { action: "registration", date: "2020-01-02T00:00:00Z", source: "registry" },
      { action: "expiration", date: "2029-08-20T00:00:00Z", source: "registry" },
      { action: "registrar expiration", date: "2029-08-21T00:00:00Z", source: "registrar" },
    ],
    statuses: [{ rdap: "client transfer prohibited", epp: "clientTransferProhibited", known: true }],
    nameservers: [{ hostname: "ns1.example.net", addresses: ["192.0.2.1"] }], dnssecSigned: true, dsRecordCount: 1,
    registrar: { name: "Example Registrar", ianaId: "123", abuseEmail: "abuse@example.test", abusePhone: null, url: null, rdapUrl: "https://rdap.registrar.test" },
    entities: [], redactions: [], redactionDeclared: false,
    registryFetch: { status: "registered", httpStatus: 200, url: "https://rdap.registry.test/domain/example.com", source: "registry", body: { status: ["client transfer prohibited"], nameservers: [{}], secureDNS: {} }, error: null, fetchedAt: "2026-09-05T09:00:00Z", fromCache: false },
    registrarFetch: { status: "registered", httpStatus: 200, url: "https://rdap.registrar.test/domain/example.com", source: "registrar", body: {}, error: null, fetchedAt: "2026-09-05T09:01:00Z", fromCache: true },
    notes: [], ...overrides,
  };
}

test("lookup lead composes one verdict without repeating dates", () => {
  const verdict = lookupVerdict(result());
  assert.equal(verdict.value, "Registered");
  assert.match(verdict.detail, /example\.com is registered through Example Registrar/);
  assert.match(verdict.detail, /clientTransferProhibited currently blocks transfer/);
  assert.doesNotMatch(verdict.detail, /2020|2029/);
  assert.equal(lookupVerdict(result({ status: "not_registered" })).value, "No registration found");
  assert.equal(lookupVerdict(result({ status: "no_service" })).value, "Cannot determine");
});

test("date rows preserve separate registry and registrar expiry sources", () => {
  const rows = dateRows(result());
  assert.deepEqual(rows.slice(0, 3).map(({ label, source }) => ({ label, source })), [
    { label: "Registered", source: "Registry" },
    { label: "Registry expiry", source: "Registry" },
    { label: "Registrar expiry", source: "Registrar" },
  ]);
  assert.equal(rows.find((row) => row.label === "Record last changed")?.value, "Not published");
  assert.equal(rows.some((row) => row.label === "Re-registered"), false);
});

test("record groups use the provider that supplied their normalized value", () => {
  assert.equal(sourceForRecordGroup(result(), "statuses"), "Registry");
  assert.equal(sourceForRecordGroup(result(), "nameservers"), "Registry");
  assert.equal(sourceForRecordGroup(result(), "dnssec"), "Registry");
  const fallback = result({
    registryFetch: { ...result().registryFetch, body: {} },
    registrarFetch: {
      ...result().registrarFetch,
      body: { status: ["client transfer prohibited"] },
    },
  });
  assert.equal(sourceForRecordGroup(fallback, "statuses"), "Registrar");

  const fixture = result();
  const emptyRegistryFields = buildRegistration({
    coverage: fixture.coverage,
    query: fixture.query,
    registrar: {
      ...fixture.registrarFetch,
      body: {
        nameservers: [{ ldhName: "ns1.example.net" }],
        secureDNS: { delegationSigned: true },
        status: ["client transfer prohibited"],
      },
    },
    registry: {
      ...fixture.registryFetch,
      body: { nameservers: [], secureDNS: {}, status: [] },
    },
    startedAt: Date.now(),
  });
  assert.equal(emptyRegistryFields.statuses.length, 1);
  assert.equal(emptyRegistryFields.nameservers.length, 1);
  assert.equal(emptyRegistryFields.dnssecSigned, true);
  assert.equal(sourceForRecordGroup(emptyRegistryFields, "statuses"), "Registrar");
  assert.equal(sourceForRecordGroup(emptyRegistryFields, "nameservers"), "Registrar");
  assert.equal(sourceForRecordGroup(emptyRegistryFields, "dnssec"), "Registrar");
});

test("domain lookup uses the contracted shared result regions", () => {
  for (const component of ["ToolTextField", "ToolButton", "ToolStatus", "ToolPrimaryResult", "ToolDataTable", "ToolKeyValueList", "ToolDownloadAction", "ToolDisclosure", "ToolRawOutput"]) {
    assert.match(source, new RegExp(component));
  }
  assert.equal((source.match(/<ToolPrimaryResult/g) ?? []).length, 1);
  assert.doesNotMatch(source, /ResultHeader|DomainFavicon|StatePill|Timeline|ToolTimeline|ToolProgressBar|headlinePill/);
  assert.doesNotMatch(source, /label:\s*"Registrar",\s*value:\s*sourced\(result\.registrar\.name/);
});

test("domain lookup styles contain provider evidence and narrow layouts", () => {
  assert.match(styles, /\.workbench\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.results\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.sourceMap\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /@media\s*\(max-width:\s*640px\)/);
});
