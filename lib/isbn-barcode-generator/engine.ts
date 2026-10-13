import { drawingPdf, drawingSvg } from "./files.ts";
import { drawingPng } from "./png.ts";
import { drawSymbol, measureSymbol } from "./symbol.ts";

export const ISBN_BARCODE_RULES_VERSION = "2026-10-13";

export type IsbnBarcodeField = "isbn" | "price" | "size";

export type IsbnBarcodeInput = Readonly<{
  isbnText: string;
  priceText: string; // "" → 90000
  addOn: string;     // "" | "include" | "none"; unknown → "include"
  sizeText: string;  // "" → fit KDP's box
}>;

export const ISBN_BARCODE_EXAMPLE_INPUT: IsbnBarcodeInput = {
  isbnText: "978-0-306-40615-7",
  priceText: "14.99",
  addOn: "",
  sizeText: "",
};

export type IsbnErrorCode =
  | "empty" | "characters" | "x-position" | "length" | "includes-add-on"
  | "prefix" | "ismn" | "check-digit";

export type IsbnBarcodeError =
  | Readonly<{ field: "isbn"; code: IsbnErrorCode; digitCount?: number; form?: "isbn10" | "isbn13" }>
  | Readonly<{ field: "price"; code: "format" | "zero" | "code" | "without-add-on" }>
  | Readonly<{ field: "size"; code: "format" }>;

export type IsbnBarcodeResult =
  | Readonly<{ status: "invalid"; errors: readonly IsbnBarcodeError[] }> // every failing field, in field order
  | Readonly<{ status: "ready"; value: IsbnBarcode }>;

export type IsbnBarcode = Readonly<{
  isbn: Readonly<{
    entered: "isbn10" | "isbn13";
    isbn13: string;            // 13 digits
    isbn10: string | null;     // 10 characters; null for 979
    printedIsbn13: string;     // "978-0-306-40615-7" or "9780306406157"
    printedIsbn10: string | null; // the typed ISBN-10 with its dashes, else the 10 characters
    prefix: "978" | "979";
  }>;
  addOn: null | Readonly<{
    code: string;              // "51499" or "90000"
    priceCents: number | null; // null for 90000
    limit: null | "above-max"; // the price was $99.99 or more
  }>;
  size: Readonly<{
    percent: number;           // 80–200, the one used
    mode: "fit-kdp" | "entered";
    limit: null | "below-min" | "above-max";
  }>;
  layout: Readonly<{
    moduleMm: number;
    widthMm: number;           // white box
    heightMm: number;
  }>;
  fit: readonly Readonly<{
    area: "kdp" | "ingramspark";
    widthMm: number;
    heightMm: number;
    fits: boolean;
    largestFitPercent: number | null; // 80–200, or null when 80% doesn't fit
  }>[];                        // always KDP first, then IngramSpark
  svg: string;
  fileBaseName: string;        // without extension
  rulesVersion: string;
}>;

const MIN_PERCENT = 80;
const MAX_PERCENT = 200;
const KDP_DEFAULT_MAX_PERCENT = 100;
const NO_PRICE_CODE = "90000";
const MAX_PRICE_CENTS = 9998;

const AREAS = [
  { area: "kdp", widthMm: 50.8, heightMm: 30.48 },
  { area: "ingramspark", widthMm: 44.45, heightMm: 25.4 },
] as const;

// ISBN

type ParsedIsbn = IsbnBarcode["isbn"];
type IsbnError = Extract<IsbnBarcodeError, { field: "isbn" }>;

const LABEL = /^ISBN(?:[-\s]?1[03](?=[\s:]|$))?\s*:?\s*/i;
const DASHES = /[-‐-―−]/;

function isbn13Check(first12: string): string {
  let sum = 0;
  for (let index = 0; index < 12; index += 1) sum += Number(first12[index]) * (index % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

function isbn10Check(first9: string): string {
  let sum = 0;
  for (let index = 0; index < 9; index += 1) sum += Number(first9[index]) * (10 - index);
  const check = (11 - (sum % 11)) % 11;
  return check === 10 ? "X" : String(check);
}

function parseIsbn(text: string): ParsedIsbn | IsbnError {
  const unlabeled = text.trim().replace(LABEL, "");
  const groups = unlabeled.split(DASHES).map(group => group.replace(/\s+/g, "").toUpperCase());
  const compact = groups.join("");
  const fail = (code: IsbnErrorCode, extra: Omit<IsbnError, "field" | "code"> = {}): IsbnError => ({ field: "isbn", code, ...extra });

  if (compact === "") return fail("empty");
  if (/[^0-9X]/.test(compact)) return fail("characters");
  const xIndex = compact.indexOf("X");
  if (xIndex !== -1 && !(compact.length === 10 && xIndex === 9)) return fail("x-position");
  if (compact.length === 18 && /^97[89]/.test(compact)) return fail("includes-add-on");
  if (compact.length !== 10 && compact.length !== 13) return fail("length", { digitCount: compact.length });

  // Typed dashes are kept only in a full ISBN shape. Their positions aren't checked.
  const typedGroups = groups.every(group => group !== "") && groups[groups.length - 1].length === 1 ? groups : null;

  if (compact.length === 13) {
    if (!/^97[89]/.test(compact)) return fail("prefix");
    if (compact.startsWith("9790")) return fail("ismn");
    if (isbn13Check(compact.slice(0, 12)) !== compact[12]) return fail("check-digit", { form: "isbn13" });
    const prefix = compact.slice(0, 3) as "978" | "979";
    const dashed = typedGroups?.length === 5 && typedGroups[0].length === 3 ? typedGroups : null;
    const isbn10 = prefix === "978" ? compact.slice(3, 12) + isbn10Check(compact.slice(3, 12)) : null;
    return {
      entered: "isbn13",
      isbn13: compact,
      isbn10,
      printedIsbn13: dashed ? dashed.join("-") : compact,
      printedIsbn10: isbn10 && dashed ? [...dashed.slice(1, 4), isbn10[9]].join("-") : isbn10,
      prefix,
    };
  }

  if (isbn10Check(compact.slice(0, 9)) !== compact[9]) return fail("check-digit", { form: "isbn10" });
  const isbn13 = "978" + compact.slice(0, 9) + isbn13Check("978" + compact.slice(0, 9));
  const dashed = typedGroups?.length === 4 ? typedGroups : null;
  return {
    entered: "isbn10",
    isbn13,
    isbn10: compact,
    printedIsbn13: dashed ? ["978", ...dashed.slice(0, 3), isbn13[12]].join("-") : isbn13,
    printedIsbn10: dashed ? dashed.join("-") : compact,
    prefix: "978",
  };
}

// Price add-on

type ParsedAddOn = NonNullable<IsbnBarcode["addOn"]>;
type PriceError = Extract<IsbnBarcodeError, { field: "price" }>;

const NO_PRICE: ParsedAddOn = { code: NO_PRICE_CODE, priceCents: null, limit: null };
const ABOVE_MAX: ParsedAddOn = { code: NO_PRICE_CODE, priceCents: null, limit: "above-max" };

function parsePrice(text: string): ParsedAddOn | PriceError {
  const price = text.trim();
  const fail = (code: PriceError["code"]): PriceError => ({ field: "price", code });
  if (price === "") return NO_PRICE;

  if (/^\d{5}$/.test(price)) {
    const code = Number(price);
    if (code === 90000) return NO_PRICE;
    if (code === 59999) return ABOVE_MAX;
    if (code >= 50001 && code <= 59998) return { code: price, priceCents: code - 50000, limit: null };
    return fail("code");
  }

  const money = /^\$?\s*(\d+)(?:\.(\d{1,2}))?$/.exec(price);
  if (!money) return fail("format");
  const dollars = money[1].replace(/^0+(?=\d)/, "");
  if (dollars.length > 3) return ABOVE_MAX;
  const cents = Number(dollars) * 100 + Number((money[2] ?? "").padEnd(2, "0"));
  if (cents === 0) return fail("zero");
  if (cents > MAX_PRICE_CENTS) return ABOVE_MAX;
  return { code: "5" + String(cents).padStart(4, "0"), priceCents: cents, limit: null };
}

// Size

type SizeError = Extract<IsbnBarcodeError, { field: "size" }>;
type EnteredSize = Readonly<{ percent: number; limit: IsbnBarcode["size"]["limit"] }>;

function parseSize(text: string): EnteredSize | null | SizeError {
  const size = text.trim();
  if (size === "") return null;
  const match = /^(\d+)\s*%?$/.exec(size);
  if (!match) return { field: "size", code: "format" };
  const percent = Number(match[1]);
  if (percent < MIN_PERCENT) return { percent: MIN_PERCENT, limit: "below-min" };
  if (percent > MAX_PERCENT) return { percent: MAX_PERCENT, limit: "above-max" };
  return { percent, limit: null };
}

// Fit

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function fitsArea(percent: number, lineChars: number, hasAddOn: boolean, area: (typeof AREAS)[number]): boolean {
  const { widthMm, heightMm } = measureSymbol(percent, lineChars, hasAddOn);
  return round3(widthMm) <= area.widthMm && round3(heightMm) <= area.heightMm;
}

function largestFit(from: number, to: number, lineChars: number, hasAddOn: boolean, area: (typeof AREAS)[number]): number | null {
  for (let percent = to; percent >= from; percent -= 1) {
    if (fitsArea(percent, lineChars, hasAddOn, area)) return percent;
  }
  return null;
}

// Result

export function makeIsbnBarcode(input: IsbnBarcodeInput): IsbnBarcodeResult {
  const isbn = parseIsbn(input.isbnText);
  const includeAddOn = input.addOn !== "none";
  const addOn = includeAddOn
    ? parsePrice(input.priceText)
    : input.priceText.trim() === "" ? null : ({ field: "price", code: "without-add-on" } as const);
  const entered = parseSize(input.sizeText);

  const errors: IsbnBarcodeError[] = [];
  if ("field" in isbn) errors.push(isbn);
  if (addOn && "field" in addOn) errors.push(addOn);
  if (entered && "field" in entered) errors.push(entered);
  if ("field" in isbn || (addOn && "field" in addOn) || (entered && "field" in entered)) return { status: "invalid", errors };

  const line = `ISBN ${isbn.printedIsbn13}`;
  const hasAddOn = addOn !== null;
  const size: IsbnBarcode["size"] = entered
    ? { percent: entered.percent, mode: "entered", limit: entered.limit }
    : { percent: largestFit(MIN_PERCENT, KDP_DEFAULT_MAX_PERCENT, line.length, hasAddOn, AREAS[0]) ?? MIN_PERCENT, mode: "fit-kdp", limit: null };

  const drawing = drawSymbol(isbn.isbn13, line, addOn?.code ?? null, size.percent);
  const layout = { moduleMm: round3(drawing.moduleMm), widthMm: round3(drawing.widthMm), heightMm: round3(drawing.heightMm) };

  return {
    status: "ready",
    value: {
      isbn,
      addOn,
      size,
      layout,
      fit: AREAS.map(area => ({
        area: area.area,
        widthMm: area.widthMm,
        heightMm: area.heightMm,
        fits: layout.widthMm <= area.widthMm && layout.heightMm <= area.heightMm,
        largestFitPercent: largestFit(MIN_PERCENT, MAX_PERCENT, line.length, hasAddOn, area),
      })),
      svg: drawingSvg(drawing),
      fileBaseName: addOn ? `isbn-${isbn.isbn13}-${addOn.code}` : `isbn-${isbn.isbn13}`,
      rulesVersion: ISBN_BARCODE_RULES_VERSION,
    },
  };
}

function drawingFor(barcode: IsbnBarcode) {
  return drawSymbol(barcode.isbn.isbn13, `ISBN ${barcode.isbn.printedIsbn13}`, barcode.addOn?.code ?? null, barcode.size.percent);
}

export function renderIsbnBarcodePdf(barcode: IsbnBarcode): Uint8Array {
  return drawingPdf(drawingFor(barcode));
}

export function renderIsbnBarcodePng(barcode: IsbnBarcode): Uint8Array {
  return drawingPng(drawingFor(barcode));
}
