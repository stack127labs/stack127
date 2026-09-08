import { expect, test } from "playwright/test";

test("course title and byline align with the lesson text", async ({ page }, testInfo) => {
  const widths = testInfo.project.name === "mobile" ? [390] : [1280, 1600, 800];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/self-hosting-for-beginners");
    const title = page.locator("main h1");
    const byline = page.locator(".lesson-byline");
    const paragraph = page.locator(".lesson-page > p").first();
    await expect(title).toBeVisible();
    await expect(paragraph).toBeVisible();

    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      const titleBox = await title.boundingBox();
      const bylineBox = await byline.boundingBox();
      const paragraphBox = await paragraph.boundingBox();
      expect(titleBox).not.toBeNull();
      expect(bylineBox).not.toBeNull();
      expect(paragraphBox).not.toBeNull();
      expect(Math.abs(titleBox!.x - paragraphBox!.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(bylineBox!.x - paragraphBox!.x)).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() =>
        document.documentElement.scrollWidth > document.documentElement.clientWidth,
      )).toBe(false);

      if (process.env.STACK127_CAPTURE_UI === "1") {
        await page.screenshot({ path: `/tmp/stack127-course-header-${width}-${theme}.png` });
      }
    }
  }
});
