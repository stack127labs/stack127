import { expect, test } from "playwright/test";
import type { Page } from "playwright";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The tool requires the guarded managed-development preview.");

async function addDrive(page: Page, capacity: string, unit = "TB") {
  await page.getByRole("button", { name: "Add drive" }).click();
  const row = page.locator("[data-repeatable-row]").last();
  await row.getByLabel(/capacity$/i).fill(capacity);
  if (unit !== "TB") {
    await row.getByRole("button", { name: /unit/i }).click();
    await page.getByRole("option", { name: unit, exact: true }).click();
  }
}

async function addDrives(page: Page, capacities: string[], unit = "TB") {
  for (const capacity of capacities) await addDrive(page, capacity, unit);
}

test.describe("SHR capacity calculator", () => {
  test("starts empty and keeps inventory actions separate from calculation", async ({ page }) => {
    await page.goto("/shr-calculator");
    await expect(page.getByRole("heading", { name: /SHR capacity/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add drive" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Calculate capacity" })).toBeDisabled();
    await addDrive(page, "4");
    await expect(page.getByRole("button", { name: "Calculate capacity" })).toBeEnabled();
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByText("SHR-1 needs at least 2 drives.", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Estimated pool capacity", { exact: true })).toHaveCount(0);
  });

  test("calculates mixed SHR-1 and separates exact categories", async ({ page }) => {
    await page.goto("/shr-calculator");
    await addDrives(page, ["4", "4", "8", "8"]);
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByRole("heading", { name: "SHR-1 capacity", exact: true })).toBeVisible();
    await expect(page.getByTestId("primary-capacity")).toContainText(/15\.96/);
    await expect(page.getByLabel("Capacity allocation")).toContainText(/Protection\s*8 TB/);
    await expect(page.getByLabel("Capacity allocation")).toContainText(/Unused\s*0 TB/);
    await expect(page.getByRole("heading", { name: "Capacity bands", exact: true })).toBeVisible();
    await expect(page.getByRole("table", { name: "SHR capacity bands" })).toBeVisible();
    await expect(page.getByText("Fresh-pool estimate.", { exact: false })).toBeVisible();
  });

  test("switches to SHR-2 and shows an unused high tier", async ({ page }) => {
    await page.goto("/shr-calculator");
    await addDrives(page, ["4", "4", "8", "8"]);
    await page.getByText("SHR-2 · 2-drive protection", { exact: true }).click();
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByTestId("primary-capacity")).toContainText(/7\.96/);
    await expect(page.getByLabel("Capacity allocation")).toContainText(/Protection\s*8 TB/);
    await expect(page.getByLabel("Capacity allocation")).toContainText(/Unused\s*8 TB/);
    await expect(page.getByRole("row", { name: /Unused/ })).toBeVisible();
  });

  test("clears stale results and recovers from invalid SHR-2 input", async ({ page }) => {
    await page.goto("/shr-calculator");
    await addDrives(page, ["4", "4", "4", "4"]);
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByText("SHR-2 · 2-drive protection", { exact: true }).click();
    await page.getByRole("button", { name: "Remove drive 4" }).click();
    await expect(page.getByLabel("Estimated pool capacity", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByText(/SHR-2 needs at least 4 drives/i)).toBeVisible();
    await expect(page.getByLabel("Estimated pool capacity", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Add drive" }).click();
    await expect(page.getByRole("textbox", { name: "Drive 4 capacity", exact: true })).toBeFocused();
  });

  test("supports keyboard submit, reset, copy, and explicit share", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/shr-calculator");
    await page.getByRole("button", { name: "Add drive" }).focus();
    await page.getByRole("button", { name: "Add drive" }).press("Enter");
    await page.getByRole("textbox", { name: "Drive 1 capacity", exact: true }).fill("4");
    await page.getByRole("textbox", { name: "Drive 1 capacity", exact: true }).press("Enter");
    await expect(page.getByText("SHR-1 needs at least 2 drives.", { exact: true })).toBeVisible();
    await addDrives(page, ["4", "8", "8"]);
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByRole("button", { name: "Copy result" }).click();
    await expect(page.getByText(/copied/i)).toBeVisible();
    await page.getByRole("button", { name: "Share configuration" }).click();
    await expect(page).toHaveURL(/\?state=/);
    await expect(page.getByLabel("Shared configuration URL")).toBeVisible();
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(page).toHaveURL(/shr-calculator$/);
    await expect(page.getByRole("button", { name: "Add drive" })).toBeFocused();
  });

  test("restores valid state and cleans malformed state", async ({ page, context }) => {
    await page.goto("/shr-calculator");
    await addDrives(page, ["4", "4", "8", "8"]);
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByRole("button", { name: "Share configuration" }).click();
    const shared = page.url();
    const restored = await context.newPage();
    await restored.goto(shared);
    await expect(restored.getByText("Configuration restored", { exact: false })).toBeVisible();
    await expect(restored.getByTestId("primary-capacity")).toContainText(/15\.96/);
    await restored.goto("/shr-calculator?state=broken");
    await expect(restored.getByText(/Configuration restore failed/i)).toBeVisible();
    await expect(restored).toHaveURL(/shr-calculator$/);
  });

  for (const { width, height } of [{ width: 320, height: 900 }, { width: 375, height: 900 }, { width: 760, height: 900 }]) {
    test(`keeps valid inputs and result visible at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/shr-calculator");
      await addDrives(page, ["4", "4", "8", "8"]);
      await page.getByRole("button", { name: "Calculate capacity" }).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      const result = page.getByTestId("capacity-result");
      const box = await result.boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? width)).toBeLessThanOrEqual(width + 1);
      await expect(page.getByTestId("primary-capacity")).toBeVisible();
      await expect(page.getByRole("table", { name: "SHR capacity bands" })).toBeVisible();
      const allocation = page.getByLabel("Capacity allocation");
      const allocationBox = await allocation.boundingBox();
      expect(allocationBox?.x).toBeGreaterThanOrEqual(0);
      expect((allocationBox?.x ?? 0) + (allocationBox?.width ?? width)).toBeLessThanOrEqual(width + 1);
      const calculatedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(calculatedOverflow).toBeLessThanOrEqual(1);
    });
  }
});
