import { expect, test } from "playwright/test";

test("DNS tools hub shows only tools that are available", async ({ page }) => {
  await page.goto("/dns-tools");

  const catalog = page.getByRole("region", { name: "Choose a DNS check" });
  await expect(catalog).toBeVisible();
  for (const toolName of [
    "DNS lookup",
    "DNS trace",
    "DNS change checker",
    "Nameserver checker",
    "DNSSEC checker",
    "SOA checker",
    "CAA checker",
  ]) {
    await expect(catalog.getByRole("heading", { name: toolName, exact: true })).toBeVisible();
  }
  await expect(catalog.getByRole("link")).toHaveCount(7);
  await expect(catalog.getByRole("link", { name: /DNS lookup/ })).toContainText(/records.*resolver/);
  await expect(catalog.getByRole("link", { name: /DNS change checker/ })).toContainText(/authoritative answer.*caches/);
  await expect(catalog.getByRole("link", { name: /CAA checker/ })).toContainText(/certificate authorities/);
  await expect(page.locator('[data-app-main] a[href="/dns-lookup"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Planned next" })).toHaveCount(0);
});
