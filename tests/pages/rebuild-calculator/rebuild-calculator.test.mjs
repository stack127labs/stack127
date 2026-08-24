import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  FORMULA_VERSION,
  calculateRebuildExposure,
  DEFAULT_INPUT,
  normalizeRebuildInput,
} from "../../../lib/rebuild-calculator/engine.ts";

function input(overrides = {}) {
  return { ...DEFAULT_INPUT, ...overrides };
}

function success(overrides = {}) {
  const result = calculateRebuildExposure(input(overrides));
  assert.equal(result.status, "success", JSON.stringify(result));
  return result;
}

test("pins the formula version and default result", () => {
  assert.equal(FORMULA_VERSION, "rebuild-exposure-v1");
  const result = success();
  assert.equal(result.sourceDriveEquivalents, 4);
  assert.equal(result.readBytes, 32_000_000_000_000);
  assert.equal(result.copySeconds, 213333.33333333334);
  assert.equal(result.readErrorProbability, 0.22585803120775164);
  assert.equal(result.readErrorTolerance, 1);
  assert.equal(result.formulaVersion, FORMULA_VERSION);
});

test("calculates all supported RAID branches", () => {
  const raid1 = success({ raidLevel: "raid1", driveCount: "2", driveCapacity: "2", rebuildThroughput: "100", ureExponent: "14", replacementDelay: "2" });
  assert.equal(raid1.sourceDriveEquivalents, 1);
  assert.equal(raid1.readBytes, 2_000_000_000_000);
  assert.equal(raid1.copySeconds, 20_000);
  assert.equal(raid1.degradedSeconds, 27_200);
  assert.equal(raid1.readErrorTolerance, 0);
  assert.equal(raid1.readErrorProbability, 0.14785621103378865);

  const raid5 = success({ raidLevel: "raid5", driveCount: "4", driveCapacity: "4", rebuildThroughput: "200", memberReadScope: "50" });
  assert.equal(raid5.sourceDriveEquivalents, 3);
  assert.equal(raid5.readBytes, 6_000_000_000_000);
  assert.equal(raid5.copySeconds, 30_000);
  assert.equal(raid5.readErrorProbability, 0.04686621292249526);
  assert.equal(raid5.readErrorTolerance, 0);

  const raid6 = success({ raidLevel: "raid6", driveCount: "4", driveCapacity: "1", rebuildThroughput: "1000", ureExponent: "16" });
  assert.equal(raid6.sourceDriveEquivalents, 2);
  assert.equal(raid6.readBytes, 2_000_000_000_000);
  assert.equal(raid6.readErrorProbability, 0.0015987206823936874);
  assert.equal(raid6.readErrorTolerance, 1);

  const raid10 = success({ raidLevel: "raid10", driveCount: "6", driveCapacity: "6", rebuildThroughput: "250" });
  assert.equal(raid10.sourceDriveEquivalents, 1);
  assert.equal(raid10.readBytes, 6_000_000_000_000);
  assert.equal(raid10.copySeconds, 24_000);
  assert.equal(raid10.readErrorProbability, 0.04686621292249526);
  assert.equal(raid10.readErrorTolerance, 0);
});

test("normalizes equivalent decimal capacity units", () => {
  const tb = success({ raidLevel: "raid5", driveCount: "4", driveCapacity: "8", capacityUnit: "TB" });
  const gb = success({ raidLevel: "raid5", driveCount: "4", driveCapacity: "8000", capacityUnit: "GB" });
  const pb = success({ raidLevel: "raid5", driveCount: "4", driveCapacity: "0.008", capacityUnit: "PB" });
  for (const result of [gb, pb]) {
    assert.equal(result.memberBytes, tb.memberBytes);
    assert.equal(result.readBytes, tb.readBytes);
    assert.equal(result.copySeconds, tb.copySeconds);
    assert.equal(result.readErrorProbability, tb.readErrorProbability);
  }
});

test("applies scope and delay to only the intended derivation steps", () => {
  const full = success({ raidLevel: "raid5", driveCount: "4", driveCapacity: "4", memberReadScope: "100", replacementDelay: "0" });
  const half = success({ raidLevel: "raid5", driveCount: "4", driveCapacity: "4", memberReadScope: "50", replacementDelay: "0" });
  const delayed = success({ raidLevel: "raid5", driveCount: "4", driveCapacity: "4", memberReadScope: "100", replacementDelay: "6" });
  assert.equal(half.readBytes, full.readBytes / 2);
  assert.equal(half.copySeconds, full.copySeconds / 2);
  assert.ok(Math.abs(half.readErrorProbability - (1 - Math.sqrt(1 - full.readErrorProbability))) < 1e-15);
  assert.equal(delayed.readBytes, full.readBytes);
  assert.equal(delayed.copySeconds, full.copySeconds);
  assert.equal(delayed.readErrorProbability, full.readErrorProbability);
  assert.equal(delayed.degradedSeconds, full.degradedSeconds + 21_600);
});

test("rejects layout-specific counts and returns no plausible result", () => {
  const invalid = [
    ["raid1", "1"], ["raid5", "2"], ["raid6", "3"], ["raid10", "3"],
    ["raid5", "21"], ["raid6", "21"], ["raid10", "21"], ["raid10", "5"],
  ];
  for (const [raidLevel, driveCount] of invalid) {
    const result = calculateRebuildExposure(input({ raidLevel, driveCount }));
    assert.equal(result.status, "invalid", JSON.stringify(result));
    assert.equal("readBytes" in result, false);
    assert.equal("readErrorProbability" in result, false);
    assert.ok(result.errors.driveCount);
  }
});

test("rejects empty, hostile, fractional, locale, sign, and exponent input", () => {
  const invalidValues = ["", " ", "abc", "1,5", "+2", "-2", "1e3", "3.2", "<img src=x>", "Infinity", "NaN"];
  for (const driveCount of invalidValues) {
    const result = calculateRebuildExposure(input({ driveCount }));
    assert.equal(result.status, "invalid", driveCount);
    assert.ok(result.errors.driveCount, driveCount);
  }
  assert.equal(calculateRebuildExposure(input({ driveCount: "08" })).status, "success");
});

test("rejects numeric boundaries and non-finite values", () => {
  const cases = [
    ["driveCapacity", "0"], ["driveCapacity", "100001"], ["rebuildThroughput", "0"],
    ["rebuildThroughput", "100001"], ["memberReadScope", "0"], ["memberReadScope", "101"],
    ["replacementDelay", "-1"], ["replacementDelay", "8760.01"], ["ureExponent", "13"],
  ];
  for (const [field, value] of cases) {
    const result = calculateRebuildExposure(input({ [field]: value }));
    assert.equal(result.status, "invalid", `${field}=${value}`);
    assert.ok(result.errors[field], `${field}=${value}`);
  }
  for (const value of [NaN, Infinity, -Infinity]) {
    const result = calculateRebuildExposure(input({ driveCapacity: value }));
    assert.equal(result.status, "invalid");
    assert.ok(result.errors.driveCapacity);
  }
});

test("keeps probability stable and bounded at exposure extremes", () => {
  const tiny = success({ raidLevel: "raid1", driveCount: "2", driveCapacity: "0.000001", capacityUnit: "GB", rebuildThroughput: "100000", ureExponent: "16" });
  const huge = success({ raidLevel: "raid6", driveCount: "20", driveCapacity: "100000", capacityUnit: "TB", rebuildThroughput: "1", ureExponent: "14" });
  assert.ok(tiny.readErrorProbability > 0);
  assert.ok(tiny.readErrorProbability < 0.000000001);
  assert.ok(huge.readErrorProbability > 0.999999);
  for (const result of [tiny, huge]) assert.ok(result.readErrorProbability >= 0 && result.readErrorProbability <= 1);
});

test("rejects unexpected shapes without mutating caller input", () => {
  const extraPrototypeKey = { ...input() };
  Object.defineProperty(extraPrototypeKey, "__proto__", { enumerable: true, value: "bad" });
  for (const candidate of [null, [], { ...input(), extra: "bad" }, { ...input(), raidLevel: "unknown" }, extraPrototypeKey]) {
    const result = calculateRebuildExposure(candidate);
    assert.equal(result.status, "invalid");
    assert.equal("readBytes" in result, false);
  }
  const original = input();
  const snapshot = structuredClone(original);
  calculateRebuildExposure(original);
  assert.deepEqual(original, snapshot);
});

test("is deterministic and fast without browser globals", () => {
  const candidate = Object.freeze(input());
  const expected = calculateRebuildExposure(candidate);
  const started = performance.now();
  for (let index = 0; index < 10_000; index += 1) assert.deepEqual(calculateRebuildExposure(candidate), expected);
  assert.ok(performance.now() - started < 5000);
  assert.deepEqual(candidate, input());
});

test("normalization returns a stable input object for valid values", () => {
  const result = normalizeRebuildInput(input());
  assert.equal(result.status, "success");
  if (result.status === "success") {
    assert.equal(result.value.driveCount, 6);
    assert.equal(result.value.memberReadScope, 100);
    assert.equal(result.value.ureBits, 1e15);
    assert.equal(result.value.replacementDelaySeconds, 0);
  }
});
