import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  CEPH_CALCULATION_VERSION,
  CEPH_INPUT_VERSION,
  MAX_OSDS,
  MAX_ROWS,
  calculateCephCapacity,
  decodeCephInput,
  formatBytes,
  parseCapacityBytes,
  serializeCephInput,
  validateCephInput,
} from "../../../app/(site)/(tools)/(storage)/ceph-capacity-calculator/ceph-capacity-engine.ts";

const TB = 1_000_000_000_000n;
const GB = 1_000_000_000n;
const TiB = 1_099_511_627_776n;

function batch(id, domain, osdCount, capacityBytes) {
  return { id, domain, osdCount, capacityBytes };
}

function input(batches, overrides = {}) {
  return {
    mode: "replicated",
    replicaSize: 3,
    k: null,
    m: null,
    failureDomain: "host",
    reserveBasisPoints: 2_000,
    batches,
    ...overrides,
  };
}

function validValues(value) {
  const result = calculateCephCapacity(value);
  assert.equal(result.status, "valid", JSON.stringify(result.issues));
  assert.ok(result.values);
  return result.values;
}

test("parses exact decimal and binary capacities", () => {
  assert.equal(parseCapacityBytes("1.5", "TB"), 1_500_000_000_000n);
  assert.equal(parseCapacityBytes("1.5", "TiB"), 1_649_267_441_664n);
  assert.equal(parseCapacityBytes("0.000000001", "GB"), 1n);
  assert.equal(parseCapacityBytes("00012", "TB"), 12n * TB);
  assert.throws(() => parseCapacityBytes("1e3", "GB"));
  assert.throws(() => parseCapacityBytes("-1", "GB"));
  assert.throws(() => parseCapacityBytes("1,000", "GB"));
  assert.throws(() => parseCapacityBytes("0", "GB"));
  assert.throws(() => parseCapacityBytes("0.0000000001", "GB"));
});

test("matches the replicated fixture exactly", () => {
  const result = validValues(input([
    batch("a", "host-a", 1, 4n * TB),
    batch("b", "host-b", 1, 4n * TB),
    batch("c", "host-c", 1, 4n * TB),
  ]));
  assert.deepEqual({
    rawBytes: result.rawBytes,
    modeledUsableBytes: result.modeledUsableBytes,
    protectionOverheadBytes: result.protectionOverheadBytes,
    reserveBytes: result.reserveBytes,
    targetBytes: result.targetBytes,
    requiredDomains: result.requiredDomains,
    placementStatus: result.placementStatus,
  }, {
    rawBytes: 12n * TB,
    modeledUsableBytes: 4n * TB,
    protectionOverheadBytes: 8n * TB,
    reserveBytes: 800n * GB,
    targetBytes: 3_200n * GB,
    requiredDomains: 3,
    placementStatus: "minimum-met",
  });
});

test("matches the EC fixture and domain requirement", () => {
  const result = validValues(input([
    batch("h1", "host-1", 1, 4n * TB),
    batch("h2", "host-2", 1, 4n * TB),
    batch("h3", "host-3", 1, 4n * TB),
    batch("h4", "host-4", 1, 4n * TB),
    batch("h5", "host-5", 1, 4n * TB),
    batch("h6", "host-6", 1, 4n * TB),
  ], { mode: "erasure", replicaSize: null, k: 4, m: 2, reserveBasisPoints: 0 }));
  assert.equal(result.rawBytes, 24n * TB);
  assert.equal(result.modeledUsableBytes, 16n * TB);
  assert.equal(result.protectionOverheadBytes, 8n * TB);
  assert.equal(result.requiredDomains, 6);
  assert.equal(result.protectionRatio.dataShards, 4);
  assert.equal(result.protectionRatio.totalShards, 6);
});

test("groups repeated case-insensitive domains and retains mixed raw capacity", () => {
  const result = validValues(input([
    batch("a1", "host-a", 2, 4n * TB),
    batch("a2", "Host-A", 1, 2n * TB),
    batch("b1", "host-b", 3, 4n * TB),
    batch("c1", "host-c", 3, 3n * TB),
  ], { failureDomain: "rack", reserveBasisPoints: 0 }));
  assert.equal(result.rawBytes, 31n * TB);
  assert.equal(result.domains.length, 3);
  assert.deepEqual(result.domains.map((domain) => [domain.label, domain.osdCount, domain.rawBytes]), [
    ["host-a", 3, 10n * TB],
    ["host-b", 3, 12n * TB],
    ["host-c", 3, 9n * TB],
  ]);
  assert.equal(result.largestDomainLoss.domainLabel, "host-b");
  assert.equal(result.largestDomainLoss.survivingRawBytes, 19n * TB);
  assert.equal(result.largestDomainLoss.placementStatus, "degraded-placement");
});

test("rejects fewer domains than an EC profile requires", () => {
  const result = calculateCephCapacity(input([
    batch("a", "host-a", 1, TB),
    batch("b", "host-b", 1, TB),
    batch("c", "host-c", 1, TB),
    batch("d", "host-d", 1, TB),
    batch("e", "host-e", 1, TB),
  ], { mode: "erasure", replicaSize: null, k: 4, m: 2 }));
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  assert.ok(result.issues.some((issue) => issue.field === "domains"));
});

test("reports placement states and keeps baseline separate from loss", () => {
  const minimum = validValues(input([
    batch("a", "a", 1, 2n * TB),
    batch("b", "b", 1, 6n * TB),
    batch("c", "c", 1, 4n * TB),
  ]));
  assert.equal(minimum.placementStatus, "minimum-met");
  assert.equal(minimum.largestDomainLoss.domainLabel, "b");
  assert.equal(minimum.largestDomainLoss.lostRawBytes, 6n * TB);
  assert.equal(minimum.largestDomainLoss.survivingRawBytes, 6n * TB);
  assert.equal(minimum.largestDomainLoss.modeledUsableBytes, 2n * TB);
  assert.equal(minimum.largestDomainLoss.placementStatus, "degraded-placement");

  const extra = validValues(input([
    batch("a", "a", 1, 2n * TB),
    batch("b", "b", 1, 6n * TB),
    batch("c", "c", 1, 4n * TB),
    batch("d", "d", 1, TB),
  ]));
  assert.equal(extra.placementStatus, "extra-domain-headroom");
  assert.equal(extra.modeledUsableBytes, 13n * TB / 3n);
  assert.equal(extra.largestDomainLoss.placementStatus, "minimum-met");
});

test("validates profile, reserve, inventory, and identity limits", () => {
  for (const profile of [
    { mode: "replicated", replicaSize: 1, k: null, m: null },
    { mode: "replicated", replicaSize: 6, k: null, m: null },
    { mode: "erasure", replicaSize: null, k: 1, m: 1 },
    { mode: "erasure", replicaSize: null, k: 2, m: 0 },
    { mode: "erasure", replicaSize: null, k: 13, m: 4 },
  ]) {
    const result = validateCephInput(input([batch("a", "a", 1, TB), batch("b", "b", 1, TB), batch("c", "c", 1, TB)], profile));
    assert.equal(result.status, "invalid");
  }
  assert.equal(validateCephInput(input([batch("a", "a", 1, TB), batch("b", "b", 1, TB), batch("c", "c", 1, TB)], { reserveBasisPoints: 5_001 })).status, "invalid");
  assert.equal(validateCephInput(input([batch("a", "a", 1, TB), batch("a", "b", 1, TB), batch("c", "c", 1, TB)])).status, "invalid");
  assert.equal(validateCephInput(input([])).status, "invalid");
});

test("rounds display values without floating point artifacts", () => {
  assert.equal(formatBytes(0n, "TB"), "0 TB");
  assert.equal(formatBytes(1n, "TB"), "<0.01 TB");
  assert.equal(formatBytes(1_005_000_000_000n, "TB"), "1.01 TB");
  assert.equal(formatBytes(TiB, "TiB"), "1 TiB");
});

test("serializes normalized inputs without calculated values and round-trips", () => {
  const original = input([
    batch("a", " Host-A ", 2, 4n * TB),
    batch("b", "host-b", 2, 4n * TB),
    batch("c", "host-c", 2, 4n * TB),
  ]);
  const encoded = serializeCephInput(original);
  assert.match(encoded, /^[A-Za-z0-9_-]+$/);
  const decoded = decodeCephInput(encoded);
  assert.ok(decoded);
  assert.equal(decoded.mode, original.mode);
  assert.equal(decoded.batches[0].domain, "Host-A");
  assert.equal(decoded.batches[0].capacityBytes, 4n * TB);
  assert.doesNotMatch(encoded, /12|4000000000000/);
  assert.equal(CEPH_INPUT_VERSION, "ceph-capacity-input-1");
  assert.equal(CEPH_CALCULATION_VERSION, "ceph-capacity-1");
});

test("rejects malformed, wrong-version, and oversized shared state", () => {
  for (const encoded of ["", "not-base64", "e30", "eyJ2ZXJzaW9uIjoid3JvbmcifQ", "A".repeat(40_000)]) {
    assert.equal(decodeCephInput(encoded), null);
  }
});

test("stays deterministic and within the focused inventory budget", () => {
  const batches = Array.from({ length: MAX_ROWS }, (_, index) => batch(
    `row-${index + 1}`,
    `host-${index + 1}`,
    8,
    100n * TB,
  ));
  const value = input(batches, { replicaSize: 3 });
  const start = performance.now();
  let first = null;
  for (let index = 0; index < 100; index += 1) {
    const result = calculateCephCapacity(value);
    assert.equal(result.status, "valid");
    const digest = `${result.values.rawBytes}:${result.values.modeledUsableBytes}:${result.values.largestDomainLoss.domainLabel}`;
    first ??= digest;
    assert.equal(digest, first);
  }
  const elapsed = performance.now() - start;
  assert.ok(elapsed < 1_000, `unexpectedly slow fixture: ${elapsed.toFixed(2)}ms`);
  assert.equal(MAX_OSDS, 256);
});
