import assert from "node:assert/strict";
import test from "node:test";
import { calculateStartupRunway } from "../../../lib/startup-runway-calculator/engine.ts";

const input = (overrides = {}) => ({
  currency: "USD", cashNow: "500000", collectedPerMonth: "10000", paidOutPerMonth: "50000",
  revenueGrowthPercent: "", expenseGrowthPercent: "", plannedChanges: [], ...overrides,
});
const change = (overrides = {}) => ({
  id: "change1", name: "", direction: "out", amount: "500", startMonth: "4", frequency: "once", ...overrides,
});
const valid = (overrides) => {
  const result = calculateStartupRunway(input(overrides));
  assert.equal(result.status, "valid", JSON.stringify(result.errors));
  assert.deepEqual(result.errors, {});
  return result.values;
};
const invalid = (overrides) => {
  const result = calculateStartupRunway(input(overrides));
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  return result.errors;
};

test("example 1: today's runway is exact and the forecast is off", () => {
  const v = valid();
  assert.equal(v.cashNowCents, 50000000n);
  assert.equal(v.collectedPerMonthCents, 1000000n);
  assert.equal(v.grossBurnCents, 5000000n);
  assert.equal(v.netBurnCents, 4000000n);
  assert.deepEqual(v.today, {
    kind: "burning", netBurnCents: 4000000n, runwayTenths: 125n, runwayIsExact: true, cashOutMonth: 13n,
  });
  assert.equal(v.projection, null);
});

test("example 2: 10% growth runs out before lasting break-even, with the complete month 0 to 20 path", () => {
  const v = valid({ paidOutPerMonth: "60000", revenueGrowthPercent: "10", expenseGrowthPercent: "0" });
  assert.deepEqual(v.today, {
    kind: "burning", netBurnCents: 5000000n, runwayTenths: 100n, runwayIsExact: true, cashOutMonth: 10n,
  });
  const p = v.projection;
  assert.deepEqual(p.outcome, { kind: "runsOut" });
  assert.deepEqual(p.cashOut, { month: 12, runwayTenths: 118n, runwayIsExact: false });
  assert.equal(p.firstCoversCostsMonth, 20);
  assert.equal(p.coversCostsFromMonth, 20);
  assert.deepEqual(p.lowestBalance, { month: 19, cents: -12840911n });
  assert.equal(p.cashShortfallCents, 12840911n);
  assert.equal(p.matchesToday, false);
  assert.equal(p.revenueGrowthHundredths, 1000n);
  assert.equal(p.revenueGrowthWasBlank, false);
  assert.equal(p.expenseGrowthHundredths, 0n);
  assert.equal(p.expenseGrowthWasBlank, false);
  assert.deepEqual(p.plannedChanges, []);
  // Independently calculated with Python Fraction, rounding each exact month to cents.
  const expected = [
    [0n, 50000000n], [1000000n, 45000000n], [1100000n, 40100000n],
    [1210000n, 35310000n], [1331000n, 30641000n], [1464100n, 26105100n],
    [1610510n, 21715610n], [1771561n, 17487171n], [1948717n, 13435888n],
    [2143589n, 9579477n], [2357948n, 5937425n], [2593742n, 2531167n],
    [2853117n, -615716n], [3138428n, -3477288n], [3452271n, -6025017n],
    [3797498n, -8227519n], [4177248n, -10050271n], [4594973n, -11455298n],
    [5054470n, -12400828n], [5559917n, -12840911n], [6115909n, -12725002n],
  ];
  assert.deepEqual(p.path.slice(0, 21), expected.map(([collectedCents, balanceCents], month) => ({
    month, collectedCents, balanceCents, paidOutCents: month === 0 ? 0n : 6000000n,
    plannedCents: 0n, changeCents: month === 0 ? 0n : collectedCents - 6000000n,
    atTodaysRateCents: 50000000n - BigInt(month) * 5000000n,
    coversCosts: month === 0 ? null : month >= 20,
  })));
  assert.equal(p.path.length, 61);
  assert.equal(p.path[60].month, 60);
});

test("example 3: 5% growth floors the partial month and retains the cash gap", () => {
  const p = valid({ paidOutPerMonth: "60000", revenueGrowthPercent: "5", expenseGrowthPercent: "0" }).projection;
  assert.deepEqual(p.outcome, { kind: "runsOut" });
  assert.deepEqual(p.cashOut, { month: 11, runwayTenths: 105n, runwayIsExact: false });
  assert.equal(p.firstCoversCostsMonth, 38);
  assert.equal(p.coversCostsFromMonth, 38);
  assert.deepEqual(p.lowestBalance, { month: 37, cents: -70371862n });
  assert.equal(p.cashShortfallCents, 70371862n);
});

test("example 4: positive cash flow keeps its own outcome", () => {
  const v = valid({ cashNow: "1000", collectedPerMonth: "60000", paidOutPerMonth: "50000" });
  assert.deepEqual(v.today, { kind: "cashFlowPositive", surplusCents: 1000000n });
  assert.equal(v.netBurnCents, -1000000n);
  assert.equal(v.projection, null);
});

test("example 5: equal flows are break-even", () => {
  const v = valid({ cashNow: "1000", collectedPerMonth: "30000", paidOutPerMonth: "30000" });
  assert.deepEqual(v.today, { kind: "breakEven" });
  assert.equal(v.netBurnCents, 0n);
  assert.equal(v.projection, null);
});

test("example 6: a hire interrupts coverage and a yearly renewal affects cash", () => {
  const v = valid({
    cashNow: "20000", collectedPerMonth: "3000", paidOutPerMonth: "2500", revenueGrowthPercent: "5",
    plannedChanges: [
      change({ id: "hire", name: "Hire", amount: "2000", frequency: "monthly" }),
      change({ id: "renewal", name: "Annual renewal", amount: "1200", startMonth: "3", frequency: "yearly" }),
    ],
  });
  assert.deepEqual(v.today, { kind: "cashFlowPositive", surplusCents: 50000n });
  const p = v.projection;
  assert.equal(p.expenseGrowthWasBlank, true);
  assert.equal(p.expenseGrowthHundredths, 0n);
  assert.equal(p.cashOut, null);
  assert.equal(p.firstCoversCostsMonth, 1);
  assert.equal(p.coversCostsFromMonth, 10);
  assert.deepEqual(p.outcome, { kind: "coversCostsBeforeCashOut", month: 10 });
  assert.deepEqual(p.lowestBalance, { month: 9, cents: 1737970n });
  assert.equal(p.cashShortfallCents, null);
  assert.equal(p.path[3].plannedCents, -120000n);
  assert.equal(p.path[3].balanceCents, 2075750n);
  assert.equal(p.path[9].collectedCents, 443237n);
  assert.equal(p.path[9].coversCosts, false);
  assert.equal(p.path[10].collectedCents, 465398n);
  assert.equal(p.path[10].coversCosts, true);
  assert.equal(p.path[15].plannedCents, -320000n);
  assert.equal(p.path[15].balanceCents, 2083569n);
});

test("example 7: growth covers costs before cash runs out", () => {
  const v = valid({ cashNow: "30000", collectedPerMonth: "5000", paidOutPerMonth: "10000", revenueGrowthPercent: "10", expenseGrowthPercent: "0" });
  assert.deepEqual(v.today, { kind: "burning", netBurnCents: 500000n, runwayTenths: 60n, runwayIsExact: true, cashOutMonth: 6n });
  const p = v.projection;
  assert.equal(p.cashOut, null);
  assert.equal(p.firstCoversCostsMonth, 9);
  assert.equal(p.coversCostsFromMonth, 9);
  assert.deepEqual(p.outcome, { kind: "coversCostsBeforeCashOut", month: 9 });
  assert.deepEqual(p.lowestBalance, { month: 8, cents: 717945n });
});

test("example 8: faster-growing expenses never reach lasting break-even", () => {
  const v = valid({ cashNow: "100000", collectedPerMonth: "6000", paidOutPerMonth: "8000", revenueGrowthPercent: "3", expenseGrowthPercent: "5" });
  assert.equal(v.today.runwayTenths, 500n);
  assert.equal(v.today.cashOutMonth, 50n);
  const p = v.projection;
  assert.deepEqual(p.cashOut, { month: 20, runwayTenths: 196n, runwayIsExact: false });
  assert.deepEqual(p.outcome, { kind: "runsOut" });
  assert.equal(p.firstCoversCostsMonth, null);
  assert.equal(p.coversCostsFromMonth, null);
  assert.equal(p.cashShortfallCents, null);
});

test("example 9: no opening cash is valid and gives zero runway", () => {
  const v = valid({ cashNow: "0", collectedPerMonth: "500", paidOutPerMonth: "1000" });
  assert.deepEqual(v.today, { kind: "burning", netBurnCents: 50000n, runwayTenths: 0n, runwayIsExact: true, cashOutMonth: 0n });
});

test("example 10: growth begins in month 2 and cannot fund the first month's gap", () => {
  const v = valid({ cashNow: "0", collectedPerMonth: "900", paidOutPerMonth: "1000", revenueGrowthPercent: "20", expenseGrowthPercent: "0" });
  assert.equal(v.today.runwayTenths, 0n);
  assert.equal(v.today.cashOutMonth, 0n);
  const p = v.projection;
  assert.deepEqual(p.outcome, { kind: "runsOut" });
  assert.deepEqual(p.cashOut, { month: 0, runwayTenths: 0n, runwayIsExact: true });
  assert.equal(p.coversCostsFromMonth, 2);
  assert.deepEqual(p.lowestBalance, { month: 1, cents: -10000n });
  assert.equal(p.cashShortfallCents, 10000n);
  assert.equal(p.path[1].collectedCents, 90000n);
  assert.equal(p.path[2].collectedCents, 108000n);
});

test("example 11: static runway stays uncapped while the forecast stops at month 60", () => {
  const v = valid({ cashNow: "500000", collectedPerMonth: "9900", paidOutPerMonth: "10000", revenueGrowthPercent: "0", expenseGrowthPercent: "0" });
  assert.equal(v.today.runwayTenths, 50000n);
  assert.equal(v.today.cashOutMonth, 5000n);
  const p = v.projection;
  assert.equal(p.matchesToday, true);
  assert.equal(p.cashOut, null);
  assert.deepEqual(p.outcome, { kind: "lastsBeyondHorizon" });
  assert.equal(p.path[60].balanceCents, 49400000n);
  assert.deepEqual(p.lowestBalance, { month: 60, cents: 49400000n });
});

test("example 12: a one-off payment takes cash below zero despite recurring coverage", () => {
  const v = valid({ cashNow: "100000", collectedPerMonth: "5000", paidOutPerMonth: "4000", plannedChanges: [change({ amount: "150000", startMonth: "6" })] });
  assert.equal(v.today.kind, "cashFlowPositive");
  const p = v.projection;
  assert.equal(p.revenueGrowthWasBlank, true);
  assert.equal(p.expenseGrowthWasBlank, true);
  assert.deepEqual(p.outcome, { kind: "runsOut" });
  assert.deepEqual(p.cashOut, { month: 6, runwayTenths: 57n, runwayIsExact: false });
  assert.equal(p.path[5].balanceCents, 10500000n);
  assert.equal(p.path[6].changeCents, -14900000n);
  assert.equal(p.path[6].balanceCents, -4400000n);
  assert.equal(p.coversCostsFromMonth, 1);
  assert.deepEqual(p.lowestBalance, { month: 6, cents: -4400000n });
  assert.equal(p.cashShortfallCents, 4400000n);
});

test("example 13: -100% growth keeps month 1 and then drops revenue to zero", () => {
  const p = valid({ cashNow: "10000", collectedPerMonth: "1000", paidOutPerMonth: "500", revenueGrowthPercent: "-100" }).projection;
  assert.equal(p.path[1].collectedCents, 100000n);
  assert.ok(p.path.slice(2).every(point => point.collectedCents === 0n));
  assert.deepEqual(p.cashOut, { month: 22, runwayTenths: 220n, runwayIsExact: true });
  assert.equal(p.firstCoversCostsMonth, 1);
  assert.equal(p.coversCostsFromMonth, null);
  assert.equal(p.cashShortfallCents, null);
});

test("exact half cents round away from zero without compounding rounded values", () => {
  const p = valid({ cashNow: "0", collectedPerMonth: "0.01", paidOutPerMonth: "0.01", revenueGrowthPercent: "50", expenseGrowthPercent: "50" }).projection;
  assert.deepEqual(p.path.slice(1, 5).map(point => point.collectedCents), [1n, 2n, 2n, 3n]);
  assert.deepEqual(p.path.slice(1, 5).map(point => point.paidOutCents), [1n, 2n, 2n, 3n]);
  assert.ok(p.path.every(point => point.balanceCents === 0n));
  assert.equal(p.cashOut, null);
  assert.deepEqual(p.outcome, { kind: "coversCostsThroughout" });
  assert.deepEqual(p.lowestBalance, { month: 0, cents: 0n });
});

test("each cadence keeps planned amounts flat in either direction", () => {
  for (const direction of ["in", "out"]) {
    for (const frequency of ["once", "monthly", "yearly"]) {
      const p = valid({ cashNow: "100000", collectedPerMonth: "0", paidOutPerMonth: "0", revenueGrowthPercent: "100", expenseGrowthPercent: "100", plannedChanges: [change({ direction, frequency, startMonth: "2", amount: "123.45" })] }).projection;
      const activeMonths = frequency === "once" ? [2] : frequency === "yearly" ? [2, 14, 26, 38, 50] : Array.from({ length: 59 }, (_, i) => i + 2);
      const signed = direction === "in" ? 12345n : -12345n;
      assert.deepEqual(p.path.filter(point => point.plannedCents !== 0n).map(point => point.month), activeMonths);
      assert.ok(p.path.filter(point => point.plannedCents !== 0n).every(point => point.plannedCents === signed));
      assert.equal(p.path[60].balanceCents, 10000000n + BigInt(activeMonths.length) * signed);
      assert.equal(p.coversCostsFromMonth, direction === "out" && frequency === "monthly" ? null : 1);
    }
  }
});

test("only monthly income helps cover costs, and only from its start month", () => {
  for (const frequency of ["once", "yearly", "monthly"]) {
    const p = valid({ cashNow: "1000", collectedPerMonth: "0", paidOutPerMonth: "1", plannedChanges: [change({ direction: "in", frequency, amount: "1", startMonth: "4" })] }).projection;
    assert.equal(p.firstCoversCostsMonth, frequency === "monthly" ? 4 : null);
    assert.equal(p.coversCostsFromMonth, frequency === "monthly" ? 4 : null);
  }
});

test("simultaneous planned payments cancel in cash but recurring flows still determine coverage", () => {
  const p = valid({ cashNow: "1000", collectedPerMonth: "0", paidOutPerMonth: "0", plannedChanges: [
    change({ id: "monthly", amount: "1", startMonth: "1", frequency: "monthly" }),
    change({ id: "once", direction: "in", amount: "1", startMonth: "1" }),
  ] }).projection;
  assert.equal(p.path[1].plannedCents, 0n);
  assert.equal(p.path[1].coversCosts, false);
  assert.equal(p.coversCostsFromMonth, null);
});

test("cash out at zero differs from a shortfall, and tied low balances keep the first month", () => {
  const p = valid({ cashNow: "1", collectedPerMonth: "0", paidOutPerMonth: "1", plannedChanges: [change({ direction: "in", amount: "1", startMonth: "2", frequency: "monthly" })] }).projection;
  assert.deepEqual(p.cashOut, { month: 1, runwayTenths: 10n, runwayIsExact: true });
  assert.deepEqual(p.lowestBalance, { month: 1, cents: 0n });
  assert.equal(p.coversCostsFromMonth, 2);
  assert.equal(p.cashShortfallCents, null);
  assert.deepEqual(p.outcome, { kind: "runsOut" });
});

test("a hire at month 60 can end earlier cost coverage without cash out", () => {
  const p = valid({ cashNow: "1000", collectedPerMonth: "1", paidOutPerMonth: "1", plannedChanges: [change({ amount: "1", startMonth: "60", frequency: "monthly" })] }).projection;
  assert.equal(p.firstCoversCostsMonth, 1);
  assert.equal(p.coversCostsFromMonth, null);
  assert.equal(p.cashOut, null);
  assert.deepEqual(p.outcome, { kind: "lastsBeyondHorizon" });
});

test("a zero opening balance can hold until a later planned payment", () => {
  const p = valid({ cashNow: "0", collectedPerMonth: "0", paidOutPerMonth: "0", plannedChanges: [change({ amount: "1", startMonth: "2" })] }).projection;
  assert.equal(p.path[1].balanceCents, 0n);
  // Follow the explicit first qualifying month; the month-zero exception applies only in month 1.
  assert.deepEqual(p.cashOut, { month: 2, runwayTenths: 10n, runwayIsExact: true });
  assert.deepEqual(p.outcome, { kind: "runsOut" });
  assert.equal(p.coversCostsFromMonth, 1);
  assert.deepEqual(p.lowestBalance, { month: 2, cents: -100n });
  assert.equal(p.cashShortfallCents, 100n);
});

test("zero growth matches static partial-month runway inside the horizon", () => {
  for (const [cashNow, runwayTenths, runwayIsExact, month] of [
    ["0", 0n, true, 0], ["1", 10n, true, 1], ["2.01", 20n, false, 3],
    ["12.59", 125n, false, 13], ["60", 600n, true, 60],
  ]) {
    const v = valid({ cashNow, collectedPerMonth: "0", paidOutPerMonth: "1", revenueGrowthPercent: "0", expenseGrowthPercent: "0" });
    assert.equal(v.today.runwayTenths, runwayTenths);
    assert.equal(v.today.runwayIsExact, runwayIsExact);
    assert.equal(v.today.cashOutMonth, BigInt(month));
    assert.deepEqual(v.projection.cashOut, { month, runwayTenths, runwayIsExact });
    assert.equal(v.projection.matchesToday, true);
    assert.equal(v.projection.cashShortfallCents, null);
  }
  const afterHorizon = valid({ cashNow: "60.01", collectedPerMonth: "0", paidOutPerMonth: "1", revenueGrowthPercent: "0" });
  assert.equal(afterHorizon.today.cashOutMonth, 61n);
  assert.equal(afterHorizon.projection.cashOut, null);
});

test("forecast group ignores blank rows and flags growth left blank", () => {
  const ignored = change({ name: " ", amount: " ", startMonth: " ", direction: "bad", frequency: "bad" });
  assert.equal(valid({ plannedChanges: [ignored] }).projection, null);
  for (const plannedChanges of [undefined, null, {}, "bad"]) assert.equal(valid({ plannedChanges }).projection, null);
  const p = valid({ expenseGrowthPercent: "0", plannedChanges: [ignored, change({ id: "second", name: "  Hire  " }), change({ id: "third" })] }).projection;
  assert.equal(p.revenueGrowthWasBlank, true);
  assert.equal(p.expenseGrowthWasBlank, false);
  assert.equal(p.matchesToday, false);
  assert.deepEqual(p.plannedChanges, [
    { id: "second", name: "Hire", nameWasBlank: false, direction: "out", amountCents: 50000n, startMonth: 4, frequency: "once" },
    { id: "third", name: "Planned change 2", nameWasBlank: true, direction: "out", amountCents: 50000n, startMonth: 4, frequency: "once" },
  ]);
  assert.equal(valid({ revenueGrowthPercent: 0, expenseGrowthPercent: null }).projection, null);
});

test("money validates each field without treating malformed pastes as zero", () => {
  const cases = [
    ["", "missing"], ["   ", "missing"], [null, "missing"], [1, "missing"],
    ["-1000", "negative"], [" -0.00 ", "negative"], ["abc", "format"],
    ["$500,000", "format"], ["500,000", "format"], ["1e5", "format"], ["100.001", "format"],
    ["+1", "format"], ["1 2", "format"], [".5", "format"], ["5.", "format"],
    ["NaN", "format"], ["Infinity", "format"], ["1%", "format"],
    ["1000000000.01", "range"], ["9".repeat(1000), "range"],
  ];
  for (const key of ["cashNow", "collectedPerMonth", "paidOutPerMonth"]) {
    for (const [raw, code] of cases) assert.equal(invalid({ [key]: raw })[key].code, code, `${key}: ${String(raw).slice(0, 30)}`);
  }
  assert.equal(valid({ cashNow: " 00001.2 " }).cashNowCents, 120n);
  assert.equal(valid({ cashNow: "1000000000.00" }).cashNowCents, 100000000000n);
  const tinyBurn = valid({ cashNow: "1000000000", collectedPerMonth: "0", paidOutPerMonth: "0.01" });
  assert.equal(tinyBurn.today.runwayTenths, 1000000000000n);
  assert.equal(tinyBurn.today.cashOutMonth, 100000000000n);
});

test("signed growth validates format and bounds on both fields", () => {
  for (const key of ["revenueGrowthPercent", "expenseGrowthPercent"]) {
    for (const raw of ["-100.01", "100.01", "1000", "9".repeat(1000)]) assert.equal(invalid({ [key]: raw })[key].code, "range");
    for (const raw of ["100.5%", "1e2", "+5", "0.001", "1 0", "abc"]) assert.equal(invalid({ [key]: raw })[key].code, "format");
    for (const raw of ["-100", "100", " -00.01 ", "-0"]) assert.ok(valid({ [key]: raw }).projection);
  }
  const p = valid({ expenseGrowthPercent: "-100" }).projection;
  assert.equal(p.path[1].paidOutCents, 5000000n);
  assert.ok(p.path.slice(2).every(point => point.paidOutCents === 0n));
});

test("planned changes report amount and start-month errors separately", () => {
  const fields = "plannedChanges.change1";
  for (const [amount, code] of [["", "missing"], ["0", "zero"], ["-200", "negative"], ["1.001", "format"], ["1000000000.01", "range"]]) {
    assert.equal(invalid({ plannedChanges: [change({ amount })] })[`${fields}.amount`].code, code);
  }
  for (const [startMonth, code] of [["", "missing"], ["61", "range"], ["0", "range"], ["4.5", "format"], ["-1", "format"], ["1e1", "format"], ["+1", "format"], ["9".repeat(1000), "range"]]) {
    assert.equal(invalid({ plannedChanges: [change({ startMonth })] })[`${fields}.startMonth`].code, code);
  }
  const both = invalid({ plannedChanges: [change({ name: "Hire", amount: "", startMonth: "" })] });
  assert.equal(both[`${fields}.amount`].code, "missing");
  assert.equal(both[`${fields}.startMonth`].code, "missing");
  for (const startMonth of [" 01 ", "60"]) assert.ok(valid({ plannedChanges: [change({ startMonth })] }).projection);
});

test("names and options validate counted rows", () => {
  for (const name of ["Hire\n", "\tHire", "x\u0000", "x\u007f", "x\u0085"]) {
    assert.equal(invalid({ plannedChanges: [change({ name })] })["plannedChanges.change1.name"].code, "format");
  }
  assert.equal(invalid({ plannedChanges: [change({ name: "x".repeat(61) })] })["plannedChanges.change1.name"].code, "range");
  assert.equal(valid({ plannedChanges: [change({ name: "🙂".repeat(60) })] }).projection.plannedChanges[0].name, "🙂".repeat(60));
  assert.equal(invalid({ plannedChanges: [change({ direction: "both", frequency: "weekly" })] })["plannedChanges.change1.direction"].code, "option");
  assert.equal(invalid({ plannedChanges: [change({ frequency: "weekly" })] })["plannedChanges.change1.frequency"].code, "option");
  for (const currency of ["USD", "EUR", "GBP", "INR", "CAD", "AUD"]) assert.equal(valid({ currency }).currency, currency);
  for (const currency of ["JPY", "usd", null, ""]) assert.equal(invalid({ currency }).currency.code, "option");
  assert.equal(valid({ currency: " EUR " }).currency, "EUR");
});

test("structural errors include blank rows, while all active field errors accumulate", () => {
  for (const raw of [null, [], "bad", 1, true, undefined]) {
    assert.deepEqual(calculateStartupRunway(raw), { status: "invalid", values: null, errors: { form: { code: "form", message: "Something in the form is out of date. Reset and try again." } } });
  }
  for (const row of [null, [], "bad", {}, change({ id: "" }), change({ id: 123 })]) assert.equal(invalid({ plannedChanges: [row] }).form.code, "form");
  assert.equal(invalid({ plannedChanges: [change(), change()] }).plannedChanges.code, "duplicateId");
  const blank = change({ name: "", amount: "", startMonth: "" });
  assert.equal(invalid({ plannedChanges: [blank, blank] }).plannedChanges.code, "duplicateId");
  assert.equal(invalid({ plannedChanges: Array.from({ length: 11 }, (_, i) => ({ ...blank, id: `id${i}` })) }).plannedChanges.code, "limit");
  const badInput = input({ currency: "JPY", cashNow: "-1", collectedPerMonth: "", paidOutPerMonth: "$1", revenueGrowthPercent: "101", expenseGrowthPercent: "5%", plannedChanges: [change({ name: "x\n", direction: "both", amount: "0", startMonth: "61", frequency: "weekly" }), null] });
  const original = structuredClone(badInput);
  const r = calculateStartupRunway(badInput);
  assert.equal(r.status, "invalid");
  assert.deepEqual(new Set(Object.keys(r.errors)), new Set([
    "currency", "cashNow", "collectedPerMonth", "paidOutPerMonth", "revenueGrowthPercent", "expenseGrowthPercent", "form",
    "plannedChanges.change1.name", "plannedChanges.change1.direction", "plannedChanges.change1.amount",
    "plannedChanges.change1.startMonth", "plannedChanges.change1.frequency",
  ]));
  assert.deepEqual(badInput, original);
  const missing = calculateStartupRunway({ currency: "USD" });
  for (const key of ["cashNow", "collectedPerMonth", "paidOutPerMonth"]) assert.equal(missing.errors[key].code, "missing");
});

test("maximum amounts and ten planned changes remain exact through month 60", () => {
  const p = valid({
    cashNow: "1000000000", collectedPerMonth: "1000000000", paidOutPerMonth: "1000000000",
    revenueGrowthPercent: "100", expenseGrowthPercent: "100",
    plannedChanges: Array.from({ length: 10 }, (_, i) => change({ id: `id${i}`, direction: "in", amount: "1000000000", startMonth: "1", frequency: "monthly" })),
  }).projection;
  assert.equal(p.path[60].collectedCents, 57646075230342348800000000000n);
  assert.equal(p.path[60].paidOutCents, 57646075230342348800000000000n);
  assert.equal(p.path[60].plannedCents, 1000000000000n);
  assert.equal(p.path[60].balanceCents, 60100000000000n);
  assert.equal(p.path[60].atTodaysRateCents, 100000000000n);
  assert.deepEqual(p.outcome, { kind: "coversCostsThroughout" });
  assert.equal(p.cashOut, null);
  assert.equal(p.cashShortfallCents, null);
  for (let month = 1; month <= 60; month += 1) {
    assert.equal(p.path[month].balanceCents, p.path[month - 1].balanceCents + p.path[month].changeCents);
  }
});
