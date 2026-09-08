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

test("the shared shell uses the supplied image wordmark in both themes", async ({ page }) => {
  await page.goto("/");

  const header = page.locator('header a[aria-label="stack127 home"]');
  await expect(header.locator('img[src="/logos/stack127-wordmark-on-dark.png"]')).toBeVisible();
  await expect(header.locator('img[src="/logos/stack127-wordmark-on-light.png"]')).toBeHidden();

  await page.getByRole("button", { name: "Switch to light mode" }).click();

  await expect(header.locator('img[src="/logos/stack127-wordmark-on-dark.png"]')).toBeHidden();
  await expect(header.locator('img[src="/logos/stack127-wordmark-on-light.png"]')).toBeVisible();
});

test("the shared footer has no Amazon Associates disclosure", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByText("As an Amazon Associate I earn from qualifying purchases.", { exact: true }),
  ).toHaveCount(0);
});

test("the compact sidebar releases the page when the viewport becomes desktop", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/self-host-apps");

  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

  await page.setViewportSize({ width: 1280, height: 800 });

  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("[data-app-sidebar]")).toBeVisible();
});
