import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/rsync-filter-tester");
  await expect(page.getByLabel("Filter rules")).toBeVisible();
});

test("shows first-match and unvisited decisions", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Rsync filter tester" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Test paths from the transfer root" })).toBeVisible();
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByRole("button", { name: "Test filters" }).click();
  await expect(page.getByLabel("Rsync filter result")).toBeFocused();
  await expect(page.getByText(/Included \d+, excluded \d+, unvisited \d+/)).toBeVisible();
  await expect(page.getByText("unvisited", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Copy report" }).click();
  await expect(page.getByRole("button", { name: "Report copied" })).toBeVisible();
});

test("marks and focuses an invalid path", async ({ page }) => {
  await page.getByLabel("Filter rules").fill("+ **");
  await page.getByLabel("Representative paths").fill("/absolute");
  await page.getByRole("button", { name: "Test filters" }).click();
  await expect(page.getByLabel("Representative paths")).toBeFocused();
  await expect(page.getByLabel("Representative paths")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Fix input" })).toHaveCount(0);
  await expect(page.getByLabel("Rsync filter result")).toHaveCount(0);
});

test("keeps empty-input errors with the fields", async ({ page }) => {
  await page.getByRole("button", { name: "Test filters" }).click();
  await expect(page.getByLabel("Filter rules")).toBeFocused();
  await expect(page.getByLabel("Filter rules")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Representative paths")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("button", { name: "Fix input" })).toHaveCount(0);
  await expect(page.getByLabel("Rsync filter result")).toHaveCount(0);
});

test("stacks result cells without page overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByRole("button", { name: "Test filters" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
});
