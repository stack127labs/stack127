import { expect, test } from "playwright/test";

test("the published Zigbee directory renders its searchable catalog", async ({ page }) => {
  test.setTimeout(180_000);
  const response = await page.goto("/zigbee-devices");
  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-app-main] h1")).toContainText(/Zigbee compatible devices/i);
  await expect(page.locator(".directory-card").first()).toBeVisible();
});
