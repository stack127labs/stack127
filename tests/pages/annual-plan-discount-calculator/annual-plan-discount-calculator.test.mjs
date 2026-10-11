import assert from "node:assert/strict";
import test from "node:test";
import {
  ANNUAL_PLAN_FEE_PRESETS,
  calculateAnnualPlanDiscount,
} from "../../../lib/annual-plan-discount-calculator/engine.ts";

const input = (overrides = {}) => ({
  currency: "USD", monthlyPrice: "20", offerMode: "discount", annualPrice: "",
  discountPercent: "20", monthsFree: "", monthlyChurnPercent: "", annualRenewalPercent: "",
  feePreset: "none", feePercent: "", feeFixed: "", ...overrides,
});
const valid = (overrides = {}) => {
  const result = calculateAnnualPlanDiscount(input(overrides));
  assert.equal(result.status, "valid", JSON.stringify(result.errors));
  assert.deepEqual(result.errors, {});
  return result.values;
};
const invalid = (overrides, key, message) => {
  const result = calculateAnnualPlanDiscount(input(overrides));
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  assert.equal(result.errors[key], message);
  return result.errors;
};
const fees = (feePreset) => {
  const preset = ANNUAL_PLAN_FEE_PRESETS.find(value => value.id === feePreset);
  return { feePreset, feePercent: String(Number(preset.percentHundredths) / 100), feeFixed: String(Number(preset.fixedCents) / 100) };
};
const example1 = {
  offerMode: "monthsFree", monthsFree: "2", monthlyChurnPercent: "3", annualRenewalPercent: "70", ...fees("stripeCard"),
};
const table = (v) => v.comparison.horizons.map(h => [
  h.months, h.monthly.grossCents, h.annual?.grossCents ?? null,
  h.differenceCents, h.annualVsMonthly, h.breakEvenDiscount?.tenths ?? null,
]);

test("example 1: two months free, churn, annual renewals, and Stripe fees", () => {
  const v = valid(example1);
  assert.equal(v.offer.annualPriceCents, 20000n);
  assert.equal(v.offer.annualPriceRounded, false);
  assert.equal(v.offer.discount.tenths, 167n);
  assert.deepEqual(v.offer.discount.exact, { numerator: 1n, denominator: 6n });
  assert.deepEqual(v.offer.monthsFree, { tenths: 20n, exact: true });
  assert.equal(v.offer.customerSavingsCents, 4000n);
  assert.equal(v.offer.mrr.monthlyPlanCents, 2000n);
  assert.deepEqual(v.offer.mrr.annualPlan, { cents: 1667n, exact: { numerator: 5000n, denominator: 3n } });
  assert.equal(v.offer.mrr.differenceCents, -333n);
  assert.deepEqual(v.offer.invoiceEquivalent, { months: { tenths: 100n, exact: true }, wholePayments: 10n });
  assert.deepEqual(v.upfront, {
    monthly: { grossCents: 2000n, fee: { feesCents: 88n, netCents: 1912n } },
    annual: { grossCents: 20000n, fee: { feesCents: 610n, netCents: 19390n } }, differenceCents: 18000n,
  });
  assert.deepEqual(table(v), [
    [12, 20411n, 20000n, -411n, "less", 150n],
    [24, 34572n, 34000n, -572n, "less", 153n],
    [36, 44398n, 43800n, -598n, "less", 155n],
  ]);
  assert.equal(v.comparison.horizons[0].monthly.expectedChargesHundredths, 1021n);
  assert.equal(v.comparison.horizons[0].annual.expectedChargesHundredths, 100n);
  assert.deepEqual(v.comparison.horizons.map(h => [h.monthly.fee, h.annual.fee, h.netDifferenceCents]), [
    [{ feesCents: 898n, netCents: 19513n }, { feesCents: 610n, netCents: 19390n }, -123n],
    [{ feesCents: 1521n, netCents: 33051n }, { feesCents: 1037n, netCents: 32963n }, -88n],
    [{ feesCents: 1954n, netCents: 42444n }, { feesCents: 1336n, netCents: 42464n }, 20n],
  ]);
  const totals = v.comparison.runningTotals;
  assert.equal(totals.length, 36);
  assert.deepEqual(totals[0], { month: 1, monthlyCents: 2000n, annualCents: 20000n });
  for (const [month, expected] of [[12, 20000n], [13, 34000n], [24, 34000n], [25, 43800n], [36, 43800n]]) {
    assert.equal(totals[month - 1].annualCents, expected);
  }
  for (const h of v.comparison.horizons) assert.equal(totals[h.months - 1].monthlyCents, h.monthly.grossCents);
});

test("example 2: annual price, fractional invoice threshold, and unknown renewals", () => {
  const v = valid({ offerMode: "annualPrice", annualPrice: "192", monthlyChurnPercent: "3" });
  assert.equal(v.offer.discount.tenths, 200n);
  assert.deepEqual(v.offer.monthsFree, { tenths: 24n, exact: false });
  assert.equal(v.offer.customerSavingsCents, 4800n);
  assert.equal(v.offer.mrr.annualPlan.cents, 1600n);
  assert.equal(v.offer.mrr.differenceCents, -400n);
  assert.deepEqual(v.offer.invoiceEquivalent, { months: { tenths: 96n, exact: false }, wholePayments: 10n });
  assert.deepEqual(table(v), [
    [12, 20411n, 19200n, -1211n, "less", 150n],
    [24, 34572n, null, null, null, null], [36, 44398n, null, null, null, null],
  ]);
  assert.equal(v.comparison.annualRenewalHundredths, null);
  assert.ok(v.comparison.horizons.every(h => h.netDifferenceCents === null && h.monthly.fee === null));
  assert.ok(v.comparison.runningTotals.slice(0, 12).every(point => point.annualCents === 19200n));
  assert.ok(v.comparison.runningTotals.slice(12).every(point => point.annualCents === null));
});

test("example 3: annual billings exceed monthly at five percent churn", () => {
  const v = valid({ monthlyPrice: "50", monthlyChurnPercent: "5", annualRenewalPercent: "80" });
  assert.equal(v.offer.annualPriceCents, 48000n);
  assert.deepEqual(table(v), [
    [12, 45964n, 48000n, 2036n, "more", 234n],
    [24, 70801n, 86400n, 15599n, "more", 344n],
    [36, 84222n, 117120n, 32898n, "more", 425n],
  ]);
  assert.equal(v.comparison.horizons[0].monthly.expectedChargesHundredths, 919n);
});

test("example 4: round the annual offer first and use it for every later figure", () => {
  const v = valid({ monthlyPrice: "9.99", discountPercent: "15" });
  assert.equal(v.offer.annualPriceCents, 10190n);
  assert.equal(v.offer.annualPriceRounded, true);
  assert.equal(v.offer.discount.tenths, 150n);
  assert.deepEqual(v.offer.discount.exact, { numerator: 899n, denominator: 5994n });
  assert.deepEqual(v.offer.monthsFree, { tenths: 18n, exact: false });
  assert.equal(v.offer.customerSavingsCents, 1798n);
  assert.equal(v.offer.mrr.annualPlan.cents, 849n);
  assert.deepEqual(v.offer.invoiceEquivalent, { months: { tenths: 102n, exact: false }, wholePayments: 11n });
  assert.equal(v.comparison, null);
});

test("example 5: fractional churn and Paddle fees", () => {
  const v = valid({ monthlyPrice: "29", monthlyChurnPercent: "2.5", annualRenewalPercent: "75", ...fees("paddle") });
  assert.equal(v.offer.annualPriceCents, 27840n);
  assert.deepEqual(table(v), [
    [12, 30392n, 27840n, -2552n, "less", 127n],
    [24, 52822n, 48720n, -4102n, "less", 133n],
    [36, 69374n, 64380n, -4994n, "less", 138n],
  ]);
  assert.equal(v.comparison.horizons[0].monthly.expectedChargesHundredths, 1048n);
  assert.equal(v.comparison.horizons[0].monthly.fee.feesCents, 2044n);
  assert.equal(v.comparison.horizons[0].annual.fee.feesCents, 1442n);
});

test("example 6: zero churn and complete annual renewal", () => {
  const v = valid({ offerMode: "monthsFree", monthsFree: "2", monthlyChurnPercent: "0", annualRenewalPercent: "100" });
  assert.deepEqual(table(v), [
    [12, 24000n, 20000n, -4000n, "less", 0n],
    [24, 48000n, 40000n, -8000n, "less", 0n],
    [36, 72000n, 60000n, -12000n, "less", 0n],
  ]);
  assert.ok(v.comparison.horizons.every(h => !h.breakEvenDiscount.nearZero));
});

test("example 7: complete monthly churn and no annual renewal", () => {
  const v = valid({ offerMode: "monthsFree", monthsFree: "2", monthlyChurnPercent: "100", annualRenewalPercent: "0" });
  for (const h of v.comparison.horizons) {
    assert.equal(h.monthly.grossCents, 2000n);
    assert.equal(h.monthly.expectedChargesHundredths, 100n);
    assert.equal(h.annual.grossCents, 20000n);
    assert.equal(h.annual.expectedChargesHundredths, 100n);
    assert.equal(h.breakEvenDiscount.tenths, 917n);
  }
});

test("example 8: annual surcharges retain signed savings and months free", () => {
  const v = valid({ offerMode: "annualPrice", annualPrice: "300" });
  assert.equal(v.offer.discount.tenths, -250n);
  assert.deepEqual(v.offer.monthsFree, { tenths: -30n, exact: true });
  assert.equal(v.offer.customerSavingsCents, -6000n);
  assert.deepEqual(v.offer.invoiceEquivalent, { months: { tenths: 150n, exact: true }, wholePayments: 15n });
});

test("example 9: each preset charges the fixed fee once per expected payment", () => {
  for (const [preset, monthly, annual] of [
    ["paddle", 1800n, 1050n], ["lemonSqueezy", 1920n, 1150n],
    ["stripeCardBilling", 1224n, 750n], ["stripeCard", 1056n, 610n],
  ]) {
    const v = valid({ offerMode: "monthsFree", monthsFree: "2", monthlyChurnPercent: "0", ...fees(preset) });
    const h = v.comparison.horizons[0];
    assert.equal(h.monthly.fee.feesCents, monthly, preset);
    assert.equal(h.annual.fee.feesCents, annual, preset);
    assert.equal(v.fee.edited, false);
    assert.equal(v.offer.mrr.annualPlan.cents, 1667n);
    assert.equal(h.breakEvenDiscount.tenths, 0n);
  }
});

test("example 10: custom and edited fees use the entered values", () => {
  const original = valid(example1);
  const custom = valid({ ...example1, feePreset: "custom", feePercent: "2.9", feeFixed: "0.30" });
  assert.deepEqual(custom.fee, { preset: "custom", percentHundredths: 290n, fixedCents: 30n, edited: false });
  assert.deepEqual(custom.upfront, original.upfront);
  assert.deepEqual(custom.comparison, original.comparison);
  const edited = valid({ ...example1, feeFixed: "0.25" });
  assert.equal(edited.fee.edited, true);
  assert.equal(edited.upfront.annual.fee.feesCents, 605n);
});

test("example 11: no discount and no churn give exactly equal year-one billings", () => {
  const v = valid({ discountPercent: "0", monthlyChurnPercent: "0" });
  assert.equal(v.offer.discount.tenths, 0n);
  assert.equal(v.offer.discount.nearZero, false);
  assert.equal(v.offer.customerSavingsCents, 0n);
  assert.deepEqual(v.offer.monthsFree, { tenths: 0n, exact: true });
  assert.equal(v.comparison.horizons[0].differenceCents, 0n);
  assert.equal(v.comparison.horizons[0].annualVsMonthly, "same");
});

test("example 12: a derived annual price rounding to zero is invalid", () => {
  invalid({ monthlyPrice: "0.01", offerMode: "monthsFree", monthsFree: "11.99" }, "monthsFree",
    "This makes the annual price 0.00. Use fewer months free.");
  invalid({ monthlyPrice: "0.01", discountPercent: "99.99" }, "discountPercent",
    "This makes the annual price 0.00. Use a smaller discount.");
});

test("example 13: a derived annual price may exceed the money entry maximum", () => {
  const v = valid({ monthlyPrice: "1000000000", discountPercent: "0" });
  assert.equal(v.offer.annualPriceCents, 1200000000000n);
  assert.equal(v.offer.annualPriceRounded, false);
  assert.equal(v.offer.mrr.annualPlan.cents, 100000000000n);
});

test("example 14: invalid inputs return field errors and never return values", () => {
  const moneyFormat = "Use digits with up to two decimals. No signs, commas, or currency symbols.";
  invalid({ monthlyPrice: "" }, "monthlyPrice", "Enter the monthly price.");
  invalid({ monthlyPrice: "0" }, "monthlyPrice", "Enter a monthly price above 0.");
  for (const monthlyPrice of ["-20", "$20", "1,000", "20.001", "1e3", "+20", ".5", "5."]) {
    invalid({ monthlyPrice }, "monthlyPrice", moneyFormat);
  }
  for (const discountPercent of ["100", "-5", "20%", "110", "20.001"]) {
    invalid({ discountPercent }, "discountPercent",
      "Enter a number from 0 to 99.99, without the % sign. To charge more than 12 monthly payments, choose Annual price.");
  }
  invalid({ discountPercent: "" }, "discountPercent", "Enter the annual discount.");
  for (const monthsFree of ["12", "13", "-1"]) {
    invalid({ offerMode: "monthsFree", monthsFree }, "monthsFree", "Enter months free from 0 to 11.99.");
  }
  invalid({ offerMode: "monthsFree", monthsFree: "" }, "monthsFree", "Enter the number of months free.");
  invalid({ offerMode: "annualPrice", annualPrice: "0" }, "annualPrice", "Enter an annual price above 0.");
  invalid({ offerMode: "annualPrice", annualPrice: "" }, "annualPrice", "Enter the annual price.");
  for (const key of ["monthlyChurnPercent", "annualRenewalPercent"]) {
    for (const raw of ["100.01", "-1", "101", "3%", "0.001"]) {
      invalid({ [key]: raw }, key, "Enter a percent from 0 to 100, with up to two decimals, or leave it blank.");
    }
  }
  invalid({ ...fees("paddle"), feePercent: "" }, "feePercent", "Enter a fee percent from 0 to 50, with up to two decimals.");
  invalid({ ...fees("paddle"), currency: "EUR" }, "feePreset",
    "These presets are US rates in USD. Choose Custom fee for other currencies.");
  for (const [key, raw] of [["currency", "JPY"], ["offerMode", "weekly"], ["feePreset", "unknown"]]) {
    invalid({ [key]: raw }, key, "Choose one of the listed options.");
  }
  const formError = "Something in the form is out of date. Reset and try again.";
  for (const raw of [null, [], 20, "bad", input({ monthlyPrice: 20 }), input({ annualRenewalPercent: null })]) {
    const result = calculateAnnualPlanDiscount(raw);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.equal(result.errors.form, formError);
  }
  assert.equal(valid({ annualPrice: "junk", monthsFree: "junk", feePercent: "junk", feeFixed: "junk" }).comparison, null);
  assert.equal(valid({ annualRenewalPercent: "70" }).comparison, null);
  assert.equal(valid({ monthlyPrice: " 20.00 ", discountPercent: " 20.00 " }).offer.annualPriceCents, 19200n);
});

test("rounding preserves tiny signed discounts, exact comparisons, and negative net receipts", () => {
  for (const [annualPrice, sign] of [["239.99", 1n], ["240.01", -1n]]) {
    const v = valid({ offerMode: "annualPrice", annualPrice });
    assert.equal(v.offer.discount.tenths, 0n);
    assert.equal(v.offer.discount.nearZero, true);
    assert.equal(v.offer.discount.exact.numerator, sign);
  }
  const negative = valid({ monthlyPrice: "0.01", discountPercent: "0", monthlyChurnPercent: "0", feePreset: "custom", feePercent: "0", feeFixed: "1" });
  assert.equal(negative.upfront.monthly.fee.netCents, -99n);
  assert.equal(negative.comparison.horizons[0].monthly.fee.netCents, -1188n);
  assert.equal(negative.comparison.horizons[0].annual.fee.netCents, -88n);
  assert.equal(negative.comparison.horizons[0].netDifferenceCents, 1100n);
  const surcharge = valid({ discountPercent: "0", monthlyChurnPercent: "0", annualRenewalPercent: "0" });
  assert.equal(surcharge.comparison.horizons[1].breakEvenDiscount.tenths, -1000n);
  assert.equal(surcharge.comparison.horizons[2].breakEvenDiscount.tenths, -2000n);
  const tiny = valid({ monthlyPrice: "0.01", discountPercent: "0", monthlyChurnPercent: "0.01" }).comparison.horizons[0];
  assert.equal(tiny.differenceCents, 0n);
  assert.equal(tiny.annualVsMonthly, "more");
  const halfCent = valid({ monthlyPrice: "0.05", offerMode: "monthsFree", monthsFree: "1.9" });
  assert.equal(halfCent.offer.annualPriceCents, 51n);
  assert.equal(halfCent.offer.annualPriceRounded, true);
  const halfFee = valid({ monthlyPrice: "0.01", feePreset: "custom", feePercent: "50", feeFixed: "0" });
  assert.equal(halfFee.upfront.monthly.fee.feesCents, 1n);
});

test("validation collects all active errors and enforces price and fee bounds", () => {
  const errors = invalid({ monthlyPrice: "0", discountPercent: "100", monthlyChurnPercent: "101",
    annualRenewalPercent: "101", feePreset: "custom", feePercent: "51", feeFixed: "101" },
    "monthlyPrice", "Enter a monthly price above 0.");
  assert.deepEqual(Object.keys(errors).sort(), ["monthlyPrice", "discountPercent", "monthlyChurnPercent", "annualRenewalPercent", "feePercent", "feeFixed"].sort());
  invalid({ monthlyPrice: "1000000000.01" }, "monthlyPrice", "Enter an amount up to 1,000,000,000.00.");
  invalid({ offerMode: "annualPrice", annualPrice: "1000000000.01" }, "annualPrice", "Enter an amount up to 1,000,000,000.00.");
  for (const feePercent of ["-1", "50.01", "2.901"]) {
    invalid({ feePreset: "custom", feePercent, feeFixed: "0" }, "feePercent", "Enter a fee percent from 0 to 50, with up to two decimals.");
  }
  invalid({ feePreset: "custom", feePercent: "0", feeFixed: "" }, "feeFixed", "Enter a fixed fee per charge. Use 0 if there is none.");
  invalid({ feePreset: "custom", feePercent: "0", feeFixed: "100.01" }, "feeFixed", "Enter a fixed fee up to 100.00.");
  invalid({ feePreset: "custom", feePercent: "0", feeFixed: "-1" }, "feeFixed", "Use digits with up to two decimals. No signs, commas, or currency symbols.");
  assert.equal(valid({ currency: "EUR", feePreset: "custom", feePercent: "50", feeFixed: "100" }).fee.fixedCents, 10000n);
});
