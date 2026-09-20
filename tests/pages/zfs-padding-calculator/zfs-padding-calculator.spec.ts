import { expect, test, type Page } from "playwright/test";


async function chooseOption(page: Page, label: string, option: string) {
  await page.locator(`button[data-tool-label="${label}"]`).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function chooseRadio(page: Page, name: string) {
  const radio = page.getByRole("radio", { name });
  await radio.focus();
  await radio.press("Space");
}

test("keeps the clean canonical URL unchanged through hydration", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");
  const historyLength = await page.evaluate(() => history.length);
  await expect(page).toHaveURL(/\/zfs-padding-calculator$/);
  await page.waitForTimeout(250);
  await expect(page).toHaveURL(/\/zfs-padding-calculator$/);
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
});

test("keeps every result-driving input visible and marks it required", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");
  const tool = page.getByRole("region", { name: "ZFS allocation calculator" });
  await expect(tool.getByRole("radiogroup", { name: /RAIDZ level/ })).toBeVisible();
  await expect(tool.getByRole("textbox", { name: /Vdev width/ })).toBeVisible();
  await expect(tool.getByRole("radiogroup", { name: /Workload/ })).toBeVisible();
  await expect(tool.getByRole("radiogroup", { name: /ashift/ })).toBeVisible();
  for (const name of ["RAIDZ1", "RAIDZ2", "RAIDZ3", "Filesystem", "Zvol", "9, 512 B", "12, 4 KiB", "13, 8 KiB", "14, 16 KiB"]) {
    await expect(page.getByRole("radio", { name })).toBeVisible();
  }
  await expect(tool.locator('button[data-tool-label="recordsize"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Calculate allocation" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Reset" })).toHaveCount(1);
  expect(await page.locator('[aria-required="true"]').count()).toBeGreaterThanOrEqual(4);
  expect(await page.locator('[aria-hidden="true"]', { hasText: "*" }).count()).toBeGreaterThanOrEqual(5);
});

test("renders one lead answer, exact composition, and one nearby-size table", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");
  await expect(page.getByRole("status", { name: "Physical allocation" })).toHaveCount(0);
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByTestId("result-lead")).toBeFocused();
  const lead = page.getByRole("status", { name: "Physical allocation" });
  await expect(lead).toContainText("192 KiB");
  await expect(lead).toContainText("For one 128 KiB logical block at 66.66% efficiency.");
  await expect(page.getByText("Physical", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Overhead", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Multiplier", { exact: true })).toHaveCount(0);
  await expect(page.getByText("32 data", { exact: true })).toHaveCount(0);

  const allocation = page.getByRole("figure", { name: "Physical allocation composition" });
  for (const [label, value] of [["Logical data", "128 KiB"], ["Sector rounding", "0 B"], ["Parity", "64 KiB"], ["Padding", "0 B"]]) {
    const row = allocation.getByText(label, { exact: true }).locator("..");
    await expect(row).toHaveCount(1);
    await expect(row.getByText(value, { exact: true })).toHaveCount(1);
  }
  await expect(allocation.locator('[data-allocation-segment="logical-data"]')).toBeVisible();
  await expect(allocation.locator('[data-allocation-segment="parity"]')).toBeVisible();
  await expect(allocation.locator('[data-allocation-segment="sector-rounding"]')).toHaveCount(0);
  await expect(allocation.locator('[data-allocation-segment="padding"]')).toHaveCount(0);

  const comparison = page.getByRole("table", { name: "Nearby block sizes" });
  await expect(comparison.getByRole("columnheader")).toHaveText(["Block size", "Physical allocation", "Efficiency"]);
  await expect(comparison.getByRole("row")).toHaveCount(6);
  const currentRow = comparison.locator("tbody tr").filter({ hasText: "128 KiB Current" });
  await expect(currentRow.locator('td[data-label="Physical allocation"]')).toHaveText("192 KiB");
  await expect(currentRow.locator('td[data-label="Efficiency"]')).toHaveText("66.66%");
  await expect(page.getByText(/selected/i)).toHaveCount(0);
  await expect(page.getByText(/winner|optimum|recommended/i)).toHaveCount(0);
});

test("preserves invalid values and shows one field recovery", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");
  await chooseRadio(page, "RAIDZ3");
  await page.getByLabel("Vdev width").fill("3");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByLabel("Vdev width")).toBeFocused();
  await expect(page.getByLabel("Vdev width")).toHaveValue("3");
  await expect(page.getByText("RAIDZ3 needs at least 4 members.", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("status", { name: "Physical allocation" })).toHaveCount(0);
});

test("uses one combined custom size control and submits it with Enter", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");
  await chooseOption(page, "recordsize", "Custom");
  const size = page.getByRole("textbox", { name: /Custom block size/ });
  await expect(size).toBeFocused();
  await size.fill("64");
  await expect(page.locator('button[data-tool-label="Custom block size unit"]')).toContainText("KiB");
  await size.press("Enter");
  await expect(page.getByRole("status", { name: "Physical allocation" })).toContainText("96 KiB");
  await expect(page.getByTestId("result-lead")).toBeFocused();
});

test("each visible model choice changes the submitted answer or valid range", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByRole("status", { name: "Physical allocation" })).toContainText("192 KiB");
  await chooseRadio(page, "RAIDZ1");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByRole("status", { name: "Physical allocation" })).not.toContainText("192 KiB");
  await chooseRadio(page, "RAIDZ2");
  await page.getByLabel("Vdev width").fill("5");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByRole("status", { name: "Physical allocation" })).toContainText("216 KiB");
  await page.getByLabel("Vdev width").fill("6");
  await chooseOption(page, "recordsize", "8 KiB");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByRole("status", { name: "Physical allocation" })).toContainText("24 KiB");
  await chooseRadio(page, "14, 16 KiB");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByRole("status", { name: "Physical allocation" })).toContainText("48 KiB");
  await chooseRadio(page, "Filesystem");
  await chooseOption(page, "recordsize", "16 MiB");
  await chooseRadio(page, "Zvol");
  await expect(page.getByText("volblocksize stops at 128 KiB.", { exact: true })).toHaveCount(1);
});

test("keeps derivation and sources inside one collapsed calculation disclosure", async ({ page }) => {
  await page.goto("/zfs-padding-calculator");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByText("Logical sectors", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Calculation details" }).click();
  const details = page.getByRole("button", { name: "Calculation details" }).locator("../..");
  await expect(details.getByRole("table", { name: "Calculation steps" })).toBeVisible();
  await expect(details).toContainText("Formula version");
  await expect(details).toContainText("Uncompressed block");
  await expect(details).toContainText("Pool effects excluded");
  await expect(details.getByRole("link")).not.toHaveCount(0);
});

test("shares, restores, copies, and resets without duplicate reset actions", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/zfs-padding-calculator");
  await page.getByRole("button", { name: "Calculate allocation" }).click();
  await expect(page.getByRole("button", { name: "Reset" })).toHaveCount(1);
  await page.getByRole("button", { name: "Copy summary" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await page.getByRole("button", { name: "Share configuration" }).click();
  await expect(page).toHaveURL(/\?state=/);
  const shared = page.url();
  await page.reload();
  await expect(page).toHaveURL(shared);
  await expect(page.getByRole("status", { name: "Physical allocation" })).toContainText("192 KiB");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page).toHaveURL(/\/zfs-padding-calculator$/);
  await expect(page.getByLabel("Vdev width")).toHaveValue("6");
  await expect(page.getByRole("status", { name: "Physical allocation" })).toHaveCount(0);
});

for (const [width, height] of [[1280, 800], [768, 1024], [390, 844], [320, 900]]) {
  for (const theme of ["dark", "light"]) {
    test(`fits the full result and calculation details at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/zfs-padding-calculator");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await page.getByRole("button", { name: "Calculate allocation" }).click();
      await page.getByRole("button", { name: "Calculation details" }).click();
      const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth,
      }));
      expect(overflow.document).toBeLessThanOrEqual(1);
      expect(overflow.body).toBeLessThanOrEqual(1);
      for (const control of await page.getByRole("region", { name: "ZFS allocation calculator" }).locator("button, input:not([type=radio]), [role=radio]").all()) {
        const box = await control.boundingBox();
        if (box) expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await expect(page.getByRole("table", { name: "Nearby block sizes" })).toBeVisible();
      await expect(page.getByRole("table", { name: "Calculation steps" })).toBeVisible();
    });
  }
}
