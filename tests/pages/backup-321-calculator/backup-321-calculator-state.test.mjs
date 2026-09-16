import assert from "node:assert/strict";
import test from "node:test";
import {
  BACKUP_321_CALCULATOR_ID,
  BACKUP_321_CALCULATION_VERSION,
  BACKUP_321_INPUT_VERSION,
  DEFAULT_BACKUP_321_INPUT,
  backup321CalculatorRegistry,
  decodeBackup321State,
  encodeBackup321State,
} from "../../../lib/storage/backup-321.ts";
import {
  MAX_STORAGE_STATE_JSON_BYTES,
  StorageStateError,
  decodeStorageState,
} from "../../../lib/storage/index.ts";

function base64Url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

test("shared state uses the exact versioned envelope and normalized inputs only", () => {
  const encoded = encodeBackup321State({ ...DEFAULT_BACKUP_321_INPUT, sourceData: " 2.000 " });
  const state = decodeStorageState(encoded);
  assert.deepEqual(Object.keys(state).sort(), [
    "calculatorId", "calculatorVersion", "engineVersion", "inputVersion", "payload", "schema", "schemaVersion",
  ]);
  assert.equal(state.schema, "stack127-storage-state");
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.engineVersion, 1);
  assert.equal(state.calculatorId, BACKUP_321_CALCULATOR_ID);
  assert.equal(state.calculatorVersion, BACKUP_321_CALCULATION_VERSION);
  assert.equal(state.inputVersion, BACKUP_321_INPUT_VERSION);
  assert.deepEqual(state.payload, { ...DEFAULT_BACKUP_321_INPUT, sourceData: "2" });
  assert.deepEqual(Object.keys(state.payload).sort(), Object.keys(DEFAULT_BACKUP_321_INPUT).sort());
  assert.doesNotMatch(encoded, /values|repositoryBytes|targetBytes|private/);
  assert.deepEqual(decodeBackup321State(encoded), { ...DEFAULT_BACKUP_321_INPUT, sourceData: "2" });
  assert.deepEqual(decodeBackup321State(backup321CalculatorRegistry.encode(BACKUP_321_CALCULATOR_ID, DEFAULT_BACKUP_321_INPUT)), DEFAULT_BACKUP_321_INPUT);
});

test("shared registry replays the same formula version", () => {
  const encoded = encodeBackup321State(DEFAULT_BACKUP_321_INPUT);
  const result = backup321CalculatorRegistry.runEncoded(encoded);
  assert.equal(result.status, "valid");
  assert.equal(result.calculator.id, BACKUP_321_CALCULATOR_ID);
  assert.equal(result.calculator.version, BACKUP_321_CALCULATION_VERSION);
  assert.equal(result.values.targetBytes.value, 10_160_640_000_000n);
});

test("rejects malformed JSON, unsafe trees, reserved tags, invalid versions, and wrong identity", () => {
  const validState = decodeStorageState(encodeBackup321State(DEFAULT_BACKUP_321_INPUT));
  const envelope = (payload, overrides = {}) => base64Url(JSON.stringify({
    schema: "stack127-storage-state",
    schemaVersion: 1,
    engineVersion: 1,
    calculatorId: BACKUP_321_CALCULATOR_ID,
    calculatorVersion: 1,
    inputVersion: 1,
    payload,
    ...overrides,
  }));

  for (const candidate of ["", "not_base64!", "e30", base64Url("{")]) {
    assert.throws(() => decodeStorageState(candidate), StorageStateError);
  }
  for (const candidate of [
    envelope({ ...DEFAULT_BACKUP_321_INPUT, ["__proto__"]: "hostile" }),
    envelope({ ...DEFAULT_BACKUP_321_INPUT, prototype: "hostile" }),
    envelope({ ...DEFAULT_BACKUP_321_INPUT, constructor: "hostile" }),
    envelope({ ...DEFAULT_BACKUP_321_INPUT, "$stack127BigInt": "hostile" }),
    envelope(DEFAULT_BACKUP_321_INPUT, { schemaVersion: 2 }),
    envelope(DEFAULT_BACKUP_321_INPUT, { engineVersion: 2 }),
    envelope(DEFAULT_BACKUP_321_INPUT, { calculatorId: "other-calculator" }),
    envelope(DEFAULT_BACKUP_321_INPUT, { calculatorVersion: 2 }),
    envelope(DEFAULT_BACKUP_321_INPUT, { inputVersion: 2 }),
  ]) {
    assert.throws(() => decodeBackup321State(candidate), StorageStateError);
  }
  assert.ok(validState.payload);
});

test("rejects invalid tagged bigint values and oversized decoded JSON", () => {
  const tagged = base64Url(JSON.stringify({
    schema: "stack127-storage-state",
    schemaVersion: 1,
    engineVersion: 1,
    calculatorId: BACKUP_321_CALCULATOR_ID,
    calculatorVersion: 1,
    inputVersion: 1,
    payload: { ...DEFAULT_BACKUP_321_INPUT, nested: { $stack127BigInt: "not-an-integer" } },
  }));
  assert.throws(() => decodeStorageState(tagged), (error) => error instanceof StorageStateError && error.code === "invalid_bigint");

  const oversizedJson = JSON.stringify({
    schema: "stack127-storage-state",
    schemaVersion: 1,
    engineVersion: 1,
    calculatorId: BACKUP_321_CALCULATOR_ID,
    calculatorVersion: 1,
    inputVersion: 1,
    payload: { ...DEFAULT_BACKUP_321_INPUT, padding: "x".repeat(MAX_STORAGE_STATE_JSON_BYTES) },
  });
  assert.ok(new TextEncoder().encode(oversizedJson).byteLength > MAX_STORAGE_STATE_JSON_BYTES);
  assert.throws(() => decodeStorageState(base64Url(oversizedJson)), (error) => error instanceof StorageStateError && error.code === "state_too_large");
});

test("registry rejects a future or mismatched state before calculation", () => {
  const encoded = encodeBackup321State(DEFAULT_BACKUP_321_INPUT);
  const decoded = decodeStorageState(encoded);
  const futureEngine = base64Url(JSON.stringify({ ...decoded, engineVersion: 2 }));
  assert.throws(() => backup321CalculatorRegistry.runEncoded(futureEngine));
  const wrongInputVersion = base64Url(JSON.stringify({ ...decoded, inputVersion: 2 }));
  assert.throws(() => backup321CalculatorRegistry.runEncoded(wrongInputVersion));
});
