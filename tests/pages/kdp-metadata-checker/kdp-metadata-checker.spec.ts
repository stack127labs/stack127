import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/kdp-metadata-checker");
  await expect(page.getByRole("button", { name: "Check metadata" })).toBeVisible();
});

test("keeps the checked snapshot visible and marks edits stale", async ({ page }) => {
  await page.getByRole("textbox", { name: "Title Required", exact: true }).fill("A Quiet Atlas");
  const description = page.getByRole("textbox", { name: "Description Required", exact: true });
  await description.fill("A short field guide.");
  await page.getByRole("button", { name: "Check metadata" }).click();
  const result = page.getByRole("status", { name: "Metadata check" });
  await expect(result).toBeFocused();
  await expect(result).toContainText("No possible issues");

  await description.fill("A short field guide. Visit example.com 🙂");
  await expect(page.getByText("Results are out of date. Check again.")).toBeVisible();
  await expect(result).toBeVisible();
  await page.getByRole("button", { name: "Check metadata" }).click();
  const resultRegion = page.getByRole("region", { name: "Metadata result" });
  await expect(resultRegion.getByText(/Remove URLs/)).toBeVisible();
  await expect(resultRegion.getByText(/Remove emoji/)).toBeVisible();
});

test("reset returns focus to title", async ({ page }) => {
  const title = page.getByRole("textbox", { name: "Title Required", exact: true });
  await title.fill("Draft");
  await page.getByRole("button", { name: /Reset/ }).click();
  await expect(title).toBeFocused();
});
