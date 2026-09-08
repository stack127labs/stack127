import { expect, test } from "playwright/test";


test("checks separately, clears stale results, imports, and resets", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Home Assistant Energy Entity Eligibility Checker");
  await expect(page.getByText(/^Attributes (?:do not )?match /)).toHaveCount(0);
  await page.getByRole("button", { name: "Check entity" }).click();
  await expect(page.getByText("Attributes match Grid import.", { exact: true })).toBeFocused();
  await expect(page.getByText("Statistics attributes match.", { exact: true })).toBeVisible();
  await expect(page.getByText("Core 2026.8.1", { exact: false })).toBeVisible();
  await page.getByLabel("Unit").fill("KWh");
  await expect(page.getByText(/^Attributes (?:do not )?match /)).toHaveCount(0);
  await page.getByRole("button", { name: "Check entity" }).click();
  await expect(page.getByText("Attributes do not match Grid import.", { exact: true })).toBeFocused();
  await expect(page.locator('td[data-label="Received"] code').getByText("KWh", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Paste attributes" }).click();
  await page.getByLabel("Pasted attributes").fill("entity_id: sensor.water\nstate: 12.5\ndevice_class: water\nstate_class: total\nunit_of_measurement: m³");
  await page.getByRole("button", { name: "Import attributes" }).click();
  await expect(page.getByLabel("Entity ID")).toHaveValue("sensor.water");
  await expect(page.getByLabel("Device class")).toHaveValue("water");
  await page.getByRole("radio", { name: "Water", exact: true }).focus();
  await page.getByRole("radio", { name: "Water", exact: true }).press("Space");
  await page.getByRole("button", { name: "Check entity" }).click();
  await expect(page.getByText("Attributes match Water.", { exact: true })).toBeFocused();

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByLabel("Grid import")).toBeChecked();
  await expect(page.getByLabel("Battery charge")).toBeFocused();
  await expect(page.getByLabel("Entity ID")).toHaveValue("sensor.grid_import");
  await expect(page.getByText(/^Attributes (?:do not )?match /)).toHaveCount(0);
});

test("supports keyboard submit and focuses invalid paste recovery", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  const unit = page.getByLabel("Unit");
  await unit.focus();
  await unit.press("Enter");
  await expect(page.getByText("Attributes match Grid import.", { exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Paste attributes" }).click();
  await page.getByLabel("Pasted attributes").fill("device_class: energy\ndevice_class: power");
  await page.getByRole("button", { name: "Import attributes" }).click();
  await expect(page.getByLabel("Pasted attributes")).toBeFocused();
  await expect(page.getByLabel("Pasted attributes")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Remove duplicate supported keys.", { exact: true })).toBeVisible();
  await expect(page.getByText(/^Attributes (?:do not )?match /)).toHaveCount(0);
});

test("keeps the supporting guide readable after the tool", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  const tool = page.getByRole("region", { name: "Energy entity checker inputs and results" });
  const guideHeading = page.getByRole("heading", { name: "Choose the Energy field before judging the sensor" });
  await expect(guideHeading).toBeVisible();
  expect(await tool.evaluate((node) => node.compareDocumentPosition(document.querySelector("article")!) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
  await expect(page.locator("article table").filter({ hasText: "Energy field" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home Assistant Energy FAQ" })).toHaveAttribute("href", "https://www.home-assistant.io/docs/energy/faq/");
  await expect(page.getByRole("link", { name: "stack127 privacy policy" })).toHaveAttribute("href", "/privacy");
});

test("keeps Energy and statistics conclusions independent", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  await page.getByLabel("Device class").fill("power");
  await page.getByLabel("State class").fill("measurement");
  await page.getByLabel("Unit").fill("W");
  await page.getByRole("button", { name: "Check entity" }).click();

  const conclusions = page.getByRole("region", { name: "Eligibility conclusions" });
  await expect(conclusions.getByText("Attributes do not match Grid import.", { exact: true })).toBeVisible();
  await expect(conclusions.getByText("Statistics attributes match.", { exact: true })).toBeVisible();
  await expect(conclusions.getByText("Live Energy validation was not inspected.", { exact: true })).toBeVisible();

  const statisticsRule = page.locator("tbody tr").filter({ hasText: "Statistics" });
  await expect(statisticsRule).toContainText("State class");
  await expect(statisticsRule).toContainText("measurement");
  await expect(statisticsRule).toContainText("Pass");
});

test("removes unsupported state query without discarding other params", async ({ page }) => {
  await page.goto("/home-assistant-energy-entity-checker");
  await expect(page).toHaveURL(/\/home-assistant-energy-entity-checker$/);
  await page.goto("/home-assistant-energy-entity-checker?state=bad&keep=1#manual");
  await expect(page).toHaveURL(/\?keep=1#manual$/);
  await expect(page.locator("form").getByText("Shared inputs are not supported.", { exact: true })).toBeVisible();
});

for (const theme of ["dark", "light"] as const) {
  for (const [width, height] of [[1280, 800], [760, 1000], [375, 900], [320, 900]]) {
    test(`keeps the longest result visible at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript((selectedTheme) => {
        window.localStorage.setItem("stack127-theme", selectedTheme);
      }, theme);
      await page.goto("/home-assistant-energy-entity-checker");
      if (width === 320) await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
      await page.getByRole("button", { name: "Paste attributes" }).click();
      await page.getByLabel("Entity ID").fill(`sensor.${"a".repeat(248)}`);
      await page.getByLabel("Device class").fill("d".repeat(64));
      await page.getByLabel("State class").fill("s".repeat(64));
      await page.getByLabel("Unit").fill("u".repeat(32));
      await page.getByRole("button", { name: "Check entity" }).click();
      const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth,
      }));
      expect(overflow.document).toBeLessThanOrEqual(1);
      expect(overflow.body).toBeLessThanOrEqual(1);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByText(/^Statistics attributes (?:do not )?match\.$/)).toBeVisible();
      const tool = page.getByRole("region", {
        name: "Energy entity checker inputs and results",
      });
      for (const control of await tool.locator("button, input:not([type=radio]), textarea, summary, label:has(input[type=radio])").all()) {
        const box = await control.boundingBox();
        if (box && await control.isVisible()) {
          const detail = await control.evaluate((element) => ({ tag: element.tagName, text: element.textContent?.trim() }));
          expect(box.width, JSON.stringify(detail)).toBeGreaterThanOrEqual(44);
          expect(box.height, JSON.stringify(detail)).toBeGreaterThanOrEqual(44);
        }
      }
    });
  }
}

for (const theme of ["dark", "light"] as const) {
  test(`renders the complete valid page in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem("stack127-theme", selectedTheme);
    }, theme);
    await page.goto("/home-assistant-energy-entity-checker");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "Check entity" }).click();
    await expect(page.getByText("Attributes match Grid import.", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Energy and statistics answer different questions" })).toBeVisible();
    await expect(page.locator("article table").filter({ hasText: "Energy field" })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
