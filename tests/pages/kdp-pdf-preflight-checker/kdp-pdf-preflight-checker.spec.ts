import { expect, test } from "playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";

test.beforeEach(async ({ page }) => {
  await page.goto("/kdp-pdf-preflight-checker");
  await expect(page.getByRole("button", { name: "Check PDF" })).toBeVisible();
});

test("checks a normal object-stream PDF and offers copy and download", async ({ page }) => {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const pdfPage = document.addPage([432, 648]);
  pdfPage.drawText("KDP PDF fixture", { x: 36, y: 600, font, size: 12 });
  const bytes = await document.save({ useObjectStreams: true });
  await page.locator('input[type="file"]').setInputFiles({ name: "fixture.pdf", mimeType: "application/pdf", buffer: Buffer.from(bytes) });
  await expect(page.getByRole("list", { name: "Selected PDF" })).toContainText("fixture.pdf");
  await expect(page.getByRole("list", { name: "Selected PDF" })).toContainText("Ready");
  await page.getByRole("button", { name: "Check PDF" }).click();
  await expect(page.getByText(/possible issues need review|No measurable issues found/)).toBeFocused();
  await expect(page.getByRole("table", { name: "PDF page geometry" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy report" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Download report" })).toBeVisible();
  await expect(page.getByText("Binding: Paperback", { exact: true })).toHaveCount(0);
});

test("cover scope is paperback-only and a missing file focuses the picker", async ({ page }) => {
  await page.getByText("Paperback cover", { exact: true }).click();
  await expect(page.getByText("Binding: Paperback", { exact: true })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Hardcover" })).toHaveCount(0);
  await page.getByRole("button", { name: "Check PDF" }).click();
  await expect(page.getByRole("button", { name: "Choose PDF" })).toBeFocused();
});

test("uses the standard-color paperback spine coefficient for a cover check", async ({ page }) => {
  const document = await PDFDocument.create();
  document.addPage([12.9256 * 72, 9.25 * 72]);
  const bytes = await document.save({ useObjectStreams: true });

  await page.getByText("Paperback cover", { exact: true }).click();
  await page.locator('button[data-tool-label="Interior"]').click();
  await page.getByRole("option", { name: "Standard color", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: "standard-color-cover.pdf", mimeType: "application/pdf", buffer: Buffer.from(bytes) });
  await page.getByRole("button", { name: "Check PDF" }).click();

  const result = page.getByRole("region", { name: "PDF preflight result" });
  await expect(result).toContainText("12.9256 × 9.25 in");
  await expect(result).not.toContainText("inferred spine");
});

test("rejects a non-PDF and lets the selected PDF be removed", async ({ page }) => {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("not a pdf") });
  await expect(page.getByText("Choose a PDF file.", { exact: true })).toBeVisible();
  await expect(page.getByRole("list", { name: "Selected PDF" })).toHaveCount(0);

  await fileInput.setInputFiles({ name: "interior.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7\n") });
  await expect(page.getByRole("list", { name: "Selected PDF" })).toContainText("interior.pdf");
  await page.getByRole("button", { name: "Remove interior.pdf" }).click();
  await expect(page.getByRole("list", { name: "Selected PDF" })).toHaveCount(0);
});
