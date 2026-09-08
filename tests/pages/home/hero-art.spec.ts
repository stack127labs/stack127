import { expect, test } from "playwright/test";

test("home corner art stays simple, themed and clear of the heading", async ({ page }, testInfo) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const hero = page.locator("[data-entry-hero]");
  const art = hero.locator('span[aria-hidden="true"]').filter({ has: page.locator("svg") });
  await expect(art.locator("title")).toHaveText("A terminal prompt on stacked app windows represents the software and tools collected on stack127.");
  await expect(art.locator("text")).toHaveCount(0);
  for (const theme of ["dark", "light"]) {
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
    for (const width of [1600, 1280, 1100, 390]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      if (width >= 1100) {
        await expect(art).toBeVisible();
        const box = await art.boundingBox();
        const title = await hero.locator("h1").boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(title!.x + title!.width);
        await art.screenshot({ path: testInfo.outputPath(`${theme}-${width}-art.png`) });
      } else {
        await expect(art).toBeHidden();
      }
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-home.png`) });
    }
  }
});
