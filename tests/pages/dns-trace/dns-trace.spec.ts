import { expect, test } from "playwright/test";

const fixture = {
  query: { originalInput: "www.example.com", normalizedName: "www.example.com", recordType: "A" },
  checkedAt: "2026-07-13T10:00:00.000Z",
  durationMs: 84,
  outcome: "found",
  finalName: "www.example.com",
  finalRecords: [{ ownerName: "www.example.com", type: "A", typeCode: 1, value: "93.184.216.34", resolverTtlSeconds: 300 }],
  warnings: [],
  steps: [
    {
      sequence: 1,
      stage: "root",
      zone: ".",
      server: { hostname: "a.root-servers.net", address: "198.41.0.4" },
      questionName: "www.example.com",
      requestedType: "A",
      responseCode: "NOERROR",
      authoritative: false,
      durationMs: 14,
      outcome: "referral",
      message: "The root nameserver pointed us to the nameservers responsible for .com.",
      delegatedZone: "com",
      nameservers: [
        "a.gtld-servers.net",
        "b.gtld-servers.net",
        "c.gtld-servers.net",
        "d.gtld-servers.net",
        "e.gtld-servers.net",
      ],
      glueRecords: [
        { ownerName: "a.gtld-servers.net", type: "A", typeCode: 1, value: "192.5.6.30", resolverTtlSeconds: 172800 },
        { ownerName: "b.gtld-servers.net", type: "A", typeCode: 1, value: "192.33.14.30", resolverTtlSeconds: 172800 },
        { ownerName: "c.gtld-servers.net", type: "A", typeCode: 1, value: "192.26.92.30", resolverTtlSeconds: 172800 },
        { ownerName: "d.gtld-servers.net", type: "A", typeCode: 1, value: "192.31.80.30", resolverTtlSeconds: 172800 },
        { ownerName: "e.gtld-servers.net", type: "A", typeCode: 1, value: "192.12.94.30", resolverTtlSeconds: 172800 },
      ],
      additionalAddressRecords: [],
      answerRecords: [],
      aliasTarget: null,
      attempts: [],
      rawResponse: { Status: 0, Authority: [{ name: "com", type: 2, data: "a.gtld-servers.net" }] },
    },
    {
      sequence: 2,
      stage: "tld",
      zone: "com",
      server: { hostname: "a.gtld-servers.net", address: "192.5.6.30" },
      questionName: "www.example.com",
      requestedType: "A",
      responseCode: "NOERROR",
      authoritative: false,
      durationMs: 20,
      outcome: "referral",
      message: "The .com nameserver pointed us to the nameservers responsible for example.com.",
      delegatedZone: "example.com",
      nameservers: ["ns1.example.com"],
      glueRecords: [{ ownerName: "ns1.example.com", type: "A", typeCode: 1, value: "9.9.9.9", resolverTtlSeconds: 172800 }],
      additionalAddressRecords: [],
      answerRecords: [],
      aliasTarget: null,
      attempts: [],
      rawResponse: { Status: 0, Authority: [{ name: "example.com", type: 2, data: "ns1.example.com" }] },
    },
    {
      sequence: 3,
      stage: "authoritative",
      zone: "example.com",
      server: { hostname: "ns1.example.com", address: "9.9.9.9" },
      questionName: "www.example.com",
      requestedType: "A",
      responseCode: "NOERROR",
      authoritative: true,
      durationMs: 50,
      outcome: "answer",
      message: "The authoritative nameserver returned the A record for www.example.com.",
      delegatedZone: null,
      nameservers: [],
      glueRecords: [],
      additionalAddressRecords: [],
      answerRecords: [{ ownerName: "www.example.com", type: "A", typeCode: 1, value: "93.184.216.34", resolverTtlSeconds: 300 }],
      aliasTarget: null,
      attempts: [],
      rawResponse: { Status: 0, AA: true, Answer: [{ name: "www.example.com", type: 1, TTL: 300, data: "93.184.216.34" }] },
    },
  ],
};

test("DNS Trace Explorer renders a genuine root-to-answer path in simple language", async ({ page }) => {
  await page.route("**/api/dns/trace", async (route) => {
    await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
  });

  await page.goto("/dns-trace");
  await expect(page.locator("[data-app-main] h1")).toHaveText(
    "DNS Trace Explorer: follow a query from root to answer",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://stack127.com/dns-trace",
  );
  await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("radiogroup", { name: "Record type" }).getByRole("radio")).toHaveCount(11);
  await expect(page.getByRole("radio", { name: "A", exact: true })).toBeChecked();
  await expect(page.getByLabel("Resolver")).toHaveCount(0);
  await expect(page.getByText("All", { exact: true })).toHaveCount(0);
  await expect(page.locator(".dns-reference-content > section > h2")).toHaveText([
    "How a DNS trace works",
    "What each step tells you",
    "Where a DNS trace can stop",
    "DNS trace and DNS lookup are different",
  ]);

  await page.getByLabel("Domain or hostname").fill("www.example.com");
  await page.getByRole("button", { name: "Trace DNS" }).click();

  await expect(page.getByRole("heading", { name: "www.example.com" })).toBeVisible();
  await expect(page.getByText("The trace took 3 steps and 84 ms. The last response was authoritative and returned NOERROR.")).toBeVisible();
  await expect(page.locator('[data-trace-step]')).toHaveCount(3);
  await expect(page.locator('[data-trace-step="root"]')).toContainText("root nameserver pointed us");
  await expect(page.locator('[data-trace-step="root"]')).toContainText("We asked a.root-servers.net at 198.41.0.4 for A on www.example.com. It replied in 14 ms.");
  await expect(page.locator('[data-trace-step="tld"]')).toContainText(".com nameserver pointed us");
  await expect(page.locator('[data-trace-step="authoritative"]')).toContainText("returned the A record");
  await expect(page.getByText("93.184.216.34", { exact: true })).toBeVisible();
  const rootStep = page.locator('[data-trace-step="root"]');
  await expect(rootStep.getByText("Glue from this referral", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy trace" })).toHaveCount(1);
  await expect(rootStep.getByRole("button", { name: "Show all 5 nameservers" })).toBeVisible();
  await expect(rootStep.getByText("e.gtld-servers.net", { exact: true })).toHaveCount(0);
  await rootStep.getByRole("button", { name: "Show all 5 nameservers" }).click();
  await expect(rootStep.getByText("e.gtld-servers.net", { exact: true })).toBeVisible();
  await expect(rootStep.getByRole("button", { name: "Show fewer nameservers" })).toBeVisible();
  await expect(page.locator('[data-trace-step] details')).toHaveCount(3);
  await expect(page.getByText(/health score/i)).toHaveCount(0);
  await expect(page.getByText(/globally propagated/i)).toHaveCount(0);
});

test("query-param trace states prefill the question and remain noindex", async ({ page }) => {
  await page.goto("/dns-trace?name=mail.example.com&type=MX");

  await expect(page.getByLabel("Domain or hostname")).toHaveValue("mail.example.com");
  await expect(page.getByRole("radio", { name: "MX", exact: true })).toBeChecked();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://stack127.com/dns-trace",
  );
});

test("a trace that stops at the delegation points to the nameserver checker", async ({ page }) => {
  await page.route("**/api/dns/trace", (route) => route.fulfill({
    contentType: "application/json",
    json: { ...fixture, outcome: "error", finalRecords: [], warnings: ["No delegated nameserver answered."], steps: fixture.steps.slice(0, 2) },
    status: 200,
  }));
  await page.goto("/dns-trace");
  await page.getByLabel("Domain or hostname").fill("www.example.com");
  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.getByRole("link", { name: "Check the nameserver delegation" })).toHaveAttribute("href", "/nameserver-checker?name=www.example.com");
});

test("DNS Trace API rejects All and a resolver override", async ({ request }) => {
  const all = await request.post("/api/dns/trace", { data: { name: "example.com", recordType: "all" } });
  expect(all.status()).toBe(400);

  const resolver = await request.post("/api/dns/trace", { data: { name: "example.com", recordType: "A", resolver: "cloudflare" } });
  expect(resolver.status()).toBe(400);
});
