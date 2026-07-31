import { expect, test, type Page } from "playwright/test";

async function openMobileFilters(page: Page) {
  const filtersButton = page.getByRole("button", { name: "Filters", exact: true });

  if (await filtersButton.isVisible()) {
    await filtersButton.click();
  }
}

test("license links open the directory with a canonical live filter", async ({ page }) => {
  await page.goto("/self-host-apps?license=agpl-3-0");
  await openMobileFilters(page);

  await expect(page.getByRole("group", { name: "License" })).toBeVisible();
  await expect(page.getByRole("link", { name: /License: AGPL-3\.0/ })).toBeVisible();
  await expect(
    page
      .getByRole("group", { name: "License" })
      .locator(".filter-tag")
      .getByText("AGPL-3.0", { exact: true }),
  ).toBeVisible();

  const cards = page.locator(".directory-card");
  await expect(cards.first()).toBeVisible();
  const licenseIds = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-license-id")),
  );
  expect(new Set(licenseIds)).toEqual(new Set(["agpl-3-0"]));

  const overflows = await page.evaluate(() => ({
    body: document.body.scrollWidth > document.body.clientWidth,
    document: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  }));
  expect(overflows).toEqual({ body: false, document: false });
});

test("the sidebar can add a license without a full form submission", async ({ page }) => {
  await page.goto("/self-host-apps");
  await openMobileFilters(page);

  const group = page.getByRole("group", { name: "License" });
  await group.getByRole("button", { name: "Add license" }).click();
  await group.getByRole("button", { name: /AGPL-3\.0/ }).click();

  await expect(page).toHaveURL(/\/self-host-apps\?license=agpl-3-0$/);
  await expect(page.getByRole("link", { name: /License: AGPL-3\.0/ })).toBeVisible();
});
