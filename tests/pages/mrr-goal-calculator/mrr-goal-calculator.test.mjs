import assert from "node:assert/strict";
import test from "node:test";
import { calculateMrrGoal, MRR_GOAL_MAX_MONTHS, MRR_GOAL_MAX_COUNT } from "../../../lib/mrr-goal-calculator/engine.ts";

const input = (overrides = {}) => ({
  currency: "USD", goalAmount: "10000", goalPeriod: "month", monthlyArpa: "29",
  method: "customers", solveFor: "date", currentCustomers: "", newCustomersPerMonth: "",
  churnPercent: "", currentMrr: "", growthPercent: "", deadlineMonths: "",
  visitorToSignupPercent: "", signupToPaidPercent: "", ...overrides,
});
const valid = (overrides = {}) => {
  const result = calculateMrrGoal(input(overrides));
  assert.equal(result.status, "valid", JSON.stringify(result.errors));
  assert.deepEqual(result.errors, {});
  return result.values;
};
const customers = (overrides = {}) => valid({ currentCustomers: "0", newCustomersPerMonth: "15", churnPercent: "0", ...overrides });
const growth = (overrides = {}) => valid({ method: "growth", currentMrr: "1000", growthPercent: "10", ...overrides });
const deadline = (overrides = {}) => customers({ solveFor: "pace", deadlineMonths: "12", ...overrides });
const trafficRates = { visitorToSignupPercent: "3", signupToPaidPercent: "15" };

test("example 1: the customer goal rounds up and the blank timeline is skipped", () => {
  const v = valid();
  assert.equal(v.goal.customersNeeded, 345n);
  assert.equal(v.goal.mrrAtCustomersNeededCents, 1000500n);
  assert.equal(v.goal.monthlyGoalCents, 1000000n);
  assert.equal(v.goal.annualGoalCents, 12000000n);
  assert.equal(v.timeline, null);
  assert.equal(v.traffic, null);
});

test("example 2: a $12 ARPA needs 834 customers", () => {
  assert.equal(valid({ monthlyArpa: "12" }).goal.customersNeeded, 834n);
});

test("example 3: ARR keeps the exact yearly goal while rounding the monthly display", () => {
  assert.deepEqual(valid({ goalPeriod: "year" }).goal, {
    period: "year", enteredCents: 1000000n, monthlyGoalCents: 83333n,
    monthlyGoalIsRounded: true, annualGoalCents: 1000000n,
    customersNeeded: 29n, mrrAtCustomersNeededCents: 84100n,
  });
});

test("example 4: 15 additions without churn reach the goal in month 23", () => {
  const t = customers().timeline;
  assert.deepEqual(t.outcome, { kind: "reached", month: 23 });
  assert.equal(t.ceiling, null);
  assert.equal(t.lostPerMonthAtGoal, 0n);
  assert.equal(t.remainingCustomers, 345n);
  assert.equal(t.pace, 15n);
  assert.equal(t.path.length, 24);
  assert.deepEqual(t.path[23], { month: 23, customers: 345n, mrrCents: 1000500n });
});

test("example 5: 3% churn delays the goal to month 39 without rounding intermediate counts", () => {
  const t = customers({ churnPercent: "3" }).timeline;
  assert.deepEqual(t.outcome, { kind: "reached", month: 39 });
  assert.deepEqual(t.ceiling, { floor: 500n, isWhole: true });
  assert.equal(t.lostPerMonthAtGoal, 11n);
  assert.equal(t.path[38].customers, 342n);
  for (const [month, expected] of [[1, 15n], [2, 29n], [3, 43n], [12, 153n], [24, 259n], [39, 347n]]) {
    assert.equal(t.path[month].customers, expected, `month ${month}`);
    assert.equal(t.path[month].mrrCents, expected * 2900n);
  }
});

test("example 6: an account goal above the ceiling returns the smallest reachable pace", () => {
  const v = customers({ goalAmount: "15000", churnPercent: "3" });
  assert.equal(v.goal.customersNeeded, 518n);
  assert.deepEqual(v.timeline.outcome, { kind: "unreachable", reason: "ceiling", paceToReach: 16n });
  assert.deepEqual(v.timeline.ceiling, { floor: 500n, isWhole: true });
  assert.equal(v.timeline.path.at(-1).month, 120);
});

test("example 7: a current base of 120 reaches the goal in month 16", () => {
  const t = customers({ currentCustomers: "120", newCustomersPerMonth: "20", churnPercent: "2.5" }).timeline;
  assert.equal(t.remainingCustomers, 225n);
  assert.deepEqual(t.ceiling, { floor: 800n, isWhole: true });
  assert.deepEqual(t.outcome, { kind: "reached", month: 16 });
  assert.equal(t.path[15].customers, 334n);
  assert.equal(t.path[16].customers, 346n);
});

test("example 8: an already-met goal can fall below the target in month 9", () => {
  const t = customers({ currentCustomers: "400", newCustomersPerMonth: "5", churnPercent: "3" }).timeline;
  assert.deepEqual(t.outcome, { kind: "alreadyThere", fallsBelowInMonth: 9 });
  assert.deepEqual(t.ceiling, { floor: 166n, isWhole: false });
  assert.equal(t.remainingCustomers, 0n);
  assert.ok(t.path[8].customers >= 345n);
  assert.ok(t.path[9].customers < 345n);
  assert.equal(t.path.at(-1).month, 12);
});

test("example 9: no additions and no churn cannot reach a higher goal", () => {
  const t = customers({ currentCustomers: "10", newCustomersPerMonth: "0" }).timeline;
  assert.deepEqual(t.outcome, { kind: "unreachable", reason: "noNewCustomers" });
  assert.equal(t.path.at(-1).month, 120);
  assert.ok(t.path.every(point => point.customers === 10n));
});

test("example 10: a goal reached after 1000 months stops at the 600-month cap", () => {
  const v = customers({ goalAmount: "29000", newCustomersPerMonth: "1" });
  assert.equal(v.goal.customersNeeded, 1000n);
  assert.deepEqual(v.timeline.outcome, { kind: "beyondHorizon" });
  assert.equal(v.timeline.path.length, 601);
  assert.equal(v.timeline.path.at(-1).customers, 600n);
});

test("example 11: reaching 200 customers in 12 months needs 17 additions each month", () => {
  const v = deadline({ monthlyArpa: "50" });
  assert.equal(v.goal.customersNeeded, 200n);
  assert.equal(v.timeline.pace, 17n);
  assert.deepEqual(v.timeline.outcome, { kind: "paceForDeadline", deadlineMonths: 12, alreadyThere: false });
  assert.equal(v.timeline.path[12].customers, 204n);
});

test("example 12: the deadline pace is whole and traffic uses that pace", () => {
  const v = deadline({ churnPercent: "4", ...trafficRates });
  assert.equal(v.timeline.pace, 36n);
  assert.equal(v.timeline.lostPerMonthAtGoal, 14n);
  assert.deepEqual(v.timeline.outcome, { kind: "paceForDeadline", deadlineMonths: 12, alreadyThere: false });
  assert.deepEqual(v.traffic, {
    kind: "finite", visitorToSignupHundredths: 300n, signupToPaidHundredths: 1500n,
    pace: 36n, signupsPerMonth: 240n, visitorsPerMonth: 8000n, visitorsToGoal: 96000n, months: 12,
  });
  assert.equal(customers({ newCustomersPerMonth: "35", churnPercent: "4" }).timeline.outcome.month, 13);
  assert.equal(customers({ newCustomersPerMonth: "36", churnPercent: "4" }).timeline.outcome.month, 12);
});

test("example 13: zero signup-to-paid conversion has no finite traffic", () => {
  assert.deepEqual(deadline({ churnPercent: "4", ...trafficRates, signupToPaidPercent: "0" }).traffic,
    { kind: "noFiniteTraffic", stage: "signupToPaid" });
});

test("example 14: 10% monthly MRR growth first reaches the goal in month 25", () => {
  const t = growth().timeline;
  assert.deepEqual(t.outcome, { kind: "reached", month: 25 });
  assert.equal(t.remainingMrrCents, 900000n);
  assert.equal(t.path[1].mrrCents, 110000n);
  assert.equal(t.path[3].mrrCents, 133100n);
  assert.equal(t.path[24].mrrCents, 984973n);
});

test("example 15: binary search returns the smallest hundredth-percent growth rate", () => {
  const t = growth({ solveFor: "pace", deadlineMonths: "24" }).timeline;
  assert.equal(t.growthHundredths, 1007n);
  assert.deepEqual(t.outcome, { kind: "rateForDeadline", deadlineMonths: 24, alreadyThere: false });
  assert.equal(t.path[24].mrrCents, 1000127n);
  assert.equal(growth({ growthPercent: "10.06" }).timeline.path[24].mrrCents, 997949n);
});

test("example 16: a one-month tenfold increase needs exactly 900% growth", () => {
  const t = growth({ solveFor: "pace", deadlineMonths: "1" }).timeline;
  assert.equal(t.growthHundredths, 90000n);
  assert.deepEqual(t.outcome, { kind: "rateForDeadline", deadlineMonths: 1, alreadyThere: false });
  assert.equal(t.path[1].mrrCents, 1000000n);
  assert.equal(t.path.at(-1).month, 12);
});

test("example 17: a deadline above the supported rate returns no chart path", () => {
  const t = growth({ currentMrr: "0.01", goalAmount: "1000000000", solveFor: "pace", deadlineMonths: "1" }).timeline;
  assert.deepEqual(t.outcome, { kind: "aboveMaxRate", deadlineMonths: 1 });
  assert.equal(t.growthHundredths, 100000n);
  assert.deepEqual(t.path, []);
});

test("example 18: 0.3% growth cannot reach a tenfold goal within 600 months", () => {
  const t = growth({ growthPercent: "0.3" }).timeline;
  assert.deepEqual(t.outcome, { kind: "beyondHorizon" });
  assert.equal(t.path.length, 601);
  assert.ok(100000n * 10030n ** 768n < 1000000n * 10000n ** 768n);
  assert.ok(100000n * 10030n ** 769n >= 1000000n * 10000n ** 769n);
});

test("example 19: zero and negative growth explain why the goal is unreachable", () => {
  for (const [growthPercent, reason] of [["0", "noGrowth"], ["-2", "shrinking"]]) {
    const t = growth({ growthPercent }).timeline;
    assert.deepEqual(t.outcome, { kind: "unreachable", reason });
    assert.equal(t.path.at(-1).month, 120);
  }
});

test("example 20: current MRR above the goal is already there with no remaining MRR", () => {
  const t = growth({ currentMrr: "12000", growthPercent: "5" }).timeline;
  assert.deepEqual(t.outcome, { kind: "alreadyThere" });
  assert.equal(t.remainingMrrCents, 0n);
  assert.equal(t.path[0].mrrCents, 1200000n);
  assert.equal(t.path.at(-1).month, 12);
});

test("example 21: invalid inputs return the specified field codes and messages", () => {
  const cases = [
    [{ goalAmount: "" }, "goalAmount", "missing", "Enter your revenue goal."],
    [{ goalAmount: "0" }, "goalAmount", "zero", "Enter a goal above 0."],
    [{ monthlyArpa: "0" }, "monthlyArpa", "zero", "Enter an ARPA above 0."],
    ...["$10,000", "1e4", "10000.001"].map(goalAmount => [{ goalAmount }, "goalAmount", "format", "Use digits with up to two decimals. No signs, commas, or currency symbols."]),
    ...[["101", "range"], ["-1", "format"]].map(([churnPercent, code]) => [{ currentCustomers: "0", newCustomersPerMonth: "15", churnPercent }, "churnPercent", code, "Enter a percent from 0 to 100, with up to two decimals."]),
    ...["12.5", "1,200"].map(currentCustomers => [{ currentCustomers, newCustomersPerMonth: "15", churnPercent: "0" }, "currentCustomers", "format", "Use digits only, without commas, signs, or decimals."]),
    [{ method: "growth", currentMrr: "0", growthPercent: "10" }, "currentMrr", "zeroBase", "A growth rate can't start from 0. Use new customers and churn instead."],
    [{ method: "growth", currentMrr: "1000", growthPercent: "1000.01" }, "growthPercent", "range", "Enter a percent from -100 to 1000, with up to two decimals."],
    ...["0", "601"].map(deadlineMonths => [{ solveFor: "pace", currentCustomers: "0", churnPercent: "0", deadlineMonths }, "deadlineMonths", "range", "Enter whole months from 1 to 600."]),
    [{ currentCustomers: "0", newCustomersPerMonth: "15", churnPercent: "0", visitorToSignupPercent: "3" }, "signupToPaidPercent", "missing", "Enter this rate, or clear both rates."],
    [{ ...trafficRates }, "traffic", "trafficNeedsTimeline", "Fill in the customer timeline first. Traffic is worked out from its monthly pace."],
    [{ method: "weekly" }, "method", "option", "Choose one of the listed options."],
  ];
  for (const [overrides, field, code, message] of cases) {
    const result = calculateMrrGoal(input(overrides));
    assert.equal(result.status, "invalid", `${field}: ${JSON.stringify(overrides)}`);
    assert.equal(result.values, null);
    assert.deepEqual(result.errors, { [field]: { code, message } });
  }
  const partial = calculateMrrGoal(input({ newCustomersPerMonth: "15" }));
  assert.equal(partial.status, "invalid");
  assert.deepEqual(partial.errors, {
    currentCustomers: { code: "missing", message: "Enter a whole number. Use 0 if none." },
    churnPercent: { code: "missing", message: "Enter monthly churn. Use 0 if no one cancels." },
  });
  assert.equal(valid().timeline, null);
});

test("inactive drafts are ignored for every method and solve mode", () => {
  assert.equal(customers({ currentMrr: "bad", growthPercent: "bad", deadlineMonths: "bad" }).timeline.outcome.kind, "reached");
  assert.equal(deadline({ newCustomersPerMonth: "bad", currentMrr: "bad", growthPercent: "bad" }).timeline.pace, 29n);
  assert.equal(growth({ currentCustomers: "bad", newCustomersPerMonth: "bad", churnPercent: "bad", deadlineMonths: "bad", visitorToSignupPercent: "bad", signupToPaidPercent: "bad" }).traffic, null);
  assert.equal(growth({ solveFor: "pace", deadlineMonths: "24", growthPercent: "bad", currentCustomers: "bad", churnPercent: "bad" }).timeline.growthHundredths, 1007n);
  for (const method of ["customers", "growth"]) {
    for (const solveFor of ["date", "pace"]) {
      const v = valid({ method, solveFor });
      assert.equal(v.timeline, null);
      assert.equal(v.traffic, null);
    }
  }
  assert.equal(valid({ newCustomersPerMonth: "bad", solveFor: "pace" }).timeline, null);
  assert.equal(valid({ method: "growth", solveFor: "pace", growthPercent: "bad" }).timeline, null);
});

test("non-objects, missing properties, and every active error are handled without throwing", () => {
  for (const raw of [null, undefined, [], 5, "bad", true, 1n]) {
    assert.deepEqual(calculateMrrGoal(raw), { status: "invalid", values: null, errors: {
      form: { code: "form", message: "Something in the form is out of date. Reset and try again." },
    } });
  }
  const result = calculateMrrGoal(input({ currency: "JPY", goalAmount: "", goalPeriod: "week", monthlyArpa: "0", currentCustomers: "12.5", newCustomersPerMonth: "1000000001", churnPercent: "101", visitorToSignupPercent: "", signupToPaidPercent: "101" }));
  assert.equal(result.status, "invalid");
  assert.deepEqual(Object.keys(result.errors).sort(), ["currency", "goalAmount", "goalPeriod", "monthlyArpa", "currentCustomers", "newCustomersPerMonth", "churnPercent", "visitorToSignupPercent", "signupToPaidPercent"].sort());
  const missing = input();
  delete missing.goalAmount;
  missing.monthlyArpa = 29;
  assert.equal(calculateMrrGoal(missing).errors.goalAmount.code, "missing");
  assert.equal(calculateMrrGoal(missing).errors.monthlyArpa.code, "missing");
});

test("parsing accepts outer whitespace and rejects malformed pastes and bounds", () => {
  assert.equal(valid({ currency: " USD ", goalPeriod: " month ", method: " customers ", solveFor: " date ", goalAmount: " 00010000.00 ", monthlyArpa: " 29 " }).goal.customersNeeded, 345n);
  for (const goalAmount of ["+1", "-1", "1 0", ".5", "5.", "NaN", "Infinity", "1%", "1\n0"]) {
    assert.equal(calculateMrrGoal(input({ goalAmount })).errors.goalAmount.code, "format", goalAmount);
  }
  assert.equal(calculateMrrGoal(input({ goalAmount: "1000000000.01" })).errors.goalAmount.code, "range");
  assert.equal(valid({ goalAmount: "1000000000.00", monthlyArpa: "0.01" }).goal.customersNeeded, 100000000000n);
  assert.equal(customers({ currentCustomers: String(MRR_GOAL_MAX_COUNT), newCustomersPerMonth: String(MRR_GOAL_MAX_COUNT), churnPercent: "100" }).timeline.pace, MRR_GOAL_MAX_COUNT);
  for (const deadlineMonths of ["1.5", "+1", "1,000"]) {
    assert.equal(calculateMrrGoal(input({ solveFor: "pace", currentCustomers: "0", churnPercent: "0", deadlineMonths })).errors.deadlineMonths.code, "format");
  }
  for (const growthPercent of ["-100.01", "1000.01"]) {
    assert.equal(calculateMrrGoal(input({ method: "growth", currentMrr: "1000", growthPercent })).errors.growthPercent.code, "range");
  }
  for (const growthPercent of ["+1", "1%", "1e2", "1.001"]) {
    assert.equal(calculateMrrGoal(input({ method: "growth", currentMrr: "1000", growthPercent })).errors.growthPercent.code, "format");
  }
});

test("fractional-cent yearly goals use exact comparisons rather than rounded displays", () => {
  const tiny = valid({ goalAmount: "0.01", goalPeriod: "year", monthlyArpa: "0.01" });
  assert.equal(tiny.goal.monthlyGoalCents, 0n);
  assert.equal(tiny.goal.customersNeeded, 1n);
  assert.equal(valid({ goalAmount: "0.06", goalPeriod: "year" }).goal.monthlyGoalCents, 1n);
  const below = growth({ goalAmount: "0.13", goalPeriod: "year", currentMrr: "0.01", growthPercent: "0" });
  assert.equal(below.goal.monthlyGoalCents, 1n);
  assert.equal(below.timeline.remainingMrrCents, 0n);
  assert.deepEqual(below.timeline.outcome, { kind: "unreachable", reason: "noGrowth" });
  assert.equal(growth({ goalAmount: "0.13", goalPeriod: "year", currentMrr: "0.01", growthPercent: "10" }).timeline.outcome.month, 1);
  const rate = growth({ goalAmount: "0.13", goalPeriod: "year", currentMrr: "0.01", solveFor: "pace", deadlineMonths: "1" }).timeline;
  assert.equal(rate.growthHundredths, 834n);
});

test("customer dates include month 600 and classify a goal exactly at the ceiling", () => {
  assert.equal(MRR_GOAL_MAX_MONTHS, 600);
  const atCap = customers({ goalAmount: "600", monthlyArpa: "1", newCustomersPerMonth: "1" }).timeline;
  assert.deepEqual(atCap.outcome, { kind: "reached", month: 600 });
  assert.equal(atCap.path.length, 601);
  assert.equal(customers({ goalAmount: "601", monthlyArpa: "1", newCustomersPerMonth: "1" }).timeline.outcome.kind, "beyondHorizon");
  const ceiling = customers({ goalAmount: "14500", churnPercent: "3" }).timeline;
  assert.deepEqual(ceiling.outcome, { kind: "unreachable", reason: "ceiling", paceToReach: 16n });
  assert.ok(ceiling.path.every(point => point.customers < 500n));
  assert.deepEqual(customers({ churnPercent: "100", newCustomersPerMonth: "346" }).timeline.outcome, { kind: "reached", month: 1 });
  assert.equal(deadline({ churnPercent: "100", deadlineMonths: "600" }).timeline.pace, 345n);
  const large = deadline({ goalAmount: "1000000000", monthlyArpa: "0.01", churnPercent: "100", deadlineMonths: "600" }).timeline;
  assert.equal(large.pace, 100000000000n);
  assert.equal(large.path[600].customers, 100000000000n);
});

test("100% churn reaches its ceiling in month 1 and cannot reach a higher target", () => {
  const overrides = { currentCustomers: "0", newCustomersPerMonth: "15", churnPercent: "100", monthlyArpa: "1" };
  const reached = customers({ ...overrides, goalAmount: "15" }).timeline;
  assert.deepEqual(reached.outcome, { kind: "reached", month: 1 });
  assert.deepEqual(reached.ceiling, { floor: 15n, isWhole: true });
  assert.ok(reached.path.slice(1).every(point => point.customers === 15n));
  const unreachable = customers({ ...overrides, goalAmount: "16" }).timeline;
  assert.deepEqual(unreachable.outcome, { kind: "unreachable", reason: "ceiling", paceToReach: 16n });
  assert.deepEqual(unreachable.ceiling, { floor: 15n, isWhole: true });
  assert.equal(unreachable.path.at(-1).month, 120);
  assert.ok(unreachable.path.slice(1).every(point => point.customers === 15n));
  assert.deepEqual(customers({ ...overrides, goalAmount: "16", newCustomersPerMonth: "16" }).timeline.outcome,
    { kind: "reached", month: 1 });
});

test("already-met customer goals can hold, grow, or shrink without crossing within the cap", () => {
  for (const overrides of [{ currentCustomers: "345", newCustomersPerMonth: "0" }, { currentCustomers: "400", newCustomersPerMonth: "12", churnPercent: "3" }, { currentCustomers: "400", newCustomersPerMonth: "13", churnPercent: "3" }, { currentCustomers: "1000", newCustomersPerMonth: "11", churnPercent: "3" }]) {
    const t = customers(overrides).timeline;
    assert.deepEqual(t.outcome, { kind: "alreadyThere", fallsBelowInMonth: null });
    assert.equal(t.path.at(-1).month, 12);
  }
  const eventual = customers({ currentCustomers: "1000000000", goalAmount: "1", monthlyArpa: "1", newCustomersPerMonth: "0", churnPercent: "0.01" }).timeline;
  assert.deepEqual(eventual.outcome, { kind: "alreadyThere", fallsBelowInMonth: null });
  const positive = deadline({ currentCustomers: "400", churnPercent: "3" }).timeline;
  assert.equal(positive.pace, 7n);
  assert.equal(positive.outcome.alreadyThere, true);
  assert.ok(positive.path[12].customers >= 345n);
  assert.equal(deadline({ currentCustomers: "400", churnPercent: "3", deadlineMonths: "1" }).timeline.pace, 0n);
});

test("traffic handles zero pace, both zero stages, and independent rounding", () => {
  assert.deepEqual(customers({ ...trafficRates, visitorToSignupPercent: "0" }).traffic, { kind: "noFiniteTraffic", stage: "visitorToSignup" });
  assert.deepEqual(customers({ visitorToSignupPercent: "0", signupToPaidPercent: "0" }).traffic, { kind: "noFiniteTraffic", stage: "signupToPaid" });
  const zero = customers({ newCustomersPerMonth: "0", visitorToSignupPercent: "0", signupToPaidPercent: "0" }).traffic;
  assert.equal(zero.kind, "finite");
  assert.equal(zero.signupsPerMonth, 0n);
  assert.equal(zero.visitorsPerMonth, 0n);
  assert.equal(zero.visitorsToGoal, null);
  const zeroDeadline = deadline({ currentCustomers: "400", visitorToSignupPercent: "0", signupToPaidPercent: "0" }).traffic;
  assert.equal(zeroDeadline.visitorsToGoal, 0n);
  assert.equal(zeroDeadline.months, 12);
  const rounded = customers({ goalAmount: "1", monthlyArpa: "1", newCustomersPerMonth: "1", visitorToSignupPercent: "60", signupToPaidPercent: "60" }).traffic;
  assert.equal(rounded.signupsPerMonth, 2n);
  assert.equal(rounded.visitorsPerMonth, 3n);
  assert.equal(rounded.visitorsToGoal, 3n);
  for (const overrides of [{ currentCustomers: "400" }, { goalAmount: "15000", churnPercent: "3" }, { goalAmount: "29000", newCustomersPerMonth: "1" }]) {
    assert.equal(customers({ ...overrides, ...trafficRates }).traffic.visitorsToGoal, null);
  }
});

test("growth handles a complete loss and the maximum supported deadline rate", () => {
  const loss = growth({ growthPercent: "-100" }).timeline;
  assert.deepEqual(loss.outcome, { kind: "unreachable", reason: "shrinking" });
  assert.equal(loss.path[0].mrrCents, 100000n);
  assert.ok(loss.path.slice(1).every(point => point.mrrCents === 0n));
  const maximum = growth({ currentMrr: "1", goalAmount: "11", solveFor: "pace", deadlineMonths: "1" }).timeline;
  assert.equal(maximum.growthHundredths, 100000n);
  assert.equal(maximum.outcome.kind, "rateForDeadline");
  assert.equal(growth({ currentMrr: "1", goalAmount: "11.01", solveFor: "pace", deadlineMonths: "1" }).timeline.outcome.kind, "aboveMaxRate");
  const already = growth({ currentMrr: "12000", solveFor: "pace", deadlineMonths: "600" }).timeline;
  assert.equal(already.growthHundredths, 0n);
  assert.deepEqual(already.outcome, { kind: "rateForDeadline", deadlineMonths: 600, alreadyThere: true });
  assert.equal(already.path.length, 601);
  const atCap = growth({ currentMrr: "0.01", goalAmount: "3.91", growthPercent: "1" }).timeline;
  assert.deepEqual(atCap.outcome, { kind: "reached", month: 600 });
  assert.equal(atCap.path.length, 601);
  const displayedEarly = growth({ currentMrr: "1", goalAmount: "1.01", growthPercent: "0.50" }).timeline;
  assert.equal(displayedEarly.path[1].mrrCents, 101n);
  assert.deepEqual(displayedEarly.outcome, { kind: "reached", month: 2 });
});

// This oracle follows the recurrence directly instead of the engine's closed form.
function customerFraction(current, pace, churn, months) {
  let numerator = current;
  let denominator = 1n;
  for (let month = 0; month < months; month += 1) {
    numerator = numerator * (10000n - churn) + pace * 10000n * denominator;
    denominator *= 10000n;
  }
  return { numerator, denominator };
}

test("deadline customer paces meet the exact recurrence and one fewer does not", () => {
  for (const churnPercent of ["0", "0.01", "3", "99.99", "100"]) {
    const [whole, fraction = ""] = churnPercent.split(".");
    const churn = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
    for (const deadlineMonths of ["1", "12", "600"]) {
      for (const currentCustomers of ["0", "400"]) {
        const v = deadline({ churnPercent, deadlineMonths, currentCustomers });
        const pace = v.timeline.pace;
        const state = customerFraction(BigInt(currentCustomers), pace, churn, Number(deadlineMonths));
        assert.ok(state.numerator >= v.goal.customersNeeded * state.denominator);
        assert.equal(v.timeline.path[Number(deadlineMonths)].customers, state.numerator / state.denominator);
        if (pace > 0n) {
          const below = customerFraction(BigInt(currentCustomers), pace - 1n, churn, Number(deadlineMonths));
          assert.ok(below.numerator < v.goal.customersNeeded * below.denominator);
        }
      }
    }
  }
});

test("600-month growth solves stay exact at the goal and at the preceding rate", () => {
  for (const currentMrr of ["0.01", "1000", "9999.99"]) {
    const v = growth({ currentMrr, solveFor: "pace", deadlineMonths: "600" });
    const t = v.timeline;
    const target = v.goal.annualGoalCents * 10000n ** 600n;
    assert.equal(t.outcome.kind, "rateForDeadline");
    assert.equal(t.path.length, 601);
    assert.ok(12n * t.currentMrrCents * (10000n + t.growthHundredths) ** 600n >= target);
    assert.ok(12n * t.currentMrrCents * (9999n + t.growthHundredths) ** 600n < target);
    assert.ok(t.path.every(point => point.month <= 600 && point.mrrCents >= 0n));
  }
});
