import {
  KDP_EBOOK_MAX_PRICE_CENTS,
  KDP_EBOOK_SEVENTY_MAX_CENTS,
  KDP_EBOOK_SEVENTY_MIN_CENTS,
  KDP_PRINT_MAX_PRICE_CENTS,
  KDP_ROYALTY_RATES,
  KDP_ROYALTY_VERSION,
  getKdpEbookDeliveryCents,
  getKdpEbookFloorCents,
  getKdpEbookPricePoint,
  getKdpPrintCost,
  getKdpPrintFloorCents,
  getKdpPrintPricePoint,
  getKdpPrintRoyaltyCents,
  getKdpPrintingCostCents,
  getKdpPrintingCostHundredthCents,
} from "./royalty.ts";
import {
  KDP_MAX_FILE_MB,
  getKdpInteriorOptions,
  getKdpPageLimit,
  getKdpPaperOptions,
  getKdpTrimOptions,
  type KdpInterior,
  type KdpPaper,
} from "./specs.ts";

export type KdpRoyaltyCalculatorField =
  | "format" | "listPrice" | "pageCount" | "interior" | "trimId" | "paper"
  | "channel" | "fileSize" | "plan" | "monthlyGoal";

export type KdpRoyaltyCalculatorInput = Readonly<{
  format: string;
  listPriceText: string;
  pageCountText: string;
  interior: string;
  trimId: string;        // "" → "6x9"
  paper: string;         // "" → "white"
  channel: string;       // "" → "amazon"; paperback only
  fileSizeText: string;  // "" → 2 MB
  plan: string;          // "" → "70"
  monthlyGoalText: string; // "" → not used
}>;

export type KdpRoyaltyCalculatorResult =
  | Readonly<{ status: "invalid"; fieldErrors: Partial<Record<KdpRoyaltyCalculatorField, string>> }>
  | Readonly<{ status: "calculated"; values: KdpRoyaltyCalculatorValues; fieldErrors: Partial<Record<"monthlyGoal", string>> }>;

export type KdpRoyaltyCalculatorValues = Readonly<{
  format: "paperback" | "hardcover" | "ebook";
  channel: "amazon" | "expanded" | null;      // null for eBook
  plan: 35 | 70 | null;                       // selected plan; null for print
  enteredPriceCents: number;
  priceCents: number;                         // the answered price, after any limit
  limit: null | Readonly<{ kind: "below-minimum" | "below-break-even" | "above-maximum"; priceCents: number }>;
  rate: 35 | 40 | 50 | 60 | 70;               // applied rate
  seventyOutsideBand: null | "below" | "above"; // plan 70 but price outside $2.99–$12.99
  deliveryExceedsShare: boolean;
  royaltyCents: number;                       // never negative
  split: Readonly<{ royaltyCents: number; costCents: number; amazonCents: number }>;
  costKind: "printing" | "delivery" | null;
  printing: null | Readonly<{ enteredPages: number; printedPages: number; costCents: number; fixedCents: number; pageCents: number }>;
  delivery: null | Readonly<{ fileSizeMB: number; defaultSize: boolean; costCents: number }>; // costCents even when 35% applies
  minimumPriceCents: number;                  // lowest price for the selected channel or plan
  minimumKind: "kdp" | "break-even";          // "break-even" only for Expanded Distribution
  maximumPriceCents: number;
  shareBasisPoints: number;
  comparison: null | Readonly<{
    kind: "rate-step" | "other-channel" | "other-plan" | "seventy-band";
    priceCents: number;
    rate: number;
    royaltyCents: number;
  }>;
  goal: null | Readonly<{ goalCents: number; copies: number | null }>; // null when no goal or the goal is invalid
  curve: Readonly<{
    series: readonly Readonly<{ id: "amazon" | "expanded" | "plan70" | "plan35"; points: readonly (readonly [priceCents: number, royaltyCents: number])[] }>[];
    mark: Readonly<{ priceCents: number; royaltyCents: number }>;
  }>;
  rulesVersion: string;                       // KDP_ROYALTY_VERSION
}>;

type FieldErrors = Partial<Record<KdpRoyaltyCalculatorField, string>>;
type Values = KdpRoyaltyCalculatorValues;
type CurveSeries = Values["curve"]["series"][number];

function parseMoneyCents(text: string): number | null {
  const match = /^\$?(\d+)(?:\.(\d{1,2}))?$/.exec(text.trim());
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

function answerPrice(
  entered: number,
  minimum: number,
  maximum: number,
  minimumKind: Values["minimumKind"],
): Pick<Values, "priceCents" | "limit"> {
  if (entered < minimum) {
    return {
      priceCents: minimum,
      limit: { kind: minimumKind === "break-even" ? "below-break-even" : "below-minimum", priceCents: minimum },
    };
  }
  if (entered > maximum) return { priceCents: maximum, limit: { kind: "above-maximum", priceCents: maximum } };
  return { priceCents: entered, limit: null };
}

function curveFor(
  priceCents: number,
  royaltyCents: number,
  maximum: number,
  ebook: boolean,
  definitions: readonly Readonly<{
    id: CurveSeries["id"];
    minimum: number;
    maximum: number;
    royaltyAt: (price: number) => number;
  }>[],
): Values["curve"] {
  const lower = Math.min(...definitions.map((series) => series.minimum));
  const upper = Math.min(maximum, Math.max(
    Math.ceil((priceCents * 1.5 - 99) / 100) * 100 + 99,
    ebook ? 1_599 : 1_499,
  ));
  const boundaries = ebook
    ? [KDP_EBOOK_SEVENTY_MIN_CENTS - 1, KDP_EBOOK_SEVENTY_MIN_CENTS, KDP_EBOOK_SEVENTY_MAX_CENTS, KDP_EBOOK_SEVENTY_MAX_CENTS + 1]
    : [KDP_ROYALTY_RATES.printThresholdCents - 1, KDP_ROYALTY_RATES.printThresholdCents];
  const prices = [...new Set([
    ...Array.from({ length: 48 }, (_, index) => Math.round(lower + (upper - lower) * index / 47)),
    lower, upper, priceCents, ...boundaries, ...definitions.map((series) => series.minimum),
  ].filter((price) => price >= lower && price <= upper))].sort((a, b) => a - b);
  return {
    series: definitions.map((series) => ({
      id: series.id,
      points: prices.filter((price) => price >= series.minimum && price <= series.maximum)
        .map((price) => [price, Math.max(0, series.royaltyAt(price))] as const),
    })),
    mark: { priceCents, royaltyCents },
  };
}

function goalFor(goalCents: number | null, royaltyCents: number): Values["goal"] {
  return goalCents === null ? null : { goalCents, copies: royaltyCents > 0 ? Math.ceil(goalCents / royaltyCents) : null };
}

function calculateEbook(
  input: KdpRoyaltyCalculatorInput,
  enteredPriceCents: number,
  goalCents: number | null,
  fieldErrors: FieldErrors,
): KdpRoyaltyCalculatorResult {
  const sizeText = input.fileSizeText.trim();
  const fileSizeMB = sizeText === "" ? 2 : /^\d+(?:\.\d+)?$/.test(sizeText) ? Number(sizeText) : Number.NaN;
  if (!Number.isFinite(fileSizeMB) || fileSizeMB <= 0 || fileSizeMB > KDP_MAX_FILE_MB) {
    fieldErrors.fileSize = "Enter a file size above 0 and at most 650 MB.";
  }
  const planText = input.plan || "70";
  if (planText !== "35" && planText !== "70") fieldErrors.plan = "Choose the 35% or 70% plan.";
  if (fieldErrors.fileSize || fieldErrors.plan) return { status: "invalid", fieldErrors };

  const plan = planText === "35" ? 35 : 70;
  const minimumPriceCents = getKdpEbookFloorCents(fileSizeMB);
  const answered = answerPrice(enteredPriceCents, minimumPriceCents, KDP_EBOOK_MAX_PRICE_CENTS, "kdp");
  const { priceCents } = answered;
  const point = getKdpEbookPricePoint(priceCents, plan, fileSizeMB);
  const rate = point.royaltyRate === 70 ? 70 : 35;
  const royaltyCents = Math.max(0, point.royaltyCents);
  const deliveryExceedsShare = rate === 70 && point.royaltyCents <= 0;
  const deliveryCents = getKdpEbookDeliveryCents(fileSizeMB);
  const costCents = rate === 70 ? Math.min(deliveryCents, priceCents) : 0;
  const inBand = priceCents >= KDP_EBOOK_SEVENTY_MIN_CENTS && priceCents <= KDP_EBOOK_SEVENTY_MAX_CENTS;
  const bandSide = priceCents < KDP_EBOOK_SEVENTY_MIN_CENTS ? "below" : "above";
  let comparison: Values["comparison"] = null;
  if (inBand) {
    const otherRate = rate === 70 ? 35 : 70;
    comparison = {
      kind: "other-plan", priceCents, rate: otherRate,
      royaltyCents: Math.max(0, getKdpEbookPricePoint(priceCents, otherRate, fileSizeMB).royaltyCents),
    };
  } else {
    const edge = bandSide === "below" ? KDP_EBOOK_SEVENTY_MIN_CENTS : KDP_EBOOK_SEVENTY_MAX_CENTS;
    if (edge >= minimumPriceCents) comparison = {
      kind: "seventy-band", priceCents: edge, rate: 70,
      royaltyCents: Math.max(0, getKdpEbookPricePoint(edge, 70, fileSizeMB).royaltyCents),
    };
  }
  const plan70 = {
    id: "plan70" as const,
    minimum: Math.max(minimumPriceCents, KDP_EBOOK_SEVENTY_MIN_CENTS),
    maximum: KDP_EBOOK_SEVENTY_MAX_CENTS,
    royaltyAt: (price: number) => getKdpEbookPricePoint(price, 70, fileSizeMB).royaltyCents,
  };
  const plan35 = {
    id: "plan35" as const, minimum: minimumPriceCents, maximum: KDP_EBOOK_MAX_PRICE_CENTS,
    royaltyAt: (price: number) => getKdpEbookPricePoint(price, 35, fileSizeMB).royaltyCents,
  };
  return {
    status: "calculated",
    fieldErrors: fieldErrors.monthlyGoal ? { monthlyGoal: fieldErrors.monthlyGoal } : {},
    values: {
      format: "ebook", channel: null, plan, enteredPriceCents, ...answered, rate,
      seventyOutsideBand: plan === 70 && !inBand ? bandSide : null,
      deliveryExceedsShare, royaltyCents,
      split: { royaltyCents, costCents, amazonCents: priceCents - royaltyCents - costCents },
      costKind: rate === 70 ? "delivery" : null,
      printing: null, delivery: { fileSizeMB, defaultSize: sizeText === "", costCents: deliveryCents },
      minimumPriceCents, minimumKind: "kdp", maximumPriceCents: KDP_EBOOK_MAX_PRICE_CENTS,
      shareBasisPoints: Math.round(royaltyCents * 10_000 / priceCents), comparison,
      goal: goalFor(goalCents, royaltyCents),
      curve: curveFor(priceCents, royaltyCents, KDP_EBOOK_MAX_PRICE_CENTS, true, plan === 70 ? [plan70, plan35] : [plan35, plan70]),
      rulesVersion: KDP_ROYALTY_VERSION,
    },
  };
}

export function calculateKdpRoyaltyEstimate(input: KdpRoyaltyCalculatorInput): KdpRoyaltyCalculatorResult {
  const fieldErrors: FieldErrors = {};
  const format = input.format;
  if (format !== "paperback" && format !== "hardcover" && format !== "ebook") {
    fieldErrors.format = "Choose paperback, hardcover, or Kindle eBook.";
  }
  const enteredPriceCents = parseMoneyCents(input.listPriceText);
  if (enteredPriceCents === null) fieldErrors.listPrice = "Enter a price above $0 with at most two decimal places.";
  const goalText = input.monthlyGoalText.trim();
  let goalCents = goalText === "" ? null : parseMoneyCents(goalText);
  if (goalText !== "" && (goalCents === null || goalCents > 1_000_000_000)) {
    fieldErrors.monthlyGoal = "Enter a goal above $0 and at most $10,000,000.";
    goalCents = null;
  }
  if (fieldErrors.format || enteredPriceCents === null) return { status: "invalid", fieldErrors };
  if (format === "ebook") return calculateEbook(input, enteredPriceCents, goalCents, fieldErrors);
  if (format !== "paperback" && format !== "hardcover") return { status: "invalid", fieldErrors };

  const pageText = input.pageCountText.trim();
  const enteredPages = /^\d+$/.test(pageText) ? Number(pageText) : Number.NaN;
  const validPages = Number.isSafeInteger(enteredPages) && enteredPages > 0;
  if (!validPages) fieldErrors.pageCount = "Enter a whole page count above 0.";
  const printedPages = enteredPages + enteredPages % 2;
  const trimId = input.trimId || "6x9";
  const paper = (input.paper || "white") as KdpPaper;
  const interior = input.interior as KdpInterior;
  if (!getKdpTrimOptions(format).some((trim) => trim.id === trimId)) {
    fieldErrors.trimId = "Choose a trim size KDP offers for this binding.";
  }
  if (!getKdpInteriorOptions(format).includes(interior)) {
    fieldErrors.interior = "Choose an interior KDP offers for this binding.";
  } else if (!getKdpPaperOptions(format, interior).includes(paper)) {
    fieldErrors.paper = "Choose a paper KDP offers for this interior and binding.";
  }
  const channel = format === "hardcover" ? "amazon" : input.channel || "amazon";
  if (channel !== "amazon" && channel !== "expanded") fieldErrors.channel = "Choose Amazon.com or Expanded Distribution.";
  if (!fieldErrors.trimId && !fieldErrors.interior && !fieldErrors.paper) {
    const pageLimit = getKdpPageLimit(trimId, format, interior, paper);
    if (!pageLimit) fieldErrors.interior = "KDP doesn't offer this interior at this trim size.";
    else if (validPages && (printedPages < pageLimit.min || printedPages > pageLimit.max)) {
      fieldErrors.pageCount = `KDP prints ${pageLimit.min} to ${pageLimit.max} pages for this setup.`;
    }
  }
  if (Object.keys(fieldErrors).some((field) => field !== "monthlyGoal")) return { status: "invalid", fieldErrors };

  // The validated trim has a printing cost in the shared US table.
  const printCost = getKdpPrintCost(format, trimId, printedPages, interior, paper)!;
  const printingCents = getKdpPrintingCostCents(printCost, printedPages);
  const costHundredthCents = getKdpPrintingCostHundredthCents(printCost, printedPages);
  const amazonMinimum = getKdpPrintFloorCents(printingCents, costHundredthCents);
  const expandedMinimum = Math.ceil(costHundredthCents / 40);
  const minimumPriceCents = channel === "expanded" ? expandedMinimum : amazonMinimum;
  const minimumKind = channel === "expanded" ? "break-even" : "kdp";
  const answered = answerPrice(enteredPriceCents, minimumPriceCents, KDP_PRINT_MAX_PRICE_CENTS, minimumKind);
  const { priceCents } = answered;
  const amazonAt = (price: number) => getKdpPrintPricePoint(price, printingCents, costHundredthCents);
  const expandedAt = (price: number) => getKdpPrintRoyaltyCents(price, 40, costHundredthCents);
  const rate = channel === "expanded" ? 40 : priceCents >= KDP_ROYALTY_RATES.printThresholdCents ? 60 : 50;
  const royaltyCents = Math.max(0, channel === "expanded" ? expandedAt(priceCents) : amazonAt(priceCents).royaltyCents);
  let comparison: Values["comparison"] = null;
  if (channel === "amazon" && priceCents < KDP_ROYALTY_RATES.printThresholdCents) {
    comparison = {
      kind: "rate-step", priceCents: KDP_ROYALTY_RATES.printThresholdCents, rate: 60,
      royaltyCents: Math.max(0, amazonAt(KDP_ROYALTY_RATES.printThresholdCents).royaltyCents),
    };
  } else if (channel === "expanded") comparison = {
    kind: "other-channel", priceCents, rate: amazonAt(priceCents).royaltyRate,
    royaltyCents: Math.max(0, amazonAt(priceCents).royaltyCents),
  };
  const amazonSeries = {
    id: "amazon" as const, minimum: amazonMinimum, maximum: KDP_PRINT_MAX_PRICE_CENTS,
    royaltyAt: (price: number) => amazonAt(price).royaltyCents,
  };
  return {
    status: "calculated",
    fieldErrors: fieldErrors.monthlyGoal ? { monthlyGoal: fieldErrors.monthlyGoal } : {},
    values: {
      format, channel: channel === "expanded" ? "expanded" : "amazon", plan: null,
      enteredPriceCents, ...answered, rate, seventyOutsideBand: null, deliveryExceedsShare: false,
      royaltyCents, split: { royaltyCents, costCents: printingCents, amazonCents: priceCents - royaltyCents - printingCents },
      costKind: "printing",
      printing: { enteredPages, printedPages, costCents: printingCents, fixedCents: printCost.fixedCents, pageCents: printingCents - printCost.fixedCents },
      delivery: null, minimumPriceCents, minimumKind, maximumPriceCents: KDP_PRINT_MAX_PRICE_CENTS,
      shareBasisPoints: Math.round(royaltyCents * 10_000 / priceCents), comparison,
      goal: goalFor(goalCents, royaltyCents),
      curve: curveFor(priceCents, royaltyCents, KDP_PRINT_MAX_PRICE_CENTS, false, channel === "expanded" ? [
        { id: "expanded", minimum: expandedMinimum, maximum: KDP_PRINT_MAX_PRICE_CENTS, royaltyAt: expandedAt },
        amazonSeries,
      ] : [amazonSeries]),
      rulesVersion: KDP_ROYALTY_VERSION,
    },
  };
}

