import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_DRIVE_CAPACITY_BYTES,
  UNRAID_CALCULATOR_ID,
  UNRAID_CALCULATION_VERSION,
  UNRAID_INPUT_VERSION,
  bytesFromUnit,
  calculateUnraidCapacity,
  decodeUnraidState,
  encodeUnraidState,
  parseUnraidCapacity,
  validateUnraidCalculatorInput,
} from "../../../app/(site)/(tools)/(storage)/unraid-calculator/unraid-calculator-engine.ts";

const GB = 1_000_000_000n;
const TB = 1_000_000_000_000n;
const TIB = 1_099_511_627_776n;

function drive(id, size, unit = "TB") {
  return { id, capacityBytes: bytesFromUnit(size, unit) };
}

function input(parityMode, parity, data, proposed = null) {
  return { parityMode, parity, data, proposed };
}

function resultFor(candidate) {
  const result = calculateUnraidCapacity(candidate);
  assert.equal(result.calculator.id, UNRAID_CALCULATOR_ID);
  assert.equal(result.calculator.version, UNRAID_CALCULATION_VERSION);
  return result;
}

function validValues(candidate) {
  const result = resultFor(candidate);
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  return result.values;
}

test("declares the route-local calculator and input versions", () => {
  assert.equal(UNRAID_CALCULATOR_ID, "unraid-main-array");
  assert.equal(UNRAID_CALCULATION_VERSION, 1);
  assert.equal(UNRAID_INPUT_VERSION, 1);
});

test("parses supported decimal and binary units without floating point", () => {
  assert.equal(parseUnraidCapacity("1.5", "TiB").bytes, 1_649_267_441_664n);
  assert.equal(parseUnraidCapacity("0.000000001", "GB").bytes, 1n);
  assert.equal(parseUnraidCapacity("4.0", "TB").bytes, 4n * TB);
  assert.throws(() => parseUnraidCapacity("1e3", "GB"));
  assert.throws(() => parseUnraidCapacity("01", "GB"));
  assert.throws(() => parseUnraidCapacity("0.1", "B"));
});

test("enforces positive capacity and the exact per-drive maximum", () => {
  assert.equal(parseUnraidCapacity("1000000000000", "TB").bytes, MAX_DRIVE_CAPACITY_BYTES);
  assert.throws(() => parseUnraidCapacity("1000000000000.000000000001", "TB"));
  assert.throws(() => parseUnraidCapacity("0", "TB"));
  assert.throws(() => parseUnraidCapacity("-1", "TB"));
  assert.throws(() => parseUnraidCapacity("1", "PB"));
});

test("calculates zero parity from explicit data roles", () => {
  const values = validValues(input("none", [], [drive("data-1", "4"), drive("data-2", "2")]));
  assert.equal(values.dataCapacityBytes.value, 6n * TB);
  assert.equal(values.assignedParityCapacityBytes.value, 0n);
  assert.equal(values.rawInstalledCapacityBytes.value, 6n * TB);
  assert.equal(values.parityFloorBytes, null);
  assert.equal(values.parityHeadroomBytes, 0n);
  assert.equal(values.protection.mode, "none");
  assert.equal(values.growth.status, "absent");
});

test("calculates the approved single parity fixture", () => {
  const values = validValues(input("single", [drive("parity-1", "8")], [
    drive("data-1", "8"), drive("data-2", "8"), drive("data-3", "4"), drive("data-4", "4"),
  ]));
  assert.equal(values.dataCapacityBytes.value, 24n * TB);
  assert.equal(values.assignedParityCapacityBytes.value, 8n * TB);
  assert.equal(values.rawInstalledCapacityBytes.value, 32n * TB);
  assert.equal(values.largestDataDriveBytes, 8n * TB);
  assert.equal(values.parityFloorBytes, 8n * TB);
  assert.equal(values.parityHeadroomBytes, 0n);
  assert.equal(values.protection.guaranteedFailures, 1);
});

test("calculates unequal dual parity and keeps headroom separate", () => {
  const candidate = input("dual", [drive("parity-1", "8"), drive("parity-2", "10")], [
    drive("data-1", "8"), drive("data-2", "6"), drive("data-3", "2"),
  ]);
  const values = validValues(candidate);
  assert.equal(values.dataCapacityBytes.value, 16n * TB);
  assert.equal(values.assignedParityCapacityBytes.value, 18n * TB);
  assert.equal(values.rawInstalledCapacityBytes.value, 34n * TB);
  assert.equal(values.parityFloorBytes, 8n * TB);
  assert.equal(values.parityHeadroomBytes, 2n * TB);
  assert.deepEqual(values.topology.map((row) => row.id), ["parity-1", "parity-2", "data-1", "data-2", "data-3"]);
});

test("rejects a parity disk smaller than the largest current data disk", () => {
  const result = resultFor(input("dual", [drive("parity-1", "8"), drive("parity-2", "7")], [
    drive("data-1", "8"), drive("data-2", "6"),
  ]));
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  assert.match(result.issues.find((issue) => issue.path === "parity-2")?.message ?? "", /largest data drive/i);
});

test("preserves explicit role order instead of sorting by capacity", () => {
  const values = validValues(input("dual", [drive("parity-1", "10"), drive("parity-2", "8")], [
    drive("data-1", "4"), drive("data-2", "8"),
  ]));
  assert.deepEqual(values.topology.map((row) => row.id), ["parity-1", "parity-2", "data-1", "data-2"]);
  assert.equal(values.dataCapacityBytes.value, 12n * TB);
});

test("keeps mixed decimal and binary capacities exact", () => {
  const values = validValues(input("single", [drive("parity-1", "2")], [
    drive("data-1", "500", "GB"), drive("data-2", "1", "TiB"),
  ]));
  assert.equal(values.dataCapacityBytes.value, 500n * GB + TIB);
  assert.equal(values.assignedParityCapacityBytes.value, 2n * TB);
  assert.equal(values.rawInstalledCapacityBytes.value, 500n * GB + TIB + 2n * TB);
});

test("calculates eligible proposed growth at the parity ceiling", () => {
  const values = validValues(input("single", [drive("parity-1", "8")], [
    drive("data-1", "8"), drive("data-2", "4"),
  ], drive("proposed-data-1", "8")));
  assert.equal(values.growth.status, "eligible");
  assert.equal(values.growth.capacityGainBytes, 8n * TB);
  assert.equal(values.growth.projectedDataCapacityBytes, 20n * TB);
  assert.equal(values.growth.projectedRawInstalledCapacityBytes, 28n * TB);
});

test("blocks proposed growth above every undersized parity disk", () => {
  const values = validValues(input("dual", [drive("parity-1", "8"), drive("parity-2", "8")], [
    drive("data-1", "8"), drive("data-2", "6"),
  ], drive("proposed-data-1", "9")));
  assert.equal(values.growth.status, "blocked");
  assert.deepEqual(values.growth.dependencies, ["parity-1", "parity-2"]);
  assert.equal("projectedDataCapacityBytes" in values.growth, false);
});

test("allows proposed growth without a parity ceiling", () => {
  const values = validValues(input("none", [], [drive("data-1", "2")], drive("proposed-data-1", "20")));
  assert.equal(values.growth.status, "eligible");
  assert.equal(values.growth.capacityGainBytes, 20n * TB);
  assert.equal(values.growth.projectedDataCapacityBytes, 22n * TB);
});

test("returns no values for incomplete, malformed, unsafe, duplicate, and over-limit input", () => {
  const cases = [
    { parityMode: "single", parity: [], data: [], proposed: null },
    input("single", [drive("parity-1", "8")], [drive("data-1", "0")]),
    input("single", [drive("parity-1", "8")], [drive("data-1", "8"), { id: "data-1", capacityBytes: 4n * TB }]),
    { parityMode: "single", parity: [{ id: "parity-1", capacityBytes: 8n * TB, extra: true }], data: [drive("data-1", "4")], proposed: null },
    { parityMode: "dual", parity: [drive("parity-1", "8")], data: [drive("data-1", "4")], proposed: null },
    { parityMode: "none", parity: [], data: Array.from({ length: 65 }, (_, index) => drive(`data-${index + 1}`, "1")), proposed: null },
  ];
  for (const candidate of cases) {
    const result = resultFor(candidate);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.ok(result.issues.some((issue) => issue.severity === "error"));
  }
  assert.equal(validateUnraidCalculatorInput({}), false);
});

test("round-trips only versioned normalized inputs through safe state", () => {
  const candidate = input("dual", [drive("parity-1", "10"), drive("parity-2", "8")], [
    drive("data-1", "4"), drive("data-2", "8"),
  ], drive("proposed-data-1", "8"));
  const encoded = encodeUnraidState(candidate);
  const state = decodeUnraidState(encoded);
  assert.equal(state.calculatorId, UNRAID_CALCULATOR_ID);
  assert.equal(state.calculatorVersion, 1);
  assert.equal(state.inputVersion, 1);
  assert.equal(state.payload.proposed.capacityBytes, 8n * TB);
  assert.deepEqual(state.payload.data.map((row) => row.id), ["data-1", "data-2"]);
  assert.deepEqual(resultFor(state.payload).values, resultFor(candidate).values);
  assert.throws(() => decodeUnraidState("not-base64url"));
});

test("is deterministic for the fixed 64-row boundary", () => {
  const candidate = input(
    "dual",
    [drive("parity-1", "100"), drive("parity-2", "100")],
    Array.from({ length: 62 }, (_, index) => drive(`data-${index + 1}`, String(index + 1), index % 2 ? "TB" : "GB")),
    drive("proposed-data-1", "100", "TB"),
  );
  const first = resultFor(candidate);
  assert.equal(first.status, "valid");
  for (let index = 0; index < 40; index += 1) {
    assert.deepEqual(resultFor(candidate), first);
  }
});
