import { expect, test } from "playwright/test";
import type { Page } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded local preview.");

async function chooseOption(page: Page, label: string, option: string) {
  await page.locator(`button[data-tool-label="${label}"]`).click();
  await page.getByRole("listbox").getByRole("option", { name: option, exact: true }).click();
}

function textField(page: Page, name: string) {
  return page.getByRole("textbox", { name, exact: true });
}

function selectButton(page: Page, name: string) {
  return page.locator(`button[data-tool-label="${name}"]`);
}

test("builds a pool, validates it, and clears stale results", async ({ page }) => {
  await page.goto("/zfs-capacity-calculator");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ZFS pool capacity");
  await expect(page.getByRole("button", { name: "Add data vdev" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Optional devices, 0 groups" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add auxiliary role" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Calculate pool" })).toBeDisabled();
  await expect(page).toHaveURL(/zfs-capacity-calculator$/);

  await page.getByRole("button", { name: "Add data vdev" }).click();
  await expect(selectButton(page, "Data vdev 1 type")).toBeFocused();
  await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  await expect(textField(page, "Data vdev 1 drive 3 capacity")).toBeFocused();
  await page.getByRole("button", { name: "Calculate pool" }).click();
  await expect(page.getByText("Add drive", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toHaveCount(0);

  for (let index = 1; index <= 3; index += 1) {
    await textField(page, `Data vdev 1 drive ${index} capacity`).fill("18");
  }
  await page.getByRole("button", { name: "Calculate pool" }).click();
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toBeFocused();
  await expect(page.getByRole("table", { name: "Vdev boundaries" })).toBeVisible();
  await expect(page.getByLabel("Capacity allocation")).toBeVisible();
  await expect(page.getByRole("region", { name: "Dry-run command" }).locator("code")).toContainText("zpool create -n");
  await expect(page.getByText("Capacity accounting", { exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/zfs-capacity-calculator$/);

  await textField(page, "Data vdev 1 drive 1 capacity").fill("19");
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toHaveCount(0);
  await expect(page).toHaveURL(/zfs-capacity-calculator$/);
});

test("creates an equal-drive vdev quickly and keeps every drive editable", async ({ page }) => {
  await page.goto("/zfs-capacity-calculator");
  await page.getByRole("button", { name: "Add data vdev" }).click();
  await textField(page, "Data vdev 1 drive count").fill("6");
  await textField(page, "Data vdev 1 shared capacity").fill("18");
  await chooseOption(page, "Data vdev 1 shared unit", "TB");
  await page.getByRole("button", { name: "Set all drives for data vdev 1" }).click();

  await expect(textField(page, "Data vdev 1 drive 6 capacity")).toHaveValue("18");
  await textField(page, "Data vdev 1 drive 6 capacity").fill("20");
  await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  await expect(textField(page, "Data vdev 1 drive 7 capacity")).toBeFocused();
  await textField(page, "Data vdev 1 drive 7 capacity").fill("18");
  await page.getByRole("button", { name: "Calculate pool" }).click();

  await expect(page.getByText("Planning target", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Capacity allocation").getByText("Mixed sizes", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Capacity allocation").getByText("Tails", { exact: true })).toBeVisible();
});

test("supports mixed vdevs, settings, units, and auxiliary roles", async ({ page }) => {
  await page.goto("/zfs-capacity-calculator");
  await page.getByRole("button", { name: "Add data vdev" }).click();
  for (let index = 0; index < 3; index += 1) await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  for (let index = 1; index <= 3; index += 1) await textField(page, `Data vdev 1 drive ${index} capacity`).fill(index === 3 ? "20" : "18");

  await page.getByRole("button", { name: "Duplicate data vdev 1" }).click();
  await expect(page.getByRole("heading", { name: "Data vdev 2" })).toBeFocused();
  await chooseOption(page, "Data vdev 2 type", "Mirror");
  await page.getByRole("button", { name: "Remove data vdev 2 drive 3" }).click();
  await page.getByRole("button", { name: "Move data vdev 2 up" }).click();

  await page.getByRole("button", { name: "Optional devices, 0 groups" }).click();
  await chooseOption(page, "Optional device role", "Special");
  await page.getByRole("button", { name: "Add auxiliary role" }).click();
  await textField(page, "Special 1 drive 1 capacity").fill("1");
  await textField(page, "Special 1 drive 2 capacity").fill("2");

  await textField(page, "Planning headroom").fill("25");
  await page.getByText("Logical capacity scenario, off", { exact: true }).click();
  await page.getByText("Compression scenario", { exact: true }).click();
  await expect(page.getByLabel("Compression scenario")).toBeChecked();
  await textField(page, "Compression ratio").fill("1.5");
  await page.getByRole("button", { name: "Calculate pool" }).click();
  await expect(page.getByTestId("conditional-logical")).toBeVisible();
  await expect(page.getByText("Special envelope", { exact: true })).toBeVisible();
  const headline = await page.getByLabel("Estimated writable").textContent();
  await page.getByRole("radiogroup", { name: "Result unit" }).getByText("TB", { exact: true }).click();
  await expect(page.getByLabel("Estimated writable")).not.toHaveText(headline ?? "");

  await page.getByText("Zvol", { exact: true }).click();
  await expect(page.locator('button[data-tool-label="volblocksize"]')).toContainText("16 KiB");
  await expect(page.getByRole("heading", { name: "Estimated writable", exact: true })).toHaveCount(0);
});

test("shares explicitly, restores safely, and resets cleanly", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/zfs-capacity-calculator");
  await page.getByRole("button", { name: "Add data vdev" }).click();
  for (let index = 0; index < 3; index += 1) await page.getByRole("button", { name: "Add drive to data vdev 1" }).click();
  for (let index = 1; index <= 3; index += 1) await textField(page, `Data vdev 1 drive ${index} capacity`).fill("4");
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
  await expect(page.getByText("Shared configuration could not be restored.")).toBeVisible();
  await expect(page).toHaveURL(/zfs-capacity-calculator$/);
});

test("supports keyboard editing and long-value recovery", async ({ page }) => {
  await page.goto("/zfs-capacity-calculator");
  const addVdev = page.getByRole("button", { name: "Add data vdev" });
  await addVdev.focus();
  await addVdev.press("Enter");
  await expect(selectButton(page, "Data vdev 1 type")).toBeFocused();

  const addDrive = page.getByRole("button", { name: "Add drive to data vdev 1" });
  for (let index = 1; index <= 3; index += 1) {
    await addDrive.focus();
    await addDrive.press("Enter");
    await expect(textField(page, `Data vdev 1 drive ${index} capacity`)).toBeFocused();
  }
  await textField(page, "Data vdev 1 drive 1 capacity").fill("9".repeat(100));
  await textField(page, "Data vdev 1 drive 2 capacity").fill("18");
  await textField(page, "Data vdev 1 drive 3 capacity").fill("18");
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
    const capacity = await textField(page, "Data vdev 1 drive 1 capacity").boundingBox();
    const remove = await page.getByRole("button", { name: "Remove data vdev 1 drive 1" }).boundingBox();
    const rowBox = await row.boundingBox();
    expect(Math.abs((capacity?.y ?? 0) - (rowBox?.y ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((remove?.y ?? 0) - (rowBox?.y ?? 0))).toBeLessThanOrEqual(1);
    expect(remove?.height).toBeGreaterThanOrEqual(44);

    for (let index = 1; index <= 3; index += 1) {
      await textField(page, `Data vdev 1 drive ${index} capacity`).fill(index === 1 ? "4" : "8");
    }
    await page.getByRole("button", { name: "Calculate pool" }).click();

    const allocation = page.getByLabel("Capacity allocation");
    const allocationBox = await allocation.boundingBox();
    const lead = page.getByLabel("Estimated writable");
    const leadBox = await lead.boundingBox();
    expect(allocationBox?.x).toBeGreaterThanOrEqual(0);
    expect((allocationBox?.x ?? 0) + (allocationBox?.width ?? width)).toBeLessThanOrEqual(width + 1);
    expect(leadBox?.x).toBeGreaterThanOrEqual(0);
    expect((leadBox?.x ?? 0) + (leadBox?.width ?? width)).toBeLessThanOrEqual(width + 1);
    await expect(lead).toContainText(/TiB|TB/);

    const calculatedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(calculatedOverflow).toBeLessThanOrEqual(1);
  });
}
