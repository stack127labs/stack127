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

test("DS and DNSKEY lookup results point to the full DNSSEC checker", async ({ page }) => {
  const dnssecFixture = {
    ...fixture,
    query: { ...fixture.query, selection: "DNSKEY" },
    queryResults: [{
      ...fixture.queryResults[0],
      requestedType: "DNSKEY",
      terminalRecords: [{ ownerName: "example.com", type: "DNSKEY", typeCode: 48, value: "257 3 13 AAAA", resolverTtlSeconds: 300 }],
    }],
  };
  await page.route("**/api/dns/lookup", (route) => route.fulfill({ contentType: "application/json", json: dnssecFixture, status: 200 }));
  await page.goto("/dns-lookup");
  await page.getByLabel("DNS name").fill("example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();
  await expect(page.getByRole("link", { name: "Check the full DNSSEC chain" })).toHaveAttribute("href", "/dnssec-checker?name=www.example.com&type=A");
});

test("DNS Lookup renders corrected TTL, alias, owner, DNSSEC summary, and per-record raw responses", async ({ page }) => {
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
  });

  await page.goto("/dns-lookup");
  await expect(page.locator("[data-app-main] h1")).toHaveText(
    "DNS lookup for any domain's records",
  );
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveCount(0);
  await expect(page.locator("[data-app-main] main header p").first()).not.toBeEmpty();
  const recordTypePicker = page.getByRole("radiogroup", { name: "Record type" });
  await expect(recordTypePicker).toBeVisible();
  await expect(recordTypePicker.getByRole("radio")).toHaveCount(8);
  await expect(recordTypePicker.getByRole("radio", { name: "All" })).toBeChecked();
  await page.locator('button[data-tool-label="Resolver"]').click();
  await expect(page.getByRole("listbox").getByRole("option")).toHaveText([
    "Cloudflare",
    "Google Public DNS",
    "Quad9",
    "OpenDNS",
    "AdGuard DNS",
    "Control D",
    "Yandex DNS",
    "Authoritative nameserver",
  ]);
  await page.keyboard.press("Escape");
  await expect(page.locator(".dns-examples")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "_dmarc.example.com", exact: true })).toHaveCount(0);
  const supportingContent = page.locator(".dns-lookup-main article");
  await expect(supportingContent).not.toBeEmpty();
  await expect(page.locator(".dns-page-header .dns-page-kicker")).toHaveCount(0);
  await expect(page.locator(".dns-result-guide")).toHaveCount(0);

  await page.getByLabel("DNS name").fill("www.example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

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
  await expect(page.locator('section[data-record-type="A"]')).toContainText("Example Network");
  await expect(page.locator('section[data-record-type="A"]')).toContainText("AS64500");
  await expect(page.getByText(/Cloudflare returned records for/)).toHaveCount(0);
  const dnssecStatus = page.locator(".dns-dnssec-status");
  await expect(dnssecStatus).toContainText("DNSSEC authentication");
  await expect(dnssecStatus).toContainText("Authenticated");
  await expect(page.locator(".dns-dnssec-summary")).toHaveCount(0);
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

test("DNS supporting content is server-rendered and its reference tables fit the reading column", async ({ page }) => {
  const response = await page.goto("/dns-lookup");
  const html = await response!.text();
  const article = page.locator(".dns-lookup-main article");
  const headings = await article.locator("h2").allTextContents();
  expect(headings.length).toBeGreaterThan(0);
  for (const heading of headings) expect(html).toContain(heading);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://stack127.com/dns-lookup");
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/);

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["dark", "light"]) {
      if (await page.locator("html").getAttribute("data-theme") !== theme) {
        await page.getByRole("button", { name: `Switch to ${theme} mode` }).click();
      }
      const tables = article.getByRole("table");
      expect(await tables.count()).toBeGreaterThan(0);
      for (const table of await tables.all()) {
        const bounds = await table.evaluate((element) => ({
          width: element.getBoundingClientRect().width,
          region: element.parentElement!.clientWidth,
          scroll: element.parentElement!.scrollWidth,
        }));
        expect(bounds.width).toBeLessThanOrEqual(bounds.region + 1);
        expect(bounds.scroll).toBe(bounds.region);
        await expect(table.locator("..")).toHaveAttribute("tabindex", "0");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    }
  }
});

test("the lookup uses the custom resolver picker and keeps specialized record types out of the main row", async ({ page }) => {
  await page.goto("/dns-lookup");

  expect(await page.locator(".dns-lookup-form select").evaluateAll((selects) => selects.every((select) => select.parentElement?.parentElement?.style.clipPath === "inset(50%)"))).toBe(true);
  const picker = page.getByRole("radiogroup", { name: "Record type" });
  await expect(picker.getByRole("radio", { name: "CAA", exact: true })).not.toBeVisible();
  await picker.locator("summary").click();
  await expect(picker.getByRole("radio", { name: "CAA", exact: true })).toBeVisible();

  await page.locator('button[data-tool-label="Resolver"]').click();
  await page.getByRole("option", { name: "Quad9" }).click();
  await expect(page.locator('button[data-tool-label="Resolver"]')).toContainText("Quad9");
  await expect(page.getByText("Uses Cloudflare's public recursive resolver.")).toHaveCount(0);
});

test("the resolver row aligns on desktop and switches as one unit on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/dns-lookup");
  let resolver = await page.locator('button[data-tool-label="Resolver"]').boundingBox();
  let submit = await page.getByRole("button", { name: "Look up DNS" }).boundingBox();
  expect(resolver).not.toBeNull();
  expect(submit).not.toBeNull();
  expect(Math.abs(resolver!.y - submit!.y)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  resolver = await page.locator('button[data-tool-label="Resolver"]').boundingBox();
  submit = await page.getByRole("button", { name: "Look up DNS" }).boundingBox();
  expect(submit!.y).toBeGreaterThan(resolver!.y + resolver!.height);
  expect(Math.abs(submit!.width - resolver!.width)).toBeLessThanOrEqual(1);
});

test("nameserver enrichment uses a table for repeated address fields", async ({ page }) => {
  const nsFixture = {
    ...fixture,
    query: { ...fixture.query, selection: "NS" },
    nameserverAddresses: [{ nameserver: "jill.ns.cloudflare.com", addresses: ["172.64.32.122", "2606:4700:50::a29f:207a"] }],
    addressDetails: [
      { address: "172.64.32.122", asn: 13335, networkName: "CLOUDFLARENET - Cloudflare, Inc.", prefix: "172.64.32.0/24", countryCode: "US" },
      { address: "2606:4700:50::a29f:207a", asn: 13335, networkName: "CLOUDFLARENET - Cloudflare, Inc.", prefix: "2606:4700:50::/44", countryCode: "US" },
    ],
    queryResults: [{
      ...fixture.queryResults[0],
      requestedType: "NS",
      flags: { ...fixture.queryResults[0].flags, authenticatedData: false },
      terminalRecords: [{ ownerName: "example.com", type: "NS", typeCode: 2, value: "jill.ns.cloudflare.com.", resolverTtlSeconds: 86400 }],
    }],
  };
  await page.route("**/api/dns/lookup", (route) => route.fulfill({ contentType: "application/json", json: nsFixture, status: 200 }));
  await page.goto("/dns-lookup");
  await page.getByLabel("DNS name").fill("example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  const table = page.getByRole("table", { name: "Addresses for jill.ns.cloudflare.com" });
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveText(["Address", "Network", "Provider", "Country", "ASN"]);
  await expect(table.locator("tbody tr")).toHaveCount(2);
  await expect(table).toContainText("AS13335");
  await expect(page.locator(".dns-dnssec-status")).toContainText("Not authenticated");

  const record = page.locator('[data-record-type="NS"] .dns-record-item');
  const tableViewport = table.locator("..");
  const ttl = record.locator(".dns-record-meta");
  const [recordBox, tableBox, ttlBox] = await Promise.all([
    record.boundingBox(),
    tableViewport.boundingBox(),
    ttl.boundingBox(),
  ]);
  expect(recordBox).not.toBeNull();
  expect(tableBox).not.toBeNull();
  expect(ttlBox).not.toBeNull();
  expect(tableBox!.width).toBeGreaterThan(recordBox!.width * 0.85);
  expect(ttlBox!.y + ttlBox!.height).toBeLessThanOrEqual(tableBox!.y);
  expect(await record.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileTable = page.getByRole("table", { name: "Addresses for jill.ns.cloudflare.com" });
  const mobileViewport = mobileTable.locator("..");
  const mobileScroll = await mobileViewport.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
    return {
      clientWidth: element.clientWidth,
      scrollLeft: element.scrollLeft,
      scrollWidth: element.scrollWidth,
    };
  });
  expect(mobileScroll.scrollWidth - mobileScroll.clientWidth).toBeLessThanOrEqual(1);
  expect(mobileScroll.scrollLeft).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
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

  await page.goto("/dns-lookup");
  await page.getByLabel("DNS name").fill("example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  await expect(page.locator('[data-record-type="CAA"] .dns-record-item')).toHaveCount(11);
  const caaGroup = page.locator('section[data-record-type="CAA"]');
  await expect(caaGroup).toContainText("issuewild");
  await expect(caaGroup).toContainText("6 issue");
  await expect(caaGroup.locator(".dns-show-more")).toHaveCount(0);
  await expect(page.locator('[data-record-type="TXT"] .dns-record-item')).toHaveCount(5);
  await page.getByRole("button", { name: "Expand all records" }).click();
  await expect(page.locator('[data-record-type="TXT"] .dns-record-item')).toHaveCount(7);
  await expect(page.getByRole("button", { name: "Collapse long record lists" })).toBeVisible();
});

test("DNS Lookup keeps a failed favicon invisible instead of shifting the title", async ({ page }) => {
  const missingFaviconFixture = {
    ...fixture,
    query: {
      ...fixture.query,
      originalInput: "missing.example",
      normalizedName: "missing.example",
    },
  };
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: missingFaviconFixture, status: 200 });
  });

  await page.goto("/dns-lookup");
  await page.getByLabel("DNS name").fill("missing.example");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  // The element stays mounted so its presence is deterministic and the title
  // never shifts, but it must stay invisible when the icon cannot load.
  const favicon = page.locator(".dns-site-favicon");
  await expect(favicon).toHaveAttribute("data-favicon-state", "failed");
  await expect(favicon).toHaveCSS("opacity", "0");
});

test("query-param lookup states remain noindex and canonicalize to the clean tool URL", async ({ page }) => {
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
  });
  await page.goto("/dns-lookup?name=www.example.com&type=all&resolver=cloudflare");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://stack127.com/dns-lookup",
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
  await page.goto("/dns-lookup");
  await page.getByLabel("DNS name").fill("www.example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  const traceLink = page.getByRole("link", { name: "Trace this name" });
  await expect(traceLink).toHaveCount(1);
  await expect(traceLink).toHaveAttribute(
    "href",
    "/dns-trace?name=www.example.com&type=A",
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
  await page.goto("/dns-lookup");
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
