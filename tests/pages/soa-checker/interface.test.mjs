import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { groupSoaObservations } from "../../../lib/dns/diagnostic-presentation.ts";
import { buildSoaComparison } from "../../../app/(site)/(tools)/soa-checker/soa-checker-view.ts";

const root = process.cwd();
const source = readFileSync(path.join(root, "app/(site)/(tools)/soa-checker/soa-checker.tsx"), "utf8");
const viewSource = readFileSync(path.join(root, "app/(site)/(tools)/soa-checker/soa-checker-view.ts"), "utf8");
const stylesPath = path.join(root, "app/(site)/(tools)/soa-checker/soa-checker.module.css");
const styles = existsSync(stylesPath) ? readFileSync(stylesPath, "utf8") : "";

const baseSoa = {
  ownerName: "example.com",
  primaryNameserver: "ns1.example.net",
  responsibleMailbox: "hostmaster.example.com",
  serial: 4294967295,
  refreshSeconds: 3600,
  retrySeconds: 600,
  expireSeconds: 1209600,
  minimumSeconds: 300,
  ttlSeconds: 900,
};

function observation(address, soa = baseSoa, overrides = {}) {
  return {
    server: { hostname: address.endsWith("10") ? "ns1.example.net" : "ns2.example.net", address },
    skippedReason: null,
    soa,
    authoritative: true,
    error: null,
    rawResponses: { udp: { Status: 0 }, tcp: { Status: 0 } },
    ...overrides,
  };
}

function result(observations) {
  return {
    checkedAt: "2026-09-05T10:00:00.000Z",
    durationMs: 420,
    ipv6Connectivity: true,
    query: { inputName: "www.example.com", zone: "example.com" },
    observations,
    summary: { allAnswered: true, serialsAgree: true, newestSerial: 4294967295, differences: [] },
  };
}

test("SOA comparison follows RFC 1982 wraparound and names every differing field", () => {
  const comparison = buildSoaComparison(result([
    observation("192.0.2.10"),
    observation("198.51.100.20", { ...baseSoa, serial: 0, refreshSeconds: 7200 }),
  ]));

  assert.equal(comparison.newestSerial, 0);
  assert.equal(comparison.serialOrder, "defined");
  assert.deepEqual(comparison.differingFields, ["serial", "refreshSeconds"]);
  assert.equal(
    comparison.lead,
    "SOA records for example.com disagree. RFC 1982 identifies serial 0 as newest; serial and refresh differ across the checked authoritative replies.",
  );
});

test("SOA comparison refuses to guess across the RFC 1982 half range", () => {
  const comparison = buildSoaComparison(result([
    observation("192.0.2.10", { ...baseSoa, serial: 0 }),
    observation("198.51.100.20", { ...baseSoa, serial: 2147483648 }),
  ]));

  assert.equal(comparison.newestSerial, null);
  assert.equal(comparison.serialOrder, "undefined");
  assert.match(comparison.lead, /RFC 1982 cannot order them unambiguously/);
});

test("full agreement needs usable authoritative evidence and every field", () => {
  const agreement = buildSoaComparison(result([
    observation("192.0.2.10"),
    observation("192.0.2.11", baseSoa, { server: { hostname: "ns1.example.net", address: "192.0.2.11" } }),
  ]));
  assert.equal(agreement.state, "agree");
  assert.match(agreement.lead, /agree on every value, including serial 4,294,967,295/);

  const oneAddress = buildSoaComparison(result([observation("192.0.2.10")]));
  assert.match(oneAddress.lead, /All 1 checked address for example\.com/);
  assert.doesNotMatch(oneAddress.lead, /1 checked addresses/);

  const sameSerialDifferentTtl = buildSoaComparison(result([
    observation("192.0.2.10"),
    observation("198.51.100.20", { ...baseSoa, ttlSeconds: 120 }),
  ]));
  assert.equal(sameSerialDifferentTtl.state, "disagree");
  assert.deepEqual(sameSerialDifferentTtl.differingFields, ["ttlSeconds", "negativeCacheTtlSeconds"]);
  assert.match(sameSerialDifferentTtl.lead, /SOA TTL and negative-cache time differ/);
});

test("failed and skipped sources produce incomplete conclusions without false disagreement", () => {
  const failed = buildSoaComparison(result([
    observation("192.0.2.10", null, { authoritative: false, error: "UDP timed out." }),
  ]));
  assert.equal(failed.state, "incomplete");
  assert.match(failed.lead, /ns1\.example\.net at 192\.0\.2\.10/);
  assert.match(failed.lead, /UDP timed out/);
  assert.doesNotMatch(failed.lead, /uDP|udp timed out/);
  assert.doesNotMatch(failed.lead, /agree|different serials/);

  const skipped = buildSoaComparison(result([
    observation("2001:db8::10", null, {
      authoritative: false,
      error: null,
      skippedReason: "checker_ipv6_unavailable",
      server: { hostname: "ns1.example.net", address: "2001:db8::10" },
    }),
  ]));
  assert.equal(skipped.state, "incomplete");
  assert.match(skipped.lead, /no route to any discovered address/);
  assert.equal(skipped.showTable, true);

  const checkedWithSkip = buildSoaComparison(result([
    observation("192.0.2.10"),
    observation("2001:db8::10", null, {
      authoritative: false,
      error: null,
      skippedReason: "checker_ipv6_unavailable",
      server: { hostname: "ns1.example.net", address: "2001:db8::10" },
    }),
  ]));
  assert.equal(checkedWithSkip.state, "agree");
  assert.match(checkedWithSkip.lead, /addresses this checker could query/);
  assert.doesNotMatch(checkedWithSkip.lead, /failed|no reply/);

  const empty = buildSoaComparison(result([]));
  assert.equal(empty.showTable, false);
  assert.match(empty.lead, /agreement cannot be determined/);
});

test("SOA grouping never merges different authority states", () => {
  const grouped = groupSoaObservations([
    observation("192.0.2.10", null, { authoritative: true, error: "No SOA record was returned." }),
    observation("192.0.2.11", null, {
      authoritative: false,
      error: "No SOA record was returned.",
      server: { hostname: "ns1.example.net", address: "192.0.2.11" },
    }),
  ]);
  assert.equal(grouped.length, 2);
});

test("SOA checker uses the contracted shared controls and one comparison table", () => {
  for (const component of [
    "ToolTextField",
    "ToolButton",
    "ToolStatus",
    "ToolResultLead",
    "ToolDataTable",
    "ToolDisclosure",
    "ToolRawOutput",
    "ToolDownloadAction",
  ]) assert.match(source, new RegExp(component));

  assert.equal((source.match(/<ToolResultLead/g) ?? []).length, 1);
  assert.equal((source.match(/<ToolDataTable/g) ?? []).length, 1);
  assert.doesNotMatch(source, /DiagnosticResultHeader|DiagnosticFavicon|DownloadResultButton|ToolTimeline|ToolProgressBar|ToolPrimaryResult|<article|<details/);
  assert.match(viewSource, /lib\/dns\/serial-arithmetic\.ts/);
  assert.doesNotMatch(viewSource, /lib\/dns\/diagnostics\.ts/);
});

test("SOA route styles contain wide evidence without widening the page", () => {
  assert.match(styles, /\.workbench\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.results\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.comparison\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /\.rawSources\s*\{[^}]*min-width:\s*0/s);
  assert.match(styles, /@media\s*\(max-width:\s*640px\)/);
  assert.match(styles, /\.submit\s*\{[^}]*width:\s*100%/s);
});
