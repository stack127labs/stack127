import { expect, test, type Page, type Route } from "playwright/test";

function record(value = "93.184.216.34", type = "A", ownerName = "www.example.com", ttl = 300) {
  return { ownerName, resolverTtlSeconds: ttl, type, typeCode: type === "TXT" ? 16 : 1, value };
}

function step(overrides: Record<string, unknown> = {}) {
  return {
    additionalAddressRecords: [],
    aliasTarget: null,
    answerRecords: [record()],
    attempts: [],
    authoritative: true,
    delegatedZone: null,
    durationMs: 37,
    glueRecords: [],
    message: "The authoritative nameserver returned the requested record.",
    nameservers: [],
    outcome: "answer",
    questionName: "www.example.com",
    rawResponse: { AA: true, Answer: [{ data: "93.184.216.34" }], Status: 0 },
    requestedType: "A",
    responseCode: "NOERROR",
    sequence: 1,
    server: { address: "2001:503:ba3e::2:30", hostname: "a.root-servers.net" },
    stage: "authoritative",
    zone: "example.com",
    ...overrides,
  };
}

function result(overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-09-05T09:12:00.000Z",
    durationMs: 37,
    finalName: "www.example.com",
    finalRecords: [record()],
    outcome: "found",
    query: { normalizedName: "www.example.com", originalInput: "www.example.com", recordType: "A" },
    steps: [step()],
    warnings: [],
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function submit(page: Page, name = "www.example.com") {
  await page.getByLabel("Domain or hostname").fill(name);
  await page.getByRole("button", { name: "Trace DNS" }).click();
}

test("keeps the clean URL and exposes validation, loading, recovery, and stopped states", async ({ page }) => {
  let request = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/dns/trace", async (route) => {
    request += 1;
    if (request === 1) {
      await new Promise<void>((resolve) => { release = resolve; });
      return fulfill(route, result());
    }
    if (request === 2) {
      return fulfill(route, { error: { message: "The DNS trace took too long and was stopped safely." } }, 504);
    }
    return fulfill(route, result({
      finalRecords: [],
      outcome: "error",
      steps: [step({
        answerRecords: [],
        attempts: [{ durationMs: 1_250, error: "UDP timed out.", server: { address: "203.0.113.53", hostname: "ns1.example.com" } }],
        authoritative: false,
        message: "The delegated nameserver did not return a usable response.",
        outcome: "error",
        responseCode: null,
        server: null,
        stage: "tld",
        zone: "com",
      })],
      warnings: ["No delegated nameserver answered."],
    }));
  });

  await page.goto("/dns-trace");
  await expect(page).toHaveURL(/\/dns-trace$/);
  await expect(page.getByRole("radio")).toHaveCount(11);
  await expect(page.getByRole("radio", { name: "A", exact: true })).toBeChecked();

  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.getByText("Enter a domain or hostname.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Domain or hostname")).toBeFocused();

  await page.getByLabel("Domain or hostname").fill("www.example.com");
  await page.getByText("DNSKEY", { exact: true }).click();
  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.getByRole("button", { name: "Tracing DNS..." })).toBeDisabled();
  await expect(page.getByText("Tracing DNS...", { exact: true })).toHaveCount(2);
  await expect(page.locator("[data-dns-trace-result]")).toHaveCount(0);
  release?.();
  await expect(page.locator("[data-dns-trace-result]")).toBeVisible();

  await page.getByLabel("Domain or hostname").fill("failed.example.com");
  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.getByText("The DNS trace took too long and was stopped safely.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("failed.example.com");
  await expect(page.getByRole("radio", { name: "DNSKEY", exact: true })).toBeChecked();

  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.getByText("The trace stopped at .com nameserver because no delegated nameserver answered.", { exact: true })).toBeVisible();
  await expect(page.getByRole("table", { name: "Earlier server attempts from step 1" })).toContainText("UDP timed out.");
  await expect(page.getByRole("link", { name: "Check the nameserver delegation" })).toHaveAttribute(
    "href",
    "/nameserver-checker?name=www.example.com",
  );
  await expect(page).toHaveURL(/\/dns-trace$/);
});

test("expands and collapses referral evidence without moving focus", async ({ page }) => {
  const referral = step({
    answerRecords: [],
    authoritative: false,
    glueRecords: Array.from({ length: 5 }, (_, index) => record(`192.0.2.${index + 1}`, "A", `ns${index + 1}.example.com`, 172800)),
    message: "The root nameserver returned a referral.",
    nameservers: Array.from({ length: 13 }, (_, index) => `ns${index + 1}.example.com`),
    outcome: "referral",
    stage: "root",
    zone: ".",
  });
  await page.route("**/api/dns/trace", (route) => fulfill(route, result({ steps: [referral] })));
  await page.goto("/dns-trace");
  await submit(page);

  const reveal = page.getByRole("button", { name: "Show all 13 nameservers" });
  await expect(page.getByText("ns13.example.com", { exact: true })).toHaveCount(0);
  await reveal.focus();
  await reveal.press("Enter");
  await expect(page.getByRole("button", { name: "Show fewer nameservers" })).toBeFocused();
  await expect(page.getByText("ns13.example.com", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Show fewer nameservers" }).press("Enter");
  await expect(page.getByRole("button", { name: "Show all 13 nameservers" })).toBeFocused();
  await expect(page.getByText("ns13.example.com", { exact: true })).toHaveCount(0);
});

test("copies the readable trace only after the clipboard write succeeds", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as typeof window & { copiedTrace?: string }).copiedTrace = value;
        },
      },
    });
  });
  await page.route("**/api/dns/trace", (route) => fulfill(route, result()));
  await page.goto("/dns-trace");
  await submit(page);
  await page.getByRole("button", { name: "Copy trace" }).click();
  await expect(page.getByRole("button", { name: "Trace copied" })).toBeVisible();
  expect(await page.evaluate(() => (window as typeof window & { copiedTrace?: string }).copiedTrace)).toContain(
    "DNS trace for www.example.com (A)",
  );
});

test("reports copy failure without clearing the trace", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => { throw new Error("Clipboard denied"); } },
    });
    Object.defineProperty(Document.prototype, "execCommand", {
      configurable: true,
      value: () => false,
    });
  });
  await page.route("**/api/dns/trace", (route) => fulfill(route, result()));
  await page.goto("/dns-trace");
  await submit(page);
  await page.getByRole("button", { name: "Copy trace" }).click();
  await expect(page.getByRole("button", { name: "Copy failed" })).toBeVisible();
  await expect(page.locator("[data-dns-trace-result]")).toBeVisible();
  await expect(page.getByText("The trace reached an authoritative A answer for www.example.com at a.root-servers.net.", { exact: true })).toBeVisible();
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long expanded trace evidence at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 375 ? 820 : 950 });
      const longName = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}.com`;
      const nameservers = Array.from({ length: 13 }, (_, index) => `ns-${index}-${"n".repeat(56)}.${longName}`);
      const longStep = step({
        additionalAddressRecords: Array.from({ length: 5 }, (_, index) => record(`2001:0db8:${index.toString(16).padStart(4, "0")}:${"f".repeat(4)}:${"e".repeat(4)}:${"d".repeat(4)}:${"c".repeat(4)}:${"b".repeat(4)}`, "AAAA", nameservers[index])),
        answerRecords: [record(`"${"v".repeat(4094)}"`, "TXT", longName)],
        glueRecords: Array.from({ length: 5 }, (_, index) => record(`257 3 14 ${"K".repeat(2048 + index)}`, "DNSKEY", nameservers[index])),
        message: `The authoritative nameserver returned a long TXT record for ${longName}.`,
        nameservers,
        questionName: longName,
        rawResponse: { Answer: [{ data: "x".repeat(11_000), name: longName }], Status: 0 },
        requestedType: "TXT",
        server: { address: "2001:503:ba3e:0000:0000:0000:0002:0030", hostname: nameservers[0] },
        zone: longName,
      });
      const fixture = result({
        finalName: longName,
        finalRecords: longStep.answerRecords,
        query: { normalizedName: longName, originalInput: longName, recordType: "TXT" },
        steps: [longStep],
      });
      await page.route("**/api/dns/trace", (route) => fulfill(route, fixture));
      await page.goto("/dns-trace");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await page.getByLabel("Domain or hostname").fill(longName);
      await page.getByText("TXT", { exact: true }).click();
      await page.getByRole("button", { name: "Trace DNS" }).click();
      await page.getByRole("button", { name: "Show all 13 nameservers" }).click();
      await page.getByRole("button", { name: "Show all 5 glue addresses" }).click();
      await page.getByRole("button", { name: "Show all 5 nameserver addresses" }).click();
      await page.getByRole("button", { name: "Raw response from this step" }).click();

      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.client);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.getByRole("button", { name: "Copy trace" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Raw response from this step" })).toHaveAttribute("aria-expanded", "true");
    });
  }
}
