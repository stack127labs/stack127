import { expect, test } from "playwright/test";

for (const slug of ["zigbee-devices", "zigbee-coordinators", "z-wave-devices", "matter-devices", "nut-compatible-ups", "local-security-cameras"]) {
  test(`${slug} has scannable image-led cards and working drawers`, async ({ page }, testInfo) => {
    expect((await page.goto(`/${slug}`))?.status()).toBe(200);
    const cards = page.locator(".directory-card-grid > button");
    const first = cards.first();
    await expect(first).toBeVisible();
    await expect(first.locator("h2")).toHaveCount(1);
    await expect(first.locator("p")).toHaveCount(0);
    await expect(first.locator("[data-card-facts]")).toHaveCount(1);
    expect(await first.locator("[data-card-facts] dt svg").count()).toBe(await first.locator("dt").count());
    await expect(first.locator("[data-hardware-image]")).toHaveCSS("height", "200px");
    await expect.poll(() => first.locator("[data-hardware-image]").evaluate((frame) => {
      const image = frame.querySelector("img");
      return image ? image.complete && image.naturalWidth > 0 : frame.textContent?.includes("No image available");
    }), { timeout: 20_000 }).toBe(true);
    for (const width of [1600, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      if (width <= 960) await expect(page.locator("[data-app-sidebar]")).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      expect(await cards.evaluateAll((nodes) => nodes.every((node) => node.scrollWidth <= node.clientWidth))).toBe(true);
      if (width === 1600) expect(await cards.evaluateAll((nodes) => new Set(nodes.map((node) => Math.round(node.getBoundingClientRect().x))).size)).toBe(3);
      if (width === 1600 || width === 390) {
        for (const theme of ["dark", "light"]) {
          await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
          await first.scrollIntoViewIfNeeded();
          await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}.png`), animations: "disabled", caret: "initial" });
        }
      }
    }
    await first.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close device details", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(first).toBeFocused();
  });
}

test("a failed hardware image has an explicit fallback without breaking the card", async ({ page }) => {
  await page.route("**/storage/v1/object/public/stack127-media/**", (route) => route.abort());
  await page.goto("/zigbee-coordinators?q=BN-600052");
  const card = page.locator(".directory-card-grid > button").first();
  await expect(card.getByText("No image available", { exact: true })).toBeVisible();
  await card.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
