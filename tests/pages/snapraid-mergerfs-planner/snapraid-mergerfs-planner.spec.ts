import { expect, test } from "playwright/test";

const route = "/snapraid-mergerfs-planner";
const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";

test.beforeEach(async ({ page }) => {
  test.skip(!localPreview, "The tool requires the guarded managed-development preview.");
  await page.goto(route);
});

test("generates a reviewable pair of files from the baseline inventory", async ({ page }) => {
  await page.getByRole("button", { name: "Check and generate" }).click();
  await expect(page.getByRole("heading", { name: "Review both files before touching /etc." })).toBeVisible();
  await expect(page.getByRole("region", { name: "Configuration checks" })).toBeVisible();
  await expect(page.locator("pre").nth(0)).toContainText("parity /mnt/parity1/snapraid.parity");
  await expect(page.locator("pre").nth(0)).toContainText("data d4 /mnt/disk4");
  await expect(page.locator("pre").nth(1)).toContainText("/mnt/disk1:/mnt/disk2:/mnt/disk3:/mnt/disk4");
  await expect(page.getByRole("heading", { name: "Review both files before touching /etc." })).toBeFocused();
});

test("rejects smaller parity and focuses the marked capacity", async ({ page }) => {
  const parityCapacity = page.locator("#parity-capacity-0");
  await parityCapacity.fill("7");
  await expect(parityCapacity).toHaveValue("7");
  await page.getByRole("button", { name: "Check and generate" }).click();
  await expect(parityCapacity).toHaveAttribute("aria-invalid", "true");
  await expect(parityCapacity).toBeFocused();
  await expect(parityCapacity).toHaveAttribute("aria-describedby", /parity-capacity-0-error/);
  await expect(page.locator("[role='alert'][aria-live='polite']")).toContainText("Parity is smaller than data");
  await expect(page.locator("pre")).toHaveCount(0);
});

test("collects content minimum errors without creating partial output", async ({ page }) => {
  await page.getByRole("button", { name: "Add parity disk" }).click();
  await page.getByRole("button", { name: "Check and generate" }).click();
  await expect(page.locator("[data-error-field='content'][role='alert']")).toContainText("Need 3 content files");
  await expect(page.locator("pre")).toHaveCount(0);
  await expect(page.getByLabel("Content file 1 path")).toBeFocused();
});

test("keeps inventory actions separate and clears a stale result on edit", async ({ page }) => {
  await page.getByRole("button", { name: "Check and generate" }).click();
  await expect(page.getByRole("heading", { name: "Review both files before touching /etc." })).toBeVisible();
  await page.getByLabel("Data disk 1 mount path").fill("/mnt/edited");
  await expect(page.getByRole("heading", { name: "Review both files before touching /etc." })).toHaveCount(0);
  await page.getByRole("button", { name: "Add data disk" }).click();
  await expect(page.getByLabel("Data disk 5 mount path")).toBeVisible();
  await page.getByRole("button", { name: "Remove data disk 5" }).click();
  await expect(page.getByLabel("Data disk 5 mount path")).toHaveCount(0);
});

test("keeps the minimum data, parity, and content rows available", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Remove data disk 1" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Remove parity disk 1" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Remove content file 1" })).toBeDisabled();

  await page.getByRole("button", { name: "Remove data disk 1" }).click();
  await page.getByRole("button", { name: "Remove data disk 1" }).click();
  await expect(page.getByRole("button", { name: "Remove data disk 1" })).toBeDisabled();
});

test("submits from the focused input and reset restores defaults", async ({ page }) => {
  await page.getByLabel("Mergerfs pool mount").press("Enter");
  await expect(page.getByRole("heading", { name: "Review both files before touching /etc." })).toBeVisible();
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Data disk 1 mount path")).toBeFocused();
  await expect(page.getByLabel("Data disk 1 mount path")).toHaveValue("/mnt/disk1");
  await expect(page.locator("pre")).toHaveCount(0);
  await expect(page).toHaveURL(/snapraid-mergerfs-planner$/);
});

test("reports clipboard success and keeps code selectable when permission fails", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => { (window as typeof window & { copied?: string }).copied = text; } } });
  });
  await page.goto(route);
  await page.getByRole("button", { name: "Check and generate" }).click();
  await page.getByRole("button", { name: "Copy snapraid.conf" }).click();
  await expect(page.getByText("snapraid.conf copied.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { copied?: string }).copied ?? "")).toContain("parity /mnt/parity1");

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } });
  });
  await page.getByRole("button", { name: "Copy fstab line" }).click();
  await expect(page.getByText("Copy failed. The code remains selectable above.", { exact: true })).toBeVisible();
});

test("has no page overflow for a populated result at narrow widths", async ({ page }) => {
  for (const width of [320, 375, 760, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await page.getByRole("button", { name: "Check and generate" }).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `page overflow at ${width}px`).toBeLessThanOrEqual(1);
    for (const button of await page.locator("section[aria-label='SnapRAID and mergerfs configuration planner'] button").all()) {
      expect((await button.boundingBox())?.height ?? 0, `small action at ${width}px`).toBeGreaterThanOrEqual(44);
    }
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await expect(page.getByRole("heading", { name: "Review both files before touching /etc." })).toBeVisible();
  }
});

test("does not serialize paths or use browser storage for the local calculation", async ({ page }) => {
  await page.waitForLoadState("networkidle");
  const unexpected: string[] = [];
  page.on("request", (request) => {
    if (["fetch", "xhr", "beacon"].includes(request.resourceType())) unexpected.push(`${request.method()} ${request.url()}`);
  });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.getByLabel("Data disk 1 mount path").fill("/mnt/private-example");
  await page.getByRole("button", { name: "Check and generate" }).click();
  expect(await page.evaluate((marker) => [...Object.values(localStorage), ...Object.values(sessionStorage)].filter((value) => value.includes(marker)), "/mnt/private-example")).toEqual([]);
  expect(unexpected).toEqual([]);
});

test("keeps the guide and tool identity available in the initial page", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /SnapRAID and mergerfs config planner/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Keep parity outside the pool" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Choose paths and verify boundaries" })).toBeVisible();
  await expect(page.getByRole("link", { name: "privacy notes" })).toHaveAttribute("href", "/privacy");
});
