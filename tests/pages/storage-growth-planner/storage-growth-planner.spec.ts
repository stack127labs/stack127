import { expect, test, type Page } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded managed-development preview.");

async function calculate(page: Page) {
  await page.getByRole("button", { name: "Calculate plan" }).click();
  await expect(page.getByRole("heading", { name: /Your plan/ })).toBeVisible();
}

test("renders a clean form, calculates, and clears stale output on edit", async ({ page }) => {
  await page.goto("/storage-growth-planner");
  const tool = page.getByRole("region", { name: "storage growth planner inputs and results" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Storage Growth and TCO Planner");
  await expect(tool.getByRole("heading", { name: /Your plan/ })).toHaveCount(0);
  expect(page.url()).toBe("http://127.0.0.1:3334/storage-growth-planner");

  await calculate(page);
  await expect(page.getByText("38.40 TB", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Plan summary").getByText("$1,994.20", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your plan/ })).toBeFocused();

  await page.getByLabel("Current data").fill("11");
  await expect(tool.getByRole("heading", { name: /Your plan/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Share plan" })).toHaveCount(0);
});

test("validates dependent layouts and focuses the first invalid field", async ({ page }) => {
  await page.goto("/storage-growth-planner");
  await page.getByRole("radio", { name: "Mirror" }).check();
  await page.getByLabel("Drive count").fill("3");
  await page.getByRole("button", { name: "Calculate plan" }).click();
  await expect(page.getByLabel("Drive count")).toBeFocused();
  await expect(page.getByLabel("Drive count")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("heading", { name: "Fix the marked input" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your plan/ })).toHaveCount(0);
});

test("supports Enter, reset, copy, and explicit share without persistence", async ({ page }) => {
  await page.goto("/storage-growth-planner");
  await page.getByLabel("Current data").press("Enter");
  await expect(page.getByRole("heading", { name: /Your plan/ })).toBeVisible();
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => undefined } }));
  await page.getByRole("button", { name: "Copy summary" }).click();
  await expect(page.getByText("Summary copied.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Share plan" }).click();
  await expect(page).toHaveURL(/storage-growth-planner\?state=/);
  await expect(page.getByText("Share link copied.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:3334/storage-growth-planner");
  await expect(page.getByRole("heading", { name: /Your plan/ })).toHaveCount(0);
});

test("restores a valid share and rejects malformed state", async ({ page }) => {
  await page.goto("/storage-growth-planner?state=not_base64");
  await expect(page.getByText("Shared plan could not load.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your plan/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Calculate plan" }).click();
  await page.getByRole("button", { name: "Share plan" }).click();
  const sharedUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(sharedUrl);
  await expect(page.getByText("Shared plan loaded.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Your plan/ })).toBeVisible();
});

test("keeps private input out of requests and browser storage", async ({ page }) => {
  await page.goto("/storage-growth-planner");
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const marker = "private-marker-7f31";
  await page.getByLabel("Current data").fill("10");
  await page.getByLabel("Backup budget").fill(marker);
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
    const controls = page.getByRole("region", { name: "storage growth planner inputs and results" }).locator("button, input:not([type='radio']), select");
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
