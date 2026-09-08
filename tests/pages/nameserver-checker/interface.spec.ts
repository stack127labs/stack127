import { expect, test, type Page, type Route } from "playwright/test";

const soa = {
  expireSeconds: 86_400,
  minimumSeconds: 300,
  ownerName: "example.com",
  primaryNameserver: "ns1.example.com",
  refreshSeconds: 3_600,
  responsibleMailbox: "hostmaster.example.com",
  retrySeconds: 600,
  serial: 1,
  ttlSeconds: 300,
};

function reachability(overrides: Record<string, unknown> = {}) {
  return {
    rawResponses: { tcp: { Answer: [{ data: "SOA" }], Status: 0 }, udp: { Answer: [{ data: "SOA" }], Status: 0 } },
    server: { address: "192.0.2.10", hostname: "ns1.example.com" },
    skippedReason: null,
    soa,
    tcp: { authoritative: true, error: null, reachable: true, responseCode: "NOERROR" },
    udp: { authoritative: true, error: null, reachable: true, responseCode: "NOERROR" },
    ...overrides,
  };
}

function result(overrides: Record<string, unknown> = {}) {
  return {
    addressDetails: [{ address: "192.0.2.10", asn: 64_500, countryCode: "US", networkName: "Example Network", prefix: "192.0.2.0/24" }],
    authoritativeAddressObservations: [{ addresses: ["192.0.2.10"], authoritative: true, error: null, hostname: "ns1.example.com", rawResponses: { A: { Answer: [], Status: 0 }, AAAA: { Answer: [], Status: 0 } }, server: { address: "192.0.2.10", hostname: "ns1.example.com" } }],
    checkedAt: "2026-09-05T10:00:00.000Z",
    childObservations: [{ authoritative: true, error: null, glue: [], nameservers: ["ns1.example.com"], rawResponse: { AA: true, Answer: [], Status: 0 }, responseCode: "NOERROR", server: { address: "192.0.2.10", hostname: "ns1.example.com" } }],
    childPublishedNameservers: ["ns1.example.com"],
    durationMs: 240,
    findings: [],
    inputName: "example.com",
    ipv6Connectivity: true,
    nameserverAddresses: [{ addresses: ["192.0.2.10"], hostname: "ns1.example.com" }],
    notes: [],
    parentDelegatedNameservers: ["ns1.example.com"],
    parentGlue: [{ address: "192.0.2.10", hostname: "ns1.example.com", ttlSeconds: 300 }],
    parentNameservers: [{ addresses: ["192.5.6.30"], hostname: "a.gtld-servers.net" }],
    parentObservations: [{ authoritative: false, error: null, glue: [{ address: "192.0.2.10", hostname: "ns1.example.com", ttlSeconds: 300 }], nameservers: ["ns1.example.com"], rawResponse: { Authority: [], Status: 0 }, responseCode: "NOERROR", server: { address: "192.5.6.30", hostname: "a.gtld-servers.net" } }],
    parentZone: "com",
    reachability: [reachability()],
    zone: "example.com",
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function submit(page: Page, name = "example.com") {
  await page.getByLabel("Domain or hostname").fill(name);
  await page.getByRole("button", { name: "Check nameservers" }).click();
}

test("keeps URL state clean and handles validation, loading, stale results, and request errors", async ({ page }) => {
  let request = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/dns/nameserver-checker", async (route) => {
    request += 1;
    if (request === 1) return fulfill(route, { error: { message: "Enter a domain or hostname rather than an IP address." } }, 400);
    if (request === 2) return fulfill(route, result());
    await new Promise<void>((resolve) => { release = resolve; });
    return fulfill(route, { error: { message: "The nameserver check took too long and was stopped safely." } }, 504);
  });
  await page.goto("/nameserver-checker");
  await expect(page).toHaveURL(/\/nameserver-checker$/);
  await expect(page.locator("[data-nameserver-result]")).toHaveCount(0);
  await page.getByRole("button", { name: "Check nameservers" }).click();
  await expect(page.getByText("Enter a domain or hostname.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Domain or hostname")).toBeFocused();

  await submit(page, "192.0.2.10");
  await expect(page.getByText("Enter a domain or hostname rather than an IP address.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Domain or hostname")).toBeFocused();

  await submit(page);
  await expect(page.locator("[data-nameserver-result]")).toBeVisible();
  await page.getByLabel("Domain or hostname").fill("failed.example.com");
  await page.getByRole("button", { name: "Check nameservers" }).click();
  await expect(page.getByRole("button", { name: "Checking nameservers..." })).toBeDisabled();
  await expect(page.locator("[data-nameserver-result]")).toHaveCount(0);
  release?.();
  await expect(page.getByText("The nameserver check took too long and was stopped safely.", { exact: true })).toHaveCount(1);
  await expect(page.locator("[data-nameserver-result]")).toHaveCount(0);

  await page.goto("/nameserver-checker?name=mail.example.com");
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("mail.example.com");
  await expect(page.locator("[data-nameserver-result]")).toHaveCount(0);
  await expect(page).toHaveURL(/\/nameserver-checker\?name=mail\.example\.com$/);
});

test("shows one guarded diagnosis and keeps delegation, transport, and source evidence separate", async ({ page }) => {
  const mismatch = "ns2.example.net appears at the parent but not in the zone's own NS records.";
  const noAddress = "ns2.example.net did not resolve to a public IPv4 or IPv6 address.";
  await page.route("**/api/dns/nameserver-checker", (route) => fulfill(route, result({
    findings: [mismatch, noAddress],
    parentDelegatedNameservers: ["ns1.example.com", "ns2.example.net"],
    nameserverAddresses: [{ addresses: ["192.0.2.10"], hostname: "ns1.example.com" }, { addresses: [], hostname: "ns2.example.net" }],
  })));
  await page.goto("/nameserver-checker");
  await submit(page);

  await expect(page.getByText(`The delegation first fails at ${mismatch}`, { exact: true })).toHaveCount(1);
  await expect(page.getByText(mismatch, { exact: true })).toHaveCount(0);
  await expect(page.getByText(noAddress, { exact: true })).toHaveCount(1);
  const delegation = page.getByRole("table", { name: "Nameserver delegation, glue, and address comparison" });
  await expect(delegation.getByRole("row")).toHaveCount(3);
  await expect(delegation.getByRole("row").filter({ hasText: "ns2.example.net" })).toContainText("Not required");
  const checks = page.getByRole("table", { name: "UDP, TCP, and authoritative SOA checks by nameserver address" });
  await expect(checks.getByRole("row").filter({ hasText: "192.0.2.10" })).toContainText("Answered, NOERRORAuthoritative");
  await expect(checks.getByRole("row").filter({ hasText: "192.0.2.10" })).toContainText("Example NetworkAS64500192.0.2.0/24US");
  await expect(page.getByRole("button", { name: "Parent, child, and address responses" })).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("button", { name: "UDP and TCP responses" })).toHaveAttribute("aria-expanded", "false");
});

test("never calls empty, skipped, non-authoritative, or SOA-less evidence healthy", async ({ page }) => {
  const responses = [
    result({ parentDelegatedNameservers: [], childPublishedNameservers: [], nameserverAddresses: [], reachability: [] }),
    result({ ipv6Connectivity: false, reachability: [reachability({ rawResponses: { tcp: null, udp: null }, server: { address: "2001:db8::53", hostname: "ns1.example.com" }, skippedReason: "checker_ipv6_unavailable", soa: null })] }),
    result({ reachability: [reachability({ tcp: { authoritative: false, error: null, reachable: true, responseCode: "NOERROR" } })] }),
    result({ childPublishedNameservers: ["ns2.example.com"], findings: [], parentDelegatedNameservers: ["ns1.example.com"] }),
    result({ reachability: [reachability({ soa: null })] }),
  ];
  await page.route("**/api/dns/nameserver-checker", (route) => fulfill(route, responses.shift()));
  await page.goto("/nameserver-checker");
  for (let index = 0; index < 5; index += 1) {
    await submit(page);
    await expect(page.locator("[data-nameserver-result]")).not.toContainText("healthy delegation");
    if (index === 1) {
      const directChecks = page.getByRole("list", { name: "DNS delegation path" }).getByRole("listitem").nth(2);
      await expect(directChecks).toContainText("0address");
    }
  }
  await expect(page.getByText(/did not return an authoritative SOA/)).toBeVisible();
});

test("downloads the complete report and exposes grouped raw responses", async ({ page }) => {
  const fixture = result();
  await page.route("**/api/dns/nameserver-checker", (route) => fulfill(route, fixture));
  await page.goto("/nameserver-checker");
  await submit(page);
  await page.getByRole("button", { name: "Parent, child, and address responses" }).click();
  await expect(page.getByRole("button", { name: "Parent response from a.gtld-servers.net at 192.5.6.30" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Child response from ns1.example.com at 192.0.2.10" })).toBeVisible();
  await page.getByRole("button", { name: "UDP and TCP responses" }).click();
  await expect(page.getByRole("heading", { exact: true, name: "ns1.example.com at 192.0.2.10" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("example.com-nameserver-report.json");
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({
    tool: "Nameserver Delegation Checker",
    parentObservations: [{ rawResponse: { Status: 0 } }],
    reachability: [{ rawResponses: { tcp: { Status: 0 }, udp: { Status: 0 } } }],
  });
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long tables and raw responses at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 375 ? 820 : 950 });
      const longZone = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}.com`;
      const longHost = `${"n".repeat(63)}.${longZone}`;
      const longReachability = reachability({
        rawResponses: { tcp: { Answer: [{ data: "K".repeat(12_000) }] }, udp: { Answer: [{ data: "V".repeat(11_000) }] } },
        server: { address: "2001:0db8:ffff:ffff:ffff:ffff:ffff:0001", hostname: longHost },
        soa: { ...soa, ownerName: longZone, primaryNameserver: longHost },
      });
      const fixture = result({
        addressDetails: [{ address: longReachability.server.address, asn: 64_500, countryCode: "US", networkName: `Example ${"network".repeat(60)}`, prefix: "2001:db8::/32" }],
        authoritativeAddressObservations: [],
        childObservations: [],
        childPublishedNameservers: [longHost],
        findings: [],
        nameserverAddresses: [{ addresses: [longReachability.server.address], hostname: longHost }],
        parentDelegatedNameservers: [longHost],
        parentGlue: [],
        parentObservations: [{ ...result().parentObservations[0], nameservers: [longHost], rawResponse: { Authority: [{ data: "R".repeat(12_000) }] } }],
        reachability: [longReachability],
        zone: longZone,
      });
      await page.route("**/api/dns/nameserver-checker", (route) => fulfill(route, fixture));
      await page.goto("/nameserver-checker");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await submit(page, longZone);
      await page.getByRole("button", { name: "Parent, child, and address responses" }).click();
      await page.getByRole("button", { name: `Parent response from a.gtld-servers.net at 192.5.6.30` }).click();
      await page.getByRole("button", { name: "UDP and TCP responses" }).click();
      await page.getByRole("button", { name: "UDP response" }).click();

      const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.client);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      for (const table of await page.getByRole("table").all()) {
        const owner = table.locator("xpath=..");
        const tableWidths = await owner.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
        expect(tableWidths.scroll).toBeGreaterThanOrEqual(tableWidths.client);
      }
    });
  }
}
