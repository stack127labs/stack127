import assert from "node:assert/strict";
import test from "node:test";
import { calculateMrr } from "../../../lib/mrr-calculator/engine.ts";

function plan(name, subscriptions, price, interval) {
  return { name, subscriptions, price, interval };
}

function values(input) {
  const result = calculateMrr(input);
  assert.equal(result.status, "valid", JSON.stringify(result.status === "invalid" ? result.errors : {}));
  return result.values;
}

function invalid(input) {
  const result = calculateMrr(input);
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  return result.errors;
}

test("normalizes monthly, quarterly, semiannual, and annual plans exactly", () => {
  const result = values({
    currency: "USD",
    plans: [
      plan("Monthly", "2", "100", "monthly"),
      plan("Quarterly", "3", "300", "quarterly"),
      plan("Six months", "4", "600", "semiannual"),
      plan("Annual", "1", "1200", "annual"),
    ],
  });

  assert.deepEqual(result.rows.map((row) => row.mrrTwelfthCents), [240_000, 360_000, 480_000, 120_000]);
  assert.deepEqual(result.rows.map((row) => row.mrrRoundedCents), [20_000, 30_000, 40_000, 10_000]);
  assert.equal(result.totalMrrTwelfthCents, 1_200_000);
  assert.equal(result.totalMrrRoundedCents, 100_000);
  assert.equal(result.annualizedArrCents, 1_200_000);
  assert.equal(result.roundingDifference, false);
});

test("keeps fractions exact until display rounding and flags a row-sum difference", () => {
  const result = values({
    currency: "USD",
    plans: [
      plan("Annual", "1", "1", "annual"),
      plan("Quarterly", "1", "1", "quarterly"),
    ],
  });

  assert.deepEqual(result.rows.map((row) => row.mrrTwelfthCents), [100, 400]);
  assert.deepEqual(result.rows.map((row) => row.mrrRoundedCents), [8, 33]);
  assert.equal(result.totalMrrTwelfthCents, 500);
  assert.equal(result.totalMrrRoundedCents, 42);
  assert.equal(result.annualizedArrCents, 500);
  assert.equal(result.roundingDifference, true);
});

test("rounds a half-cent monthly amount up and keeps the annualized amount exact", () => {
  const result = values({
    currency: "USD",
    plans: [plan("", "1", "0.06", "annual")],
  });

  assert.equal(result.rows[0].name, "Plan 1");
  assert.equal(result.rows[0].mrrTwelfthCents, 6);
  assert.equal(result.rows[0].mrrRoundedCents, 1);
  assert.equal(result.totalMrrRoundedCents, 1);
  assert.equal(result.annualizedArrCents, 6);
});

test("accepts a valid all-zero portfolio", () => {
  const result = values({
    currency: "EUR",
    plans: [
      plan("Inactive free tier", "0", "100", "monthly"),
      plan("Free plan", "2", "0", "annual"),
    ],
  });

  assert.equal(result.totalMrrTwelfthCents, 0);
  assert.equal(result.totalMrrRoundedCents, 0);
  assert.equal(result.annualizedArrCents, 0);
  assert.deepEqual(result.rows.map((row) => row.mrrRoundedCents), [0, 0]);
});

test("trims outer whitespace and retains row numbers for duplicate names", () => {
  const result = values({
    currency: " EUR ",
    plans: [
      plan(" Shared plan ", " 2 ", " 10.5 ", " quarterly "),
      plan("Shared plan", "1", "12", "monthly"),
    ],
  });

  assert.equal(result.currency, "EUR");
  assert.deepEqual(result.rows.map((row) => row.rowNumber), [1, 2]);
  assert.deepEqual(result.rows.map((row) => row.name), ["Shared plan", "Shared plan"]);
  assert.deepEqual(result.rows.map((row) => row.priceCents), [1_050, 1_200]);
  assert.deepEqual(result.rows.map((row) => row.mrrTwelfthCents), [8_400, 14_400]);
});

test("accepts the documented per-row limits and 20-row maximum safely", () => {
  const rows = Array.from({ length: 20 }, () => plan("", "1000000", "100000.00", "monthly"));
  const result = values({ currency: "CAD", plans: rows });

  assert.equal(result.rows.length, 20);
  assert.equal(result.rows[19].rowNumber, 20);
  assert.equal(result.totalMrrTwelfthCents, 2_400_000_000_000_000);
  assert.ok(Number.isSafeInteger(result.totalMrrTwelfthCents));
});

test("rejects malformed count and price strings without a partial result", () => {
  for (const count of ["", "1.5", "-1", "+1", "1e3", "1,000", "1 000", "1000001"]) {
    const errors = invalid({
      currency: "USD",
      plans: [plan("Plan", count, "100", "monthly")],
    });
    assert.ok(errors.rows[0].subscriptions, "expected a count error for " + JSON.stringify(count));
  }

  for (const price of ["", "$100", "1e3", "-1", "+1", "1,000", "1.234", "100000.01", "100001"]) {
    const errors = invalid({
      currency: "USD",
      plans: [plan("Plan", "1", price, "monthly")],
    });
    assert.ok(errors.rows[0].price, "expected a price error for " + JSON.stringify(price));
  }
});

test("rejects invalid currencies, intervals, optional names, and non-string values", () => {
  assert.ok(invalid({
    currency: "usd",
    plans: [plan("Plan", "1", "1", "monthly")],
  }).currency);

  assert.ok(invalid({
    currency: "USD",
    plans: [plan("Plan", "1", "1", "weekly")],
  }).rows[0].interval);

  assert.ok(invalid({
    currency: "USD",
    plans: [plan("x".repeat(81), "1", "1", "monthly")],
  }).rows[0].name);

  assert.ok(invalid({
    currency: "USD",
    plans: [{ name: 42, subscriptions: 1, price: Number.NaN, interval: null }],
  }).rows[0].name);

  assert.ok(invalid(null).plans);
});

test("requires at least one row and rejects more than 20 rows", () => {
  assert.equal(invalid({ currency: "USD", plans: [] }).plans, "Add at least one plan.");

  const tooMany = Array.from({ length: 21 }, () => plan("", "0", "0", "monthly"));
  assert.equal(invalid({ currency: "USD", plans: tooMany }).plans, "Use no more than 20 plans.");
});

test("keeps supplied names as plain text", () => {
  const label = "<b>Pro plan</b>";
  const result = values({
    currency: "GBP",
    plans: [plan(label, "1", "20", "monthly")],
  });

  assert.equal(result.rows[0].name, label);
});
