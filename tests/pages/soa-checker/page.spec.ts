import { expect, test } from "playwright/test";

test("SOA Consistency Checker is a published, server-readable DNS tool page", async ({ page }, testInfo) => {
  const response = await page.goto("/soa-checker");

  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-app-main] h1")).toHaveText(
    "SOA Consistency Checker: compare zone serials across nameservers",
  );
  await expect(page.getByLabel("Domain or hostname")).toBeVisible();
  await expect(page.getByRole("button", { name: "Compare SOA records" })).toBeVisible();
  await expect(page.locator("article h2")).toHaveCount(4);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://stack127.com/soa-checker",
  );

  if (testInfo.project.name !== "mobile") {
    const navigation = page.getByRole("navigation", { name: "DNS tools" });
    await expect(navigation.getByRole("link", { name: "SOA Consistency Checker", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }

  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("https://stack127.com/soa-checker");
});
