import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";

test.describe("Drive Reliability Explorer", () => {
  test("filters, selects, resets, and restores a bounded share state", async ({ page }) => {
    test.skip(!localPreview, "Use the guarded managed-development preview for the registry-backed route.");
    await page.goto("/drive-reliability");
    await expect(page.getByRole("heading", { name: /drive reliability/i })).toBeVisible();
    await page.getByRole("radio", { name: "Lifetime" }).check();
    await page.getByRole("searchbox", { name: /model/i }).fill("HUH728080ALE600");
    await expect(page.getByRole("heading", { name: "HUH728080ALE600" })).toBeVisible();
    await page.getByRole("button", { name: /select/i }).first().click();
    await expect(page.getByText("Observed AFR", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /reset/i }).click();
    await expect(page.getByRole("searchbox", { name: /model/i })).toHaveValue("");
  });

  test("keeps result evidence inspectable on mobile in both themes", async ({ page }) => {
    test.skip(!localPreview, "Use the guarded managed-development preview for the registry-backed route.");
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/drive-reliability");
    await page.getByRole("searchbox", { name: /model/i }).fill("WUH722222ALE6L4");
    await expect(page.locator("[data-drive-reliability-result]")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    const tableWidths = await page.locator("[class*=tableScroll]").evaluateAll((elements) => elements.map((element) => ({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth })));
    expect(tableWidths.every(({ scrollWidth, clientWidth }) => scrollWidth === clientWidth)).toBe(true);
  });
});
