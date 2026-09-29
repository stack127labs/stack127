import {
  KDP_SOURCES,
  findKdpTrim,
  getKdpPageLimit,
  round,
  type KdpBinding,
  type KdpInterior,
  type KdpPaper,
} from "./specs.ts";

export type KdpRoyaltyFormat = KdpBinding | "ebook";
export type KdpEbookRoyaltyOption = 35 | 70;

export type KdpRoyaltyInput = Readonly<{
  format: KdpRoyaltyFormat;
  trimId?: string;
  pageCount?: number;
  interior?: KdpInterior;
  paper?: KdpPaper;
  listPrice: number;
  ebookFileSizeMB?: number;
  ebookRoyaltyOption?: KdpEbookRoyaltyOption;
  monthlyTarget?: number;
}>;

export type KdpRoyaltyIssue = Readonly<{
  code: string;
  field?: string;
  severity: "warning" | "error";
  message: string;
}>;

export type KdpPricePoint = Readonly<{
  listPriceCents: number;
  royaltyCents: number;
  royaltyRate: number;
  printingCostCents: number | null;
  deductionCents: number;
  marginBasisPoints: number;
}>;

export type KdpRoyaltyValues = Readonly<{
  format: KdpRoyaltyFormat;
  listPriceCents: number;
  effectivePageCount: number | null;
  minimumListPriceCents: number;
  printingCostCents: number | null;
  fixedCostCents: number | null;
  pageCostCents: number | null;
  deliveryCostCents: number | null;
  royaltyRate: number;
  effectiveRoyaltyRate: number;
  royaltyCents: number;
  royaltyMarginBasisPoints: number;
  breakEvenAdSpendCents: number;
  breakEvenAcosBasisPoints: number | null;
  copiesForMonthlyTarget: number | null;
  monthlyTargetStatus: "omitted" | "calculated" | "unavailable";
  monthlyTargetCents: number | null;
  pricePoints: readonly KdpPricePoint[];
  ebookFileSizeMB: number | null;
  ebookDeliveryRateCentsPerMB: number | null;
  sources: readonly string[];
}>;

export type KdpRoyaltyResult = Readonly<{
  status: "valid" | "invalid";
  values: KdpRoyaltyValues | null;
  issues: readonly KdpRoyaltyIssue[];
}>;

export type KdpPrintCost = Readonly<{ fixedCents: number; perPageDollars: number }>;

/** KDP royalty rates, shared with the platform fee reference so both stay in step. */
export const KDP_ROYALTY_RATES = {
  ebookStandard: 35,
  ebookHigh: 70,
  printAtOrAboveThreshold: 60,
  printBelowThreshold: 50,
  printThresholdCents: 999,
} as const;

const PRINT_ROYALTY_THRESHOLD_CENTS = KDP_ROYALTY_RATES.printThresholdCents;
const PRINT_MAX_PRICE_CENTS = 25_000;
const EBOOK_MAX_PRICE_CENTS = 20_000;
const EBOOK_SEVENTY_MIN_CENTS = 299;
const EBOOK_SEVENTY_MAX_CENTS = 1_299;

export const KDP_PRINT_MAX_PRICE_CENTS = PRINT_MAX_PRICE_CENTS;
export const KDP_EBOOK_MAX_PRICE_CENTS = EBOOK_MAX_PRICE_CENTS;
export const KDP_EBOOK_SEVENTY_MIN_CENTS = EBOOK_SEVENTY_MIN_CENTS;
export const KDP_EBOOK_SEVENTY_MAX_CENTS = EBOOK_SEVENTY_MAX_CENTS;

function issue(code: string, message: string, severity: KdpRoyaltyIssue["severity"] = "error", field?: string): KdpRoyaltyIssue {
  return { code, field, severity, message };
}

function dollarsToCents(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  const cents = Math.round(value * 100);
  return cents >= 1 ? cents : null;
}

function printCost(format: KdpBinding, trimId: string, pageCount: number, interior: KdpInterior, paper: KdpPaper): KdpPrintCost | null {
  const trim = findKdpTrim(trimId);
  if (!trim) return null;
  const large = trim.largeTrim;
  if (format === "hardcover") {
    if (interior === "premium-color") return { fixedCents: 565, perPageDollars: large ? 0.08 : 0.065 };
    if (pageCount <= 108) return { fixedCents: large ? 749 : 680, perPageDollars: 0 };
    return { fixedCents: large ? 565 : 565, perPageDollars: large ? 0.017 : 0.012 };
  }
  if (interior === "standard-color") return { fixedCents: 100, perPageDollars: large ? 0.0402 : 0.0255 };
  if (interior === "premium-color") {
    if (pageCount <= 40) return { fixedCents: large ? 420 : 360, perPageDollars: 0 };
    return { fixedCents: 100, perPageDollars: large ? 0.08 : 0.065 };
  }
  if (paper === "groundwood") {
    if (pageCount <= 112) return { fixedCents: large ? 275 : 223, perPageDollars: 0 };
    return { fixedCents: 100, perPageDollars: large ? 0.0162 : 0.0114 };
  }
  if (pageCount <= 110) return { fixedCents: large ? 284 : 230, perPageDollars: 0 };
  return { fixedCents: 100, perPageDollars: large ? 0.017 : 0.012 };
}

function printingCostCents(cost: KdpPrintCost, pageCount: number): number {
  return cost.fixedCents + Math.round(cost.perPageDollars * 100 * pageCount);
}

function minimumPrintPriceCents(costCents: number): number {
  const fiftyPercentPrice = Math.ceil(costCents * 100 / KDP_ROYALTY_RATES.printBelowThreshold);
  if (fiftyPercentPrice <= PRINT_ROYALTY_THRESHOLD_CENTS - 1) return fiftyPercentPrice;
  return Math.max(PRINT_ROYALTY_THRESHOLD_CENTS, Math.ceil(costCents * 100 / KDP_ROYALTY_RATES.printAtOrAboveThreshold));
}

function ebookMinimumPriceCents(fileSizeMB: number): number {
  if (fileSizeMB < 3) return 99;
  if (fileSizeMB < 10) return 199;
  return 299;
}

function ebookDeliveryCostCents(fileSizeMB: number): number {
  const roundedKilobytes = Math.ceil(fileSizeMB * 1024);
  return Math.max(1, Math.round((roundedKilobytes * 0.15 / 1024) * 100));
}

/** Shared print rules used by the forward and inverse calculators. */
export function getKdpPrintCost(format: KdpBinding, trimId: string, pageCount: number, interior: KdpInterior, paper: KdpPaper): KdpPrintCost | null {
  return printCost(format, trimId, pageCount, interior, paper);
}

export function getKdpPrintingCostCents(cost: KdpPrintCost, pageCount: number): number {
  return printingCostCents(cost, pageCount);
}

export function getKdpPrintFloorCents(costCents: number): number {
  return minimumPrintPriceCents(costCents);
}

export function getKdpEbookFloorCents(fileSizeMB: number): number {
  return ebookMinimumPriceCents(fileSizeMB);
}

export function getKdpEbookDeliveryCents(fileSizeMB: number): number {
  return ebookDeliveryCostCents(fileSizeMB);
}

export function getKdpPrintPricePoint(priceCents: number, printingCents: number): KdpPricePoint {
  const royaltyRate = priceCents >= PRINT_ROYALTY_THRESHOLD_CENTS ? KDP_ROYALTY_RATES.printAtOrAboveThreshold : KDP_ROYALTY_RATES.printBelowThreshold;
  const royaltyCents = Math.round(priceCents * royaltyRate / 100) - printingCents;
  return {
    listPriceCents: priceCents,
    royaltyRate,
    printingCostCents: printingCents,
    deductionCents: printingCents,
    royaltyCents,
    marginBasisPoints: Math.round(royaltyCents * 10_000 / priceCents),
  };
}

export function getKdpEbookPricePoint(priceCents: number, selectedRate: KdpEbookRoyaltyOption, fileSizeMB: number): KdpPricePoint {
  const eligibleFor70 = priceCents >= EBOOK_SEVENTY_MIN_CENTS && priceCents <= EBOOK_SEVENTY_MAX_CENTS;
  const effectiveRate = selectedRate === KDP_ROYALTY_RATES.ebookHigh && eligibleFor70 ? KDP_ROYALTY_RATES.ebookHigh : KDP_ROYALTY_RATES.ebookStandard;
  const deliveryCents = ebookDeliveryCostCents(fileSizeMB);
  const royaltyCents = effectiveRate === KDP_ROYALTY_RATES.ebookHigh
    ? Math.round((priceCents - deliveryCents) * KDP_ROYALTY_RATES.ebookHigh / 100)
    : Math.round(priceCents * KDP_ROYALTY_RATES.ebookStandard / 100);
  const deductionCents = effectiveRate === KDP_ROYALTY_RATES.ebookHigh ? deliveryCents : 0;
  return { listPriceCents: priceCents, royaltyRate: effectiveRate, printingCostCents: null, deductionCents, royaltyCents, marginBasisPoints: Math.round(royaltyCents * 10_000 / priceCents) };
}

function uniquePricePoints(values: number[], min: number, max: number): number[] {
  return [...new Set(values.filter((value) => Number.isInteger(value) && value >= min && value <= max))].sort((a, b) => a - b);
}

function copiesForTarget(target: number | undefined, royaltyCents: number): number | null {
  if (target === undefined || !Number.isFinite(target)) return null;
  if (target === 0) return 0;
  if (target < 0 || royaltyCents <= 0) return null;
  return Math.ceil(target * 100 / royaltyCents);
}

function monthlyTargetStatus(target: number | undefined, royaltyCents: number): KdpRoyaltyValues["monthlyTargetStatus"] {
  if (target === undefined) return "omitted";
  return target === 0 || royaltyCents > 0 ? "calculated" : "unavailable";
}

export function calculateKdpRoyalty(input: KdpRoyaltyInput): KdpRoyaltyResult {
  const issues: KdpRoyaltyIssue[] = [];
  const format = input?.format;
  if (format !== "paperback" && format !== "hardcover" && format !== "ebook") issues.push(issue("format-invalid", "Choose paperback, hardcover, or ebook.", "error", "format"));
  const listPriceCents = dollarsToCents(input?.listPrice);
  if (listPriceCents === null) issues.push(issue("price-invalid", "Enter a positive list price.", "error", "listPrice"));
  const monthlyTarget = input?.monthlyTarget;
  if (monthlyTarget !== undefined && (!Number.isFinite(monthlyTarget) || monthlyTarget < 0)) issues.push(issue("target-invalid", "Enter a zero or positive monthly target.", "error", "monthlyTarget"));
  if (issues.length) return { status: "invalid", values: null, issues };

  if (format === "ebook") {
    const fileSizeMB = input.ebookFileSizeMB;
    const selectedRate = input.ebookRoyaltyOption ?? 70;
    if (!Number.isFinite(fileSizeMB) || (fileSizeMB ?? 0) <= 0) issues.push(issue("file-size-invalid", "Enter the ebook file size in MB.", "error", "ebookFileSizeMB"));
    if (selectedRate !== 35 && selectedRate !== 70) issues.push(issue("ebook-rate-invalid", "Choose the 35% or 70% rate.", "error", "ebookRoyaltyOption"));
    if (issues.length) return { status: "invalid", values: null, issues };
    const size = fileSizeMB as number;
    const minimumPriceCents = ebookMinimumPriceCents(size);
    if ((listPriceCents as number) < minimumPriceCents) issues.push(issue("ebook-price-too-low", `This file size needs a list price of at least $${(minimumPriceCents / 100).toFixed(2)}.`, "error", "listPrice"));
    if ((listPriceCents as number) > EBOOK_MAX_PRICE_CENTS) issues.push(issue("ebook-price-too-high", "Ebook list price cannot exceed $200.", "error", "listPrice"));
    const eligibleFor70 = (listPriceCents as number) >= EBOOK_SEVENTY_MIN_CENTS && (listPriceCents as number) <= EBOOK_SEVENTY_MAX_CENTS;
    if (selectedRate === 70 && !eligibleFor70 && !issues.some((next) => next.severity === "error")) issues.push(issue("ebook-70-price-band", "This price uses the 35% rate instead of the selected 70% band.", "warning", "listPrice"));
    if (issues.some((next) => next.severity === "error")) return { status: "invalid", values: null, issues };
    const deliveryCents = ebookDeliveryCostCents(size);
    const effectiveRate = selectedRate === 70 && eligibleFor70 ? 70 : 35;
    const royaltyCents = getKdpEbookPricePoint(listPriceCents as number, selectedRate, size).royaltyCents;
    const pointPrices = uniquePricePoints([minimumPriceCents, 299, 1_299, 1_300, listPriceCents as number, (listPriceCents as number) + 100], minimumPriceCents, EBOOK_MAX_PRICE_CENTS);
    const pricePoints = pointPrices.map((price) => getKdpEbookPricePoint(price, selectedRate, size));
    return {
      status: "valid",
      values: {
        format,
        listPriceCents: listPriceCents as number,
        effectivePageCount: null,
        minimumListPriceCents: minimumPriceCents,
        printingCostCents: null,
        fixedCostCents: null,
        pageCostCents: null,
        deliveryCostCents: deliveryCents,
        royaltyRate: selectedRate,
        effectiveRoyaltyRate: effectiveRate,
        royaltyCents,
        royaltyMarginBasisPoints: Math.round(royaltyCents * 10_000 / (listPriceCents as number)),
        breakEvenAdSpendCents: Math.max(0, royaltyCents),
        breakEvenAcosBasisPoints: royaltyCents > 0 ? Math.round(royaltyCents * 10_000 / (listPriceCents as number)) : null,
        copiesForMonthlyTarget: copiesForTarget(monthlyTarget, royaltyCents),
        monthlyTargetStatus: monthlyTargetStatus(monthlyTarget, royaltyCents),
        monthlyTargetCents: monthlyTarget === undefined ? null : Math.round(monthlyTarget * 100),
        pricePoints,
        ebookFileSizeMB: size,
        ebookDeliveryRateCentsPerMB: 15,
        sources: [KDP_SOURCES.ebookPricing, KDP_SOURCES.ebookDelivery],
      },
      issues,
    };
  }

  const trimId = input.trimId;
  const pageCount = input.pageCount;
  const interior = input.interior;
  const paper = input.paper;
  if (typeof trimId !== "string" || !findKdpTrim(trimId)) issues.push(issue("trim-invalid", "Choose a supported trim size.", "error", "trimId"));
  if (!Number.isSafeInteger(pageCount) || (pageCount as number) <= 0) issues.push(issue("page-count-invalid", "Enter a positive whole page count.", "error", "pageCount"));
  if (interior !== "black-white" && interior !== "standard-color" && interior !== "premium-color") issues.push(issue("interior-invalid", "Choose a supported interior type.", "error", "interior"));
  if (paper !== "white" && paper !== "cream" && paper !== "groundwood") issues.push(issue("paper-invalid", "Choose a supported paper type.", "error", "paper"));
  if (issues.length) return { status: "invalid", values: null, issues };
  const effectivePageCount = (pageCount as number) + ((pageCount as number) % 2);
  const limit = getKdpPageLimit(trimId as string, format as KdpBinding, interior as KdpInterior, paper as KdpPaper);
  if (!limit) issues.push(issue("trim-not-supported", "That trim and interior combination is not available for this binding.", "error", "trimId"));
  if (limit && (effectivePageCount < limit.min || effectivePageCount > limit.max)) issues.push(issue("page-count-out-of-range", `Use ${limit.min} to ${limit.max} effective pages for this setup.`, "error", "pageCount"));
  const trim = findKdpTrim(trimId as string);
  const print = trim && printCost(format as KdpBinding, trimId as string, effectivePageCount, interior as KdpInterior, paper as KdpPaper);
  if (!print) issues.push(issue("printing-cost-unavailable", "Printing cost is unavailable for this setup.", "error"));
  if (issues.length) return { status: "invalid", values: null, issues };
  const printingCents = printingCostCents(print as KdpPrintCost, effectivePageCount);
  const minimumPriceCents = minimumPrintPriceCents(printingCents);
  if ((listPriceCents as number) > PRINT_MAX_PRICE_CENTS) issues.push(issue("print-price-too-high", "Print list price cannot exceed $250.", "error", "listPrice"));
  if ((listPriceCents as number) < minimumPriceCents) issues.push(issue("below-print-cost-floor", `Set the list price to at least $${(minimumPriceCents / 100).toFixed(2)} to cover printing cost at its eligible rate.`, "error", "listPrice"));
  if (issues.some((next) => next.severity === "error")) return { status: "invalid", values: null, issues };
  const pointPrices = uniquePricePoints([minimumPriceCents, 998, 999, listPriceCents as number, (listPriceCents as number) + 100], minimumPriceCents, PRINT_MAX_PRICE_CENTS);
  const pricePoints = pointPrices.map((price) => getKdpPrintPricePoint(price, printingCents));
  const royaltyRate = (listPriceCents as number) >= PRINT_ROYALTY_THRESHOLD_CENTS ? 60 : 50;
  const royaltyCents = Math.round((listPriceCents as number) * royaltyRate / 100) - printingCents;
  return {
    status: "valid",
    values: {
      format,
      listPriceCents: listPriceCents as number,
      effectivePageCount,
      minimumListPriceCents: minimumPriceCents,
      printingCostCents: printingCents,
      fixedCostCents: (print as KdpPrintCost).fixedCents,
      pageCostCents: printingCents - (print as KdpPrintCost).fixedCents,
      deliveryCostCents: null,
      royaltyRate,
      effectiveRoyaltyRate: royaltyRate,
      royaltyCents,
      royaltyMarginBasisPoints: Math.round(royaltyCents * 10_000 / (listPriceCents as number)),
      breakEvenAdSpendCents: Math.max(0, royaltyCents),
      breakEvenAcosBasisPoints: royaltyCents > 0 ? Math.round(royaltyCents * 10_000 / (listPriceCents as number)) : null,
      copiesForMonthlyTarget: copiesForTarget(monthlyTarget, royaltyCents),
      monthlyTargetStatus: monthlyTargetStatus(monthlyTarget, royaltyCents),
      monthlyTargetCents: monthlyTarget === undefined ? null : Math.round(monthlyTarget * 100),
      pricePoints,
      ebookFileSizeMB: null,
      ebookDeliveryRateCentsPerMB: null,
      sources: [format === "hardcover" ? KDP_SOURCES.hardcoverCosts : KDP_SOURCES.printCosts, format === "hardcover" ? KDP_SOURCES.hardcoverRoyalties : KDP_SOURCES.paperbackRoyalties],
    },
    issues,
  };
}

export function formatKdpMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatKdpPercent(basisPoints: number): string {
  return `${round(basisPoints / 100, 2).toFixed(2).replace(/\.00$/, "")} %`;
}

export const KDP_ROYALTY_VERSION = "2026-09-16";
