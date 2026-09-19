export type KdpBinding = "paperback" | "hardcover";
export type KdpInterior = "black-white" | "standard-color" | "premium-color";
export type KdpPaper = "white" | "cream" | "groundwood";
export type KdpUnit = "in" | "mm";
export type KdpDirection = "ltr" | "rtl";

export type KdpPageLimit = Readonly<{ min: number; max: number }>;

export type KdpTrimSpec = Readonly<{
  id: string;
  label: string;
  widthInches: number;
  heightInches: number;
  largeTrim: boolean;
  paperbackLimits: Partial<Record<KdpInterior, Partial<Record<KdpPaper, KdpPageLimit>>>>;
  hardcover: boolean;
}>;

export const KDP_SPEC_VERSION = "2026-09-16";
export const KDP_DPI_DEFAULT = 300;
export const KDP_MAX_FILE_MB = 650;
export const KDP_PAPERBACK_COVER_BLEED_INCHES = 0.125;
export const KDP_HARDCOVER_WRAP_INCHES = 0.51;
export const KDP_HARDCOVER_HINGE_INCHES = 0.4;

export const KDP_SOURCES = {
  paperbackSubmission: "https://kdp.amazon.com/en_US/help/topic/G201857950",
  paperbackCover: "https://kdp.amazon.com/en_US/help/topic/G201953020",
  hardcoverSubmission: "https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6",
  hardcoverCover: "https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6",
  printCosts: "https://kdp.amazon.com/en_US/help/topic/G201834340",
  paperbackRoyalties: "https://kdp.amazon.com/en_US/help/topic/G201834330",
  hardcoverRoyalties: "https://kdp.amazon.com/en_US/help/topic/G77F3WPD3KQLJTFS",
  hardcoverCosts: "https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H",
  ebookPricing: "https://kdp.amazon.com/en_US/help/topic/G200634560",
  ebookDelivery: "https://kdp.amazon.com/en_US/help/topic/G200634500",
  metadata: "https://kdp.amazon.com/en_US/help/topic/G201097560",
  descriptionHtml: "https://kdp.amazon.com/en_US/help/topic/G201189630",
  keywords: "https://kdp.amazon.com/en_US/help/topic/G201298500",
} as const;

const COMMON_BLACK_WHITE: KdpTrimSpec["paperbackLimits"] = {
  "black-white": {
    white: { min: 24, max: 828 },
    cream: { min: 24, max: 776 },
    groundwood: { min: 24, max: 812 },
  },
  "standard-color": { white: { min: 72, max: 600 } },
  "premium-color": { white: { min: 24, max: 828 } },
};

function limits(overrides: KdpTrimSpec["paperbackLimits"] = {}): KdpTrimSpec["paperbackLimits"] {
  return {
    ...COMMON_BLACK_WHITE,
    ...overrides,
  };
}

export const KDP_TRIMS: readonly KdpTrimSpec[] = [
  { id: "5x8", label: "5 × 8 in", widthInches: 5, heightInches: 8, largeTrim: false, paperbackLimits: limits(), hardcover: false },
  { id: "5.06x7.81", label: "5.06 × 7.81 in", widthInches: 5.06, heightInches: 7.81, largeTrim: false, paperbackLimits: limits(), hardcover: false },
  { id: "5.25x8", label: "5.25 × 8 in", widthInches: 5.25, heightInches: 8, largeTrim: false, paperbackLimits: limits(), hardcover: false },
  { id: "5.5x8.5", label: "5.5 × 8.5 in", widthInches: 5.5, heightInches: 8.5, largeTrim: false, paperbackLimits: limits(), hardcover: true },
  { id: "6x9", label: "6 × 9 in", widthInches: 6, heightInches: 9, largeTrim: false, paperbackLimits: limits(), hardcover: true },
  { id: "6.14x9.21", label: "6.14 × 9.21 in", widthInches: 6.14, heightInches: 9.21, largeTrim: true, paperbackLimits: limits(), hardcover: true },
  { id: "6.69x9.61", label: "6.69 × 9.61 in", widthInches: 6.69, heightInches: 9.61, largeTrim: true, paperbackLimits: limits(), hardcover: false },
  { id: "7x10", label: "7 × 10 in", widthInches: 7, heightInches: 10, largeTrim: true, paperbackLimits: limits(), hardcover: true },
  { id: "7.44x9.69", label: "7.44 × 9.69 in", widthInches: 7.44, heightInches: 9.69, largeTrim: true, paperbackLimits: limits(), hardcover: false },
  { id: "7.5x9.25", label: "7.5 × 9.25 in", widthInches: 7.5, heightInches: 9.25, largeTrim: true, paperbackLimits: limits(), hardcover: false },
  { id: "8x10", label: "8 × 10 in", widthInches: 8, heightInches: 10, largeTrim: true, paperbackLimits: limits(), hardcover: false },
  { id: "8.25x11", label: "8.25 × 11 in", widthInches: 8.25, heightInches: 11, largeTrim: true, paperbackLimits: {}, hardcover: true },
  {
    id: "8.25x6",
    label: "8.25 × 6 in",
    widthInches: 8.25,
    heightInches: 6,
    largeTrim: true,
    paperbackLimits: limits({
      "black-white": { white: { min: 24, max: 800 }, cream: { min: 24, max: 750 }, groundwood: { min: 24, max: 784 } },
      "standard-color": { white: { min: 72, max: 600 } },
      "premium-color": { white: { min: 24, max: 800 } },
    }),
    hardcover: false,
  },
  {
    id: "8.25x8.25",
    label: "8.25 × 8.25 in",
    widthInches: 8.25,
    heightInches: 8.25,
    largeTrim: true,
    paperbackLimits: limits({
      "black-white": { white: { min: 24, max: 800 }, cream: { min: 24, max: 750 }, groundwood: { min: 24, max: 784 } },
      "standard-color": { white: { min: 72, max: 600 } },
      "premium-color": { white: { min: 24, max: 800 } },
    }),
    hardcover: false,
  },
  {
    id: "8.27x11.69",
    label: "8.27 × 11.69 in",
    widthInches: 8.27,
    heightInches: 11.69,
    largeTrim: true,
    paperbackLimits: limits({
      "black-white": { white: { min: 24, max: 780 }, cream: { min: 24, max: 730 }, groundwood: { min: 24, max: 764 } },
      "standard-color": {},
      "premium-color": { white: { min: 24, max: 590 } },
    }),
    hardcover: false,
  },
  {
    id: "8.5x8.5",
    label: "8.5 × 8.5 in",
    widthInches: 8.5,
    heightInches: 8.5,
    largeTrim: true,
    paperbackLimits: limits({
      "black-white": { white: { min: 24, max: 590 }, cream: { min: 24, max: 550 }, groundwood: { min: 24, max: 578 } },
      "standard-color": { white: { min: 72, max: 600 } },
      "premium-color": { white: { min: 24, max: 590 } },
    }),
    hardcover: false,
  },
  {
    id: "8.5x11",
    label: "8.5 × 11 in",
    widthInches: 8.5,
    heightInches: 11,
    largeTrim: true,
    paperbackLimits: limits({
      "black-white": { white: { min: 24, max: 590 }, cream: { min: 24, max: 550 }, groundwood: { min: 24, max: 578 } },
      "standard-color": { white: { min: 72, max: 600 } },
      "premium-color": { white: { min: 24, max: 590 } },
    }),
    hardcover: false,
  },
];

export function findKdpTrim(trimId: string): KdpTrimSpec | null {
  return KDP_TRIMS.find((trim) => trim.id === trimId) ?? null;
}

export function getKdpTrimOptions(binding: KdpBinding): KdpTrimSpec[] {
  return KDP_TRIMS.filter((trim) => binding === "hardcover" ? trim.hardcover : Object.keys(trim.paperbackLimits).length > 0);
}

export function getKdpInteriorOptions(binding: KdpBinding): KdpInterior[] {
  return binding === "hardcover" ? ["black-white", "premium-color"] : ["black-white", "standard-color", "premium-color"];
}

export function getKdpPaperOptions(binding: KdpBinding, interior: KdpInterior): KdpPaper[] {
  if (interior !== "black-white") return ["white"];
  return binding === "hardcover" ? ["white", "cream"] : ["white", "cream", "groundwood"];
}

export function getKdpPageLimit(
  trimId: string,
  binding: KdpBinding,
  interior: KdpInterior,
  paper: KdpPaper,
): KdpPageLimit | null {
  const trim = findKdpTrim(trimId);
  if (!trim || (binding === "hardcover" && !trim.hardcover)) return null;
  if (binding === "hardcover") {
    if (!getKdpInteriorOptions(binding).includes(interior) || !getKdpPaperOptions(binding, interior).includes(paper)) return null;
    return { min: 75, max: 550 };
  }
  return trim.paperbackLimits[interior]?.[paper] ?? null;
}

export function getKdpInsideMarginInches(pageCount: number): number {
  if (pageCount <= 150) return 0.375;
  if (pageCount <= 300) return 0.5;
  if (pageCount <= 500) return 0.625;
  if (pageCount <= 700) return 0.75;
  return 0.875;
}

export function getKdpOutsideMarginInches(bleed: boolean): number {
  return bleed ? 0.375 : 0.25;
}

export function getKdpSpineCoefficient(interior: KdpInterior, paper: KdpPaper): number {
  if (interior === "premium-color") return 0.002347;
  if (paper === "groundwood") return 0.00235;
  if (paper === "cream") return 0.0025;
  return 0.002252;
}

export function inchesToMillimeters(value: number): number {
  return round(value * 25.4, 2);
}

export function inchesToPixels(value: number, dpi: number): number {
  return Math.round(value * dpi);
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function bindingLabel(binding: KdpBinding): string {
  return binding === "paperback" ? "Paperback" : "Hardcover";
}

export function interiorLabel(interior: KdpInterior): string {
  return interior === "black-white" ? "Black and white" : interior === "standard-color" ? "Standard color" : "Premium color";
}

export function paperLabel(paper: KdpPaper): string {
  return paper[0].toUpperCase() + paper.slice(1);
}
