import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  DEFAULT_DRIVE_RELIABILITY_INPUT,
  DRIVE_RELIABILITY_CALCULATION_VERSION,
  DRIVE_RELIABILITY_INPUT_VERSION,
  calculateAnnualizedFailureRate,
  calculateEvidenceRange,
  encodeDriveReliabilityState,
  parseDriveReliabilityState,
  resolveDriveReliability,
  validateDriveReliabilitySnapshot,
} from "../../../lib/drive-reliability.ts";

const snapshotPath = path.resolve(
  import.meta.dirname,
  "../../../app/(site)/(tools)/(storage)/drive-reliability/data/drive-reliability-snapshot.json",
);

function snapshot() {
  return JSON.parse(readFileSync(snapshotPath, "utf8"));
}

test("the reviewed snapshot has a valid versioned schema", () => {
  const result = validateDriveReliabilitySnapshot(snapshot());
  assert.deepEqual(result, { valid: true, errors: [] });
});

test("RF-001 calculates the Q1 aggregate AFR from drive days", () => {
  const result = resolveDriveReliability(snapshot(), {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    periodId: "q1-2026",
    search: "all analyzed drives",
  });
  assert.equal(result.status, "ready");
  assert.equal(result.primary?.model, "All analyzed drives");
  assert.equal(result.primary?.failures, 1030);
  assert.equal(result.primary?.driveDays, 30203180);
  assert.ok(Math.abs(result.primary?.afrPercent - 1.24473648139037) < 1e-12);
  assert.equal(result.primary?.displayAfrPercent, "1.24%");
});

test("RF-002 resolves the annual aggregate without falling back to Q1", () => {
  const result = resolveDriveReliability(snapshot(), {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    periodId: "annual-2025",
    search: "all analyzed drives",
  });
  assert.equal(result.status, "ready");
  assert.equal(result.primary?.periodId, "annual-2025");
  assert.equal(result.primary?.driveDays, 115638676);
  assert.equal(result.primary?.failures, 4317);
  assert.equal(result.primary?.displayAfrPercent, "1.36%");
});

test("RF-003 resolves the lifetime aggregate with its lifetime exposure", () => {
  const result = resolveDriveReliability(snapshot(), {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    periodId: "lifetime",
    search: "all analyzed drives",
  });
  assert.equal(result.status, "ready");
  assert.equal(result.primary?.periodId, "lifetime");
  assert.equal(result.primary?.driveDays, 529968464);
  assert.equal(result.primary?.failures, 20212);
  assert.equal(result.primary?.displayAfrPercent, "1.39%");
});

test("RF-004 keeps a model cohort attached to the selected lifetime period", () => {
  const result = resolveDriveReliability(snapshot(), {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    periodId: "lifetime",
    search: "HUH728080ALE600",
  });
  assert.equal(result.status, "ready");
  assert.equal(result.primary?.model, "HUH728080ALE600");
  assert.equal(result.primary?.driveDays, 3252052);
  assert.equal(result.primary?.failures, 125);
  assert.equal(result.primary?.displayAfrPercent, "1.40%");
  assert.equal(result.primary?.periodId, "lifetime");
});

test("RF-005 handles zero observed failures without a negative range", () => {
  const rate = calculateAnnualizedFailureRate(0, 16740);
  const range = calculateEvidenceRange(0, 16740);
  assert.equal(rate, 0);
  assert.equal(range.lowPercent, 0);
  assert.ok(range.highPercent > 0);
});

test("RF-006 returns no-data rather than a stale result for an unknown model", () => {
  const result = resolveDriveReliability(snapshot(), {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    search: "not-a-real-drive-model",
  });
  assert.equal(result.status, "no-data");
  assert.equal(result.primary, null);
  assert.deepEqual(result.selected, []);
});

test("period, manufacturer, and capacity filters are applied before selection", () => {
  const result = resolveDriveReliability(snapshot(), {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    periodId: "q1-2026",
    manufacturer: "Toshiba",
    minCapacityTb: 16,
    maxCapacityTb: 16,
    selectedModelIds: ["q1-2026:toshiba:mg08aca16ta"],
  });
  assert.equal(result.status, "ready");
  assert.ok(result.rows.length > 0);
  assert.ok(result.rows.every((row) => row.manufacturer === "Toshiba" && row.capacityTb === 16));
  assert.equal(result.selected.length, 1);
});

test("model or manufacturer search matches manufacturers without case sensitivity", () => {
  const result = resolveDriveReliability(snapshot(), {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    search: " wDc ",
  });
  assert.equal(result.status, "ready");
  assert.ok(result.rows.length > 0);
  assert.ok(result.rows.every((row) => row.manufacturer === "WDC"));
});

test("selection is capped at three records and unknown IDs are dropped", () => {
  const result = resolveDriveReliability(snapshot(), {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    selectedModelIds: [
      "q1-2026:hgst:hms5c4040ble640",
      "q1-2026:hgst:huh728080ale600",
      "q1-2026:seagate:st8000dm002",
      "q1-2026:seagate:st8000nm002",
    ],
  });
  assert.equal(result.selected.length, 3);
  assert.equal(new Set(result.selected.map((row) => row.id)).size, 3);
});

test("share state is versioned and round-trips supported values only", () => {
  const input = {
    ...DEFAULT_DRIVE_RELIABILITY_INPUT,
    periodId: "lifetime",
    search: " WUH722222ALE6L4 ",
    manufacturer: "WDC",
    minCapacityTb: 20,
    maxCapacityTb: 24,
    showSmallCohorts: true,
    selectedModelIds: ["lifetime:wdc:wuh722222ale6l4"],
  };
  const encoded = encodeDriveReliabilityState(input);
  assert.ok(encoded.includes(DRIVE_RELIABILITY_INPUT_VERSION));
  assert.deepEqual(parseDriveReliabilityState(encoded).input, {
    ...input,
    search: "WUH722222ALE6L4",
  });
});

test("hostile and oversized share values are bounded", () => {
  const encoded = encodeURIComponent(JSON.stringify({
    v: "drive-reliability-input-v1",
    periodId: "not-real",
    search: "<script>alert(1)</script>".repeat(100),
    selectedModelIds: ["one", "two", "three", "four", "five"],
    unknown: "ignored",
  }));
  const parsed = parseDriveReliabilityState(encoded);
  assert.equal(parsed.input.periodId, DEFAULT_DRIVE_RELIABILITY_INPUT.periodId);
  assert.ok(parsed.input.search.length <= 120);
  assert.equal(parsed.input.selectedModelIds.length, 3);
  assert.ok(parsed.warnings.length > 0);
});

test("invalid source rows are rejected instead of producing a plausible AFR", () => {
  const invalid = {
    ...snapshot(),
    rows: [...snapshot().rows, {
      id: "invalid",
      periodId: "q1-2026",
      cohortType: "model",
      manufacturer: "Bad",
      model: "Bad",
      capacityTb: 1,
      driveCount: 1,
      driveDays: 0,
      failures: 1,
      averageAgeMonths: null,
      includedBySource: true,
    }],
  };
  const result = validateDriveReliabilitySnapshot(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("driveDays")));
});

test("resolution and formula versions remain explicit", () => {
  assert.equal(DRIVE_RELIABILITY_CALCULATION_VERSION, "drive-reliability-v1");
  assert.equal(DRIVE_RELIABILITY_INPUT_VERSION, "drive-reliability-input-v1");
});
