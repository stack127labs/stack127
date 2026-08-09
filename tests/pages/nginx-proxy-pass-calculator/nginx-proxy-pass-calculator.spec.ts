import { expect, test } from "playwright/test";

const localPreview = process.env.VERSION127_TEST_DATABASE_ENV === ".env.local";
test.skip(!localPreview, "The interactive route needs the guarded local preview.");

test("calculates, preserves the primary result when comparison changes, and clears stale output on edits", async ({ page }) => {
  await page.goto("/nginx-proxy-pass-calculator");
  const tool = page.getByRole("region", { name: "proxy_pass calculator inputs and results" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("NGINX proxy_pass URI Calculator");
  await expect(page.getByRole("heading", { name: "Final upstream URL" })).toHaveCount(0);

  await page.getByRole("button", { name: "Calculate upstream URL" }).click();
  const resultHeading = page.getByRole("heading", { name: "Final upstream URL" });
  await expect(resultHeading).toBeFocused();
  await expect(page.getByText("http://backend/users?id=42", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Slash comparison" })).toBeVisible();

  await page.getByLabel("Compare the final slash").uncheck();
  await expect(resultHeading).toBeVisible();
  await expect(tool.getByText("http://backend/users?id=42", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Slash comparison" })).toHaveCount(0);
  await page.getByLabel("Compare the final slash").check();
  await expect(page.getByRole("heading", { name: "Slash comparison" })).toBeVisible();

  await page.getByLabel("Request target").fill("/api/orders?id=42");
  await expect(resultHeading).toHaveCount(0);
});

test("associates simultaneous errors and focuses the first invalid control", async ({ page }) => {
  await page.goto("/nginx-proxy-pass-calculator");
  const tool = page.getByRole("region", { name: "proxy_pass calculator inputs and results" });
  await page.getByLabel("Matched location").fill(" ");
  await page.getByLabel("Request target").fill("relative/path");
  await page.getByLabel("proxy_pass URL").fill("ftp://backend/");
  await page.getByRole("button", { name: "Calculate upstream URL" }).click();

  await expect(page.getByLabel("Matched location")).toBeFocused();
  for (const label of ["Matched location", "Request target", "proxy_pass URL"]) {
    await expect(page.getByLabel(label)).toHaveAttribute("aria-invalid", "true");
  }
  await expect(page.getByRole("heading", { name: "Fix the marked input" })).toBeVisible();
  await expect(tool.getByRole("heading", { name: "Final upstream URL", exact: true })).toHaveCount(0);
});

test("returns unknown without a plausible URL and supports reset and Enter", async ({ page }) => {
  await page.goto("/nginx-proxy-pass-calculator");
  const tool = page.getByRole("region", { name: "proxy_pass calculator inputs and results" });
  await page.getByRole("radio", { name: "Regex" }).check();
  await page.getByLabel("Request target").press("Enter");
  await expect(page.getByRole("heading", { name: "Needs live NGINX", exact: true })).toBeFocused();
  await expect(page.getByText("Regex locations need live NGINX.")).toBeVisible();
  await expect(tool.getByRole("heading", { name: "Final upstream URL", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Matched location")).toBeFocused();
  await expect(page.getByRole("radio", { name: "Prefix" })).toBeChecked();
  await expect(page.getByLabel("Request target")).toHaveValue("/api/users?id=42");
  await expect(page.getByRole("heading", { name: "Needs live NGINX", exact: true })).toHaveCount(0);
});

test("does not serialize calculator inputs into browser or network state", async ({ page }) => {
  await page.goto("/nginx-proxy-pass-calculator");
  const laterRequests: string[] = [];
  page.on("request", (request) => laterRequests.push(request.url()));
  const marker = "/api/private-marker-7f31";
  await page.getByLabel("Request target").fill(marker);
  await page.getByRole("button", { name: "Calculate upstream URL" }).click();
  expect(page.url()).toBe("http://127.0.0.1:3334/nginx-proxy-pass-calculator");
  expect(laterRequests.some((url) => url.includes("private-marker-7f31"))).toBe(false);
  expect(await page.evaluate((needle) => {
    const values = [...Object.values(localStorage), ...Object.values(sessionStorage)];
    return values.some((value) => value.includes(needle));
  }, "private-marker-7f31")).toBe(false);
});

test("reports clipboard success and failure, then reloads to clean defaults", async ({ page }) => {
  await page.goto("/nginx-proxy-pass-calculator");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => undefined },
    });
  });
  await page.getByRole("button", { name: "Calculate upstream URL" }).click();
  await page.getByRole("button", { name: "Copy URL" }).click();
  await expect(page.getByText("URL copied.", { exact: true })).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => Promise.reject(new Error("denied")) },
    });
  });
  await page.getByRole("button", { name: "Copy URL" }).click();
  await expect(page.getByText("Copy failed. Select the URL.", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Matched location")).toHaveValue("/api/");
  await expect(page.getByRole("heading", { name: "Final upstream URL", exact: true })).toHaveCount(0);
});

test("keeps the supporting guide after the calculator and links primary NGINX rules", async ({ page }) => {
  await page.goto("/nginx-proxy-pass-calculator");
  const tool = page.getByRole("region", { name: "proxy_pass calculator inputs and results" });
  const guide = page.locator("article");
  await expect(page.getByRole("heading", { name: "Use the location NGINX actually matched" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Common static proxy_pass cases" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Cases that need live NGINX" })).toBeVisible();
  expect(await tool.evaluate((node) => Boolean(node.compareDocumentPosition(document.querySelector("article")!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await expect(guide.getByRole("link", { name: "official proxy_pass documentation" })).toHaveAttribute(
    "href",
    "https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass",
  );
  await expect(guide.getByRole("link", { name: "NGINX rewrite documentation" })).toHaveAttribute(
    "href",
    "https://nginx.org/en/docs/http/ngx_http_rewrite_module.html#rewrite",
  );
});

for (const [width, height] of [[1280, 800], [760, 1000], [375, 900], [320, 900]]) {
  test(`keeps a long IPv6 result usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/nginx-proxy-pass-calculator");
    await page.getByLabel("proxy_pass URL").fill("https://[2001:db8::1]:65535/a-long-upstream-prefix/");
    await page.getByLabel("Request target").fill("/api/a-very-long-request-segment-that-must-wrap?id=42&next=another-long-value");
    await page.getByRole("button", { name: "Calculate upstream URL" }).click();
    await expect(page.getByRole("heading", { name: "Final upstream URL" })).toBeVisible();

    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);

    const touchTargets = page.getByRole("region", { name: "proxy_pass calculator inputs and results" })
      .locator("button, input[type=text], label:has(input[type=radio]), label:has(input[type=checkbox])");
    for (const control of await touchTargets.all()) {
      const box = await control.boundingBox();
      if (box && await control.isVisible()) expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
}

for (const theme of ["dark", "light"] as const) {
  test(`renders a complete success in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => localStorage.setItem("version127-theme", selectedTheme), theme);
    await page.goto("/nginx-proxy-pass-calculator");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByRole("button", { name: "Calculate upstream URL" }).click();
    await expect(page.getByRole("heading", { name: "Final upstream URL" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}
