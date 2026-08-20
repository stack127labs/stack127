import { expect, test } from "playwright/test";

test("the shared shell does not overflow at the 320px minimum width", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");

  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBe(viewport.clientWidth);
});
