import { expect, test, type Page } from "playwright/test";
import { calculateRaidzExpansion } from "../../../lib/storage/zfs-expansion.ts";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded local preview.");

async function fillValid(page: Page) {
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("0.25");
}

async function fillFf001(page: Page) {
  await page.getByLabel("Current width").fill("4");
  await page.getByLabel("Final width").fill("8");
  await page.getByLabel("Smallest member unit").selectOption("GiB");
  await page.getByRole("textbox", { name: /Smallest member/ }).fill("1");
  await page.getByLabel("Each added disk unit").selectOption("GiB");
  await page.getByRole("textbox", { name: /Each added disk/ }).fill("1");
  await page.getByLabel("Current physical allocation unit").selectOption("GB");
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("0.270337234");
}

test("plans, clears stale output, shares, restores, and resets", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/raidz-expansion-planner");
  await expect(page).toHaveURL(/raidz-expansion-planner$/);
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toHaveCount(0);
  await fillValid(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toBeFocused();
  await expect(page.getByTestId("reported-capacity")).toHaveText("Unknown");
  await expect(page).toHaveURL(/raidz-expansion-planner$/);
  await page.getByLabel("Final width").fill("8");
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toHaveCount(0);
  await page.getByLabel("Final width").press("Enter");
  await expect(page.getByText("8 wide", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Share plan" }).click();
  await expect(page).toHaveURL(/\?state=/);
  const shared = page.url();
  await page.reload();
  await expect(page).toHaveURL(shared);
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Smallest member/ })).toHaveValue("8");
  await expect(page.getByLabel("Smallest member unit")).toHaveValue("TB");
  await expect(page.getByRole("textbox", { name: /Each added disk/ })).toHaveValue("8");
  await expect(page.getByLabel("Each added disk unit")).toHaveValue("TB");
  await expect(page.getByRole("textbox", { name: /Current physical allocation/ })).toHaveValue("250");
  await expect(page.getByLabel("Current physical allocation unit")).toHaveValue("GB");
  await page.getByLabel("Final width").fill("9");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByText("9 wide", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page).toHaveURL(/raidz-expansion-planner$/);
  await expect(page.getByLabel("RAIDZ1")).toBeFocused();
  await expect(page.getByRole("textbox", { name: /Current physical allocation/ })).toHaveValue("");
});

test("rejects invalid plans and focuses recovery", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await page.getByLabel("Final width").fill("6");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByLabel("Final width")).toBeFocused();
  await expect(page.locator("#final-error")).toHaveText("Must exceed current width.");
  await expect(page.locator('[role="alert"]').filter({ hasText: "Fix these inputs" })).toContainText("Fix these inputs");
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toHaveCount(0);
  await page.getByLabel("Final width").fill("7");
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("49");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByRole("textbox", { name: /Current physical allocation/ })).toBeFocused();
});

test("offers every block-size power and exact custom entry", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await expect(page.getByLabel("recordsize").locator('option[value="2048"]')).toHaveCount(1);
  await expect(page.getByLabel("recordsize").locator('option[value="custom"]')).toHaveCount(1);
  await page.getByLabel("recordsize").selectOption("custom");
  await page.getByLabel("Custom block size").fill("2");
  await page.getByLabel("Custom block unit").selectOption("KiB");
  await fillValid(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toBeVisible();
  await page.getByLabel("Custom block size").fill("256");
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toHaveCount(0);
  await page.getByLabel("Zvol").check();
  await expect(page.locator("#block-error")).toHaveText("volblocksize is too large.");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.locator('[role="alert"]').filter({ hasText: "Fix these inputs" })).toContainText("volblocksize is too large.");
});

test("keeps a usable share URL when clipboard write fails", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } });
  });
  await page.goto("/raidz-expansion-planner");
  await fillValid(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await page.getByRole("button", { name: "Share plan" }).click();
  await expect(page).toHaveURL(/\?state=/);
  await expect(page.getByLabel("Share link")).toHaveValue(/\?state=/);
  await expect(page.getByText("Link ready. Copy failed.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toBeVisible();
});

test("capacity unit controls have unique accessible names", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  for (const label of ["Smallest member", "Each added disk", "Current physical allocation"]) {
    await expect(page.getByRole("textbox", { name: label, exact: true })).toHaveCount(1);
  }
  for (const label of ["Smallest member unit", "Each added disk unit", "Current physical allocation unit", "recordsize", "ashift"]) {
    await expect(page.getByLabel(label, { exact: true })).toHaveCount(1);
  }
  await expect(page.getByLabel("Unit", { exact: true })).toHaveCount(0);
  await fillValid(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByLabel("Display unit", { exact: true })).toHaveCount(1);
});

test("unit edits preserve exact capacity and surface invalid conversions", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await page.getByLabel("Smallest member unit").selectOption("TiB");
  await expect(page.getByRole("textbox", { name: /Smallest member/ })).toHaveValue("7.2759576141834259033203125");
  await page.getByLabel("Smallest member unit").selectOption("TB");
  await expect(page.getByRole("textbox", { name: /Smallest member/ })).toHaveValue("8");
  await page.getByRole("textbox", { name: /Each added disk/ }).fill("bad");
  await page.getByLabel("Each added disk unit").selectOption("TiB");
  await expect(page.getByRole("textbox", { name: /Each added disk/ })).toHaveValue("bad");
  await expect(page.locator("#added-error")).toHaveText("Convert a valid capacity first.");
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toHaveCount(0);
});

test("timeline includes ordered gain values on desktop and mobile", async ({ page }) => {
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/raidz-expansion-planner");
    await fillFf001(page);
    await page.getByRole("button", { name: "Plan expansion" }).click();
    const table = page.getByRole("table").first();
    const headers = await table.getByRole("columnheader").allTextContents();
    expect(headers).toEqual(["Width", "Gain now", "Immediate", "Fresh", "Gap"]);
    const rows = table.getByRole("row");
    const offset = 1;
    await expect(rows).toHaveCount(5 + offset);
    await expect(rows.nth(offset)).toContainText("4 wide");
    await expect(rows.nth(offset)).toContainText("0 TB");
    await expect(rows.nth(4 + offset)).toContainText("<0.01 TB");
  }
});

test("keeps timeline and trace header semantics at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/raidz-expansion-planner");
  await fillFf001(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const timeline = page.getByRole("table").first();
  await expect(timeline.getByRole("columnheader", { name: "Gain now", exact: true })).toHaveCount(1);
  await expect(timeline.getByRole("columnheader", { name: "Immediate", exact: true })).toHaveCount(1);
  await expect(timeline.getByRole("columnheader", { name: "Fresh", exact: true })).toHaveCount(1);
  await expect(timeline.getByRole("columnheader", { name: "Gap", exact: true })).toHaveCount(1);
  await page.getByText("Show calculation").click();
  const trace = page.getByRole("table").nth(1);
  for (const name of ["Sectors per block", "Free physical bytes", "New block count", "New writable bytes", "Immediate bytes", "Native bytes", "Gap bytes"]) await expect(trace.getByRole("columnheader", { name, exact: true })).toHaveCount(1);
});

test("composition exposes each segment label and value once", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await fillFf001(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const composition = page.getByRole("heading", { name: "Final-width composition" }).locator("..");
  for (const label of ["Old logical", "New writable", "Gap"]) await expect(composition.getByText(label, { exact: true })).toHaveCount(1);
  await expect(composition.locator("dl")).toHaveCount(0);
});

test("announces one complete answer and one invalid surface", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await fillFf001(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const live = page.locator('[aria-live="polite"]');
  await expect(live).toHaveCount(1);
  await expect(live).toContainText("3964796928 B gained");
  await expect(live).toContainText("2082340864 B current");
  await expect(live).toContainText("6047137792 B immediate");
  await expect(live).toContainText("6108348416 B fresh");
  await expect(live).toContainText("61210624 B gap");
  await expect(live).toContainText("RAIDZ2 unchanged");
  await expect(live).toContainText("reported capacity unknown");
  const liveBox = await live.boundingBox();
  expect(liveBox?.width ?? 0).toBeLessThanOrEqual(1);
  expect(liveBox?.height ?? 0).toBeLessThanOrEqual(1);
  const liveStyle = await live.evaluate((element) => ({ clip: getComputedStyle(element).clip, position: getComputedStyle(element).position }));
  expect(liveStyle.position).toBe("absolute");
  expect(liveStyle.clip).not.toBe("auto");
  await expect(page.getByRole("heading", { name: "Capacity plan" })).toBeFocused();
  await page.getByLabel("Final width").fill("4");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByRole("region", { name: "RAIDZ expansion planner" }).locator('[role="alert"]')).toHaveCount(1);
  await expect(page.locator('[aria-live="polite"]')).toHaveCount(0);
  await expect(page.getByLabel("Final width")).toBeFocused();
});

test("copies normalized inputs, exact results, and assumptions", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => { (window as typeof window & { copied?: string }).copied = text; } } });
  });
  await page.goto("/raidz-expansion-planner");
  await fillFf001(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await page.getByRole("button", { name: "Copy summary" }).click();
  const copied = await page.evaluate(() => (window as typeof window & { copied?: string }).copied ?? "");
  for (const text of ["member 1073741824 B", "each added disk 1073741824 B", "current physical allocation 270337234 B", "immediate 6047137792 B", "Formula v1", "Current vdev has not been expanded", "No allocations change between planned steps"]) expect(copied).toContain(text);
});

test("shows exact FF-001 trace and distinguishes rounded nonzero from zero", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await fillFf001(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByText("<0.01 TB gained", { exact: true })).toBeVisible();
  await page.getByText("Show calculation").click();
  const trace = page.locator("details[open]");
  for (const text of ["Old logical bytes", "131072000 B", "Physical remainder", "1234 B", "Free physical bytes", "New block count", "New writable bytes", "Immediate bytes", "Native bytes", "Gap bytes", "The current vdev has not been expanded.", "No allocations change between planned steps.", "2026-08-13"]) await expect(trace).toContainText(text);
  const expected = calculateRaidzExpansion({ level: "raidz2", currentWidth: 4, finalWidth: 8, memberBytes: 1_073_741_824n, addedDiskBytes: 1_073_741_824n, allocatedBytes: 270_337_234n, workload: "filesystem", blockSizeBytes: 131_072n, ashift: 12 });
  for (const step of [expected.values!.current, ...expected.values!.steps]) {
    const row = trace.locator(`[data-trace-width="${step.width}"]`);
    for (const value of [step.allocation.allocatedSectors, step.freePhysicalBytes, step.newBlockCount, step.newWritableLogicalBytes, step.immediateLogicalBytes, step.nativeLogicalBytes, step.geometryGapBytes]) await expect(row).toContainText(value.toString());
  }
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByLabel("Current width").fill("4");
  await page.getByLabel("Final width").fill("8");
  await page.getByLabel("Smallest member unit").selectOption("GiB");
  await page.getByRole("textbox", { name: /Smallest member/ }).fill("1");
  await page.getByLabel("Each added disk unit").selectOption("GiB");
  await page.getByRole("textbox", { name: /Each added disk/ }).fill("1");
  await page.getByLabel("Current physical allocation unit").selectOption("GB");
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("0");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const currentRow = page.getByRole("table").first().getByRole("row").nth(1);
  await expect(currentRow.getByRole("cell").nth(1)).toHaveText("0 TB");
  await expect(page.getByText("Geometry gap").locator("..").getByText("0 TB", { exact: true })).toBeVisible();
});

test("keeps longest composition values readable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/raidz-expansion-planner");
  await page.getByLabel("Current width").fill("63");
  await page.getByLabel("Final width").fill("64");
  await page.getByRole("textbox", { name: /Smallest member/ }).fill("10000");
  await page.getByRole("textbox", { name: /Each added disk/ }).fill("10000");
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("10000");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await page.getByText("Show calculation").click();

  const values = page.getByRole("heading", { name: "Final-width composition" }).locator("..").locator("strong");
  await expect(values).toHaveCount(3);
  for (const value of await values.all()) {
    const box = await value.boundingBox();
    const label = await value.textContent() ?? "composition value";
    expect(box?.width, label).toBeGreaterThan(80);
    expect(box?.height, label).toBeLessThan(32);
  }
});

for (const [width, height] of [[1280, 800], [760, 900], [375, 844], [320, 900]]) {
  for (const theme of ["dark", "light"]) {
    test(`fits result and trace at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/raidz-expansion-planner");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await page.getByLabel("Final width").fill("12");
      await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("47.999999999");
      await page.getByRole("button", { name: "Plan expansion" }).click();
      await page.getByText("Show calculation").click();
      const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth,
      }));
      expect(overflow.document).toBeLessThanOrEqual(1);
      expect(overflow.body).toBeLessThanOrEqual(1);
      await expect(page.getByTestId("reported-capacity")).toBeVisible();
      await expect(page.getByText("12 wide", { exact: true })).toBeVisible();
      for (const control of await page.getByRole("region", { name: "RAIDZ expansion planner" }).locator("button, input:not([type=radio]), select, summary, label:has(input[type=radio]) > span").all()) {
        const box = await control.boundingBox();
        if (box) expect(box.height, await control.evaluate((element) => `${element.tagName}:${element.getAttribute("aria-label") ?? element.textContent}`)).toBeGreaterThanOrEqual(44);
      }
    });
  }
}
