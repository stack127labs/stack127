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
  await expect(page.locator("article h2")).toHaveText([
    "How a DNS trace works",
    "What each step tells you",
    "Where a DNS trace can stop",
    "DNS trace and DNS lookup are different",
  ]);

  await page.getByLabel("Domain or hostname").fill("www.example.com");
  await page.getByRole("button", { name: "Trace DNS" }).click();

  await expect(page.getByText("The trace reached an authoritative A answer for www.example.com at ns1.example.com.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "www.example.com" })).toHaveCount(0);
  await expect(page.getByText(/The trace took 3 steps/)).toHaveCount(0);
  await expect(page.locator('[data-trace-step]')).toHaveCount(3);
  await expect(page.locator('[data-trace-step="root"]')).toContainText("root nameserver pointed us");
  await expect(page.locator('[data-trace-step="root"]')).toContainText("Server");
  await expect(page.locator('[data-trace-step="root"]')).toContainText("a.root-servers.net");
  await expect(page.locator('[data-trace-step="root"]')).toContainText("Question");
  await expect(page.locator('[data-trace-step="root"]')).toContainText("www.example.com A");
  await expect(page.locator('[data-trace-step="root"]')).toContainText("NOERROR, not authoritative, 14 ms");
  await expect(page.locator('[data-trace-step="tld"]')).toContainText(".com nameserver pointed us");
  await expect(page.locator('[data-trace-step="authoritative"]')).toContainText("returned the A record");
  await expect(page.getByRole("table", { name: "Answer records from step 3" })).toContainText("93.184.216.34");
  const rootStep = page.locator('[data-trace-step="root"]');
  const referralNameservers = rootStep.getByRole("heading", { name: "Nameservers in the referral" }).locator("..");
  await expect(rootStep.getByText("Glue from this referral", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy trace" })).toHaveCount(1);
  await expect(rootStep.getByRole("button", { name: "Show all 5 nameservers" })).toBeVisible();
  await expect(rootStep.getByText("e.gtld-servers.net", { exact: true })).toHaveCount(0);
  const rootGlue = rootStep.getByRole("table", { name: "Glue records from step 1" });
  await expect(rootGlue.getByText("e.gtld-servers.net", { exact: true })).toHaveCount(0);
  await expect(rootStep.getByRole("button", { name: "Show all 5 glue addresses" })).toBeVisible();
  await rootStep.getByRole("button", { name: "Show all 5 glue addresses" }).click();
  await expect(rootGlue.getByText("e.gtld-servers.net", { exact: true })).toBeVisible();
  await expect(rootStep.getByRole("button", { name: "Show fewer glue addresses" })).toBeVisible();
  await rootStep.getByRole("button", { name: "Show all 5 nameservers" }).click();
  await expect(referralNameservers.getByText("e.gtld-servers.net", { exact: true })).toBeVisible();
  await expect(rootStep.getByRole("button", { name: "Show fewer nameservers" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Raw response from this step" })).toHaveCount(3);
  await expect(page.getByText("Checked", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Total duration", { exact: true })).toHaveCount(1);
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
  await expect(page).toHaveURL(/\/dns-trace\?name=mail\.example\.com&type=MX$/);
});

test("blank input focuses one required error and a selected type drives the request", async ({ page }) => {
  let requestBody: unknown;
  await page.route("**/api/dns/trace", async (route) => {
    requestBody = route.request().postDataJSON();
    await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
  });
  await page.goto("/dns-trace");
  const input = page.getByRole("textbox", { name: /Domain or hostname/ });
  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain or hostname.", { exact: true })).toHaveCount(1);

  await input.fill("mail.example.com");
  await page.getByText("MX", { exact: true }).click();
  await page.getByRole("button", { name: "Trace DNS" }).click();
  expect(requestBody).toEqual({ name: "mail.example.com", recordType: "MX" });
  await expect(page).toHaveURL(/\/dns-trace$/);
});

test("a later trace clears stale evidence while loading and after request failure", async ({ page }) => {
  let requestCount = 0;
  let releaseSecond!: () => void;
  const secondResponse = new Promise<void>((resolve) => { releaseSecond = resolve; });
  await page.route("**/api/dns/trace", async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
      return;
    }
    await secondResponse;
    await route.fulfill({
      contentType: "application/json",
      json: { error: { message: "The DNS trace took too long and was stopped safely." } },
      status: 504,
    });
  });

  await page.goto("/dns-trace");
  const input = page.getByRole("textbox", { name: /Domain or hostname/ });
  await input.fill("www.example.com");
  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.locator("[data-dns-trace-result]")).toBeVisible();

  await input.fill("failed.example");
  await page.getByText("MX", { exact: true }).click();
  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.locator("[data-dns-trace-result]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tracing DNS..." })).toBeDisabled();
  await expect(page.getByText("Tracing DNS...", { exact: true })).toHaveCount(2);

  releaseSecond();
  await expect(page.getByText("The DNS trace took too long and was stopped safely.", { exact: true })).toHaveCount(1);
  await expect(input).toHaveValue("failed.example");
  await expect(page.getByRole("radio", { name: "MX", exact: true })).toBeChecked();
  await expect(page.locator("[data-dns-trace-result]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Trace DNS" })).toBeEnabled();
});

test("alias, no-record, and NXDOMAIN traces use one truthful result sentence", async ({ page }) => {
  const responses = [
    {
      ...fixture,
      finalName: "edge.example.net",
      steps: fixture.steps.map((step, index) => index === fixture.steps.length - 1
        ? { ...step, questionName: "edge.example.net", answerRecords: [{ ...step.answerRecords[0], ownerName: "edge.example.net" }] }
        : step),
    },
    { ...fixture, query: { ...fixture.query, recordType: "MX" }, outcome: "no_answer", finalRecords: [], steps: fixture.steps.map((step, index) => index === fixture.steps.length - 1 ? { ...step, requestedType: "MX", outcome: "no_answer", answerRecords: [] } : step) },
    { ...fixture, query: { ...fixture.query, recordType: "MX" }, outcome: "nxdomain", finalName: "missing.example.com", finalRecords: [], steps: fixture.steps.map((step, index) => index === fixture.steps.length - 1 ? { ...step, requestedType: "MX", outcome: "nxdomain", answerRecords: [], responseCode: "NXDOMAIN" } : step) },
  ];
  await page.route("**/api/dns/trace", (route) => route.fulfill({ contentType: "application/json", json: responses.shift(), status: 200 }));
  await page.goto("/dns-trace");
  const input = page.getByRole("textbox", { name: /Domain or hostname/ });
  await input.fill("www.example.com");

  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.getByText("The trace followed www.example.com to edge.example.net and reached an authoritative A answer at ns1.example.com.", { exact: true })).toBeVisible();

  await page.getByText("MX", { exact: true }).click();
  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.getByText("The trace reached ns1.example.com, but it returned no MX record for www.example.com.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Check the nameserver delegation" })).toHaveCount(0);

  await page.getByRole("button", { name: "Trace DNS" }).click();
  await expect(page.getByText("The authoritative nameserver ns1.example.com says missing.example.com does not exist.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Check the nameserver delegation" })).toHaveCount(0);
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
  await expect(page.getByText("The trace stopped at .com nameserver because no delegated nameserver answered.", { exact: true })).toBeVisible();
  await expect(page.getByText("No delegated nameserver answered.", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Check the nameserver delegation" })).toHaveAttribute("href", "/nameserver-checker?name=www.example.com");
});

test("DNS Trace API rejects All and a resolver override", async ({ request }) => {
  const all = await request.post("/api/dns/trace", { data: { name: "example.com", recordType: "all" } });
  expect(all.status()).toBe(400);

  const resolver = await request.post("/api/dns/trace", { data: { name: "example.com", recordType: "A", resolver: "cloudflare" } });
  expect(resolver.status()).toBe(400);
});
