import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded local preview.");

test("starts clean, edits rows, and compares a mixed inventory", async ({ page }) => {
  await page.goto("/storage-layout-advisor");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Storage layout advisor/i);
  await expect(page.getByLabel("Drive 1 capacity")).toHaveValue("4");
  await expect(page.getByRole("heading", { name: /Best fit/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Add drive" }).click();
  await expect(page.getByLabel("Drive 3 capacity")).toBeFocused();
  await page.getByLabel("Drive 1 capacity").fill("4");
  await page.getByLabel("Drive 2 capacity").fill("8");
  await page.getByLabel("Drive 3 capacity").fill("8");
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await expect(page.getByRole("heading", { name: /Best fit/i })).toBeFocused();
  await expect(page.getByTestId("layout-comparison")).toBeVisible();
  await expect(page.getByTestId("capacity-accounting")).toBeVisible();
  await expect(page.getByTestId("layout-topology")).toBeVisible();
  await expect(page).toHaveURL(/storage-layout-advisor$/);
});

test("clears stale results and focuses the first invalid field", async ({ page }) => {
  await page.goto("/storage-layout-advisor");
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await expect(page.getByRole("heading", { name: /Best fit/i })).toBeFocused();
  await page.getByLabel("Drive 1 capacity").fill("-1");
  await expect(page.getByRole("heading", { name: /Best fit/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await expect(page.getByLabel("Drive 1 capacity")).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("Fix the highlighted field.");
  await expect(page.getByLabel("Drive 1 capacity")).toHaveAttribute("aria-invalid", "true");
});

test("clears a shared URL when an input changes", async ({ page }) => {
  await page.goto("/storage-layout-advisor");
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await page.getByRole("button", { name: "Share layout" }).click();
  await expect(page).toHaveURL(/\?state=/);
  await page.getByLabel("Drive 1 capacity").fill("6");
  await expect(page).toHaveURL(/storage-layout-advisor$/);
  await expect(page.getByRole("heading", { name: /Best fit/i })).toHaveCount(0);
});

test("filters protection, shares explicitly, restores, and resets", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/storage-layout-advisor");
  await page.getByRole("button", { name: "Add drive" }).click();
  await page.getByRole("button", { name: "Add drive" }).click();
  await page.getByLabel("Protected failures").selectOption("2");
  await page.getByRole("button", { name: "Compare layouts" }).click();
  await expect(page.getByRole("heading", { name: /Best fit/i })).toBeVisible();
  await page.getByRole("button", { name: "Share layout" }).click();
  await expect(page).toHaveURL(/\?state=/);
  const shared = page.url();
  const restored = await context.newPage();
  await restored.goto(shared);
  await expect(restored.getByText(/restored/i)).toBeVisible();
  await expect(restored.getByRole("heading", { name: /Best fit/i })).toBeVisible();
  await restored.getByRole("button", { name: "Reset layout" }).click();
  await expect(restored).toHaveURL(/storage-layout-advisor$/);
  await expect(restored.getByLabel("Drive 1 capacity")).toHaveValue("4");
});

test("supports keyboard submission and invalid shared state recovery", async ({ page }) => {
  await page.goto("/storage-layout-advisor?state=broken");
  await expect(page.getByText(/restore/i)).toBeVisible();
  const compare = page.getByRole("button", { name: "Compare layouts" });
  await compare.focus();
  await compare.press("Enter");
  await expect(page.getByRole("heading", { name: /Best fit/i })).toBeFocused();
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
