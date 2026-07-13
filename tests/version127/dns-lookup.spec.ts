import { expect, test } from "playwright/test";

const fixture = {
  query: {
    originalInput: "www.example.com",
    normalizedName: "www.example.com",
    selection: "all",
    resolver: "cloudflare",
    dnssecRecordsRequested: false,
    checkingDisabled: false,
  },
  checkedAt: "2026-07-12T05:12:00.000Z",
  durationMs: 184,
  aliasChain: [
    { from: "www.example.com", to: "edge.example.net", resolverTtlSeconds: 300 },
  ],
  aliasObservations: [
    {
      requestedType: "A",
      aliasChain: [
        { from: "www.example.com", to: "edge.example.net", resolverTtlSeconds: 300 },
      ],
    },
  ],
  addressDetails: [
    { address: "192.0.2.1", asn: 64500, networkName: "Example Network", prefix: "192.0.2.0/24", countryCode: "US" },
  ],
  nameserverAddresses: [],
  queryResults: [
    {
      requestedName: "www.example.com",
      requestedType: "A",
      responseCode: "NOERROR",
      responseCodeNumber: 0,
      outcome: "found",
      flags: {
        authenticatedData: true,
        checkingDisabled: false,
        recursionDesired: true,
        recursionAvailable: true,
        truncated: null,
      },
      terminalRecords: [
        {
          ownerName: "edge.example.net",
          type: "A",
          typeCode: 1,
          value: "192.0.2.1",
          resolverTtlSeconds: 300,
        },
      ],
      aliasChain: [
        { from: "www.example.com", to: "edge.example.net", resolverTtlSeconds: 300 },
      ],
      authorityRecords: null,
      additionalRecords: [],
      comments: null,
      warnings: [],
      error: null,
      rawResponse: { Status: 0, AD: true },
    },
    {
      requestedName: "www.example.com",
      requestedType: "AAAA",
      responseCode: "NOERROR",
      responseCodeNumber: 0,
      outcome: "no_answer",
      flags: {
        authenticatedData: true,
        checkingDisabled: false,
        recursionDesired: true,
        recursionAvailable: true,
        truncated: null,
      },
      terminalRecords: [],
      aliasChain: [],
      authorityRecords: null,
      additionalRecords: [],
      comments: null,
      warnings: [],
      error: null,
      rawResponse: { Status: 0, Answer: [] },
    },
    {
      requestedName: "www.example.com",
      requestedType: "MX",
      responseCode: "NOERROR",
      responseCodeNumber: 0,
      outcome: "found",
      flags: {
        authenticatedData: true,
        checkingDisabled: false,
        recursionDesired: true,
        recursionAvailable: true,
        truncated: null,
      },
      terminalRecords: [
        {
          ownerName: "example.net",
          type: "MX",
          typeCode: 15,
          value: "10 mail.example.net.",
          resolverTtlSeconds: 600,
        },
      ],
      aliasChain: [],
      authorityRecords: null,
      additionalRecords: [],
      comments: null,
      warnings: [],
      error: null,
      rawResponse: { Status: 0, AD: true },
    },
  ],
  warnings: [],
};

test.beforeEach(async ({ page }) => {
  await page.route("https://www.example.com/favicon.ico", async (route) => {
    await route.fulfill({
      body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
      contentType: "image/png",
      status: 200,
    });
  });
});

test("DNS tools hub shows only tools that are available", async ({ page }) => {
  await page.goto("/dns-tools");

  await expect(page.getByRole("heading", { name: "Available now" })).toBeVisible();
  await expect(page.getByRole("link", { name: /DNS lookup/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Planned next" })).toHaveCount(0);
});

test("DNS Lookup renders corrected TTL, alias, owner, DNSSEC summary, and per-record raw responses", async ({ page }) => {
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
  });

  await page.goto("/dns-tools/dns-lookup");
  await expect(page.locator("[data-app-main] h1")).toHaveText("DNS lookup");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveCount(0);
  await expect(page.locator(".dns-page-header p")).toHaveText(
    "Enter a domain or hostname to see its DNS records, or choose PTR to find the hostname connected to an IP address. You can check a public resolver's cached answer or ask the domain's authoritative nameserver directly. Leave All selected if you are not sure which record you need.",
  );
  const recordTypePicker = page.getByRole("radiogroup", { name: "Record type" });
  await expect(recordTypePicker).toBeVisible();
  await expect(recordTypePicker.getByRole("radio")).toHaveCount(13);
  await expect(recordTypePicker.getByRole("radio", { name: "All" })).toBeChecked();
  await expect(recordTypePicker.locator("select")).toHaveCount(0);
  await expect(page.getByLabel("Resolver").locator("option")).toHaveText([
    "Cloudflare",
    "Google Public DNS",
    "Quad9",
    "OpenDNS",
    "AdGuard DNS",
    "Control D",
    "Yandex DNS",
    "Authoritative nameserver",
  ]);
  await expect(page.locator(".dns-examples")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "_dmarc.example.com", exact: true })).toHaveCount(0);
  await expect(page.locator(".dns-record-table tbody tr")).toHaveCount(12);
  await expect(page.locator(".dns-status-table tbody tr")).toHaveCount(5);
  await expect(page.locator(".dns-status-table")).toContainText("SERVFAIL");
  await expect(page.locator(".dns-status-table")).toContainText("NXDOMAIN");
  await expect(page.locator(".dns-page-header .dns-page-kicker")).toHaveCount(0);
  await expect(page.locator(".dns-reference-content > section > h2")).toHaveText([
    "How to check DNS records",
    "What DNS lookup results mean",
    "Which DNS record type should you check?",
    "When a DNS lookup helps",
    "When the answer looks wrong",
  ]);
  await expect(page.locator(".dns-reference-content")).toHaveCSS("border-top-width", "1px");
  await expect(page.locator(".dns-reference-content > section").first()).toHaveCSS("border-top-width", "0px");
  await expect(page.locator(".dns-reference-content > section").first()).toHaveCSS("border-bottom-width", "0px");
  await expect(page.locator(".dns-scope-note")).toHaveCSS("border-top-width", "0px");
  await expect(page.locator("#how-to-check ol")).toHaveCount(0);
  await expect(page.locator("#how-to-check")).toContainText("Enter the exact domain or hostname you want to check");
  await expect(page.locator("#how-to-check")).toContainText("compare it with the records in your DNS provider");
  await expect(page.locator(".dns-result-guide")).toHaveCount(0);
  await expect(page.locator("#read-results .dns-answer-path")).toBeVisible();
  await expect(page.locator("#read-results")).toContainText("Resolver TTL shows how much cache time");
  await expect(page.locator(".dns-use-case-table tbody tr")).toHaveCount(7);
  await expect(page.locator("#record-types")).toContainText("Not sure where to start? Leave All selected");
  await expect(page.locator("#use-cases")).toContainText("This tool is handy when something should be working or should have changed");
  await expect(page.locator("#status-meanings")).toContainText("No record does not always mean the whole domain is broken");
  await expect(page.locator(".dns-scope-note")).toContainText("We do not save your lookup history");

  await page.getByLabel("DNS name").fill("www.example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  await expect(page.locator(".dns-site-favicon")).toBeVisible();
  await expect(page.locator(".dns-site-favicon")).toHaveAttribute("src", "https://www.example.com/favicon.ico");
  await expect(page.locator(".dns-alias-summary")).toContainText("www.example.com points to edge.example.net");
  await expect(page.locator('[data-record-type="A"] .dns-record-owner')).toContainText("Records for edge.example.net");
  await expect(page.locator(".dns-record-group > .dns-record-group-heading h2")).toHaveText(["A", "AAAA", "MX"]);
  await expect(page.locator(".dns-answer-table")).toHaveCount(0);
  await expect(page.locator(".dns-record-item")).toHaveCount(2);
  await expect(page.locator(".dns-copy-icon")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Copy A record" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy MX record" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy Priority" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy Mail exchanger" })).toHaveCount(0);
  await expect(page.locator('[data-record-type="AAAA"]')).toContainText("No AAAA record returned.");
  await expect(page.locator('[data-record-type="AAAA"] .dns-inline-raw')).toBeVisible();
  await expect(page.locator(".dns-empty-results")).toHaveCount(0);
  await expect(page.locator(".dns-record-fields")).toContainText("Priority");
  await expect(page.locator(".dns-record-fields")).toContainText("mail.example.net");
  await expect(page.getByText("300 seconds, about 5 minutes remaining").first()).toBeVisible();
  await expect(page.getByLabel("About Resolver TTL").first()).toHaveAttribute("title", /remaining cache lifetime/i);
  await expect(page.locator('[data-record-type="A"]')).toContainText("Example Network");
  await expect(page.locator('[data-record-type="A"]')).toContainText("AS64500");
  await expect(page.getByText(/Cloudflare returned records for/)).toHaveCount(0);
  await expect(page.getByText(/Cloudflare authenticated this answer with DNSSEC/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy lookup link" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copy results" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Download records" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "DNS record results" })).toBeVisible();
  await expect(page.locator(".dns-result-nav-found")).toHaveText(["A", "MX"]);
  await expect(page.locator(".dns-result-nav-empty")).toHaveAttribute("href", "#dns-result-aaaa");
  await expect(page.locator(".dns-result-counts")).toHaveCount(0);
  await expect(page.locator(".dns-dnssec-note")).toHaveCount(0);

  await expect(page.locator(".dns-technical-details")).toHaveCount(0);
  await expect(page.locator(".dns-query-details")).toHaveCount(0);

  await page.locator('[data-record-type="A"] .dns-inline-raw > summary').click();
  await expect(page.locator('[data-record-type="A"] .dns-inline-raw')).toContainText('"Status": 0');
  await expect(page.locator(".dns-raw-results")).toHaveCount(0);
});

test("CAA keeps issuewild policies visible and long results have one Expand all control", async ({ page }) => {
  const caaRecords = [
    ...Array.from({ length: 6 }, (_, index) => ({ ownerName: "example.com", type: "CAA", typeCode: 257, value: `0 issue \"ca${index}.example\"`, resolverTtlSeconds: 60 })),
    ...Array.from({ length: 5 }, (_, index) => ({ ownerName: "example.com", type: "CAA", typeCode: 257, value: `0 issuewild \"wild${index}.example\"`, resolverTtlSeconds: 60 })),
  ];
  const longFixture = {
    ...fixture,
    queryResults: [{
      ...fixture.queryResults[0],
      requestedType: "CAA",
      terminalRecords: caaRecords,
    }, {
      ...fixture.queryResults[0],
      requestedType: "TXT",
      terminalRecords: Array.from({ length: 7 }, (_, index) => ({ ownerName: "example.com", type: "TXT", typeCode: 16, value: `\"value-${index}\"`, resolverTtlSeconds: 60 })),
    }],
  };
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: longFixture, status: 200 });
  });

  await page.goto("/dns-tools/dns-lookup");
  await page.getByLabel("DNS name").fill("example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  await expect(page.locator('[data-record-type="CAA"] .dns-record-item')).toHaveCount(11);
  await expect(page.locator('[data-record-type="CAA"]')).toContainText("issuewild");
  await expect(page.locator('[data-record-type="CAA"]')).toContainText("6 issue");
  await expect(page.locator('[data-record-type="CAA"] .dns-show-more')).toHaveCount(0);
  await expect(page.locator('[data-record-type="TXT"] .dns-record-item')).toHaveCount(5);
  await page.getByRole("button", { name: "Expand all records" }).click();
  await expect(page.locator('[data-record-type="TXT"] .dns-record-item')).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Collapse long record lists" })).toBeVisible();
});

test("DNS Lookup omits the favicon when the website has no usable icon", async ({ page }) => {
  const missingFaviconFixture = {
    ...fixture,
    query: {
      ...fixture.query,
      originalInput: "missing.example",
      normalizedName: "missing.example",
    },
  };
  await page.route("https://missing.example/favicon.ico", async (route) => {
    await route.fulfill({ status: 404 });
  });
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: missingFaviconFixture, status: 200 });
  });

  await page.goto("/dns-tools/dns-lookup");
  await page.getByLabel("DNS name").fill("missing.example");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  await expect(page.locator(".dns-site-favicon")).toHaveCount(0);
});

test("query-param lookup states remain noindex and canonicalize to the clean tool URL", async ({ page }) => {
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
  });
  await page.goto("/dns-tools/dns-lookup?name=www.example.com&type=all&resolver=cloudflare");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://version127.com/dns-tools/dns-lookup",
  );
});

test("SERVFAIL offers one prefilled path into DNS Trace Explorer", async ({ page }) => {
  const servfailFixture = {
    ...fixture,
    query: { ...fixture.query, selection: "A" },
    queryResults: [{
      ...fixture.queryResults[0],
      responseCode: "SERVFAIL",
      responseCodeNumber: 2,
      outcome: "dns_error",
      terminalRecords: [],
      rawResponse: { Status: 2 },
    }],
  };
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: servfailFixture, status: 200 });
  });
  await page.goto("/dns-tools/dns-lookup");
  await page.getByLabel("DNS name").fill("www.example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  const traceLink = page.getByRole("link", { name: "Trace this name" });
  await expect(traceLink).toHaveCount(1);
  await expect(traceLink).toHaveAttribute(
    "href",
    "/dns-tools/dns-trace?name=www.example.com&type=A",
  );
});

test("inconsistent alias observations are shown separately instead of collapsed", async ({ page }) => {
  const inconsistent = {
    ...fixture,
    aliasChain: [],
    aliasObservations: [
      { requestedType: "A", aliasChain: [{ from: "www.example.com", to: "a.example.net", resolverTtlSeconds: 30 }] },
      { requestedType: "AAAA", aliasChain: [{ from: "www.example.com", to: "b.example.net", resolverTtlSeconds: 30 }] },
    ],
    warnings: [{ code: "alias_chain_inconsistent", message: "Separate DNS answers reported different alias targets for the same owner name." }],
  };
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: inconsistent, status: 200 });
  });
  await page.goto("/dns-tools/dns-lookup");
  await page.getByLabel("DNS name").fill("www.example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  await expect(page.getByRole("heading", { name: "Alias observations differ" })).toBeVisible();
  await expect(page.getByText("A query", { exact: true })).toBeVisible();
  await expect(page.getByText("AAAA query", { exact: true })).toBeVisible();
  await expect(page.locator(".dns-alias-summary")).toHaveCount(0);
});

test("DNS API rejects ANY and client attempts to override DO or CD", async ({ request }) => {
  const anyResponse = await request.post("/api/dns/lookup", {
    data: { name: "example.com", selection: "ANY", resolver: "cloudflare" },
  });
  expect(anyResponse.status()).toBe(400);
  await expect(anyResponse.json()).resolves.toMatchObject({ error: { code: "invalid_selection" } });

  const flagResponse = await request.post("/api/dns/lookup", {
    data: { name: "example.com", selection: "A", resolver: "cloudflare", do: true },
  });
  expect(flagResponse.status()).toBe(400);
  await expect(flagResponse.json()).resolves.toMatchObject({ error: { code: "unsupported_option" } });
});
