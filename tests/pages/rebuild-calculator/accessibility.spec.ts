import { expect, test } from "playwright/test";


test("associates invalid fields and exposes a polite result announcement", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const count = page.getByRole("textbox", { name: "Drive count", exact: true });
  await count.fill("3");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(count).toHaveAttribute("aria-invalid", "true");
  const describedBy = await count.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(page.locator(`#${describedBy}`)).toContainText("RAID 6 needs at least 4 drives.");
  await count.fill("6");
  await count.press("Enter");
  await expect(page.getByRole("heading", { name: "Rebuild result" })).toBeFocused();
});

test("keeps the visual result understandable without color alone", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const visual = page.getByRole("progressbar", { name: "Modeled read-error exposure" });
  await expect(visual).toBeVisible();
  await expect(visual).toHaveAttribute("aria-valuetext", /%|less than/i);
  await expect(page.getByText("Modeled read-error exposure", { exact: true })).toBeVisible();
  await expect(page.getByText("Additional errors tolerated", { exact: true })).toBeVisible();
});
