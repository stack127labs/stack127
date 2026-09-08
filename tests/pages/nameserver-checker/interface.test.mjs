import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  checkedAddressCount,
  delegationContextNotes,
  delegationDiagnosis,
  delegationRow,
  networkDetails,
  remainingDelegationFindings,
  transportText,
} from "../../../app/(site)/(tools)/nameserver-checker/nameserver-checker-view.ts";

const root = process.cwd();
const source = readFileSync(path.join(root, "app/(site)/(tools)/nameserver-checker/nameserver-checker.tsx"), "utf8");

function result(overrides = {}) {
  const reachability = [{
    server: { hostname: "ns1.example.com", address: "192.0.2.1" }, skippedReason: null,
    udp: { reachable: true, authoritative: true, responseCode: "NOERROR", error: null },
    tcp: { reachable: true, authoritative: true, responseCode: "NOERROR", error: null },
    soa: { ownerName: "example.com", primaryNameserver: "ns1.example.com", responsibleMailbox: "hostmaster.example.com", serial: 1, refreshSeconds: 1, retrySeconds: 1, expireSeconds: 1, minimumSeconds: 1, ttlSeconds: 300 },
    rawResponses: { udp: { Status: 0 }, tcp: { Status: 0 } },
  }];
  return {
    checkedAt: "2026-09-05T10:00:00Z", durationMs: 100, inputName: "example.com", zone: "example.com", parentZone: "com", ipv6Connectivity: true,
    parentNameservers: [], parentObservations: [], parentDelegatedNameservers: ["ns1.example.com"], parentGlue: [{ hostname: "ns1.example.com", address: "192.0.2.1", ttlSeconds: 300 }],
    childPublishedNameservers: ["ns1.example.com"], childObservations: [], nameserverAddresses: [{ hostname: "ns1.example.com", addresses: ["192.0.2.1"] }],
    authoritativeAddressObservations: [{ hostname: "ns1.example.com", server: { hostname: "ns1.example.com", address: "192.0.2.1" }, addresses: ["192.0.2.1"], authoritative: true, error: null, rawResponses: { A: { Status: 0 }, AAAA: null } }],
    addressDetails: [{ address: "192.0.2.1", asn: 64500, networkName: "Example Network", prefix: "192.0.2.0/24", countryCode: "US" }],
    reachability, findings: [], notes: [], ...overrides,
  };
}

test("healthy diagnosis requires positive delegation and transport evidence", () => {
  assert.match(delegationDiagnosis(result()).text, /healthy delegation/);
  assert.doesNotMatch(delegationDiagnosis(result({ parentDelegatedNameservers: [], childPublishedNameservers: [], reachability: [] })).text, /healthy/i);
  const unequalSets = result({
    childPublishedNameservers: ["ns2.example.com"],
    findings: [],
    parentDelegatedNameservers: ["ns1.example.com"],
  });
  assert.doesNotMatch(delegationDiagnosis(unequalSets).text, /healthy/i);
  assert.match(delegationDiagnosis(unequalSets).text, /ns1\.example\.com appears at the parent/);
  assert.doesNotMatch(delegationDiagnosis(result({ reachability: result().reachability.map((item) => ({ ...item, tcp: { ...item.tcp, authoritative: false } })) })).text, /healthy/i);
  assert.doesNotMatch(delegationDiagnosis(result({ reachability: result().reachability.map((item) => ({ ...item, soa: null })) })).text, /healthy/i);
});

test("direct-check scope excludes addresses skipped by the checker", () => {
  const skipped = { ...result().reachability[0], skippedReason: "checker_ipv6_unavailable" };
  assert.equal(checkedAddressCount(result({ reachability: [skipped] })), 0);
  assert.equal(checkedAddressCount(result({ reachability: [result().reachability[0], skipped] })), 1);
});

test("lead finding is removed from the remaining issue list", () => {
  const findings = ["ns2.example.net appears at the parent but not in the zone's own NS records.", "ns2.example.net did not resolve to a public IPv4 or IPv6 address."];
  const checked = result({ findings, parentDelegatedNameservers: ["ns1.example.com", "ns2.example.net"] });
  const diagnosis = delegationDiagnosis(checked);
  assert.equal(diagnosis.leadFinding, findings[0]);
  assert.deepEqual(remainingDelegationFindings(checked, diagnosis.leadFinding), [findings[1]]);
});

test("comparison keeps glue and address sources distinct", () => {
  assert.deepEqual(delegationRow(result(), "ns1.example.com"), {
    child: "Yes", glueRule: "Required", parent: "Yes", parentGlue: ["192.0.2.1"], testedAddresses: ["192.0.2.1"], zoneAddresses: ["192.0.2.1"],
  });
  assert.equal(delegationRow(result(), "ns.outside.net").glueRule, "Not required");
});

test("address rows distinguish checker skips, transport authority, and network fields", () => {
  assert.deepEqual(transportText(result().reachability[0], "udp"), ["Answered, NOERROR", "Authoritative"]);
  const skipped = { ...result().reachability[0], skippedReason: "checker_ipv6_unavailable" };
  assert.deepEqual(transportText(skipped, "tcp"), ["Not run", "No IPv6 route in checker"]);
  assert.deepEqual(networkDetails(result(), "192.0.2.1"), ["Example Network", "AS64500", "192.0.2.0/24", "US"]);
});

test("context omits the IPv6 sentence already carried by skipped rows", () => {
  assert.deepEqual(delegationContextNotes(result({ notes: ["IPv6 checks were skipped because this checker does not have IPv6 connectivity.", "Shared network context.", "Shared network context."] })), ["Shared network context."]);
});

test("interface uses the contracted shared controls and no legacy result shell", () => {
  for (const component of ["ToolTextField", "ToolButton", "ToolStatus", "ToolResultLead", "ToolDataTable", "ToolDisclosure", "ToolRawOutput", "ToolDownloadAction"]) {
    assert.match(source, new RegExp(component));
  }
  assert.doesNotMatch(source, /DiagnosticResultHeader|DownloadResultButton|DiagnosticFavicon|dns-status-table|styles\.finding/);
});
