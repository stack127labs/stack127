import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded managed-development preview.");

test("shows the default result and clears stale output for an invalid edit", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const tool = page.getByRole("region", { name: "rebuild exposure calculator" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Rebuild window and read-error exposure");
  await expect(tool.getByRole("heading", { name: "Rebuild result" })).toBeVisible();
  await expect(tool.getByText("32.0 TB", { exact: true })).toBeVisible();
  await expect(tool.getByText("Total degraded window", { exact: true })).toHaveCount(1);
  await expect(tool.getByText("Modeled read-error exposure", { exact: true })).toHaveCount(1);
  await page.getByRole("textbox", { name: "Drive count", exact: true }).fill("3");
  await expect(tool.getByText("Total degraded window", { exact: true })).toHaveCount(0);
  await expect(page.getByText("RAID 6 needs at least 4 drives.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(page.getByRole("textbox", { name: "Drive count", exact: true })).toBeFocused();
});

test("calculates by keyboard, exposes the model, and resets", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const delay = page.getByRole("textbox", { name: "Replacement delay", exact: true });
  await delay.fill("6");
  await delay.press("Enter");
  await expect(page.getByRole("heading", { name: "Rebuild result" })).toBeFocused();
  await expect(page.getByText("6 hours", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Model details" }).click();
  await expect(page.getByText("RAID 6 uses the minimum reconstruction source reads in this model.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("textbox", { name: "Drive count", exact: true })).toHaveValue("6");
  await expect(page.getByRole("heading", { name: "Rebuild result" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "RAID 6", exact: true })).toBeFocused();
});

test("keeps every active assumption visible and each result in one place", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  await expect(page.getByRole("radiogroup")).toBeVisible();
  for (const label of [
    "Drive count",
    "Drive capacity",
    "Rebuild throughput",
    "Member read scope",
    "Replacement delay",
  ]) {
    await expect(page.getByRole("textbox", { name: label, exact: true })).toBeVisible();
  }
  await expect(page.locator('[data-tool-label="URE specification"]')).toBeVisible();
  await expect(page.getByText("Rebuild copy time", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Replacement delay", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Source media read", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Additional errors tolerated", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Degraded window", { exact: true })).toHaveCount(0);
});

test("changing each result-driving input changes output or exposes validation", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const lead = page.locator("output[aria-label='Total degraded window']");
  const initial = await lead.textContent();

  await page.getByText("RAID 1", { exact: true }).click();
  await page.getByRole("textbox", { name: "Drive count", exact: true }).fill("2");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(lead).toBeVisible();
  expect(await lead.textContent()).not.toBe(initial);

  const afterRaid = await lead.textContent();
  await page.getByRole("textbox", { name: "Drive capacity", exact: true }).fill("10");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(lead).toBeVisible();
  expect(await lead.textContent()).not.toBe(afterRaid);

  const afterCapacity = await lead.textContent();
  await page.getByRole("textbox", { name: "Rebuild throughput", exact: true }).fill("300");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(lead).toBeVisible();
  expect(await lead.textContent()).not.toBe(afterCapacity);

  const afterThroughput = await lead.textContent();
  await page.getByRole("textbox", { name: "Member read scope", exact: true }).fill("50");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(lead).toBeVisible();
  expect(await lead.textContent()).not.toBe(afterThroughput);

  const afterScope = await lead.textContent();
  await page.getByRole("textbox", { name: "Replacement delay", exact: true }).fill("12");
  await page.getByRole("button", { name: "Calculate" }).click();
  await expect(lead).toBeVisible();
  expect(await lead.textContent()).not.toBe(afterScope);

  const exposure = page.getByRole("progressbar", { name: "Modeled read-error exposure" });
  const beforeUre = await exposure.getAttribute("aria-valuetext");
  await page.locator('[data-tool-label="URE specification"]').click();
  await page.getByRole("option", { name: "1 error per 10^16 bits" }).click();
  await page.getByRole("button", { name: "Calculate" }).click();
  expect(await exposure.getAttribute("aria-valuetext")).not.toBe(beforeUre);
});

test("does not serialize inputs into requests or browser state", async ({ page }) => {
  await page.goto("/rebuild-calculator");
  const laterRequests: string[] = [];
  page.on("request", (request) => laterRequests.push(request.url()));
  const marker = "987654321";
  await page.getByRole("textbox", { name: "Drive capacity", exact: true }).fill(marker);
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
    await expect(page.getByRole("heading", { name: "Rebuild result" })).toBeVisible();
    await page.getByRole("button", { name: "Model details" }).click();
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
    const tool = page.getByRole("region", { name: "rebuild exposure calculator" });
    for (const control of await tool.locator("button, input[type='text']").all()) {
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
    await expect(page.getByRole("heading", { name: "Rebuild result" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}
