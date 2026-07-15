import { expect, test } from "playwright/test";

const tools = [
  { route: "/dns-tools/dns-change-checker", title: "DNS Change Checker", button: "Check DNS change", sections: 4 },
  { route: "/dns-tools/nameserver-checker", title: "Nameserver Delegation Checker", button: "Check nameservers", sections: 5 },
  { route: "/dns-tools/dnssec-checker", title: "DNSSEC Chain Checker", button: "Validate DNSSEC", sections: 5 },
  { route: "/dns-tools/soa-checker", title: "SOA Consistency Checker", button: "Compare SOA records", sections: 4 },
  { route: "/dns-tools/caa-checker", title: "CAA Policy Checker", button: "Check CAA policy", sections: 5 },
] as const;

for (const tool of tools) {
  test(`${tool.title} is a published, server-readable DNS tool page`, async ({ page }, testInfo) => {
    await page.goto(tool.route);
    await expect(page.locator("[data-app-main] h1")).toHaveText(tool.title);
    await expect(page.getByLabel("Domain or hostname")).toBeVisible();
    await expect(page.getByRole("button", { name: tool.button })).toBeVisible();
    await expect(page.locator(".dns-reference-content > section")).toHaveCount(tool.sections);
    await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute("content", /noindex/i);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://version127.com${tool.route}`);
    if (testInfo.project.name !== "mobile") {
      await expect(page.getByRole("navigation", { name: "DNS tools" }).getByRole("link")).toHaveCount(7);
      await expect(page.getByRole("navigation", { name: "DNS tools" }).getByRole("link", { name: tool.title, exact: true })).toHaveAttribute("aria-current", "page");
    }
    await expect(page.getByText(/health score/i)).toHaveCount(0);
    await expect(page.getByText(/globally propagated/i)).toHaveCount(0);
  });
}

test("query-filled diagnostic pages remain noindex with a clean canonical", async ({ page }) => {
  await page.goto("/dns-tools/caa-checker?name=www.example.com");
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("www.example.com");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://version127.com/dns-tools/caa-checker");
});

test("diagnostic results show the site favicon and download the complete report", async ({ page }, testInfo) => {
  await page.route("https://example.com/favicon.ico", (route) => route.fulfill({ path: "public/favicon-32x32.png", contentType: "image/png", status: 200 }));
  await page.route("**/api/dns/change-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      query: { name: "example.com", recordType: "A", expectedAnswer: null },
      checkedAt: "2026-07-13T10:00:00.000Z",
      durationMs: 120,
      zone: "example.com",
      authoritative: [{ id: "authority-0", label: "ns1.example.com", kind: "authoritative", server: { hostname: "ns1.example.com", address: "192.0.2.53" }, responseCode: "NOERROR", authoritative: true, authenticatedData: null, records: [{ ownerName: "example.com", type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 300 }], error: null, rawResponse: { Status: 0, AA: true } }],
      resolvers: [{ id: "cloudflare", label: "Cloudflare", kind: "resolver", server: null, responseCode: "NOERROR", authoritative: null, authenticatedData: false, records: [{ ownerName: "example.com", type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 240 }], error: null, rawResponse: { Status: 0 } }],
      summary: { authoritativeServersAgree: true, agreeingResolvers: 1, totalResolvers: 1, expectedAnswerMatches: null },
    }),
  }));
  await page.goto("/dns-tools/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check DNS change" }).click();
  if (testInfo.project.name !== "mobile") {
    await expect(page.locator('img[src="https://example.com/favicon.ico"]')).toBeVisible();
  }
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  await expect(download.suggestedFilename()).toBe("example.com-A-dns-change-report.json");
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({
    tool: "DNS Change Checker",
    query: { name: "example.com", recordType: "A" },
    authoritative: [{ rawResponse: { Status: 0, AA: true } }],
    resolvers: [{ rawResponse: { Status: 0 } }],
  });
});

test("DNSSEC result leads with the real validation steps and requested answer", async ({ page }) => {
  await page.route("**/api/dns/dnssec-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      query: { name: "example.com", recordType: "A" }, checkedAt: "2026-07-13T10:00:00.000Z", durationMs: 310,
      verdict: "secure", explanation: "validated",
      validation: { outcome: "secure-positive", steps: [{ kind: "root-trust-anchor", zone: ".", ok: true, detail: "Root trust anchor loaded." }, { kind: "answer", qname: "example.com.", qtype: "A", ok: true, detail: "RRSIG verified for the A answer." }] },
      signatures: [{ ownerName: "example.com", queryName: "example.com", queryType: "A", typeCovered: "A", algorithm: 13, algorithmName: "ECDSAP256SHA256", keyTag: 2371, signerName: "example.com", inception: "2026-07-13T09:00:00.000Z", expiration: "2026-07-20T09:00:00.000Z", status: "valid", secondsRemaining: 601200 }],
      answer: { responseCode: "NOERROR", authenticatedData: false, records: [{ ownerName: "example.com", type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 300 }], rawResponse: { Status: 0 }, error: null },
      chain: [], validator: { name: "Namefi DNSSEC Audit", performedLocalValidation: true, exitCode: 0, rawReport: { verdict: "secure-positive" } },
    }),
  }));
  await page.goto("/dns-tools/dnssec-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Validate DNSSEC" }).click();
  await expect(page.getByText("Start with the DNS root trust anchor")).toBeVisible();
  await expect(page.getByText("RRSIG verified for the A answer.")).toBeVisible();
  await expect(page.getByRole("cell", { name: "192.0.2.10" })).toBeVisible();
  await expect(page.getByText("The A answer is signed, and its signatures validate through the chain to the DNS root.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "When the signatures expire" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "ECDSAP256SHA256 (13)" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "2371" })).toBeVisible();
});

test("DNSSEC raw reports never widen the page", async ({ page }) => {
  await page.route("**/api/dns/dnssec-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      query: { name: "bloxodes.com", recordType: "A" }, checkedAt: "2026-07-15T10:00:00.000Z", durationMs: 310,
      verdict: "secure", explanation: "validated",
      validation: { outcome: "secure-positive", steps: [] },
      signatures: [],
      answer: { responseCode: "NOERROR", authenticatedData: true, records: [], rawResponse: { Status: 0 }, error: null },
      chain: [],
      validator: {
        name: "Namefi DNSSEC Audit",
        performedLocalValidation: true,
        exitCode: 0,
        rawReport: { signature: "A".repeat(11_000) },
      },
    }),
  }));
  await page.goto("/dns-tools/dnssec-checker?name=bloxodes.com&type=A");
  await page.getByRole("button", { name: "Validate DNSSEC" }).click();
  await page.getByText("Complete validator report", { exact: true }).click();

  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client);
});

test("authoritative disagreement points to the SOA checker", async ({ page }) => {
  await page.route("**/api/dns/change-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      query: { name: "example.com", recordType: "A", expectedAnswer: null }, checkedAt: "2026-07-13T10:00:00.000Z", durationMs: 120, zone: "example.com",
      authoritative: [{ id: "one", label: "ns1.example.com", kind: "authoritative", server: { hostname: "ns1.example.com", address: "192.0.2.1" }, responseCode: "NOERROR", authoritative: true, authenticatedData: null, records: [{ ownerName: "example.com", type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 300 }], error: null, rawResponse: {} }],
      resolvers: [], summary: { authoritativeServersAgree: false, agreeingResolvers: 0, totalResolvers: 0, expectedAnswerMatches: null },
    }),
  }));
  await page.goto("/dns-tools/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.getByRole("link", { name: "Compare their SOA serials" })).toHaveAttribute("href", "/dns-tools/soa-checker?name=example.com");
});

test("nameserver results keep transport, glue, and network evidence separate", async ({ page }) => {
  await page.route("**/api/dns/nameserver-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      checkedAt: "2026-07-13T10:00:00.000Z", durationMs: 240, inputName: "example.com", zone: "example.com", parentZone: "com",
      parentNameservers: [], parentObservations: [], childObservations: [],
      parentDelegatedNameservers: ["ns1.example.com"], childPublishedNameservers: ["ns1.example.com"],
      parentGlue: [{ hostname: "ns1.example.com", address: "192.0.2.10", ttlSeconds: 300 }],
      nameserverAddresses: [{ hostname: "ns1.example.com", addresses: ["192.0.2.10"] }],
      authoritativeAddressObservations: [{ hostname: "ns1.example.com", server: { hostname: "ns1.example.com", address: "192.0.2.10" }, addresses: ["192.0.2.11"], authoritative: true, error: null, rawResponses: { A: {}, AAAA: {} } }],
      addressDetails: [{ address: "192.0.2.10", asn: 64500, networkName: "Example Network", prefix: "192.0.2.0/24", countryCode: "US" }],
      reachability: [{ server: { hostname: "ns1.example.com", address: "192.0.2.10" }, udp: { reachable: true, authoritative: true, responseCode: "NOERROR", error: null }, tcp: { reachable: false, authoritative: null, responseCode: null, error: "timeout" }, soa: { ownerName: "example.com", primaryNameserver: "ns1.example.com", responsibleMailbox: "hostmaster.example.com", serial: 1, refreshSeconds: 3600, retrySeconds: 600, expireSeconds: 86400, minimumSeconds: 300, ttlSeconds: 300 }, rawResponses: { udp: {}, tcp: null } }],
      findings: ["ns1.example.com did not answer over TCP at 192.0.2.10.", "ns1.example.com has different addresses in the parent glue and its authoritative A or AAAA records."],
      notes: ["Every discovered nameserver address belongs to AS64500 (Example Network)."],
    }),
  }));
  await page.goto("/dns-tools/nameserver-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check nameservers" }).click();
  await expect(page.getByText("ns1.example.com did not answer over TCP at 192.0.2.10.")).toBeVisible();
  await expect(page.getByRole("cell", { name: "192.0.2.11" })).toBeVisible();
  await expect(page.getByText(/Example Network · AS64500 · 192\.0\.2\.0\/24/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  await expect(download.suggestedFilename()).toBe("example.com-nameserver-report.json");
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({
    tool: "Nameserver Delegation Checker",
    inputName: "example.com",
    zone: "example.com",
    parentZone: "com",
    parentDelegatedNameservers: ["ns1.example.com"],
    childPublishedNameservers: ["ns1.example.com"],
    parentGlue: [{ hostname: "ns1.example.com", address: "192.0.2.10" }],
    authoritativeAddressObservations: [{ rawResponses: { A: {}, AAAA: {} } }],
    reachability: [{ udp: { reachable: true }, tcp: { reachable: false }, rawResponses: { udp: {}, tcp: null } }],
    findings: [
      "ns1.example.com did not answer over TCP at 192.0.2.10.",
      "ns1.example.com has different addresses in the parent glue and its authoritative A or AAAA records.",
    ],
    notes: ["Every discovered nameserver address belongs to AS64500 (Example Network)."],
  });
});

test("nameserver results label checker-side IPv6 skips without blaming the domain", async ({ page }) => {
  await page.route("**/api/dns/nameserver-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      checkedAt: "2026-07-15T10:00:00.000Z", durationMs: 240, inputName: "example.com", zone: "example.com", parentZone: "com",
      ipv6Connectivity: false,
      parentNameservers: [], parentObservations: [], childObservations: [],
      parentDelegatedNameservers: ["ns1.example.net"], childPublishedNameservers: ["ns1.example.net"],
      parentGlue: [], nameserverAddresses: [{ hostname: "ns1.example.net", addresses: ["192.0.2.10", "2001:db8::53"] }],
      authoritativeAddressObservations: [], addressDetails: [],
      reachability: [
        { server: { hostname: "ns1.example.net", address: "192.0.2.10" }, skippedReason: null, udp: { reachable: true, authoritative: true, responseCode: "NOERROR", error: null }, tcp: { reachable: true, authoritative: true, responseCode: "NOERROR", error: null }, soa: { ownerName: "example.com", primaryNameserver: "ns1.example.net", responsibleMailbox: "hostmaster.example.com", serial: 1, refreshSeconds: 3600, retrySeconds: 600, expireSeconds: 86400, minimumSeconds: 300, ttlSeconds: 300 }, rawResponses: { udp: {}, tcp: {} } },
        { server: { hostname: "ns1.example.net", address: "2001:db8::53" }, skippedReason: "checker_ipv6_unavailable", udp: { reachable: false, authoritative: null, responseCode: null, error: null }, tcp: { reachable: false, authoritative: null, responseCode: null, error: null }, soa: null, rawResponses: { udp: null, tcp: null } },
      ],
      findings: [], notes: ["IPv6 checks were skipped because this checker does not have IPv6 connectivity."],
    }),
  }));
  await page.goto("/dns-tools/nameserver-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check nameservers" }).click();

  await expect(page.getByText("IPv6 checks were skipped because this checker does not have IPv6 connectivity.")).toBeVisible();
  await expect(page.getByText(/did not answer over/)).toHaveCount(0);
  const ipv6Row = page.getByRole("row").filter({ hasText: "2001:db8::53" });
  await expect(ipv6Row.getByRole("cell", { name: "Skipped" })).toHaveCount(2);
  await expect(ipv6Row.getByRole("cell", { name: "Not checked" })).toBeVisible();
});

test("SOA results stay readable and preserve skipped IPv6 evidence in the report", async ({ page }) => {
  const soa = { ownerName: "example.com", primaryNameserver: "a-very-long-primary-nameserver.example.net", responsibleMailbox: "hostmaster.example.com", serial: 2407160699, refreshSeconds: 10000, retrySeconds: 2400, expireSeconds: 604800, minimumSeconds: 1800, ttlSeconds: 3600 };
  await page.route("**/api/dns/soa-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      query: { inputName: "example.com", zone: "example.com" }, checkedAt: "2026-07-15T10:00:00.000Z", durationMs: 420, ipv6Connectivity: false,
      observations: [
        { server: { hostname: "a-very-long-nameserver-hostname.example.net", address: "192.0.2.53" }, skippedReason: null, soa, authoritative: true, error: null, rawResponses: { udp: { Status: 0 }, tcp: { Status: 0 } } },
        { server: { hostname: "a-very-long-nameserver-hostname.example.net", address: "2001:db8::53" }, skippedReason: "checker_ipv6_unavailable", soa: null, authoritative: false, error: null, rawResponses: { udp: null, tcp: null } },
      ],
      summary: { allAnswered: true, serialsAgree: true, newestSerial: 2407160699, differences: [] },
    }),
  }));
  await page.goto("/dns-tools/soa-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Compare SOA records" }).click();

  await expect(page.getByText("IPv6 checks were skipped because this checker does not have IPv6 connectivity.")).toBeVisible();
  await expect(page.getByText("a-very-long-nameserver-hostname.example.net", { exact: true })).toBeVisible();
  await expect(page.getByText("2,407,160,699")).toBeVisible();
  await expect(page.getByText(/ENETUNREACH/)).toHaveCount(0);
  const width = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({
    tool: "SOA Consistency Checker",
    ipv6Connectivity: false,
    observations: [{ skippedReason: null }, { skippedReason: "checker_ipv6_unavailable", server: { address: "2001:db8::53" } }],
  });
});

test("DNS pages have print-safe shell and tables", async ({ page }) => {
  await page.goto("/dns-tools/dns-lookup");
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("banner")).toHaveCSS("position", "static");
  await expect(page.locator("[data-app-sidebar]")).toBeHidden();
  await expect(page.getByRole("contentinfo")).toBeHidden();
  await expect(page.locator(".dns-lookup-main")).toHaveCSS("display", "block");
  await expect(page.locator(".dns-table-scroll").first()).toHaveCSS("overflow-x", "visible");
  await expect(page.locator(".dns-status-table td").first()).toHaveCSS("overflow-wrap", "normal");
});
