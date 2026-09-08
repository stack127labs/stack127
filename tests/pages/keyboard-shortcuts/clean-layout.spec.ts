import { expect, test } from "playwright/test";

test("reference stays readable without JavaScript and preserves shortcut meaning", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const slug of ["vscode", "github", "tmux", "vim"]) {
    const response = await page.goto(`${baseURL}/keyboard-shortcuts/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main table").first().locator("thead th")).toHaveCount(2);
    await expect(page.locator("main kbd").first()).toHaveCSS("border-bottom-width", "3px");
    await expect(page.locator("main kbd").filter({ hasText: /^then$/ })).toHaveCount(0);
    for (const theme of ["dark", "light"]) {
      await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
    }
    if (slug === "vscode") {
      await expect(page.locator("#paste")).toContainText("Ctrl + V");
      await expect(page.locator("#paste")).toContainText("Windows / Linux");
      await expect(page.locator("#add-line-comment")).toContainText("Ctrl + K then Ctrl + C");
      await expect(page.locator('a[href="#basic-editing"]')).toHaveCount(1);
    }
  }
  expect((await page.goto(`${baseURL}/keyboard-shortcuts/keycap-preview`))?.status()).toBe(404);
  await context.close();
});
