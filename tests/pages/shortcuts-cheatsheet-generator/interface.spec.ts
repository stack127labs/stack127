import { expect, test, type Page } from "playwright/test";

const route = "/shortcuts-cheatsheet-generator";
const toolName = "Cheat sheet options and preview";

async function selectApp(page: Page, name: string) {
  const checkbox = page.getByRole("group", { name: "Apps" }).getByRole("checkbox", { name });
  await page.getByRole("group", { name: "Apps" }).getByText(name, { exact: true }).click();
  await expect(checkbox).toBeChecked();
}

test("keeps a clean URL and builds one live sourced sheet", async ({ page }) => {
  await page.goto(route);
  await expect(page).toHaveURL(new RegExp(`${route}$`));
  await expect(page.getByRole("button", { name: "Print sheet" })).toBeDisabled();
  await expect(page.getByText("Choose an app to see the sheet.", { exact: true })).toBeVisible();
  await expect(page.locator("[data-print-root]")).toHaveCount(0);

  await selectApp(page, "Brave Browser");
  const sheet = page.locator("[data-print-root]");
  await expect(sheet).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Print sheet" })).toBeEnabled();
  await expect(page.getByRole("status").filter({ hasText: /1 app, \d+ shortcuts/ })).toHaveCount(1);
  await expect(sheet.getByText(/apps?, \d+ shortcuts/)).toHaveCount(0);
  await expect(sheet.getByText("official Brave keyboard shortcuts", { exact: true })).toHaveAttribute("href", /support\.brave/);
  await expect(sheet.getByText("2026-08-26", { exact: true })).toHaveCount(1);
  await expect(sheet.locator("table")).toHaveCount(1);
  await expect(sheet.locator("thead th")).toHaveText(["Action", "Windows", "macOS", "Linux"]);
  await expect(page).toHaveURL(new RegExp(`${route}$`));
  await expect(page.getByRole("button", { name: /Generate/i })).toHaveCount(0);
});

test("filters app discovery without changing selection, document, URL, or storage", async ({ page }) => {
  await page.goto(`${route}?apps=brave,not-a-real-app`);
  const count = page.getByRole("status").filter({ hasText: /1 app, \d+ shortcuts/ });
  await expect(count).toBeVisible();
  const before = await count.textContent();
  const sheetText = await page.locator("[data-print-root]").textContent();

  await page.getByRole("searchbox", { name: "Filter apps" }).fill("zz-no-match");
  await expect(page.getByText("No apps match this filter.", { exact: true })).toBeVisible();
  await expect(count).toHaveText(before ?? "");
  await expect(page.locator("[data-print-root]")).toHaveText(sheetText ?? "");
  expect(`${new URL(page.url()).pathname}${new URL(page.url()).search}`).toBe(`${route}?apps=brave,not-a-real-app`);
  expect(await page.evaluate(() => [...Object.values(localStorage), ...Object.values(sessionStorage)].some((value) => value.includes("brave")))).toBe(false);

  await page.getByRole("searchbox", { name: "Filter apps" }).fill("");
  await expect(page.getByRole("group", { name: "Apps" }).getByRole("checkbox", { name: "Brave Browser" })).toBeChecked();
});

test("keeps selected controls visible and updates platform columns without moving focus", async ({ page }) => {
  await page.goto(`${route}?apps=brave`);
  const appOptions = page.getByRole("region", { name: "Brave Browser" });
  await expect(appOptions.getByRole("radiogroup", { name: "Platform" })).toBeVisible();
  await expect(appOptions.getByRole("radio", { name: "All platforms" })).toBeChecked();
  await expect(appOptions.locator("details")).toHaveCount(0);
  await expect(appOptions.getByRole("checkbox")).toHaveCount(4);

  const macos = appOptions.getByRole("radio", { name: "macOS" });
  await appOptions.getByText("macOS", { exact: true }).click();
  await expect(macos).toBeFocused();
  await expect(page.locator("[data-print-root] thead th")).toHaveText(["Action", "macOS"]);
  await expect(page.locator("[data-print-root]")).not.toContainText("Windows, macOS, Linux");

  await page.getByRole("searchbox", { name: "Filter apps" }).fill("Apple Notes");
  await selectApp(page, "Apple Notes");
  const appleOptions = page.getByRole("region", { name: "Apple Notes" });
  await expect(appleOptions.getByRole("radiogroup", { name: "Platform" })).toHaveCount(0);
  await expect(appleOptions.getByText("Groups", { exact: true })).toBeVisible();
});

test("removes the whole preview and names recovery when no selected groups remain", async ({ page }) => {
  await page.goto(`${route}?apps=brave`);
  const appOptions = page.getByRole("region", { name: "Brave Browser" });
  const groupChecks = appOptions.getByRole("checkbox");
  const count = await groupChecks.count();
  for (let index = 0; index < count; index += 1) await groupChecks.nth(index).locator("xpath=ancestor::label[1]").click();

  await expect(groupChecks.last()).toBeFocused();
  await expect(appOptions).toContainText("Select at least one group for Brave Browser.");
  await expect(page.locator("[data-print-root]")).toHaveCount(0);
  await expect(page.getByText("Nothing to print for Brave Browser with that choice.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print sheet" })).toBeDisabled();
});

test("shows missing bindings without copying another platform value", async ({ page }) => {
  await page.goto(`${route}?apps=brave`);
  const row = page.locator("[data-print-root] tr").filter({ hasText: "Maximize the current window" });
  await expect(row).toHaveCount(1);
  const cells = row.getByRole("cell");
  await expect(cells.nth(0)).toHaveText("Alt Space X");
  await expect(cells.nth(1)).toHaveText("Not documented");
  await expect(cells.nth(2)).toHaveText("Alt Space X");
});

test("preserves catalog, group, shortcut, and platform order", async ({ page }) => {
  await page.goto(`${route}?apps=notion,brave`);
  const sheet = page.locator("[data-print-root]");
  await expect(sheet.locator(":scope > section > h3")).toHaveText([
    "Brave Browser keyboard shortcuts",
    "Notion keyboard shortcuts",
  ]);
  await expect(sheet.locator("tbody").first().getByRole("row").first()).toContainText("Tabs and windows");
  await expect(sheet.locator("tbody").first().getByRole("row").nth(1)).toContainText("New tab");
});

test("calls print only for the live document and exposes only that sheet in print media", async ({ page }) => {
  await page.goto(`${route}?apps=brave`);
  await page.evaluate(() => {
    (window as Window & { __printed?: number }).__printed = 0;
    window.print = () => { (window as Window & { __printed?: number }).__printed = 1; };
  });
  await page.getByRole("button", { name: "Print sheet" }).click();
  expect(await page.evaluate(() => (window as Window & { __printed?: number }).__printed)).toBe(1);
  await expect(page.locator("[data-print-root]")).toHaveCount(1);

  await page.emulateMedia({ media: "print" });
  const visibility = await page.evaluate(() => ({
    sheet: getComputedStyle(document.querySelector("[data-print-root]")!).visibility,
    button: getComputedStyle(document.querySelector("button")!).visibility,
    heading: getComputedStyle(document.querySelector("h1")!).visibility,
    frameOverflow: getComputedStyle(document.querySelector('[aria-label="Printable sheet preview"]')!).overflow,
  }));
  expect(visibility.sheet).toBe("visible");
  expect(visibility.button).toBe("hidden");
  expect(visibility.heading).toBe("hidden");
  expect(visibility.frameOverflow).toBe("visible");
});

for (const [width, height] of [[1440, 900], [900, 900], [600, 900], [375, 900], [320, 900]] as const) {
  test(`contains controls and preview at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(`${route}?apps=brave`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const frame = page.getByRole("region", { name: "Printable sheet preview" });
    await expect(frame).toBeVisible();
    if (width <= 600) expect(await frame.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);

    for (const control of await page.getByRole("region", { name: toolName }).locator('button, input[type="search"], label:has(input[type="checkbox"]), label:has(input[type="radio"])').all()) {
      const box = await control.boundingBox();
      if (box && await control.isVisible()) expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
}

test("reflows the workbench at a 200 percent effective viewport", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto(`${route}?apps=brave`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  await expect(page.getByRole("button", { name: "Print sheet" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Printable sheet preview" })).toBeVisible();
});

for (const theme of ["dark", "light"] as const) {
  test(`keeps the paper readable in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("stack127-theme", value), theme);
    await page.goto(`${route}?apps=brave`);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const colors = await page.locator("[data-print-root]").evaluate((node) => { const style = getComputedStyle(node); return { background: style.backgroundColor, color: style.color }; });
    expect(colors.background).toBe("rgb(255, 255, 255)");
    expect(colors.color).toBe("rgb(22, 22, 22)");
  });
}
