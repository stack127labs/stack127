import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded local preview.");

test("checks separately, clears stale results, imports, and resets", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Home Assistant Energy Entity Eligibility Checker");
  await expect(page.getByRole("heading", { name: /attributes match|attributes do not match/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Check entity" }).click();
  await expect(page.getByRole("heading", { name: /attributes match/i })).toBeFocused();
  await expect(page.getByText("Energy picker", { exact: true })).toBeVisible();
  await expect(page.getByText("Long-term statistics", { exact: true })).toBeVisible();
  await expect(page.getByText("Core 2026.8.1", { exact: false })).toBeVisible();
  await page.getByLabel("Unit").fill("KWh");
  await expect(page.getByRole("heading", { name: /attributes match|attributes do not match/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Check entity" }).click();
  await expect(page.getByRole("heading", { name: /do not match/i })).toBeFocused();
  await expect(page.locator('td[data-label="Received"] code').getByText("KWh", { exact: true })).toBeVisible();

  await page.getByLabel("Pasted attributes").fill("entity_id: sensor.water\nstate: 12.5\ndevice_class: water\nstate_class: total\nunit_of_measurement: m³");
  await page.getByRole("button", { name: "Import attributes" }).click();
  await expect(page.getByLabel("Entity ID")).toHaveValue("sensor.water");
  await expect(page.getByLabel("Device class")).toHaveValue("water");
  await page.getByRole("radio", { name: "Water", exact: true }).check();
  await page.getByRole("button", { name: "Check entity" }).click();
  await expect(page.getByRole("heading", { name: /attributes match/i })).toBeFocused();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Grid import")).toBeChecked();
  await expect(page.getByLabel("Entity ID")).toHaveValue("sensor.grid_import");
  await expect(page.getByRole("heading", { name: /attributes match|attributes do not match/i })).toHaveCount(0);
});

test("supports keyboard submit and focuses invalid paste recovery", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  const unit = page.getByLabel("Unit");
  await unit.focus();
  await unit.press("Enter");
  await expect(page.getByRole("heading", { name: /attributes match/i })).toBeFocused();
  await page.getByLabel("Pasted attributes").fill("device_class: energy\ndevice_class: power");
  await page.getByRole("button", { name: "Import attributes" }).click();
  await expect(page.getByLabel("Pasted attributes")).toBeFocused();
  await expect(page.locator("#energy-paste-error")).toBeVisible();
  await expect(page.getByRole("heading", { name: /attributes match|attributes do not match/i })).toHaveCount(0);
});

test("keeps the supporting guide readable after the tool", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  const tool = page.getByRole("region", { name: "Energy entity checker inputs and results" });
  const guideHeading = page.getByRole("heading", { name: "Choose the Energy field before judging the sensor" });
  await expect(guideHeading).toBeVisible();
  expect(await tool.evaluate((node) => node.compareDocumentPosition(document.querySelector("article")!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  await expect(page.getByRole("region", { name: "Home Assistant Energy field requirements" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home Assistant Energy FAQ" })).toHaveAttribute("href", "https://www.home-assistant.io/docs/energy/faq/");
  await expect(page.getByRole("link", { name: "stack127 privacy policy" })).toHaveAttribute("href", "/privacy");
});

test("keeps Energy and statistics conclusions independent", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  await page.getByLabel("Device class").fill("power");
  await page.getByLabel("State class").fill("measurement");
  await page.getByLabel("Unit").fill("W");
  await page.getByRole("button", { name: "Check entity" }).click();

  const energyConclusion = page.getByRole("heading", { name: "Energy picker" }).locator("..");
  const statisticsConclusion = page.getByRole("heading", { name: "Long-term statistics" }).locator("..");
  await expect(energyConclusion).toContainText("Fix the failed rules.");
  await expect(statisticsConclusion).toContainText("Attributes match. Check Statistics.");

  const statisticsRule = page.locator("tbody tr").filter({ hasText: "Statistics" });
  await expect(statisticsRule).toContainText("State class");
  await expect(statisticsRule).toContainText("measurement");
  await expect(statisticsRule).toContainText("Pass");
});

test("removes unsupported state query without discarding other params", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker?state=bad&keep=1");
  await expect(page).toHaveURL(/\?keep=1$/);
  await expect(page.locator("form").getByText("Shared inputs are not supported.", { exact: true })).toBeVisible();
});

for (const [width, height] of [[1280, 800], [760, 1000], [375, 900], [320, 900]]) {
  test(`keeps the longest result visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/home-assistant-energy-entity-checker");
    await page.getByLabel("Unit").fill("KWh");
    await page.getByRole("button", { name: "Check entity" }).click();
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
    await expect(page.getByText("Long-term statistics", { exact: true })).toBeVisible();
    const tool = page.getByRole("region", {
      name: "Energy entity checker inputs and results",
    });
    for (const control of await tool.locator("button, input, select, textarea").all()) {
      const box = await control.boundingBox();
      if (box && await control.isVisible()) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
}

for (const theme of ["dark", "light"] as const) {
  test(`renders the complete valid page in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem("stack127-theme", selectedTheme);
    }, theme);
    await page.goto("/home-assistant-energy-entity-checker");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "Check entity" }).click();
    await expect(page.getByRole("heading", { name: /attributes match/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Energy and statistics answer different questions" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Home Assistant Energy field requirements" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
