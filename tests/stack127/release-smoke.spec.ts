import { expect, test } from "playwright/test";

test("release health reports the expected production revision", async ({ request }) => {
  const response = await request.get("/api/health?scope=deploy");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.ok).toBe(true);
  if (process.env.STACK127_EXPECTED_SHA) expect(body.build?.sha).toBe(process.env.STACK127_EXPECTED_SHA);
});

test("homepage renders one visible main heading", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("[data-app-main] h1")).toHaveCount(1);
  await expect(page.locator("[data-app-main] h1")).toBeVisible();
});

test("robots permits public crawling and names the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://stack127.com/sitemap.xml");
});

test("sitemap is a nonempty URL set", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("<urlset");
  expect(body).toContain("https://stack127.com");
});
