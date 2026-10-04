import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument, PDFName, PDFNumber, StandardFonts } from "pdf-lib";
import { deflateSync } from "node:zlib";
import { analyzeKdpPdf, formatKdpPdfReport } from "../../../lib/kdp/pdf-preflight.ts";
import { calculateKdpSetup, getKdpSetupDefaults } from "../../../lib/kdp/setup.ts";

async function pdfWithPages(pageBoxes, { eof = true } = {}) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (const [width, height] of pageBoxes) {
    const page = document.addPage([width, height]);
    page.drawText("KDP preflight fixture", { x: 20, y: height - 30, font, size: 12 });
  }
  const bytes = await document.save({ useObjectStreams: true });
  if (eof) return bytes;
  const marker = new TextEncoder().encode("%%EOF");
  let markerIndex = bytes.length - marker.length;
  while (markerIndex > 0 && new TextDecoder().decode(bytes.slice(markerIndex, markerIndex + marker.length)) !== "%%EOF") markerIndex -= 1;
  return bytes.slice(0, Math.max(1, markerIndex));
}

test("RF-001 reads inherited page boxes, page count, content, fonts, and image limits", async () => {
  const bytes = await pdfWithPages([[432, 648]]);
  const result = await analyzeKdpPdf({
    fileName: "interior.pdf",
    bytes,
    expected: { kind: "interior", widthInches: 6, heightInches: 9, bleed: false },
  });
  assert.equal(result.status, "valid");
  assert.equal(result.pageCount, 1);
  assert.equal(result.pages[0].widthInches, 6);
  assert.equal(result.pages[0].heightInches, 9);
  assert.equal(result.pages[0].hasContents, true);
  assert.equal(result.fonts.total, 1);
  assert.equal(result.images.measurable, 0);
  assert.ok(result.findings.some((finding) => finding.code === "fonts-not-embedded"));
  assert.equal(result.findings.some((finding) => finding.code === "dimension-mismatch"), false);
});

test("RF-002 flags mixed sizes, missing content, and a missing EOF marker", async () => {
  const bytes = await pdfWithPages([[432, 648], [612, 792]], { eof: false });
  const result = await analyzeKdpPdf({
    fileName: "mixed.pdf",
    bytes,
    expected: { kind: "interior", widthInches: 6, heightInches: 9, bleed: false },
  });
  assert.equal(result.status, "valid");
  assert.equal(result.pageCount, 2);
  assert.ok(result.findings.some((finding) => finding.code === "eof-missing"));
  assert.ok(result.findings.some((finding) => finding.code === "mixed-page-sizes"));
  assert.equal(result.findings.some((finding) => finding.code === "page-missing-content"), false);
});

test("RF-003 compares a paperback cover spine and labels an inferred mismatch as possible", async () => {
  const bytes = await pdfWithPages([[1000, 700]]);
  const result = await analyzeKdpPdf({
    fileName: "cover.pdf",
    bytes,
    expected: {
      kind: "paperback-cover",
      widthInches: 12.9256,
      heightInches: 9.25,
      trimWidthInches: 6,
      trimHeightInches: 9,
      expectedSpineInches: 0.6756,
      bleed: true,
    },
  });
  assert.ok(result.findings.some((finding) => finding.code === "dimension-mismatch"));
  assert.ok(result.findings.some((finding) => finding.code === "cover-spine-mismatch"));
  assert.ok(result.findings.every((finding) => finding.message.toLowerCase().includes("possible") || finding.code === "eof-missing" || finding.code === "fonts-not-embedded"));
});

test("RF-004 rejects bytes that are not a PDF and never exposes file contents", async () => {
  const result = await analyzeKdpPdf({ fileName: "bad.bin", bytes: new TextEncoder().encode("not a pdf") });
  assert.equal(result.status, "invalid");
  assert.ok(result.findings.some((finding) => finding.code === "not-pdf"));
  assert.equal(JSON.stringify(result).includes("not a pdf"), false);
});

test("interior eligibility uses rounded pages while retaining the PDF count", async () => {
  for (const [count, min, max, outOfRange] of [[23, 24, 828, false], [21, 24, 828, true], [75, 75, 550, false], [551, 75, 550, true]]) {
    const bytes = await pdfWithPages(Array.from({ length: count }, () => [432, 648]));
    const result = await analyzeKdpPdf({
      fileName: "odd-interior.pdf", bytes,
      expected: { kind: "interior", widthInches: 6, heightInches: 9, bleed: false, pageLimit: { min, max } },
    });
    assert.equal(result.pageCount, count);
    assert.equal(result.findings.some((item) => item.code === "page-count-out-of-range"), outOfRange);
    const odd = result.findings.find((item) => item.code === "odd-page-count");
    assert.ok(odd);
    assert.match(odd.message, /print page counts/);
    assert.doesNotMatch(odd.message, /paperback/);
  }
});

test("cover setup rounding and range warnings appear in findings and report exports", async () => {
  for (const [pageCount, interior, expectedCode] of [[301, "black-white", "odd-page-count"], [50, "standard-color", "page-count-too-low"], [601, "standard-color", "page-count-too-high"]]) {
    const setup = calculateKdpSetup({ ...getKdpSetupDefaults(), pageCount, interior });
    assert.equal(setup.status, "valid");
    const { cover, spine, effectivePageCount } = setup.values;
    const bytes = await pdfWithPages([[cover.widthInches * 72, cover.heightInches * 72]]);
    const result = await analyzeKdpPdf({ fileName: "cover.pdf", bytes, expected: {
      kind: "paperback-cover", widthInches: cover.widthInches, heightInches: cover.heightInches,
      trimWidthInches: 6, trimHeightInches: 9, expectedSpineInches: spine.widthInches,
      bleed: true, expectedPageCount: 1, coverSetup: { pageCount, effectivePageCount, issues: setup.issues },
    } });
    assert.equal(result.pageCount, 1);
    assert.equal(result.findings.some((item) => item.code === "dimension-mismatch"), false);
    const notice = result.findings.find((item) => item.code === expectedCode);
    assert.ok(notice);
    assert.ok(formatKdpPdfReport(result).includes(notice.message));
    if (pageCount === 301) assert.equal(notice.message, "Spine uses 302 pages, rounded up from 301.");
  }
});

test("PDF UserUnit scales box dimensions and coordinates to physical points", async () => {
  const document = await PDFDocument.create();
  const page = document.addPage([216, 324]);
  page.setMediaBox(10, 20, 216, 324);
  page.setCropBox(10, 20, 216, 324);
  page.setTrimBox(15, 25, 200, 300);
  page.setBleedBox(12, 22, 210, 320);
  page.node.set(PDFName.of("UserUnit"), PDFNumber.of(2));
  page.drawRectangle({ x: 20, y: 30, width: 100, height: 100 });
  const result = await analyzeKdpPdf({ fileName: "scaled.pdf", bytes: await document.save(), expected: {
    kind: "interior", widthInches: 6, heightInches: 9, bleed: false,
  } });
  assert.equal(result.pages[0].widthInches, 6);
  assert.equal(result.pages[0].heightInches, 9);
  assert.equal(result.pages[0].mediaBox.x0, 20);
  assert.equal(result.pages[0].mediaBox.y0, 40);
  assert.equal(result.pages[0].cropBox.widthPoints, 432);
  assert.equal(result.pages[0].trimBox.widthPoints, 400);
  assert.equal(result.pages[0].bleedBox.heightPoints, 640);
  assert.equal(result.findings.some((item) => item.code === "dimension-mismatch"), false);
});

test("image resolution uses the lower axis for low DPI and the higher axis for over 600", async () => {
  // An RGB image stream avoids introducing an image encoder into the fixture.
  const document = await PDFDocument.create();
  const page = document.addPage([432, 648]);
  const image = document.context.stream(deflateSync(Buffer.alloc(1200 * 1800 * 3, 255)), {
    Type: "XObject", Subtype: "Image", Width: 1200, Height: 1800,
    ColorSpace: "DeviceRGB", BitsPerComponent: 8, Filter: "FlateDecode",
  });
  const imageRef = document.context.register(image);
  page.node.setXObject(PDFName.of("FixtureImage"), imageRef);
  // Horizontal/vertical DPI: 1200/300, 600/300, and 1200/200.
  page.node.addContentStream(document.context.register(document.context.flateStream(
    "q 72 0 0 432 0 0 cm /FixtureImage Do Q\nq 144 0 0 432 0 0 cm /FixtureImage Do Q\nq 72 0 0 648 0 0 cm /FixtureImage Do Q",
  )));
  const result = await analyzeKdpPdf({ fileName: "stretched-images.pdf", bytes: await document.save() });
  assert.equal(result.images.measurable, 3);
  assert.equal(result.images.lowResolution, 1);
  assert.equal(result.images.above600Dpi, 2);
  assert.equal(result.images.minimumDpi, 200);
  assert.ok(result.findings.some((item) => item.code === "image-above-600-dpi"));
});
