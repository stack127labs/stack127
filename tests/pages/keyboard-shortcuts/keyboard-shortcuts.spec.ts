import { expect, test } from "playwright/test";

test.describe("shortcut reference", () => {
  test("directory has a contained table and configured sheet links", async ({ page }) => {
    await page.goto("/keyboard-shortcuts");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Keyboard shortcuts");
    await expect(page.getByRole("link", { name: "Visual Studio Code", exact: true })).toHaveAttribute(
      "href",
      "/shortcuts-cheatsheet-generator?apps=vscode",
    );
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  });

  test("the removed shortcut routes return 404 without redirecting", async ({ page }) => {
    for (const path of ["/shortcuts", "/shortcuts/notion"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      expect(new URL(page.url()).pathname).toBe(path);
    }
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
