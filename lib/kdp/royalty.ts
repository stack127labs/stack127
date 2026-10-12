import {
  findKdpTrim,
  round,
  type KdpBinding,
  type KdpInterior,
  type KdpPaper,
} from "./specs.ts";

export type KdpRoyaltyFormat = KdpBinding | "ebook";
export type KdpEbookRoyaltyOption = 35 | 70;

export type KdpPricePoint = Readonly<{
  listPriceCents: number;
  royaltyCents: number;
  royaltyRate: number;
  printingCostCents: number | null;
  deductionCents: number;
  marginBasisPoints: number;
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

export function parseKdpRoyaltyMoney(raw: string): number {
  const value = raw.trim();
  return /^\$?\d+(?:\.\d{1,2})?$/.test(value) ? Number(value.replace(/^\$/, "")) : Number.NaN;
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
  return Math.floor((getKdpPrintingCostHundredthCents(cost, pageCount) + 50) / 100);
}

function minimumPrintPriceCents(costHundredthCents: number): number {
  const fiftyPercentPrice = Math.round(costHundredthCents / KDP_ROYALTY_RATES.printBelowThreshold);
  if (fiftyPercentPrice <= PRINT_ROYALTY_THRESHOLD_CENTS - 1) return fiftyPercentPrice;
  return Math.max(PRINT_ROYALTY_THRESHOLD_CENTS, Math.round(costHundredthCents / KDP_ROYALTY_RATES.printAtOrAboveThreshold));
}

function ebookMinimumPriceCents(fileSizeMB: number): number {
  if (fileSizeMB < 3) return 99;
  if (fileSizeMB < 10) return 199;
  return 299;
}

function ebookDeliveryCostCents(fileSizeMB: number): number {
  const roundedKilobytes = Math.ceil(fileSizeMB * 1024);
  // 15 cents per 1,024 KB. Add half the denominator before integer division.
  return Math.max(1, Math.floor((roundedKilobytes * 15 + 512) / 1024));
}

/** Shared print rules used by the forward and inverse calculators. */
export function getKdpPrintCost(format: KdpBinding, trimId: string, pageCount: number, interior: KdpInterior, paper: KdpPaper): KdpPrintCost | null {
  return printCost(format, trimId, pageCount, interior, paper);
}

export function getKdpPrintingCostCents(cost: KdpPrintCost, pageCount: number): number {
  return printingCostCents(cost, pageCount);
}

/** Preserve the US table's four decimal places through the print calculations. */
export function getKdpPrintingCostHundredthCents(cost: KdpPrintCost, pageCount: number): number {
  return cost.fixedCents * 100 + Math.round(cost.perPageDollars * 10_000) * pageCount;
}

/** Pass the exact table cost separately from its rounded display value. */
export function getKdpPrintFloorCents(costCents: number, costHundredthCents = costCents * 100): number {
  return minimumPrintPriceCents(costHundredthCents);
}

export function getKdpEbookFloorCents(fileSizeMB: number): number {
  return ebookMinimumPriceCents(fileSizeMB);
}

export function getKdpEbookDeliveryCents(fileSizeMB: number): number {
  return ebookDeliveryCostCents(fileSizeMB);
}

export function getKdpPrintRoyaltyCents(priceCents: number, royaltyRate: number, costHundredthCents: number): number {
  return Math.floor((priceCents * royaltyRate - costHundredthCents + 50) / 100);
}

export function getKdpPrintPricePoint(priceCents: number, printingCents: number, costHundredthCents = printingCents * 100): KdpPricePoint {
  const royaltyRate = priceCents >= PRINT_ROYALTY_THRESHOLD_CENTS ? KDP_ROYALTY_RATES.printAtOrAboveThreshold : KDP_ROYALTY_RATES.printBelowThreshold;
  const royaltyCents = getKdpPrintRoyaltyCents(priceCents, royaltyRate, costHundredthCents);
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

export function formatKdpMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatKdpPercent(basisPoints: number): string {
  return `${round(basisPoints / 100, 2).toFixed(2).replace(/\.00$/, "")} %`;
}

export const KDP_ROYALTY_VERSION = "2026-09-16";
