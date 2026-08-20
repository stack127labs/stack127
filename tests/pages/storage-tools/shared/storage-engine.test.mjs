import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_ENGINE_VERSION,
  MAX_DRIVE_CAPACITY_BYTES,
  MAX_STORAGE_DRIVES,
  MAX_STORAGE_STATE_JSON_BYTES,
  STORAGE_STATE_SCHEMA,
  STORAGE_STATE_SCHEMA_VERSION,
  StorageStateError,
  StorageValidationError,
  bytesFromUnit,
  canonicalizeDriveInventory,
  createDriveInventory,
  createStorageCalculationResult,
  createStorageCalculatorRegistry,
  decodeStorageState,
  encodeStorageState,
  equalFourTerabyteDrives,
  formatBytes,
  mixedTwoThreeFourFourDrives,
  storageValue,
  sumDriveCapacity,
  summarizeDriveInventory,
  validateDriveInventory,
} from "../../../../lib/storage/index.ts";

test("converts decimal and binary capacity units without floating-point arithmetic", () => {
  assert.equal(bytesFromUnit("2", "TB"), 2_000_000_000_000n);
  assert.equal(bytesFromUnit("1.5", "TB"), 1_500_000_000_000n);
  assert.equal(bytesFromUnit("1.5", "TiB"), 1_649_267_441_664n);
  assert.equal(bytesFromUnit("0.001", "KB"), 1n);
});

test("rejects capacities that cannot be represented as a whole byte", () => {
  assert.throws(() => bytesFromUnit("0.1", "B"), StorageValidationError);
  assert.throws(() => bytesFromUnit("1e3", "GB"), StorageValidationError);
  assert.throws(() => bytesFromUnit("-1", "TB"), StorageValidationError);
  assert.throws(() => bytesFromUnit("", "TB"), StorageValidationError);
});

test("formats arbitrarily large byte values without converting the value to Number", () => {
  assert.equal(formatBytes(1_500_000_000_000n, "TB"), "1.5 TB");
  assert.equal(formatBytes(1_649_267_441_664n, "TiB"), "1.5 TiB");
  assert.equal(formatBytes(9_999_999_999_999_999_999_999n, "TB", { maximumFractionDigits: 3 }), "10000000000 TB");
});

test("formatting rounds half up and never changes the underlying byte value", () => {
  const bytes = 1_234_567_890_123n;
  assert.equal(formatBytes(bytes, "TB", { maximumFractionDigits: 2 }), "1.23 TB");
  assert.equal(bytes, 1_234_567_890_123n);
  assert.equal(formatBytes(1_999n, "KB", { maximumFractionDigits: 0 }), "2 KB");
});

test("creates a normalized, immutable drive inventory", () => {
  const inventory = createDriveInventory([
    { id: " disk-b ", label: " Archive ", capacityBytes: 4_000_000_000_000n, role: "data" },
    { id: "disk-a", capacityBytes: 2_000_000_000_000n, role: "parity", groupId: " group-1 " },
  ]);

  assert.equal(inventory[0].id, "disk-b");
  assert.equal(inventory[0].label, "Archive");
  assert.equal(inventory[1].groupId, "group-1");
  assert.ok(Object.isFrozen(inventory));
  assert.ok(Object.isFrozen(inventory[0]));
});

test("reports every material inventory validation problem", () => {
  const validation = validateDriveInventory([
    { id: "same", capacityBytes: 0n, role: "data" },
    { id: "same", capacityBytes: 2_000n, role: "mystery" },
    { id: " ", capacityBytes: -1n, role: "data" },
  ]);

  assert.equal(validation.valid, false);
  assert.deepEqual(
    new Set(validation.issues.map((issue) => issue.code)),
    new Set(["duplicate_drive_id", "empty_drive_id", "invalid_capacity", "invalid_drive_role"]),
  );
});

test("enforces explicit inventory and per-drive capacity limits", () => {
  assert.equal(validateDriveInventory([
    { id: "maximum", capacityBytes: MAX_DRIVE_CAPACITY_BYTES, role: "data" },
  ]).valid, true);

  const tooLarge = validateDriveInventory([
    { id: "too-large", capacityBytes: MAX_DRIVE_CAPACITY_BYTES + 1n, role: "data" },
  ]);
  assert.ok(tooLarge.issues.some((issue) => issue.code === "capacity_too_large"));

  const tooMany = Array.from({ length: MAX_STORAGE_DRIVES + 1 }, (_, index) => ({
    id: `disk-${index}`,
    capacityBytes: 1n,
    role: "data",
  }));
  assert.ok(validateDriveInventory(tooMany).issues.some((issue) => issue.code === "too_many_drives"));
});

test("rejects empty inventories unless a caller explicitly permits them", () => {
  assert.equal(validateDriveInventory([]).valid, false);
  assert.equal(validateDriveInventory([], { allowEmpty: true }).valid, true);
});

test("throws a structured validation error when inventory creation is invalid", () => {
  assert.throws(
    () => createDriveInventory([{ id: "disk-1", capacityBytes: 0n, role: "data" }]),
    (error) => error instanceof StorageValidationError
      && error.issues.some((issue) => issue.code === "invalid_capacity"),
  );
});

test("canonical ordering and capacity totals are independent of input order", () => {
  const forward = createDriveInventory(equalFourTerabyteDrives);
  const reverse = createDriveInventory([...equalFourTerabyteDrives].reverse());

  assert.deepEqual(canonicalizeDriveInventory(forward), canonicalizeDriveInventory(reverse));
  assert.equal(sumDriveCapacity(forward), 16_000_000_000_000n);
  assert.equal(sumDriveCapacity(reverse), 16_000_000_000_000n);
});

test("capacity totals can select roles without mutating the inventory", () => {
  const inventory = createDriveInventory([
    { id: "data", capacityBytes: 4_000n, role: "data" },
    { id: "parity", capacityBytes: 4_000n, role: "parity" },
    { id: "spare", capacityBytes: 8_000n, role: "spare" },
  ]);

  assert.equal(sumDriveCapacity(inventory, { roles: ["data", "parity"] }), 8_000n);
  assert.equal(inventory.length, 3);
});

test("inventory summaries expose exact totals, size bounds, and role totals", () => {
  const inventory = createDriveInventory([
    { id: "small", capacityBytes: 2_000n, role: "data" },
    { id: "large", capacityBytes: 4_000n, role: "data" },
    { id: "parity", capacityBytes: 4_000n, role: "parity" },
  ]);
  const summary = summarizeDriveInventory(inventory);

  assert.equal(summary.driveCount, 3);
  assert.equal(summary.totalCapacityBytes, 10_000n);
  assert.equal(summary.smallestCapacityBytes, 2_000n);
  assert.equal(summary.largestCapacityBytes, 4_000n);
  assert.equal(summary.equalSized, false);
  assert.deepEqual(summary.byRole.data, { driveCount: 2, totalCapacityBytes: 6_000n });
  assert.deepEqual(summary.byRole.parity, { driveCount: 1, totalCapacityBytes: 4_000n });
  assert.ok(Object.isFrozen(summary.byRole));
});

test("shared mixed-size fixtures retain exact decimal manufacturer capacities", () => {
  const inventory = createDriveInventory(mixedTwoThreeFourFourDrives);
  assert.deepEqual(inventory.map((drive) => drive.capacityBytes), [
    2_000_000_000_000n,
    3_000_000_000_000n,
    4_000_000_000_000n,
    4_000_000_000_000n,
  ]);
});

test("wraps values with an explicit evidence classification and unit", () => {
  const value = storageValue({
    label: "Raw capacity",
    value: 8_000_000_000_000n,
    unit: "bytes",
    classification: "theoretical",
  });

  assert.deepEqual(value, {
    label: "Raw capacity",
    value: 8_000_000_000_000n,
    unit: "bytes",
    classification: "theoretical",
  });
  assert.ok(Object.isFrozen(value));
});

test("derives a valid calculation status and preserves transparent evidence", () => {
  const result = createStorageCalculationResult({
    calculator: { id: "fixture-capacity", version: 1 },
    values: {
      raw: storageValue({
        label: "Raw capacity",
        value: 8_000n,
        unit: "bytes",
        classification: "theoretical",
      }),
    },
    issues: [{ code: "mixed_sizes", severity: "warning", message: "Drive sizes differ." }],
    assumptions: [{ id: "base-10", statement: "Drive labels use decimal capacity." }],
    derivation: [{ id: "sum", expression: "4000 + 4000", result: "8000 bytes" }],
    sources: [{ title: "Fixture source", url: "https://example.com/storage", checkedAt: "2026-08-01" }],
    uncertainty: { kind: "exact", statement: "This is an integer sum of the supplied capacities." },
  });

  assert.equal(result.status, "valid");
  assert.equal(result.engineVersion, STORAGE_ENGINE_VERSION);
  assert.equal(result.values.raw.value, 8_000n);
  assert.equal(result.issues[0].severity, "warning");
  assert.ok(Object.isFrozen(result));
});

test("derives an invalid status from errors and does not expose result values", () => {
  const result = createStorageCalculationResult({
    calculator: { id: "fixture-capacity", version: 1 },
    values: null,
    issues: [{ code: "not_enough_drives", severity: "error", message: "Add another drive." }],
    assumptions: [],
    derivation: [],
    sources: [],
    uncertainty: { kind: "unknown", statement: "No result is available for an invalid layout." },
  });

  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
});

test("refuses contradictory result status inputs", () => {
  assert.throws(
    () => createStorageCalculationResult({
      calculator: { id: "fixture", version: 1 },
      values: { raw: 1n },
      issues: [{ code: "broken", severity: "error", message: "Broken." }],
      assumptions: [],
      derivation: [],
      sources: [],
      uncertainty: { kind: "unknown", statement: "Invalid." },
    }),
    StorageValidationError,
  );
});

test("rejects malformed evidence metadata at the result boundary", () => {
  assert.throws(() => createStorageCalculationResult({
    calculator: { id: "fixture", version: 1 },
    values: { raw: 1n },
    issues: [],
    assumptions: [{ id: "", statement: "Missing ID." }],
    derivation: [],
    sources: [{ title: "Source", url: "not-a-url", checkedAt: "yesterday" }],
    uncertainty: { kind: "exact", statement: "" },
  }), StorageValidationError);
});

test("storage state round-trips bigint values in a versioned URL-safe envelope", () => {
  const encoded = encodeStorageState({
    calculatorId: "fixture-capacity",
    calculatorVersion: 2,
    inputVersion: 3,
    payload: { drives: mixedTwoThreeFourFourDrives, reserveBytes: 123n },
  });
  const decoded = decodeStorageState(encoded);

  assert.match(encoded, /^[A-Za-z0-9_-]+$/);
  assert.equal(decoded.schema, STORAGE_STATE_SCHEMA);
  assert.equal(decoded.schemaVersion, STORAGE_STATE_SCHEMA_VERSION);
  assert.equal(decoded.engineVersion, STORAGE_ENGINE_VERSION);
  assert.equal(decoded.calculatorId, "fixture-capacity");
  assert.equal(decoded.calculatorVersion, 2);
  assert.equal(decoded.inputVersion, 3);
  assert.equal(decoded.payload.reserveBytes, 123n);
  assert.equal(decoded.payload.drives[0].capacityBytes, 2_000_000_000_000n);
});

test("state decoding rejects corruption, unsupported schemas, and prototype keys", () => {
  assert.throws(() => decodeStorageState("not-valid-state"), StorageStateError);

  const unsupported = encodeURIComponent(Buffer.from(JSON.stringify({
    schema: "someone-else",
    schemaVersion: 1,
    engineVersion: 1,
    calculatorId: "fixture",
    calculatorVersion: 1,
    inputVersion: 1,
    payload: {},
  })).toString("base64url"));
  assert.throws(() => decodeStorageState(unsupported), StorageStateError);

  const polluted = Buffer.from(JSON.stringify({
    schema: STORAGE_STATE_SCHEMA,
    schemaVersion: STORAGE_STATE_SCHEMA_VERSION,
    engineVersion: STORAGE_ENGINE_VERSION,
    calculatorId: "fixture",
    calculatorVersion: 1,
    inputVersion: 1,
    payload: JSON.parse('{"__proto__":{"polluted":true}}'),
  })).toString("base64url");
  assert.throws(() => decodeStorageState(polluted), StorageStateError);
  assert.equal({}.polluted, undefined);
});

test("state encoding rejects cycles, reserved tags, and oversized URL state", () => {
  const cyclic = {};
  cyclic.self = cyclic;
  assert.throws(() => encodeStorageState({
    calculatorId: "fixture",
    calculatorVersion: 1,
    inputVersion: 1,
    payload: cyclic,
  }), StorageStateError);

  assert.throws(() => encodeStorageState({
    calculatorId: "fixture",
    calculatorVersion: 1,
    inputVersion: 1,
    payload: { $stack127BigInt: "not-an-engine-tag" },
  }), StorageStateError);

  assert.throws(() => encodeStorageState({
    calculatorId: "fixture",
    calculatorVersion: 1,
    inputVersion: 1,
    payload: { note: "x".repeat(MAX_STORAGE_STATE_JSON_BYTES) },
  }), StorageStateError);
});

test("a calculator registry keeps old formula versions runnable", () => {
  const registry = createStorageCalculatorRegistry();
  const makeAdapter = (version, multiplier) => ({
    calculatorId: "fixture-capacity",
    calculationVersion: version,
    inputVersion: 1,
    validateInput: (input) => typeof input === "object"
      && input !== null
      && typeof input.capacityBytes === "bigint",
    calculate: (input) => createStorageCalculationResult({
      calculator: { id: "fixture-capacity", version },
      values: { capacityBytes: input.capacityBytes * BigInt(multiplier) },
      issues: [],
      assumptions: [],
      derivation: [],
      sources: [],
      uncertainty: { kind: "exact", statement: "Fixture arithmetic." },
    }),
  });

  registry.register(makeAdapter(1, 1));
  const oldState = registry.encode("fixture-capacity", { capacityBytes: 4_000n });
  registry.register(makeAdapter(2, 2));

  assert.equal(registry.latest("fixture-capacity").calculationVersion, 2);
  assert.equal(registry.run("fixture-capacity", 2, { capacityBytes: 4_000n }).values.capacityBytes, 8_000n);
  assert.equal(registry.runEncoded(oldState).values.capacityBytes, 4_000n);
});

test("a calculator registry rejects duplicate versions and invalid state inputs", () => {
  const registry = createStorageCalculatorRegistry();
  const adapter = {
    calculatorId: "fixture",
    calculationVersion: 1,
    inputVersion: 1,
    validateInput: (input) => typeof input === "object" && input !== null && input.ok === true,
    calculate: () => createStorageCalculationResult({
      calculator: { id: "fixture", version: 1 },
      values: { ok: true },
      issues: [],
      assumptions: [],
      derivation: [],
      sources: [],
      uncertainty: { kind: "exact", statement: "Fixture result." },
    }),
  };

  registry.register(adapter);
  assert.throws(() => registry.register(adapter), StorageValidationError);
  assert.throws(() => registry.run("fixture", 1, { ok: false }), StorageValidationError);
  assert.throws(() => registry.run("missing", 1, { ok: true }), StorageValidationError);
});
