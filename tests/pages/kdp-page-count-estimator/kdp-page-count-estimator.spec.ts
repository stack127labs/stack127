import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/kdp-page-count-estimator");
  await expect(page.getByRole("button", { name: "Estimate pages" })).toBeVisible();
});

test("shows one focused range with model and KDP guidance", async ({ page }) => {
  await page.getByRole("button", { name: "Estimate pages" }).click();
  const answer = page.getByLabel("Estimated print pages");
  await expect(answer).toBeFocused();
  await expect(answer).toContainText("100 to 138 pages");
  await expect(page.getByText("Typography model", { exact: true })).toBeVisible();
  await expect(page.getByText("KDP guidance", { exact: true })).toBeVisible();
  await expect(page.getByRole("table", { name: "KDP inside margin bands" })).toBeVisible();
});

test("focuses an invalid field and keeps narrow layout bounded", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  const fontSize = page.getByRole("textbox", { name: "Font size", exact: true });
  await fontSize.fill("");
  await page.getByRole("button", { name: "Estimate pages" }).click();
  await expect(fontSize).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
});
