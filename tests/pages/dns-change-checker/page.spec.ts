import { expect, test } from "playwright/test";

test("DNS Change Checker is a published, server-readable DNS tool page", async ({ page }, testInfo) => {
  const response = await page.goto("/dns-change-checker");

  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-app-main] h1")).toHaveText(
    "DNS Change Checker: has your change propagated?",
  );
  await expect(page.getByLabel("Domain or hostname")).toBeVisible();
  await expect(page.getByRole("button", { name: "Check DNS change" })).toBeVisible();
  await expect(page.locator("article h2")).toHaveCount(4);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://stack127.com/dns-change-checker",
  );

  if (testInfo.project.name !== "mobile") {
    const navigation = page.getByRole("navigation", { name: "DNS tools" });
    await expect(navigation.getByRole("link")).toHaveCount(7);
    await expect(
      navigation.getByRole("link", { name: "DNS Change Checker", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }

  await expect(page.getByText(/health score/i)).toHaveCount(0);
  await expect(page.getByText(/globally propagated/i)).toHaveCount(0);

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("https://stack127.com/dns-change-checker");
});
