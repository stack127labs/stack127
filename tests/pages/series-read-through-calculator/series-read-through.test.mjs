import assert from "node:assert/strict";
import test from "node:test";
import { calculateSeriesReadThrough } from "../../../lib/kdp/series-read-through.ts";

function book(priceText, salesText, kuPagesText = "", kenpcText = "") {
  return { priceText, salesText, kuPagesText, kenpcText };
}

const openingBooks = [book("4.99", "100"), book("4.99", "55"), book("4.99", "44")];

function input(overrides = {}) {
  return {
    books: openingBooks, fileSizeText: "", kenpRateText: "", kenpMonthText: "",
    adCostText: "", adCostUnit: "", conversionText: "", profitTargetText: "",
    dealPriceText: "", dealKind: "", dealReadThroughText: "",
    ...overrides,
  };
}

function calculate(overrides = {}) {
  const result = calculateSeriesReadThrough(input(overrides));
  assert.equal(result.status, "calculated", JSON.stringify(result));
  return result;
}

function invalidFields(overrides) {
  const result = calculateSeriesReadThrough(input(overrides));
  assert.equal(result.status, "invalid", JSON.stringify(result));
  return Object.keys(result.fieldErrors);
}

test("opening example", () => {
  const { values, fieldErrors } = calculate();
  assert.deepEqual(fieldErrors, {});
  assert.equal(values.deliveryCents, 30);
  assert.equal(values.defaultFileSize, true);
  assert.deepEqual(values.books.map((b) => b.royaltyCents), [328, 328, 328]);
  assert.deepEqual(values.books.map((b) => b.rate), [70, 70, 70]);
  assert.deepEqual(values.books.map((b) => b.stepBasisPoints), [null, 5_500, 8_000]);
  assert.deepEqual(values.books.map((b) => b.reachBasisPoints), [10_000, 5_500, 4_400]);
  assert.equal(values.readerValueCents, 653);
  assert.deepEqual(values.books.map((b) => b.contributionCents), [328, 181, 144]);
  assert.equal(values.highestAcosTenths, 1_308);
  assert.equal(values.tenPointsCents, 59);
  assert.deepEqual(values.books.map((b) => b.worthFromHereCents), [653, 590, 328]);
  assert.equal(values.kenp, null);
  assert.equal(values.deal, null);
  assert.equal(values.ads.mostToPayCents, 652);
  assert.equal(values.ads.cost, null);
});

test("royalty limits and file size", () => {
  const cheap = calculate({ books: [book("0.99", "100"), book("4.99", "55"), book("4.99", "44")] }).values;
  assert.equal(cheap.books[0].rate, 35);
  assert.equal(cheap.books[0].royaltyCents, 35);
  assert.equal(cheap.readerValueCents, 360);
  assert.equal(cheap.highestAcosTenths, 3_633);

  const outside = calculate({ books: [book("13.00", "100"), book("4.99", "55")] }).values.books[0];
  assert.equal(outside.rate, 35);
  assert.equal(outside.royaltyCents, 455);

  const below = calculate({ books: [book("0.50", "100"), book("4.99", "55")] }).values.books[0];
  assert.deepEqual(below.limit, { kind: "below-minimum", priceCents: 99 });
  assert.equal(below.priceCents, 99);
  assert.equal(below.royaltyCents, 35);

  const above = calculate({ books: [book("$250", "100"), book("4.99", "55")] }).values.books[0];
  assert.deepEqual(above.limit, { kind: "above-maximum", priceCents: 20_000 });
  assert.equal(above.royaltyCents, 7_000);

  assert.equal(calculate({ fileSizeText: "1" }).values.books[0].royaltyCents, 339);
  assert.equal(calculate({ fileSizeText: "5" }).values.books[0].royaltyCents, 297);
  assert.deepEqual(invalidFields({ fileSizeText: "651" }), ["fileSize"]);

  const free = calculate({ books: [book("0", "100"), book("4.99", "55")] }).values;
  assert.equal(free.books[0].free, true);
  assert.equal(free.books[0].rate, 0);
  assert.equal(free.highestAcosTenths, null);
});

test("Kindle Unlimited reads and the 3,000 KENPC cap", () => {
  const { values } = calculate({
    books: [book("4.99", "100", "15,000", "300"), book("4.99", "55", "9000", "300"), book("4.99", "44", "7200", "300")],
    kenpRateText: "0.0045", kenpMonthText: "2026-08",
  });
  assert.deepEqual(values.books.map((b) => b.readers), [150, 85, 68]);
  assert.deepEqual(values.books.map((b) => b.stepBasisPoints), [null, 5_667, 8_000]);
  assert.deepEqual(values.books.map((b) => b.ku.earningsCents), [6_750, 4_050, 3_240]);
  assert.equal(values.readerValueCents, 529);
  assert.deepEqual(values.books.map((b) => b.contributionCents), [264, 147, 118]);
  assert.equal(values.tenPointsCents, 47);
  assert.deepEqual(values.kenp, { rateText: "0.0045", month: "2026-08" });

  const capped = calculate({
    books: [book("4.99", "100", "12000", "4000"), book("4.99", "55")],
    kenpRateText: "0.0045", kenpMonthText: "2026-08",
  }).values.books[0].ku;
  assert.equal(capped.creditedPages, 3_000);
  assert.equal(capped.capped, true);
  assert.equal(capped.fullReads, 4);
  assert.equal(capped.perFullReadCents, 1_350);
  assert.equal(capped.earningsCents, 5_400);
});

test("ads, profit target, and no room", () => {
  const breakEven = calculate({ adCostText: "70", conversionText: "10" }).values.ads;
  assert.deepEqual(breakEven.cost, { unit: "acos", costCents: 349, leftCents: 303 });
  assert.equal(breakEven.mostToPayCents, 652);
  assert.equal(breakEven.highestCpcCents, 65);

  const target = calculate({ profitTargetText: "1.00", conversionText: "10" }).values;
  assert.equal(target.ads.mostToPayCents, 552);
  assert.equal(target.highestAcosTenths, 1_107);
  assert.equal(target.ads.highestCpcCents, 55);

  const noRoom = calculate({ profitTargetText: "7" }).values;
  assert.equal(noRoom.ads.mostToPayCents, 0);
  assert.equal(noRoom.highestAcosTenths, 0);
  assert.equal(noRoom.ads.noRoom, true);

  const perReader = calculate({ adCostText: "8.00", adCostUnit: "per-reader" }).values.ads.cost;
  assert.deepEqual(perReader, { unit: "per-reader", costCents: 800, leftCents: -147 });
});

test("book 1 deals", () => {
  const free = calculate({ dealPriceText: "0", dealKind: "countdown" }).values.deal;
  assert.equal(free.kind, "free");
  assert.equal(free.royaltyCents, 0);
  assert.equal(free.readThroughBasisPoints, 5_500);
  assert.equal(free.usedOwnRate, true);
  assert.equal(free.valueCents, 325);
  assert.equal(free.copiesToMatchTenths, 20);

  const lower = calculate({ dealPriceText: "0", dealReadThroughText: "30" }).values.deal;
  assert.equal(lower.valueCents, 177);
  assert.equal(lower.copiesToMatchTenths, 37);

  const countdown = calculate({ dealPriceText: "0.99", dealKind: "countdown" }).values.deal;
  assert.equal(countdown.rate, 70);
  assert.equal(countdown.royaltyCents, 48);
  assert.equal(countdown.valueCents, 373);
  assert.equal(countdown.copiesToMatchTenths, 18);

  const priceChange = calculate({ dealPriceText: "0.99", dealKind: "price-change" }).values.deal;
  assert.equal(priceChange.rate, 35);
  assert.equal(priceChange.royaltyCents, 35);
  assert.equal(priceChange.valueCents, 360);
  assert.equal(priceChange.copiesToMatchTenths, 18);

  // A book listed above the 70% band earns 35% at list, so its Countdown price does too.
  const highList = calculate({ books: [book("13.00", "100"), book("4.99", "55")], dealPriceText: "9.99", dealKind: "countdown" }).values.deal;
  assert.equal(highList.rate, 35);
  assert.equal(highList.royaltyCents, 350);
});

test("KDP's Countdown Deal price rules", () => {
  const tooSmallCut = calculate({ dealPriceText: "4.49", dealKind: "countdown" });
  assert.equal(tooSmallCut.values.deal, null);
  assert.deepEqual(Object.keys(tooSmallCut.fieldErrors), ["dealPrice"]);

  const highList = calculate({ books: [book("25.99", "100"), book("4.99", "55")], dealPriceText: "9.99", dealKind: "countdown" });
  assert.equal(highList.values.deal, null);
  assert.deepEqual(Object.keys(highList.fieldErrors), ["dealKind"]);

  const belowMinimum = calculate({ dealPriceText: "0.49", dealKind: "countdown" });
  assert.deepEqual(Object.keys(belowMinimum.fieldErrors), ["dealPrice"]);
});

test("read-through above 100% and a book with no readers", () => {
  const over = calculate({ books: [book("4.99", "100"), book("4.99", "120")] }).values.books[1];
  assert.equal(over.stepBasisPoints, 12_000);
  assert.equal(over.reachBasisPoints, 12_000);

  const gap = calculate({ books: [book("4.99", "100"), book("4.99", "0"), book("4.99", "10")], dealPriceText: "0" }).values;
  assert.deepEqual(gap.books.map((b) => b.stepBasisPoints), [null, 0, null]);
  assert.equal(gap.books[1].worthFromHereCents, null);
  assert.equal(gap.tenPointsCents, null);
  assert.equal(gap.readerValueCents, 361);
  assert.equal(gap.deal.valueCents, null);
  assert.equal(gap.deal.copiesToMatchTenths, null);
});

test("invalid inputs block the answer", () => {
  assert.deepEqual(invalidFields({ books: [book("4.99", "100")] }), ["books"]);
  assert.deepEqual(invalidFields({ books: [book("4.99", "0"), book("4.99", "50")] }), ["sales.0"]);
  assert.deepEqual(
    invalidFields({ books: [book("4.99", "100"), book("4.99", "55", "9000", "300")] }).sort(),
    ["kenpMonth", "kenpRate"],
  );
  assert.deepEqual(invalidFields({ books: [book("4.99", "-5"), book("4.99", "12.5")] }), ["sales.0", "sales.1"]);
  assert.deepEqual(invalidFields({ books: [book("", "100"), book("4.99", "55", "900")], kenpRateText: "0.0045", kenpMonthText: "2026-08" }), ["price.0", "kenpc.1"]);
  assert.deepEqual(invalidFields({ books: [book("4.99", "100", "900", "300"), book("4.99", "55")], kenpRateText: "0.45", kenpMonthText: "2026-8" }).sort(), ["kenpMonth", "kenpRate"]);
});

test("bad ad, profit, or deal fields keep the reader value", () => {
  const high = calculate({ dealPriceText: "5.99" });
  assert.equal(high.values.deal, null);
  assert.deepEqual(Object.keys(high.fieldErrors), ["dealPrice"]);
  assert.equal(high.values.readerValueCents, 653);

  const freeAcos = calculate({ books: [book("0", "100"), book("4.99", "55")], adCostText: "50" });
  assert.equal(freeAcos.values.ads.cost, null);
  assert.deepEqual(Object.keys(freeAcos.fieldErrors), ["adCost"]);
  assert.equal(freeAcos.values.highestAcosTenths, null);

  const badProfit = calculate({ profitTargetText: "-1" });
  assert.equal(badProfit.values.ads, null);
  assert.equal(badProfit.values.highestAcosTenths, null);
  assert.equal(badProfit.values.readerValueCents, 653);
});
