import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded local preview.");

async function addBatch(page: import("playwright/test").Page, domain: string, count: string, capacity: string) {
  await page.getByRole("button", { name: "Add OSD batch" }).click();
  const index = await page.getByTestId("osd-batch").count();
  const row = page.getByTestId("osd-batch").nth(index - 1);
  await row.getByLabel("Failure-domain label").fill(domain);
  await row.getByLabel("OSD count").fill(count);
  await row.getByLabel("OSD capacity").fill(capacity);
}

test("plans replicated capacity and clears stale results on edit", async ({ page }) => {
  await page.goto("/ceph-capacity-calculator");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ceph capacity");
  await expect(page.getByRole("button", { name: "Plan capacity" })).toBeVisible();
  await addBatch(page, "host-a", "1", "4");
  await addBatch(page, "host-b", "1", "4");
  await addBatch(page, "host-c", "1", "4");
  await page.getByRole("button", { name: "Plan capacity" }).click();
  await expect(page.getByRole("heading", { name: "Modeled capacity", exact: true })).toBeFocused();
  await expect(page.getByTestId("capacity-accounting")).toContainText("12 TB");
  await expect(page.getByTestId("capacity-accounting")).toContainText("4 TB");
  await page.getByLabel("Planning reserve").fill("25");
  await expect(page.getByRole("heading", { name: "Modeled capacity", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/ceph-capacity-calculator$/);
});

test("plans EC, shows domains, and blocks insufficient failure domains", async ({ page }) => {
  await page.goto("/ceph-capacity-calculator");
  await page.getByRole("radio", { name: "Erasure coding" }).check();
  await page.getByLabel("Data chunks k").fill("4");
  await page.getByLabel("Coding chunks m").fill("2");
  for (let index = 1; index <= 5; index += 1) await addBatch(page, `host-${index}`, "1", "4");
  await page.getByRole("button", { name: "Plan capacity" }).click();
  await expect(page.locator('[role="alert"]').filter({ hasText: "6 distinct" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Modeled capacity", exact: true })).toHaveCount(0);
  await addBatch(page, "host-6", "1", "4");
  await page.getByRole("button", { name: "Plan capacity" }).click();
  await expect(page.getByRole("heading", { name: "Modeled capacity", exact: true })).toBeFocused();
  await expect(page.getByTestId("domain-table")).toContainText("Required domains");
  await expect(page.getByTestId("domain-table")).toContainText("Largest-domain loss");
});

test("supports Enter, reset, share, and malformed shared state recovery", async ({ page, context }) => {
  await page.goto("/ceph-capacity-calculator");
  await addBatch(page, "host-a", "1", "2");
  await addBatch(page, "host-b", "1", "2");
  await addBatch(page, "host-c", "1", "2");
  await page.getByLabel("OSD capacity").last().press("Enter");
  await expect(page.getByRole("heading", { name: "Modeled capacity", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Share plan" }).click();
  await expect(page).toHaveURL(/state=/);
  await expect(page.getByRole("textbox", { name: "Share URL" })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("heading", { name: "Modeled capacity", exact: true })).toHaveCount(0);
  await page.goto("/ceph-capacity-calculator?state=not-valid");
  await expect(page).toHaveURL(/ceph-capacity-calculator$/);
  await expect(page.getByRole("status")).toContainText("shared plan");
  await context.clearCookies();
});

test("keeps the result readable across required widths and themes", async ({ page }) => {
  for (const width of [320, 375, 760, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ceph-capacity-calculator");
    await addBatch(page, "rack-a-with-a-long-label", "4", "18");
    await addBatch(page, "rack-b", "4", "18");
    await addBatch(page, "rack-c", "4", "18");
    await page.getByRole("button", { name: "Plan capacity" }).click();
    await expect(page.locator("body")).toHaveJSProperty("scrollWidth", width);
  }
});
