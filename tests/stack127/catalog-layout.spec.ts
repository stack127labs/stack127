import { expect, test } from "playwright/test";

const catalogs = [
  { path: "/dns-tools", cards: 7 },
  { path: "/domain-tools", cards: 12 },
  { path: "/storage-tools", cards: 13 },
];

test("catalog navigation works on desktop and mobile, then opens a tool", async ({ page }, testInfo) => {
  await page.goto("/dns-tools");
  for (const theme of ["dark", "light"]) {
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
    await page.screenshot({ path: testInfo.outputPath(`${theme}-catalog.png`), animations: "disabled" });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-app-sidebar]")).toBeHidden();
  await page.getByRole("button", { name: "Tool catalogs", exact: true }).click();
  await page.locator('[data-app-sidebar] a[href="/storage-tools"]').click();
  await expect(page).toHaveURL(/\/storage-tools$/);
  await expect(page.locator("[data-app-sidebar]")).toBeHidden();
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.locator('[data-app-sidebar] a[href="/domain-tools"]').click();
  await expect(page).toHaveURL(/\/domain-tools$/);
  await page.locator('[data-catalog-card][href="/domain-age"]').click();
  await expect(page).toHaveURL(/\/domain-age$/, { timeout: 30_000 });
  await expect(page.locator('[data-app-sidebar] a[href="/domain-expiry"]')).toBeVisible();
  await expect(page.locator('footer[aria-label="Site footer"]')).not.toContainText("Amazon Associate");
});

for (const catalog of catalogs) {
  test(`${catalog.path} uses the responsive catalog grid`, async ({ page }, testInfo) => {
    await page.goto(catalog.path);

    const hubNav = page.locator('[data-app-sidebar] nav[aria-label="Tool catalogs"]');
    await expect(hubNav.locator("a")).toHaveCount(catalogs.length);
    for (const target of catalogs) {
      await expect(hubNav.locator(`a[href="${target.path}"]`)).toHaveCount(1);
    }
    await expect(hubNav.locator('[aria-current="page"]')).toHaveAttribute("href", catalog.path);
    await expect(page.locator('[data-app-sidebar] a[href="/dns-lookup"]')).toHaveCount(0);

    const hero = page.locator("[data-entry-hero]");
    const cards = page.locator("[data-catalog-card]");
    await expect(hero).toBeVisible();
    await expect(cards).toHaveCount(catalog.cards);
    await expect(page.locator("[data-catalog-card-art] svg")).toHaveCount(catalog.cards);

    const background = await hero.evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(background).not.toBe("none");

    const columnCount = await cards.evaluateAll((elements) => {
      const leftEdges = elements.map((element) => Math.round(element.getBoundingClientRect().left));
      return new Set(leftEdges).size;
    });
    expect(columnCount).toBe(testInfo.project.name === "mobile" ? 1 : 3);

    if (testInfo.project.name === "chromium") {
      await page.setViewportSize({ height: 900, width: 800 });
      const tabletColumnCount = await cards.evaluateAll((elements) => {
        const leftEdges = elements.map((element) => Math.round(element.getBoundingClientRect().left));
        return new Set(leftEdges).size;
      });
      expect(tabletColumnCount).toBe(2);
    }

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
}

test("entry art remains visible in both themes", async ({ page }, testInfo) => {
  await page.goto("/about");
  const hero = page.locator("[data-entry-hero]");
  await expect(hero).toBeVisible();

  for (const theme of ["dark", "light"]) {
    await page.evaluate((nextTheme) => {
      document.documentElement.dataset.theme = nextTheme;
    }, theme);
    if (testInfo.project.name === "mobile") {
      await expect(hero.locator("svg")).toBeHidden();
    } else {
      await expect(hero.locator("svg")).toBeVisible();
    }
    const background = await hero.evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(background).not.toBe("none");

    if (process.env.STACK127_CAPTURE_UI === "1" && testInfo.project.name === "chromium") {
      await page.screenshot({ fullPage: true, path: `/tmp/stack127-about-${theme}.png` });
    }
  }
});

test("catalog cards render cleanly in dark and light themes", async ({ page }, testInfo) => {
  await page.goto("/dns-tools");

  for (const theme of ["dark", "light"]) {
    await page.evaluate((nextTheme) => {
      document.documentElement.dataset.theme = nextTheme;
    }, theme);
    await expect(page.locator("[data-catalog-card]").first()).toBeVisible();

    if (process.env.STACK127_CAPTURE_UI === "1" && testInfo.project.name === "chromium") {
      await page.screenshot({ fullPage: true, path: `/tmp/stack127-dns-tools-${theme}.png` });
    }
  }
});
