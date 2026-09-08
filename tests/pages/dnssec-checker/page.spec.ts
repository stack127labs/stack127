import { expect, test } from "playwright/test";

test("DNSSEC Chain Checker is a published, server-readable DNS tool page", async ({ page }, testInfo) => {
  const response = await page.goto("/dnssec-checker");

  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-app-main] h1")).toHaveText(
    "DNSSEC Chain Checker: validate DS, DNSKEY, and RRSIG",
  );
  await expect(page.getByLabel("Domain or hostname")).toBeVisible();
  await expect(page.getByRole("button", { name: "Validate DNSSEC" })).toBeVisible();
  await expect(page.locator("article h2")).toHaveCount(5);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://stack127.com/dnssec-checker",
  );

  if (testInfo.project.name !== "mobile") {
    const navigation = page.getByRole("navigation", { name: "DNS tools" });
    await expect(navigation.getByRole("link")).toHaveCount(7);
    await expect(
      navigation.getByRole("link", { name: "DNSSEC Chain Checker", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }

  await expect(page.getByText(/health score/i)).toHaveCount(0);
  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("https://stack127.com/dnssec-checker");
});
