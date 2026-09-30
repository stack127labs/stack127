import assert from "node:assert/strict";
import test from "node:test";
import { calculateBurnMultiple } from "../../../lib/burn-multiple-calculator/engine.ts";

function values(period, netCashBurn, netNewArr, currency = "USD") {
  const result = calculateBurnMultiple({ period, currency, netCashBurn, netNewArr });
  assert.equal(result.status, "valid", JSON.stringify(result.status === "invalid" ? result.errors : {}));
  return result.values;
}

function invalid(period, netCashBurn, netNewArr, currency = "USD") {
  const result = calculateBurnMultiple({ period, currency, netCashBurn, netNewArr });
  assert.equal(result.status, "invalid");
  return result.errors;
}

test("calculates the submitted period's ratio from exact cents", () => {
  const result = values(" Q1 2026 ", "2000000.00", "1000000.00");
  assert.equal(result.period, "Q1 2026");
  assert.equal(result.netCashBurnCents, 200_000_000);
  assert.equal(result.netNewArrCents, 100_000_000);
  assert.deepEqual(result.outcome, { kind: "multiple", ratioHundredths: 200n, displayValue: "2.00×" });
});

test("rounds half up and preserves a positive ratio that rounds below one hundredth", () => {
  assert.equal(values("April 2026", "1", "8").outcome.displayValue, "0.13×");
  assert.equal(values("April 2026", "0.01", "2.50").outcome.displayValue, "<0.01×");
});

test("formats the largest supported ratio without clipping", () => {
  const result = values("A long reporting period", "1000000000000.00", "0.01");
  assert.equal(result.netCashBurnCents, 100_000_000_000_000);
  assert.equal(result.netNewArrCents, 1);
  assert.equal(result.outcome.displayValue, "100,000,000,000,000.00×");
});

test("keeps zero burn numeric and classifies nonnumeric states by precedence", () => {
  assert.equal(values("May 2026", "0", "24000").outcome.displayValue, "0.00×");
  assert.deepEqual(values("May 2026", "12000", "0").outcome, { kind: "undefined" });
  assert.deepEqual(values("May 2026", "12000", "-24000").outcome, { kind: "unavailable" });
  assert.deepEqual(values("May 2026", "-500", "24000").outcome, { kind: "cash-generating", arrChange: "positive" });
  assert.deepEqual(values("May 2026", "-500", "0").outcome, { kind: "cash-generating", arrChange: "zero" });
  assert.deepEqual(values("May 2026", "-500", "-2").outcome, { kind: "cash-generating", arrChange: "negative" });
});

test("accepts signed cents, outer spaces, leading zeros, and normalizes signed zero", () => {
  assert.equal(values("April 2026", " -000.01 ", " 0002.5 ", "EUR").netCashBurnCents, -1);
  assert.equal(values("April 2026", "-0.00", "0").netCashBurnCents, 0);
  assert.equal(values("April 2026", "1.2", "3.45").netCashBurnCents, 120);
});

test("validates period length and control characters", () => {
  assert.equal(invalid("  ", "1", "1").period, "Enter a reporting period.");
  assert.match(invalid("x".repeat(81), "1", "1").period, /1 to 80 characters/);
  assert.match(invalid("April\n2026", "1", "1").period, /control characters/);
  assert.equal(values("🙂".repeat(80), "1", "1").period.length, 160);
});

test("rejects malformed signed amounts and excess decimal places", () => {
  for (const amount of ["", "   ", "+1", "1e3", "$100", "1,000", "1 000", "1."]) {
    assert.ok(invalid("April 2026", amount, "1").netCashBurn, `expected an error for ${JSON.stringify(amount)}`);
  }
  assert.match(invalid("April 2026", "0.001", "1").netCashBurn, /two decimal places/);
  assert.match(invalid("April 2026", "1", "+1").netNewArr, /optional leading minus/);
});

test("rejects amounts outside either signed bound and accepts both exact bounds", () => {
  assert.equal(values("April 2026", "1000000000000.00", "-1000000000000.00").netCashBurnCents, 100_000_000_000_000);
  assert.equal(values("April 2026", "-1000000000000.00", "1000000000000.00").netCashBurnCents, -100_000_000_000_000);
  assert.match(invalid("April 2026", "1000000000000.01", "1").netCashBurn, /from -1,000,000,000,000\.00 to 1,000,000,000,000\.00/);
  assert.match(invalid("April 2026", "1", "-1000000000000.01").netNewArr, /from -1,000,000,000,000\.00 to 1,000,000,000,000\.00/);
});

test("rejects unsupported currencies and validates every field for non-object input", () => {
  assert.equal(invalid("April 2026", "1", "1", "JPY").currency, "Choose USD, EUR, GBP, INR, CAD, or AUD.");
  assert.deepEqual(calculateBurnMultiple(null), {
    status: "invalid",
    errors: {
      period: "Enter a reporting period.",
      currency: "Choose USD, EUR, GBP, INR, CAD, or AUD.",
      netCashBurn: "Enter net cash burn.",
      netNewArr: "Enter net new ARR.",
    },
  });
  assert.ok(invalid("April 2026", 1, null).netCashBurn);
});
