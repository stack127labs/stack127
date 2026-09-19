import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/kdp-royalty-calculator");
  await expect(page.getByRole("button", { name: "Calculate royalty" })).toBeVisible();
});

test("calculates one focused royalty and omits a blank target", async ({ page }) => {
  await page.getByRole("button", { name: "Calculate royalty" }).click();
  const answer = page.getByLabel("Royalty per sale");
  await expect(answer).toBeFocused();
  await expect(answer).toContainText("$1.39");
  await expect(page.getByLabel("Royalty result").getByText(/monthly target/)).toHaveCount(0);
  await expect(page.getByText("Fixed cost", { exact: true })).toBeVisible();
  await expect(page.getByText("Page cost", { exact: true })).toBeVisible();
});

test("preserves invalid money text and focuses it", async ({ page }) => {
  await page.getByLabel("List price (USD)").fill("9.9.9");
  await page.getByRole("button", { name: "Calculate royalty" }).click();
  await expect(page.getByLabel("List price (USD)")).toHaveValue("9.9.9");
  await expect(page.getByLabel("List price (USD)")).toBeFocused();
});
