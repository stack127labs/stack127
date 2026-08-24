import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded managed-development preview.");

test("shows the default result and clears stale output for an invalid edit", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const tool = page.getByRole("region", { name: "rebuild exposure calculator" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Rebuild window and read-error exposure");
  await expect(tool.getByRole("heading", { name: "Total degraded window" })).toBeVisible();
  await expect(tool.getByText("32.0 TB", { exact: true })).toBeVisible();
  await page.getByRole("radio", { name: "RAID 6" }).check();
  await page.getByLabel("Drive count").fill("3");
  await expect(tool.getByRole("heading", { name: "Total degraded window" })).toHaveCount(0);
  await expect(page.getByText("RAID 6 needs at least 4 drives.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.getByLabel("Drive count")).toBeFocused();
});

test("calculates by keyboard, exposes the model, and resets", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  await page.getByLabel("Replacement delay").fill("6");
  await page.getByLabel("Replacement delay").press("Enter");
  await expect(page.getByRole("heading", { name: "Total degraded window" })).toBeFocused();
  await expect(page.getByText("6 hours before rebuild", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "How this model works" }).click();
  await expect(page.getByText("RAID 6 uses minimum source reads.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Drive count")).toHaveValue("6");
  await expect(page.getByRole("heading", { name: "Total degraded window" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "RAID 1", exact: true })).toBeFocused();
});

test("does not serialize inputs into requests or browser state", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const laterRequests: string[] = [];
  page.on("request", (request) => laterRequests.push(request.url()));
  const marker = "987654321";
  await page.getByLabel("Drive capacity").fill(marker);
  await page.getByRole("button", { name: "Calculate" }).click();
  expect(page.url()).toBe("http://127.0.0.1:3334/rebuild-calculator");
  expect(laterRequests.some((url) => url.includes(marker))).toBe(false);
  expect(await page.evaluate((needle) => {
    const values = [...Object.values(localStorage), ...Object.values(sessionStorage)];
    return values.some((value) => value.includes(needle));
  }, marker)).toBe(false);
});

for (const [width, height] of [[1280, 900], [760, 1000], [375, 1000], [320, 1100]]) {
  test(`keeps valid output usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/rebuild-calculator");
    await expect(page.getByRole("heading", { name: "Total degraded window" })).toBeVisible();
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
    const tool = page.getByRole("region", { name: "rebuild exposure calculator" });
    for (const control of await tool.locator("button, input, select").all()) {
      const box = await control.boundingBox();
      if (box && await control.isVisible()) expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
}

for (const theme of ["dark", "light"] as const) {
  test(`renders a complete result in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => localStorage.setItem("stack127-theme", selectedTheme), theme);
    await page.goto("/rebuild-calculator");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.getByRole("heading", { name: "Total degraded window" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}
