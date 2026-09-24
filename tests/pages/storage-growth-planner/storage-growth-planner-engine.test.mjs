import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  DEFAULT_STORAGE_GROWTH_INPUT,
  STORAGE_GROWTH_CALCULATION_VERSION,
  STORAGE_GROWTH_INPUT_VERSION,
  calculateStorageGrowthPlan,
  formatCapacity,
  formatMoney,
  validateStorageGrowthInput,
} from "../../../app/(site)/(tools)/(storage)/storage-growth-planner/storage-growth-planner-engine.ts";

const TB = 1_000_000_000_000n;

function input(overrides = {}) {
  return { ...DEFAULT_STORAGE_GROWTH_INPUT, ...overrides };
}

function values(candidate) {
  const result = calculateStorageGrowthPlan(candidate);
  assert.equal(result.status, "valid", JSON.stringify(result.issues));
  assert.ok(result.values);
  return result.values;
}

test("FF-001 matches the default capacity, runway, and TCO fixture", () => {
  const result = values(input());
  assert.equal(result.dataMembers, 4);
  assert.equal(result.rawCapacityBytes, 72n * TB);
  assert.equal(result.modeledUsableBytes, 48n * TB);
  assert.equal(result.reserveBytes, 9_600_000_000_000n);
  assert.equal(result.planningCapacityBytes, 38_400_000_000_000n);
  assert.deepEqual(result.demandBytes, [
    10n * TB,
    12n * TB,
    14_400_000_000_000n,
    17_280_000_000_000n,
    20_736_000_000_000n,
    24_883_200_000_000n,
  ]);
  assert.equal(result.shortfallYear, null);
  assert.equal(result.costs.hardwareMinor, 160_000n);
  assert.equal(result.energyWattHours, 2_628_000n);
  assert.equal(result.costs.powerMinor, 39_420n);
  assert.equal(result.costs.replacementMinor, 0n);
  assert.equal(result.costs.backupMinor, 0n);
  assert.equal(result.costs.totalMinor, 199_420n);
  assert.equal(result.metadata.calculatorId, "storage-growth-tco");
  assert.equal(result.metadata.calculationVersion, STORAGE_GROWTH_CALCULATION_VERSION);
  assert.equal(result.metadata.inputVersion, STORAGE_GROWTH_INPUT_VERSION);
});

test("FF-002 applies all layout branches and rejects impossible counts", () => {
  const fixtures = [
    ["mirror", "4", 2, 16n * TB, 16n * TB],
    ["single-parity", "5", 4, 32n * TB, 8n * TB],
    ["dual-parity", "6", 4, 32n * TB, 16n * TB],
  ];
  for (const [layout, driveCount, members, usable, redundancy] of fixtures) {
    const result = values(input({ layout, driveCount, driveSize: "8" }));
    assert.equal(result.dataMembers, members, layout);
    assert.equal(result.modeledUsableBytes, usable, layout);
    assert.equal(result.redundancyBytes, redundancy, layout);
    assert.equal(result.rawCapacityBytes, result.modeledUsableBytes + result.redundancyBytes, layout);
  }
  for (const [layout, driveCount] of [["mirror", "3"], ["single-parity", "2"], ["dual-parity", "3"]]) {
    const result = calculateStorageGrowthPlan(input({ layout, driveCount }));
    assert.equal(result.status, "invalid", `${layout} ${driveCount}`);
    assert.equal(result.values, null);
  }
});

test("FF-003 compounds whole-byte growth with half-up rounding", () => {
  const result = values(input({
    currentData: "0.000000000003",
    annualGrowth: "50",
    horizonYears: "3",
    reserve: "0",
    driveSize: "1",
    driveCount: "4",
  }));
  assert.deepEqual(result.demandBytes, [3n, 5n, 8n, 12n]);
});

test("FF-004 keeps each cost line in exact minor units", () => {
  const result = values(input({
    driveCount: "4",
    drivePrice: "1.01",
    enclosureCost: "0",
    averagePowerWatts: "500",
    hoursPerDay: "1",
    horizonYears: "1",
    electricityRate: "0.01",
    replacementReserve: "12.5",
    backupAnnualBudget: "0.01",
  }));
  assert.equal(result.costs.hardwareMinor, 404n);
  assert.equal(result.energyWattHours, 182_500n);
  assert.equal(result.costs.powerMinor, 183n);
  assert.equal(result.costs.replacementMinor, 51n);
  assert.equal(result.costs.backupMinor, 1n);
  assert.equal(result.costs.totalMinor, 639n);
  assert.equal(formatMoney(result.costs.totalMinor, "USD"), "$6.39");
});

test("FF-005 converts display units without changing source bytes", () => {
  const result = values(input({ currentData: "1", driveSize: "1" }));
  assert.equal(formatCapacity(result.planningCapacityBytes, "TB"), "3.20 TB");
  assert.equal(formatCapacity(result.planningCapacityBytes, "TiB"), "2.91 TiB");
  assert.equal(formatCapacity(TB, "TiB", 10), "0.9094947018 TiB");
  assert.equal(formatCapacity(1_099_511_627_776n, "TiB", 4), "1 TiB");
  assert.equal(result.input.driveSizeBytes, TB);
});

test("FF-007 treats equality as capacity and one byte over as year-zero shortfall", () => {
  const equal = values(input({ currentData: "16", driveCount: "4", driveSize: "10", reserve: "20", annualGrowth: "0" }));
  assert.equal(equal.planningCapacityBytes, 16n * TB);
  assert.equal(equal.shortfallYear, null);
  const over = values(input({ currentData: "16.000000000001", driveCount: "4", driveSize: "10", reserve: "20", annualGrowth: "0" }));
  assert.equal(over.shortfallYear, 0);
  assert.deepEqual(over.demandBytes.slice(0, 2), [16_000_000_000_001n, 16_000_000_000_001n]);
});

test("rejects grammar, bounds, extra keys, and invalid cost inputs", () => {
  const invalid = [
    input({ currentData: "" }),
    input({ currentData: "1e2" }),
    input({ annualGrowth: "20.001" }),
    input({ reserve: "50.01" }),
    input({ horizonYears: "0" }),
    input({ horizonYears: "11" }),
    input({ driveSize: "0.099999" }),
    input({ driveSize: "100.000001" }),
    input({ drivePrice: "-1" }),
    input({ electricityRate: "10.001" }),
    input({ averagePowerWatts: "2000.5" }),
    input({ hoursPerDay: "25" }),
    input({ currency: "CAD" }),
    input({ displayUnit: "GB" }),
    { ...input(), hostile: "value" },
  ];
  for (const candidate of invalid) {
    assert.equal(validateStorageGrowthInput(candidate), false, JSON.stringify(candidate));
    const result = calculateStorageGrowthPlan(candidate);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
  }
  for (const value of ["+1", "-1", "1,024", "1_024", "1e3", "0x10"]) {
    assert.equal(calculateStorageGrowthPlan(input({ currentData: value })).status, "invalid", value);
  }
  assert.equal(calculateStorageGrowthPlan(input({ drivePrice: "1.234" })).status, "invalid");
});

test("maximum valid inputs remain exact and deterministic", () => {
  const candidate = input({
    currentData: "1000",
    annualGrowth: "100",
    horizonYears: "10",
    reserve: "50",
    layout: "dual-parity",
    driveCount: "24",
    driveSize: "100",
    drivePrice: "100000",
    enclosureCost: "100000",
    averagePowerWatts: "2000",
    hoursPerDay: "24",
    electricityRate: "10",
    replacementReserve: "25",
    backupAnnualBudget: "100000",
  });
  const first = calculateStorageGrowthPlan(candidate);
  assert.equal(first.status, "valid");
  const started = performance.now();
  for (let index = 0; index < 100; index += 1) assert.deepEqual(calculateStorageGrowthPlan(candidate), first);
  assert.ok(performance.now() - started < 1000);
});
