import { expect, test, type Page } from "playwright/test";

const inputName = /Domain name or URL/;

async function convert(page: Page, value: string) {
  const input = page.getByRole("textbox", { name: inputName });
  await input.fill(value);
  await page.getByRole("button", { name: "Convert domain" }).click();
  const output = page.locator('output[aria-label="Converted forms"]');
  await expect(output).toBeVisible();
  return output;
}

test("keeps the clean URL and focuses each local input error", async ({ page }) => {
  const apiRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/")) apiRequests.push(request.url());
  });
  await page.goto("/punycode-converter");
  await expect(page).toHaveURL(/\/punycode-converter$/);
  const input = page.getByRole("textbox", { name: inputName });
  await expect(input).toHaveValue("");
  await expect(page.getByText("Conversion runs in this browser. Nothing is sent to stack127.", { exact: true })).toHaveCount(1);

  for (const [value, message] of [
    ["", "Enter a domain name or URL."],
    ["a@b.com", "Enter a domain name or URL, not an email address."],
    ["example.com/path", "Include the scheme, such as https://, when entering a full URL."],
    ["https:///", "That URL does not contain a readable hostname."],
  ] as const) {
    await input.fill(value);
    await page.getByRole("button", { name: "Convert domain" }).click();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue(value);
    await expect(page.getByText(message, { exact: true })).toHaveCount(1);
    await expect(page.locator('output[aria-label="Converted forms"]')).toHaveCount(0);
  }
  expect(apiRequests).toEqual([]);
});

test("collapses identical forms, verifies copy success, and clears edited results", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value: string) => { (window as unknown as { copiedValue?: string }).copiedValue = value; } },
    });
  });
  await page.goto("/punycode-converter");
  const output = await convert(page, "example.com");
  await expect(output.locator("code")).toHaveCount(1);
  await expect(output.locator("code")).toHaveText("example.com");
  await expect(output.getByText("Unicode and ASCII are identical.", { exact: true })).toHaveCount(1);
  await output.getByRole("button", { name: "Copy domain" }).click();
  await expect(output.getByRole("button", { name: "Domain copied" })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { copiedValue?: string }).copiedValue)).toBe("example.com");
  await expect(page.getByRole("table", { name: "Characters in non-ASCII labels" })).toHaveCount(0);

  await page.getByRole("textbox", { name: inputName }).fill("changed.example");
  await expect(page.locator('output[aria-label="Converted forms"]')).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Punycode conversion result" })).toHaveCount(0);
  await expect(page).toHaveURL(/\/punycode-converter$/);
});

test("shows both forms, label evidence, formal names, and honest copy failure", async ({ page }) => {
  await page.goto("/punycode-converter");
  const output = await convert(page, "münchen.de");
  await expect(output.locator("code")).toHaveText(["münchen.de", "xn--mnchen-3ya.de"]);
  await expect(output.getByRole("button", { name: "Copy Unicode" })).toHaveCount(1);
  await expect(output.getByRole("button", { name: "Copy ASCII" })).toHaveCount(1);

  const labels = page.getByRole("table", { name: "Hostname label breakdown" });
  await expect(labels.getByRole("row")).toHaveCount(3);
  await expect(labels).toContainText("14 of 63 bytes");
  await expect(labels).toContainText("Converted");
  await expect(labels).toContainText("Unchanged");
  const characters = page.getByRole("table", { name: "Characters in non-ASCII labels" });
  await expect(characters).toContainText("LATIN SMALL LETTER U WITH DIAERESIS");
  await expect(characters.getByRole("row")).toHaveCount(8);
  await expect(page.getByText("ASCII hostname length:", { exact: false })).toContainText("17 of 253 bytes");
  const result = page.getByRole("region", { name: "Punycode conversion result" });
  await expect(result.getByRole("link", { name: "registration lookup", exact: true })).toHaveAttribute("href", "/domain-lookup?name=xn--mnchen-3ya.de");
  await expect(result.getByRole("link", { name: "DNS lookup", exact: true })).toHaveAttribute("href", "/dns-lookup?name=xn--mnchen-3ya.de");

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } });
    Object.defineProperty(document, "execCommand", { configurable: true, value: () => false });
  });
  await output.getByRole("button", { name: "Copy ASCII" }).click();
  await expect(output.getByRole("button", { name: "Copy failed" })).toBeVisible();
  await expect(output.locator("code").nth(1)).toHaveText("xn--mnchen-3ya.de");
});

test("preserves every non-host URL part and links only the ASCII hostname", async ({ page }) => {
  await page.goto("/punycode-converter");
  const output = await convert(page, "https://user:pass@münchen.de:8443/a?q=one#part");
  await expect(output.locator("code")).toHaveText([
    "https://user:pass@münchen.de:8443/a?q=one#part",
    "https://user:pass@xn--mnchen-3ya.de:8443/a?q=one#part",
  ]);
  const result = page.getByRole("region", { name: "Punycode conversion result" });
  await expect(result.getByRole("link", { name: "registration lookup", exact: true })).toHaveAttribute("href", "/domain-lookup?name=xn--mnchen-3ya.de");
  await expect(result.getByRole("link", { name: "DNS lookup", exact: true })).toHaveAttribute("href", "/dns-lookup?name=xn--mnchen-3ya.de");
});

test("names mixed scripts and identifies the differing character without a verdict", async ({ page }) => {
  await page.goto("/punycode-converter");
  await convert(page, "pаypal.com");
  const assessment = page.getByText("The label pаypal mixes Cyrillic and Latin. Inspect its characters. This does not prove spoofing.", { exact: true });
  await expect(assessment).toHaveCount(1);
  const characters = page.getByRole("table", { name: "Characters in non-ASCII labels" });
  await expect(characters).toContainText("CYRILLIC SMALL LETTER A");
  await expect(characters).toContainText("Cyrillic. Differs from Latin in this label");
  await expect(page.getByText(/Looks safe|Malicious|Homograph detected/i)).toHaveCount(0);
});

test("keeps conversion findings once and omits downstream lookups", async ({ page }) => {
  await page.goto("/punycode-converter");
  await convert(page, "a..a");
  const findings = page.getByRole("region", { name: "Validation findings" });
  await expect(findings.getByText("One part of the name is empty, which usually means there are two dots in a row.", { exact: true })).toHaveCount(1);
  const result = page.getByRole("region", { name: "Punycode conversion result" });
  await expect(result.getByRole("link", { name: "registration lookup", exact: true })).toHaveCount(0);
  await expect(result.getByRole("link", { name: "DNS lookup", exact: true })).toHaveCount(0);

  await convert(page, `${"a".repeat(64)}.com`);
  await expect(page.getByText("One part of the name is longer than the 63 byte limit DNS allows.", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("table", { name: "Hostname label breakdown" })).toContainText("64 of 63 bytes");
});

test("shows an alert and no stale output after an unexpected local failure", async ({ page }) => {
  await page.goto("/punycode-converter");
  const input = page.getByRole("textbox", { name: inputName });
  await input.fill("münchen.de");
  await page.evaluate(() => {
    Object.defineProperty(String.prototype, "normalize", {
      configurable: true,
      value: () => { throw new Error("forced conversion failure"); },
    });
  });
  await page.getByRole("button", { name: "Convert domain" }).click();
  await expect(page.locator("[data-tool-workbench]").getByRole("alert")).toHaveText("The browser could not convert this name. Try again.");
  await expect(page.locator('output[aria-label="Converted forms"]')).toHaveCount(0);
  await expect(input).toHaveValue("münchen.de");
  await expect(page.getByRole("button", { name: "Convert domain" })).toBeEnabled();
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long converted evidence at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ height: 900, width });
      await page.goto("/punycode-converter");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      const value = "https://user:pass@pаypal.com:8443/a/very/long/path?continue=https%3A%2F%2Fexample.com%2Faccount#part";
      const output = await convert(page, value);
      if (width === 320) await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
      const sizes = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(sizes.scroll).toBe(sizes.client);
      await expect(output).toContainText(value);
      await expect(page.getByRole("table", { name: "Hostname label breakdown" })).toBeVisible();
      await expect(page.getByRole("table", { name: "Characters in non-ASCII labels" })).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    });
  }
}
