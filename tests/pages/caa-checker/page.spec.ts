import { expect, test } from "playwright/test";

test("CAA Policy Checker remains a published, server-readable DNS tool page", async ({ page }, testInfo) => {
  const response = await page.goto("/caa-checker");

  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-app-main] h1")).toHaveText("CAA Policy Checker: who can issue your certificates?");
  await expect(page.getByRole("textbox", { name: /Domain or hostname/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Check CAA policy" })).toBeVisible();
  await expect(page.locator("[data-app-main] article h2")).toHaveCount(5);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://stack127.com/caa-checker");
  await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);

  if (testInfo.project.name !== "mobile") {
    const navigation = page.getByRole("navigation", { name: "DNS tools" });
    await expect(navigation.getByRole("link")).toHaveCount(7);
    await expect(navigation.getByRole("link", { name: "CAA Policy Checker", exact: true })).toHaveAttribute("aria-current", "page");
  }

  await expect(page.getByText(/health score/i)).toHaveCount(0);
  await expect(page.getByText(/globally propagated/i)).toHaveCount(0);
});
