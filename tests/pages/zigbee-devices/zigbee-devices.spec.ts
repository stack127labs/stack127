import { expect, test } from "playwright/test";

test("the unpublished Zigbee directory is unavailable without a preview row", async ({ page }) => {
  const response = await page.goto("/zigbee-devices");
  expect(response?.status()).toBe(404);
  await expect(page.locator("main h1")).toContainText(/not found/i);
});
