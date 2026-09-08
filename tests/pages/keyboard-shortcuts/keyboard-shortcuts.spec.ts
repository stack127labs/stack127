import { expect, test } from "playwright/test";

test.describe("shortcut reference", () => {
  test("directory has a contained table and canonical app links", async ({ page }) => {
    await page.goto("/keyboard-shortcuts");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Keyboard shortcuts");
    await expect(page.getByRole("link", { name: "Visual Studio Code", exact: true })).toHaveAttribute(
      "href",
      "/keyboard-shortcuts/vscode",
    );
    await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
  });

  test("app pages keep every shortcut under the canonical directory", async ({ page }) => {
    const response = await page.goto("/keyboard-shortcuts/notion");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Notion keyboard shortcuts");
    await expect(page.getByRole("table").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Make a printable Notion sheet" })).toHaveAttribute(
      "href",
      "/shortcuts-cheatsheet-generator?apps=notion",
    );
  });

  test("genuine former shortcut routes permanently redirect to their replacements", async ({ page, request }) => {
    for (const path of ["/shortcuts", "/shortcuts/notion", "/shortcuts/pi-coding-agent", "/shortcuts/cursor", "/shortcuts/zed"]) {
      const redirect = await request.get(path, { maxRedirects: 0 });
      expect(redirect.status()).toBe(308);
      const destination = path.replace("/shortcuts", "/keyboard-shortcuts");
      expect(new URL(redirect.headers().location, page.url() === "about:blank" ? "http://127.0.0.1:3334" : page.url()).pathname).toBe(destination);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(destination);
    }
    expect((await request.get("/shortcuts/not-a-real-former-app", { maxRedirects: 0 })).status()).toBe(404);
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
