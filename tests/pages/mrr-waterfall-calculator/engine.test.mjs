import assert from "node:assert/strict";
import test from "node:test";
import { calculateMrrWaterfall } from "../../../lib/mrr-waterfall-calculator/engine.ts";

function input(overrides = {}) {
  return {
    month: "2026-04",
    currency: "USD",
    startingMrr: "8450.25",
    newMrr: "1200.10",
    expansionMrr: "349.90",
    reactivationMrr: "150",
    contractionMrr: "275.35",
    churnedMrr: "424.90",
    ...overrides,
  };
}

function valid(values) {
  const result = calculateMrrWaterfall(values);
  assert.equal(result.status, "valid", JSON.stringify(result.status === "invalid" ? result.errors : {}));
  return result.values;
}

function invalid(values) {
  const result = calculateMrrWaterfall(values);
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  return result.errors;
}

test("builds an exact five movement bridge in product order", () => {
  const result = valid(input());

  assert.deepEqual(result.stages.map((stage) => stage.balanceCents), [
    845_025,
    965_035,
    1_000_025,
    1_015_025,
    987_490,
    945_000,
  ]);
  assert.deepEqual(result.steps.map((step) => step.signedCents), [
    120_010,
    34_990,
    15_000,
    -27_535,
    -42_490,
  ]);
  assert.equal(result.netNewCents, 99_975);
  assert.equal(result.endingCents, 945_000);
  assert.equal(result.month, "2026-04");
  assert.equal(result.currency, "USD");
});

test("keeps explicit zero and reactivation-only months as real values", () => {
  const result = valid(input({
    month: " 2026-05 ",
    startingMrr: "000.00",
    newMrr: "0",
    expansionMrr: "0",
    reactivationMrr: "250.75",
    contractionMrr: "0",
    churnedMrr: "0",
  }));

  assert.deepEqual(result.stages.map((stage) => stage.balanceCents), [0, 0, 0, 25_075, 25_075, 25_075]);
  assert.equal(result.netNewCents, 25_075);
  assert.equal(result.endingCents, 25_075);
  assert.equal(result.month, "2026-05");
});

test("accepts the reporting month range and explicit all-zero input", () => {
  const result = valid(input({
    month: "2100-12",
    startingMrr: "0",
    newMrr: "0",
    expansionMrr: "0",
    reactivationMrr: "0",
    contractionMrr: "0",
    churnedMrr: "0",
  }));
  assert.deepEqual(result.stages.map((stage) => stage.balanceCents), [0, 0, 0, 0, 0, 0]);
  assert.equal(result.netNewCents, 0);
  assert.equal(result.endingCents, 0);
  assert.ok(invalid(input({ month: "2101-01" })).month);
});

test("accepts a zero ending balance but rejects an implied negative ending balance", () => {
  const zeroEnding = valid(input({
    startingMrr: "50",
    newMrr: "0",
    expansionMrr: "0",
    reactivationMrr: "0",
    contractionMrr: "20",
    churnedMrr: "30",
  }));
  assert.deepEqual(zeroEnding.stages.slice(-2).map((stage) => stage.balanceCents), [3_000, 0]);
  assert.equal(zeroEnding.netNewCents, -5_000);

  const errors = invalid(input({
    startingMrr: "100",
    newMrr: "10",
    expansionMrr: "0",
    reactivationMrr: "0",
    contractionMrr: "60",
    churnedMrr: "60",
  }));
  assert.match(errors.churnedMrr, /ending MRR negative/);
});

test("rejects blank, malformed, signed, formatted, over-precise, and excessive amounts", () => {
  for (const amount of ["", "-1", "+1", "1e3", "$100", "1,000", "1 000", "0.001", "1000000000000.01"]) {
    assert.ok(invalid(input({ newMrr: amount })).newMrr, "expected an error for " + JSON.stringify(amount));
  }
  assert.equal(valid(input({ startingMrr: "1000000000000.00" })).startingCents, 100_000_000_000_000);
});

test("requires every movement, validates month and currency, and rejects non-string values", () => {
  assert.match(invalid(input({ reactivationMrr: "" })).reactivationMrr, /Enter an amount/);
  assert.ok(invalid(input({ month: "2026-13" })).month);
  assert.ok(invalid(input({ month: "1999-12" })).month);
  assert.ok(invalid(input({ month: "2026-4" })).month);
  assert.ok(invalid(input({ currency: "JPY" })).currency);
  assert.ok(invalid(input({ churnedMrr: 0 })).churnedMrr);
  assert.equal(Object.keys(invalid(null)).length, 8);
});

test("accepts the stated money ceiling without unsafe intermediate balances", () => {
  const result = valid(input({
    startingMrr: "1000000000000.00",
    newMrr: "1000000000000.00",
    expansionMrr: "1000000000000.00",
    reactivationMrr: "1000000000000.00",
    contractionMrr: "1000000000000.00",
    churnedMrr: "1000000000000.00",
  }));

  assert.ok(result.stages.every((stage) => Number.isSafeInteger(stage.balanceCents)));
  assert.equal(result.endingCents, 200_000_000_000_000);
});
