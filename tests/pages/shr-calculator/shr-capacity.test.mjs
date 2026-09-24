import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_SHR_DRIVES,
  SHR_CALCULATION_VERSION,
  SHR_INPUT_VERSION,
  decodeShrState,
  encodeShrState,
  calculateShrCapacity,
  parseCapacity,
} from "../../../app/(site)/(tools)/(storage)/shr-calculator/shr-capacity.ts";

const GB = 1_000_000_000n;
const TB = 1_000_000_000_000n;
const TiB = 1_099_511_627_776n;

function drives(values, unit = "TB") {
  return values.map((value, index) => ({
    id: `drive-${index + 1}`,
    capacityBytes: parseCapacity(String(value), unit),
  }));
}

function values(mode, capacities, unit = "TB") {
  const result = calculateShrCapacity({ mode, drives: drives(capacities, unit) });
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  return result.values;
}

test("parses exact decimal and binary capacity units", () => {
  assert.equal(parseCapacity("4", "TB"), 4n * TB);
  assert.equal(parseCapacity("4000", "GB"), 4n * TB);
  assert.equal(parseCapacity("4", "TiB"), 4n * TiB);
  assert.equal(parseCapacity("4", "GiB"), 4n * 1_073_741_824n);
  assert.equal(parseCapacity("1.5", "TB"), 1_500_000_000_000n);
});

test("rejects unsafe capacity grammar and fractional bytes", () => {
  for (const value of ["", " ", "0", "-1", "+1", "1e3", "1,000", "1 000", "4 TB", "<img>"]) {
    assert.throws(() => parseCapacity(value, "TB"), { name: "ShrInputError" });
  }
  assert.throws(() => parseCapacity("0.1", "GiB"), { name: "ShrInputError" });
});

test("calculates the minimum SHR-1 fixture", () => {
  const result = values("shr1", [4, 4]);
  assert.equal(result.rawCapacityBytes, 8n * TB);
  assert.equal(result.dataBeforeSystemBytes, 4n * TB);
  assert.equal(result.protectionBytes, 4n * TB);
  assert.equal(result.unusedBytes, 0n);
  assert.equal(result.systemReserveBytes, 20n * GB);
  assert.equal(result.estimatedPoolCapacityBytes, 4n * TB - 20n * GB);
});

test("calculates the minimum SHR-2 fixture", () => {
  const result = values("shr2", [4, 4, 4, 4]);
  assert.equal(result.rawCapacityBytes, 16n * TB);
  assert.equal(result.dataBeforeSystemBytes, 8n * TB);
  assert.equal(result.protectionBytes, 8n * TB);
  assert.equal(result.unusedBytes, 0n);
  assert.equal(result.estimatedPoolCapacityBytes, 8n * TB - 40n * GB);
});

test("separates mixed SHR-1 tiers", () => {
  const result = values("shr1", [4, 4, 8, 8]);
  assert.equal(result.rawCapacityBytes, 24n * TB);
  assert.equal(result.dataBeforeSystemBytes, 16n * TB);
  assert.equal(result.protectionBytes, 8n * TB);
  assert.equal(result.unusedBytes, 0n);
  assert.deepEqual(result.tiers.map((tier) => [tier.startBytes, tier.endBytes, tier.activeDrives, tier.dataBytes, tier.protectionBytes, tier.unusedBytes]), [
    [0n, 4n * TB, 4, 12n * TB, 4n * TB, 0n],
    [4n * TB, 8n * TB, 2, 4n * TB, 4n * TB, 0n],
  ]);
});

test("separates mixed SHR-2 protection from an unused high tier", () => {
  const result = values("shr2", [4, 4, 8, 8]);
  assert.equal(result.dataBeforeSystemBytes, 8n * TB);
  assert.equal(result.protectionBytes, 8n * TB);
  assert.equal(result.unusedBytes, 8n * TB);
  assert.equal(result.tiers.at(-1)?.activeDrives, 2);
  assert.equal(result.tiers.at(-1)?.unusedBytes, 8n * TB);
});

test("handles one-drive and two-drive high tiers", () => {
  const shr1 = values("shr1", [4, 4, 4, 8]);
  assert.equal(shr1.dataBeforeSystemBytes, 12n * TB);
  assert.equal(shr1.protectionBytes, 4n * TB);
  assert.equal(shr1.unusedBytes, 4n * TB);

  const shr2 = values("shr2", [4, 4, 4, 8]);
  assert.equal(shr2.dataBeforeSystemBytes, 8n * TB);
  assert.equal(shr2.protectionBytes, 8n * TB);
  assert.equal(shr2.unusedBytes, 4n * TB);
});

test("returns structured invalid results for mode minimums and bounds", () => {
  for (const candidate of [
    { mode: "shr1", drives: drives([4]) },
    { mode: "shr2", drives: drives([4, 4, 4]) },
    { mode: "shr1", drives: drives([]) },
    { mode: "shr1", drives: Array.from({ length: MAX_SHR_DRIVES + 1 }, (_, index) => ({ id: `drive-${index}`, capacityBytes: TB })) },
  ]) {
    const result = calculateShrCapacity(candidate);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.ok(result.issues.some((issue) => issue.severity === "error"));
  }
});

test("reconciles every valid result and never returns negative categories", () => {
  const cases = [
    ["shr1", [2, 3, 4, 4]],
    ["shr1", [4, 4, 8, 8]],
    ["shr2", [2, 3, 4, 4, 8, 8]],
    ["shr2", [4, 4, 4, 8]],
  ];
  for (const [mode, capacities] of cases) {
    const result = values(mode, capacities);
    assert.equal(result.rawCapacityBytes, result.dataBeforeSystemBytes + result.protectionBytes + result.unusedBytes);
    for (const key of ["rawCapacityBytes", "dataBeforeSystemBytes", "protectionBytes", "unusedBytes", "systemReserveBytes", "estimatedPoolCapacityBytes"]) {
      assert.ok(result[key] >= 0n, `${key} should not be negative`);
    }
  }
});

test("is invariant to editor order", () => {
  const original = values("shr1", [2, 3, 4, 4, 8]);
  const reversed = values("shr1", [8, 4, 2, 4, 3]);
  assert.deepEqual(
    [reversed.rawCapacityBytes, reversed.dataBeforeSystemBytes, reversed.protectionBytes, reversed.unusedBytes],
    [original.rawCapacityBytes, original.dataBeforeSystemBytes, original.protectionBytes, original.unusedBytes],
  );
});

test("keeps SHR-2 capacity no greater than SHR-1", () => {
  for (const capacities of [[4, 4, 4, 4], [2, 3, 4, 4, 8, 8], [10, 12, 16, 20, 24]]) {
    const shr1 = values("shr1", capacities);
    const shr2 = values("shr2", capacities);
    assert.ok(shr2.estimatedPoolCapacityBytes <= shr1.estimatedPoolCapacityBytes);
    assert.equal(shr1.parityDrives, 1);
    assert.equal(shr2.parityDrives, 2);
  }
});

test("clamps a system reserve larger than the data tier", () => {
  const result = values("shr1", [1, 1], "GB");
  assert.equal(result.dataBeforeSystemBytes, 1n * GB);
  assert.equal(result.systemReserveBytes, 20n * GB);
  assert.equal(result.estimatedPoolCapacityBytes, 0n);
  assert.ok(result.warnings.some((warning) => /reserve/i.test(warning)));
});

test("round-trips explicit versioned input state without serializing results", () => {
  const input = { mode: "shr1", drives: drives([4, 4, 8, 8]) };
  const encoded = encodeShrState(input);
  const restored = decodeShrState(encoded);
  assert.equal(restored.calculatorId, "shr-capacity");
  assert.equal(restored.calculationVersion, SHR_CALCULATION_VERSION);
  assert.equal(restored.inputVersion, SHR_INPUT_VERSION);
  assert.deepEqual(restored.payload, input);
  assert.doesNotMatch(encoded, /15\.96|estimatedPoolCapacity|protectionBytes/);
});

test("rejects malformed, future, oversized, unsafe, and duplicate state", () => {
  for (const encoded of ["broken", "e30", "eyJfX3Byb3RvX18iOnsidG9wIjoiYmFkIn19"]) {
    assert.throws(() => decodeShrState(encoded), { name: "ShrStateError" });
  }
  const input = { mode: "shr1", drives: drives([4, 4]) };
  const good = JSON.parse(Buffer.from(encodeShrState(input), "base64url").toString("utf8"));
  for (const payload of [
    { ...good, calculationVersion: SHR_CALCULATION_VERSION + 1 },
    { ...good, inputVersion: SHR_INPUT_VERSION + 1 },
    { ...good, calculatorId: "other" },
    { ...good, payload: { ...good.payload, drives: [{ id: "drive-1", capacityBytes: "1" }, { id: "drive-1", capacityBytes: "1" }] } },
    { ...good, payload: { ...good.payload, drives: [{ id: "drive-1", capacityBytes: "+1" }, { id: "drive-2", capacityBytes: "1" }] } },
  ]) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
    assert.throws(() => decodeShrState(encoded), { name: "ShrStateError" });
  }
});

test("keeps the maximum calculation deterministic and fast", () => {
  const input = { mode: "shr2", drives: Array.from({ length: MAX_SHR_DRIVES }, (_, index) => ({
    id: `drive-${index + 1}`,
    capacityBytes: BigInt(index + 1) * TB,
  })) };
  const started = performance.now();
  const first = calculateShrCapacity(input);
  const elapsed = performance.now() - started;
  const second = calculateShrCapacity(input);
  assert.equal(first.status, "valid");
  assert.deepEqual(second.values, first.values);
  assert.ok(elapsed < 10, `calculation took ${elapsed.toFixed(2)}ms`);
});
