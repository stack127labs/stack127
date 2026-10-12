import {
  KDP_EBOOK_MAX_PRICE_CENTS,
  KDP_EBOOK_SEVENTY_MAX_CENTS,
  KDP_EBOOK_SEVENTY_MIN_CENTS,
  KDP_PRINT_MAX_PRICE_CENTS,
  KDP_ROYALTY_VERSION,
  getKdpEbookDeliveryCents,
  getKdpEbookFloorCents,
  getKdpEbookPricePoint,
  getKdpPrintCost,
  getKdpPrintFloorCents,
  getKdpPrintPricePoint,
  getKdpPrintingCostCents,
  getKdpPrintingCostHundredthCents,
  type KdpEbookRoyaltyOption,
  type KdpRoyaltyFormat,
} from "./royalty.ts";
import {
  KDP_SPEC_VERSION,
  KDP_SOURCES,
  findKdpTrim,
  getKdpPageLimit,
  getKdpTrimOptions,
  type KdpBinding,
  type KdpInterior,
  type KdpPaper,
} from "./specs.ts";

export const KDP_MINIMUM_PRICE_RULES_REVIEWED_DATE = "2026-09-28";

export type KdpMinimumPriceField =
  | "format"
  | "trimId"
  | "interiorPaper"
  | "pageCount"
  | "ebookRoyaltyOption"
  | "ebookFileSizeMB"
  | "desiredRoyalty";

export type KdpMinimumPriceInput = Readonly<{
  format: string;
  trimId: string;
  interior: string;
  paper: string;
  pageCountText: string;
  ebookRoyaltyOption: number;
  ebookFileSizeText: string;
  desiredRoyaltyText: string;
}>;

export type KdpMinimumPriceSource = Readonly<{ label: string; url: string }>;

type CommonValues = Readonly<{
  format: KdpRoyaltyFormat;
  minimumPriceCents: number;
  maximumPriceCents: number;
  goalCents: number | null;
  enteredPageCount: number | null;
  effectivePageCount: number | null;
  deductionType: "printing cost" | "delivery deduction" | "none";
  deductionCents: number;
  selectedEbookOption: KdpEbookRoyaltyOption | null;
  royaltyRuleVersion: string;
  printSetupVersion: string;
  rulesReviewedDate: string;
  sources: readonly KdpMinimumPriceSource[];
}>;

export type KdpMinimumPriceResult =
  | Readonly<{
      status: "invalid";
      fieldErrors: Partial<Record<KdpMinimumPriceField, string>>;
    }>
  | Readonly<{
      status: "failure";
      message: string;
    }>
  | Readonly<{
      status: "available";
      values: CommonValues & Readonly<{
        priceCents: number;
        royaltyCents: number;
        royaltyRate: number;
      }>;
    }>
  | Readonly<{
      status: "unreachable";
      values: CommonValues & Readonly<{
        highestRoyaltyCents: number;
      }>;
    }>;

export type ParsedKdpMinimumGoal = Readonly<{ kind: "blank" }> | Readonly<{ kind: "invalid" }> | Readonly<{ kind: "value"; value: number }>;

export function parseKdpMinimumPageCount(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d+$/.test(value)) return null;
  const count = Number(value);
  return Number.isSafeInteger(count) && count > 0 ? count : null;
}

export function parseKdpMinimumEbookFileSizeMB(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d+(?:\.\d{1,3})?$/.test(value)) return null;
  const fileSizeMB = Number(value);
  return Number.isFinite(fileSizeMB) && fileSizeMB >= 0.001 && fileSizeMB <= 650 ? fileSizeMB : null;
}

export function parseKdpMinimumGoalCents(raw: string): ParsedKdpMinimumGoal {
  const value = raw.trim();
  if (!value) return { kind: "blank" };
  const match = /^\$?(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) return { kind: "invalid" };
  const whole = match[1].replace(/^0+(?=\d)/, "");
  if (whole.length > 7) return { kind: "invalid" };
  const cents = Number(whole) * 100 + Number((match[2] ?? "").padEnd(2, "0") || 0);
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > 100_000_000) return { kind: "invalid" };
  return { kind: "value", value: cents };
}

export function formatKdpMinimumMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(cents / 100);
}

function sourcesFor(format: KdpRoyaltyFormat): KdpMinimumPriceSource[] {
  if (format === "ebook") {
    return [
      { label: "eBook list price requirements", url: KDP_SOURCES.ebookPricing },
      { label: "Digital Book Pricing", url: KDP_SOURCES.ebookDelivery },
    ];
  }
  return format === "hardcover"
    ? [
        { label: "Hardcover printing costs and royalties", url: KDP_SOURCES.hardcoverCosts },
        { label: "Hardcover royalties", url: KDP_SOURCES.hardcoverRoyalties },
      ]
    : [
        { label: "Paperback printing costs", url: KDP_SOURCES.printCosts },
        { label: "Paperback royalties", url: KDP_SOURCES.paperbackRoyalties },
      ];
}

function parseGoal(raw: string, fieldErrors: Partial<Record<KdpMinimumPriceField, string>>): number | null {
  const parsed = parseKdpMinimumGoalCents(raw);
  if (parsed.kind === "invalid") {
    fieldErrors.desiredRoyalty = "Enter a USD amount from $0.00 to $1,000,000.00, with up to two decimal places.";
    return null;
  }
  return parsed.kind === "value" ? parsed.value : null;
}

function invalid(fieldErrors: Partial<Record<KdpMinimumPriceField, string>>): KdpMinimumPriceResult {
  return { status: "invalid", fieldErrors };
}

function unavailable(message: string): KdpMinimumPriceResult {
  return { status: "failure", message };
}

function commonValues(
  format: KdpRoyaltyFormat,
  minimumPriceCents: number,
  maximumPriceCents: number,
  goalCents: number | null,
  enteredPageCount: number | null,
  effectivePageCount: number | null,
  deductionType: CommonValues["deductionType"],
  deductionCents: number,
  selectedEbookOption: KdpEbookRoyaltyOption | null,
): CommonValues {
  return {
    deductionCents,
    deductionType,
    effectivePageCount,
    enteredPageCount,
    format,
    goalCents,
    maximumPriceCents,
    minimumPriceCents,
    printSetupVersion: KDP_SPEC_VERSION,
    royaltyRuleVersion: KDP_ROYALTY_VERSION,
    rulesReviewedDate: KDP_MINIMUM_PRICE_RULES_REVIEWED_DATE,
    selectedEbookOption,
    sources: sourcesFor(format),
  };
}

function calculatePrint(input: KdpMinimumPriceInput, goalCents: number | null): KdpMinimumPriceResult {
  const fieldErrors: Partial<Record<KdpMinimumPriceField, string>> = {};
  const format = input.format;
  if (format !== "paperback" && format !== "hardcover") {
    fieldErrors.format = "Choose paperback, hardcover, or Kindle ebook.";
    return invalid(fieldErrors);
  }

  const trim = findKdpTrim(input.trimId);
  if (!trim || !getKdpTrimOptions(format as KdpBinding).some((option) => option.id === input.trimId)) {
    fieldErrors.trimId = "Choose a supported trim size for this binding.";
  }
  if (input.interior !== "black-white" && input.interior !== "standard-color" && input.interior !== "premium-color") {
    fieldErrors.interiorPaper = "Choose an interior and paper profile available for this trim.";
  }
  if (input.paper !== "white" && input.paper !== "cream" && input.paper !== "groundwood") {
    fieldErrors.interiorPaper = "Choose an interior and paper profile available for this trim.";
  }
  const pageCount = parseKdpMinimumPageCount(input.pageCountText);
  if (pageCount === null) fieldErrors.pageCount = "Enter a positive whole page count using digits only.";
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  const interior = input.interior as KdpInterior;
  const paper = input.paper as KdpPaper;
  const effectivePageCount = (pageCount as number) + ((pageCount as number) % 2);
  const pageLimit = getKdpPageLimit(input.trimId, format, interior, paper);
  if (!pageLimit) {
    return invalid({ interiorPaper: "Choose an interior and paper profile available for this trim." });
  }
  if (effectivePageCount < pageLimit.min || effectivePageCount > pageLimit.max) {
    return invalid({ pageCount: `Use ${pageLimit.min} to ${pageLimit.max} effective pages for this setup.` });
  }

  const printCost = getKdpPrintCost(format, input.trimId, effectivePageCount, interior, paper);
  if (!printCost) return unavailable("A US KDP print cost rule is missing for this setup. Check the KDP rules and try again.");
  const printingCostCents = getKdpPrintingCostCents(printCost, effectivePageCount);
  const costHundredthCents = getKdpPrintingCostHundredthCents(printCost, effectivePageCount);
  if (!Number.isSafeInteger(printingCostCents) || printingCostCents < 0) {
    return unavailable("A US KDP print cost rule could not be calculated. Check the KDP rules and try again.");
  }

  const minimumPriceCents = getKdpPrintFloorCents(printingCostCents, costHundredthCents);
  if (!Number.isSafeInteger(minimumPriceCents) || minimumPriceCents > KDP_PRINT_MAX_PRICE_CENTS) {
    return unavailable("This print setup's modeled minimum exceeds KDP's $250.00 maximum. Change the print setup.");
  }

  let priceCents = minimumPriceCents;
  if (goalCents !== null) {
    priceCents = 0;
    for (let candidate = minimumPriceCents; candidate <= KDP_PRINT_MAX_PRICE_CENTS; candidate += 1) {
      if (getKdpPrintPricePoint(candidate, printingCostCents, costHundredthCents).royaltyCents >= goalCents) {
        priceCents = candidate;
        break;
      }
    }
    if (priceCents === 0) {
      const highest = getKdpPrintPricePoint(KDP_PRINT_MAX_PRICE_CENTS, printingCostCents, costHundredthCents);
      return {
        status: "unreachable",
        values: {
          ...commonValues(format, minimumPriceCents, KDP_PRINT_MAX_PRICE_CENTS, goalCents, pageCount as number, effectivePageCount, "printing cost", printingCostCents, null),
          highestRoyaltyCents: highest.royaltyCents,
        },
      };
    }
  }

  const point = getKdpPrintPricePoint(priceCents, printingCostCents, costHundredthCents);
  return {
    status: "available",
    values: {
      ...commonValues(format, minimumPriceCents, KDP_PRINT_MAX_PRICE_CENTS, goalCents, pageCount as number, effectivePageCount, "printing cost", printingCostCents, null),
      priceCents,
      royaltyCents: point.royaltyCents,
      royaltyRate: point.royaltyRate,
    },
  };
}

function calculateEbook(input: KdpMinimumPriceInput, goalCents: number | null): KdpMinimumPriceResult {
  if (input.ebookRoyaltyOption !== 35 && input.ebookRoyaltyOption !== 70) {
    return invalid({ ebookRoyaltyOption: "Choose the 35% or 70% royalty option." });
  }
  const fileSizeMB = parseKdpMinimumEbookFileSizeMB(input.ebookFileSizeText);
  if (fileSizeMB === null) {
    return invalid({ ebookFileSizeMB: "Enter a file size from 0.001 to 650 MB, with up to three decimal places." });
  }

  const selectedRate = input.ebookRoyaltyOption as KdpEbookRoyaltyOption;
  const minimumPriceCents = selectedRate === 70 ? KDP_EBOOK_SEVENTY_MIN_CENTS : getKdpEbookFloorCents(fileSizeMB);
  const maximumPriceCents = selectedRate === 70 ? KDP_EBOOK_SEVENTY_MAX_CENTS : KDP_EBOOK_MAX_PRICE_CENTS;
  const deliveryCents = getKdpEbookDeliveryCents(fileSizeMB);
  if (!Number.isSafeInteger(minimumPriceCents) || !Number.isSafeInteger(maximumPriceCents) || !Number.isSafeInteger(deliveryCents)) {
    return unavailable("A US KDP eBook pricing rule could not be calculated. Check the KDP rules and try again.");
  }

  let priceCents = minimumPriceCents;
  if (goalCents !== null) {
    priceCents = 0;
    for (let candidate = minimumPriceCents; candidate <= maximumPriceCents; candidate += 1) {
      if (getKdpEbookPricePoint(candidate, selectedRate, fileSizeMB).royaltyCents >= goalCents) {
        priceCents = candidate;
        break;
      }
    }
    if (priceCents === 0) {
      const highest = getKdpEbookPricePoint(maximumPriceCents, selectedRate, fileSizeMB);
      return {
        status: "unreachable",
        values: {
          ...commonValues("ebook", minimumPriceCents, maximumPriceCents, goalCents, null, null, selectedRate === 70 ? "delivery deduction" : "none", selectedRate === 70 ? deliveryCents : 0, selectedRate),
          highestRoyaltyCents: highest.royaltyCents,
        },
      };
    }
  }

  const point = getKdpEbookPricePoint(priceCents, selectedRate, fileSizeMB);
  return {
    status: "available",
    values: {
      ...commonValues("ebook", minimumPriceCents, maximumPriceCents, goalCents, null, null, selectedRate === 70 ? "delivery deduction" : "none", selectedRate === 70 ? deliveryCents : 0, selectedRate),
      priceCents,
      royaltyCents: point.royaltyCents,
      royaltyRate: selectedRate,
    },
  };
}

export function calculateKdpMinimumListPrice(input: KdpMinimumPriceInput): KdpMinimumPriceResult {
  if (!KDP_ROYALTY_VERSION || !KDP_SPEC_VERSION) {
    return unavailable("Versioned US KDP pricing rules are unavailable. Reload and try again after the rule data is restored.");
  }
  if (input.format !== "paperback" && input.format !== "hardcover" && input.format !== "ebook") {
    return invalid({ format: "Choose paperback, hardcover, or Kindle ebook." });
  }

  const fieldErrors: Partial<Record<KdpMinimumPriceField, string>> = {};
  const goalCents = parseGoal(input.desiredRoyaltyText, fieldErrors);
  if (Object.keys(fieldErrors).length) return invalid(fieldErrors);

  try {
    return input.format === "ebook" ? calculateEbook(input, goalCents) : calculatePrint(input, goalCents);
  } catch {
    return unavailable("Could not calculate from the current KDP rules. Reload and try again.");
  }
}
