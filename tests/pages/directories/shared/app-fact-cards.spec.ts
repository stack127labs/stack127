import { expect, test } from "playwright/test";

for (const route of ["self-host-apps", "cli-apps"]) {
  for (const timezoneId of ["UTC", "Asia/Kolkata", "America/Los_Angeles"]) {
    test(`${route} hydrates without date mismatches in ${timezoneId}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, timezoneId });
      try {
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        expect((await page.goto(`/${route}`))?.status()).toBe(200);
        await page.locator(".directory-card").first().click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).not.toBeVisible();
        expect(errors).toEqual([]);
      } finally {
        await context.close();
      }
    });
  }
}

for (const route of ["self-host-apps", "cli-apps"]) {
  test(`${route} fact cards stay readable and open the existing details`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`/${route}`);
    expect(response?.status()).toBe(200);
    const cards = page.locator(".directory-card");
    const first = cards.first();
    await expect(first).toBeVisible();
    const name = await first.locator("h2").innerText();
    const labels = route === "self-host-apps"
      ? ["Source", "Pricing", "RAM", "Storage", "Last update"]
      : ["Stars", "Pricing", "License", "Platforms", "Version", "Last commit"];
    await expect(first.locator("dt")).toHaveText(labels);
    await expect(first.locator("dt svg[aria-hidden=true]")).toHaveCount(labels.length);
    await expect(first.locator("[data-card-category]")).toBeVisible();
    await expect(first.locator("a, button, input, select")).toHaveCount(0);
    await expect(first.locator(".cli-card-type, .directory-meta-list, .directory-card-stats")).toHaveCount(0);

    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      for (const width of [1600, 1255, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
        expect(await cards.evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1))).toBe(true);
        expect(await cards.locator("dd").evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth + 1))).toBe(true);
        if (width >= 1255) {
          const boxes = await cards.evaluateAll((nodes) => nodes.slice(0, 3).map((node) => node.getBoundingClientRect().y));
          expect(boxes.length).toBe(3);
          expect(Math.max(...boxes) - Math.min(...boxes)).toBeLessThan(2);
        }
        if (width === 1255 || width === 390) {
          await first.scrollIntoViewIfNeeded();
          await expect.poll(() => first.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
          await expect(first.locator("img")).toHaveAttribute("src", /^https:\/\//);
          await expect(first.locator("img")).toHaveCSS("opacity", "1");
          for (const image of await cards.locator("img").all()) {
            if (await image.evaluate((node) => node.getBoundingClientRect().top < innerHeight)) {
              await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
              await expect(image).toHaveCSS("opacity", "1");
            }
          }
          await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-cards.png`) });
          await first.click();
          const panel = page.getByRole("dialog");
          await expect(panel).toBeVisible();
          await expect(panel.getByRole("heading", { name, exact: true })).toBeVisible();
          await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-details.png`) });
          await panel.getByRole("button", { name: "Close app details" }).click();
          await expect(panel).not.toBeVisible();
        }
      }
    }
    await page.keyboard.press("Tab");
    await first.focus();
    expect(await first.evaluate((node) => getComputedStyle(node).boxShadow)).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}
