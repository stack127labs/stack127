import { expect, test } from "playwright/test";

test("self-host cards use the intended desktop and compact breakpoints", async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1280 });
  await page.goto("/self-host-apps");

  const grid = page.locator(".directory-card-grid");
  const sidebar = page.locator("[data-app-sidebar]");

  await expect(grid).toBeVisible();
  await expect
    .poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(3);
  await expect
    .poll(() => sidebar.evaluate((element) => Math.round(element.getBoundingClientRect().width)))
    .toBe(260);

  await page.setViewportSize({ height: 900, width: 1024 });
  await expect
    .poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(2);

  await page.setViewportSize({ height: 900, width: 960 });
  await expect(page.getByRole("button", { name: "Filters" })).toBeVisible();
  await expect
    .poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(3);

  await page.setViewportSize({ height: 900, width: 900 });
  await expect
    .poll(() => grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length))
    .toBe(2);
});
