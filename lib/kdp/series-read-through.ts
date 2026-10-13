import {
  KDP_EBOOK_MAX_PRICE_CENTS,
  KDP_EBOOK_SEVENTY_MAX_CENTS,
  KDP_EBOOK_SEVENTY_MIN_CENTS,
  KDP_ROYALTY_RATES,
  KDP_ROYALTY_VERSION,
  getKdpEbookDeliveryCents,
  getKdpEbookFloorCents,
  getKdpEbookPricePoint,
} from "./royalty.ts";
import { isValidKdpKenpMonth, parseKdpKenpRate, parseKdpKenpRead } from "./kenp.ts";
import { KDP_MAX_FILE_MB } from "./specs.ts";

export const SERIES_MIN_BOOKS = 2;
export const SERIES_MAX_BOOKS = 30;

export type SeriesBookInput = Readonly<{
  priceText: string;    // required; "0" = free
  salesText: string;    // required
  kuPagesText: string;  // "" → 0
  kenpcText: string;    // required only when KU pages > 0
}>;

export type SeriesReadThroughInput = Readonly<{
  books: readonly SeriesBookInput[];
  fileSizeText: string;        // "" → 2 MB
  kenpRateText: string;        // USD per page; required when any KU pages > 0
  kenpMonthText: string;       // "YYYY-MM"; required with the rate
  adCostText: string;          // "" → not used
  adCostUnit: string;          // "acos" | "per-reader"; "" → "acos"
  conversionText: string;      // percent; "" → not used
  profitTargetText: string;    // USD per reader; "" → 0
  dealPriceText: string;       // USD; "" → no deal; "0" → free
  dealKind: string;            // "price-change" | "countdown"; "" → "price-change"
  dealReadThroughText: string; // percent; "" → own book 1 → 2 step
}>;

type BookField = "price" | "sales" | "kuPages" | "kenpc";
export type SeriesPartField =
  | "adCost" | "adCostUnit" | "conversion" | "profitTarget"
  | "dealPrice" | "dealKind" | "dealReadThrough";
export type SeriesField =
  | "books" | "fileSize" | "kenpRate" | "kenpMonth"
  | SeriesPartField
  | `${BookField}.${number}`;  // 0-based book index, such as "sales.0"

export type SeriesPriceLimit = null | Readonly<{ kind: "below-minimum" | "above-maximum"; priceCents: number }>;

export type SeriesBookValues = Readonly<{
  index: number;                    // 0-based
  enteredPriceCents: number;
  priceCents: number;               // answered price after limits
  limit: SeriesPriceLimit;
  free: boolean;
  rate: 0 | 35 | 70;                // applied rate; 0 when free
  royaltyCents: number;             // per copy, never negative
  sales: number;
  ku: null | Readonly<{             // null when KU pages are 0
    pages: number;
    kenpc: number;
    creditedPages: number;          // min(kenpc, 3000)
    capped: boolean;
    fullReads: number;              // pages ÷ creditedPages, unrounded
    perFullReadCents: number;
    earningsCents: number;
  }>;
  readers: number;                  // sales + KU full reads, unrounded
  stepBasisPoints: number | null;   // null for book 1, or when the previous book has 0 readers
  reachBasisPoints: number;
  contributionCents: number;        // sums to readerValueCents
  worthFromHereCents: number | null;
}>;

export type SeriesReadThroughValues = Readonly<{
  books: readonly SeriesBookValues[];
  fileSizeMB: number;
  defaultFileSize: boolean;
  deliveryCents: number;
  readerValueCents: number;
  highestAcosTenths: number | null;   // 0.1% units; null when book 1 is free or the profit target is invalid
  tenPointsCents: number | null;      // null when book 2 has 0 readers
  kenp: null | Readonly<{ rateText: string; month: string }>; // null when no KU pages
  ads: null | Readonly<{              // null only when the profit target is invalid
    profitTargetCents: number;
    mostToPayCents: number;
    noRoom: boolean;
    cost: null | Readonly<{ unit: "acos" | "per-reader"; costCents: number; leftCents: number }>; // leftCents may be negative
    highestCpcCents: number | null;
  }>;
  deal: null | Readonly<{             // null when no deal or a deal field is invalid
    kind: "free" | "price-change" | "countdown";
    enteredPriceCents: number;
    priceCents: number;
    limit: SeriesPriceLimit;          // price-change only
    rate: 0 | 35 | 70;
    royaltyCents: number;
    readThroughBasisPoints: number;
    usedOwnRate: boolean;
    valueCents: number | null;
    copiesToMatchTenths: number | null;
  }>;
  rulesVersion: string;               // KDP_ROYALTY_VERSION
}>;

export type SeriesReadThroughResult =
  | Readonly<{ status: "invalid"; fieldErrors: Partial<Record<SeriesField, string>> }>
  | Readonly<{ status: "calculated"; values: SeriesReadThroughValues; fieldErrors: Partial<Record<SeriesPartField, string>> }>;

const DEFAULT_FILE_MB = 2;
const KENPC_CAP = 3_000;
const SALES_MAX = 10_000_000;
const KENPC_MAX = 100_000;
const KENP_RATE_MAX_UNITS = 10_000_000n; // $0.10 per page in 1e-8 dollar units
const PART_MONEY_MAX_CENTS = 100_000;    // $1,000
const ACOS_MAX_BASIS_POINTS = 100_000;   // 1,000%
const PERCENT_MAX_BASIS_POINTS = 10_000; // 100%
// KDP Kindle Countdown Deals, https://kdp.amazon.com/en_US/help/topic/G201293780
const COUNTDOWN_MIN_DEAL_CENTS = 99;
const COUNTDOWN_MIN_LIST_CENTS = 299;
const COUNTDOWN_MAX_LIST_CENTS = 2_499;
const COUNTDOWN_MIN_CUT_CENTS = 100;
// Money inside the engine is in 1e-8 dollar units, the KENP rate's own scale.
const UNITS_PER_CENT = 1_000_000n;

// Exact non-negative or signed fractions, so readers and money never drift.
type Q = Readonly<{ n: bigint; d: bigint }>;

function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b;
  while (y) [x, y] = [y, x % y];
  return x || 1n;
}

function q(n: bigint, d = 1n): Q {
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

const add = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
const div = (a: Q, b: Q) => (b.n < 0n ? q(-a.n * b.d, a.d * -b.n) : q(a.n * b.d, a.d * b.n));
const cmp = (a: Q, b: Q) => {
  const left = a.n * b.d;
  const right = b.n * a.d;
  return left === right ? 0 : left < right ? -1 : 1;
};

function floorDiv(a: bigint, b: bigint): bigint {
  const quotient = a / b;
  return a % b !== 0n && a < 0n ? quotient - 1n : quotient;
}

/** Floor of value × scale. */
function floorAt(value: Q, scale: bigint): number {
  return Number(floorDiv(value.n * scale, value.d));
}

/** Half up of value × scale. */
function halfUpAt(value: Q, scale: bigint): number {
  return Number(floorDiv(2n * value.n * scale + value.d, 2n * value.d));
}

const toNumber = (value: Q) => Number(value.n) / Number(value.d);
const unitsToCents = (units: Q, round: (value: Q, scale: bigint) => number) => round(q(units.n, units.d * UNITS_PER_CENT), 1n);

function parseMoneyCents(raw: string): number | null {
  const match = /^\$?(\d+)(?:\.(\d{1,2}))?$/.exec(raw.trim());
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Percent with up to two decimals, as basis points. */
function parsePercentBasisPoints(raw: string): number | null {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(raw.trim());
  if (!match) return null;
  const basisPoints = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(basisPoints) ? basisPoints : null;
}

/** Plain digits, or digits with comma thousands separators. */
function stripCountCommas(raw: string): string | null {
  const value = raw.trim();
  if (/^\d+$/.test(value)) return value;
  if (/^\d{1,3}(?:,\d{3})+$/.test(value)) return value.replace(/,/g, "");
  return null;
}

function parseCount(raw: string, minimum: number, maximum: number): number | null {
  const digits = stripCountCommas(raw);
  if (digits === null) return null;
  const value = Number(digits);
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum ? value : null;
}

function parseFileSize(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d+(?:\.\d+)?$/.test(value)) return null;
  const size = Number(value);
  return Number.isFinite(size) && size > 0 && size <= KDP_MAX_FILE_MB ? size : null;
}

function answerPrice(enteredCents: number, minimumCents: number): Readonly<{ priceCents: number; limit: SeriesPriceLimit }> {
  if (enteredCents < minimumCents) return { priceCents: minimumCents, limit: { kind: "below-minimum", priceCents: minimumCents } };
  if (enteredCents > KDP_EBOOK_MAX_PRICE_CENTS) {
    return { priceCents: KDP_EBOOK_MAX_PRICE_CENTS, limit: { kind: "above-maximum", priceCents: KDP_EBOOK_MAX_PRICE_CENTS } };
  }
  return { priceCents: enteredCents, limit: null };
}

type Royalty = Readonly<{ priceCents: number; limit: SeriesPriceLimit; rate: 0 | 35 | 70; royaltyCents: number }>;

/** KDP's normal ebook rules on the 70% plan: limits first, then the shared price point. */
function royaltyAt(enteredCents: number, fileSizeMB: number): Royalty {
  if (enteredCents === 0) return { priceCents: 0, limit: null, rate: 0, royaltyCents: 0 };
  const answered = answerPrice(enteredCents, getKdpEbookFloorCents(fileSizeMB));
  const point = getKdpEbookPricePoint(answered.priceCents, 70, fileSizeMB);
  return {
    ...answered,
    rate: point.royaltyRate === KDP_ROYALTY_RATES.ebookHigh ? 70 : 35,
    royaltyCents: Math.max(0, point.royaltyCents),
  };
}

function inSeventyBand(priceCents: number): boolean {
  return priceCents >= KDP_EBOOK_SEVENTY_MIN_CENTS && priceCents <= KDP_EBOOK_SEVENTY_MAX_CENTS;
}

type ParsedBook = {
  enteredPriceCents: number | null;
  sales: number | null;
  kuPages: number | null;
  kenpc: number | null;
};

export function calculateSeriesReadThrough(input: SeriesReadThroughInput): SeriesReadThroughResult {
  const errors: Partial<Record<SeriesField, string>> = {};
  const partErrors: Partial<Record<SeriesPartField, string>> = {};

  // Books.
  if (input.books.length < SERIES_MIN_BOOKS || input.books.length > SERIES_MAX_BOOKS) {
    errors.books = `Add ${SERIES_MIN_BOOKS} to ${SERIES_MAX_BOOKS} books.`;
  }
  const parsed: ParsedBook[] = input.books.map((book, index) => {
    const enteredPriceCents = book.priceText.trim() === "" ? null : parseMoneyCents(book.priceText);
    if (enteredPriceCents === null) {
      errors[`price.${index}`] = book.priceText.trim() === "" ? "Enter the book's price." : "Enter a price in dollars, such as 4.99. Use 0 for free.";
    }
    const sales = book.salesText.trim() === "" ? null : parseCount(book.salesText, 0, SALES_MAX);
    if (sales === null) {
      errors[`sales.${index}`] = book.salesText.trim() === "" ? "Enter copies sold." : "Enter a whole number of copies, up to 10,000,000.";
    }
    let kuPages: number | null = 0;
    if (book.kuPagesText.trim() !== "") {
      const digits = stripCountCommas(book.kuPagesText);
      kuPages = digits === null ? null : parseKdpKenpRead(digits);
      if (kuPages === null) errors[`kuPages.${index}`] = "Enter a whole number of pages, up to 1,000,000,000.";
    }
    let kenpc: number | null = null;
    if (book.kenpcText.trim() !== "") {
      kenpc = parseCount(book.kenpcText, 1, KENPC_MAX);
      if (kenpc === null) errors[`kenpc.${index}`] = "Enter the KENPC as a whole number from 1 to 100,000.";
    } else if (kuPages !== null && kuPages > 0) {
      errors[`kenpc.${index}`] = "Add this book's KENPC to count its KU reads.";
    }
    return { enteredPriceCents, sales, kuPages, kenpc };
  });

  // File size.
  const fileSizeText = input.fileSizeText.trim();
  const defaultFileSize = fileSizeText === "";
  const fileSizeMB = defaultFileSize ? DEFAULT_FILE_MB : parseFileSize(fileSizeText);
  if (fileSizeMB === null) errors.fileSize = `Enter a file size above 0 and at most ${KDP_MAX_FILE_MB} MB, KDP's limit.`;

  // KENP rate and month, used only when some book has KU pages.
  const usesKu = parsed.some((book) => (book.kuPages ?? 0) > 0);
  let kenpRate: ReturnType<typeof parseKdpKenpRate> = null;
  let kenpMonth = "";
  if (usesKu) {
    const rateText = input.kenpRateText.trim();
    kenpRate = rateText === "" ? null : parseKdpKenpRate(rateText);
    if (kenpRate && kenpRate.units > KENP_RATE_MAX_UNITS) kenpRate = null;
    if (!kenpRate) {
      errors.kenpRate = rateText === "" ? "Add the KENP rate to count your KU pages." : "Enter dollars per page, such as 0.0045. KENP rates are under $0.10.";
    }
    kenpMonth = input.kenpMonthText.trim();
    if (!isValidKdpKenpMonth(kenpMonth)) {
      errors.kenpMonth = kenpMonth === "" ? "Enter the month the rate is for." : "Enter the month as YYYY-MM, such as 2026-08.";
    }
  }

  // Readers per book, once every core field parsed.
  const coreValid = Object.keys(errors).length === 0;
  const readers: Q[] = coreValid
    ? parsed.map((book) => {
      const credited = Math.min(book.kenpc ?? 1, KENPC_CAP);
      return add(q(BigInt(book.sales as number)), (book.kuPages as number) > 0 ? q(BigInt(book.kuPages as number), BigInt(credited)) : q(0n));
    })
    : [];
  if (coreValid && readers[0].n === 0n) errors["sales.0"] = "Book 1 needs at least one sale or KU read.";

  // Part fields: ads, profit, and deal. Their errors never block the reader value.
  const book1Cents = parsed[0]?.enteredPriceCents ?? null;
  const book1Free = book1Cents === 0;
  const book1Answered = book1Cents !== null && fileSizeMB !== null && book1Cents > 0 ? answerPrice(book1Cents, getKdpEbookFloorCents(fileSizeMB)).priceCents : null;

  const profitText = input.profitTargetText.trim();
  const profitCents = profitText === "" ? 0 : parseMoneyCents(profitText);
  if (profitCents === null || profitCents > PART_MONEY_MAX_CENTS) partErrors.profitTarget = "Enter a profit from $0 to $1,000 per reader.";
  const profitTargetCents = partErrors.profitTarget ? null : profitCents;

  const unitText = input.adCostUnit.trim() || "acos";
  const adUnit = unitText === "acos" || unitText === "per-reader" ? unitText : null;
  if (!adUnit) partErrors.adCostUnit = "Choose % ACoS or $ per reader.";
  const adText = input.adCostText.trim();
  let adCost: Readonly<{ unit: "acos" | "per-reader"; value: number }> | null = null;
  if (adText !== "" && adUnit) {
    if (adUnit === "acos") {
      const basisPoints = parsePercentBasisPoints(adText);
      if (basisPoints === null || basisPoints > ACOS_MAX_BASIS_POINTS) partErrors.adCost = "Enter an ACoS from 0 to 1,000%.";
      else if (book1Free) partErrors.adCost = "ACoS needs a paid book 1. Switch to $ per reader.";
      else adCost = { unit: "acos", value: basisPoints };
    } else {
      const cents = parseMoneyCents(adText);
      if (cents === null || cents > PART_MONEY_MAX_CENTS) partErrors.adCost = "Enter a cost from $0 to $1,000 per reader.";
      else adCost = { unit: "per-reader", value: cents };
    }
  }

  const conversionText = input.conversionText.trim();
  let conversionBasisPoints: number | null = null;
  if (conversionText !== "") {
    conversionBasisPoints = parsePercentBasisPoints(conversionText);
    if (conversionBasisPoints === null || conversionBasisPoints <= 0 || conversionBasisPoints > PERCENT_MAX_BASIS_POINTS) {
      conversionBasisPoints = null;
      partErrors.conversion = "Enter a conversion rate above 0 and at most 100%.";
    }
  }

  const dealText = input.dealPriceText.trim();
  let dealCents: number | null = null;
  let dealKind: "free" | "price-change" | "countdown" | null = null;
  let dealReadThroughBasisPoints: number | null = null;
  if (dealText !== "") {
    dealCents = parseMoneyCents(dealText);
    const kindText = input.dealKind.trim() || "price-change";
    const chosenKind = kindText === "price-change" || kindText === "countdown" ? kindText : null;
    if (dealCents === null) partErrors.dealPrice = "Enter a deal price in dollars, such as 0.99. Use 0 for free.";
    else if (book1Free) partErrors.dealPrice = "Book 1 is already free, so there's no deal to compare.";
    else if (book1Cents !== null && dealCents >= book1Cents) partErrors.dealPrice = "Enter a deal price below book 1's price.";
    else if (dealCents > 0 && !chosenKind) partErrors.dealKind = "Choose a price change or a Countdown Deal.";
    else if (dealCents > 0 && chosenKind === "countdown") {
      if (dealCents < COUNTDOWN_MIN_DEAL_CENTS) partErrors.dealPrice = "A Countdown Deal price must be at least $0.99.";
      else if (book1Answered !== null && (book1Answered < COUNTDOWN_MIN_LIST_CENTS || book1Answered > COUNTDOWN_MAX_LIST_CENTS)) {
        partErrors.dealKind = "A Countdown Deal needs book 1 priced from $2.99 to $24.99.";
      } else if (book1Answered !== null && book1Answered - dealCents < COUNTDOWN_MIN_CUT_CENTS) {
        partErrors.dealPrice = "A Countdown Deal must be at least $1.00 below book 1's price.";
      }
    }
    dealKind = dealCents === 0 ? "free" : chosenKind;

    const readThroughText = input.dealReadThroughText.trim();
    if (readThroughText !== "") {
      dealReadThroughBasisPoints = parsePercentBasisPoints(readThroughText);
      if (dealReadThroughBasisPoints === null || dealReadThroughBasisPoints > PERCENT_MAX_BASIS_POINTS) {
        dealReadThroughBasisPoints = null;
        partErrors.dealReadThrough = "Enter a share from 0 to 100%.";
      }
    }
  }

  if (Object.keys(errors).length) return { status: "invalid", fieldErrors: { ...errors, ...partErrors } };

  // Core math. Every field above parsed, so the casts below are safe.
  const sizeMB = fileSizeMB as number;
  const deliveryCents = getKdpEbookDeliveryCents(sizeMB);
  const rateUnits = kenpRate?.units ?? 0n;
  const R1 = readers[0];

  const books = parsed.map((book, index) => {
    const entered = book.enteredPriceCents as number;
    const sales = book.sales as number;
    const royalty = royaltyAt(entered, sizeMB);
    const pages = book.kuPages as number;
    let ku: SeriesBookValues["ku"] = null;
    let kuUnits = 0n;
    if (pages > 0) {
      const kenpc = book.kenpc as number;
      const creditedPages = Math.min(kenpc, KENPC_CAP);
      kuUnits = BigInt(pages) * rateUnits;
      ku = {
        pages,
        kenpc,
        creditedPages,
        capped: kenpc > KENPC_CAP,
        fullReads: pages / creditedPages,
        perFullReadCents: unitsToCents(q(BigInt(creditedPages) * rateUnits), halfUpAt),
        earningsCents: unitsToCents(q(kuUnits), halfUpAt),
      };
    }
    const earnings = q(BigInt(sales) * BigInt(royalty.royaltyCents) * UNITS_PER_CENT + kuUnits);
    return { index, entered, sales, royalty, ku, earnings, readers: readers[index] };
  });

  const totalEarnings = books.reduce((sum, book) => add(sum, book.earnings), q(0n));
  const readerValue = div(totalEarnings, R1);
  const readerValueCents = unitsToCents(readerValue, halfUpAt);

  // Contributions: floor each, then hand the leftover cents to the largest remainders, earlier book first.
  const contributionExact = books.map((book) => q(book.earnings.n, book.earnings.d * UNITS_PER_CENT)).map((value) => div(value, R1));
  const contributionCents = contributionExact.map((value) => floorAt(value, 1n));
  let leftover = readerValueCents - contributionCents.reduce((sum, cents) => sum + cents, 0);
  const byRemainder = contributionExact
    .map((value, index) => ({ index, remainder: sub(value, q(BigInt(contributionCents[index]))) }))
    .sort((a, b) => cmp(b.remainder, a.remainder) || a.index - b.index);
  for (const { index } of byRemainder) {
    if (leftover <= 0) break;
    contributionCents[index] += 1;
    leftover -= 1;
  }

  const worthFromHere = books.map((book, index) => {
    if (book.readers.n === 0n) return null;
    const rest = books.slice(index).reduce((sum, later) => add(sum, later.earnings), q(0n));
    return div(rest, book.readers);
  });
  const bookTwoWorth = worthFromHere[1];

  const bookValues: SeriesBookValues[] = books.map((book, index) => {
    const previous = index > 0 ? books[index - 1].readers : null;
    const worth = worthFromHere[index];
    return {
      index,
      enteredPriceCents: book.entered,
      priceCents: book.royalty.priceCents,
      limit: book.royalty.limit,
      free: book.entered === 0,
      rate: book.royalty.rate,
      royaltyCents: book.royalty.royaltyCents,
      sales: book.sales,
      ku: book.ku,
      readers: toNumber(book.readers),
      stepBasisPoints: previous && previous.n > 0n ? halfUpAt(div(book.readers, previous), 10_000n) : null,
      reachBasisPoints: halfUpAt(div(book.readers, R1), 10_000n),
      contributionCents: contributionCents[index],
      worthFromHereCents: worth ? unitsToCents(worth, halfUpAt) : null,
    };
  });

  // Ads.
  const book1Price = books[0].royalty.priceCents;
  let ads: SeriesReadThroughValues["ads"] = null;
  let highestAcosTenths: number | null = null;
  if (profitTargetCents !== null) {
    const profitUnits = q(BigInt(profitTargetCents) * UNITS_PER_CENT);
    const noRoom = cmp(profitUnits, readerValue) >= 0;
    const mostToPay = noRoom ? q(0n) : sub(readerValue, profitUnits);
    if (book1Price > 0) highestAcosTenths = floorAt(div(mostToPay, q(BigInt(book1Price) * UNITS_PER_CENT)), 1_000n);
    let cost: NonNullable<SeriesReadThroughValues["ads"]>["cost"] = null;
    if (adCost) {
      const costUnits = adCost.unit === "acos"
        ? q(BigInt(adCost.value) * BigInt(book1Price) * UNITS_PER_CENT, 10_000n)
        : q(BigInt(adCost.value) * UNITS_PER_CENT);
      cost = { unit: adCost.unit, costCents: unitsToCents(costUnits, halfUpAt), leftCents: unitsToCents(sub(readerValue, costUnits), halfUpAt) };
    }
    ads = {
      profitTargetCents,
      mostToPayCents: unitsToCents(mostToPay, floorAt),
      noRoom,
      cost,
      highestCpcCents: conversionBasisPoints === null ? null : unitsToCents(mul(mostToPay, q(BigInt(conversionBasisPoints), 10_000n)), floorAt),
    };
  }

  // Book 1 deal.
  let deal: SeriesReadThroughValues["deal"] = null;
  const dealErrors = partErrors.dealPrice || partErrors.dealKind || partErrors.dealReadThrough;
  if (dealCents !== null && dealKind && !dealErrors) {
    let dealRoyalty: Royalty;
    if (dealKind === "free") {
      dealRoyalty = { priceCents: 0, limit: null, rate: 0, royaltyCents: 0 };
    } else if (dealKind === "price-change") {
      dealRoyalty = royaltyAt(dealCents, sizeMB);
    } else if (inSeventyBand(book1Price)) {
      // KDP keeps the 70% rate a book earns at its list price for a Countdown Deal price, below $2.99 too.
      const royaltyCents = Math.round((dealCents - deliveryCents) * KDP_ROYALTY_RATES.ebookHigh / 100);
      dealRoyalty = { priceCents: dealCents, limit: null, rate: 70, royaltyCents: Math.max(0, royaltyCents) };
    } else {
      const point = getKdpEbookPricePoint(dealCents, 35, sizeMB);
      dealRoyalty = { priceCents: dealCents, limit: null, rate: 35, royaltyCents: Math.max(0, point.royaltyCents) };
    }
    const usedOwnRate = dealReadThroughBasisPoints === null;
    const readThrough = usedOwnRate ? div(books[1].readers, R1) : q(BigInt(dealReadThroughBasisPoints as number), 10_000n);
    const value = bookTwoWorth
      ? add(q(BigInt(dealRoyalty.royaltyCents) * UNITS_PER_CENT), mul(readThrough, bookTwoWorth))
      : null;
    deal = {
      kind: dealKind,
      enteredPriceCents: dealCents,
      priceCents: dealRoyalty.priceCents,
      limit: dealRoyalty.limit,
      rate: dealRoyalty.rate,
      royaltyCents: dealRoyalty.royaltyCents,
      readThroughBasisPoints: halfUpAt(readThrough, 10_000n),
      usedOwnRate,
      valueCents: value ? unitsToCents(value, halfUpAt) : null,
      copiesToMatchTenths: value && value.n > 0n ? halfUpAt(div(readerValue, value), 10n) : null,
    };
  }

  return {
    status: "calculated",
    fieldErrors: partErrors,
    values: {
      books: bookValues,
      fileSizeMB: sizeMB,
      defaultFileSize,
      deliveryCents,
      readerValueCents,
      highestAcosTenths: profitTargetCents === null ? null : highestAcosTenths,
      tenPointsCents: bookTwoWorth ? unitsToCents(mul(bookTwoWorth, q(1n, 10n)), halfUpAt) : null,
      kenp: usesKu && kenpRate ? { rateText: kenpRate.text, month: kenpMonth } : null,
      ads,
      deal,
      rulesVersion: KDP_ROYALTY_VERSION,
    },
  };
}
