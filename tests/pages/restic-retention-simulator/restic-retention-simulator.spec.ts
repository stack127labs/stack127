import { expect, test } from "playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/restic-retention-simulator");
  await expect(page.getByLabel("Snapshot JSON")).toBeVisible();
});

test("renders decisions, timestamps, and clears stale output", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Restic retention simulator" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose snapshot groups and retention periods" })).toBeVisible();
  await page.getByRole("button", { name: "Preview retention" }).click();
  await expect(page.getByLabel("Retention result")).toBeFocused();
  await expect(page.getByText(/Kept \d+ of \d+ snapshots/)).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Time" })).toBeVisible();
  await page.getByRole("button", { name: "Copy trace" }).click();
  await expect(page.getByRole("button", { name: "Trace copied" })).toBeVisible();
  await page.getByLabel("Snapshot JSON").press("End");
  await page.getByLabel("Snapshot JSON").type(" ");
  await expect(page.getByLabel("Retention result")).toHaveCount(0);
});

test("marks and focuses invalid snapshot JSON", async ({ page }) => {
  await page.getByLabel("Snapshot JSON").fill("{");
  await page.getByRole("button", { name: "Preview retention" }).click();
  await expect(page.getByLabel("Snapshot JSON")).toBeFocused();
  await expect(page.getByLabel("Snapshot JSON")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("alert")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Fix input" })).toHaveCount(0);
  await expect(page.getByLabel("Retention result")).toHaveCount(0);
});

test("keeps the mobile result inside the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("button", { name: "Preview retention" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
  await expect(page.getByRole("table", { name: "Snapshot retention decisions" })).toBeVisible();
});
