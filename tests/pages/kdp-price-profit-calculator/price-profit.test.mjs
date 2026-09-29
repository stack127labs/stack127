import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateKdpPriceProfit,
  parseKdpPriceProfitMoneyCents,
  parseKdpPriceProfitWholeNumber,
} from "../../../lib/kdp/price-profit.ts";

function option(id, binding, overrides = {}) {
  return {
    id,
    binding,
    trimId: "6x9",
    interior: "black-white",
    paper: "white",
    pageCountText: "300",
    otherCostPerSaleText: "",
    oneTimeCostText: "",
    ...overrides,
  };
}

function input(overrides = {}) {
  return {
    listPriceText: "19.99",
    options: [option("paper", "paperback"), option("hardcover", "hardcover")],
    includeCosts: false,
    plannedCopiesText: "",
    ...overrides,
  };
}

function valuesFor(result) {
  assert.equal(result.status, "calculated");
  return result.values;
}

test("compares the known 300-page paperback and hardcover defaults", () => {
  const values = valuesFor(calculateKdpPriceProfit(input()));
  assert.equal(values.listPriceCents, 1_999);
  assert.equal(values.eligibleCount, 2);
  assert.equal(values.sharedRoyaltyRate, 60);
  assert.deepEqual(values.rows.map((row) => [row.printingCostCents, row.minimumPriceCents, row.royaltyCents, row.profitCents]), [
    [460, 920, 739, null],
    [925, 1_542, 274, null],
  ]);
});

test("keeps an ineligible hardcover row in the partial comparison without inventing a royalty", () => {
  const values = valuesFor(calculateKdpPriceProfit(input({ listPriceText: "14.99" })));
  assert.equal(values.eligibleCount, 1);
  assert.equal(values.rows[0].royaltyCents, 439);
  assert.equal(values.rows[1].minimumPriceCents, 1_542);
  assert.equal(values.rows[1].eligible, false);
  assert.equal(values.rows[1].royaltyCents, null);
  assert.equal(values.rows[1].profitCents, null);
});

test("applies the 50% to 60% print rate change at $9.99", () => {
  const at998 = valuesFor(calculateKdpPriceProfit(input({ listPriceText: "9.98" })));
  const at999 = valuesFor(calculateKdpPriceProfit(input({ listPriceText: "9.99" })));
  assert.equal(at998.rows[0].royaltyRate, 50);
  assert.equal(at998.rows[0].royaltyCents, 39);
  assert.equal(at999.rows[0].royaltyRate, 60);
  assert.equal(at999.rows[0].royaltyCents, 139);
  assert.equal(at999.rows.length, 2);
});

test("uses shared trim cost classes while keeping the same manuscript page count", () => {
  const values = valuesFor(calculateKdpPriceProfit(input({
    listPriceText: "14.99",
    options: [
      option("regular", "paperback"),
      option("large", "paperback", { trimId: "7x10" }),
    ],
  })));
  assert.deepEqual(values.rows.map((row) => [row.printingCostCents, row.minimumPriceCents, row.royaltyCents]), [
    [460, 920, 439],
    [610, 1_017, 289],
  ]);
});

test("rounds an odd entered page count up to KDP's effective even count", () => {
  const values = valuesFor(calculateKdpPriceProfit(input({
    options: [option("paper", "paperback", { pageCountText: "299" }), option("hardcover", "hardcover")],
  })));
  assert.equal(values.rows[0].enteredPageCount, 299);
  assert.equal(values.rows[0].effectivePageCount, 300);
  assert.equal(values.rows[0].printingCostCents, 460);
});

test("calculates per-edition profit from rounded per-sale royalty and explicit costs", () => {
  const options = ["paper", "hardcover"].map((id, index) => option(id, index === 0 ? "paperback" : "hardcover", {
    otherCostPerSaleText: "1.00",
    oneTimeCostText: "100.00",
  }));
  const values = valuesFor(calculateKdpPriceProfit(input({
    includeCosts: true,
    plannedCopiesText: "100",
    options,
  })));
  assert.deepEqual(values.rows.map((row) => [row.royaltyCents, row.otherCostPerSaleCents, row.oneTimeCostCents, row.profitCents]), [
    [739, 100, 10_000, 53_900],
    [274, 100, 10_000, 7_400],
  ]);
});

test("allows a negative projected profit and rejects blank enabled costs", () => {
  const negative = valuesFor(calculateKdpPriceProfit(input({
    includeCosts: true,
    plannedCopiesText: "1",
    options: [
      option("paper", "paperback", { otherCostPerSaleText: "1000", oneTimeCostText: "0" }),
      option("hardcover", "hardcover", { otherCostPerSaleText: "0", oneTimeCostText: "0" }),
    ],
  })));
  assert.equal(negative.rows[0].profitCents, -99_261);

  const missing = calculateKdpPriceProfit(input({
    includeCosts: true,
    plannedCopiesText: "100",
    options: [option("paper", "paperback", { otherCostPerSaleText: "0", oneTimeCostText: "" }), option("hardcover", "hardcover", { otherCostPerSaleText: "0", oneTimeCostText: "0" })],
  }));
  assert.equal(missing.status, "invalid");
  if (missing.status === "invalid") assert.match(missing.fieldErrors["option.paper.oneTimeCost"] ?? "", /one-time cost/);
});

test("strict parsers and setup validation reject malformed inputs", () => {
  assert.equal(parseKdpPriceProfitMoneyCents(" 19.99 "), 1_999);
  assert.equal(parseKdpPriceProfitMoneyCents("1.009"), null);
  assert.equal(parseKdpPriceProfitMoneyCents("$19.99"), null);
  assert.equal(parseKdpPriceProfitMoneyCents("1e2"), null);
  assert.equal(parseKdpPriceProfitWholeNumber("1,000"), null);
  assert.equal(parseKdpPriceProfitWholeNumber("301.5"), null);

  const malformed = calculateKdpPriceProfit(input({
    listPriceText: "19.999",
    options: [
      option("paper", "paperback", { pageCountText: "301.5" }),
      option("hardcover", "hardcover", { interior: "standard-color" }),
    ],
  }));
  assert.equal(malformed.status, "invalid");
  if (malformed.status === "invalid") {
    assert.match(malformed.fieldErrors.listPrice ?? "", /list price/);
    assert.match(malformed.fieldErrors["option.paper.pageCount"] ?? "", /printed pages/);
    assert.match(malformed.fieldErrors["option.hardcover.interiorPaper"] ?? "", /supported/);
  }

  const tooManyPages = calculateKdpPriceProfit(input({ options: [option("paper", "paperback", { pageCountText: "829" }), option("hardcover", "hardcover")] }));
  assert.equal(tooManyPages.status, "invalid");
  if (tooManyPages.status === "invalid") assert.ok(tooManyPages.fieldErrors["option.paper.pageCount"]);
});
