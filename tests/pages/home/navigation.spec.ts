import { expect, test } from "playwright/test";

test("home lists collections and references with a metric on every card", async ({ page }, testInfo) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-app-main] h1")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/stack127\.com\/?$/);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);
  await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
  const cards = page.locator(".home-page-card");
  await expect(cards.first()).toBeVisible();
  const links = await cards.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
  for (const slug of ["cli-apps", "self-host-apps", "dns-tools", "domain-tools", "storage-tools", "keyboard-shortcuts", "software-licenses-for-self-hosting", "epp-status-codes", "tld-directory", "zigbee-devices", "zigbee-coordinators", "z-wave-devices", "nut-compatible-ups", "local-security-cameras", "matter-devices"]) {
    expect(links).toContain(`/${slug}`);
  }
  for (const slug of ["dockerignore-tester", "home-assistant-energy-entity-checker", "nginx-proxy-pass-calculator", "nfs-firewall-rules", "dns-lookup"]) {
    await expect(page.locator(`[data-app-main] a[href="/${slug}"], [data-app-sidebar] a[href="/${slug}"]`)).toHaveCount(0);
  }
  for (const card of await cards.all()) {
    await expect(card.locator("dl")).toHaveCount(1);
    await expect(card.locator("dd").first()).toHaveText(/[\d,]+/);
  }
  for (const theme of ["dark", "light"]) {
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
    for (const width of [1600, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      if (width <= 960) await expect(page.locator("[data-app-sidebar]")).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-home.png`), fullPage: true, animations: "disabled" });
      await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}-viewport.png`), animations: "disabled" });
    }
  }
});
