import { expect, test } from "playwright/test";

const localPreview = process.env.STACK127_TEST_DATABASE_ENV === ".env.local";

test.describe("shortcut reference", () => {
  test.skip(!localPreview, "Shortcut routes stay unpublished outside the guarded local preview.");

  test("directory has a contained table and app links", async ({ page }) => {
    await page.goto("/keyboard-shortcuts");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Keyboard shortcuts");
    await expect(page.getByRole("link", { name: "Visual Studio Code", exact: true })).toBeVisible();
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  });

  test("the old directory slug is gone without a redirect", async ({ page }) => {
    const response = await page.goto("/shortcuts");
    expect(response?.status()).toBe(404);
    expect(page.url()).toContain("/shortcuts");
  });

  test("app page presents described shortcut groups", async ({ page }) => {
    await page.goto("/shortcuts/notion");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Notion");
    await expect(page.getByRole("heading", { level: 2, name: "Blocks" })).toBeVisible();
    await expect(page.getByText("Notion is quicker when a new block starts from the keyboard.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Make the useful keys stick" })).toBeVisible();
    await expect(page.getByText("34 shortcuts", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Windows, macOS, Linux", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Keys checked against")).toHaveCount(0);
  });

  test("generator exposes app selection and a live empty state", async ({ page }) => {
    await page.goto("/shortcuts-cheatsheet-generator");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Keyboard shortcuts cheat sheet generator");
    await expect(page.getByRole("checkbox", { name: "Brave Browser" })).toBeVisible();
    await expect(page.getByText("Choose an app to see the sheet.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Build a sheet for the work you actually do" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "What this sheet does not promise" })).toBeVisible();

    await page.goto("/shortcuts-cheatsheet-generator?apps=notion");
    await expect(page.getByRole("heading", { level: 2, name: "Notion keyboard shortcuts" })).toBeVisible();
    await expect(page.getByText("Notion · Windows, macOS, Linux", { exact: true })).toBeVisible();
  });
});
