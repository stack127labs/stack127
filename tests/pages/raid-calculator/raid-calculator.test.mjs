import assert from "node:assert/strict";
import test from "node:test";
import {
  createDriveInventory,
  decodeStorageState,
  equalFourTerabyteDrives,
  mixedTwoThreeFourFourDrives,
} from "../../../lib/storage/index.ts";
import {
  RAID_CALCULATION_VERSION,
  RAID_INPUT_VERSION,
  calculateRaidCapacity,
  raidCalculatorRegistry,
  raidLevels,
} from "../../../lib/storage/raid.ts";

const TB = 1_000_000_000_000n;

function input(level, drives = equalFourTerabyteDrives, groupSize = null) {
  return { level, drives: createDriveInventory(drives), groupSize };
}

function values(level, drives = equalFourTerabyteDrives, groupSize = null) {
  const result = calculateRaidCapacity(input(level, drives, groupSize));
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  return result.values;
}

test("supports the nine approved conventional layouts", () => {
  assert.deepEqual(raidLevels, [
    "raid0", "raid1", "raid5", "raid6", "raid10", "raid50", "raid60", "linear", "jbod",
  ]);
});

test("calculates equal-size RAID 0, 1, 5, and 6 capacity", () => {
  assert.equal(values("raid0").usableCapacityBytes.value, 16n * TB);
  assert.equal(values("raid1").usableCapacityBytes.value, 4n * TB);
  assert.equal(values("raid5").usableCapacityBytes.value, 12n * TB);
  assert.equal(values("raid6").usableCapacityBytes.value, 8n * TB);
});

test("separates mixed-size mismatch from RAID redundancy", () => {
  const raid5 = values("raid5", mixedTwoThreeFourFourDrives);
  assert.equal(raid5.rawCapacityBytes.value, 13n * TB);
  assert.equal(raid5.usableCapacityBytes.value, 6n * TB);
  assert.equal(raid5.redundancyBytes.value, 2n * TB);
  assert.equal(raid5.sizeMismatchBytes.value, 5n * TB);
  assert.equal(raid5.unavailableCapacityBytes.value, 7n * TB);
});

test("uses visible adjacent mirror pairs for conventional RAID 10", () => {
  const raid10 = values("raid10", mixedTwoThreeFourFourDrives, 2);
  assert.equal(raid10.usableCapacityBytes.value, 6n * TB);
  assert.equal(raid10.redundancyBytes.value, 6n * TB);
  assert.equal(raid10.sizeMismatchBytes.value, 1n * TB);
  assert.equal(raid10.groups.length, 2);
  assert.deepEqual(raid10.groups.map((group) => group.driveIds), [
    ["disk-1", "disk-2"],
    ["disk-3", "disk-4"],
  ]);
  assert.equal(raid10.failureTolerance.guaranteedFailures, 1);
  assert.equal(raid10.failureTolerance.maximumFailures, 2);
  assert.match(raid10.failureTolerance.statement, /one drive in each mirror pair/i);
});

test("calculates RAID 50 from explicit equal-count RAID 5 groups", () => {
  const drives = [2n, 2n, 3n, 4n, 4n, 4n].map((size, index) => ({
    id: `disk-${index + 1}`,
    capacityBytes: size * TB,
    role: "data",
  }));
  const raid50 = values("raid50", drives, 3);
  assert.equal(raid50.rawCapacityBytes.value, 19n * TB);
  assert.equal(raid50.usableCapacityBytes.value, 12n * TB);
  assert.equal(raid50.redundancyBytes.value, 6n * TB);
  assert.equal(raid50.sizeMismatchBytes.value, 1n * TB);
  assert.equal(raid50.groups.length, 2);
  assert.match(raid50.failureTolerance.statement, /one failed drive in every RAID 5 group/i);
});

test("calculates RAID 60 from explicit equal-count RAID 6 groups", () => {
  const drives = [2n, 2n, 2n, 3n, 4n, 4n, 4n, 4n].map((size, index) => ({
    id: `disk-${index + 1}`,
    capacityBytes: size * TB,
    role: "data",
  }));
  const raid60 = values("raid60", drives, 4);
  assert.equal(raid60.rawCapacityBytes.value, 25n * TB);
  assert.equal(raid60.usableCapacityBytes.value, 12n * TB);
  assert.equal(raid60.redundancyBytes.value, 12n * TB);
  assert.equal(raid60.sizeMismatchBytes.value, 1n * TB);
  assert.equal(raid60.failureTolerance.guaranteedFailures, 2);
  assert.equal(raid60.failureTolerance.maximumFailures, 4);
});

test("linear and JBOD use every supplied byte without claiming redundancy", () => {
  for (const level of ["linear", "jbod"]) {
    const result = values(level, mixedTwoThreeFourFourDrives);
    assert.equal(result.usableCapacityBytes.value, 13n * TB);
    assert.equal(result.redundancyBytes.value, 0n);
    assert.equal(result.sizeMismatchBytes.value, 0n);
    assert.equal(result.failureTolerance.guaranteedFailures, 0);
  }
});

test("every valid capacity result reconciles to raw bytes", () => {
  const cases = [
    ["raid0", equalFourTerabyteDrives, null],
    ["raid1", mixedTwoThreeFourFourDrives, null],
    ["raid5", mixedTwoThreeFourFourDrives, null],
    ["raid6", equalFourTerabyteDrives, null],
    ["raid10", mixedTwoThreeFourFourDrives, 2],
    ["linear", mixedTwoThreeFourFourDrives, null],
    ["jbod", mixedTwoThreeFourFourDrives, null],
  ];
  for (const [level, drives, groupSize] of cases) {
    const result = values(level, drives, groupSize);
    assert.equal(
      result.rawCapacityBytes.value,
      result.usableCapacityBytes.value + result.redundancyBytes.value + result.sizeMismatchBytes.value,
    );
    assert.ok(result.usableCapacityBytes.value <= result.rawCapacityBytes.value);
  }
});

test("returns structured invalid results for impossible drive counts and groups", () => {
  const twoDrives = equalFourTerabyteDrives.slice(0, 2);
  const threeDrives = equalFourTerabyteDrives.slice(0, 3);
  const invalidCases = [
    input("raid5", twoDrives),
    input("raid6", threeDrives),
    input("raid10", threeDrives, 2),
    input("raid50", equalFourTerabyteDrives, 3),
    input("raid60", equalFourTerabyteDrives, 4),
  ];

  for (const candidate of invalidCases) {
    const result = calculateRaidCapacity(candidate);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.ok(result.issues.some((issue) => issue.severity === "error"));
  }
});

test("keeps the classic small random write reference separate from performance", () => {
  assert.equal(values("raid0").smallRandomWrite.operations, 1);
  assert.equal(values("raid5").smallRandomWrite.operations, 4);
  assert.equal(values("raid6").smallRandomWrite.operations, 6);
  assert.equal(values("raid10", equalFourTerabyteDrives, 2).smallRandomWrite.operations, 2);
  assert.match(values("raid5").smallRandomWrite.statement, /not a performance prediction/i);
});

test("pins shared URL state to calculation and input version 1", () => {
  const encoded = raidCalculatorRegistry.encode("raid-capacity", input("raid5"));
  const state = decodeStorageState(encoded);
  assert.equal(state.calculatorVersion, RAID_CALCULATION_VERSION);
  assert.equal(state.inputVersion, RAID_INPUT_VERSION);
  assert.equal(raidCalculatorRegistry.runEncoded(encoded).values.usableCapacityBytes.value, 12n * TB);
});
