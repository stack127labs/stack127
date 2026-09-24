import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_STORAGE_GROWTH_INPUT,
  calculateStorageGrowthPlan,
  decodeStorageGrowthState,
  encodeStorageGrowthState,
} from "../../../app/(site)/(tools)/(storage)/storage-growth-planner/storage-growth-planner-engine.ts";

test("FF-006 shares normalized inputs only and round-trips safely", () => {
  const encoded = encodeStorageGrowthState(DEFAULT_STORAGE_GROWTH_INPUT);
  const restored = decodeStorageGrowthState(encoded);
  assert.equal(restored.status, "valid");
  assert.deepEqual(restored.input, DEFAULT_STORAGE_GROWTH_INPUT);
  assert.match(encoded, /^[A-Za-z0-9_-]+$/);
  assert.doesNotMatch(encoded, /199420|values|totalMinor/);
  const calculated = calculateStorageGrowthPlan(restored.input);
  assert.equal(calculated.status, "valid");
});

test("rejects malformed, unsupported, oversized, and prototype-bearing state", () => {
  for (const candidate of [
    "not_base64!",
    "e30",
    "eyJjYWxjdWxhdG9ySWQiOiJub3Qtc3RvcmFnZSJ9",
    "eyJjYWxjdWxhdG9ySWQiOiJzdG9yYWdlLWdyb3d0aC10Y28iLCJjYWxjdWxhdGlvblZlcnNpb24iOjk5fQ",
  ]) {
    assert.equal(decodeStorageGrowthState(candidate).status, "invalid", candidate);
  }
  const oversized = "A".repeat(5000);
  assert.equal(decodeStorageGrowthState(oversized).status, "invalid");
  const hostileJson = `{"calculatorId":"storage-growth-tco","calculationVersion":1,"inputVersion":1,"input":${JSON.stringify(DEFAULT_STORAGE_GROWTH_INPUT)},"__proto__":"hostile"}`;
  const hostile = Buffer.from(hostileJson).toString("base64url");
  assert.equal(decodeStorageGrowthState(hostile).status, "invalid");
});
