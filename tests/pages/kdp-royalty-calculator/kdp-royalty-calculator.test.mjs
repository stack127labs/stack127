import assert from "node:assert/strict";
import test from "node:test";
import { calculateKdpRoyaltyEstimate } from "../../../lib/kdp/royalty-calculator.ts";
import { calculateKdpMinimumListPrice } from "../../../lib/kdp/minimum-list-price.ts";
import { calculateKdpPriceProfit } from "../../../lib/kdp/price-profit.ts";
import {
  KDP_ROYALTY_VERSION,
  getKdpEbookDeliveryCents,
  getKdpEbookPricePoint,
  getKdpPrintFloorCents,
  parseKdpRoyaltyMoney,
} from "../../../lib/kdp/royalty.ts";
import { getKdpPageLimit, getKdpTrimOptions } from "../../../lib/kdp/specs.ts";

function input(overrides = {}) {
  return {
    format: "paperback", listPriceText: "12.99", pageCountText: "200", interior: "black-white",
    trimId: "", paper: "", channel: "", fileSizeText: "", plan: "", monthlyGoalText: "",
    ...overrides,
  };
}

function calculate(overrides = {}) {
  const result = calculateKdpRoyaltyEstimate(input(overrides));
  assert.equal(result.status, "calculated", JSON.stringify(result));
  return result.values;
}

const examples = [
  ["opening paperback", {}, 1_299, 60, 439, 680, 340],
  ["50% rate just below the step", { listPriceText: "9.98" }, 998, 50, 159, 680, 340],
  ["60% rate at the step", { listPriceText: "9.99" }, 999, 60, 259, 680, 340],
  ["price below the print minimum", { listPriceText: "5.99" }, 680, 50, 0, 680, 340],
  ["odd pages", { pageCountText: "201" }, 1_299, 60, 437, 685, 342],
  ["long book above the entered price", { pageCountText: "600" }, 1_367, 60, 0, 1_367, 820],
  ["large trim", { trimId: "8.5x11", pageCountText: "120", listPriceText: "7.99" }, 799, 50, 96, 608, 304],
  ["Expanded Distribution", { channel: "expanded" }, 1_299, 40, 180, 850, 340],
  ["price below Expanded Distribution break-even", { channel: "expanded", listPriceText: "7.99" }, 850, 40, 0, 850, 340],
  ["hardcover", { format: "hardcover", pageCountText: "300", listPriceText: "24.99" }, 2_499, 60, 574, 1_542, 925],
  ["eBook at 70% with default size", { format: "ebook", listPriceText: "4.99" }, 499, 70, 328, 99, 30],
  ["eBook at 70% with 5 MB", { format: "ebook", listPriceText: "4.99", fileSizeText: "5" }, 499, 70, 297, 199, 75],
  ["top of the 70% band", { format: "ebook", listPriceText: "12.99" }, 1_299, 70, 888, 99, 30],
  ["one cent above the 70% band", { format: "ebook", listPriceText: "13.00" }, 1_300, 35, 455, 99, 0],
  ["above the 70% band", { format: "ebook", listPriceText: "13.99" }, 1_399, 35, 490, 99, 0],
  ["eBook minimum by size", { format: "ebook", listPriceText: "0.99", fileSizeText: "5" }, 199, 35, 70, 199, 0],
  ["delivery above the share", { format: "ebook", listPriceText: "2.99", fileSizeText: "30" }, 299, 70, 0, 299, 299],
];

for (const [name, overrides, price, rate, royalty, minimum, cost] of examples) {
  test(name, () => {
    const values = calculate(overrides);
    assert.equal(values.priceCents, price);
    assert.equal(values.rate, rate);
    assert.equal(values.royaltyCents, royalty);
    assert.equal(values.minimumPriceCents, minimum);
    assert.equal(values.split.costCents, cost);
    assert.equal(values.split.royaltyCents + values.split.costCents + values.split.amazonCents, price);
    assert.equal(values.rulesVersion, KDP_ROYALTY_VERSION);
    assert.deepEqual(values.curve.mark, { priceCents: price, royaltyCents: royalty });
  });
}

// Observed on https://kdp.amazon.com/en_US/royalty-calculator on 2026-10-11.
const officialPrintCases = [
  ["paperback", "black-white", "202", "12.98", 342, 685, 436],
  ["paperback", "black-white", "202", "12.99", 342, 685, 437],
  ["paperback", "standard-color", "110", "12.98", 381, 761, 398],
  ["paperback", "standard-color", "110", "12.99", 381, 761, 399],
  ["paperback", "standard-color", "130", "12.99", 432, 863, 348],
  ["paperback", "standard-color", "102", "12.98", 360, 720, 419],
  ["paperback", "standard-color", "200", "12.98", 610, 1_017, 169],
  ["paperback", "black-white", "332", "9.97", 498, 997, 0],
  ["hardcover", "black-white", "100", "12.98", 680, 1_133, 99],
  ["hardcover", "black-white", "202", "24.98", 807, 1_346, 691],
];

for (const [format, interior, pageCountText, listPriceText, cost, minimum, royalty] of officialPrintCases) {
  test(`matches KDP for ${format}, ${interior}, ${pageCountText} pages at $${listPriceText}`, () => {
    const values = calculate({ format, interior, pageCountText, listPriceText });
    assert.equal(values.printing.costCents, cost);
    assert.equal(values.minimumPriceCents, minimum);
    assert.equal(values.royaltyCents, royalty);
    assert.deepEqual(values.curve.series[0].points.find(([price]) => price === values.priceCents), [values.priceCents, royalty]);
    const minimumResult = calculateKdpMinimumListPrice({
      format, interior, pageCountText, trimId: "6x9", paper: "white",
      ebookRoyaltyOption: 70, ebookFileSizeText: "", desiredRoyaltyText: "",
    });
    assert.equal(minimumResult.status, "available");
    assert.equal(minimumResult.values.minimumPriceCents, minimum);
    assert.equal(minimumResult.values.deductionCents, cost);
    assert.ok(Number.isInteger(minimumResult.values.royaltyCents));
    assert.ok(minimumResult.values.royaltyCents >= 0);
  });
}

test("print profit and target-price calculations use the same unrounded printing cost", () => {
  const result = calculateKdpPriceProfit({
    listPriceText: "12.98", includeCosts: true, plannedCopiesText: "100",
    options: [
      { id: "black", binding: "paperback", trimId: "6x9", interior: "black-white", paper: "white", pageCountText: "202", otherCostPerSaleText: "1", oneTimeCostText: "100" },
      { id: "color", binding: "paperback", trimId: "6x9", interior: "standard-color", paper: "white", pageCountText: "110", otherCostPerSaleText: "1", oneTimeCostText: "100" },
    ],
  });
  assert.equal(result.status, "calculated");
  assert.deepEqual(result.values.rows.map((row) => [row.printingCostCents, row.minimumPriceCents, row.royaltyCents, row.profitCents]), [
    [342, 685, 436, 23_600], [381, 761, 398, 19_800],
  ]);
  const target = calculateKdpMinimumListPrice({
    format: "paperback", interior: "black-white", pageCountText: "202", trimId: "6x9", paper: "white",
    ebookRoyaltyOption: 70, ebookFileSizeText: "", desiredRoyaltyText: "4.37",
  });
  assert.equal(target.status, "available");
  assert.equal(target.values.priceCents, 1_299);
  assert.equal(target.values.royaltyCents, 437);
});

test("opening answer includes its printing breakdown and share", () => {
  const values = calculate();
  assert.deepEqual(values.printing, { enteredPages: 200, printedPages: 200, costCents: 340, fixedCents: 100, pageCents: 240 });
  assert.deepEqual(values.split, { royaltyCents: 439, costCents: 340, amazonCents: 520 });
  assert.equal(values.shareBasisPoints, 3_380);
  assert.equal(values.limit, null);
  assert.equal(values.comparison, null);
  assert.equal(values.channel, "amazon");
  assert.equal(values.plan, null);
  assert.equal(values.costKind, "printing");
  assert.equal(values.delivery, null);
  assert.equal(calculate({ pageCountText: "201" }).printing.printedPages, 202);
});

test("price limits answer at the boundary and preserve the entered price", () => {
  for (const [overrides, entered, answered, kind] of [
    [{ listPriceText: "5.99" }, 599, 680, "below-minimum"],
    [{ channel: "expanded", listPriceText: "7.99" }, 799, 850, "below-break-even"],
    [{ listPriceText: "300" }, 30_000, 25_000, "above-maximum"],
    [{ format: "hardcover", pageCountText: "300", listPriceText: "300" }, 30_000, 25_000, "above-maximum"],
    [{ format: "ebook", listPriceText: "250" }, 25_000, 20_000, "above-maximum"],
    [{ format: "ebook", listPriceText: "0.01" }, 1, 99, "below-minimum"],
  ]) {
    const values = calculate(overrides);
    assert.equal(values.enteredPriceCents, entered);
    assert.equal(values.priceCents, answered);
    assert.deepEqual(values.limit, { kind, priceCents: answered });
  }
  assert.equal(calculate({ listPriceText: "250" }).limit, null);
  assert.equal(calculate({ format: "ebook", listPriceText: "200" }).limit, null);
  assert.equal(calculate({ listPriceText: "999999999" }).priceCents, 25_000);
  assert.equal(getKdpPrintFloorCents(499), 998);
  assert.equal(getKdpPrintFloorCents(500), 999);
});

test("comparisons use the answered price and the specified priority", () => {
  for (const [overrides, expected] of [
    [{ listPriceText: "9.98" }, { kind: "rate-step", priceCents: 999, rate: 60, royaltyCents: 259 }],
    [{ channel: "expanded" }, { kind: "other-channel", priceCents: 1_299, rate: 60, royaltyCents: 439 }],
    [{ channel: "expanded", listPriceText: "7.99" }, { kind: "other-channel", priceCents: 850, rate: 50, royaltyCents: 85 }],
    [{ format: "ebook", listPriceText: "4.99" }, { kind: "other-plan", priceCents: 499, rate: 35, royaltyCents: 175 }],
    [{ format: "ebook", listPriceText: "4.99", plan: "35" }, { kind: "other-plan", priceCents: 499, rate: 70, royaltyCents: 328 }],
    [{ format: "ebook", listPriceText: "13.99" }, { kind: "seventy-band", priceCents: 1_299, rate: 70, royaltyCents: 888 }],
    [{ format: "ebook", listPriceText: "1.99" }, { kind: "seventy-band", priceCents: 299, rate: 70, royaltyCents: 188 }],
    [{ format: "ebook", listPriceText: "13.99", plan: "35" }, { kind: "seventy-band", priceCents: 1_299, rate: 70, royaltyCents: 888 }],
    [{ format: "ebook", listPriceText: "2.99", fileSizeText: "30" }, { kind: "other-plan", priceCents: 299, rate: 35, royaltyCents: 105 }],
  ]) assert.deepEqual(calculate(overrides).comparison, expected);
  assert.equal(calculate({ format: "ebook", listPriceText: "1.99" }).seventyOutsideBand, "below");
  assert.equal(calculate({ format: "ebook", listPriceText: "13" }).seventyOutsideBand, "above");
  assert.equal(calculate({ format: "ebook", listPriceText: "13", plan: "35" }).seventyOutsideBand, null);
});

test("delivery retains the supplied cost at 35% and reports the default size", () => {
  const defaultSize = calculate({ format: "ebook", listPriceText: "4.99" });
  assert.deepEqual(defaultSize.delivery, { fileSizeMB: 2, defaultSize: true, costCents: 30 });
  assert.equal(defaultSize.channel, null);
  assert.equal(defaultSize.plan, 70);
  for (const overrides of [{ plan: "35" }, { listPriceText: "13" }]) {
    const values = calculate({ format: "ebook", listPriceText: "4.99", fileSizeText: "5", ...overrides });
    assert.deepEqual(values.delivery, { fileSizeMB: 5, defaultSize: false, costCents: 75 });
    assert.equal(values.split.costCents, 0);
    assert.equal(values.costKind, null);
  }
  for (const [size, minimum] of [["2.999", 99], ["3", 199], ["9.999", 199], ["10", 299], ["650", 299]]) {
    assert.equal(calculate({ format: "ebook", fileSizeText: size }).minimumPriceCents, minimum);
  }
  assert.equal(calculate({ format: "ebook", fileSizeText: "0.001", listPriceText: "4.99" }).delivery.costCents, 1);
  assert.equal(calculate({ format: "ebook", fileSizeText: "1.0001", listPriceText: "4.99" }).delivery.costCents, 15);
  for (const [price, size, exceeds] of [["2.99", "30", true], ["3", "20", true], ["3.01", "20", false]]) {
    const values = calculate({ format: "ebook", listPriceText: price, fileSizeText: size });
    assert.equal(values.deliveryExceedsShare, exceeds);
    assert.ok(values.split.amazonCents >= 0);
    assert.ok(values.royaltyCents >= 0);
  }
});

test("eBook delivery rounds an exact half cent up before calculating royalties and minimum prices", () => {
  assert.equal(getKdpEbookDeliveryCents(1.5), 23);
  assert.equal(getKdpEbookDeliveryCents(1_535 / 1_024), 22);
  assert.equal(getKdpEbookDeliveryCents(1_537 / 1_024), 23);
  const values = calculate({ format: "ebook", listPriceText: "12.99", fileSizeText: "1.5" });
  assert.equal(values.delivery.costCents, 23);
  assert.equal(values.royaltyCents, 893);
  assert.deepEqual(values.curve.series[0].points.at(-1), [1_299, 893]);
  const minimum = calculateKdpMinimumListPrice({
    format: "ebook", trimId: "6x9", interior: "black-white", paper: "white", pageCountText: "200",
    ebookRoyaltyOption: 70, ebookFileSizeText: "1.5", desiredRoyaltyText: "2.00",
  });
  assert.equal(minimum.status, "available");
  assert.equal(minimum.values.deductionCents, 23);
  assert.equal(minimum.values.priceCents, 308);
  assert.equal(minimum.values.royaltyCents, 200);
  assert.equal(getKdpEbookPricePoint(307, 70, 1.5).royaltyCents, 199);
});

test("money parsing accepts cents without rounding excess decimals", () => {
  for (const [text, cents] of [["12", 1_200], ["12.5", 1_250], [" $12.99 ", 1_299], ["0.29", 29]]) {
    assert.equal(calculate({ listPriceText: text }).enteredPriceCents, cents);
  }
  for (const text of ["abc", "0", "12.999", "", "$", "$$12.99", "12.99$", "$ 12.99", "1,000", "1e2", "Infinity", "-1", "NaN", "9".repeat(400)]) {
    const result = calculateKdpRoyaltyEstimate(input({ listPriceText: text }));
    assert.equal(result.status, "invalid", text);
    assert.ok(result.fieldErrors.listPrice, text);
  }
  assert.equal(parseKdpRoyaltyMoney(" $12.99 "), 12.99);
  assert.ok(Number.isNaN(parseKdpRoyaltyMoney("12.999")));
});

test("monthly goals never block an otherwise valid royalty", () => {
  assert.deepEqual(calculate({ monthlyGoalText: "$1000" }).goal, { goalCents: 100_000, copies: 228 });
  assert.deepEqual(calculate({ listPriceText: "5.99", monthlyGoalText: "1000" }).goal, { goalCents: 100_000, copies: null });
  assert.equal(calculate().goal, null);
  assert.equal(calculate({ monthlyGoalText: "10000000" }).goal.goalCents, 1_000_000_000);
  for (const text of ["-5", "0", "abc", "1.999", "10000000.01"]) {
    const result = calculateKdpRoyaltyEstimate(input({ monthlyGoalText: text }));
    assert.equal(result.status, "calculated");
    assert.equal(result.values.royaltyCents, 439);
    assert.equal(result.values.goal, null);
    assert.deepEqual(Object.keys(result.fieldErrors), ["monthlyGoal"]);
  }
});

test("invalid choices and fields report their own errors", () => {
  for (const [overrides, field] of [
    [{ format: "audio" }, "format"],
    [{ interior: "" }, "interior"],
    [{ format: "hardcover", interior: "standard-color" }, "interior"],
    [{ trimId: "8.25x11" }, "trimId"],
    [{ format: "hardcover", trimId: "5x8" }, "trimId"],
    [{ trimId: "unknown" }, "trimId"],
    [{ paper: "unknown" }, "paper"],
    [{ format: "hardcover", paper: "groundwood" }, "paper"],
    [{ interior: "premium-color", paper: "cream" }, "paper"],
    [{ interior: "standard-color", trimId: "8.27x11.69" }, "interior"],
    [{ channel: "unknown" }, "channel"],
    [{ format: "ebook", plan: "60" }, "plan"],
    ...["0", "-1", "650.01", "abc", "Infinity"].map((fileSizeText) => [{ format: "ebook", fileSizeText }, "fileSize"]),
    ...["", "0", "-1", "200.5", "1e2", "abc"].map((pageCountText) => [{ pageCountText }, "pageCount"]),
  ]) {
    const result = calculateKdpRoyaltyEstimate(input(overrides));
    assert.equal(result.status, "invalid", JSON.stringify(overrides));
    assert.ok(result.fieldErrors[field], JSON.stringify(overrides));
  }
  assert.equal(calculate({ format: "hardcover", channel: "unknown" }).channel, "amazon");
  assert.equal(calculate({ format: "paperback", fileSizeText: "invalid", plan: "invalid" }).royaltyCents, 439);
  assert.equal(calculate({ format: "ebook", listPriceText: "4.99", pageCountText: "invalid", interior: "invalid", trimId: "invalid", paper: "invalid", channel: "invalid" }).royaltyCents, 328);
});

test("page limits use printed pages and name the KDP range", () => {
  for (const [overrides, range] of [
    [{ pageCountText: "829" }, /24 to 828/],
    [{ format: "hardcover", pageCountText: "60" }, /75 to 550/],
    [{ interior: "standard-color", pageCountText: "70" }, /72 to 600/],
    [{ paper: "cream", pageCountText: "777" }, /24 to 776/],
    [{ paper: "groundwood", pageCountText: "813" }, /24 to 812/],
  ]) {
    const result = calculateKdpRoyaltyEstimate(input(overrides));
    assert.equal(result.status, "invalid");
    assert.match(result.fieldErrors.pageCount, /KDP/);
    assert.match(result.fieldErrors.pageCount, range);
  }
  assert.equal(calculate({ pageCountText: "23" }).printing.printedPages, 24);
  assert.equal(calculate({ pageCountText: "828" }).printing.printedPages, 828);
  assert.equal(calculate({ format: "hardcover", pageCountText: "75", interior: "premium-color", listPriceText: "24.99" }).printing.costCents, 1_059);
});

test("short print runs keep the shared fixed-cost boundaries", () => {
  for (const [overrides, cost] of [
    [{ pageCountText: "109" }, 230],
    [{ pageCountText: "111" }, 234],
    [{ paper: "groundwood", pageCountText: "112" }, 223],
    [{ paper: "groundwood", pageCountText: "113" }, 230],
    [{ interior: "premium-color", pageCountText: "40" }, 360],
    [{ interior: "premium-color", pageCountText: "41" }, 373],
    [{ format: "hardcover", pageCountText: "108", listPriceText: "24.99" }, 680],
    [{ format: "hardcover", pageCountText: "109", listPriceText: "24.99" }, 697],
    [{ trimId: "8.5x11", interior: "standard-color", pageCountText: "300", listPriceText: "24.99" }, 1_306],
  ]) assert.equal(calculate(overrides).printing.costCents, cost);
  // Other tools retain their signed estimate instead of this calculator's zero floor.
  assert.equal(getKdpEbookPricePoint(299, 70, 650).royaltyCents, -6_616);
});

test("curves include limits, selected price, and the rule boundaries", () => {
  const opening = calculate();
  assert.equal(opening.curve.series[0].points.at(-1)[0], 1_999);
  assert.equal(opening.curve.series[0].points[0][0], 680);
  assert.deepEqual(opening.curve.series[0].points.find(([price]) => price === 998), [998, 159]);
  assert.deepEqual(opening.curve.series[0].points.find(([price]) => price === 999), [999, 259]);
  const expanded = calculate({ channel: "expanded" });
  assert.deepEqual(expanded.curve.series.map((series) => series.id), ["expanded", "amazon"]);
  assert.deepEqual(expanded.curve.series[0].points[0], [850, 0]);
  assert.deepEqual(expanded.curve.series[1].points[0], [680, 0]);
  const ebook = calculate({ format: "ebook", listPriceText: "4.99" });
  assert.deepEqual(ebook.curve.series.map((series) => series.id), ["plan70", "plan35"]);
  assert.deepEqual(ebook.curve.series[0].points.at(-1), [1_299, 888]);
  assert.deepEqual(ebook.curve.series[1].points.find(([price]) => price === 1_300), [1_300, 455]);
  assert.ok(ebook.curve.series[1].points.some(([price]) => price === 298));
  assert.equal(ebook.curve.series[1].points.at(-1)[0], 1_599);
  assert.deepEqual(calculate({ format: "ebook", plan: "35" }).curve.series.map((series) => series.id), ["plan35", "plan70"]);
  assert.equal(calculate({ listPriceText: "250" }).curve.series[0].points.at(-1)[0], 25_000);
  assert.equal(calculate({ format: "ebook", listPriceText: "200" }).curve.series[0].points.at(-1)[0], 1_299);
  assert.equal(calculate({ format: "ebook", listPriceText: "200" }).curve.series[1].points.at(-1)[0], 20_000);
});

test("curve points agree with direct answers and serialize without missing or nonfinite values", () => {
  for (const overrides of [{}, { channel: "expanded" }, { format: "hardcover" }, { format: "ebook" }, { format: "ebook", plan: "35" }, { format: "ebook", fileSizeText: "650", listPriceText: "2.99" }]) {
    const values = calculate(overrides);
    assert.deepEqual(JSON.parse(JSON.stringify(values)), values);
    for (const series of values.curve.series) {
      assert.ok(series.points.length >= 2);
      const prices = series.points.map(([price]) => price);
      assert.deepEqual(prices, [...new Set(prices)].sort((a, b) => a - b));
      for (const [price, royalty] of series.points) {
        assert.ok(Number.isSafeInteger(price) && Number.isSafeInteger(royalty) && royalty >= 0);
        const selection = series.id.startsWith("plan") ? { plan: series.id.slice(4) } : { channel: series.id };
        const direct = calculate({ ...overrides, ...selection, listPriceText: (price / 100).toFixed(2) });
        assert.equal(direct.royaltyCents, royalty);
      }
    }
  }
});

test("every supported print setup stays calculable at its page limits", () => {
  for (const format of ["paperback", "hardcover"]) {
    for (const trim of getKdpTrimOptions(format)) {
      for (const interior of ["black-white", "standard-color", "premium-color"]) {
        for (const paper of ["white", "cream", "groundwood"]) {
          const limit = getKdpPageLimit(trim.id, format, interior, paper);
          if (!limit) continue;
          for (const pageCount of [limit.min, limit.max]) {
            const values = calculate({ format, trimId: trim.id, interior, paper, pageCountText: String(pageCount), listPriceText: "0.01" });
            assert.ok(values.minimumPriceCents <= values.maximumPriceCents);
            assert.ok(values.split.amazonCents >= 0 && values.royaltyCents >= 0);
            assert.equal(values.split.royaltyCents + values.split.costCents + values.split.amazonCents, values.priceCents);
          }
        }
      }
    }
  }
});
