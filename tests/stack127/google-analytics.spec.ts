import { expect, test } from "playwright/test";

const measurementId = process.env.GOOGLE_ANALYTICS_ID;

test("Google Analytics waits for consent and sends a path-only page view", async ({ page }) => {
  test.skip(!measurementId, "GOOGLE_ANALYTICS_ID is required for the consent browser test.");

  const googleRequests: string[] = [];
  page.on("request", (request) => {
    if (/google(?:tagmanager|-analytics)\.com/u.test(request.url())) {
      googleRequests.push(request.url());
    }
  });
  await page.route(/google(?:tagmanager|-analytics)\.com/u, (route) => route.abort());
  await page.addInitScript(() => window.localStorage.removeItem("stack127.analytics-consent"));

  await page.goto("/privacy?name=private.example&state=saved-secret#choices");

  const consent = page.getByRole("region", { name: "Analytics consent" });
  await expect(consent).toBeVisible();
  await expect(page.locator('script[data-stack127-analytics="google"]')).toHaveCount(0);
  expect(googleRequests).toEqual([]);

  await consent.getByRole("button", { name: "No thanks" }).click();
  await expect(consent).toBeHidden();
  expect(googleRequests).toEqual([]);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("stack127.analytics-consent")))
    .toContain('"choice":"denied"');

  await page.getByRole("button", { name: "analytics settings" }).click();
  await consent.getByRole("button", { name: "Allow analytics" }).click();
  await expect.poll(() => googleRequests.some((url) => url.includes(`/gtag/js?id=${measurementId}`)))
    .toBe(true);

  const dataLayer = await page.evaluate(() => window.dataLayer ?? []);
  const serializedLayer = JSON.stringify(dataLayer);
  const defaultConsentIndex = dataLayer.findIndex(
    (entry) => entry[0] === "consent" && entry[1] === "default",
  );
  const configIndex = dataLayer.findIndex(
    (entry) => entry[0] === "config" && entry[1] === measurementId,
  );
  expect(defaultConsentIndex).toBeGreaterThanOrEqual(0);
  expect(defaultConsentIndex).toBeLessThan(configIndex);
  expect(serializedLayer).toContain('"event","page_view"');
  expect(serializedLayer).toContain('"ad_storage":"denied"');
  expect(serializedLayer).toContain('"send_page_view":false');
  expect(serializedLayer).toContain('"page_path":"/privacy"');
  expect(serializedLayer).not.toContain("private.example");
  expect(serializedLayer).not.toContain("saved-secret");

  await page.getByRole("navigation", { name: "Legal pages" })
    .getByRole("link", { name: "terms" })
    .click();
  await expect(page).toHaveURL(/\/terms$/u, { timeout: 20_000 });
  const navigatedLayer = JSON.stringify(await page.evaluate(() => window.dataLayer ?? []));
  expect(navigatedLayer).toContain('"page_path":"/terms"');
  expect(navigatedLayer).toContain('"page_referrer":"http://127.0.0.1:3334/privacy"');

  await page.evaluate(() => {
    document.cookie = "_ga=test-cookie; Path=/; SameSite=Lax";
  });
  await page.getByRole("button", { name: "analytics settings" }).click();
  await consent.getByRole("button", { name: "No thanks" }).click();

  await expect.poll(() => page.evaluate(() => document.cookie)).not.toContain("_ga=");
  expect(await page.evaluate((id) => {
    const target = window as unknown as Record<string, unknown>;
    return target[`ga-disable-${id}`];
  }, measurementId)).toBe(true);

  const requestCountBeforeReload = googleRequests.length;
  await page.reload();
  await expect(page.getByRole("region", { name: "Analytics consent" })).toBeHidden();
  await expect(page.locator('script[data-stack127-analytics="google"]')).toHaveCount(0);
  expect(googleRequests).toHaveLength(requestCountBeforeReload);
});
