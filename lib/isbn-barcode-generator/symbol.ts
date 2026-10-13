import { EAN13_MODULES, EAN5_MODULES, darkRuns, ean13Modules, ean5Modules } from "./encoding.ts";
import { OCR_B_ADVANCE, OCR_B_GLYPHS, OCR_B_UNITS_PER_EM } from "./ocr-b-glyphs.ts";

// Book barcode geometry in millimetres, y down from the top of the white box.

export const MODULE_MM = 0.33;
export const BAR_HEIGHT_MM = 22.85;
export const MIN_QUIET_MM = 2.38125; // 3/32 in, BISG
export const ISBN_LINE_EM_MM = 3.175; // 9 pt
const GUARD_MODULES = 5;
const ADD_ON_GAP_MODULES = 9;
const LEFT_QUIET_MODULES = 11;
const RIGHT_QUIET_MODULES = 7;
const ADD_ON_RIGHT_QUIET_MODULES = 5;
const PAD_MODULES = 3; // white above the ISBN line and below the digits
const LINE_GAP_MODULES = 2; // ISBN line to the top of the bars
const DIGIT_GAP_MODULES = 0.5; // bars to the digits below them
const ADD_ON_DIGIT_GAP_MODULES = 1; // add-on digits to the add-on bars

// OCR-B ink extents in font units, from the glyph outlines.
const DIGIT_TOP = 771;
const DIGIT_BOTTOM = -21;
const LINE_BOTTOM = -26; // "S"
const INK_LEFT = 100;
const INK_RIGHT = 630;
const MARK_INK_LEFT = 113; // ">"
const MARK_MIDDLE = 374;

// Digits under the bars sit one per 7-module character. The ISBN line keeps
// 9 pt type, but its characters are set at 0.64 em instead of OCR-B's 0.723 em
// so a hyphenated ISBN fits over the bars at 90%, the size that fills KDP's box.
const LINE_PITCH = 640;
const MARK_EM_MODULES = 7; // ">" ink is 3.5 modules wide, inside a 5-module quiet zone

const GUARD_RANGES: readonly (readonly [number, number])[] = [[0, 3], [45, 50], [92, 95]];

export type Rect = Readonly<{ x: number; y: number; width: number; height: number }>;
export type PlacedGlyph = Readonly<{ char: string; x: number; baseline: number; em: number }>;
export type SymbolDrawing = Readonly<{
  moduleMm: number;
  widthMm: number;
  heightMm: number;
  bars: readonly Rect[];
  glyphs: readonly PlacedGlyph[];
}>;

export type SymbolMeasure = Readonly<{
  moduleMm: number;
  widthMm: number;
  heightMm: number;
  barsAndQuietMm: number; // before any widening for the ISBN line
}>;

type Frame = SymbolMeasure & Readonly<{
  barsStart: number;
  barsEnd: number;
  barTop: number;
  mainBarBottom: number;
  guardBottom: number;
  digitEm: number;
  lineEm: number;
  lineLeft: number;
  lineBaseline: number;
}>;

function frame(percent: number, lineChars: number, hasAddOn: boolean): Frame {
  const m = percent / 100;
  const x = MODULE_MM * m;
  const leftQuiet = Math.max(LEFT_QUIET_MODULES * x, MIN_QUIET_MM);
  const rightQuiet = Math.max((hasAddOn ? ADD_ON_RIGHT_QUIET_MODULES : RIGHT_QUIET_MODULES) * x, MIN_QUIET_MM);
  const barsWidth = (hasAddOn ? EAN13_MODULES + ADD_ON_GAP_MODULES + EAN5_MODULES : EAN13_MODULES) * x;
  const barsAndQuietMm = leftQuiet + barsWidth + rightQuiet;

  const lineEm = ISBN_LINE_EM_MM * Math.max(1, m);
  const lineWidth = ((lineChars - 1) * LINE_PITCH + INK_RIGHT - INK_LEFT) / OCR_B_UNITS_PER_EM * lineEm;
  const lineInkLeft = leftQuiet + (barsWidth - lineWidth) / 2;
  const extraLeft = Math.max(0, MIN_QUIET_MM - lineInkLeft);
  const extraRight = Math.max(0, lineInkLeft + lineWidth - (barsAndQuietMm - MIN_QUIET_MM));

  const digitEm = (7 * x) / (OCR_B_ADVANCE / OCR_B_UNITS_PER_EM);
  const pad = PAD_MODULES * x;
  const lineBaseline = pad + (DIGIT_TOP / OCR_B_UNITS_PER_EM) * lineEm;
  const barTop = lineBaseline + (-LINE_BOTTOM / OCR_B_UNITS_PER_EM) * lineEm + LINE_GAP_MODULES * x;
  const mainBarBottom = barTop + BAR_HEIGHT_MM * m;
  const guardBottom = mainBarBottom + GUARD_MODULES * x;
  const digitBottom = mainBarBottom + DIGIT_GAP_MODULES * x + ((DIGIT_TOP - DIGIT_BOTTOM) / OCR_B_UNITS_PER_EM) * digitEm;

  return {
    moduleMm: x,
    widthMm: barsAndQuietMm + extraLeft + extraRight,
    heightMm: Math.max(guardBottom, digitBottom) + pad,
    barsAndQuietMm,
    barsStart: extraLeft + leftQuiet,
    barsEnd: extraLeft + leftQuiet + barsWidth,
    barTop,
    mainBarBottom,
    guardBottom,
    digitEm,
    lineEm,
    lineLeft: extraLeft + lineInkLeft - (INK_LEFT / OCR_B_UNITS_PER_EM) * lineEm,
    lineBaseline,
  };
}

export function measureSymbol(percent: number, lineChars: number, hasAddOn: boolean): SymbolMeasure {
  const { moduleMm, widthMm, heightMm, barsAndQuietMm } = frame(percent, lineChars, hasAddOn);
  return { moduleMm, widthMm, heightMm, barsAndQuietMm };
}

export function drawSymbol(isbn13: string, line: string, addOnCode: string | null, percent: number): SymbolDrawing {
  const f = frame(percent, line.length, addOnCode !== null);
  const x = f.moduleMm;
  const bars: Rect[] = [];
  const glyphs: PlacedGlyph[] = [];
  const digitCap = (DIGIT_TOP / OCR_B_UNITS_PER_EM) * f.digitEm;

  [...line].forEach((char, index) => {
    if (char !== " ") glyphs.push({ char, x: f.lineLeft + (index * LINE_PITCH / OCR_B_UNITS_PER_EM) * f.lineEm, baseline: f.lineBaseline, em: f.lineEm });
  });

  for (const [start, width] of darkRuns(ean13Modules(isbn13))) {
    const guard = GUARD_RANGES.some(([from, to]) => start >= from && start < to);
    bars.push({ x: f.barsStart + start * x, y: f.barTop, width: width * x, height: (guard ? f.guardBottom : f.mainBarBottom) - f.barTop });
  }

  const digitBaseline = f.mainBarBottom + DIGIT_GAP_MODULES * x + digitCap;
  const digit = (char: string, cellModule: number, baseline: number) =>
    glyphs.push({ char, x: f.barsStart + cellModule * x, baseline, em: f.digitEm });
  digit(isbn13[0], -8, digitBaseline);
  for (let index = 0; index < 6; index += 1) digit(isbn13[1 + index], 3 + 7 * index, digitBaseline);
  for (let index = 0; index < 6; index += 1) digit(isbn13[7 + index], 50 + 7 * index, digitBaseline);

  const markEm = MARK_EM_MODULES * x;
  const markX = f.barsEnd + 0.75 * x - (MARK_INK_LEFT / OCR_B_UNITS_PER_EM) * markEm;
  const markMiddle = (MARK_MIDDLE / OCR_B_UNITS_PER_EM) * markEm;

  if (addOnCode === null) {
    glyphs.push({ char: ">", x: markX, baseline: digitBaseline - digitCap / 2 + markMiddle, em: markEm });
  } else {
    const addOnStart = f.barsStart + (EAN13_MODULES + ADD_ON_GAP_MODULES) * x;
    const addOnBaseline = f.barTop + digitCap;
    const addOnBarTop = addOnBaseline + (-DIGIT_BOTTOM / OCR_B_UNITS_PER_EM) * f.digitEm + ADD_ON_DIGIT_GAP_MODULES * x;
    for (const [start, width] of darkRuns(ean5Modules(addOnCode))) {
      bars.push({ x: addOnStart + start * x, y: addOnBarTop, width: width * x, height: f.guardBottom - addOnBarTop });
    }
    for (let index = 0; index < 5; index += 1) {
      glyphs.push({ char: addOnCode[index], x: addOnStart + (4 + 9 * index) * x, baseline: addOnBaseline, em: f.digitEm });
    }
    glyphs.push({ char: ">", x: markX, baseline: f.barTop + digitCap / 2 + markMiddle, em: markEm });
  }

  return { moduleMm: x, widthMm: f.widthMm, heightMm: f.heightMm, bars, glyphs };
}

// Glyph outlines in the drawing's millimetres, y down.

export type Segment =
  | Readonly<{ type: "M"; x: number; y: number }>
  | Readonly<{ type: "L"; x: number; y: number }>
  | Readonly<{ type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }>;

type FontCommand = Readonly<{ type: "M" | "L" | "C" | "Z"; values: readonly number[] }>;
const parsedGlyphs = new Map<string, readonly FontCommand[]>();

function fontCommands(char: string): readonly FontCommand[] {
  const cached = parsedGlyphs.get(char);
  if (cached) return cached;
  const path = OCR_B_GLYPHS[char];
  if (path === undefined) throw new Error(`No OCR-B glyph for ${char}.`);
  const commands = [...path.matchAll(/([MLCZ])([^MLCZ]*)/g)].map(([, type, values]) => ({
    type: type as FontCommand["type"],
    values: values.trim() ? values.trim().split(/\s+/).map(Number) : [],
  }));
  parsedGlyphs.set(char, commands);
  return commands;
}

// Contours of one placed glyph. Each contour starts with "M" and is closed.
export function glyphContours(glyph: PlacedGlyph): Segment[][] {
  const scale = glyph.em / OCR_B_UNITS_PER_EM;
  const px = (value: number) => glyph.x + value * scale;
  const py = (value: number) => glyph.baseline - value * scale;
  const contours: Segment[][] = [];
  let current: Segment[] = [];
  for (const { type, values: v } of fontCommands(glyph.char)) {
    if (type === "M") {
      current = [{ type, x: px(v[0]), y: py(v[1]) }];
      contours.push(current);
    } else if (type === "L") {
      current.push({ type, x: px(v[0]), y: py(v[1]) });
    } else if (type === "C") {
      current.push({ type, x1: px(v[0]), y1: py(v[1]), x2: px(v[2]), y2: py(v[3]), x: px(v[4]), y: py(v[5]) });
    }
  }
  return contours;
}
