import assert from "node:assert/strict";
import test from "node:test";
import { calculateArr } from "../../../lib/arr-calculator/engine.ts";

function values(mrr, currency) {
  const result = calculateArr({ mrr, currency });
  assert.equal(result.status, "valid", JSON.stringify(result.status === "invalid" ? result.errors : {}));
  return result.values;
}

function invalid(mrr, currency = "USD") {
  const result = calculateArr({ mrr, currency });
  assert.equal(result.status, "invalid");
  return result.errors;
}

test("annualizes a whole-dollar MRR amount exactly", () => {
  assert.deepEqual(values("10000", "USD"), {
    currency: "USD",
    mrrCents: 1_000_000,
    annualizedArrCents: 12_000_000,
  });
});

test("keeps decimal cents exact and trims outer whitespace", () => {
  assert.deepEqual(values(" 83.33 ", " EUR "), {
    currency: "EUR",
    mrrCents: 8_333,
    annualizedArrCents: 99_996,
  });
});

test("accepts zero as a known MRR value", () => {
  assert.deepEqual(values("0", "INR"), {
    currency: "INR",
    mrrCents: 0,
    annualizedArrCents: 0,
  });
});

test("accepts the exact upper bound while keeping both cent totals safe", () => {
  const result = values("1000000000000.00", "USD");
  assert.equal(result.mrrCents, 100_000_000_000_000);
  assert.equal(result.annualizedArrCents, 1_200_000_000_000_000);
  assert.ok(Number.isSafeInteger(result.mrrCents));
  assert.ok(Number.isSafeInteger(result.annualizedArrCents));
});

test("rejects blank, malformed, signed, grouped, formatted, and over-precise amounts", () => {
  for (const mrr of ["", "   ", "-1", "+1", "1e3", "$100", "1,000", "1 000", "0.001", "1."]) {
    assert.ok(invalid(mrr).mrr, "expected an MRR error for " + JSON.stringify(mrr));
  }
});

test("rejects values above the supported maximum and non-string inputs", () => {
  assert.match(invalid("1000000000000.01").mrr, /1,000,000,000,000\.00/);
  assert.match(invalid("9".repeat(1000)).mrr, /1,000,000,000,000\.00/);
  for (const mrr of [undefined, null, 100, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.ok(invalid(mrr).mrr, "expected an MRR error for " + String(mrr));
  }
});

test("rejects unsupported currencies at the calculation boundary", () => {
  for (const currency of ["usd", "JPY", "", null, 42]) {
    assert.equal(invalid("100", currency).currency, "Choose USD, EUR, GBP, INR, CAD, or AUD.");
  }
});

test("returns amount and currency validation errors together without a partial result", () => {
  assert.deepEqual(calculateArr({ mrr: "$100", currency: "JPY" }), {
    status: "invalid",
    errors: {
      mrr: "Use digits with up to two decimal places, without a sign, comma, or currency symbol.",
      currency: "Choose USD, EUR, GBP, INR, CAD, or AUD.",
    },
  });
  assert.equal(calculateArr(null).status, "invalid");
});
