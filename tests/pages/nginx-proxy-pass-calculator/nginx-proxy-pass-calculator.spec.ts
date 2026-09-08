import { expect, test, type Page } from "playwright/test";


const route = "/nginx-proxy-pass-calculator";
const toolName = "proxy_pass calculator inputs and results";
const baseUrl = `http://127.0.0.1:${process.env.STACK127_TEST_PORT ?? "3334"}`;

async function calculate(page: Page) {
  await page.getByRole("button", { name: "Calculate upstream URL" }).click();
  return page.getByRole("region", { name: "Calculated upstream URL" });
}

async function choose(page: Page, groupName: string, optionName: string) {
  const group = page.getByRole("radiogroup", { name: groupName });
  const option = group.getByRole("radio", { name: optionName });
  await group.getByText(optionName, { exact: true }).click();
  await expect(option).toBeChecked();
}

async function toggleComparison(page: Page) {
  await page.getByText("Compare the final slash", { exact: true }).click();
}

test("keeps the clean initial state and produces one lead URL with exact evidence", async ({ page }) => {
  await page.goto(route);
  await expect(page).toHaveURL(`${baseUrl}${route}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("NGINX proxy_pass URI Calculator");
  await expect(page.getByRole("radio", { name: "Prefix" })).toBeChecked();
  await expect(page.getByLabel("Matched location")).toHaveValue("/api/");
  await expect(page.getByLabel("Request target")).toHaveValue("/api/users?id=42");
  await expect(page.getByLabel("proxy_pass URL")).toHaveValue("http://backend/");
  await expect(page.getByRole("radio", { name: "None" })).toBeChecked();
  await expect(page.getByLabel("Compare the final slash")).toBeChecked();
  await expect(page.locator('[data-result-kind="success"]')).toHaveCount(0);

  const result = await calculate(page);
  await expect(result).toBeFocused();
  await expect(result.getByText("Final upstream URL", { exact: true })).toBeVisible();
  await expect(result.getByText("http://backend/users?id=42", { exact: true })).toHaveCount(1);
  await expect(result.getByText("With proxy_pass", { exact: false })).toBeVisible();
  await expect(result.getByText("http://backend/api/users?id=42", { exact: true })).toBeVisible();
  await expect(result.getByText("Current", { exact: true })).toHaveCount(0);

  const trace = result.locator("dl");
  await expect(trace.locator("dt")).toHaveText([
    "Request path",
    "Matched location",
    "Proxy URI",
    "Path operation",
    "Retained suffix",
    "Final path",
    "Arguments",
  ]);
  await expect(result).toContainText("nginx-proxy-pass-uri-v1");
  await expect(result).toContainText("NGINX fixture 1.30.4");
});

test("preserves the lead for slash comparison changes and clears it for result-driving edits", async ({ page }) => {
  await page.goto(route);
  const result = await calculate(page);
  await toggleComparison(page);
  await expect(page.getByLabel("Compare the final slash")).not.toBeChecked();
  await expect(result).toBeVisible();
  await expect(result.getByText("http://backend/users?id=42", { exact: true })).toHaveCount(1);
  await expect(result.getByText("With proxy_pass", { exact: false })).toHaveCount(0);

  await toggleComparison(page);
  await expect(page.getByLabel("Compare the final slash")).toBeChecked();
  await expect(result.getByText("http://backend/api/users?id=42", { exact: true })).toBeVisible();
  await page.getByLabel("Request target").fill("/api/orders?id=42");
  await expect(page.locator('[data-result-kind="success"]')).toHaveCount(0);

  await page.getByLabel("Request target").press("Enter");
  await expect(page.getByText("http://backend/orders?id=42", { exact: true })).toHaveCount(1);
});

test("keeps every field error in the form and focuses the first invalid field", async ({ page }) => {
  await page.goto(route);
  const form = page.getByRole("region", { name: toolName }).locator("form");
  await page.getByLabel("Matched location").fill(" ");
  await page.getByLabel("Request target").fill("relative/path");
  await page.getByLabel("proxy_pass URL").fill("ftp://backend/");
  await calculate(page);

  await expect(page.getByLabel("Matched location")).toBeFocused();
  for (const label of ["Matched location", "Request target", "proxy_pass URL"]) {
    await expect(page.getByLabel(label)).toHaveAttribute("aria-invalid", "true");
  }
  await expect(form.getByRole("alert")).toContainText("Fix the marked inputs");
  await expect(page.locator('[data-result-kind]')).toHaveCount(0);
});

test("replaces output with a focused live-NGINX boundary", async ({ page }) => {
  const cases = [
    { set: async () => choose(page, "Location type", "Regex"), reason: "Regex locations do not define a literal prefix" },
    { set: async () => choose(page, "Location type", "Named"), reason: "Named locations need runtime location processing" },
    { set: async () => choose(page, "Rewrite before proxy_pass", "break"), reason: "rewrite break changes URI processing" },
    { set: async () => choose(page, "Rewrite before proxy_pass", "last"), reason: "rewrite last starts another location search" },
    { set: async () => choose(page, "Rewrite before proxy_pass", "Other"), reason: "This rewrite needs runtime processing" },
    { set: async () => page.getByLabel("proxy_pass URL").fill("http://$backend/"), reason: "Variables need runtime values" },
    { set: async () => page.getByLabel("proxy_pass URL").fill("http://backend/base?fixed=1"), reason: "Proxy target arguments need live NGINX processing" },
    { set: async () => page.getByLabel("Request target").fill("/api/a%2Fb"), reason: "NGINX normalization can change this path" },
  ];

  for (const item of cases) {
    await page.goto(route);
    await item.set();
    await page.getByLabel("Request target").press("Enter");
    const unknown = page.getByRole("region", { name: "Needs live NGINX" });
    await expect(unknown).toBeFocused();
    await expect(unknown).toContainText(item.reason);
    await expect(unknown).toContainText("Verify with nginx -T and upstream logs.");
    await expect(page.locator('[data-result-kind="success"]')).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Copy URL" })).toHaveCount(0);
  }
});

test("makes authority-only retention explicit", async ({ page }) => {
  await page.goto(route);
  await page.getByLabel("proxy_pass URL").fill("http://backend");
  const result = await calculate(page);
  await expect(result.getByText("http://backend/api/users?id=42", { exact: true })).toHaveCount(1);
  await expect(result.locator("dl")).toContainText("Proxy URIAbsent");
  await expect(result.locator("dl")).toContainText("Path operationOriginal request path retained");
  await expect(result.locator("dt", { hasText: "Retained suffix" })).toHaveCount(0);
});

test("reports copy outcomes, resets cleanly, and stores no input state", async ({ page }) => {
  await page.goto(route);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => undefined } });
  });
  const result = await calculate(page);
  await page.getByRole("button", { name: "Copy URL" }).click();
  await expect(page.getByRole("button", { name: "URL copied" })).toBeFocused();

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => Promise.reject(new Error("denied")) } });
    Object.defineProperty(document, "execCommand", { configurable: true, value: () => false });
  });
  await page.getByRole("button", { name: "URL copied" }).click();
  await expect(page.getByRole("button", { name: "Copy failed" })).toBeFocused();
  await expect(result.getByText("http://backend/users?id=42", { exact: true })).toHaveCount(1);

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Matched location")).toBeFocused();
  await expect(page.getByLabel("Matched location")).toHaveValue("/api/");
  await expect(page.locator('[data-result-kind]')).toHaveCount(0);
  await expect(page).toHaveURL(`${baseUrl}${route}`);
  expect(await page.evaluate(() => [...Object.values(localStorage), ...Object.values(sessionStorage)].some((value) => value.includes("/api/users")))).toBe(false);
});

for (const [width, height] of [[1280, 900], [760, 1000], [375, 900], [320, 900]] as const) {
  test(`contains long values and controls at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(route);
    await page.getByLabel("proxy_pass URL").fill("https://[2001:db8::1]:65535/a-long-upstream-prefix/");
    await page.getByLabel("Request target").fill("/api/a-very-long-request-segment-that-must-wrap?id=42&next=another-long-value");
    const result = await calculate(page);
    await expect(result).toBeVisible();

    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);

    for (const control of await page.getByRole("region", { name: toolName }).locator('button, input[type="text"], label:has(input[type="checkbox"]), label:has(input[type="radio"])').all()) {
      const box = await control.boundingBox();
      if (box && await control.isVisible()) expect(box.height).toBeGreaterThanOrEqual(44);
    }
    if (width <= 390) {
      const order = await result.locator(":scope > div > div").evaluateAll((nodes) => nodes.map((node) => node.textContent));
      expect(order[0]).toContain("Final upstream URL");
      expect(order[1]).toContain("With proxy_pass");
    }
  });
}

test("reflows at a 200 percent effective viewport", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.goto(route);
  const result = await calculate(page);
  await expect(result).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

for (const theme of ["dark", "light"] as const) {
  test(`renders a complete result in ${theme} theme`, async ({ page }) => {
    await page.addInitScript((selectedTheme) => localStorage.setItem("stack127-theme", selectedTheme), theme);
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(await calculate(page)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  });
}
