import { expect, test } from "playwright/test";

test("DNS tools hub shows only tools that are available", async ({ page }) => {
  await page.goto("/dns-tools");

  await expect(page.getByRole("heading", { name: "What are you trying to fix?" })).toBeVisible();
  for (const toolName of [
    "DNS Lookup",
    "DNS Trace Explorer",
    "DNS Change Checker",
    "Nameserver Delegation Checker",
    "DNSSEC Chain Checker",
    "SOA Consistency Checker",
    "CAA Policy Checker",
  ]) {
    await expect(page.locator(".dns-tool-card").getByText(toolName, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("I only need to see the current records.", { exact: true })).toBeVisible();
  await expect(page.getByText("A DNS change still looks old.", { exact: true })).toBeVisible();
  await expect(page.getByText("A certificate will not issue.", { exact: true })).toBeVisible();
  await expect(page.locator('[data-app-main] a[href="/dns-tools/dns-lookup"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Planned next" })).toHaveCount(0);
});
