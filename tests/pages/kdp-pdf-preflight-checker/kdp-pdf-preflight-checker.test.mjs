import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { analyzeKdpPdf } from "../../../lib/kdp/pdf-preflight.ts";

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
