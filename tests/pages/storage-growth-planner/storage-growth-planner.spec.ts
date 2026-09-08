import { expect, test, type Page } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded managed-development preview.");

async function calculate(page: Page) {
  await page.getByRole("button", { name: "Calculate plan" }).click();
  await expect(page.getByRole("heading", { name: "Storage runway", exact: true })).toBeVisible();
}

test("renders a clean form, calculates, and clears stale output on edit", async ({ page }) => {
  await page.goto("/storage-growth-planner");
  const tool = page.getByRole("region", { name: "storage growth planner inputs and results" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Storage Growth and TCO Planner");
  await expect(tool.getByRole("heading", { name: "Storage runway", exact: true })).toHaveCount(0);
  expect(page.url()).toBe("http://127.0.0.1:3334/storage-growth-planner");

  await calculate(page);
  await expect(page.getByLabel("Storage runway")).toContainText("Capacity after reserve 38.40 TB");
  await expect(page.getByRole("table", { name: "Cost breakdown in USD" }).getByText("$1,994.20", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Storage runway", exact: true })).toBeFocused();

  await page.getByRole("textbox", { name: "Current data", exact: true }).fill("11");
  await page.getByRole("textbox", { name: "Current data", exact: true }).press("Tab");
  await expect(tool.getByRole("heading", { name: "Storage runway", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share plan" })).toHaveCount(0);
});

test("validates dependent layouts and focuses the first invalid field", async ({ page }) => {
  await page.goto("/storage-growth-planner");
  await page.getByRole("radiogroup", { name: /Layout/ }).getByText("Mirror", { exact: true }).click();
  await page.getByRole("textbox", { name: "Drive count", exact: true }).fill("3");
  await page.getByRole("button", { name: "Calculate plan" }).click();
  await expect(page.getByRole("textbox", { name: "Drive count", exact: true })).toBeFocused();
  await expect(page.getByRole("textbox", { name: "Drive count", exact: true })).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Check the marked inputs.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Storage runway", exact: true })).toHaveCount(0);
});

test("supports Enter, reset, copy, and explicit share without persistence", async ({ page }) => {
  await page.goto("/storage-growth-planner");
  await page.getByRole("textbox", { name: "Current data", exact: true }).press("Enter");
  await expect(page.getByRole("heading", { name: "Storage runway", exact: true })).toBeVisible();
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => undefined } }));
  await page.getByRole("button", { name: "Copy summary" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await page.getByRole("button", { name: "Share plan" }).click();
  await expect(page).toHaveURL(/storage-growth-planner\?state=/);
  await expect(page.getByText("Share URL copied.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3334/storage-growth-planner");
  await expect(page.getByRole("heading", { name: "Storage runway", exact: true })).toHaveCount(0);
});

test("restores a valid share and rejects malformed state", async ({ page }) => {
  await page.goto("/storage-growth-planner?state=not_base64");
  await expect(page.getByText("Shared plan could not load.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Storage runway", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Calculate plan" }).click();
  await page.getByRole("button", { name: "Share plan" }).click();
  const sharedUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(sharedUrl);
  await expect(page.getByText("Shared plan loaded.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Storage runway", exact: true })).toBeVisible();
});

test("keeps private input out of requests and browser storage", async ({ page }) => {
  await page.goto("/storage-growth-planner");
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const marker = "private-marker-7f31";
  await page.getByRole("textbox", { name: "Current data", exact: true }).fill("10");
  await page.getByRole("textbox", { name: "Backup budget", exact: true }).fill(marker);
  await page.getByRole("button", { name: "Calculate plan" }).click();
  expect(page.url()).not.toContain(marker);
  expect(requests.some((url) => url.includes(marker))).toBe(false);
  expect(await page.evaluate((needle) => [...Object.values(localStorage), ...Object.values(sessionStorage)].some((value) => value.includes(needle)), marker)).toBe(false);
});

for (const [width, height] of [[1280, 800], [760, 1000], [375, 900], [320, 900]]) {
  test(`keeps the complete result usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/storage-growth-planner");
    await calculate(page);
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
    await expect(page.getByRole("heading", { name: "Growth runway" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Year-by-year plan" })).toBeVisible();
    const controls = page.getByRole("region", { name: "storage growth planner inputs and results" }).locator("form button, form [role='group']");
    for (const control of await controls.all()) {
      const box = await control.boundingBox();
      if (box && await control.isVisible()) expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
}

for (const theme of ["dark", "light"] as const) {
  test(`renders a complete result in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => localStorage.setItem("stack127-theme", selectedTheme), theme);
    await page.goto("/storage-growth-planner");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await calculate(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}
