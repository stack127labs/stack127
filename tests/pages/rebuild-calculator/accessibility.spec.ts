import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded managed-development preview.");

test("associates invalid fields and exposes a polite result announcement", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const count = page.getByLabel("Drive count");
  await count.fill("3");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(count).toHaveAttribute("aria-invalid", "true");
  const describedBy = await count.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy}`)).toContainText("RAID 6 needs at least 4 drives.");
  await count.fill("6");
  await count.press("Enter");
  await expect(page.getByRole("heading", { name: "Total degraded window" })).toHaveAttribute("aria-live", "polite");
});

test("keeps the visual result understandable without color alone", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const visual = page.getByRole("img", { name: /read-error exposure/i });
  await expect(visual).toBeVisible();
  await expect(visual).toHaveAttribute("aria-label", /percent/i);
  await expect(page.getByText("Modeled read-error exposure", { exact: true })).toBeVisible();
  await expect(page.getByText("Additional read errors tolerated", { exact: true })).toBeVisible();
});
