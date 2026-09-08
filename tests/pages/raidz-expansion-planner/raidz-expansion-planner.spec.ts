import { expect, test, type Page } from "playwright/test";
import { calculateRaidzExpansion } from "../../../lib/storage/zfs-expansion.ts";


async function fillValid(page: Page) {
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("0.25");
}

async function chooseOption(page: Page, label: string, option: string) {
  await page.locator(`button[data-tool-label="${label}"]`).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function fillFf001(page: Page) {
  await page.getByLabel("Current width").fill("4");
  await page.getByLabel("Final width").fill("8");
  await chooseOption(page, "Smallest member unit", "GiB");
  await page.getByRole("textbox", { name: /Smallest existing member/ }).fill("1");
  await chooseOption(page, "Each added disk unit", "GiB");
  await page.getByRole("textbox", { name: /Each added disk/ }).fill("1");
  await chooseOption(page, "Current physical allocation unit", "GB");
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("0.270337234");
}

test("keeps the clean canonical URL unchanged through hydration", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  const historyLength = await page.evaluate(() => history.length);
  await expect(page).toHaveURL(/\/raidz-expansion-planner$/);
  await page.waitForTimeout(250);
  await expect(page).toHaveURL(/\/raidz-expansion-planner$/);
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
});

test("plans, clears stale output, shares, restores, and resets", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/raidz-expansion-planner");
  await expect(page).toHaveURL(/raidz-expansion-planner$/);
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toHaveCount(0);
  await fillValid(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.locator("[data-result-lead]")).toBeFocused();
  await expect(page.getByText("Live reported capacity is not predicted by this model.", { exact: true })).toHaveCount(1);
  await expect(page).toHaveURL(/raidz-expansion-planner$/);
  await page.getByLabel("Final width").fill("8");
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toHaveCount(0);
  await page.getByLabel("Final width").press("Enter");
  await expect(page.getByRole("row", { name: /Disk 2 8/ })).toBeVisible();
  await page.getByRole("button", { name: "Share plan" }).click();
  await expect(page).toHaveURL(/\?state=/);
  const shared = page.url();
  await page.reload();
  await expect(page).toHaveURL(shared);
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Smallest existing member/ })).toHaveValue("8");
  await expect(page.locator('button[data-tool-label="Smallest member unit"]')).toContainText("TB");
  await expect(page.getByRole("textbox", { name: /Each added disk/ })).toHaveValue("8");
  await expect(page.locator('button[data-tool-label="Each added disk unit"]')).toContainText("TB");
  await expect(page.getByRole("textbox", { name: /Current physical allocation/ })).toHaveValue("250");
  await expect(page.locator('button[data-tool-label="Current physical allocation unit"]')).toContainText("GB");
  await page.getByLabel("Final width").fill("9");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByRole("row", { name: /Disk 3 9/ })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page).toHaveURL(/raidz-expansion-planner$/);
  await expect(page.getByRole("radio", { name: "RAIDZ1" })).toBeFocused();
  await expect(page.getByRole("textbox", { name: /Current physical allocation/ })).toHaveValue("");
});

test("rejects invalid plans and focuses recovery", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await page.getByLabel("Final width").fill("6");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByLabel("Final width")).toBeFocused();
  await expect(page.getByText("Must exceed current width.", { exact: true })).toBeVisible();
  await expect(page.getByText("Must exceed current width.", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toHaveCount(0);
  await page.getByLabel("Final width").fill("7");
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("49");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByRole("textbox", { name: /Current physical allocation/ })).toBeFocused();
});

test("keeps every required result-driving model input visible", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await expect(page.getByRole("button", { name: /Allocation model:/ })).toHaveCount(0);
  await expect(page.getByRole("radio", { name: "Filesystem" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Zvol" })).toBeVisible();
  await expect(page.locator('button[data-tool-label="recordsize"]')).toBeVisible();
  await expect(page.locator('button[data-tool-label="ashift"]')).toBeVisible();
  await chooseOption(page, "recordsize", "Custom");
  await page.getByRole("textbox", { name: /Custom block size/ }).fill("2");
  await chooseOption(page, "Custom block unit", "KiB");
  await fillValid(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toBeVisible();
  await page.getByRole("textbox", { name: /Custom block size/ }).fill("256");
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toHaveCount(0);
  await page.getByText("Zvol", { exact: true }).click();
  await expect(page.getByText("volblocksize is too large.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByText("volblocksize is too large.", { exact: true })).toHaveCount(1);
});

test("result-driving block size and ashift choices change the submitted answer", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await fillFf001(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const defaultAnswer = await page.locator('[aria-live="polite"]').textContent();

  await chooseOption(page, "recordsize", "4 KiB");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const blockSizeAnswer = await page.locator('[aria-live="polite"]').textContent();
  expect(blockSizeAnswer).not.toBe(defaultAnswer);

  await chooseOption(page, "ashift", "14 (16384 B)");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const ashiftAnswer = await page.locator('[aria-live="polite"]').textContent();
  expect(ashiftAnswer).not.toBe(blockSizeAnswer);
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
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toBeVisible();
});

test("capacity unit controls have unique accessible names", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  for (const label of ["Smallest existing member", "Each added disk", "Current physical allocation"]) {
    await expect(page.getByRole("textbox", { name: new RegExp(label) })).toHaveCount(1);
  }
  for (const label of ["Smallest member unit", "Each added disk unit", "Current physical allocation unit", "recordsize", "ashift"]) {
    await expect(page.locator(`button[data-tool-label="${label}"]`)).toHaveCount(1);
  }
  await expect(page.getByLabel("Unit", { exact: true })).toHaveCount(0);
  await fillValid(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.locator('button[data-tool-label="Display unit"]')).toHaveCount(1);
});

test("unit edits preserve exact capacity and surface invalid conversions", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await chooseOption(page, "Smallest member unit", "TiB");
  await expect(page.getByRole("textbox", { name: /Smallest existing member/ })).toHaveValue("7.2759576141834259033203125");
  await chooseOption(page, "Smallest member unit", "TB");
  await expect(page.getByRole("textbox", { name: /Smallest existing member/ })).toHaveValue("8");
  await page.getByRole("textbox", { name: /Each added disk/ }).fill("bad");
  await chooseOption(page, "Each added disk unit", "TiB");
  await expect(page.getByRole("textbox", { name: /Each added disk/ })).toHaveValue("bad");
  await expect(page.getByText("Convert a valid capacity first.", { exact: true })).toBeVisible();
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toHaveCount(0);
});

test("step table includes one future row per attach on desktop and mobile", async ({ page }) => {
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/raidz-expansion-planner");
    await fillFf001(page);
    await page.getByRole("button", { name: "Plan expansion" }).click();
    const table = page.getByRole("table").first();
    const headers = await table.getByRole("columnheader").allTextContents();
    expect(headers).toEqual(["After attach", "Width", "Gain from current", "Modeled capacity", "Fresh comparator", "Gap"]);
    const rows = table.getByRole("row");
    await expect(rows).toHaveCount(5);
    await expect(rows.nth(1)).toContainText("Disk 1");
    await expect(rows.nth(1)).toContainText("5");
    await expect(rows.nth(4)).toContainText("Disk 4");
    await expect(rows.nth(4)).toContainText("<0.01 TB");
  }
});

test("keeps step and trace header semantics at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/raidz-expansion-planner");
  await fillFf001(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const steps = page.getByRole("table", { name: "Expansion steps" });
  for (const name of ["After attach", "Width", "Gain from current", "Modeled capacity", "Fresh comparator", "Gap"]) await expect(steps.getByRole("columnheader", { name, exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "Calculation details" }).click();
  const trace = page.getByRole("table", { name: "Exact allocation by width" });
  for (const name of ["Width", "Sectors per block", "Block physical bytes", "Common raw bytes", "Free physical bytes", "New block count", "Writable logical bytes", "Modeled capacity", "Fresh comparator", "Gap bytes"]) await expect(trace.getByRole("columnheader", { name, exact: true })).toHaveCount(1);
});

test("composition exposes each segment label and value once", async ({ page }) => {
  await page.goto("/raidz-expansion-planner");
  await fillFf001(page);
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const composition = page.getByRole("figure", { name: /Fresh 8-member logical envelope/ });
  for (const label of ["Old-width logical data", "Writable at final width", "Geometry gap"]) await expect(composition.getByText(label, { exact: true })).toHaveCount(1);
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
  await expect(page.locator("[data-result-lead]")).toBeFocused();
  await page.getByLabel("Final width").fill("4");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await expect(page.getByText("Must exceed current width.", { exact: true })).toHaveCount(1);
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
  await expect(page.getByRole("status", { name: "Modeled capacity gained" })).toHaveText(/<0\.01 TB/);
  await page.getByRole("button", { name: "Calculation details" }).click();
  const trace = page.getByRole("button", { name: "Calculation details" }).locator("../..");
  for (const text of ["Old logical bytes", "131072000 B", "Physical remainder", "1234 B", "Free physical bytes", "New block count", "Writable logical bytes", "Modeled capacity", "Fresh comparator", "Gap bytes", "The current vdev has not been expanded.", "No allocations change between planned steps.", "2026-08-13"]) await expect(trace).toContainText(text);
  const expected = calculateRaidzExpansion({ level: "raidz2", currentWidth: 4, finalWidth: 8, memberBytes: 1_073_741_824n, addedDiskBytes: 1_073_741_824n, allocatedBytes: 270_337_234n, workload: "filesystem", blockSizeBytes: 131_072n, ashift: 12 });
  for (const step of [expected.values!.current, ...expected.values!.steps]) {
    const row = trace.locator(`[data-trace-width="${step.width}"]`);
    for (const value of [step.allocation.allocatedSectors, step.freePhysicalBytes, step.newBlockCount, step.newWritableLogicalBytes, step.immediateLogicalBytes, step.nativeLogicalBytes, step.geometryGapBytes]) await expect(row).toContainText(value.toString());
  }
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByLabel("Current width").fill("4");
  await page.getByLabel("Final width").fill("8");
  await chooseOption(page, "Smallest member unit", "GiB");
  await page.getByRole("textbox", { name: /Smallest existing member/ }).fill("1");
  await chooseOption(page, "Each added disk unit", "GiB");
  await page.getByRole("textbox", { name: /Each added disk/ }).fill("1");
  await chooseOption(page, "Current physical allocation unit", "GB");
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("0");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  const firstStep = page.getByRole("table", { name: "Expansion steps" }).getByRole("row").nth(1);
  await expect(firstStep.getByRole("rowheader")).toHaveText("Disk 1");
  await expect(firstStep.getByRole("cell").nth(0)).toHaveText("5");
  await expect(page.getByText("Geometry gap").locator("..").getByText("0 TB", { exact: true })).toBeVisible();
});

test("keeps longest composition values readable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/raidz-expansion-planner");
  await page.getByLabel("Current width").fill("63");
  await page.getByLabel("Final width").fill("64");
  await page.getByRole("textbox", { name: /Smallest existing member/ }).fill("10000");
  await page.getByRole("textbox", { name: /Each added disk/ }).fill("10000");
  await page.getByRole("textbox", { name: /Current physical allocation/ }).fill("10000");
  await page.getByRole("button", { name: "Plan expansion" }).click();
  await page.getByRole("button", { name: "Calculation details" }).click();

  const composition = page.getByRole("figure", { name: /Fresh 64-member logical envelope/ });
  const compositionBox = await composition.boundingBox();
  const values = composition.locator("strong");
  await expect(values).toHaveCount(3);
  for (const value of await values.all()) {
    const box = await value.boundingBox();
    const label = await value.textContent() ?? "composition value";
    expect(box?.height, label).toBeLessThan(32);
    expect(box?.x ?? 0, label).toBeGreaterThanOrEqual(compositionBox?.x ?? 0);
    expect((box?.x ?? 0) + (box?.width ?? 0), label).toBeLessThanOrEqual((compositionBox?.x ?? 0) + (compositionBox?.width ?? 0) + 1);
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
      await page.getByRole("button", { name: "Calculation details" }).click();
      const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth,
      }));
      expect(overflow.document).toBeLessThanOrEqual(1);
      expect(overflow.body).toBeLessThanOrEqual(1);
      await expect(page.getByText("Live reported capacity is not predicted by this model.", { exact: true })).toBeVisible();
      await expect(page.getByRole("row", { name: /Disk 6 12/ })).toBeVisible();
      for (const control of await page.getByRole("region", { name: "RAIDZ expansion planner" }).locator("button, input:not([type=radio]), [role=radio]").all()) {
        const box = await control.boundingBox();
        if (box) expect(box.height, await control.evaluate((element) => `${element.tagName}:${element.getAttribute("aria-label") ?? element.textContent}`)).toBeGreaterThanOrEqual(44);
      }
    });
  }
}
