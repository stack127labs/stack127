import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { coverageRows, deduplicatedFindings, findingDetail, findingEvidence, findingGroups, nameserverStageAgreement, nameserverStages, reportLead, reportSourceRows } from "../../../app/(site)/(tools)/domain-report/domain-report-view.ts";

const source = readFileSync(path.join(process.cwd(), "app/(site)/(tools)/domain-report/domain-report-tool.tsx"), "utf8");

function result(overrides = {}) {
  return {
    registration: { query: { unicode: "example.com" }, status: "registered", registrar: { name: "Example Registrar" }, nameservers: [{ hostname: "ns1.example.net" }], registryFetch: { url: "https://rdap.registry.test", fromCache: false, fetchedAt: "2026-09-05" }, registrarFetch: null },
    registrationError: null,
    delegation: { zone: "example.com", parentZone: "com", checkedAt: "2026-09-05", parentDelegatedNameservers: ["ns1.example.net"], childPublishedNameservers: ["ns1.example.net"] },
    delegationError: null,
    findings: [], ranChecks: ["Registration record", "Nameserver delegation"], skippedChecks: [], summary: "legacy", checkedAt: "2026-09-05", durationMs: 100,
    ...overrides,
  };
}

test("lead is coverage-aware and never turns missing work into an all-clear", () => {
  assert.match(reportLead(result()), /No attention findings were found/);
  assert.match(reportLead(result({ ranChecks: [], skippedChecks: [{ name: "Registration record", reason: "Unavailable" }, { name: "Nameserver delegation", reason: "Unavailable" }] })), /No registration or DNS conclusion is available/);
  assert.doesNotMatch(reportLead(result({ ranChecks: [] })), /healthy|secure|all clear|Nothing needs attention/i);
  assert.match(reportLead(result({ ranChecks: ["Registration record"], delegation: null })), /no live DNS conclusion/i);
  assert.match(reportLead(result({ delegation: null, ranChecks: ["Registration record"], registration: { ...result().registration, status: "not_registered" } })), /No registration record was found.*nameserver-delegation check is unavailable/i);
  assert.doesNotMatch(reportLead(result({ delegation: null, ranChecks: ["Registration record"], registration: { ...result().registration, status: "not_registered" } })), /no live DNS conclusion/i);
});

test("coverage always has exactly the two checks and safe states", () => {
  assert.deepEqual(coverageRows(result()).map(({ check, state }) => [check, state]), [["Registration record", "Completed"], ["Nameserver delegation", "Completed"]]);
  const partial = coverageRows(result({ ranChecks: ["Registration record"], skippedChecks: [{ name: "Nameserver delegation", reason: "DNS timed out" }] }));
  assert.equal(partial[1].state, "Unavailable");
  assert.equal(partial[1].note, "DNS timed out");
});

test("nameserver stages encode the real source order and agreement", () => {
  const stages = nameserverStages(result());
  assert.deepEqual(stages.map((stage) => stage.id), ["registration", "parent", "child"]);
  assert.equal(nameserverStageAgreement(stages), "Nameserver sources agree");
  assert.equal(nameserverStageAgreement(nameserverStages(result({ registration: { ...result().registration, nameservers: [{ hostname: "other.example.net" }] } }))), "Nameserver sources differ");
});

test("findings deduplicate by ID and nameserver evidence stays in the diagram", () => {
  const finding = { id: "ns-mismatch", title: "Different nameservers", state: "attention", detail: "Sets differ", evidence: "registry: a; zone: b", tool: null };
  const checked = result({ findings: [finding, finding] });
  assert.equal(deduplicatedFindings(checked).length, 1);
  assert.equal(findingGroups(checked)[0].title, "Needs attention");
  assert.equal(findingEvidence(finding), null);
  assert.equal(findingDetail({ ...finding, id: "dnssec-signed" }), "A DS record is published. This report did not validate the DNSSEC chain.");
});

test("source snapshot always names cache state", () => {
  assert.match(reportSourceRows(result())[0].value, /live response$/);
  const cached = result({ registration: { ...result().registration, registryFetch: { ...result().registration.registryFetch, fromCache: true } } });
  assert.match(reportSourceRows(cached)[0].value, /cached$/);
});

test("interface uses the shared controls and no legacy result shell", () => {
  for (const component of ["ToolTextField", "ToolButton", "ToolStatus", "ToolResultLead", "ToolDataTable", "ToolDownloadAction"]) assert.match(source, new RegExp(component));
  assert.doesNotMatch(source, /ResultHeader|StatePill|DomainFavicon|domain-answer|Nothing needs attention|STATE_TONE/);
});
