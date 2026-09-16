import { expect, test, type Page } from "playwright/test";

async function calculate(page: Page) {
  const calculateButton = page.getByRole("button", { name: "Calculate backup plan", exact: true });
  await expect(calculateButton).toBeEnabled();
  await calculateButton.click();
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toBeFocused();
  const position = await page.getByRole("heading", { name: "Backup plan result", exact: true }).evaluate((element) => ({
    bottom: element.getBoundingClientRect().bottom,
    headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
    top: element.getBoundingClientRect().top,
    viewportHeight: window.innerHeight,
  }));
  expect(position.top).toBeGreaterThanOrEqual(position.headerBottom);
  expect(position.bottom).toBeLessThanOrEqual(position.viewportHeight);
}

test("clean form has no result, keeps the URL, and reveals recovery fields on demand", async ({ page }) => {
  await page.goto("/backup-321-calculator");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("3-2-1 backup capacity calculator");
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/backup-321-calculator$/);
  await expect(page.getByRole("button", { name: "Calculate backup plan", exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Check recovery goals" })).not.toBeChecked();
  await expect(page.getByRole("textbox", { name: /Backup interval/ })).toHaveCount(0);
  await page.getByText("Check recovery goals", { exact: true }).click();
  await expect(page.getByRole("textbox", { name: /Backup interval/ })).toBeVisible();
  await expect(page.locator('p[role="status"]')).toContainText(/recovery fields/i);
});

test("calculates the lead answer first, checks recovery, and clears stale output on edit", async ({ page }) => {
  await page.goto("/backup-321-calculator");
  await calculate(page);
  const result = page.getByRole("region", { name: "Backup plan result" });
  await expect(result).toContainText("10.16 TB");
  await expect(page.getByLabel("One backup target capacity")).toContainText("10.16 TB");
  await expect(result.getByText("Local target", { exact: true })).toBeVisible();
  await expect(result.getByText("Off-site target", { exact: true })).toBeVisible();
  await expect(result.getByText("Both targets", { exact: true })).toBeVisible();
  await expect(result.getByText("Repository before headroom", { exact: true })).toBeVisible();
  await expect(result.getByText("Headroom", { exact: true })).toBeVisible();
  await expect(result.getByText("Copy 1", { exact: true })).toBeVisible();
  await expect(result.getByText("Source", { exact: true })).toBeVisible();
  await expect(result).not.toContainText(/compliant|safety score|isolated/i);
  await page.getByRole("textbox", { name: "Protected data", exact: true }).fill("3");
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/backup-321-calculator$/);

  await page.getByText("Check recovery goals", { exact: true }).click();
  await page.getByRole("button", { name: "Calculate backup plan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toBeFocused();
  await expect(page.getByText("Local full restore", { exact: true })).toBeVisible();
  await expect(page.getByText("Off-site full restore", { exact: true })).toBeVisible();
  await expect(page.getByText("144 hours", { exact: false })).toBeVisible();
});

test("invalid submission retains text, focuses the first bad field, and does not show a result", async ({ page }) => {
  await page.goto("/backup-321-calculator");
  await calculate(page);
  const source = page.getByRole("textbox", { name: "Protected data", exact: true });
  await source.fill("-1");
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Calculate backup plan", exact: true }).click();
  await expect(source).toBeFocused();
  await expect(source).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("status")).toContainText("Check the marked inputs.");
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(0);
  await expect(source).toHaveValue("-1");
});

test("recovery validation is conditional and blocks an invalid recovery plan", async ({ page }) => {
  await page.goto("/backup-321-calculator");
  const toggle = page.getByRole("checkbox", { name: "Check recovery goals" });
  await page.getByText("Check recovery goals", { exact: true }).click();
  await expect(toggle).toBeChecked();
  await expect(page.locator('p[role="status"]')).toContainText("Recovery fields available.");
  const interval = page.getByRole("textbox", { name: /Backup interval/ });
  await interval.fill("0");
  await page.getByRole("button", { name: "Calculate backup plan", exact: true }).click();
  await expect(interval).toBeFocused();
  await expect(interval).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(0);
  await expect(interval).toHaveValue("0");
});

test("display unit reformats the same result while result-driving edits clear it", async ({ page }) => {
  await page.goto("/backup-321-calculator");
  await calculate(page);
  const lead = page.getByLabel("One backup target capacity");
  await expect(lead).toContainText("10.16 TB");
  await page.getByRole("radiogroup", { name: "Show capacities in" }).getByText("TiB", { exact: true }).click();
  await expect(lead).toContainText("9.24 TiB");
  await expect(page).toHaveURL(/backup-321-calculator$/);
  await page.getByRole("radiogroup", { name: "Backup model" }).getByText("Full-only", { exact: true }).click();
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(0);
});

test("supports Enter, copy fallback, explicit share, reset, and valid restore", async ({ page }) => {
  await page.goto("/backup-321-calculator");
  await page.getByRole("textbox", { name: "Protected data", exact: true }).press("Enter");
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toBeFocused();
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => undefined } }));
  await page.getByRole("button", { name: "Copy summary", exact: true }).click();
  await expect(page.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Share plan", exact: true }).click();
  await expect(page).toHaveURL(/backup-321-calculator\?state=/);
  const sharedUrl = page.url();
  await expect(page.getByRole("textbox", { name: "Share URL", exact: true })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(sharedUrl);
  await expect(page.locator('p[role="status"]')).toContainText("Shared plan loaded.");
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page).toHaveURL(/backup-321-calculator$/);
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(0);
});

test("keeps selectable fallbacks when clipboard operations fail", async ({ page }) => {
  await page.goto("/backup-321-calculator");
  await calculate(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("blocked"); } } });
    document.execCommand = () => false;
  });
  await page.getByRole("button", { name: "Copy summary", exact: true }).click();
  await expect(page.locator('p[role="alert"]')).toContainText("Copy failed. Select summary.");
  await expect(page.getByRole("textbox", { name: "Copy summary", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Share plan", exact: true }).click();
  await expect(page).toHaveURL(/backup-321-calculator\?state=/);
  await expect(page.locator('p[role="alert"]')).toContainText("Share copy failed. URL ready.");
  await expect(page.getByRole("textbox", { name: "Share URL", exact: true })).toBeVisible();
});

test("keeps one result and one history entry on repeat submit, then exposes the receipt", async ({ page }) => {
  await page.goto("/backup-321-calculator");
  const historyLength = await page.evaluate(() => history.length);
  await calculate(page);
  await page.getByRole("button", { name: "Calculate backup plan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  await page.getByRole("button", { name: "Formula receipt", exact: true }).click();
  await expect(page.getByText("CISA data backup options", { exact: true })).toBeVisible();
  await expect(page.getByText("Formula 1; input 1; engine 1", { exact: true })).toBeVisible();
  await expect(page.getByText("roundHalfUp(previous source x (10,000 + annual growth basis points) / 10,000) per year", { exact: true })).toBeVisible();
  await expect(page.getByText("ceilDiv(repository x headroom rate basis points, 10,000)", { exact: true })).toBeVisible();
});

test("malformed state safely resets without result or unsafe markup", async ({ page }) => {
  await page.goto("/backup-321-calculator?state=not_base64");
  await expect(page).toHaveURL(/backup-321-calculator$/);
  await expect(page.locator('p[role="alert"]')).toContainText("Shared plan could not load.");
  await expect(page.getByRole("heading", { name: "Backup plan result", exact: true })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("__proto__");
});

for (const [width, height] of [[1440, 900], [760, 1000], [375, 900], [320, 900]]) {
  for (const theme of ["dark", "light"] as const) {
    test(`keeps the result readable at ${width}px in ${theme} theme`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript((value) => { localStorage.setItem("stack127-theme", value); }, theme);
      await page.goto("/backup-321-calculator");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await calculate(page);
      const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth,
      }));
      expect(overflow.document).toBeLessThanOrEqual(1);
      expect(overflow.body).toBeLessThanOrEqual(1);
      await expect(page.getByLabel("One backup target capacity")).toBeVisible();
      const buttons = page.locator("form button, [data-result-actions] button");
      for (const button of await buttons.all()) {
        if (await button.isVisible()) expect((await button.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
      }
    });
  }
}
