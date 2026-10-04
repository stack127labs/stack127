import assert from "node:assert/strict";
import test from "node:test";
import { calculateBreakEvenMrr } from "../../../lib/break-even-mrr-calculator/engine.ts";
import { divideCeil, divideHalfAwayFromZero, parseMoneyCents, parsePercentHundredths } from "../../../lib/saas-economics/shared.ts";

const line = (amount, period = "month", id = "cost1", name = "Hosting") => ({ id, name, amount, period });
const input = (overrides = {}) => ({
  currency: "USD", fixedCosts: [line("25000")], monthlyArpa: "49",
  variableMethod: "perAccount", variableCostPerAccount: "8", variableCostSharePercent: "",
  currentMrr: "", ...overrides,
});
const valid = (overrides) => {
  const result = calculateBreakEvenMrr(input(overrides));
  assert.equal(result.status, "valid", JSON.stringify(result.errors));
  return result.values;
};

test("continuous revenue and whole accounts use different thresholds", () => {
  const v = valid();
  assert.equal(v.contributionPerAccountCents, 4100n);
  assert.equal(v.contributionRatioHundredths, 8367n);
  assert.deepEqual(v.outcome, {
    kind: "finite", breakEvenMrrCents: 2987805n, accounts: 610n,
    mrrAtAccountsCents: 2989000n, leftAfterFixedCents: 1000n, accountsUnknownReason: null,
  });
});

test("current position uses contribution before overhead and rounds added accounts up", () => {
  const v = valid({ fixedCosts: [line("80000")], monthlyArpa: "120", variableCostPerAccount: "25", currentMrr: "60000" });
  assert.equal(v.outcome.breakEvenMrrCents, 10105264n);
  assert.equal(v.outcome.accounts, 843n);
  assert.equal(v.outcome.mrrAtAccountsCents, 10116000n);
  assert.equal(v.outcome.leftAfterFixedCents, 8500n);
  assert.deepEqual(v.current, { mrrCents: 6000000n, monthlyResultCents: -3250000n, mrrGapCents: 4105264n, additionalAccounts: 343n });
  const above = valid({ fixedCosts: [line("1000")], monthlyArpa: "50", variableCostPerAccount: "10", currentMrr: "5000" });
  assert.equal(above.current.monthlyResultCents, 300000n);
  assert.equal(above.current.mrrGapCents, -375000n);
  assert.equal(above.current.additionalAccounts, 0n);
});

test("yearly costs remain exact through threshold and current-result calculations", () => {
  const v = valid({ fixedCosts: [line("100", "year")], monthlyArpa: "10", variableCostPerAccount: "2" });
  assert.equal(v.fixedCosts[0].monthlyCents, 833n);
  assert.equal(v.fixedCosts[0].monthlyIsRounded, true);
  assert.equal(v.fixedMonthlyIsRounded, true);
  assert.equal(v.outcome.breakEvenMrrCents, 1042n);
  assert.equal(v.outcome.accounts, 2n);
  assert.equal(v.outcome.leftAfterFixedCents, 767n);
  const mixed = valid({ fixedCosts: [line("40"), line("120", "year", "cost2"), line("0", "month", "cost3", "")], monthlyArpa: "20", variableCostPerAccount: "5" });
  assert.equal(mixed.fixedMonthlyCents, 5000n);
  assert.equal(mixed.outcome.breakEvenMrrCents, 6667n);
  assert.equal(mixed.outcome.accounts, 4n);
  assert.equal(mixed.fixedCosts[2].name, "Fixed cost 3");
  // Two half-cent yearly amounts total exactly one cent per month.
  const fractional = valid({ fixedCosts: [line("0.06", "year"), line("0.06", "year", "cost2")], monthlyArpa: "1", variableCostPerAccount: "0" });
  assert.equal(fractional.fixedMonthlyCents, 1n);
  assert.equal(fractional.outcome.breakEvenMrrCents, 1n);
});

test("share mode can calculate MRR without pretending to know account count", () => {
  const v = valid({ fixedCosts: [line("4500")], variableMethod: "shareOfMrr", variableCostSharePercent: "20", monthlyArpa: "", variableCostPerAccount: "ignored", currentMrr: "1000" });
  assert.equal(v.outcome.breakEvenMrrCents, 562500n);
  assert.equal(v.outcome.accounts, null);
  assert.equal(v.outcome.accountsUnknownReason, "arpaMissing");
  assert.equal(v.contributionPerAccountCents, null);
  assert.equal(v.current.monthlyResultCents, -370000n);
  assert.equal(v.current.additionalAccounts, null);
  const withArpa = valid({ fixedCosts: [line("4500")], variableMethod: "shareOfMrr", variableCostSharePercent: "20", monthlyArpa: "29" });
  assert.equal(withArpa.outcome.accounts, 194n);
  assert.equal(withArpa.outcome.mrrAtAccountsCents, 562600n);
  assert.equal(withArpa.outcome.leftAfterFixedCents, 80n);
});

test("non-positive contribution distinguishes zero overhead from uncovered costs", () => {
  for (const fixed of ["0", "4500"]) {
    for (const cost of ["29", "35"]) {
      const v = valid({ fixedCosts: [line(fixed)], monthlyArpa: "29", variableCostPerAccount: cost });
      assert.deepEqual(v.outcome, { kind: "noFiniteThreshold", contribution: cost === "29" ? "zero" : "negative", fixedCosts: fixed === "0" ? "zero" : "positive" });
    }
  }
  assert.equal(valid({ fixedCosts: [line("0")] }).outcome.kind, "zeroFixedCosts");
  assert.equal(valid({ variableMethod: "shareOfMrr", variableCostSharePercent: "100", monthlyArpa: "" }).outcome.kind, "noFiniteThreshold");
  const loss = valid({ fixedCosts: [line("4500")], monthlyArpa: "29", variableCostPerAccount: "30", currentMrr: "2900" });
  assert.equal(loss.current.monthlyResultCents, -460000n);
  assert.equal(loss.current.mrrGapCents, null);
});

test("money and percentages reject malformed pastes without changing their meaning", () => {
  const bounds = { min: 0n, max: 100000000000n };
  for (const raw of ["-1", "+1", "1e3", "$55", "1,000", "55.001", ".5", "5.", "NaN", "Infinity", "1 2"]) {
    assert.equal(parseMoneyCents(raw, bounds).ok, false, raw);
  }
  assert.deepEqual(parseMoneyCents(" 00001.2 ", bounds), { ok: true, value: 120n });
  assert.deepEqual(parseMoneyCents("1000000000.00", bounds), { ok: true, value: 100000000000n });
  assert.equal(parseMoneyCents("1000000000.01", bounds).reason, "range");
  assert.deepEqual(parsePercentHundredths("-0.01", { min: -10000n, max: 10000n }), { ok: true, value: -1n });
  assert.equal(parsePercentHundredths("-0", { min: 0n, max: 10000n }).ok, false);
  assert.equal(divideHalfAwayFromZero(-1n, 2n), -1n);
  assert.equal(divideCeil(-3n, 2n), -1n);
});

test("invalid inputs report every active field and preserve row identity", () => {
  const bad = calculateBreakEvenMrr(input({
    currency: "JPY", fixedCosts: [line("$55", "week", "stable", "x".repeat(61))],
    monthlyArpa: "0", variableCostPerAccount: "-1", currentMrr: "abc",
  }));
  assert.equal(bad.status, "invalid");
  for (const key of ["currency", "fixedCosts.stable.amount", "fixedCosts.stable.period", "fixedCosts.stable.name", "monthlyArpa", "variableCostPerAccount", "currentMrr"]) assert.ok(bad.errors[key], key);
  for (const raw of [null, [], 5, "bad", { fixedCosts: {} }]) {
    const r = calculateBreakEvenMrr(raw);
    assert.equal(r.status, "invalid");
    assert.ok(r.errors.form);
  }
  for (const fixedCosts of [[], [line("1"), line("2")], [null], Array.from({ length: 21 }, (_, i) => line("1", "month", `id${i}`))]) {
    const r = calculateBreakEvenMrr(input({ fixedCosts }));
    assert.equal(r.status, "invalid");
    assert.ok(r.errors.fixedCosts);
  }
  for (const monthlyArpa of ["", "0"]) assert.equal(calculateBreakEvenMrr(input({ monthlyArpa })).status, "invalid");
  assert.equal(calculateBreakEvenMrr(input({ variableMethod: "shareOfMrr", variableCostSharePercent: "100.01" })).status, "invalid");
});

test("maximum-sized costs retain exact integers and a sufficient threshold", () => {
  const v = valid({ fixedCosts: Array.from({ length: 20 }, (_, i) => line("1000000000", "month", `id${i}`)), monthlyArpa: "0.01", variableCostPerAccount: "0" });
  assert.equal(v.fixedMonthlyCents, 2000000000000n);
  assert.equal(v.outcome.accounts, 2000000000000n);
  assert.equal(v.outcome.leftAfterFixedCents, 0n);
});
