import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  BACKUP_321_CALCULATOR_ID,
  BACKUP_321_CALCULATION_VERSION,
  BACKUP_321_INPUT_VERSION,
  DEFAULT_BACKUP_321_INPUT,
  calculateBackup321Capacity,
  formatBackup321Capacity,
  formatBackup321Seconds,
  validateBackup321Input,
} from "../../../lib/storage/backup-321.ts";

const GB = 1_000_000_000n;
const TB = 1_000_000_000_000n;
const TiB = 1_099_511_627_776n;

function input(overrides = {}) {
  return { ...DEFAULT_BACKUP_321_INPUT, ...overrides };
}

function values(candidate = DEFAULT_BACKUP_321_INPUT) {
  const result = calculateBackup321Capacity(candidate);
  assert.equal(result.status, "valid", JSON.stringify(result.issues));
  assert.ok(result.values);
  return result.values;
}

test("FF-001 matches the ordinary full-plus-incremental plan exactly", () => {
  const result = values();
  assert.equal(result.projectedSourceBytes.value, 3_456_000_000_000n);
  assert.equal(result.changedPerPointBytes.value, 172_800_000_000n);
  assert.equal(result.fullOnlyRepositoryBytes.value, 103_680_000_000_000n);
  assert.equal(result.fullPlusIncrementalRepositoryBytes.value, 8_467_200_000_000n);
  assert.equal(result.repositoryBytes.value, 8_467_200_000_000n);
  assert.equal(result.headroomBytes.value, 1_693_440_000_000n);
  assert.equal(result.targetBytes.value, 10_160_640_000_000n);
  assert.equal(result.localTargetBytes.value, result.targetBytes.value);
  assert.equal(result.offsiteTargetBytes.value, result.targetBytes.value);
  assert.equal(result.totalTargetBytes.value, 20_321_280_000_000n);
  assert.equal(formatBackup321Capacity(result.targetBytes.value, "TB"), "10.16 TB");
  assert.equal(formatBackup321Capacity(result.totalTargetBytes.value, "TB"), "20.32 TB");
});

test("FF-001b keeps short nonzero restores visible as seconds", () => {
  assert.equal(formatBackup321Seconds(1n), "1 second");
  assert.equal(formatBackup321Seconds(59n), "59 seconds");
  assert.equal(formatBackup321Seconds(3_599n), "3599 seconds");
  assert.equal(formatBackup321Seconds(3_600n), "1 hour");
});

test("FF-002 and FF-003 keep the full-only and incremental branches separate", () => {
  const fullOnly = values(input({
    sourceData: "10",
    sourceUnit: "GB",
    annualGrowth: "0",
    horizonYears: "0",
    backupModel: "full-only",
    retainedPoints: "4",
    changedPerBackup: "25",
    headroom: "0",
  }));
  assert.equal(fullOnly.projectedSourceBytes.value, 10n * GB);
  assert.equal(fullOnly.changedPerPointBytes.value, 2_500_000_000n);
  assert.equal(fullOnly.repositoryBytes.value, 40n * GB);

  const incremental = values(input({
    sourceData: "10",
    sourceUnit: "GB",
    annualGrowth: "0",
    horizonYears: "0",
    retainedPoints: "4",
    changedPerBackup: "25",
    headroom: "0",
  }));
  assert.equal(incremental.repositoryBytes.value, 17_500_000_000n);
  assert.equal(incremental.totalTargetBytes.value, 35_000_000_000n);
});

test("FF-004 applies ceil-rounded headroom independently to both targets", () => {
  const zero = values(input({ headroom: "0" }));
  const twenty = values(input({ headroom: "20" }));
  const fifty = values(input({ headroom: "50" }));
  assert.equal(zero.targetBytes.value, 8_467_200_000_000n);
  assert.equal(twenty.targetBytes.value, 10_160_640_000_000n);
  assert.equal(fifty.targetBytes.value, 12_700_800_000_000n);
  for (const result of [zero, twenty, fifty]) {
    assert.equal(result.localTargetBytes.value, result.offsiteTargetBytes.value);
    assert.equal(result.totalTargetBytes.value, result.localTargetBytes.value * 2n);
    assert.equal(result.targetBytes.value, result.repositoryBytes.value + result.headroomBytes.value);
  }
});

test("FF-005 compounds and rounds whole bytes after each year", () => {
  const result = values(input({
    sourceData: "0.001000001",
    sourceUnit: "GB",
    annualGrowth: "50",
    horizonYears: "2",
    retainedPoints: "2",
    changedPerBackup: "0.01",
    headroom: "0.01",
  }));
  assert.equal(result.sourceBytes.value, 1_000_001n);
  assert.deepEqual(result.growthSeriesBytes, [1_000_001n, 1_500_002n, 2_250_003n]);
  assert.equal(result.changedPerPointBytes.value, 226n);
  assert.equal(result.repositoryBytes.value, 2_250_229n);
  assert.equal(result.headroomBytes.value, 226n);
  assert.equal(result.targetBytes.value, 2_250_455n);
  assert.equal(result.totalTargetBytes.value, 4_500_910n);
});

test("FF-006 keeps decimal and binary source bytes exact while display is separate", () => {
  const decimal = values(input({ sourceData: "1", sourceUnit: "TB", annualGrowth: "0", horizonYears: "0", retainedPoints: "1", headroom: "0", changedPerBackup: "0" }));
  const binary = values(input({ sourceData: "1", sourceUnit: "TiB", annualGrowth: "0", horizonYears: "0", retainedPoints: "1", headroom: "0", changedPerBackup: "0" }));
  assert.equal(decimal.sourceBytes.value, TB);
  assert.equal(binary.sourceBytes.value, TiB);
  assert.equal(formatBackup321Capacity(decimal.sourceBytes.value, "TiB"), "0.91 TiB");
  assert.equal(formatBackup321Capacity(binary.sourceBytes.value, "TB"), "1.1 TB");
  assert.equal(formatBackup321Capacity(1_005_000_000_000n, "TB"), "1.01 TB");
  assert.equal(formatBackup321Capacity(1n, "TB"), "<0.01 TB");
});

test("FF-007 calculates optional recovery with exact RPO and RTO checks", () => {
  const result = values(input({
    recoveryChecksEnabled: true,
    backupIntervalHours: "24",
    targetRpoHours: "24",
    targetRtoHours: "12",
    localRestoreMbps: "1000",
    offsiteRestoreMbps: "100",
    transferEfficiency: "80",
  }));
  assert.ok(result.recovery);
  assert.equal(result.recovery.rpoPasses, true);
  assert.equal(result.recovery.localRestoreSeconds.value, 34_560n);
  assert.equal(result.recovery.offsiteRestoreSeconds.value, 345_600n);
  assert.equal(result.recovery.localRtoPasses, true);
  assert.equal(result.recovery.offsiteRtoPasses, false);
});

test("FF-008 leaves disabled recovery inert and absent", () => {
  const baseline = values();
  const changed = values(input({
    backupIntervalHours: "1",
    targetRpoHours: "720",
    targetRtoHours: "1",
    localRestoreMbps: "0.01",
    offsiteRestoreMbps: "100000",
    transferEfficiency: "1",
  }));
  assert.equal(changed.recovery, null);
  assert.equal(changed.targetBytes.value, baseline.targetBytes.value);
  assert.equal(changed.totalTargetBytes.value, baseline.totalTargetBytes.value);
});

test("valid results expose the evidence contract and estimated classifications", () => {
  const result = calculateBackup321Capacity(DEFAULT_BACKUP_321_INPUT);
  assert.equal(result.status, "valid");
  assert.equal(result.calculator.id, BACKUP_321_CALCULATOR_ID);
  assert.equal(result.calculator.version, BACKUP_321_CALCULATION_VERSION);
  assert.equal(result.engineVersion, 1);
  assert.ok(result.values);
  assert.equal(result.values.inputVersion, BACKUP_321_INPUT_VERSION);
  assert.ok(result.assumptions.length >= 1);
  assert.ok(result.derivation.length >= 5);
  assert.ok(result.derivation.every((step) => step.id && step.expression && step.result));
  assert.ok(result.sources.length >= 4);
  assert.ok(result.sources.every((source) => /^https?:\/\//.test(source.url) && /^2026-09-10$/.test(source.checkedAt)));
  assert.equal(result.uncertainty.kind, "modelled");
  assert.match(result.uncertainty.statement, /product|model/i);
  assert.equal(result.values.targetBytes.classification, "estimated");
  assert.equal(result.values.localTargetBytes.classification, "estimated");
  assert.deepEqual(result.values.copyRelationship.positions, { source: 1, localTarget: 2, offsiteTarget: 3 });
  for (const key of ["compliant", "safetyScore", "isolated"]) assert.equal(result.values.copyRelationship[key], undefined);
});

test("rejects exact-shape, grammar, enum, and boundary violations without values", () => {
  const exactKeys = Object.keys(DEFAULT_BACKUP_321_INPUT).sort();
  assert.deepEqual(exactKeys, [
    "annualGrowth", "backupIntervalHours", "backupModel", "changedPerBackup", "displayUnit",
    "headroom", "horizonYears", "localRestoreMbps", "offsiteRestoreMbps", "recoveryChecksEnabled",
    "retainedPoints", "sourceData", "sourceUnit", "targetRpoHours", "targetRtoHours", "transferEfficiency",
  ]);
  assert.equal(validateBackup321Input(DEFAULT_BACKUP_321_INPUT), true);

  for (const candidate of [
    { ...DEFAULT_BACKUP_321_INPUT, extra: "ignored" },
    Object.fromEntries(Object.entries(DEFAULT_BACKUP_321_INPUT).filter(([key]) => key !== "sourceData")),
    { ...DEFAULT_BACKUP_321_INPUT, sourceData: 2 },
    null,
    [],
    { ...DEFAULT_BACKUP_321_INPUT, sourceData: "01" },
    { ...DEFAULT_BACKUP_321_INPUT, sourceData: "1,000" },
    { ...DEFAULT_BACKUP_321_INPUT, sourceData: "1e3" },
    { ...DEFAULT_BACKUP_321_INPUT, sourceData: "+1" },
    { ...DEFAULT_BACKUP_321_INPUT, sourceData: "1." },
    { ...DEFAULT_BACKUP_321_INPUT, annualGrowth: "20.001" },
    { ...DEFAULT_BACKUP_321_INPUT, horizonYears: "3.0" },
    { ...DEFAULT_BACKUP_321_INPUT, sourceUnit: "tb" },
    { ...DEFAULT_BACKUP_321_INPUT, recoveryChecksEnabled: "false" },
  ]) {
    const result = calculateBackup321Capacity(candidate);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.ok(result.issues.some((issue) => issue.severity === "error"));
  }

  const boundaries = [
    ["sourceData", "0.000999999", "GB"],
    ["sourceData", "1000.000001", "TB"],
    ["annualGrowth", "100.01"],
    ["horizonYears", "11"],
    ["retainedPoints", "0"],
    ["retainedPoints", "1001"],
    ["changedPerBackup", "100.01"],
    ["headroom", "50.01"],
  ];
  for (const [field, value, unit] of boundaries) {
    const result = calculateBackup321Capacity(input({ [field]: value, ...(unit ? { sourceUnit: unit } : {}) }));
    assert.equal(result.status, "invalid", `${field}=${value}`);
    assert.equal(result.values, null);
  }
});

test("rejects invalid enabled recovery fields but accepts inert disabled fields", () => {
  for (const [field, value] of [
    ["backupIntervalHours", "0"], ["targetRpoHours", "721"], ["targetRtoHours", "0"],
    ["localRestoreMbps", "0"], ["offsiteRestoreMbps", "100000.01"], ["transferEfficiency", "0.99"],
  ]) {
    const result = calculateBackup321Capacity(input({ recoveryChecksEnabled: true, [field]: value }));
    assert.equal(result.status, "invalid", `${field}=${value}`);
    assert.equal(result.values, null);
    assert.ok(result.issues.some((issue) => issue.path === field));
  }
  assert.equal(calculateBackup321Capacity(input({ localRestoreMbps: "not-used" })).status, "valid");
});

test("maximum valid input stays deterministic and uses bigint capacity values", () => {
  const candidate = input({
    sourceData: "1000",
    sourceUnit: "TB",
    annualGrowth: "100",
    horizonYears: "10",
    retainedPoints: "1000",
    changedPerBackup: "100",
    headroom: "50",
  });
  const first = calculateBackup321Capacity(candidate);
  assert.equal(first.status, "valid");
  const digest = JSON.stringify(first, (_, value) => typeof value === "bigint" ? `${value}n` : value);
  for (let index = 0; index < 100; index += 1) {
    const repeated = calculateBackup321Capacity(candidate);
    assert.equal(JSON.stringify(repeated, (_, value) => typeof value === "bigint" ? `${value}n` : value), digest);
  }
  assert.equal(typeof first.values.targetBytes.value, "bigint");
});

test("the pure engine has no browser, UI, network, or persistence dependency", () => {
  const source = readFileSync(new URL("../../../lib/storage/backup-321.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /react|fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|navigator\.|document\.|window\.|sendBeacon|cookie/i);
});
