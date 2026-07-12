import { expect, test } from "playwright/test";

const fixture = {
  query: {
    originalInput: "www.example.com",
    normalizedName: "www.example.com",
    selection: "common",
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
  ],
  warnings: [],
};

test("DNS Lookup renders corrected TTL, alias, owner, flags, and technical details", async ({ page }) => {
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
  });

  await page.goto("/dns-tools/dns-lookup");
  await expect(page.locator(".app-main h1")).toHaveText("DNS lookup");
  await expect(page.getByRole("button", { name: "example.com", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "www.example.com", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "mail.example.com", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "_dmarc.example.com", exact: true })).toHaveCount(0);

  await page.getByLabel("DNS name").fill("www.example.com");
  await page.getByRole("button", { name: "Look up DNS" }).click();

  await expect(page.locator(".dns-alias-summary")).toContainText("www.example.com is an alias for edge.example.net.");
  await expect(page.getByRole("heading", { name: "A records for edge.example.net" })).toBeVisible();
  await expect(page.getByText("Resolver TTL").first()).toBeVisible();
  await expect(page.getByText("300 seconds, about 5 minutes remaining").first()).toBeVisible();
  await expect(page.getByText(/remaining cache lifetime reported by Cloudflare/)).toBeVisible();
  await expect(page.getByText("DNSSEC authentication reported: Yes")).toBeVisible();

  await page.locator(".dns-technical-details > summary").click();
  await page.locator(".dns-query-details > summary").first().click();
  await expect(page.getByText("Not reported").first()).toBeVisible();
  await expect(page.getByText(/\"Status\": 0/)).toBeVisible();
});

test("query-param lookup states remain noindex and canonicalize to the clean tool URL", async ({ page }) => {
  await page.route("**/api/dns/lookup", async (route) => {
    await route.fulfill({ contentType: "application/json", json: fixture, status: 200 });
  });
  await page.goto("/dns-tools/dns-lookup?name=www.example.com&type=common&resolver=cloudflare");

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://version127.com/dns-tools/dns-lookup",
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
