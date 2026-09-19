import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/kdp-book-setup-calculator");
  await expect(page.getByRole("button", { name: "Calculate setup" })).toBeVisible();
});

test("calculates one focused cover answer and accepts a revised page count", async ({ page }) => {
  await page.getByRole("button", { name: "Calculate setup" }).click();
  const answer = page.getByLabel("Paperback cover file");
  await expect(answer).toBeFocused();
  await expect(answer).toContainText("12.9256 in × 9.25 in");
  await expect(page.locator('output[aria-label="Paperback cover file"]')).toHaveCount(1);

  const pageCount = page.getByRole("textbox", { name: "Page count", exact: true });
  await pageCount.fill("200");
  await page.getByRole("button", { name: "Calculate setup" }).click();
  await expect(answer).toBeFocused();
  await expect(answer).toContainText("12.7004 in × 9.25 in");
});

test("resets focus and has no page overflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("button", { name: "Calculate setup" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await page.getByRole("button", { name: /Reset/ }).click();
  await expect(page.getByRole("radio", { name: "Paperback" })).toBeFocused();
});
