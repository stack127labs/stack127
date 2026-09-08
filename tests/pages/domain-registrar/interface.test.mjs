import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { isRegistrarHopIncomplete, registrarDateRows, registrarDetails, registrarIdentity, registrarNotes, registrarResellers } from "../../../app/(site)/(tools)/domain-registrar/domain-registrar-view.ts";

const root = process.cwd();
const source = readFileSync(path.join(root, "app/(site)/(tools)/domain-registrar/domain-registrar-tool.tsx"), "utf8");

function result(overrides = {}) {
  return {
    query: { input: "example.com", domain: "example.com", unicode: "example.com", tld: "com", suffix: "com", reduced: false, isIdn: false, guessedSuffix: false },
    coverage: { source: "bootstrap", operator: "Example Registry", url: "https://rdap.registry.test", unknownTld: false },
    status: "registered", checkedAt: "2026-09-05T10:00:00Z", durationMs: 100,
    registrationDate: null, reregistrationDate: null, registryExpiryDate: null, registrarExpiryDate: null, lastChangedDate: "2026-08-01T00:00:00Z", transferDate: null, lockedDate: null, registryDatabaseUpdated: null,
    events: [{ action: "last changed", date: "2026-08-01T00:00:00Z", source: "registry" }], statuses: [], nameservers: [], dnssecSigned: null, dsRecordCount: null,
    registrar: { name: "Example Registrar", ianaId: "123", abuseEmail: "abuse@example.test", abusePhone: null, url: "https://registrar.test", rdapUrl: "https://rdap.registrar.test" },
    entities: [
      { roles: ["registrar"], handle: "123", name: "Example Registrar", organization: null, email: null, phone: null, country: null, stateProvince: null, contactUri: null, fields: [], source: "registry" },
      { roles: ["registrar"], handle: "123", name: "Registrar Legal Name", organization: null, email: null, phone: null, country: null, stateProvince: null, contactUri: null, fields: [], source: "registrar" },
      { roles: ["abuse"], handle: null, name: null, organization: null, email: "abuse@example.test", phone: "+1.5550100", country: null, stateProvince: null, contactUri: null, fields: [], source: "registrar" },
    ], redactions: [], redactionDeclared: false,
    registryFetch: { status: "registered", httpStatus: 200, url: "https://rdap.registry.test/domain/example.com", source: "registry", body: {}, error: null, fetchedAt: "2026-09-05T09:00:00Z", fromCache: false },
    registrarFetch: { status: "registered", httpStatus: 200, url: "https://rdap.registrar.test/domain/example.com", source: "registrar", body: {}, error: null, fetchedAt: "2026-09-05T09:01:00Z", fromCache: true },
    notes: [], ...overrides,
  };
}

test("registrar identity prefers the registry and rejects conflicting IDs", () => {
  assert.deepEqual(registrarIdentity(result()).value, "Example Registrar");
  const conflict = result({ entities: [...result().entities, { ...result().entities[1], handle: "999" }] });
  assert.equal(registrarIdentity(conflict).value, "Cannot determine");
  assert.equal(registrarIdentity(result({ status: "not_registered" })).value, "No registrar");
});

test("details do not repeat the lead name and merge identical abuse contacts", () => {
  const rows = registrarDetails(result());
  assert.equal(rows.some((row) => row.value === "Example Registrar"), false);
  assert.equal(rows.filter((row) => row.value === "abuse@example.test").length, 1);
  assert.equal(rows.find((row) => row.value === "abuse@example.test")?.source, "Registrar");
  assert.equal(rows.find((row) => row.label === "IANA registrar ID")?.value, "123");
  assert.equal(rows.find((row) => row.label === "Alternate published name")?.value, "Registrar Legal Name");
});

test("transfer and record-change dates remain separate", () => {
  assert.deepEqual(registrarDateRows(result()).map((row) => [row.event, row.date, row.meaning]), [
    ["Last transferred", "Not published", "Move date is unknown"],
    ["Record last changed", "1 August 2026", "Record change, not proof of transfer"],
  ]);
});

test("reseller absence stays unknown instead of becoming a claim", () => {
  assert.deepEqual(registrarResellers(result()), []);
  assert.deepEqual(registrarResellers(result({ entities: [...result().entities, { ...result().entities[0], roles: ["reseller"], name: "Example Reseller" }] })), ["Example Reseller"]);
});

test("an identified registrar with no usable registrar response stays partial", () => {
  assert.equal(isRegistrarHopIncomplete(result()), false);
  assert.equal(isRegistrarHopIncomplete(result({ registrarFetch: null })), true);
  assert.equal(isRegistrarHopIncomplete(result({ registrarFetch: { ...result().registrarFetch, status: "timeout" } })), true);
  assert.equal(isRegistrarHopIncomplete(result({ registrarFetch: null, status: "not_registered" })), false);
});

test("lookup notes do not repeat normalization or registrar-hop notices", () => {
  const notes = registrarNotes(result({
    notes: [
      "We looked up example.com, which is the registrable part of what you entered.",
      "We could not read the registrar's own record, so contact details and the registrar expiry date are missing.",
      "This ending is not in our copy of the public suffix list, so the registrable part is a best guess.",
      "Keep this provider qualification.",
    ],
  }));
  assert.deepEqual(notes, ["Keep this provider qualification."]);
});

test("interface uses shared components and removes the legacy result shell", () => {
  for (const component of ["ToolTextField", "ToolButton", "ToolStatus", "ToolPrimaryResult", "ToolKeyValueList", "ToolDataTable", "ToolDownloadAction", "ToolDisclosure", "ToolRawOutput"]) assert.match(source, new RegExp(component));
  assert.doesNotMatch(source, /ResultHeader|StatePill|DomainFavicon|domain-answer|Timeline/);
});
