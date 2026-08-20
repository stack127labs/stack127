import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded local preview.");

test("builds a pool, validates it, and clears stale results", async ({ page }) => {
  await page.goto("/zfs-capacity-calculator");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ZFS pool capacity");
  await expect(page.getByRole("button", { name: "Add data vdev" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add auxiliary role" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Calculate pool" })).toBeDisabled();
  await expect(page).toHaveURL(/zfs-capacity-calculator$/);

  await page.getByRole("button", { name: "Add data vdev" }).click();
  await expect(page.getByLabel("Data vdev 1 type")).toBeFocused();
  await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  await expect(page.getByLabel("Data vdev 1 drive 3 capacity")).toBeFocused();
  await page.getByRole("button", { name: "Calculate pool" }).click();
  await expect(page.getByText("Add drive", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toHaveCount(0);

  for (let index = 1; index <= 3; index += 1) {
    await page.getByLabel(`Data vdev 1 drive ${index} capacity`).fill("18");
  }
  await page.getByRole("button", { name: "Calculate pool" }).click();
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toBeFocused();
  await expect(page.getByTestId("vdev-topology")).toBeVisible();
  await expect(page.getByTestId("capacity-accounting")).toBeVisible();
  await expect(page.getByTestId("dry-run-command").locator("code")).toContainText("zpool create -n");
  await expect(page).toHaveURL(/zfs-capacity-calculator$/);

  await page.getByLabel("Data vdev 1 drive 1 capacity").fill("19");
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/zfs-capacity-calculator$/);
});

test("creates an equal-drive vdev quickly and keeps every drive editable", async ({ page }) => {
  await page.goto("/zfs-capacity-calculator");
  await page.getByRole("button", { name: "Add data vdev" }).click();
  await page.getByLabel("Data vdev 1 drive count").fill("6");
  await page.getByLabel("Data vdev 1 shared capacity").fill("18");
  await page.getByLabel("Data vdev 1 shared unit").selectOption("TB");
  await page.getByRole("button", { name: "Set all drives for data vdev 1" }).click();

  await expect(page.getByLabel("Data vdev 1 drive 6 capacity")).toHaveValue("18");
  await page.getByLabel("Data vdev 1 drive 6 capacity").fill("20");
  await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  await expect(page.getByLabel("Data vdev 1 drive 7 capacity")).toBeFocused();
  await page.getByLabel("Data vdev 1 drive 7 capacity").fill("18");
  await page.getByRole("button", { name: "Calculate pool" }).click();

  await expect(page.getByRole("heading", { name: "Planning target", exact: true })).toBeVisible();
  await expect(page.getByLabel("Capacity allocation legend").getByText("Mixed sizes", { exact: true })).toBeVisible();
  await expect(page.getByRole("row", { name: /Block tails/ })).toContainText("<0.01");
  await expect(page.getByText("Zero-value categories", { exact: false })).toBeVisible();
});

test("supports mixed vdevs, settings, units, and auxiliary roles", async ({ page }) => {
  await page.goto("/zfs-capacity-calculator");
  await page.getByRole("button", { name: "Add data vdev" }).click();
  for (let index = 0; index < 3; index += 1) await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  for (let index = 1; index <= 3; index += 1) await page.getByLabel(`Data vdev 1 drive ${index} capacity`).fill(index === 3 ? "20" : "18");

  await page.getByRole("button", { name: "Duplicate data vdev 1" }).click();
  await expect(page.getByRole("heading", { name: "Data vdev 2" })).toBeFocused();
  await page.getByLabel("Data vdev 2 type").selectOption("mirror");
  await page.getByRole("button", { name: "Remove data vdev 2 drive 3" }).click();
  await page.getByRole("button", { name: "Move data vdev 2 up" }).click();

  await page.getByLabel("Auxiliary role").selectOption("special");
  await page.getByRole("button", { name: "Add auxiliary role" }).click();
  await page.getByLabel("Special 1 drive 1 capacity").fill("1");
  await page.getByLabel("Special 1 drive 2 capacity").fill("2");

  await page.getByLabel("Planning headroom").fill("25");
  await page.getByText("Advanced assumptions", { exact: true }).click();
  await page.getByLabel("Compression scenario").check();
  await page.getByLabel("Compression ratio").fill("1.5");
  await page.getByRole("button", { name: "Calculate pool" }).click();
  await expect(page.getByTestId("conditional-logical")).toBeVisible();
  await expect(page.getByText("Special envelope", { exact: true })).toBeVisible();
  const headline = await page.getByTestId("writable-value").textContent();
  await page.getByLabel("TB").check();
  await expect(page.getByTestId("writable-value")).not.toHaveText(headline ?? "");

  await page.getByLabel("Zvol").check();
  await expect(page.getByLabel("volblocksize")).toHaveValue("16384");
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toHaveCount(0);
});

test("shares explicitly, restores safely, and resets cleanly", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/zfs-capacity-calculator");
  await page.getByRole("button", { name: "Add data vdev" }).click();
  for (let index = 0; index < 3; index += 1) await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  for (let index = 1; index <= 3; index += 1) await page.getByLabel(`Data vdev 1 drive ${index} capacity`).fill("4");
  await page.getByRole("button", { name: "Calculate pool" }).click();
  const cleanHistory = await page.evaluate(() => history.length);
  await page.getByRole("button", { name: "Calculate pool" }).click();
  await expect.poll(() => page.evaluate(() => history.length)).toBe(cleanHistory);
  await page.getByRole("button", { name: "Share configuration" }).click();
  await expect(page).toHaveURL(/\?state=/);
  await expect(page.getByLabel("Shared URL")).toBeVisible();
  const shared = page.url();

  const restored = await context.newPage();
  await restored.goto(shared);
  await expect(restored.getByText("Configuration restored")).toBeVisible();
  await expect(restored.getByRole("heading", { name: "Estimated writable", exact: true })).toBeVisible();
  await restored.getByRole("button", { name: "Reset calculator" }).click();
  await expect(restored).toHaveURL(/zfs-capacity-calculator$/);
  await expect(restored.getByRole("button", { name: "Add data vdev" })).toBeFocused();

  await page.goto("/zfs-capacity-calculator?state=broken");
  await expect(page.getByText("Configuration restore failed")).toBeVisible();
  await expect(page).toHaveURL(/zfs-capacity-calculator$/);
});

test("supports keyboard editing and long-value recovery", async ({ page }) => {
  await page.goto("/zfs-capacity-calculator");
  const addVdev = page.getByRole("button", { name: "Add data vdev" });
  await addVdev.focus();
  await addVdev.press("Enter");
  await expect(page.getByLabel("Data vdev 1 type")).toBeFocused();

  const addDrive = page.getByRole("button", { name: "Add drive to data vdev 1" });
  for (let index = 1; index <= 3; index += 1) {
    await addDrive.focus();
    await addDrive.press("Enter");
    await expect(page.getByLabel(`Data vdev 1 drive ${index} capacity`)).toBeFocused();
  }
  await page.getByLabel("Data vdev 1 drive 1 capacity").fill("9".repeat(100));
  await page.getByLabel("Data vdev 1 drive 2 capacity").fill("18");
  await page.getByLabel("Data vdev 1 drive 3 capacity").fill("18");
  await page.getByRole("button", { name: "Calculate pool" }).press("Enter");
  await expect(page.getByText("Pool topology is invalid.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toHaveCount(0);

  const reset = page.getByRole("button", { name: "Reset calculator" });
  await reset.focus();
  await reset.press("Enter");
  await expect(addVdev).toBeFocused();
});

for (const { width, height } of [{ width: 320, height: 900 }, { width: 375, height: 900 }, { width: 760, height: 900 }]) {
  test(`keeps inputs and calculated values visible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/zfs-capacity-calculator");
    await page.getByRole("button", { name: "Add data vdev" }).click();
    for (let index = 0; index < 3; index += 1) {
      await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const row = page.getByTestId("data-vdev-1-drive-1");
    const capacity = await page.getByLabel("Data vdev 1 drive 1 capacity").boundingBox();
    const remove = await page.getByRole("button", { name: "Remove data vdev 1 drive 1" }).boundingBox();
    const rowBox = await row.boundingBox();
    expect(capacity?.y).toBe(rowBox?.y);
    expect(remove?.y).toBe(rowBox?.y);
    expect(remove?.height).toBeGreaterThanOrEqual(44);

    for (let index = 1; index <= 3; index += 1) {
      await page.getByLabel(`Data vdev 1 drive ${index} capacity`).fill(index === 1 ? "4" : "8");
    }
    await page.getByRole("button", { name: "Calculate pool" }).click();

    const accounting = page.getByTestId("capacity-accounting");
    const accountingBox = await accounting.boundingBox();
    const value = page.getByRole("row", { name: /Estimated writable/ }).locator("td").first();
    const valueBox = await value.boundingBox();
    expect(accountingBox?.x).toBeGreaterThanOrEqual(0);
    expect((accountingBox?.x ?? 0) + (accountingBox?.width ?? width)).toBeLessThanOrEqual(width + 1);
    expect(valueBox?.x).toBeGreaterThanOrEqual(0);
    expect((valueBox?.x ?? 0) + (valueBox?.width ?? width)).toBeLessThanOrEqual(width + 1);
    await expect(value).toContainText(/TiB|TB/);

    const calculatedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(calculatedOverflow).toBeLessThanOrEqual(1);
  });
}
