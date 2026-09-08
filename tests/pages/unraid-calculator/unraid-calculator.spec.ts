import { expect, test } from "playwright/test";


test.describe("unraid calculator guarded preview", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = (...args) => { throw new Error(`Unexpected fetch: ${String(args[0])}`); };
      void originalFetch;
      const makeEphemeralStorage = () => {
        const values = new Map<string, string>();
        return {
          getItem: (key: string) => values.get(key) ?? null,
          setItem: (key: string, value: string) => values.set(key, value),
          removeItem: (key: string) => values.delete(key),
          clear: () => values.clear(),
          key: (index: number) => [...values.keys()][index] ?? null,
          get length() { return values.size; },
        };
      };
      Object.defineProperty(window, "localStorage", { configurable: true, value: makeEphemeralStorage() });
      Object.defineProperty(window, "sessionStorage", { configurable: true, value: makeEphemeralStorage() });
      const clipboard = navigator.clipboard;
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: clipboard?.writeText?.bind(clipboard) },
      });
    });
    await page.goto("/unraid-calculator");
  });

  test("starts as a clean single-parity editor", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Unraid Main Array calculator/i })).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "Parity protection" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Calculate capacity" })).toBeVisible();
    await expect(page.getByTestId("capacity-accounting")).toHaveCount(0);
    await expect(page.getByRole("textbox", { name: "Parity 1 capacity" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add data drive" })).toBeVisible();
    await expect(page).toHaveURL(/\/unraid-calculator$/);
    await expect(page.getByText("Plan a future data drive")).toBeVisible();
    await expect(page.getByText("No data drives yet")).toHaveCount(0);
  });

  test("changes explicit parity rows without changing data roles", async ({ page }) => {
    const parity = page.getByRole("radiogroup", { name: "Parity protection" });
    await parity.getByRole("radio", { name: "None" }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("textbox", { name: /Parity .* capacity/ })).toHaveCount(0);
    await parity.getByRole("radio", { name: "Dual parity" }).focus();
    await page.keyboard.press("Space");
    await expect(page.getByRole("textbox", { name: /Parity .* capacity/ })).toHaveCount(2);
  });

  test("adds several explicit data rows one at a time", async ({ page }) => {
    for (let index = 0; index < 4; index += 1) await page.getByRole("button", { name: "Add data drive" }).click();
    await expect(page.getByRole("textbox", { name: /Data .* capacity/ })).toHaveCount(4);
    await expect(page.getByRole("textbox", { name: "Data 4 capacity" })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: "Data rows to add" })).toHaveCount(0);
  });

  test("calculates exact mixed-drive capacity and exposes accounting and topology", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 2 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 3 capacity" }).fill("4");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 4 capacity" }).fill("4");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByLabel("Current data capacity")).toContainText(/24 TB|21\.83 TiB/i);
    await expect(page.getByTestId("capacity-accounting")).toContainText("Assigned parity");
    await expect(page.getByTestId("capacity-accounting")).not.toContainText("Raw installed capacity");
    await page.getByText("Assigned drives").click();
    await expect(page.getByRole("table", { name: "Assigned drives" })).toContainText("Parity 1");
    await expect(page.getByText("Data capacity calculated.", { exact: true })).toBeVisible();
  });

  test("keeps the formula and unit boundary auditable in the result disclosure", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    for (let index = 0; index < 4; index += 1) await page.getByRole("button", { name: "Add data drive" }).click();
    for (const [index, value] of ["8", "8", "4", "4"].entries()) {
      await page.getByRole("textbox", { name: `Data ${index + 1} capacity` }).fill(value);
    }
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByText("Formula and sources").click();
    await expect(page.getByText("Data capacity = sum of current data drives.")).toBeVisible();
    await expect(page.getByText("TB = 10^12 bytes; TiB = 2^40 bytes. Calculations use exact bytes.")).toBeVisible();
  });

  test("clears a stale result and focuses the first invalid capacity", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByTestId("capacity-accounting")).toBeVisible();
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("7");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByTestId("capacity-accounting")).toHaveCount(0);
    await expect(page.getByRole("textbox", { name: "Parity 1 capacity" })).toBeFocused();
    await expect(page.getByRole("alert").getByText(/must be at least as large/i)).toBeVisible();
  });

  test("cleans malformed shared state and shows a visible recovery notice", async ({ page }) => {
    await page.goto("/unraid-calculator?state=malformed");
    await expect(page.getByTestId("state-notice")).toContainText(/could not be restored/i);
    await expect(page).toHaveURL(/\/unraid-calculator$/);
    await expect(page.getByTestId("capacity-accounting")).toHaveCount(0);
  });

  test("keeps blocked future growth separate from current capacity", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 1 capacity" }).fill("8");
    await page.getByText("Plan a future data drive").click();
    await page.getByRole("textbox", { name: /Future data drive capacity/i }).fill("9");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByTestId("capacity-accounting")).toBeVisible();
    await expect(page.getByTestId("growth-status")).toContainText(/parity upgrade required/i);
    await expect(page.getByTestId("growth-status")).not.toContainText(/projected data capacity.*TB/i);
  });

  test("keeps the optional growth result absent until a future drive is entered", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByTestId("growth-status")).toHaveCount(0);
  });

  test("copies only after explicit actions and has a reset path", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByRole("button", { name: "Copy summary" }).click();
    await expect(page.getByText(/Summary copied|Copy failed/)).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByRole("textbox", { name: "Parity 1 capacity" })).toHaveValue("");
    await expect(page.getByTestId("capacity-accounting")).toHaveCount(0);
  });

  test("writes query state only after Share configuration", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page).toHaveURL(/\/unraid-calculator$/);
    await page.getByRole("button", { name: "Share configuration" }).click();
    await expect(page).toHaveURL(/\/unraid-calculator\?state=/);
    await expect(page.getByRole("textbox", { name: "Shared configuration URL" })).toBeVisible();
  });

  test("keeps the expanded result contained in dark and light modes", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("12");
    for (const value of ["12", "8", "4"]) {
      await page.getByRole("button", { name: "Add data drive" }).click();
      await page.getByRole("textbox", { name: `Data ${await page.getByRole("textbox", { name: /Data .* capacity/ }).count()} capacity` }).fill(value);
    }
    await page.getByText("Plan a future data drive").click();
    await page.getByRole("textbox", { name: "Future data drive capacity" }).fill("10");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByText("Assigned drives").click();
    await page.getByText("Formula and sources").click();

    const measure = () => page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    const darkMobile = await measure();
    expect(darkMobile.document).toBeLessThanOrEqual(darkMobile.viewport);
    await page.getByRole("button", { name: "Switch to light mode" }).click();
    const lightMobile = await measure();
    expect(lightMobile.document).toBeLessThanOrEqual(lightMobile.viewport);
    await page.setViewportSize({ width: 1280, height: 900 });
    const lightDesktop = await measure();
    expect(lightDesktop.document).toBeLessThanOrEqual(lightDesktop.viewport);
    await page.getByRole("button", { name: "Switch to dark mode" }).click();
    const darkDesktop = await measure();
    expect(darkDesktop.document).toBeLessThanOrEqual(darkDesktop.viewport);
  });

  for (const width of [320, 375, 760, 1280]) {
    test(`does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const metrics = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        bodyWidth: document.body.scrollWidth,
      }));
      expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth);
      expect(metrics.bodyWidth).toBeLessThanOrEqual(metrics.viewportWidth);
    });
  }
});
