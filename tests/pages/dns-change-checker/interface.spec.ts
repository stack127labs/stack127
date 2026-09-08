import { expect, test, type Page, type Route } from "playwright/test";

type SourceOptions = {
  address?: string;
  error?: string | null;
  id: string;
  kind: "authoritative" | "resolver";
  label: string;
  rawResponse?: unknown;
  responseCode?: string;
  ttl?: number;
  type?: string;
  value?: string | null;
};

function source({
  address = "192.0.2.53",
  error = null,
  id,
  kind,
  label,
  rawResponse = { Status: 0 },
  responseCode = "NOERROR",
  ttl = 300,
  type = "A",
  value = "192.0.2.10",
}: SourceOptions) {
  return {
    id,
    label,
    kind,
    server: kind === "authoritative" ? { hostname: label, address } : null,
    responseCode: error ? null : responseCode,
    authoritative: kind === "authoritative" && !error ? true : null,
    authenticatedData: kind === "resolver" && !error ? false : null,
    records: error || value === null ? [] : [{ ownerName: "example.com", type, typeCode: type === "TXT" ? 16 : 1, value, resolverTtlSeconds: ttl }],
    error,
    rawResponse: error ? null : rawResponse,
  };
}

function result(overrides: Record<string, unknown> = {}) {
  return {
    query: { name: "example.com", recordType: "A", expectedAnswer: "192.0.2.10" },
    checkedAt: "2026-09-05T09:12:00.000Z",
    durationMs: 684,
    zone: "example.com",
    ipv6Connectivity: true,
    authoritative: [
      source({ id: "a1", label: "ns1.example.net", kind: "authoritative", address: "192.0.2.53" }),
      source({ id: "a2", label: "ns2.example.net", kind: "authoritative", address: "2001:db8::53" }),
    ],
    resolvers: [
      source({ id: "cloudflare", label: "Cloudflare", kind: "resolver", ttl: 241 }),
      source({ id: "google", label: "Google Public DNS", kind: "resolver", ttl: 188 }),
      source({ id: "quad9", label: "Quad9", kind: "resolver", ttl: 120, value: "192.0.2.20" }),
    ],
    summary: {
      authoritativeServersAgree: true,
      matchingAuthoritativeSources: 2,
      totalAuthoritativeSources: 2,
      agreeingResolvers: 2,
      totalResolvers: 3,
      expectedAnswerMatches: ["a1", "a2", "cloudflare", "google"],
    },
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function chooseRecordType(page: Page, value: string) {
  await page.getByRole("button", { name: "Record type" }).click();
  await page.getByRole("option", { name: value, exact: true }).click();
}

test("keeps the clean URL and focuses one required-field error", async ({ page }) => {
  await page.goto("/dns-change-checker");
  await expect(page).toHaveURL(/\/dns-change-checker$/);
  await expect(page.getByLabel("Domain or hostname")).toHaveAttribute("aria-required", "true");
  await expect(page.getByRole("button", { name: "Record type" })).toContainText("A");
  await expect(page.getByLabel("Expected answer (optional)")).toBeVisible();

  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.getByText("Enter a domain or hostname.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Domain or hostname")).toBeFocused();
});

test("leads with one comparison and groups repeated source evidence into tables", async ({ page }) => {
  await page.route("**/api/dns/change-checker", (route) => fulfill(route, result()));
  await page.goto("/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByLabel("Expected answer (optional)").fill("192.0.2.10");
  await page.getByRole("button", { name: "Check DNS change" }).click();

  const lead = page.locator("[data-dns-change-lead]");
  await expect(lead).toContainText("The usable authoritative nameserver replies agree on the current answer.");
  await expect(lead).toContainText("2 of 3 usable public resolver replies match it.");
  await expect(lead).toContainText("The expected value appears in 4 sources.");
  const expectedMentions = await page.locator("body").evaluate(
    (body) => body.textContent?.match(/The expected value appears in 4 sources\./g)?.length ?? 0,
  );
  expect(expectedMentions).toBe(1);

  const authoritative = page.getByRole("table", { name: "Authoritative sources for answer 1" });
  await expect(authoritative.getByRole("row")).toHaveCount(3);
  await expect(authoritative.getByRole("columnheader", { name: "Authoritative TTL" })).toBeVisible();
  await expect(authoritative.getByRole("rowheader", { name: "ns1.example.net" })).toBeVisible();
  await expect(authoritative.getByRole("cell", { name: "2001:db8::53" })).toBeVisible();

  const resolver = page.getByRole("table", { name: "Public resolver sources for answer 1" });
  await expect(resolver.getByRole("columnheader", { name: "Resolver TTL" })).toBeVisible();
  await expect(resolver.getByRole("cell", { name: "Matches reference" })).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Raw response from Cloudflare" })).toBeVisible();
  await expect(page.locator("img[src*='/favicon.ico']")).toHaveCount(0);
  await expect(page.getByText(/health score|globally propagated/i)).toHaveCount(0);
});

test("marks a retained result as previous during loading and after failure", async ({ page }) => {
  let request = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/dns/change-checker", async (route) => {
    request += 1;
    if (request === 1) return fulfill(route, result());
    await new Promise<void>((resolve) => { release = resolve; });
    return fulfill(route, { error: { message: "The DNS check took too long and was stopped safely." } }, 504);
  });
  await page.goto("/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.locator("[data-dns-change-results]")).toBeVisible();

  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.getByRole("button", { name: "Checking DNS..." })).toBeDisabled();
  await expect(page.getByText("Previous result. A new check is running.", { exact: true })).toBeVisible();
  release?.();
  await expect(page.getByText("The DNS check took too long and was stopped safely.", { exact: true })).toBeVisible();
  await expect(page.getByText("Previous result. The latest check failed.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("example.com");
  await expect(page.getByRole("button", { name: "Check DNS change" })).toBeEnabled();
});

test("marks a result as previous after any result-driving edit until replacement", async ({ page }) => {
  await page.route("**/api/dns/change-checker", (route) => fulfill(route, result()));
  await page.goto("/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.getByText("Previous result. Inputs changed since this check.", { exact: true })).toHaveCount(0);

  await page.getByLabel("Expected answer (optional)").fill("192.0.2.20");
  await expect(page.getByText("Previous result. Inputs changed since this check.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Record type" }).click();
  await page.getByRole("option", { name: "AAAA", exact: true }).click();
  await expect(page.getByText("Previous result. Inputs changed since this check.", { exact: true })).toBeVisible();

  await page.getByLabel("Domain or hostname").fill(" ");
  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.getByText("Enter a domain or hostname.", { exact: true })).toBeVisible();
  await expect(page.getByText("Previous result. Inputs changed since this check.", { exact: true })).toBeVisible();

  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.getByText("Previous result. Inputs changed since this check.", { exact: true })).toHaveCount(0);
});

test("keeps unavailable replies out of agreement and labels TTL roles", async ({ page }) => {
  const partial = result({
    query: { name: "example.com", recordType: "A", expectedAnswer: null },
    ipv6Connectivity: false,
    authoritative: [
      source({ id: "a1", label: "ns1.example.net", kind: "authoritative" }),
      source({ id: "a2", label: "ns2.example.net", kind: "authoritative", error: "The nameserver did not answer.", value: null }),
    ],
    resolvers: [
      source({ id: "cloudflare", label: "Cloudflare", kind: "resolver", ttl: 241 }),
      source({ id: "quad9", label: "Quad9", kind: "resolver", error: "The resolver did not answer.", value: null }),
    ],
    summary: { authoritativeServersAgree: true, matchingAuthoritativeSources: 1, totalAuthoritativeSources: 1, agreeingResolvers: 1, totalResolvers: 2, expectedAnswerMatches: null },
  });
  await page.route("**/api/dns/change-checker", (route) => fulfill(route, partial));
  await page.goto("/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check DNS change" }).click();

  await expect(page.locator("[data-dns-change-lead]")).toContainText("One authoritative nameserver returned a usable answer. 1 other authoritative nameserver address did not return a usable reply.");
  await expect(page.locator("[data-dns-change-lead]")).toContainText("The one usable public resolver reply matches it. 1 other resolver did not return a usable reply.");
  await expect(page.getByText("IPv6 authoritative checks were skipped because this checker does not have IPv6 connectivity.", { exact: true })).toBeVisible();
  await expect(page.getByRole("cell", { name: "No usable reply" })).toHaveCount(2);
  await expect(page.getByRole("table", { name: "Authoritative sources for answer 1" }).getByRole("columnheader", { name: "Authoritative TTL" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Public resolver sources for answer 1" }).getByRole("columnheader", { name: "Resolver TTL" })).toBeVisible();
  await expect(page.getByText("Different answer", { exact: true })).toHaveCount(0);
});

test("states an empty answer before the comparison detail", async ({ page }) => {
  const empty = result({
    query: { name: "example.com", recordType: "AAAA", expectedAnswer: null },
    authoritative: [source({ id: "a1", label: "ns1.example.net", kind: "authoritative", value: null })],
    resolvers: [source({ id: "cloudflare", label: "Cloudflare", kind: "resolver", value: null })],
    summary: { authoritativeServersAgree: true, matchingAuthoritativeSources: 1, totalAuthoritativeSources: 1, agreeingResolvers: 1, totalResolvers: 1, expectedAnswerMatches: null },
  });
  await page.route("**/api/dns/change-checker", (route) => fulfill(route, empty));
  await page.goto("/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await chooseRecordType(page, "AAAA");
  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.locator("[data-dns-change-lead]")).toHaveText(/No AAAA record was returned by the usable sources checked\./);
  await expect(page.getByText("No AAAA record returned.", { exact: true })).toHaveCount(2);
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long expanded evidence at ${width}px in ${theme} mode`, async ({ page }) => {
    await page.setViewportSize({ width, height: width <= 375 ? 780 : 900 });
    const longValue = `"${"v".repeat(4094)}"`;
    const longResult = result({
      query: { name: "a-very-long-hostname-for-a-dns-change-check.example.com", recordType: "TXT", expectedAnswer: null },
      authoritative: [source({ id: "a1", label: "a-very-long-authoritative-nameserver-name.example.net", kind: "authoritative", type: "TXT", value: longValue, rawResponse: { Status: 0, Answer: [{ data: "x".repeat(11_000) }] } })],
      resolvers: [source({ id: "google", label: "Google Public DNS with a long source label", kind: "resolver", type: "TXT", ttl: 86_400, value: longValue, rawResponse: { Status: 0, Answer: [{ data: "x".repeat(11_000) }] } })],
      summary: { authoritativeServersAgree: true, matchingAuthoritativeSources: 1, totalAuthoritativeSources: 1, agreeingResolvers: 1, totalResolvers: 1, expectedAnswerMatches: null },
    });
    await page.route("**/api/dns/change-checker", (route) => fulfill(route, longResult));
    await page.goto("/dns-change-checker");
    if (theme === "light") {
      await page.getByRole("button", { name: "Switch to light mode" }).click();
    }
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await page.getByLabel("Domain or hostname").fill(longResult.query.name);
    await chooseRecordType(page, "TXT");
    await page.getByRole("button", { name: "Check DNS change" }).click();
    await page.getByRole("button", { name: "Raw response from a-very-long-authoritative-nameserver-name.example.net" }).click();

    const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client);
    const raw = page.locator("[data-dns-change-raw]").first();
    await expect(raw).toBeVisible();
    const rawWidths = await raw.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
    expect(rawWidths.scroll).toBeGreaterThanOrEqual(rawWidths.client);
    });
  }
}
