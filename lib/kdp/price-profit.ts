import {
  KDP_PRINT_MAX_PRICE_CENTS,
  KDP_ROYALTY_VERSION,
  getKdpPrintCost,
  getKdpPrintFloorCents,
  getKdpPrintPricePoint,
  getKdpPrintingCostCents,
  getKdpPrintingCostHundredthCents,
} from "./royalty.ts";
import {
  KDP_SOURCES,
  KDP_SPEC_VERSION,
  bindingLabel,
  findKdpTrim,
  getKdpInteriorOptions,
  getKdpPageLimit,
  getKdpPaperOptions,
  getKdpTrimOptions,
  interiorLabel,
  paperLabel,
  type KdpBinding,
  type KdpInterior,
  type KdpPaper,
  type KdpTrimSpec,
} from "./specs.ts";

export const KDP_PRICE_PROFIT_RULES_REVIEWED_DATE = "2026-09-28";
const MAX_PRINT_PAGES = 828;
const MAX_PLANNED_COPIES = 1_000_000;
const MAX_OTHER_COST_PER_SALE_CENTS = 100_000;
const MAX_ONE_TIME_COST_CENTS = 10_000_000;

export type KdpPriceProfitOptionInput = Readonly<{
  id: string;
  binding: string;
  trimId: string;
  interior: string;
  paper: string;
  pageCountText: string;
  otherCostPerSaleText: string;
  oneTimeCostText: string;
}>;

export type KdpPriceProfitInput = Readonly<{
  listPriceText: string;
  options: readonly KdpPriceProfitOptionInput[];
  includeCosts: boolean;
  plannedCopiesText: string;
}>;

export type KdpPriceProfitSource = Readonly<{ label: string; url: string }>;
export type KdpPriceProfitFieldErrors = Readonly<Record<string, string>>;

export type KdpPriceProfitRow = Readonly<{
  id: string;
  optionNumber: number;
  binding: KdpBinding;
  trimId: string;
  trimLabel: string;
  interior: KdpInterior;
  paper: KdpPaper;
  enteredPageCount: number;
  effectivePageCount: number;
  printingCostCents: number;
  minimumPriceCents: number;
  eligible: boolean;
  royaltyRate: number | null;
  royaltyCents: number | null;
  otherCostPerSaleCents: number | null;
  oneTimeCostCents: number | null;
  profitCents: number | null;
}>;

export type KdpPriceProfitResult =
  | Readonly<{ status: "invalid"; fieldErrors: KdpPriceProfitFieldErrors }>
  | Readonly<{ status: "unavailable"; message: string }>
  | Readonly<{
      status: "calculated";
      values: Readonly<{
        listPriceCents: number;
        includeCosts: boolean;
        plannedCopies: number | null;
        eligibleCount: number;
        sharedRoyaltyRate: number | null;
        rulesVersion: string;
        printSetupVersion: string;
        rulesReviewedDate: string;
        sources: readonly KdpPriceProfitSource[];
        rows: readonly KdpPriceProfitRow[];
      }>;
    }>;

export type KdpPriceProfitOptionField = "binding" | "trimId" | "interiorPaper" | "pageCount" | "otherCostPerSale" | "oneTimeCost";

export function kdpPriceProfitOptionFieldKey(id: string, field: KdpPriceProfitOptionField): string {
  return `option.${id}.${field}`;
}

export function parseKdpPriceProfitWholeNumber(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseKdpPriceProfitMoneyCents(raw: string): number | null {
  const value = raw.trim();
  const match = /^\$?(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return null;
  const dollars = Number(match[1]);
  const cents = Number((match[2] ?? "").padEnd(2, "0") || "0");
  const total = dollars * 100 + cents;
  return Number.isSafeInteger(total) ? total : null;
}

export function formatKdpPriceProfitMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function invalid(fieldErrors: Record<string, string>): KdpPriceProfitResult {
  return { status: "invalid", fieldErrors };
}

function unavailable(message: string): KdpPriceProfitResult {
  return { status: "unavailable", message };
}

function sourcesFor(bindings: readonly KdpBinding[]): KdpPriceProfitSource[] {
  const sources: Record<KdpBinding, KdpPriceProfitSource[]> = {
    paperback: [
      { label: "Paperback printing costs", url: KDP_SOURCES.printCosts },
      { label: "Paperback royalties", url: KDP_SOURCES.paperbackRoyalties },
      { label: "Paperback submission guidelines", url: KDP_SOURCES.paperbackSubmission },
    ],
    hardcover: [
      { label: "Hardcover printing costs", url: KDP_SOURCES.hardcoverCosts },
      { label: "Hardcover royalties", url: KDP_SOURCES.hardcoverRoyalties },
      { label: "Hardcover submission guidelines", url: KDP_SOURCES.hardcoverSubmission },
    ],
  };
  const seen = new Set<string>();
  return bindings.flatMap((binding) => sources[binding]).filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

type ValidatedOption = Readonly<{
  input: KdpPriceProfitOptionInput;
  binding: KdpBinding;
  trim: KdpTrimSpec;
  interior: KdpInterior;
  paper: KdpPaper;
  enteredPageCount: number;
  effectivePageCount: number;
  otherCostPerSaleCents: number | null;
  oneTimeCostCents: number | null;
}>;

function parseBoundedMoney(
  raw: string,
  minimum: number,
  maximum: number,
  key: string,
  label: string,
  errors: Record<string, string>,
): number | null {
  const cents = parseKdpPriceProfitMoneyCents(raw);
  if (cents === null || cents < minimum || cents > maximum) {
    errors[key] = `Enter ${label} from ${formatKdpPriceProfitMoney(minimum)} to ${formatKdpPriceProfitMoney(maximum)}, with up to two decimal places.`;
    return null;
  }
  return cents;
}

function parseBoundedWhole(
  raw: string,
  minimum: number,
  maximum: number,
  key: string,
  label: string,
  errors: Record<string, string>,
): number | null {
  const value = parseKdpPriceProfitWholeNumber(raw);
  if (value === null || value < minimum || value > maximum) {
    errors[key] = `Enter ${label} as a whole number from ${minimum.toLocaleString("en-US")} to ${maximum.toLocaleString("en-US")}.`;
    return null;
  }
  return value;
}

export function calculateKdpPriceProfit(input: KdpPriceProfitInput): KdpPriceProfitResult {
  if (!KDP_SPEC_VERSION || !KDP_ROYALTY_VERSION) {
    return unavailable("The versioned KDP print rules are unavailable. Reload and try again.");
  }

  const errors: Record<string, string> = {};
  const priceCents = parseBoundedMoney(input.listPriceText, 1, KDP_PRINT_MAX_PRICE_CENTS, "listPrice", "a list price", errors);
  if (!Array.isArray(input.options) || input.options.length < 2 || input.options.length > 3) {
    errors.optionCount = "Compare two or three print options.";
    return invalid(errors);
  }

  const normalized: ValidatedOption[] = [];
  const bindings: KdpBinding[] = [];
  for (const option of input.options) {
    const binding = option.binding;
    const bindingValid = binding === "paperback" || binding === "hardcover";
    if (!bindingValid) {
      errors[kdpPriceProfitOptionFieldKey(option.id, "binding")] = "Choose paperback or hardcover.";
      continue;
    }

    const typedBinding = binding as KdpBinding;
    bindings.push(typedBinding);
    const trim = findKdpTrim(option.trimId);
    if (!trim || !getKdpTrimOptions(typedBinding).some((candidate) => candidate.id === option.trimId)) {
      errors[kdpPriceProfitOptionFieldKey(option.id, "trimId")] = `Choose a trim size supported for ${bindingLabel(typedBinding).toLowerCase()}.`;
    }

    const interiorOptions = getKdpInteriorOptions(typedBinding);
    const interiorValid = interiorOptions.includes(option.interior as KdpInterior);
    const paperValid = interiorValid && getKdpPaperOptions(typedBinding, option.interior as KdpInterior).includes(option.paper as KdpPaper);
    const profileSupported = Boolean(trim && interiorValid && paperValid && getKdpPageLimit(option.trimId, typedBinding, option.interior as KdpInterior, option.paper as KdpPaper));
    if (!profileSupported) {
      errors[kdpPriceProfitOptionFieldKey(option.id, "interiorPaper")] = "Choose an interior and paper profile supported for this binding and trim.";
    }

    const enteredPageCount = parseBoundedWhole(option.pageCountText, 1, MAX_PRINT_PAGES, kdpPriceProfitOptionFieldKey(option.id, "pageCount"), "printed pages", errors);
    let effectivePageCount: number | null = null;
    const pageField = kdpPriceProfitOptionFieldKey(option.id, "pageCount");
    if (enteredPageCount !== null) {
      effectivePageCount = enteredPageCount + (enteredPageCount % 2);
      const pageLimit = profileSupported ? getKdpPageLimit(option.trimId, typedBinding, option.interior as KdpInterior, option.paper as KdpPaper) : null;
      if (pageLimit && (effectivePageCount < pageLimit.min || effectivePageCount > pageLimit.max)) {
        errors[pageField] = `Use ${pageLimit.min} to ${pageLimit.max} effective pages for this print setup.`;
      }
    }

    let otherCostPerSaleCents: number | null = null;
    let oneTimeCostCents: number | null = null;
    if (input.includeCosts) {
      otherCostPerSaleCents = parseBoundedMoney(
        option.otherCostPerSaleText,
        0,
        MAX_OTHER_COST_PER_SALE_CENTS,
        kdpPriceProfitOptionFieldKey(option.id, "otherCostPerSale"),
        "other cost per sale",
        errors,
      );
      oneTimeCostCents = parseBoundedMoney(
        option.oneTimeCostText,
        0,
        MAX_ONE_TIME_COST_CENTS,
        kdpPriceProfitOptionFieldKey(option.id, "oneTimeCost"),
        "one-time cost",
        errors,
      );
    }

    const optionHasErrors = Boolean(
      errors[kdpPriceProfitOptionFieldKey(option.id, "binding")]
      || errors[kdpPriceProfitOptionFieldKey(option.id, "trimId")]
      || errors[kdpPriceProfitOptionFieldKey(option.id, "interiorPaper")]
      || errors[pageField]
      || (input.includeCosts && (
        errors[kdpPriceProfitOptionFieldKey(option.id, "otherCostPerSale")]
        || errors[kdpPriceProfitOptionFieldKey(option.id, "oneTimeCost")]
      )),
    );
    if (!trim || !profileSupported || enteredPageCount === null || effectivePageCount === null || optionHasErrors) continue;

    normalized.push({
      input: option,
      binding: typedBinding,
      trim,
      interior: option.interior as KdpInterior,
      paper: option.paper as KdpPaper,
      enteredPageCount,
      effectivePageCount,
      otherCostPerSaleCents,
      oneTimeCostCents,
    });
  }

  let plannedCopies: number | null = null;
  if (input.includeCosts) {
    plannedCopies = parseBoundedWhole(input.plannedCopiesText, 1, MAX_PLANNED_COPIES, "plannedCopies", "planned copies", errors);
  }

  if (Object.keys(errors).length) return invalid(errors);
  if (priceCents === null || normalized.length !== input.options.length) {
    return unavailable("Could not compare these options with the current KDP rules. Reload and try again.");
  }

  const rows: KdpPriceProfitRow[] = [];
  for (const [index, option] of normalized.entries()) {
    const printCost = getKdpPrintCost(option.binding, option.input.trimId, option.effectivePageCount, option.interior, option.paper);
    if (!printCost) {
      return unavailable("A KDP printing cost rule is missing for one of these options. Check the current KDP tables and try again.");
    }
    const printingCostCents = getKdpPrintingCostCents(printCost, option.effectivePageCount);
    const costHundredthCents = getKdpPrintingCostHundredthCents(printCost, option.effectivePageCount);
    if (!Number.isSafeInteger(printingCostCents) || printingCostCents < 0) {
      return unavailable("A print cost could not be calculated from the current KDP rules. Reload and try again.");
    }
    const minimumPriceCents = getKdpPrintFloorCents(printingCostCents, costHundredthCents);
    if (!Number.isSafeInteger(minimumPriceCents) || minimumPriceCents < 1) {
      return unavailable("A KDP minimum price could not be calculated for one of these options. Reload and try again.");
    }
    if (minimumPriceCents > KDP_PRINT_MAX_PRICE_CENTS) {
      return unavailable(`Option ${index + 1}'s modeled floor exceeds KDP's $250.00 maximum. Change this print setup.`);
    }

    const eligible = priceCents >= minimumPriceCents;
    const point = eligible ? getKdpPrintPricePoint(priceCents, printingCostCents, costHundredthCents) : null;
    const profitCents = input.includeCosts && eligible
      ? (plannedCopies as number) * ((point as NonNullable<typeof point>).royaltyCents - (option.otherCostPerSaleCents as number)) - (option.oneTimeCostCents as number)
      : null;
    rows.push({
      id: option.input.id,
      optionNumber: index + 1,
      binding: option.binding,
      trimId: option.input.trimId,
      trimLabel: option.trim.label,
      interior: option.interior,
      paper: option.paper,
      enteredPageCount: option.enteredPageCount,
      effectivePageCount: option.effectivePageCount,
      printingCostCents,
      minimumPriceCents,
      eligible,
      royaltyRate: point?.royaltyRate ?? null,
      royaltyCents: point?.royaltyCents ?? null,
      otherCostPerSaleCents: input.includeCosts ? option.otherCostPerSaleCents : null,
      oneTimeCostCents: input.includeCosts ? option.oneTimeCostCents : null,
      profitCents,
    });
  }

  const eligibleRows = rows.filter((row) => row.eligible);
  const rate = eligibleRows[0]?.royaltyRate ?? null;
  const rateConsistent = eligibleRows.every((row) => row.royaltyRate === rate);
  if (rows.some((row) => row.eligible && row.royaltyCents !== null && !Number.isSafeInteger(row.royaltyCents))) {
    return unavailable("A royalty could not be calculated from the current KDP rules. Reload and try again.");
  }
  if (rows.some((row) => row.profitCents !== null && !Number.isSafeInteger(row.profitCents))) {
    return unavailable("A profit estimate exceeded the supported calculation range. Check the entered costs and try again.");
  }

  return {
    status: "calculated",
    values: {
      listPriceCents: priceCents,
      includeCosts: input.includeCosts,
      plannedCopies,
      eligibleCount: eligibleRows.length,
      sharedRoyaltyRate: rateConsistent ? rate : null,
      rulesVersion: KDP_ROYALTY_VERSION,
      printSetupVersion: KDP_SPEC_VERSION,
      rulesReviewedDate: KDP_PRICE_PROFIT_RULES_REVIEWED_DATE,
      sources: sourcesFor(bindings),
      rows,
    },
  };
}
