import { expect, test } from "playwright/test";

test("the expanded catalog has enough pages for broad discovery", async ({ page }) => {
  await page.goto("/cli-apps");

  const pagination = page.getByRole("navigation", { name: "Terminal app pages" });
  await expect(pagination).toBeVisible();
  await expect(pagination.getByRole("link", { name: "11", exact: true })).toBeVisible();
});

test("job searches reach several relevant tools", async ({ page }) => {
  await page.goto("/cli-apps?q=kubernetes");

  const cards = page.locator(".cli-card");
  expect(await cards.count()).toBeGreaterThanOrEqual(8);
  await expect(page.getByRole("heading", { name: "kubectl", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Helm", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "K9s", exact: true })).toBeVisible();
});

test("the smallest practical categories still offer a useful choice", async ({ page }) => {
  await page.goto("/cli-apps?category=communication");
  expect(await page.locator(".cli-card").count()).toBeGreaterThanOrEqual(8);

  await page.goto("/cli-apps?category=databases");
  expect(await page.locator(".cli-card").count()).toBeGreaterThanOrEqual(8);
  await expect(page.getByRole("heading", { name: "DuckDB", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "pgcli", exact: true })).toBeVisible();
});
