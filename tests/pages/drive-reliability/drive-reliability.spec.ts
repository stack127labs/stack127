import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";

test.describe("Drive Reliability Explorer", () => {
  test("keeps the clean canonical URL unchanged through hydration", async ({ page }) => {
    test.skip(!localPreview, "Use the guarded managed-development preview for the registry-backed route.");
    await page.goto("/drive-reliability");
    await expect(page.getByRole("heading", { name: /drive reliability/i })).toBeVisible();
    const historyLength = await page.evaluate(() => history.length);
    await expect(page).toHaveURL(/\/drive-reliability$/);
    await page.waitForTimeout(1_000);
    await expect(page).toHaveURL(/\/drive-reliability$/);
    expect(await page.evaluate(() => history.length)).toBe(historyLength);

    await page.getByRole("searchbox", { name: /model or manufacturer/i }).fill("WUH722222ALE6L4");
    await expect(page).toHaveURL(/\/drive-reliability$/);
    await page.getByRole("button", { name: /select/i }).first().click();
    await expect(page).toHaveURL(/\/drive-reliability$/);
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
  });

  test("requires a deliberate selection and keeps secondary filters disclosed", async ({ page }) => {
    test.skip(!localPreview, "Use the guarded managed-development preview for the registry-backed route.");
    await page.goto("/drive-reliability");

    await expect(page.getByText("Observed AFR", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /share selection/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /filter model list/i })).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("[data-advanced-filters]")).toBeHidden();

    await page.getByRole("searchbox", { name: /model or manufacturer/i }).fill("WDC");
    await expect(page.getByText("Observed AFR", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("columnheader", { name: "AFR" })).toHaveCount(0);

    await page.getByRole("button", { name: /filter model list/i }).click();
    await expect(page.locator("[data-advanced-filters]")).toBeVisible();
  });

  test("filters, selects, resets, and restores a bounded share state", async ({ page }) => {
    test.skip(!localPreview, "Use the guarded managed-development preview for the registry-backed route.");
    await page.goto("/drive-reliability");
    await expect(page.getByRole("heading", { name: /drive reliability/i })).toBeVisible();
    await page.getByText("Lifetime", { exact: true }).click();
    await page.getByRole("searchbox", { name: /model/i }).fill("HUH728080ALE600");
    await page.getByRole("button", { name: /select/i }).first().click();
    await expect(page.getByText("Observed AFR", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Selected cohort evidence" })).toBeVisible();
    await expect(page.getByRole("button", { name: /share selection/i })).toBeVisible();
    await page.getByRole("button", { name: /reset/i }).click();
    await expect(page.getByRole("searchbox", { name: /model/i })).toHaveValue("");
  });

  test("withholds rows and focuses invalid capacity input", async ({ page }) => {
    test.skip(!localPreview, "Use the guarded managed-development preview for the registry-backed route.");
    await page.goto("/drive-reliability");
    await page.getByRole("button", { name: /filter model list/i }).click();
    const capacityInputs = page.locator('[data-capacity-fields] input[inputmode="decimal"]');
    await capacityInputs.nth(0).fill("24");
    await capacityInputs.nth(1).fill("16");
    await capacityInputs.nth(0).press("Enter");
    await expect(page.getByText("Minimum capacity must not exceed maximum capacity.")).toBeVisible();
    await expect(page.getByRole("table", { name: /available drive cohorts/i })).toHaveCount(0);
    await expect(capacityInputs.nth(0)).toBeFocused();
  });

  test("keeps result evidence inspectable on mobile in both themes", async ({ page }) => {
    test.skip(!localPreview, "Use the guarded managed-development preview for the registry-backed route.");
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/drive-reliability");
    await page.getByRole("searchbox", { name: /model/i }).fill("WUH722222ALE6L4");
    await page.getByRole("button", { name: /select/i }).first().click();
    await expect(page.locator("[data-drive-reliability-result]")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    const scrollOwners = await page.locator("[data-evidence-scroll]").evaluateAll((elements) => elements.map((element) => ({ scrollWidth: element.scrollWidth, clientWidth: element.clientWidth })));
    expect(scrollOwners.length).toBe(1);
    expect(scrollOwners.every(({ scrollWidth, clientWidth }) => scrollWidth >= clientWidth)).toBe(true);
  });
});
