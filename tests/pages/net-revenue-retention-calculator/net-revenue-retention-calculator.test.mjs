import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateNetRevenueRetention,
  formatMoneyCents,
  formatNrrPercentage,
  formatSignedMoneyCents,
} from "../../../lib/net-revenue-retention-calculator/engine.ts";

const validInput = {
  month: "2026-04",
  currency: "USD",
  openingMrr: "10000",
  expansionMrr: "1200",
  reactivationMrr: "100",
  contractionMrr: "300",
  churnedMrr: "500",
};

test("calculates the opening-cohort bridge in integer cents", () => {
  const result = calculateNetRevenueRetention(validInput);
  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;

  assert.equal(result.values.endingCents, 1_050_000);
  assert.equal(result.values.percentage, "105.00%");
  assert.equal(result.values.openingCents, 1_000_000);
  assert.equal(result.values.expansionCents, 120_000);
});

test("matches the independent decimal and whole-customer examples", () => {
  const aligned = calculateNetRevenueRetention({
    ...validInput,
    month: "2026-05",
    openingMrr: "1000",
    expansionMrr: "100",
    reactivationMrr: "50",
    contractionMrr: "80",
    churnedMrr: "70",
  });
  assert.equal(aligned.status, "valid");
  if (aligned.status === "valid") {
    assert.equal(aligned.values.endingCents, 100_000);
    assert.equal(aligned.values.percentage, "100.00%");
  }

  const decimal = calculateNetRevenueRetention({
    ...validInput,
    month: "2026-06",
    openingMrr: "8450.25",
    expansionMrr: "349.90",
    reactivationMrr: "150.05",
    contractionMrr: "275.35",
    churnedMrr: "424.90",
  });
  assert.equal(decimal.status, "valid");
  if (decimal.status === "valid") {
    assert.equal(decimal.values.endingCents, 824_995);
    assert.equal(decimal.values.percentage, "97.63%");
  }
});

test("accepts an all-zero empty cohort and a zero ending cohort", () => {
  const empty = calculateNetRevenueRetention({
    ...validInput,
    month: "2026-08",
    openingMrr: "0",
    expansionMrr: "0",
    reactivationMrr: "0",
    contractionMrr: "0",
    churnedMrr: "0",
  });
  assert.equal(empty.status, "valid");
  if (empty.status === "valid") {
    assert.equal(empty.values.endingCents, 0);
    assert.equal(empty.values.percentage, null);
  }

  const zeroEnding = calculateNetRevenueRetention({
    ...validInput,
    month: "2026-07",
    openingMrr: "100",
    expansionMrr: "0",
    reactivationMrr: "0",
    contractionMrr: "0",
    churnedMrr: "100",
  });
  assert.equal(zeroEnding.status, "valid");
  if (zeroEnding.status === "valid") {
    assert.equal(zeroEnding.values.endingCents, 0);
    assert.equal(zeroEnding.values.percentage, "0.00%");
  }
});

test("accepts month and amount boundaries, outer whitespace, and leading zeroes", () => {
  for (const month of ["2000-01", "2100-12"]) {
    const result = calculateNetRevenueRetention({
      ...validInput,
      month: "  " + month + "  ",
      openingMrr: "000001.2",
      expansionMrr: "0",
      reactivationMrr: "0",
      contractionMrr: "0",
      churnedMrr: "0",
    });
    assert.equal(result.status, "valid");
    if (result.status === "valid") {
      assert.equal(result.values.month, month);
      assert.equal(result.values.openingCents, 120);
      assert.equal(result.values.percentage, "100.00%");
    }
  }
});

test("rounds an exact integer-cent ratio half up and handles very small or large rates", () => {
  assert.equal(formatNrrPercentage(2, 200), "1.00%");
  assert.equal(formatNrrPercentage(3, 20_000), "0.02%");
  assert.equal(formatNrrPercentage(1, 10_001), "<0.01%");
  assert.equal(formatNrrPercentage(100_000_000_000_001, 1), "10,000,000,000,000,100.00%");
  assert.equal(formatNrrPercentage(0, 0), null);
});

test("accepts the maximum amount and keeps formatted currency exact", () => {
  const maximum = calculateNetRevenueRetention({
    ...validInput,
    openingMrr: "1000000000000.00",
    expansionMrr: "1000000000000.00",
    reactivationMrr: "0",
    contractionMrr: "0",
    churnedMrr: "0",
  });
  assert.equal(maximum.status, "valid");
  if (maximum.status === "valid") {
    assert.equal(maximum.values.endingCents, 200_000_000_000_000);
    assert.equal(maximum.values.percentage, "200.00%");
    assert.equal(formatMoneyCents(maximum.values.endingCents, "USD"), "$2,000,000,000,000.00");
  }
  const lossesAfterExpansion = calculateNetRevenueRetention({
    ...validInput,
    openingMrr: "100",
    expansionMrr: "60",
    reactivationMrr: "0",
    contractionMrr: "80",
    churnedMrr: "80",
  });
  assert.equal(lossesAfterExpansion.status, "valid");
  if (lossesAfterExpansion.status === "valid") {
    assert.equal(lossesAfterExpansion.values.endingCents, 0);
    assert.equal(lossesAfterExpansion.values.percentage, "0.00%");
  }
  assert.equal(formatSignedMoneyCents(12_345, "USD"), "+$123.45");
  assert.equal(formatSignedMoneyCents(-12_345, "USD"), "-$123.45");
  assert.equal(formatSignedMoneyCents(0, "USD"), "$0.00");
  assert.equal(formatMoneyCents(123_450, "INR"), "₹1,234.50");
});

test("rejects blanks, malformed money, invalid months, and unsupported currencies", () => {
  const badFields = ["", "-1", "1e3", "$100", "1,000", "0.001", "1.", " 1 0 "];
  for (const value of badFields) {
    const result = calculateNetRevenueRetention({ ...validInput, expansionMrr: value });
    assert.equal(result.status, "invalid", "expected rejection for " + JSON.stringify(value));
    if (result.status === "invalid") assert.ok(result.errors.expansionMrr);
  }

  for (const month of ["2026-13", "1999-12", "2101-01", "2026-1", "2026-01-01"]) {
    const result = calculateNetRevenueRetention({ ...validInput, month });
    assert.equal(result.status, "invalid");
    if (result.status === "invalid") assert.ok(result.errors.month);
  }

  const currency = calculateNetRevenueRetention({ ...validInput, currency: "JPY" });
  assert.equal(currency.status, "invalid");
  if (currency.status === "invalid") assert.ok(currency.errors.currency);

  for (const amount of ["1000000000000.01", "12.345"]) {
    const result = calculateNetRevenueRetention({ ...validInput, expansionMrr: amount });
    assert.equal(result.status, "invalid");
    if (result.status === "invalid") assert.ok(result.errors.expansionMrr);
  }

  const nonString = calculateNetRevenueRetention({ ...validInput, openingMrr: 100 });
  assert.equal(nonString.status, "invalid");
  if (nonString.status === "invalid") assert.ok(nonString.errors.openingMrr);

  const blank = calculateNetRevenueRetention({ ...validInput, churnedMrr: "" });
  assert.equal(blank.status, "invalid");
  if (blank.status === "invalid") assert.match(blank.errors.churnedMrr, /Use 0/);
});

test("rejects empty-cohort movements, orphan reactivation, and negative ending MRR", () => {
  const emptyWithMovement = calculateNetRevenueRetention({
    ...validInput,
    openingMrr: "0",
    expansionMrr: "0",
    reactivationMrr: "50",
    contractionMrr: "0",
    churnedMrr: "0",
  });
  assert.equal(emptyWithMovement.status, "invalid");
  if (emptyWithMovement.status === "invalid") {
    assert.match(emptyWithMovement.errors.reactivationMrr, /Opening cohort MRR is zero/);
  }

  const orphanReactivation = calculateNetRevenueRetention({
    ...validInput,
    openingMrr: "100",
    expansionMrr: "0",
    reactivationMrr: "10",
    contractionMrr: "0",
    churnedMrr: "0",
  });
  assert.equal(orphanReactivation.status, "invalid");
  if (orphanReactivation.status === "invalid") {
    assert.match(orphanReactivation.errors.reactivationMrr, /recorded churn event/);
  }

  const negative = calculateNetRevenueRetention({
    ...validInput,
    openingMrr: "100",
    expansionMrr: "10",
    reactivationMrr: "0",
    contractionMrr: "60",
    churnedMrr: "60",
  });
  assert.equal(negative.status, "invalid");
  if (negative.status === "invalid") {
    assert.match(negative.errors.churnedMrr, /ending MRR negative/);
  }
});
