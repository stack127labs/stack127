import { expect, test } from "playwright/test";

async function addCustomApp(page: import("playwright/test").Page, withRanges = true) {
  await page.getByRole("button", { name: "Open App to add" }).click();
  await page.getByRole("option", { name: "Custom app" }).click();
  await page.getByRole("button", { name: "Add app", exact: true }).click();
  await page.getByRole("textbox", { name: "Custom app name" }).fill("Test service");
  if (withRanges) {
    await page.getByRole("textbox", { name: "RAM lower bound" }).fill("0.25");
    await page.getByRole("textbox", { name: "RAM upper bound" }).fill("0.5");
    await page.getByRole("textbox", { name: "Storage lower bound" }).fill("1");
    await page.getByRole("textbox", { name: "Storage upper bound" }).fill("2");
  }
}

async function calculate(page: import("playwright/test").Page, withRanges = true) {
  await addCustomApp(page, withRanges);
  await page.getByRole("textbox", { name: "RAM budget" }).fill("8");
  await page.getByRole("textbox", { name: "App storage budget" }).fill("100");
  await page.getByRole("button", { name: "Calculate plan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toBeFocused();
  const position = await page.getByRole("heading", { name: "Resource plan result", exact: true }).evaluate((element) => ({
    bottom: element.getBoundingClientRect().bottom,
    headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
    top: element.getBoundingClientRect().top,
    viewportHeight: window.innerHeight,
  }));
  expect(position.top).toBeGreaterThanOrEqual(position.headerBottom);
  expect(position.bottom).toBeLessThanOrEqual(position.viewportHeight);
}

test("clean planner keeps the URL and has no result until an app is added", async ({ page }) => {
  await page.goto("/self-hosted-app-resource-planner");
  await expect(page).toHaveURL(/self-hosted-app-resource-planner$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("self-hosted app resource planner");
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Calculate plan", exact: true })).toBeVisible();
});

test("calculates one known app, exposes the lead answer, and clears stale output on edit", async ({ page }) => {
  await page.goto("/self-hosted-app-resource-planner");
  await calculate(page);
  const result = page.getByRole("region", { name: "Resource plan result" });
  await expect(result).toContainText(/within the available budget/i);
  await expect(result).toContainText("RAM");
  await expect(result).toContainText("Storage");
  await expect(result).not.toContainText(/CPU total|provider recommendation|docker run|kubernetes/i);
  await page.getByRole("textbox", { name: "RAM budget" }).fill("0.1");
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toHaveCount(0);
});

test("keeps missing custom requirements unknown without showing zero ranges", async ({ page }) => {
  await page.goto("/self-hosted-app-resource-planner");
  await calculate(page, false);
  const result = page.getByRole("region", { name: "Resource plan result" });
  await expect(result).toContainText(/RAM[\s\S]*Unknown/i);
  await expect(result).toContainText(/Storage[\s\S]*Unknown/i);
  await expect(result).not.toContainText("0.0 GiB to 0.0 GiB");
  await expect(result).not.toContainText("0.0 GB to 0.0 GB");
});

test("shows each allocation label and a truthful over-budget split", async ({ page }) => {
  await page.goto("/self-hosted-app-resource-planner");
  await addCustomApp(page);
  await page.getByRole("textbox", { name: "RAM budget" }).fill("0.3");
  await page.getByRole("textbox", { name: "App storage budget" }).fill("1");
  await page.getByRole("textbox", { name: "Headroom reserve" }).fill("0");
  await page.getByRole("button", { name: "Calculate plan", exact: true }).click();
  const result = page.getByRole("region", { name: "Resource plan result" });
  await expect(result.getByRole("heading", { name: "RAM budget" })).toBeVisible();
  await expect(result.getByRole("heading", { name: "Storage budget" })).toBeVisible();
  await expect(result.getByText("Within available budget", { exact: true }).first()).toBeVisible();
  await expect(result.getByText("Over budget", { exact: true }).first()).toBeVisible();
  await expect(result).not.toContainText("RAM binds");
});

test("invalid submit focuses the first bad field and keeps values", async ({ page }) => {
  await page.goto("/self-hosted-app-resource-planner");
  await page.getByRole("button", { name: "Calculate plan", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "App to add" })).toBeFocused();
  await expect(page.getByRole("status")).toContainText(/add an app|host budget/i);
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toHaveCount(0);
});

test("reset restores the empty state and focus", async ({ page }) => {
  await page.goto("/self-hosted-app-resource-planner");
  await calculate(page);
  await page.getByRole("button", { name: "Reset plan", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "App to add" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Headroom reserve" })).toHaveValue("20");
});

test("has no page overflow at the narrow target widths", async ({ page }) => {
  for (const width of [1440, 760, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/self-hosted-app-resource-planner");
    await calculate(page);
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
  }
});
