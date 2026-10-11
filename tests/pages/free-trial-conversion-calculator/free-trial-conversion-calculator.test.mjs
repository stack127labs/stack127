import assert from "node:assert/strict";
import test from "node:test";
import { calculateFreeTrialConversion } from "../../../lib/free-trial-conversion-calculator/engine.ts";

const cohort = (overrides = {}) => ({ label: "", starts: "1180", paid: "156", ageDays: "45", ...overrides });
const input = (overrides = {}) => ({
  model: "trialNoCard", windowDays: "30", cohorts: [cohort()], includeMrr: false,
  currency: "USD", mrrMethod: "average", averageMonthly: "49",
  monthlyCustomers: "", monthlyPrice: "", annualCustomers: "", annualPrice: "", ...overrides,
});
function valid(overrides = {}) {
  const result = calculateFreeTrialConversion(input(overrides));
  assert.equal(result.status, "valid", JSON.stringify(result.errors));
  assert.deepEqual(result.errors, {});
  return result.values;
}
function invalid(overrides, field, message) {
  const result = calculateFreeTrialConversion(input(overrides));
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  assert.equal(result.errors[field], message);
}

test("one completed cohort returns its exact rate and optional new MRR", () => {
  const values = valid();
  assert.equal(values.windowDays, 30n);
  assert.deepEqual(values.cohorts[0], {
    index: 0, label: "", starts: 1180n, paid: 156n, notPaid: 1024n, ageDays: 45n,
    rate: { kind: "finite", hundredths: 1322n, exact: { numerator: 780n, denominator: 59n }, isRounded: true, roundedToZero: false },
    maturity: { status: "complete" },
  });
  assert.deepEqual(values.combined, {
    basis: "complete", status: "complete", includedIndexes: [0], excludedMaturing: 0,
    starts: 1180n, paid: 156n, notPaid: 1024n, rate: values.cohorts[0].rate,
  });
  assert.equal(values.newMrr, null);
  assert.deepEqual(valid({ includeMrr: true }).newMrr, {
    currency: "USD", method: "average", paidCustomers: 156n, averageMonthlyCents: 4900n,
    monthlyPlan: null, annualPlan: null, mrrCents: 764400n, mrrIsRounded: false, runRateArrCents: 9172800n,
  });
});

test("cohort age determines maturity, including the exact window boundary", () => {
  const complete = valid({ cohorts: [cohort({ starts: "100", paid: "20", ageDays: "30" })] });
  assert.equal(complete.combined.rate.hundredths, 2000n);
  assert.deepEqual(complete.cohorts[0].maturity, { status: "complete" });
  const maturing = valid({ windowDays: "14", cohorts: [cohort({ starts: "200", paid: "30", ageDays: "10" })] });
  assert.equal(maturing.cohorts[0].rate.hundredths, 1500n);
  assert.deepEqual(maturing.cohorts[0].maturity, { status: "maturing", daysLeft: 4n });
  assert.equal(maturing.combined.basis, "all");
  assert.equal(maturing.combined.status, "provisional");
});

test("combined rate divides complete-cohort totals, while MRR includes all paid customers", () => {
  const values = valid({ includeMrr: true, averageMonthly: "20", cohorts: [
    cohort({ label: " Jul ", starts: "400", paid: "60", ageDays: "75" }),
    cohort({ label: "Aug", starts: "500", paid: "70", ageDays: "45" }),
    cohort({ label: "Sep", starts: "450", paid: "30", ageDays: "10" }),
  ] });
  assert.deepEqual(values.cohorts.map(row => row.rate.hundredths), [1500n, 1400n, 667n]);
  assert.equal(values.cohorts[0].label, "Jul");
  assert.deepEqual(values.cohorts[2].maturity, { status: "maturing", daysLeft: 20n });
  assert.deepEqual(values.combined, {
    basis: "complete", status: "complete", includedIndexes: [0, 1], excludedMaturing: 1,
    starts: 900n, paid: 130n, notPaid: 770n,
    rate: { kind: "finite", hundredths: 1444n, exact: { numerator: 130n, denominator: 9n }, isRounded: true, roundedToZero: false },
  });
  assert.equal(values.newMrr.paidCustomers, 160n);
  assert.equal(values.newMrr.mrrCents, 320000n);
});

test("all cohorts are used provisionally when complete cohorts have no starts", () => {
  const maturing = valid({ cohorts: [
    cohort({ starts: "100", paid: "5", ageDays: "5" }),
    cohort({ starts: "200", paid: "10", ageDays: "12" }),
  ] });
  assert.deepEqual(maturing.cohorts.map(row => row.rate.hundredths), [500n, 500n]);
  // The spec's 1500n disagrees with its formula: 15 / 300 * 100 = 5%, or 500n.
  assert.equal(maturing.combined.rate.hundredths, 500n);
  assert.equal(maturing.combined.basis, "all");
  assert.equal(maturing.combined.status, "provisional");
  assert.deepEqual(maturing.combined.includedIndexes, [0, 1]);
  assert.equal(maturing.combined.excludedMaturing, 0);
  const emptyComplete = valid({ cohorts: [
    cohort({ starts: "0", paid: "0", ageDays: "40" }),
    cohort({ starts: "100", paid: "10", ageDays: "5" }),
  ] });
  assert.deepEqual(emptyComplete.cohorts[0].rate, { kind: "notAvailable", reason: "noStarts" });
  assert.equal(emptyComplete.combined.basis, "all");
  assert.equal(emptyComplete.combined.status, "provisional");
  assert.equal(emptyComplete.combined.rate.hundredths, 1000n);
});

test("zero starts, exact percentages, and tiny rounded rates remain distinct", () => {
  const zero = valid({ cohorts: [cohort({ starts: "0", paid: "0", ageDays: "40" })] });
  assert.deepEqual(zero.combined.rate, { kind: "notAvailable", reason: "noStarts" });
  assert.equal(zero.combined.basis, "all");
  assert.equal(zero.combined.status, "complete");
  const maturingZero = valid({ cohorts: [cohort({ starts: "0", paid: "0", ageDays: "0" })] });
  assert.equal(maturingZero.combined.status, "provisional");
  for (const [starts, paid, hundredths, isRounded, roundedToZero] of [
    ["3", "1", 3333n, true, false], ["3", "2", 6667n, true, false],
    ["1", "1", 10000n, false, false], ["2000000", "1", 0n, true, true],
    ["100", "0", 0n, false, false], ["20000", "1", 1n, true, false],
  ]) {
    const rate = valid({ cohorts: [cohort({ starts, paid })] }).combined.rate;
    assert.equal(rate.hundredths, hundredths);
    assert.equal(rate.isRounded, isRounded);
    assert.equal(rate.roundedToZero, roundedToZero);
  }
});

test("annual MRR rounds once and ARR uses the exact monthly amount", () => {
  const mrr = valid({ includeMrr: true, mrrMethod: "split", averageMonthly: "garbage",
    cohorts: [cohort({ starts: "4", paid: "4" })],
    monthlyCustomers: "3", monthlyPrice: "10", annualCustomers: "1", annualPrice: "100",
  }).newMrr;
  assert.deepEqual(mrr, {
    currency: "USD", method: "split", paidCustomers: 4n, averageMonthlyCents: null,
    monthlyPlan: { customers: 3n, priceCents: 1000n, mrrCents: 3000n },
    annualPlan: { customers: 1n, annualPriceCents: 10000n, mrrCents: 833n, isRounded: true },
    mrrCents: 3833n, mrrIsRounded: true, runRateArrCents: 46000n,
  });
  assert.equal(valid({ includeMrr: true, cohorts: [cohort({ paid: "0" })] }).newMrr.mrrCents, 0n);
  const zeroSplit = valid({ includeMrr: true, mrrMethod: "split", cohorts: [cohort({ starts: "0", paid: "0" })],
    monthlyCustomers: "0", monthlyPrice: "0", annualCustomers: "0", annualPrice: "0",
  }).newMrr;
  assert.equal(zeroSplit.mrrCents, 0n);
  assert.equal(zeroSplit.mrrIsRounded, false);
});

test("all models share the math and maximum amounts use bigint without overflow", () => {
  for (const model of ["trialNoCard", "trialCardRequired", "freemium"]) {
    const values = valid({ model, windowDays: "180", cohorts: [cohort({ starts: "5000", paid: "150", ageDays: "200" })] });
    assert.equal(values.model, model);
    assert.equal(values.combined.rate.hundredths, 300n);
    assert.equal(values.combined.status, "complete");
  }
  const maximum = valid({ windowDays: "730", includeMrr: true, averageMonthly: "1000000000",
    cohorts: [cohort({ starts: "10000000", paid: "10000000", ageDays: "3650" })],
  });
  assert.equal(maximum.combined.rate.hundredths, 10000n);
  assert.equal(maximum.newMrr.mrrCents, 1000000000000000000n);
  assert.equal(maximum.newMrr.runRateArrCents, 12000000000000000000n);
  const twelve = valid({ cohorts: Array.from({ length: 12 }, () => cohort()) });
  assert.equal(twelve.cohorts.length, 12);
  assert.equal(twelve.combined.starts, 14160n);
});

test("counts reject negatives, fractions, decorated numbers, blanks, and impossible paid totals", () => {
  for (const [raw, message] of [
    ["-5", "Counts can't be negative."], ["", "Enter a count. Use 0 if there were none."],
    ["2.5", "Use a whole number with no commas or decimals."], ["1,180", "Use a whole number with no commas or decimals."],
    ["1e3", "Use a whole number with no commas or decimals."], ["+1", "Use a whole number with no commas or decimals."],
    ["1 0", "Use a whole number with no commas or decimals."], ["10000001", "Enter a number up to 10,000,000."],
  ]) {
    for (const field of ["starts", "paid"]) invalid({ cohorts: [cohort({ [field]: raw })] }, `cohorts.0.${field}`, message);
  }
  for (const [starts, paid] of [["100", "101"], ["0", "1"]]) {
    invalid({ cohorts: [cohort({ starts, paid })] }, "cohorts.0.paid", "Paid can't be more than starts. Count only accounts from this cohort.");
  }
});

test("window, age, label, cohort limits, and model return their field errors", () => {
  for (const raw of ["0", "731", "2.5", "-1", "1e2"]) invalid({ windowDays: raw }, "windowDays", "Enter whole days from 1 to 730.");
  invalid({ windowDays: "" }, "windowDays", "Enter the follow-up window in days.");
  for (const raw of ["-1", "3651", "0.5"]) invalid({ cohorts: [cohort({ ageDays: raw })] }, "cohorts.0.ageDays", "Enter whole days from 0 to 3,650.");
  invalid({ cohorts: [cohort({ ageDays: "" })] }, "cohorts.0.ageDays", "Enter the days since this cohort's last start.");
  for (const label of ["x".repeat(41), "name\n", "\tname", "a\u007fb", "a\u0085b"]) {
    invalid({ cohorts: [cohort({ label })] }, "cohorts.0.label", "Use a name up to 40 characters on one line.");
  }
  assert.equal(valid({ cohorts: [cohort({ label: "x".repeat(40) })] }).cohorts[0].label.length, 40);
  invalid({ cohorts: [] }, "cohorts", "Add at least one cohort.");
  invalid({ cohorts: Array.from({ length: 13 }, () => cohort()) }, "cohorts", "Use up to 12 cohorts.");
  invalid({ model: "optIn" }, "model", "Choose one of the listed options.");
});

test("MRR checks only active fields and validates the split against every parsed count", () => {
  assert.equal(valid({ currency: "bad", mrrMethod: "bad", averageMonthly: "$49", monthlyCustomers: "bad",
    monthlyPrice: "bad", annualCustomers: "bad", annualPrice: "bad" }).newMrr, null);
  assert.equal(valid({ includeMrr: true, monthlyCustomers: "bad", monthlyPrice: "bad", annualCustomers: "bad", annualPrice: "bad" }).newMrr.mrrCents, 764400n);
  invalid({ includeMrr: true, currency: "JPY" }, "currency", "Choose one of the listed options.");
  invalid({ includeMrr: true, mrrMethod: "blend" }, "mrrMethod", "Choose one of the listed options.");
  invalid({ includeMrr: true, averageMonthly: "" }, "averageMonthly", "Enter an amount.");
  for (const raw of ["$49", "-1", "+1", "1e3", "1,000", "1 0", "1.001"]) {
    invalid({ includeMrr: true, averageMonthly: raw }, "averageMonthly", "Use digits with up to two decimals. No signs, commas, or currency symbols.");
  }
  invalid({ includeMrr: true, averageMonthly: "1000000000.01" }, "averageMonthly", "Enter an amount up to 1,000,000,000.00.");
  const split = { includeMrr: true, mrrMethod: "split", monthlyCustomers: "100", monthlyPrice: "10", annualCustomers: "50", annualPrice: "100" };
  invalid(split, "monthlyCustomers", "Monthly and annual customers must add up to 156, the paid customers above.");
  invalid({ ...split, annualPrice: "-1" }, "annualPrice", "Use digits with up to two decimals. No signs, commas, or currency symbols.");
  invalid({ ...split, monthlyCustomers: "-1" }, "monthlyCustomers", "Counts can't be negative.");
  const badCohortCount = calculateFreeTrialConversion(input({ ...split, cohorts: [cohort({ starts: "bad" })] }));
  assert.equal(badCohortCount.status, "invalid");
  assert.equal(badCohortCount.errors.monthlyCustomers, undefined);
  const badSplitCount = calculateFreeTrialConversion(input({ ...split, annualCustomers: "bad" }));
  assert.equal(badSplitCount.errors.monthlyCustomers, undefined);
  invalid({ ...split, cohorts: [cohort({ starts: "2000", paid: "1180" })] }, "monthlyCustomers", "Monthly and annual customers must add up to 1,180, the paid customers above.");
});

test("malformed payloads never throw and collect independent errors in one pass", () => {
  for (const raw of [null, undefined, [], 3, "form", input({ cohorts: {} }), input({ cohorts: [null] }),
    input({ cohorts: [[]] }), input({ cohorts: Array(1) }), input({ includeMrr: "yes" })]) {
    const result = calculateFreeTrialConversion(raw);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.equal(result.errors.form, "Something in the form is out of date. Reset and try again.");
  }
  const result = calculateFreeTrialConversion(input({ model: "optIn", windowDays: "", includeMrr: true,
    currency: "JPY", averageMonthly: "$49", cohorts: [
      cohort({ label: "x".repeat(41), starts: "-5", paid: "1e3", ageDays: "-1" }),
      cohort({ starts: "100", paid: "101", ageDays: "" }),
    ],
  }));
  assert.equal(result.status, "invalid");
  assert.deepEqual(Object.keys(result.errors).sort(), ["model", "windowDays", "currency", "averageMonthly",
    "cohorts.0.label", "cohorts.0.starts", "cohorts.0.paid", "cohorts.0.ageDays", "cohorts.1.paid", "cohorts.1.ageDays"].sort());
});
