import { expect, test, type Page } from "playwright/test";

async function addDrive(page: Page, value: string) {
  await page.getByRole("button", { name: "Add drive" }).click();
  const rows = page.getByTestId("drive-row");
  await rows.last().getByRole("textbox").fill(value);
}

test.describe("RAID calculator interface contract", () => {
  test("keeps a clean canonical URL and reports empty submission once", async ({ page }) => {
    await page.goto("/raid-calculator");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/raid-calculator$/);
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByText("Add at least 3 drives for RAID 5.")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Add drive" })).toBeFocused();
  });

  test("calculates a mixed RAID 5 without repeated result values", async ({ page }) => {
    await page.goto("/raid-calculator");
    for (const value of ["2", "3", "4", "4"]) await addDrive(page, value);
    await page.getByRole("button", { name: "Calculate capacity" }).click();

    const result = page.getByLabel("RAID capacity result");
    await expect(result.getByLabel("Theoretical usable capacity")).toContainText("5.46 TiB");
    await expect(result.getByText("RAID 5 across 4 drives.")).toBeVisible();
    await expect(result.getByRole("figure", { name: "Raw capacity allocation" })).toBeVisible();
    await expect(result.getByText("1.82 TiB", { exact: true })).toHaveCount(1);
    await expect(result.getByRole("heading", { name: "Nested drive groups" })).toHaveCount(0);
    await expect(result.getByText("RAID is not backup.")).toHaveCount(0);
  });

  test("shows required RAID 50 grouping and exact nested records", async ({ page }) => {
    await page.goto("/raid-calculator");
    await page.locator("label").filter({ hasText: /^RAID 50$/ }).click();
    await expect(page.getByText("Drives per RAID 5 group")).toBeVisible();
    for (const value of ["2", "2", "3", "4", "4", "4"]) await addDrive(page, value);
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByRole("heading", { name: "Nested drive groups" })).toBeVisible();
    if ((page.viewportSize()?.width ?? 0) <= 760) {
      await expect(page.locator("dl").filter({ hasText: "Group A" }).first()).toContainText("Drive 1, Drive 2, Drive 3");
    } else {
      await expect(page.getByRole("table", { name: "Nested drive groups" })).toContainText("Drive 1, Drive 2, Drive 3");
    }
  });

  test("contains open details and every control at narrow widths", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/raid-calculator");
    for (const value of ["4", "4", "4"]) await addDrive(page, value);
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByRole("button", { name: "Calculation details" }).click();
    const metrics = await page.evaluate(() => ({
      body: document.body.scrollWidth,
      viewport: document.documentElement.clientWidth,
      details: document.querySelector('[data-testid="calculation-details"]')?.scrollWidth ?? 0,
      detailsWidth: document.querySelector('[data-testid="calculation-details"]')?.clientWidth ?? 0,
    }));
    expect(metrics.body).toBeLessThanOrEqual(metrics.viewport);
    expect(metrics.details).toBeLessThanOrEqual(metrics.detailsWidth + 1);
  });
});
