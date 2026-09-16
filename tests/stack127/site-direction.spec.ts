import { expect, test } from "playwright/test";

test("global discovery and missing-page recovery lead to published resources", async ({ page }, testInfo) => {
  test.slow();
  const about = await page.goto("/about");
  expect(about?.status()).toBe(200);
  const nav = page.getByRole("navigation", { name: "Main navigation", exact: true });
  const explore = nav.getByRole("link", { name: "explore", exact: true, includeHidden: true });
  await expect(explore).toHaveAttribute("href", "/");
  if (testInfo.project.name === "mobile") {
    await nav.getByRole("link", { name: "stack127 home", exact: true }).click();
  } else {
    await expect(explore).toBeVisible();
    await explore.click();
  }
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
  await expect(page.locator("[data-app-main] h1")).toHaveText("Tools and directories for tech tinkerers and hustlers");

  const start = page.getByRole("region", { name: "Start here" });
  for (const href of ["/domain-tools", "/cli-apps", "/keyboard-shortcuts", "/self-hosting-for-beginners"]) {
    await expect(start.locator(`a[href="${href}"]`)).toBeVisible();
  }

  const missing = await page.goto("/missing-positioning-check");
  expect(missing?.status()).toBe(404);
  await page.getByRole("link", { name: "Explore stack127", exact: true }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
});

test("information-page navigation works on desktop and in the mobile drawer", async ({ page }, testInfo) => {
  await page.goto("/terms");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Pages", exact: true }).click();
  }
  const nav = page.getByRole("navigation", { name: "Info pages", exact: true });
  await expect(nav.getByRole("link", { name: "explore", exact: true })).toBeVisible();
  await expect(nav.locator('a[href="/self-host-apps"]')).toHaveCount(0);
  await nav.getByRole("link", { name: "about", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/, { timeout: 30_000 });
  await expect(page.locator("[data-app-main] h1")).toHaveText("About stack127");
  await expect(page.locator("#how-we-earn-money")).toContainText("As an Amazon Associate I earn from qualifying purchases.");
  await expect(page.locator('a[href="/labs"]')).not.toHaveCount(0);
});

test("updated entry pages keep their layout in both themes", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "This check already covers desktop and mobile widths.");
  test.slow();
  for (const route of ["/", "/about", "/terms"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("[data-app-main] h1")).toBeVisible();
    for (const theme of ["dark", "light"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      for (const width of [1280, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        if (route !== "/" && width >= 1100) {
          const header = await page.locator("[data-entry-hero] header").boundingBox();
          const art = await page.locator("[data-entry-hero] > span > svg").boundingBox();
          expect(header).not.toBeNull();
          expect(art).not.toBeNull();
          expect(header!.x + header!.width).toBeLessThanOrEqual(art!.x);
        }
        await page.screenshot({ path: testInfo.outputPath(`${route.replaceAll("/", "") || "home"}-${theme}-${width}.png`), fullPage: true, animations: "disabled" });
      }
    }
  }
});
