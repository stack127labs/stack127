import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";

test.describe("unraid calculator guarded preview", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!localPreview, "Requires the guarded managed-development preview; do not mutate a registry.");
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
    await expect(page.getByRole("group", { name: "Parity protection" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Calculate capacity" })).toBeVisible();
    await expect(page.getByTestId("capacity-accounting")).toHaveCount(0);
    await expect(page.getByRole("textbox", { name: "Parity 1 capacity" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add data drive" })).toBeVisible();
  });

  test("changes explicit parity rows without changing data roles", async ({ page }) => {
    const parity = page.getByRole("radiogroup", { name: "Parity protection" });
    await parity.getByRole("radio", { name: "None" }).check();
    await expect(page.getByRole("textbox", { name: /Parity .* capacity/ })).toHaveCount(0);
    await parity.getByRole("radio", { name: "Dual" }).check();
    await expect(page.getByRole("textbox", { name: /Parity .* capacity/ })).toHaveCount(2);
    await expect(page.getByRole("status")).toContainText(/2 parity/i);
  });

  test("adds several explicit data rows without assigning their roles", async ({ page }) => {
    await page.getByRole("spinbutton", { name: "Data rows to add" }).fill("4");
    await page.getByRole("button", { name: "Add rows" }).click();
    await expect(page.getByRole("textbox", { name: /Data .* capacity/ })).toHaveCount(4);
    await expect(page.getByRole("textbox", { name: "Data 4 capacity" })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: /24 TB data capacity|21\.83 TiB data capacity/i })).toBeVisible();
    await expect(page.getByTestId("capacity-accounting")).toContainText("Assigned parity capacity");
    await expect(page.getByTestId("role-topology")).toContainText("PARITY 1");
    await expect(page.getByRole("status")).toContainText(/data capacity/i);
  });

  test("keeps the formula and unit boundary auditable in the result disclosure", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add rows" }).click();
    for (const [index, value] of ["8", "8", "4", "4"].entries()) {
      await page.getByRole("textbox", { name: `Data ${index + 1} capacity` }).fill(value);
    }
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByText("Formula details").click();
    const details = page.locator("details");
    await expect(details).toContainText("Data capacity = sum of current data drives");
    await expect(details).toContainText("Parity headroom is assigned parity space");
    await expect(details).toContainText("TB = 10^12 bytes; TiB = 2^40 bytes");
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
    await page.getByRole("textbox", { name: /Proposed data drive capacity/i }).fill("9");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await expect(page.getByTestId("capacity-accounting")).toBeVisible();
    await expect(page.getByTestId("growth-status")).toContainText(/blocked/i);
    await expect(page.getByTestId("growth-status")).not.toContainText(/projected data capacity.*TB/i);
  });

  test("copies only after explicit actions and has a reset path", async ({ page }) => {
    await page.getByRole("textbox", { name: "Parity 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Add data drive" }).click();
    await page.getByRole("textbox", { name: "Data 1 capacity" }).fill("8");
    await page.getByRole("button", { name: "Calculate capacity" }).click();
    await page.getByRole("button", { name: "Copy summary" }).click();
    await expect(page.getByRole("status")).toContainText(/copied|failed/i);
    await expect(page.locator('[class*="copyStatus"]')).toContainText(/copied|failed/i);
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByRole("textbox", { name: "Parity 1 capacity" })).toHaveValue("");
    await expect(page.getByTestId("capacity-accounting")).toHaveCount(0);
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
