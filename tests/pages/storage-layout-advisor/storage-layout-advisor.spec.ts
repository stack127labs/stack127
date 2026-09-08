import { expect, test } from "playwright/test";


test("starts clean, edits rows, and compares a mixed inventory", async ({ page }) => {
  await page.goto("/storage-layout-advisor");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Storage layout advisor/i);
  await expect(page.getByRole("textbox", { name: "Drive 1 capacity", exact: true })).toHaveValue("4");
  await expect(page.getByRole("heading", { name: "Layout recommendation", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Add drive" }).click();
  await expect(page.getByRole("textbox", { name: "Drive 3 capacity", exact: true })).toBeFocused();
  await page.getByRole("textbox", { name: "Drive 1 capacity", exact: true }).fill("4");
  await page.getByRole("textbox", { name: "Drive 2 capacity", exact: true }).fill("8");
  await page.getByRole("textbox", { name: "Drive 3 capacity", exact: true }).fill("8");
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await expect(page.getByRole("heading", { name: "Layout recommendation", exact: true })).toBeFocused();
  await expect(page.getByTestId("layout-comparison")).toBeVisible();
  await expect(page.getByTestId("capacity-accounting")).toBeVisible();
  await expect(page.getByTestId("layout-topology")).toBeVisible();
  await expect(page).toHaveURL(/storage-layout-advisor$/);
});

test("clears stale results and focuses the first invalid field", async ({ page }) => {
  await page.goto("/storage-layout-advisor");
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await expect(page.getByRole("heading", { name: "Layout recommendation", exact: true })).toBeFocused();
  await page.getByRole("textbox", { name: "Drive 1 capacity", exact: true }).fill("-1");
  await expect(page.getByRole("heading", { name: "Layout recommendation", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await expect(page.getByRole("textbox", { name: "Drive 1 capacity", exact: true })).toBeFocused();
  await expect(page.getByText("Check the marked inputs.", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Drive 1 capacity", exact: true })).toHaveAttribute("aria-invalid", "true");
});

test("clears a shared URL when an input changes", async ({ page }) => {
  await page.goto("/storage-layout-advisor");
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await page.getByRole("button", { name: "Share layout" }).click();
  await expect(page).toHaveURL(/\?state=/);
  await page.getByRole("textbox", { name: "Drive 1 capacity", exact: true }).fill("6");
  await expect(page).toHaveURL(/storage-layout-advisor$/);
  await expect(page.getByRole("heading", { name: "Layout recommendation", exact: true })).toHaveCount(0);
});

test("filters protection, shares explicitly, restores, and resets", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/storage-layout-advisor");
  await page.getByRole("button", { name: "Add drive" }).click();
  await page.getByRole("button", { name: "Add drive" }).click();
  await page.getByRole("radiogroup", { name: /Protected failures/ }).getByText("2", { exact: true }).click();
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await expect(page.getByRole("heading", { name: "Layout recommendation", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Share layout" }).click();
  await expect(page).toHaveURL(/\?state=/);
  const shared = page.url();
  const restored = await context.newPage();
  await restored.goto(shared);
  await expect(restored.getByText(/restored/i)).toBeVisible();
  await expect(restored.getByRole("heading", { name: "Layout recommendation", exact: true })).toBeVisible();
  await restored.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(restored).toHaveURL(/storage-layout-advisor$/);
  await expect(restored.getByRole("textbox", { name: "Drive 1 capacity", exact: true })).toHaveValue("4");
});

test("supports keyboard submission and invalid shared state recovery", async ({ page }) => {
  await page.goto("/storage-layout-advisor?state=broken");
  await expect(page.getByText(/could not load/i)).toBeVisible();
  const compare = page.getByRole("button", { name: "Compare layouts" });
  await compare.focus();
  await compare.press("Enter");
  await expect(page.getByRole("heading", { name: "Layout recommendation", exact: true })).toBeFocused();
});

for (const { width, height } of [
  { width: 320, height: 900 },
  { width: 375, height: 900 },
  { width: 760, height: 900 },
  { width: 1280, height: 900 },
]) {
  test(`keeps the result visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/storage-layout-advisor");
    await page.getByRole("button", { name: "Compare layouts" }).click();
    await expect(page.getByTestId("layout-comparison")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const result = await page.getByTestId("layout-result").boundingBox();
    expect(result?.x).toBeGreaterThanOrEqual(0);
    expect((result?.x ?? 0) + (result?.width ?? width)).toBeLessThanOrEqual(width + 1);
    await expect(page.getByTestId("layout-result").getByText(/usable$/i).first()).toBeVisible();
  });
}
