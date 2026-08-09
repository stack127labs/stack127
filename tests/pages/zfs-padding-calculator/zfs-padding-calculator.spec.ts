import { expect, test } from "playwright/test";

const localPreview = process.env.VERSION127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded local preview.");

test("calculates explicitly, clears stale results, shares, and resets", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/zfs-padding-calculator");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ZFS block size and padding");
  await expect(page.getByRole("heading", { name: /occupies/ })).toHaveCount(0);
  await expect(page).toHaveURL(/zfs-padding-calculator$/);

  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByRole("heading", { name: /occupies/ })).toBeFocused();
  await expect(page.getByTestId("physical-bytes")).toHaveText("192 KiB");
  await expect(page.getByText("32 data", { exact: true })).toBeVisible();
  await expect(page.getByText("16 parity", { exact: true })).toBeVisible();
  await expect(page.getByText("48 allocated", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/zfs-padding-calculator$/);

  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByRole("heading", { name: "128 KiB occupies 192 KiB." })).toBeFocused();
  await expect(page.getByTestId("physical-bytes")).toHaveText("192 KiB");

  await page.getByLabel("Vdev width").fill("5");
  await expect(page.getByRole("heading", { name: /occupies/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByTestId("physical-bytes")).toHaveText("216 KiB");

  await page.getByRole("button", { name: "Share configuration" }).click();
  await expect(page).toHaveURL(/\?state=/);
  const shared = page.url();
  await page.reload();
  await expect(page.getByTestId("physical-bytes")).toHaveText("216 KiB");
  await expect(page).toHaveURL(shared);

  await page.getByRole("button", { name: "Reset" }).last().click();
  await expect(page).toHaveURL(/zfs-padding-calculator$/);
  await expect(page.getByLabel("Vdev width")).toHaveValue("6");
  await expect(page.getByRole("heading", { name: /occupies/ })).toHaveCount(0);
});

test("submits with Enter from vdev width and custom size", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");

  const width = page.getByLabel("Vdev width");
  await width.focus();
  await width.press("Enter");
  await expect(page.getByRole("heading", { name: "128 KiB occupies 192 KiB." })).toBeFocused();
  await expect(page.getByTestId("physical-bytes")).toHaveText("192 KiB");

  await page.getByLabel("recordsize").selectOption("custom");
  const customSize = page.getByLabel("Custom size");
  await customSize.fill("64");
  await expect(page.getByRole("heading", { name: /occupies/ })).toHaveCount(0);
  await customSize.press("Enter");
  await expect(page.getByRole("heading", { name: "64 KiB occupies 96 KiB." })).toBeFocused();
  await expect(page.getByTestId("physical-bytes")).toHaveText("96 KiB");
});

test("preserves dependent errors and exposes exact FF-002 categories", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");
  await page.getByLabel("RAIDZ3").check();
  await page.getByLabel("Vdev width").fill("3");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByLabel("Vdev width")).toBeFocused();
  await expect(page.getByText("RAIDZ3 needs at least 4 members.")).toBeVisible();

  await page.getByLabel("RAIDZ2").check();
  await page.getByLabel("Vdev width").fill("6");
  await page.getByLabel("recordsize").selectOption("8192");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByTestId("allocation-logical-data")).toContainText("8 KiB");
  await expect(page.getByTestId("allocation-parity")).toContainText("8 KiB");
  await expect(page.getByTestId("allocation-padding")).toContainText("8 KiB");
  await expect(page.getByTestId("efficiency")).toHaveText("33.33%");
  await expect(page.getByTestId("multiplier")).toHaveText("3.00x");

  await page.getByLabel("recordsize").selectOption("16777216");
  await page.getByLabel("Zvol").check();
  await expect(page.getByLabel("volblocksize")).toHaveValue("16777216");
  await expect(page.getByText("volblocksize stops at 128 KiB.")).toBeVisible();
  await expect(page.getByTestId("physical-bytes")).toHaveCount(0);
});

for (const [width, height] of [[1280, 720], [768, 1024], [390, 844], [320, 900]]) {
  test(`has no result overflow and keeps touch targets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/zfs-padding-calculator");
    await page.getByRole("button", { name: "Calculate allocation" }).click();
    const overflow = await page.evaluate(() => ({ document: document.documentElement.scrollWidth - document.documentElement.clientWidth, body: document.body.scrollWidth - document.body.clientWidth }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
    const tool = page.getByRole("region", { name: "ZFS allocation calculator" });
    for (const control of await tool.locator("button, input, select, summary").all()) {
      const box = await control.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    await expect(page.getByTestId("physical-bytes")).toBeVisible();
  });
}
