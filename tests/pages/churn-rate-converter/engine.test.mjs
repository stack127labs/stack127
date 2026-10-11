import assert from "node:assert/strict";
import test from "node:test";
import { CHURN_PERIODS, CHURN_PERIOD_MONTHS, convertChurnRate } from "../../../lib/churn-rate-converter/engine.ts";

function values(rate, period) {
  const result = convertChurnRate({ rate, period });
  assert.equal(result.status, "valid", JSON.stringify(result.errors));
  assert.deepEqual(result.errors, {});
  return result.values;
}

function percent(hundredths, roundedToZero = false, nearlyAll = false) {
  return { hundredths, roundedToZero, nearlyAll };
}

function linear(hundredths, overHundred = false, roundedToZero = false) {
  return { hundredths, overHundred, roundedToZero };
}

function row(period, isSource, churn, retention, linearEstimate) {
  return { period, isSource, churn, retention, linearEstimate };
}

function cohort(lost, remaining, lostUnderOne = false, remainingUnderOne = false) {
  return { lost, remaining, lostUnderOne, remainingUnderOne };
}

function expectConversion(rate, period, h, rows, yearOf100, tenths) {
  assert.deepEqual(values(rate, period), {
    source: { hundredths: h, period },
    rows,
    leadPeriod: period === "year" ? "month" : "year",
    yearOf100,
    lifetime: tenths === null
      ? { kind: "notEstimable", reason: "zeroChurn" }
      : { kind: "finite", tenths, period },
  });
}

// These fixtures use the spec's independently calculated examples, not engine-generated values.
test("5% monthly compounds to 45.96% annual churn", () => {
  expectConversion("5", "month", 500, [
    row("month", true, percent(500), percent(9500), null),
    row("quarter", false, percent(1426), percent(8574), linear(1500)),
    row("year", false, percent(4596), percent(5404), linear(6000)),
  ], cohort(46, 54), 200);
});

test("5% quarterly converts in both directions", () => {
  expectConversion("5", "quarter", 500, [
    row("month", false, percent(170), percent(9830), linear(167)),
    row("quarter", true, percent(500), percent(9500), null),
    row("year", false, percent(1855), percent(8145), linear(2000)),
  ], cohort(19, 81), 200);
});

test("20% annual uses the monthly lead result", () => {
  expectConversion("20", "year", 2000, [
    row("month", false, percent(184), percent(9816), linear(167)),
    row("quarter", false, percent(543), percent(9457), linear(500)),
    row("year", true, percent(2000), percent(8000), null),
  ], cohort(20, 80), 50);
});

test("3.5% monthly rounds churn and lifetime once", () => {
  expectConversion("3.5", "month", 350, [
    row("month", true, percent(350), percent(9650), null),
    row("quarter", false, percent(1014), percent(8986), linear(1050)),
    row("year", false, percent(3479), percent(6521), linear(4200)),
  ], cohort(35, 65), 286);
});

test("10% monthly preserves a linear estimate above 100%", () => {
  expectConversion("10", "month", 1000, [
    row("month", true, percent(1000), percent(9000), null),
    row("quarter", false, percent(2710), percent(7290), linear(3000)),
    row("year", false, percent(7176), percent(2824), linear(12000, true)),
  ], cohort(72, 28), 100);
});

test("45.96% annual rounds back to 5% monthly", () => {
  expectConversion("45.96", "year", 4596, [
    row("month", false, percent(500), percent(9500), linear(383)),
    row("quarter", false, percent(1426), percent(8574), linear(1149)),
    row("year", true, percent(4596), percent(5404), null),
  ], cohort(46, 54), 22);
});

test("zero monthly churn has no boundary flags and no estimable lifetime", () => {
  expectConversion("0", "month", 0, [
    row("month", true, percent(0), percent(10000), null),
    row("quarter", false, percent(0), percent(10000), linear(0)),
    row("year", false, percent(0), percent(10000), linear(0)),
  ], cohort(0, 100), null);
});

test("complete quarterly churn keeps lifetime in quarters", () => {
  expectConversion("100", "quarter", 10000, [
    row("month", false, percent(10000), percent(0), linear(3333)),
    row("quarter", true, percent(10000), percent(0), null),
    row("year", false, percent(10000), percent(0), linear(40000, true)),
  ], cohort(100, 0), 10);
});

test("0.01% annual flags positive rates and linear estimates rounded to zero", () => {
  expectConversion("0.01", "year", 1, [
    row("month", false, percent(0, true), percent(10000, false, true), linear(0, false, true)),
    row("quarter", false, percent(0, true), percent(10000, false, true), linear(0, false, true)),
    row("year", true, percent(1), percent(9999), null),
  ], cohort(0, 100, true), 100000);
});

test("0.01% monthly compounds a tiny rate without losing precision", () => {
  expectConversion("0.01", "month", 1, [
    row("month", true, percent(1), percent(9999), null),
    row("quarter", false, percent(3), percent(9997), linear(3)),
    row("year", false, percent(12), percent(9988), linear(12)),
  ], cohort(0, 100, true), 100000);
});

test("99.99% monthly distinguishes near-total churn from complete loss", () => {
  expectConversion("99.99", "month", 9999, [
    row("month", true, percent(9999), percent(1), null),
    row("quarter", false, percent(10000, false, true), percent(0, true), linear(29997, true)),
    row("year", false, percent(10000, false, true), percent(0, true), linear(119988, true)),
  ], cohort(100, 0, false, true), 10);
});

test("0.5% annual rounds the exact half-customer tie up", () => {
  expectConversion("0.5", "year", 50, [
    row("month", false, percent(4), percent(9996), linear(4)),
    row("quarter", false, percent(13), percent(9987), linear(13)),
    row("year", true, percent(50), percent(9950), null),
  ], cohort(1, 99), 2000);
});

test("0.02% annual rounds the quarterly linear half-step up", () => {
  expectConversion("0.02", "year", 2, [
    row("month", false, percent(0, true), percent(10000, false, true), linear(0, false, true)),
    row("quarter", false, percent(1), percent(9999), linear(1)),
    row("year", true, percent(2), percent(9998), null),
  ], cohort(0, 100, true), 50000);
});

test("0.06% annual rounds the monthly linear half-step up", () => {
  expectConversion("0.06", "year", 6, [
    row("month", false, percent(1), percent(9999), linear(1)),
    row("quarter", false, percent(2), percent(9998), linear(2)),
    row("year", true, percent(6), percent(9994), null),
  ], cohort(0, 100, true), 16667);
});

test("66.35% quarterly stays below the root rounding tie", () => {
  expectConversion("66.35", "quarter", 6635, [
    row("month", false, percent(3044), percent(6956), linear(2212)),
    row("quarter", true, percent(6635), percent(3365), null),
    row("year", false, percent(9872), percent(128), linear(26540, true)),
  ], cohort(99, 1), 15);
});

test("0.64% monthly rounds the exact lifetime tie up to 156.3 months", () => {
  expectConversion("0.64", "month", 64, [
    row("month", true, percent(64), percent(9936), null),
    row("quarter", false, percent(191), percent(9809), linear(192)),
    row("year", false, percent(742), percent(9258), linear(768)),
  ], cohort(7, 93), 1563);
});

test("cohort counts use exact annual churn before rounding the displayed rate", () => {
  // Exact loss is below 99.5 customers, though the annual display rounds to 99.50%.
  const result = values("73.4", "quarter");
  assert.equal(result.rows[2].churn.hundredths, 9950);
  assert.deepEqual(result.yearOf100, cohort(99, 1));
});

test("accepts trimmed percent suffixes, leading zeroes, and endpoint spellings", () => {
  for (const rate of [" 5% ", "5 %", "05", "005.00", "\t5\n"]) {
    assert.equal(values(rate, "month").source.hundredths, 500);
  }
  for (const rate of ["0", "0.00", "000.00%", "100", "100.00", "0100%"]) {
    assert.equal(convertChurnRate({ rate, period: "year" }).status, "valid");
  }
  assert.deepEqual(convertChurnRate({ rate: "5", period: " quarter " }).values, values("5", "quarter"));
  assert.equal(convertChurnRate(Object.assign(Object.create(null), { rate: "5", period: "month" })).status, "valid");
});

const messages = {
  missing: "Enter a churn rate from 0 to 100%.",
  format: "Use digits only, like 5 or 4.25.",
  tooPrecise: "Use up to two decimals.",
  belowZero: "Customer churn can't be below 0%. A negative rate is net revenue churn, which this tool doesn't convert.",
  aboveHundred: "Churn can't be above 100%. You can't lose more customers than you started with.",
};
const periodError = { code: "unknownPeriod", message: "Choose monthly, quarterly, or annual." };

test("rejects invalid rates with the contracted validation precedence", () => {
  const inputs = {
    missing: ["", "  ", "%", " % ", undefined, null, 5, NaN, Infinity, {}, [], true, Symbol("rate"), 5n],
    format: ["5,5", "1e2", ".5", "5.", "+5", "five", "5%%", "1 0", "1\t0", "1\n0", "١", "100.001%%", "5% %"],
    tooPrecise: ["4.567", "100.001", "0.000", "4.567%", "9999999999999.000"],
    belowZero: ["-1", "-0", "-0.00", "-4.567", "-101", "-1%", "-five"],
    aboveHundred: ["100.01", "101", "9999999999999", "9".repeat(1000), "101%"],
  };
  for (const [code, rates] of Object.entries(inputs)) {
    for (const rate of rates) {
      assert.deepEqual(convertChurnRate({ rate, period: "month" }), {
        status: "invalid", values: null, errors: { rate: { code, message: messages[code] } },
      }, `${code} for ${String(rate)}`);
    }
  }
});

test("validates both fields and never silently defaults an invalid period", () => {
  for (const period of ["Monthly", "MONTH", "12", "", " ", undefined, null, 12, {}, [], Symbol("period")]) {
    assert.deepEqual(convertChurnRate({ rate: "5", period }), {
      status: "invalid", values: null, errors: { period: periodError },
    });
    assert.deepEqual(convertChurnRate({ rate: "-1", period }), {
      status: "invalid", values: null, errors: { rate: { code: "belowZero", message: messages.belowZero }, period: periodError },
    });
  }
});

test("non-plain and unreadable objects return both errors without throwing", () => {
  const array = Object.assign([], { rate: "5", period: "month" });
  class Input { rate = "5"; period = "month"; }
  const revoked = Proxy.revocable({}, {});
  revoked.revoke();
  const throwing = { get rate() { throw new Error("Unreadable input"); }, period: "month" };
  for (const raw of [null, undefined, [], array, new Date(), new Input(), Object.create({ rate: "5", period: "month" }),
    "5", 5, true, 5n, Symbol("raw"), () => {}, throwing, revoked.proxy]) {
    assert.deepEqual(convertChurnRate(raw), {
      status: "invalid", values: null, errors: { rate: { code: "missing", message: messages.missing }, period: periodError },
    });
  }
});

test("all representable rates preserve complements, ordering, flags, endpoints, and source identity", () => {
  assert.deepEqual(CHURN_PERIODS, ["month", "quarter", "year"]);
  assert.deepEqual(CHURN_PERIOD_MONTHS, { month: 1, quarter: 3, year: 12 });
  for (const period of CHURN_PERIODS) {
    for (let h = 0; h <= 10000; h += 1) {
      const rate = `${Math.floor(h / 100)}.${String(h % 100).padStart(2, "0")}`;
      const result = values(rate, period);
      assert.deepEqual(result.rows.map(row => row.period), ["month", "quarter", "year"]);
      assert.equal(result.rows.filter(row => row.isSource).length, 1);
      assert.equal(result.rows.find(row => row.isSource).churn.hundredths, h);
      assert.equal(result.rows.find(row => row.isSource).linearEstimate, null);
      for (const row of result.rows) {
        assert.equal(row.churn.hundredths + row.retention.hundredths, 10000);
        assert.ok(Number.isInteger(row.churn.hundredths) && row.churn.hundredths >= 0 && row.churn.hundredths <= 10000);
        assert.equal(row.retention.roundedToZero, row.churn.nearlyAll);
        assert.equal(row.retention.nearlyAll, row.churn.roundedToZero);
        if (h === 0 || h === 10000) {
          assert.deepEqual(row.churn, percent(h));
          assert.deepEqual(row.retention, percent(10000 - h));
        }
      }
      assert.ok(result.rows[0].churn.hundredths <= result.rows[1].churn.hundredths);
      assert.ok(result.rows[1].churn.hundredths <= result.rows[2].churn.hundredths);
      assert.equal(result.yearOf100.lost + result.yearOf100.remaining, 100);
      if (h === 0) assert.deepEqual(result.lifetime, { kind: "notEstimable", reason: "zeroChurn" });
      else assert.ok(Number.isInteger(result.lifetime.tenths) && result.lifetime.tenths >= 10 && result.lifetime.tenths <= 100000);
    }
  }
});
