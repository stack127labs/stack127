import { expect, test } from "playwright/test";

test("tests, clears stale output, validates, and resets", async ({ page }) => {
  await page.goto("/dockerignore-tester");
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("region", { name: ".dockerignore pattern tester", exact: true })).toHaveCount(1);
  await expect(page.getByRole("region", { name: ".dockerignore tester inputs and results", exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Load example" }).click();
  await page.getByRole("button", { name: "Test patterns" }).click();
  const answer = page.getByRole("heading", { name: /path lines/ });
  await expect(answer).toBeFocused();
  await expect(answer).toHaveText("3 path lines: 1 Excluded, 2 Included.");
  await page.getByLabel(".dockerignore rules").fill("[");
  await expect(page.getByRole("heading", { name: /path lines/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Test patterns" }).click();
  await expect(page.getByLabel(".dockerignore rules")).toBeFocused();
  await expect(page.getByLabel(".dockerignore rules")).toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Root .dockerignore")).toBeChecked();
  await expect(page.getByLabel(".dockerignore rules")).toHaveValue("");
});

test("keeps state queries unsupported and preserves other URL parts", async ({ page }) => {
  await page.goto("/dockerignore-tester?foo=1&state=%3Cscript%3E&state=two&bar=2#trace");
  await expect(page).toHaveURL(/\?foo=1&bar=2#trace$/);
  await expect(page.locator("form").getByText("Shared inputs are not supported", { exact: true })).toBeVisible();
  await expect(page.getByLabel(".dockerignore rules")).toHaveValue("");
});

for (const [width, height] of [[1280, 720], [760, 1024], [390, 844], [320, 900]]) {
  test(`has no result overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/dockerignore-tester");
    await page.getByRole("button", { name: "Load example" }).click();
    await page.getByRole("button", { name: "Test patterns" }).click();
    for (const summary of await page.getByText("Show trace", { exact: true }).all()) await summary.click();
    await page.getByText("Rule diagnostics", { exact: true }).click();
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
    for (const table of await page.locator("table").all()) {
      const metrics = await table.evaluate((element) => ({
        className: element.className,
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(metrics.scrollWidth - metrics.clientWidth, JSON.stringify(metrics)).toBeLessThanOrEqual(1);
    }
    const touchTargets = page
      .getByRole("region", { name: ".dockerignore tester inputs and results", exact: true })
      .locator("button, textarea, summary, label:has(input[type=radio])");
    for (const control of await touchTargets.all()) {
      const box = await control.boundingBox();
      if (box) expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
}
