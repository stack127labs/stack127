import { expect, test } from "playwright/test";

test("an impossible filter combination shows the empty state", async ({ page }) => {
  await page.goto("/cli-apps?pricing=paid&source=open_source&q=zzzznothing");

  const empty = page.locator(".directory-empty");
  await expect(empty).toBeVisible();
  await expect(empty.locator("h2")).toContainText("No terminal apps match");
  await expect(empty.getByRole("link", { name: "show all apps" })).toHaveAttribute(
    "href",
    "/cli-apps",
  );
});

test("active filters render as removable chips with a clear-all link", async ({ page }) => {
  await page.goto("/cli-apps?pricing=free&type=tui");

  const chips = page.locator(".active-filter-row a");
  await expect(chips.filter({ hasText: "pricing: free" })).toHaveCount(1);
  await expect(chips.filter({ hasText: "type: TUI app" })).toHaveCount(1);
  await expect(page.locator(".active-filter-row .clear-filters")).toHaveAttribute(
    "href",
    "/cli-apps",
  );
});

test("the full records block exposes verification metadata", async ({ page }) => {
  await page.goto("/cli-apps");

  const records = page.locator(".directory-crawl-records");
  await records.locator("summary").click();

  const firstRecord = records.locator(".directory-crawl-record").first();
  await expect(firstRecord.locator("dt", { hasText: "verified" })).toBeVisible();
  await expect(firstRecord.locator("dt", { hasText: "source model" })).toBeVisible();
});
