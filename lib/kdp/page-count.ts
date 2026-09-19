import { findKdpTrim, round, type KdpTrimSpec } from "./specs.ts";

export type KdpPageCountFont = "serif" | "sans" | "mono";

export type KdpPageCountInput = Readonly<{
  words: number;
  trimId: string;
  font: KdpPageCountFont;
  fontSize: number;
  lineSpacing: number;
  insideMargin: number;
  outsideMargin: number;
  topBottomMargin: number;
  chapterCount: number;
  imagePages: number;
  frontMatterPages: number;
  backMatterPages: number;
}>;

export type KdpPageCountIssue = Readonly<{
  code: string;
  field: string;
  severity: "warning" | "error";
  message: string;
}>;

export type KdpPageRange = Readonly<{ min: number; max: number }>;

export type KdpPageCountValues = Readonly<{
  trim: KdpTrimSpec;
  wordsPerPage: Readonly<{ low: number; high: number }>;
  textPages: KdpPageRange;
  rawPages: KdpPageRange;
  totalPages: KdpPageRange;
  rangeMidpoint: number;
  textBlockInches: Readonly<{ width: number; height: number }>;
  capacity: Readonly<{ charactersPerLine: number; linesPerPage: number; nominalWordsPerPage: number }>;
  addedPages: Readonly<{
    chapterStarts: number;
    image: number;
    frontMatter: number;
    backMatter: number;
    total: number;
  }>;
  gutterBands: readonly Readonly<{ minPages: number; maxPages: number; insideMarginInches: number }>[];
  calculationVersion: "kdp-page-count-1";
  inputVersion: "kdp-page-count-input-1";
  modelConstants: Readonly<{ glyphWidthFactor: number; characterSlotsPerWord: 5; densityLow: 0.8; densityHigh: 1.2; chapterStartPages: 1 }>;
  modelStatement: string;
}>;

export type KdpPageCountResult = Readonly<{
  status: "valid" | "invalid";
  values: KdpPageCountValues | null;
  issues: readonly KdpPageCountIssue[];
}>;

function addIssue(issues: KdpPageCountIssue[], field: string, message: string, code = `${field}-invalid`, severity: KdpPageCountIssue["severity"] = "error") {
  issues.push({ code, field, message, severity });
}

function evenCeiling(value: number): number {
  const whole = Math.max(0, Math.ceil(value));
  return whole % 2 === 0 ? whole : whole + 1;
}

const FONT_WIDTH_FACTOR: Record<KdpPageCountFont, number> = {
  serif: 0.5,
  sans: 0.52,
  mono: 0.6,
};

const GUTTER_BANDS = [
  { minPages: 24, maxPages: 150, insideMarginInches: 0.375 },
  { minPages: 151, maxPages: 300, insideMarginInches: 0.5 },
  { minPages: 301, maxPages: 500, insideMarginInches: 0.625 },
  { minPages: 501, maxPages: 700, insideMarginInches: 0.75 },
  { minPages: 701, maxPages: 828, insideMarginInches: 0.875 },
] as const;

export function getKdpPageCountDefaults(): KdpPageCountInput {
  return {
    words: 50_000,
    trimId: "6x9",
    font: "serif",
    fontSize: 11,
    lineSpacing: 1.15,
    insideMargin: 0.5,
    outsideMargin: 0.375,
    topBottomMargin: 0.75,
    chapterCount: 20,
    imagePages: 0,
    frontMatterPages: 4,
    backMatterPages: 2,
  };
}

export function estimateKdpPageCount(input: KdpPageCountInput): KdpPageCountResult {
  const issues: KdpPageCountIssue[] = [];
  const trim = typeof input?.trimId === "string" ? findKdpTrim(input.trimId) : null;
  if (!trim) addIssue(issues, "trimId", "Choose a supported trim size.");
  if (!Number.isSafeInteger(input?.words) || input.words < 0 || input.words > 10_000_000) addIssue(issues, "words", "Use a whole word count from 0 to 10,000,000.");
  if (!Object.hasOwn(FONT_WIDTH_FACTOR, input?.font)) addIssue(issues, "font", "Choose serif, sans, or monospaced text.");
  if (!Number.isFinite(input?.fontSize) || input.fontSize < 8 || input.fontSize > 24) addIssue(issues, "fontSize", "Use a font size from 8 to 24 points.");
  if (!Number.isFinite(input?.lineSpacing) || input.lineSpacing < 1 || input.lineSpacing > 2.5) addIssue(issues, "lineSpacing", "Use line spacing from 1 to 2.5.");
  for (const [field, value] of [["insideMargin", input?.insideMargin], ["outsideMargin", input?.outsideMargin], ["topBottomMargin", input?.topBottomMargin]] as const) {
    if (!Number.isFinite(value) || value < 0.1 || value > 2) addIssue(issues, field, "Use a margin from 0.1 to 2 inches.");
  }
  for (const [field, value] of [["chapterCount", input?.chapterCount], ["imagePages", input?.imagePages], ["frontMatterPages", input?.frontMatterPages], ["backMatterPages", input?.backMatterPages]] as const) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 2_000) addIssue(issues, field, "Use a whole page count from 0 to 2,000.");
  }
  if (trim && input.insideMargin + input.outsideMargin >= trim.widthInches) addIssue(issues, "insideMargin", "Inside and outside margins leave no text width.");
  if (trim && input.topBottomMargin * 2 >= trim.heightInches) addIssue(issues, "topBottomMargin", "Top and bottom margins leave no text height.");
  if (issues.length) return { status: "invalid", values: null, issues };

  const fontFactor = FONT_WIDTH_FACTOR[input.font];
  const usableWidth = trim!.widthInches - input.insideMargin - input.outsideMargin;
  const usableHeight = trim!.heightInches - input.topBottomMargin * 2;
  const characterWidth = input.fontSize / 72 * fontFactor;
  const lineHeight = input.fontSize / 72 * input.lineSpacing;
  const charactersPerLine = Math.max(1, Math.floor(usableWidth / characterWidth));
  const linesPerPage = Math.max(1, Math.floor(usableHeight / lineHeight));
  const nominalWordsPerPage = charactersPerLine * linesPerPage / 5;
  const wordsPerPage = {
    low: Math.max(1, Math.floor(nominalWordsPerPage * 0.8)),
    high: Math.max(1, Math.ceil(nominalWordsPerPage * 1.2)),
  };
  const textPages: KdpPageRange = {
    min: input.words === 0 ? 0 : Math.ceil(input.words / wordsPerPage.high),
    max: input.words === 0 ? 0 : Math.ceil(input.words / wordsPerPage.low),
  };
  const addedPages = {
    chapterStarts: input.words > 0 ? input.chapterCount : 0,
    image: input.imagePages,
    frontMatter: input.frontMatterPages,
    backMatter: input.backMatterPages,
  };
  const additions = Object.values(addedPages).reduce((sum, value) => sum + value, 0);
  const rawMin = textPages.min + additions;
  const rawMax = textPages.max + additions;
  const totalPages = { min: evenCeiling(rawMin), max: evenCeiling(Math.max(rawMin, rawMax)) };
  const touchedBands = GUTTER_BANDS.filter((band) => totalPages.max >= band.minPages && totalPages.min <= band.maxPages);
  const gutterBands = touchedBands.length || totalPages.max >= 24 ? touchedBands : [GUTTER_BANDS[0]];
  if (totalPages.min < 24) addIssue(issues, "words", "The estimate is below KDP's 24-page paperback minimum.", "below-kdp-minimum", "warning");
  if (totalPages.max > 828) addIssue(issues, "words", "The estimate extends above the published inside-margin table. Check the selected KDP format.", "above-gutter-table", "warning");
  const requiredInsideMargin = gutterBands.reduce((largest, band) => Math.max(largest, band.insideMarginInches), 0);
  if (requiredInsideMargin > input.insideMargin) {
    addIssue(issues, "insideMargin", `KDP guidance reaches ${requiredInsideMargin} in for this estimated range.`, "inside-margin-below-guidance", "warning");
  }
  return {
    status: "valid",
    values: {
      trim: trim!,
      wordsPerPage: { low: round(wordsPerPage.low, 0), high: round(wordsPerPage.high, 0) },
      textPages,
      rawPages: { min: rawMin, max: rawMax },
      totalPages,
      rangeMidpoint: Math.round((totalPages.min + totalPages.max) / 2),
      textBlockInches: { width: round(usableWidth, 4), height: round(usableHeight, 4) },
      capacity: { charactersPerLine, linesPerPage, nominalWordsPerPage: round(nominalWordsPerPage, 2) },
      addedPages: { ...addedPages, total: additions },
      gutterBands,
      calculationVersion: "kdp-page-count-1",
      inputVersion: "kdp-page-count-input-1",
      modelConstants: { glyphWidthFactor: fontFactor, characterSlotsPerWord: 5, densityLow: 0.8, densityHigh: 1.2, chapterStartPages: 1 },
      modelStatement: "Modelled range; final pages change with real layout, breaks, and artwork.",
    },
    issues,
  };
}

export function formatKdpPageRange(range: KdpPageRange): string {
  return range.min === range.max ? `${range.min} pages` : `${range.min} to ${range.max} pages`;
}

export const KDP_PAGE_COUNT_VERSION = "2026-09-16";
