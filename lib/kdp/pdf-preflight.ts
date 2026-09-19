import { PDFDocument } from "pdf-lib";
import { GlobalWorkerOptions, OPS, getDocument, type PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs";
import { KDP_MAX_FILE_MB, round } from "./specs.ts";

if (typeof window !== "undefined" && !GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
}

export type KdpPdfExpected = Readonly<{
  kind: "interior" | "paperback-cover";
  widthInches: number;
  heightInches: number;
  trimWidthInches?: number;
  trimHeightInches?: number;
  expectedSpineInches?: number;
  bleed: boolean;
  expectedPageCount?: number;
  pageLimit?: Readonly<{ min: number; max: number }>;
}>;

export type KdpPdfInput = Readonly<{ fileName: string; bytes: Uint8Array; expected?: KdpPdfExpected }>;
export type KdpPdfFinding = Readonly<{ code: string; severity: "warning" | "error"; message: string; pageNumber?: number }>;
export type KdpPdfBox = Readonly<{
  x0: number; y0: number; x1: number; y1: number;
  widthPoints: number; heightPoints: number; widthInches: number; heightInches: number;
}>;
export type KdpPdfPage = Readonly<{
  pageNumber: number;
  widthInches: number | null;
  heightInches: number | null;
  mediaBox: KdpPdfBox | null;
  cropBox: KdpPdfBox | null;
  trimBox: KdpPdfBox | null;
  bleedBox: KdpPdfBox | null;
  boxStates: Readonly<{ crop: "declared" | "defaulted" | "unknown"; trim: "declared" | "defaulted" | "unknown"; bleed: "declared" | "defaulted" | "unknown" }>;
  hasContents: boolean;
  imageCount: number;
  issues: readonly KdpPdfFinding[];
}>;
export type KdpPdfResult = Readonly<{
  status: "valid" | "invalid";
  fileName: string;
  fileSizeBytes: number;
  pageCount: number;
  pages: readonly KdpPdfPage[];
  fonts: Readonly<{ total: number; embedded: number; unembedded: number; unknown: number }>;
  images: Readonly<{ total: number; measurable: number; lowResolution: number; above600Dpi: number; minimumDpi: number | null }>;
  encrypted: boolean;
  eofPresent: boolean;
  findings: readonly KdpPdfFinding[];
}>;

const POINTS_PER_INCH = 72;
const DIMENSION_TOLERANCE = 0.02;

function finding(code: string, message: string, severity: KdpPdfFinding["severity"] = "warning", pageNumber?: number): KdpPdfFinding {
  return { code, severity, message: `Possible issue: ${message}`, ...(pageNumber === undefined ? {} : { pageNumber }) };
}

function boxFromRectangle(rectangle: { x: number; y: number; width: number; height: number }): KdpPdfBox | null {
  if (![rectangle.x, rectangle.y, rectangle.width, rectangle.height].every(Number.isFinite) || rectangle.width <= 0 || rectangle.height <= 0) return null;
  return {
    x0: rectangle.x,
    y0: rectangle.y,
    x1: rectangle.x + rectangle.width,
    y1: rectangle.y + rectangle.height,
    widthPoints: rectangle.width,
    heightPoints: rectangle.height,
    widthInches: round(rectangle.width / POINTS_PER_INCH, 4),
    heightInches: round(rectangle.height / POINTS_PER_INCH, 4),
  };
}

function pointsClose(first: number | null, second: number | null): boolean {
  return first !== null && second !== null && Math.abs(first - second) <= DIMENSION_TOLERANCE;
}

function compareExpected(page: KdpPdfPage, expected: KdpPdfExpected, findings: KdpPdfFinding[]) {
  if (page.widthInches === null || page.heightInches === null) return;
  if (!pointsClose(page.widthInches, expected.widthInches) || !pointsClose(page.heightInches, expected.heightInches)) {
    findings.push(finding("dimension-mismatch", `Page ${page.pageNumber} is ${page.widthInches} × ${page.heightInches} in; expected ${expected.widthInches} × ${expected.heightInches} in.`, "warning", page.pageNumber));
  }
  if (expected.bleed && expected.trimWidthInches && expected.trimHeightInches
    && pointsClose(page.widthInches, expected.trimWidthInches)
    && pointsClose(page.heightInches, expected.trimHeightInches)) {
    findings.push(finding("missing-bleed", `Page ${page.pageNumber} matches trim size but the expected file includes bleed.`, "warning", page.pageNumber));
  }
  if (expected.kind === "paperback-cover" && expected.expectedSpineInches !== undefined && expected.trimWidthInches !== undefined) {
    const inferredSpine = page.widthInches - expected.trimWidthInches * 2 - 0.25;
    if (Math.abs(inferredSpine - expected.expectedSpineInches) > DIMENSION_TOLERANCE) {
      findings.push(finding("cover-spine-mismatch", `The inferred spine is ${round(inferredSpine, 4)} in; expected ${expected.expectedSpineInches} in.`, "warning", page.pageNumber));
    }
  }
}

function multiply(first: readonly number[], second: readonly number[]): number[] {
  return [
    first[0] * second[0] + first[2] * second[1],
    first[1] * second[0] + first[3] * second[1],
    first[0] * second[2] + first[2] * second[3],
    first[1] * second[2] + first[3] * second[3],
    first[0] * second[4] + first[2] * second[5] + first[4],
    first[1] * second[4] + first[3] * second[5] + first[5],
  ];
}

type ImageMeasurement = Readonly<{ dpi: number | null }>;

async function inspectPageOperators(page: PDFPageProxy): Promise<{ hasContents: boolean; images: ImageMeasurement[]; fontIds: string[] }> {
  const operators = await page.getOperatorList();
  const stack: number[][] = [];
  let transform = [1, 0, 0, 1, 0, 0];
  const images: ImageMeasurement[] = [];
  const fontIds = new Set<string>();
  let hasContents = false;
  const ignored = new Set([OPS.dependency, OPS.save, OPS.restore, OPS.transform]);
  for (let index = 0; index < operators.fnArray.length; index += 1) {
    const operation = operators.fnArray[index];
    const args = operators.argsArray[index] ?? [];
    if (!ignored.has(operation)) hasContents = true;
    if (operation === OPS.save) stack.push([...transform]);
    else if (operation === OPS.restore) transform = stack.pop() ?? [1, 0, 0, 1, 0, 0];
    else if (operation === OPS.transform && args.length >= 6) transform = multiply(transform, args as number[]);
    else if (operation === OPS.setFont && typeof args[0] === "string") fontIds.add(args[0]);
    else if (operation === OPS.paintImageXObject || operation === OPS.paintInlineImageXObject) {
      const image = operation === OPS.paintImageXObject ? { width: Number(args[1]), height: Number(args[2]) } : args[0] as { width?: number; height?: number };
      const width = Number(image?.width);
      const height = Number(image?.height);
      const placedWidthPoints = Math.hypot(transform[0], transform[1]) * page.userUnit;
      const placedHeightPoints = Math.hypot(transform[2], transform[3]) * page.userUnit;
      const dpiX = width > 0 && placedWidthPoints > 0 ? width / (placedWidthPoints / POINTS_PER_INCH) : null;
      const dpiY = height > 0 && placedHeightPoints > 0 ? height / (placedHeightPoints / POINTS_PER_INCH) : null;
      images.push({ dpi: dpiX !== null && dpiY !== null ? Math.min(dpiX, dpiY) : null });
    }
  }
  return { hasContents, images, fontIds: [...fontIds] };
}

async function resolveFont(page: PDFPageProxy, id: string): Promise<{ key: string; embedded: boolean | null }> {
  try {
    const font = await new Promise<Record<string, unknown>>((resolve) => page.commonObjs.get(id, resolve));
    const key = typeof font.name === "string" ? font.name : typeof font.loadedName === "string" ? font.loadedName : id;
    if (font.missingFile === true) return { key, embedded: false };
    const data = font.data;
    if (data instanceof Uint8Array) return { key, embedded: data.byteLength > 0 };
    return { key, embedded: null };
  } catch {
    return { key: id, embedded: null };
  }
}

function emptyResult(input: KdpPdfInput, findings: KdpPdfFinding[], encrypted = false): KdpPdfResult {
  return {
    status: "invalid",
    fileName: typeof input?.fileName === "string" ? input.fileName : "document.pdf",
    fileSizeBytes: input?.bytes instanceof Uint8Array ? input.bytes.byteLength : 0,
    pageCount: 0,
    pages: [],
    fonts: { total: 0, embedded: 0, unembedded: 0, unknown: 0 },
    images: { total: 0, measurable: 0, lowResolution: 0, above600Dpi: 0, minimumDpi: null },
    encrypted,
    eofPresent: false,
    findings,
  };
}

export async function analyzeKdpPdf(input: KdpPdfInput): Promise<KdpPdfResult> {
  const bytes = input?.bytes instanceof Uint8Array ? input.bytes : new Uint8Array();
  if (bytes.byteLength > KDP_MAX_FILE_MB * 1024 * 1024) return emptyResult(input, [finding("file-too-large", `The file is larger than ${KDP_MAX_FILE_MB} MB.`, "error")]);
  if (bytes.byteLength < 5 || new TextDecoder("latin1").decode(bytes.slice(0, 5)) !== "%PDF-") return emptyResult(input, [finding("not-pdf", "The selected file is not a PDF.", "error")]);
  const tail = new TextDecoder("latin1").decode(bytes.slice(Math.max(0, bytes.byteLength - 2_048)));
  const eofPresent = tail.includes("%%EOF");
  const findings: KdpPdfFinding[] = eofPresent ? [] : [finding("eof-missing", "The PDF does not end with an EOF marker.")];
  const loadingTask = getDocument({ data: bytes.slice(), fontExtraProperties: true });
  let pdfJsDocument;
  let pdfLibDocument;
  try {
    [pdfJsDocument, pdfLibDocument] = await Promise.all([
      loadingTask.promise,
      PDFDocument.load(bytes.slice(), { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false }),
    ]);
  } catch (error) {
    await loadingTask.destroy().catch(() => undefined);
    const encrypted = error instanceof Error && /password|encrypt/i.test(error.message);
    return { ...emptyResult(input, [finding(encrypted ? "encrypted" : "parse-failed", encrypted ? "The PDF is encrypted and cannot be checked without a password." : "The PDF could not be parsed locally.", "error")], encrypted), eofPresent };
  }
  try {
    if (pdfJsDocument.numPages === 0) return { ...emptyResult(input, [...findings, finding("no-pages", "The PDF contains no usable pages.", "error")]), eofPresent };
    const pdfLibPages = pdfLibDocument.getPages();
    const pages: KdpPdfPage[] = [];
    const imageMeasurements: ImageMeasurement[] = [];
    const fonts = new Map<string, boolean | null>();
    for (let index = 0; index < pdfJsDocument.numPages; index += 1) {
      const pageNumber = index + 1;
      const pdfJsPage = await pdfJsDocument.getPage(pageNumber);
      const pdfLibPage = pdfLibPages[index];
      const pageFindings: KdpPdfFinding[] = [];
      let mediaBox: KdpPdfBox | null = null;
      let cropBox: KdpPdfBox | null = null;
      let trimBox: KdpPdfBox | null = null;
      let bleedBox: KdpPdfBox | null = null;
      let cropState: KdpPdfPage["boxStates"]["crop"] = "unknown";
      let trimState: KdpPdfPage["boxStates"]["trim"] = "unknown";
      let bleedState: KdpPdfPage["boxStates"]["bleed"] = "unknown";
      try {
        mediaBox = boxFromRectangle(pdfLibPage.getMediaBox());
        const declaredCrop = pdfLibPage.node.CropBox();
        const declaredTrim = pdfLibPage.node.TrimBox();
        const declaredBleed = pdfLibPage.node.BleedBox();
        cropBox = boxFromRectangle(pdfLibPage.getCropBox());
        trimBox = boxFromRectangle(pdfLibPage.getTrimBox());
        bleedBox = boxFromRectangle(pdfLibPage.getBleedBox());
        cropState = declaredCrop ? "declared" : "defaulted";
        trimState = declaredTrim ? "declared" : "defaulted";
        bleedState = declaredBleed ? "declared" : "defaulted";
      } catch {
        pageFindings.push(finding("page-box-unreadable", `Page ${pageNumber} boxes could not be read.`, "warning", pageNumber));
      }
      const operatorResult = await inspectPageOperators(pdfJsPage).catch(() => ({ hasContents: false, images: [] as ImageMeasurement[], fontIds: [] as string[] }));
      if (!operatorResult.hasContents) pageFindings.push(finding("page-missing-content", `Page ${pageNumber} has no measurable drawing or text operators.`, "warning", pageNumber));
      imageMeasurements.push(...operatorResult.images);
      for (const fontId of operatorResult.fontIds) {
        const font = await resolveFont(pdfJsPage, fontId);
        const previous = fonts.get(font.key);
        if (previous === undefined || previous === null) fonts.set(font.key, font.embedded);
      }
      const page: KdpPdfPage = {
        pageNumber,
        widthInches: mediaBox?.widthInches ?? null,
        heightInches: mediaBox?.heightInches ?? null,
        mediaBox,
        cropBox,
        trimBox,
        bleedBox,
        boxStates: { crop: cropState, trim: trimState, bleed: bleedState },
        hasContents: operatorResult.hasContents,
        imageCount: operatorResult.images.length,
        issues: pageFindings,
      };
      pages.push(page);
      findings.push(...pageFindings);
      if (input.expected) compareExpected(page, input.expected, findings);
      if (!mediaBox) findings.push(finding("media-box-missing", `Page ${pageNumber} has no usable MediaBox.`, "warning", pageNumber));
    }
    const first = pages.find((page) => page.mediaBox !== null);
    if (first && pages.some((page) => page.mediaBox && (!pointsClose(page.widthInches, first.widthInches) || !pointsClose(page.heightInches, first.heightInches)))) findings.push(finding("mixed-page-sizes", "The PDF contains mixed page sizes."));
    if (input.expected?.expectedPageCount !== undefined && pages.length !== input.expected.expectedPageCount) findings.push(finding("page-count-mismatch", `The PDF has ${pages.length} pages; expected ${input.expected.expectedPageCount}.`));
    if (input.expected?.kind === "interior" && input.expected.pageLimit && (pages.length < input.expected.pageLimit.min || pages.length > input.expected.pageLimit.max)) findings.push(finding("page-count-out-of-range", `The PDF has ${pages.length} pages; this setup uses ${input.expected.pageLimit.min} to ${input.expected.pageLimit.max}.`));
    if (input.expected?.kind === "interior" && pages.length % 2 !== 0) findings.push(finding("odd-page-count", `The PDF has ${pages.length} pages; KDP rounds paperback page counts up to an even number.`));
    const fontStates = [...fonts.values()];
    const embedded = fontStates.filter((state) => state === true).length;
    const unembedded = fontStates.filter((state) => state === false).length;
    const unknownFonts = fontStates.filter((state) => state === null).length;
    if (unembedded) findings.push(finding("fonts-not-embedded", `${unembedded} used font${unembedded === 1 ? " is" : "s are"} not embedded.`));
    if (unknownFonts) findings.push(finding("font-embedding-unknown", `Embedding could not be measured for ${unknownFonts} used font${unknownFonts === 1 ? "" : "s"}.`));
    const measuredDpi = imageMeasurements.flatMap((image) => image.dpi === null ? [] : [image.dpi]);
    const lowResolution = measuredDpi.filter((dpi) => dpi < 300).length;
    const above600Dpi = measuredDpi.filter((dpi) => dpi > 600).length;
    if (lowResolution) findings.push(finding("image-low-resolution", `${lowResolution} placed image${lowResolution === 1 ? " is" : "s are"} below 300 DPI.`));
    if (above600Dpi) findings.push(finding("image-above-600-dpi", `${above600Dpi} placed image${above600Dpi === 1 ? " is" : "s are"} above 600 DPI.`));
    if (imageMeasurements.length > measuredDpi.length) findings.push(finding("image-resolution-unmeasured", "Image resolution could not be measured for every placed image."));
    return {
      status: "valid",
      fileName: typeof input.fileName === "string" ? input.fileName : "document.pdf",
      fileSizeBytes: bytes.byteLength,
      pageCount: pages.length,
      pages,
      fonts: { total: fontStates.length, embedded, unembedded, unknown: unknownFonts },
      images: { total: imageMeasurements.length, measurable: measuredDpi.length, lowResolution, above600Dpi, minimumDpi: measuredDpi.length ? round(Math.min(...measuredDpi), 1) : null },
      encrypted: false,
      eofPresent,
      findings,
    };
  } finally {
    await loadingTask.destroy().catch(() => undefined);
  }
}

export function formatKdpPdfReport(result: KdpPdfResult): string {
  const lines = [
    `${result.fileName}: ${result.pageCount} page${result.pageCount === 1 ? "" : "s"}`,
    `Fonts: ${result.fonts.embedded} embedded, ${result.fonts.unembedded} not embedded, ${result.fonts.unknown} unknown`,
    `Images: ${result.images.measurable} measurable of ${result.images.total}`,
    `EOF marker: ${result.eofPresent ? "present" : "missing"}`,
    `Engine: ${KDP_PDF_PREFLIGHT_VERSION}`,
    "Rules checked: 2026-09-16",
  ];
  for (const next of result.findings) lines.push(next.message);
  return lines.join("\n");
}

export const KDP_PDF_PREFLIGHT_VERSION = "kdp-pdf-preflight-1.1.0";
