import { expect, test } from "playwright/test";

test("the temporary component lab stays unavailable in production", async ({ page }) => {
  test.skip(process.env.STACK127_TEST_SERVER !== "production", "Production route guard only.");
  expect((await page.goto("/tool-ui-lab"))?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Tool components" })).toHaveCount(0);
});

test("the component lab exposes working controls without visible native selects", async ({ page }) => {
  test.skip(process.env.STACK127_TEST_SERVER === "production", "The component lab is development-only.");
  await page.goto("/tool-ui-lab");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tool components");
  expect(await page.locator("select").evaluateAll((selects) => selects.every((select) => {
    const wrapper = select.parentElement?.parentElement;
    return wrapper?.style.clipPath === "inset(50%)" && wrapper.style.position === "fixed";
  }))).toBe(true);

  await page.locator('button[data-tool-label="Resolver"]').click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.getByRole("option", { name: "Google Public DNS" }).click();
  await expect(page.locator('button[data-tool-label="Resolver"]')).toContainText("Google Public DNS");

  const filterRecords = page.getByRole("searchbox", { name: "Filter records" });
  await filterRecords.fill("AAAA");
  const clearFilter = page.getByRole("button", { name: "Clear Filter records" });
  await expect(clearFilter).toHaveCount(1);
  await clearFilter.click();
  await expect(filterRecords).toHaveValue("");

  const recordSearch = page.getByRole("combobox", { name: "Record type search" });
  await recordSearch.fill("mx");
  await page.getByRole("option", { name: "MX" }).click();
  await expect(recordSearch).toHaveValue("MX");

  const driveCount = page.getByRole("textbox", { name: "Drive count", exact: true });
  await expect(driveCount).toHaveValue("4");
  await page.getByRole("button", { name: "Increase Drive count" }).click();
  await expect(driveCount).toHaveValue("5");

  await page.locator('button[data-tool-label="Capacity unit"]').click();
  await page.getByRole("option", { name: "TB", exact: true }).click();
  await expect(page.locator('button[data-tool-label="Capacity unit"]')).toContainText("TB");

  await page.getByText("RAIDZ2", { exact: true }).click();
  await expect(page.getByRole("radio", { name: "RAIDZ2" })).toBeChecked();
  await page.getByText("Reserve 20% free space", { exact: true }).click();
  await expect(page.getByRole("checkbox", { name: "Reserve 20% free space" })).toBeChecked();

  await page.getByRole("button", { name: "Add drive" }).click();
  await expect(page.getByTestId("drive-row")).toHaveCount(3);
  await page.getByRole("button", { name: "Remove drive 3" }).click();
  await expect(page.getByTestId("drive-row")).toHaveCount(2);

  await page.getByRole("button", { name: "Advanced settings" }).click();
  await expect(page.getByText("Record size")).toBeVisible();

  await page.getByRole("button", { name: "Test validation" }).click();
  await expect(page.getByText("Enter a hostname.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: /Required hostname/ })).toBeFocused();

  await expect(page.getByRole("table", { name: "Nameserver addresses" })).toBeVisible();
});

test("the combo trigger has one accessible name and opens by mouse and keyboard", async ({ page }) => {
  test.skip(process.env.STACK127_TEST_SERVER === "production", "The component lab is development-only.");
  await page.goto("/tool-ui-lab");

  const input = page.getByRole("combobox", { name: "Record type search", exact: true });
  const trigger = page.getByRole("button", { name: "Open Record type search", exact: true });
  await expect(trigger).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Open Record type search Record type search", exact: true })).toHaveCount(0);

  await trigger.click();
  await expect(page.getByRole("option", { name: "MX", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await input.press("ArrowDown");
  await expect(page.getByRole("option", { name: "MX", exact: true })).toBeVisible();
  await page.getByRole("option", { name: "MX", exact: true }).click();
  await expect(input).toHaveValue("MX");
});

test("upload, date, level, and chart examples are operable", async ({ page }) => {
  test.skip(process.env.STACK127_TEST_SERVER === "production", "The component lab is development-only.");
  await page.goto("/tool-ui-lab");

  const pdfInput = page.locator('input[type="file"][accept="application/pdf"]');
  await pdfInput.setInputFiles({ name: "interior.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7\n") });
  await expect(page.getByRole("list", { name: "Selected PDF files" })).toContainText("interior.pdf");

  const imageInput = page.locator('input[type="file"][accept="image/png,image/jpeg,image/webp"]');
  await imageInput.setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: Buffer.from("image") });
  await expect(page.getByRole("list", { name: "Selected images" })).toContainText("cover.png");

  await page.getByRole("button", { name: "Open Maintenance date calendar" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");

  const level = page.getByRole("slider", { name: "Backup confidence" });
  await level.press("End");
  await expect(page.getByRole("group", { name: "Backup confidence" }).getByRole("status")).toHaveText("Production");

  const levelTrack = page.locator("[data-tool-level-track]");
  const levelTrackBox = await levelTrack.boundingBox();
  expect(levelTrackBox?.height).toBeGreaterThanOrEqual(44);
  expect(await page.locator("[data-tool-level-fill]").evaluate((fill) => fill.getBoundingClientRect().height)).toBeLessThanOrEqual(4);
  await levelTrack.click({ position: { x: (levelTrackBox?.width ?? 0) * 0.68, y: 4 } });
  await expect(page.getByRole("group", { name: "Backup confidence" }).getByRole("status")).toHaveText("Monitored");

  await expect(page.getByRole("figure", { name: "Requests handled by service" })).toBeVisible();
  await expect(page.getByRole("figure", { name: "Storage use over six months" })).toBeVisible();
  await expect(page.getByRole("list", { name: "PDF processing flow" })).toBeVisible();
});

test("the lab preserves its control flow at a narrow viewport", async ({ page }) => {
  test.skip(process.env.STACK127_TEST_SERVER === "production", "The component lab is development-only.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tool-ui-lab");

  await expect(page.getByRole("button", { name: "Run example" })).toBeVisible();
  const action = await page.getByRole("button", { name: "Run example" }).boundingBox();
  expect(action?.width).toBeGreaterThan(300);
});

test("result components remain useful and contained", async ({ page }) => {
  test.skip(process.env.STACK127_TEST_SERVER === "production", "The component lab is development-only.");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tool-ui-lab");

  await expect(page.getByRole("status", { name: "Estimated usable capacity" })).toContainText("21.8 TiB");
  await expect(page.getByRole("progressbar", { name: "Rebuild progress" })).toHaveAttribute("value", "68");
  for (const name of ["Neutral allocation", "Accent allocation", "Categorical allocation"]) {
    await expect(page.getByRole("figure", { name })).toBeVisible();
  }
  const categorical = page.getByRole("figure", { name: "Categorical allocation" });
  const segmentColors = await categorical.locator('[data-allocation-segment]').evaluateAll((segments) => segments.map((segment) => getComputedStyle(segment).backgroundColor));
  expect(new Set(segmentColors).size).toBe(segmentColors.length);
  await expect(page.getByRole("list", { name: "Registration timeline" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Generated command" })).toContainText("zpool create");

  await page.getByRole("button", { name: "Advance 10%" }).click();
  await expect(page.getByRole("progressbar", { name: "Rebuild progress" })).toHaveAttribute("value", "78");
  await page.getByRole("button", { name: "Reset progress" }).click();
  await expect(page.getByRole("progressbar", { name: "Rebuild progress" })).toHaveAttribute("value", "0");

  await page.getByRole("button", { name: "Registry response" }).click();
  await expect(page.getByText('"objectClassName": "domain"')).toBeVisible();
  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(widths.scroll).toBe(widths.client);

  await expect(page.getByRole("figure", { name: "Requests handled by service" })).toBeVisible();
  await expect(page.getByRole("figure", { name: "Storage use over six months" })).toBeVisible();

  await page.getByRole("button", { name: "Copy summary" }).click();
  await expect(page.getByRole("button", { name: "Copied summary" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("capacity-report.txt");
});
