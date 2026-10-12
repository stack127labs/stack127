import assert from "node:assert/strict";
import test from "node:test";
import {
  FREE_TRIAL_EXAMPLE_INPUT,
  TRIAL_MAX_COHORTS,
  TRIAL_TYPES,
  calculateFreeTrialConversion,
  freeTrialInputFromQuery,
  freeTrialShareParams,
} from "../../../lib/free-trial-conversion-calculator/engine.ts";

function input(overrides = {}) {
  return { ...FREE_TRIAL_EXAMPLE_INPUT, cohorts: [], ...overrides };
}
function valid(overrides = {}) {
  const result = calculateFreeTrialConversion(input(overrides));
  assert.equal(result.status, "valid", JSON.stringify(result.errors));
  return result;
}
function clean(overrides = {}) {
  const result = valid(overrides);
  assert.deepEqual(result.errors, {});
  return result.values;
}
function row(name, starts, paid, ageDays = "", id = "row") {
  return { id, name, starts, paid, ageDays };
}
function read(params) {
  return freeTrialInputFromQuery(key => params[key] ?? "");
}

test("opens with the specified example and exact rate", () => {
  const values = clean();
  assert.deepEqual(values.rate, {
    kind: "rate", hundredths: 800n, exact: { numerator: 8n, denominator: 1n },
    isRounded: false, roundedToZero: false,
  });
  assert.equal(values.notPaid, 460n);
  assert.equal(values.trialsPerPaidTenths, 125n);
  assert.deepEqual(values.likely, { lowHundredths: 592n, highHundredths: 1072n });
  assert.deepEqual(values.maturity, { status: "unknown" });
  for (const key of ["windowDays", "activation", "revenue", "target", "cohorts"]) assert.equal(values[key], null);
  for (const trialType of TRIAL_TYPES) assert.equal(clean({ trialType }).trialType, trialType);
});

test("matches independently known rates, Wilson bounds, and trials per paid account", () => {
  const examples = [
    ["160", "3", 188n, 63n, 537n, 533n, true, false],
    ["42", "30", 7143n, 5643n, 8284n, 14n, true, false],
    ["1180", "156", 1322n, 1140n, 1528n, 76n, true, false],
    ["50", "0", 0n, 0n, 714n, null, false, false],
    ["50", "50", 10000n, 9286n, 10000n, 10n, false, false],
    ["2000000", "1", 0n, 0n, 1n, 20000000n, true, true],
  ];
  for (const [starts, paid, hundredths, low, high, tenths, isRounded, roundedToZero] of examples) {
    const values = clean({ starts, paid });
    assert.equal(values.rate.hundredths, hundredths, `${paid}/${starts}`);
    assert.equal(values.rate.isRounded, isRounded);
    assert.equal(values.rate.roundedToZero, roundedToZero);
    assert.deepEqual(values.likely, { lowHundredths: low, highHundredths: high }, `${paid}/${starts}`);
    assert.equal(values.trialsPerPaidTenths, tenths);
  }
});

test("zero starts has no rate or interval and never divides by zero", () => {
  const values = clean({ starts: "0", paid: "0", activated: "0", monthlyPrice: "29", targetRate: "10" });
  assert.deepEqual(values.rate, { kind: "none" });
  assert.equal(values.likely, null);
  assert.equal(values.notPaid, 0n);
  assert.equal(values.trialsPerPaidTenths, null);
  assert.deepEqual(values.activation.activationRate, { kind: "none" });
  assert.deepEqual(values.activation.activatedToPaid, { kind: "none" });
  assert.equal(values.revenue.mrrCents, 0n);
  assert.equal(values.target.extraMrrCents, 0n);
});

test("maturity is complete at the window boundary and otherwise provisional or unknown", () => {
  for (const ageDays of ["30", "45"]) assert.deepEqual(clean({ windowDays: "30", ageDays }).maturity, { status: "complete" });
  assert.deepEqual(clean({ windowDays: "30", ageDays: "12" }).maturity, { status: "provisional", daysLeft: 18n });
  assert.deepEqual(clean({ windowDays: "30", ageDays: "0" }).maturity, { status: "provisional", daysLeft: 30n });
  const windowOnly = clean({ windowDays: "30" });
  assert.equal(windowOnly.windowDays, 30n);
  assert.deepEqual(windowOnly.maturity, { status: "unknown" });
  assert.deepEqual(clean({ windowDays: "730", ageDays: "3650" }).maturity, { status: "complete" });
});

test("activation uses nested counts and preserves a zero denominator", () => {
  const activation = clean({ activated: "200" }).activation;
  assert.equal(activation.activated, 200n);
  assert.equal(activation.activationRate.hundredths, 4000n);
  assert.equal(activation.activatedToPaid.hundredths, 2000n);
  const zero = clean({ paid: "0", activated: "0" }).activation;
  assert.equal(zero.activationRate.hundredths, 0n);
  assert.deepEqual(zero.activatedToPaid, { kind: "none" });
});

test("revenue calculates monthly, annual, and mixed plans without rounding MRR before ARR", () => {
  const cases = [
    [{ monthlyPrice: "29" }, 40n, 0n, 116000n, false, 1392000n],
    [{ annualPrice: "290" }, 0n, 40n, 96667n, true, 1160000n],
    [{ monthlyPrice: "29", annualPrice: "290", annualAccounts: "10" }, 30n, 10n, 111167n, true, 1334000n],
  ];
  for (const [fields, monthlyAccounts, annualAccounts, mrrCents, mrrIsRounded, arrRunRateCents] of cases) {
    assert.deepEqual(clean(fields).revenue, { currency: "USD", monthlyAccounts, annualAccounts, mrrCents, mrrIsRounded, arrRunRateCents });
  }
  for (const currency of ["USD", "EUR", "GBP", "INR", "CAD", "AUD", ""]) {
    assert.equal(clean({ monthlyPrice: "0", currency }).revenue.currency, currency || "USD");
  }
  assert.equal(clean({ paid: "1", annualPrice: "0.06" }).revenue.mrrCents, 1n);
  assert.equal(clean({ monthlyPrice: "0", annualPrice: "0", annualAccounts: "40" }).revenue.mrrCents, 0n);
});

test("targets round required paid accounts up, avoid negative extras, and use exact revenue per account", () => {
  assert.deepEqual(clean({ targetRate: "10" }).target, { hundredths: 1000n, paidAtTarget: 50n, extraPaid: 10n, extraMrrCents: null });
  assert.equal(clean({ targetRate: "10", monthlyPrice: "29" }).target.extraMrrCents, 29000n);
  assert.equal(clean({ targetRate: "10", monthlyPrice: "29", annualPrice: "290", annualAccounts: "10" }).target.extraMrrCents, 27792n);
  const fractional = clean({ starts: "333", paid: "20", targetRate: "7.5" }).target;
  assert.equal(fractional.paidAtTarget, 25n);
  assert.equal(fractional.extraPaid, 5n);
  for (const targetRate of ["5", "8"]) assert.equal(clean({ targetRate }).target.extraPaid, 0n);
  assert.equal(clean({ paid: "0", targetRate: "10", monthlyPrice: "29" }).target.extraMrrCents, 145000n);
  assert.equal(clean({ paid: "0", targetRate: "10", annualPrice: "290" }).target.extraMrrCents, 120833n);
  assert.equal(clean({ paid: "0", targetRate: "10", monthlyPrice: "29", annualPrice: "290", annualAccounts: "0" }).target.extraMrrCents, 145000n);
  assert.equal(clean({ starts: "10000", paid: "0", targetRate: "0.01" }).target.extraPaid, 1n);
});

test("99 starts and 9 paid need one extra paid account to reach a 10% target", () => {
  const fields = { starts: "99", paid: "9", targetRate: "10" };
  assert.deepEqual(clean(fields).target, {
    hundredths: 1000n, paidAtTarget: 10n, extraPaid: 1n, extraMrrCents: null,
  });
  assert.equal(clean({ ...fields, monthlyPrice: "29" }).target.extraMrrCents, 2900n);
  assert.equal(clean({ ...fields, annualPrice: "290" }).target.extraMrrCents, 2417n);
});

test("large money totals stay exact beyond the safe integer range", () => {
  const values = clean({ starts: "10000000", paid: "10000000", monthlyPrice: "1000000000", targetRate: "100" });
  assert.equal(values.rate.hundredths, 10000n);
  assert.equal(values.revenue.mrrCents, 1000000000000000000n);
  assert.equal(values.revenue.arrRunRateCents, 12000000000000000000n);
  assert.equal(values.target.extraPaid, 0n);
});

test("cohorts combine counts and leave provisional cohorts out when settled starts exist", () => {
  const cohorts = clean({ windowDays: "30", ageDays: "45", cohorts: [row("Jul", "400", "36", "75"), row("Sep", "450", "18", "10")] }).cohorts;
  assert.deepEqual(cohorts.rows.map(r => [r.inputIndex, r.name, r.rate.hundredths, r.maturity]), [
    [null, "This cohort", 800n, { status: "complete" }],
    [0, "Jul", 900n, { status: "complete" }],
    [1, "Sep", 400n, { status: "provisional", daysLeft: 20n }],
  ]);
  assert.equal(cohorts.combined.basis, "settled");
  assert.equal(cohorts.combined.status, "complete");
  assert.equal(cohorts.combined.leftOut, 1);
  assert.equal(cohorts.combined.starts, 900n);
  assert.equal(cohorts.combined.paid, 76n);
  assert.equal(cohorts.combined.rate.hundredths, 844n);
});

test("all provisional cohorts combine when none is settled", () => {
  const combined = clean({ windowDays: "30", ageDays: "5", cohorts: [row("Aug", "300", "17", "8")] }).cohorts.combined;
  assert.equal(combined.basis, "all");
  assert.equal(combined.status, "provisional");
  assert.equal(combined.leftOut, 0);
  assert.equal(combined.starts, 800n);
  assert.equal(combined.paid, 57n);
  assert.equal(combined.rate.hundredths, 713n);
  const zeroSettled = clean({ starts: "0", paid: "0", windowDays: "30", ageDays: "30", cohorts: [row("Aug", "300", "17", "8")] }).cohorts.combined;
  assert.equal(zeroSettled.basis, "all");
  assert.equal(zeroSettled.starts, 300n);
});

test("unknown maturity counts as settled and row positions survive blank rows", () => {
  const cohorts = clean({ cohorts: [row("", "300", "17")] }).cohorts;
  assert.equal(cohorts.rows[1].name, "Cohort 2");
  assert.equal(cohorts.rows[1].rate.hundredths, 567n);
  assert.equal(cohorts.combined.basis, "settled");
  assert.equal(cohorts.combined.status, "unknown");
  assert.equal(cohorts.combined.rate.hundredths, 713n);
  assert.equal(clean({ cohorts: [row("", "", "")] }).cohorts, null);
  const withBlank = clean({ cohorts: [row(" ", " ", " ", " "), row(" ", "100", "10")] }).cohorts;
  assert.equal(withBlank.rows[1].inputIndex, 1);
  assert.equal(withBlank.rows[1].name, "Cohort 3");
  const zero = clean({ starts: "0", paid: "0", cohorts: [row("Empty", "0", "0")] }).cohorts.combined;
  assert.equal(zero.basis, "all");
  assert.deepEqual(zero.rate, { kind: "none" });
});

test("basic errors invalidate the calculation and collect Advanced errors in the same call", () => {
  for (const [starts, paid] of [["100", "120"], ["0", "1"]]) {
    const result = calculateFreeTrialConversion(input({ starts, paid }));
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.ok(result.errors.paid);
  }
  const result = calculateFreeTrialConversion(input({ trialType: "other", starts: "-5", paid: "", activated: "2.5", monthlyPrice: "$29", targetRate: "0", cohorts: [row("Bad", "100", "120")] }));
  assert.equal(result.status, "invalid");
  for (const key of ["trialType", "starts", "paid", "activated", "monthlyPrice", "targetRate", "cohorts.0.paid"]) assert.ok(result.errors[key], key);
});

test("strict count parsing accepts outer spaces and rejects malformed or excessive counts", () => {
  assert.equal(clean({ starts: " 00500 ", paid: " 040 " }).rate.hundredths, 800n);
  for (const starts of ["", " ", "-5", "+5", "2.5", "1,180", "1e3", "1 000", "10000001", "9".repeat(1000), 500, null]) {
    const result = calculateFreeTrialConversion(input({ starts }));
    assert.equal(result.status, "invalid", String(starts));
    assert.ok(result.errors.starts);
  }
  assert.match(calculateFreeTrialConversion(input({ starts: "-5" })).errors.starts, /negative/);
  assert.match(valid({ annualAccounts: "-1" }).errors.annualAccounts, /negative/);
});

test("Advanced errors hide only their dependent values", () => {
  const fields = { windowDays: "30", ageDays: "45", activated: "200", monthlyPrice: "29", targetRate: "10", cohorts: [row("Jul", "400", "36", "75")] };
  const activation = valid({ ...fields, activated: "30" });
  assert.equal(activation.values.activation, null);
  assert.ok(activation.errors.activated);
  assert.equal(activation.values.revenue.mrrCents, 116000n);
  assert.ok(activation.values.cohorts);
  const revenue = valid({ ...fields, monthlyPrice: "$29" });
  assert.equal(revenue.values.revenue, null);
  assert.equal(revenue.values.target.extraMrrCents, null);
  assert.equal(revenue.values.target.extraPaid, 10n);
  assert.ok(revenue.values.activation);
  const target = valid({ ...fields, targetRate: "0" });
  assert.equal(target.values.target, null);
  assert.ok(target.values.revenue);
  const cohorts = valid({ ...fields, cohorts: [row("Sep", "100", "120")] });
  assert.equal(cohorts.values.cohorts, null);
  assert.ok(cohorts.errors["cohorts.0.paid"]);
  assert.equal(cohorts.values.rate.hundredths, 800n);
  const window = valid({ ...fields, windowDays: "0" });
  assert.deepEqual(window.values.maturity, { status: "unknown" });
  assert.ok(window.values.cohorts.rows.every(r => r.maturity.status === "unknown"));
  assert.ok(window.values.revenue);
});

test("validates days, activation, targets, currency, money, and annual-plan counts", () => {
  const cases = [
    [{ ageDays: "20" }, "windowDays"],
    [{ cohorts: [row("Sep", "100", "12", "20")] }, "windowDays"],
    ...["-1", "731", "1.5", "1e2"].map(windowDays => [{ windowDays }, "windowDays"]),
    ...["-1", "3651", "2.5"].map(ageDays => [{ windowDays: "30", ageDays }, "ageDays"]),
    ...["30", "501", "-1", "10000001"].map(activated => [{ activated }, "activated"]),
    ...["0", "101", "abc", "0.001", "1%", "+1"].map(targetRate => [{ targetRate }, "targetRate"]),
    [{ currency: "JPY", monthlyPrice: "29" }, "currency"],
    ...["$29", "-1", "+1", "1,000", "1e3", "1 000", "1.234", "1000000000.01"].map(monthlyPrice => [{ monthlyPrice }, "monthlyPrice"]),
    [{ annualPrice: "1000000000.01" }, "annualPrice"],
    [{ monthlyPrice: "29", annualAccounts: "5" }, "annualAccounts"],
    [{ annualPrice: "290", annualAccounts: "0" }, "annualAccounts"],
    [{ annualAccounts: "0" }, "annualAccounts"],
    [{ monthlyPrice: "29", annualPrice: "290" }, "annualAccounts"],
    [{ monthlyPrice: "29", annualPrice: "290", annualAccounts: "41" }, "annualAccounts"],
    [{ monthlyPrice: "29", annualPrice: "290", annualAccounts: "-1" }, "annualAccounts"],
  ];
  for (const [fields, key] of cases) {
    const result = valid(fields);
    assert.ok(result.errors[key], JSON.stringify(fields));
    assert.equal(result.values.rate.hundredths, 800n);
  }
});

test("validates filled cohort rows, names, and the twelve-row boundary", () => {
  for (const [r, key] of [
    [row("Sep", "", ""), "starts"], [row("Sep", "100", ""), "paid"],
    [row("x".repeat(41), "100", "10"), "name"], [row("Sep\n", "100", "10"), "name"],
    [row("Sep\u007f", "100", "10"), "name"], [row("Sep", "100", "10", "3651"), "ageDays"],
  ]) {
    const result = valid({ windowDays: "30", cohorts: [row("", "", ""), r] });
    assert.ok(result.errors[`cohorts.1.${key}`]);
    assert.equal(result.values.cohorts, null);
  }
  assert.equal(clean({ cohorts: [row("🙂".repeat(40), "100", "10")] }).cohorts.rows[1].name, "🙂".repeat(40));
  const rows = Array.from({ length: TRIAL_MAX_COHORTS }, (_, i) => row(`Cohort ${i}`, "10000000", "10000000"));
  assert.equal(clean({ cohorts: rows }).cohorts.rows.length, 13);
  const excess = valid({ cohorts: [...rows, row("Extra", "1", "0")] });
  assert.ok(excess.errors.cohorts);
  assert.equal(excess.values.cohorts, null);
});

test("rejects malformed payloads without throwing", () => {
  for (const payload of [null, undefined, 1, "500", [], {}, input({ cohorts: null }), input({ cohorts: {} }), input({ cohorts: [null] })]) {
    const result = calculateFreeTrialConversion(payload);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.ok(result.errors.form);
  }
});

test("share links omit empty values and sanitize cohort delimiters", () => {
  const source = input({ windowDays: "30", ageDays: "45", cohorts: [row("Jul", "400", "36", "75"), row("Sep~|26", "450", "18", "10")] });
  const params = freeTrialShareParams(source);
  assert.deepEqual(params, { type: "noCard", starts: "500", paid: "40", window: "30", age: "45", cohorts: "Jul~400~36~75|Sep26~450~18~10" });
  assert.deepEqual(read(params), { ...source, cohorts: [row("Jul", "400", "36", "75", "shared-0"), row("Sep26", "450", "18", "10", "shared-1")] });
  assert.deepEqual(read({}), input());
  assert.deepEqual(freeTrialShareParams(input({ cohorts: [row("", "", "")] })), { type: "noCard", starts: "500", paid: "40" });
});

test("share links round trip all fields and pass invalid text through for field errors", () => {
  const source = input({ trialType: "cardUpfront", starts: "500", paid: "40", windowDays: "30", ageDays: "12", activated: "200", targetRate: "10", currency: "EUR", monthlyPrice: "29", annualPrice: "290", annualAccounts: "10", cohorts: [row("Jul", "400", "36", "75")] });
  assert.deepEqual(read(freeTrialShareParams(source)), { ...source, cohorts: [{ ...source.cohorts[0], id: "shared-0" }] });
  assert.equal(freeTrialShareParams(input({ currency: "EUR" })).currency, undefined);
  assert.equal(freeTrialShareParams(input({ monthlyPrice: "0", currency: "EUR" })).currency, "EUR");
  const bad = read({ starts: "1,180", monthly: "$29", cohorts: "Bad~100~120~" });
  assert.equal(bad.starts, "1,180");
  const result = calculateFreeTrialConversion(bad);
  assert.equal(result.status, "invalid");
  for (const key of ["starts", "monthlyPrice", "cohorts.0.paid"]) assert.ok(result.errors[key]);
  assert.equal(read({ cohorts: Array.from({ length: 13 }, (_, i) => `${i}~100~10~`).join("|") }).cohorts.length, 12);
});
