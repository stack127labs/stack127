import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateRevenueChurn,
  formatRevenueChurnPercentage,
  formatRevenueMoneyCents,
} from "../../../lib/revenue-churn-calculator/engine.ts";

const validInput = {
  month: "2026-04",
  currency: "USD",
  openingMrr: "10000",
  canceledOpeningMrr: "400",
  reducedOpeningMrr: "100",
};

test("adds canceled and reduced opening MRR in exact cents", () => {
  const result = calculateRevenueChurn(validInput);
  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;

  assert.deepEqual(
    {
      opening: result.values.openingCents,
      canceled: result.values.canceledCents,
      reduced: result.values.reducedCents,
      lost: result.values.totalLostCents,
      retained: result.values.stillPresentCents,
      percentage: result.values.percentage,
    },
    {
      opening: 1_000_000,
      canceled: 40_000,
      reduced: 10_000,
      lost: 50_000,
      retained: 950_000,
      percentage: "5.00%",
    },
  );
});

test("keeps opening-customer losses separate from gains elsewhere", () => {
  const result = calculateRevenueChurn({
    ...validInput,
    openingMrr: "200",
    canceledOpeningMrr: "0",
    reducedOpeningMrr: "50",
  });
  assert.equal(result.status, "valid");
  if (result.status === "valid") {
    assert.equal(result.values.percentage, "25.00%");
    assert.equal(result.values.stillPresentCents, 15_000);
  }
});

test("accepts a zero-MRR still-billable customer as a full reduction", () => {
  const result = calculateRevenueChurn({
    ...validInput,
    openingMrr: "100",
    canceledOpeningMrr: "0",
    reducedOpeningMrr: "100",
  });
  assert.equal(result.status, "valid");
  if (result.status === "valid") {
    assert.equal(result.values.totalLostCents, result.values.openingCents);
    assert.equal(result.values.percentage, "100.00%");
    assert.equal(result.values.stillPresentCents, 0);
  }
});

test("returns an unavailable percentage for a known zero opening base", () => {
  const result = calculateRevenueChurn({
    ...validInput,
    openingMrr: "0",
    canceledOpeningMrr: "0",
    reducedOpeningMrr: "0",
  });
  assert.equal(result.status, "valid");
  if (result.status === "valid") {
    assert.equal(result.values.percentage, null);
    assert.equal(result.values.stillPresentCents, 0);
  }
});

test("rounds percentages half up and distinguishes a tiny positive rate from zero", () => {
  assert.equal(formatRevenueChurnPercentage(0, 100), "0.00%");
  assert.equal(formatRevenueChurnPercentage(1, 800), "0.13%");
  assert.equal(formatRevenueChurnPercentage(1, 10_000), "0.01%");
  assert.equal(formatRevenueChurnPercentage(1, 10_001), "<0.01%");
  assert.equal(formatRevenueChurnPercentage(0, 0), null);
});

test("accepts month and amount bounds, whitespace, and leading zeros", () => {
  for (const month of ["2000-01", "2100-12"]) {
    const result = calculateRevenueChurn({
      ...validInput,
      month: "  " + month + "  ",
      openingMrr: "000001.2",
      canceledOpeningMrr: "0",
      reducedOpeningMrr: "0",
    });
    assert.equal(result.status, "valid");
    if (result.status === "valid") {
      assert.equal(result.values.month, month);
      assert.equal(result.values.openingCents, 120);
      assert.equal(result.values.percentage, "0.00%");
    }
  }

  const maximum = calculateRevenueChurn({
    ...validInput,
    openingMrr: "1000000000000.00",
    canceledOpeningMrr: "0",
    reducedOpeningMrr: "0",
  });
  assert.equal(maximum.status, "valid");
  if (maximum.status === "valid") {
    assert.equal(maximum.values.openingCents, 100_000_000_000_000);
    assert.equal(formatRevenueMoneyCents(maximum.values.openingCents, "USD"), "$1,000,000,000,000.00");
  }
});

test("rejects inconsistent opening-dollar loss totals and losses on a zero base", () => {
  const overBase = calculateRevenueChurn({
    ...validInput,
    openingMrr: "100",
    canceledOpeningMrr: "60",
    reducedOpeningMrr: "50",
  });
  assert.equal(overBase.status, "invalid");
  if (overBase.status === "invalid") assert.match(overBase.errors.reducedOpeningMrr, /each opening dollar is counted once/);

  const zeroBaseLoss = calculateRevenueChurn({
    ...validInput,
    openingMrr: "0",
    canceledOpeningMrr: "1",
    reducedOpeningMrr: "0",
  });
  assert.equal(zeroBaseLoss.status, "invalid");
  if (zeroBaseLoss.status === "invalid") assert.match(zeroBaseLoss.errors.canceledOpeningMrr, /Opening MRR is zero/);
});

test("rejects missing, malformed, excessive, non-string, and unsupported values", () => {
  for (const value of ["", "-1", "1e3", "$100", "1,000", "0.001", "1.", " 1 0 "]) {
    const result = calculateRevenueChurn({ ...validInput, reducedOpeningMrr: value });
    assert.equal(result.status, "invalid", "expected rejection for " + JSON.stringify(value));
    if (result.status === "invalid") assert.ok(result.errors.reducedOpeningMrr);
  }

  for (const month of ["2026-13", "1999-12", "2101-01", "2026-1", "2026-01-01"]) {
    const result = calculateRevenueChurn({ ...validInput, month });
    assert.equal(result.status, "invalid");
    if (result.status === "invalid") assert.ok(result.errors.month);
  }

  const currency = calculateRevenueChurn({ ...validInput, currency: "JPY" });
  assert.equal(currency.status, "invalid");
  if (currency.status === "invalid") assert.ok(currency.errors.currency);

  const nonString = calculateRevenueChurn({ ...validInput, openingMrr: 100 });
  assert.equal(nonString.status, "invalid");
  if (nonString.status === "invalid") assert.ok(nonString.errors.openingMrr);

  const excessive = calculateRevenueChurn({
    ...validInput,
    openingMrr: "1000000000000.01",
  });
  assert.equal(excessive.status, "invalid");
  if (excessive.status === "invalid") assert.ok(excessive.errors.openingMrr);
});
