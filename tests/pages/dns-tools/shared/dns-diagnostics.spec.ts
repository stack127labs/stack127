import { expect, test } from "playwright/test";

test("query-filled diagnostic pages remain noindex with a clean canonical", async ({ page }) => {
  await page.goto("/caa-checker?name=www.example.com");
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("www.example.com");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://stack127.com/caa-checker");
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
  await page.goto("/dnssec-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Validate DNSSEC" }).click();
  await expect(page.getByText("Start with the DNS root trust anchor")).toBeVisible();
  await expect(page.getByText("RRSIG verified for the A answer.")).toBeVisible();
  await expect(page.getByRole("cell", { name: "192.0.2.10" })).toBeVisible();
  await expect(page.getByText("Secure. The A answer for example.com is signed and validates through the chain to the DNS root.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Signature validity" })).toBeVisible();
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
      answer: { responseCode: "NOERROR", authenticatedData: true, records: [], rawResponse: { Status: 0, signature: "A".repeat(11_000) }, error: null },
      chain: [],
      validator: {
        name: "Namefi DNSSEC Audit",
        performedLocalValidation: true,
        exitCode: 0,
        rawReport: { signature: "A".repeat(11_000) },
      },
    }),
  }));
  await page.goto("/dnssec-checker?name=bloxodes.com&type=A");
  await page.getByRole("button", { name: "Validate DNSSEC" }).click();
  await expect(page.getByText("Complete validator report", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Raw requested answer", exact: true }).click();
  await expect(page.locator("pre")).toContainText("A".repeat(11_000));

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
      authoritative: [
        { id: "one", label: "ns1.example.com", kind: "authoritative", server: { hostname: "ns1.example.com", address: "192.0.2.1" }, responseCode: "NOERROR", authoritative: true, authenticatedData: null, records: [{ ownerName: "example.com", type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 300 }], error: null, rawResponse: {} },
        { id: "two", label: "ns2.example.com", kind: "authoritative", server: { hostname: "ns2.example.com", address: "192.0.2.2" }, responseCode: "NOERROR", authoritative: true, authenticatedData: null, records: [{ ownerName: "example.com", type: "A", typeCode: 1, value: "192.0.2.20", resolverTtlSeconds: 300 }], error: null, rawResponse: {} },
      ],
      resolvers: [
        { id: "cloudflare", label: "Cloudflare", kind: "resolver", server: null, responseCode: "NOERROR", authoritative: null, authenticatedData: false, records: [{ ownerName: "example.com", type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 240 }], error: null, rawResponse: {} },
        { id: "google", label: "Google Public DNS", kind: "resolver", server: null, responseCode: "NOERROR", authoritative: null, authenticatedData: false, records: [{ ownerName: "example.com", type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 240 }], error: null, rawResponse: {} },
        { id: "quad9", label: "Quad9", kind: "resolver", server: null, responseCode: null, authoritative: null, authenticatedData: null, records: [], error: "The resolver did not answer.", rawResponse: null },
      ],
      summary: { authoritativeServersAgree: false, matchingAuthoritativeSources: 1, totalAuthoritativeSources: 2, agreeingResolvers: 2, totalResolvers: 3, expectedAnswerMatches: null },
    }),
  }));
  await page.goto("/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check DNS change" }).click();
  await expect(page.getByText(/1 of 2 usable authoritative replies returned the answer used for comparison\. 2 of 2 usable public resolver replies match it\. 1 other resolver did not return a usable reply\./)).toBeVisible();
  await expect(page.getByRole("link", { name: "Compare their SOA serials" })).toHaveAttribute("href", "/soa-checker?name=example.com");
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
  await page.goto("/nameserver-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check nameservers" }).click();
  await expect(page.getByText("ns1.example.com did not answer over TCP at 192.0.2.10.")).toBeVisible();
  await expect(page.getByRole("cell", { name: "192.0.2.11" })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "192.0.2.10" }).last()).toContainText("Example NetworkAS64500192.0.2.0/24US");

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
  await page.goto("/nameserver-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Check nameservers" }).click();

  await expect(page.getByText(/example\.com has a healthy delegation/)).toBeVisible();
  const skippedRow = page.getByRole("row").filter({ hasText: "2001:db8::53" });
  await expect(skippedRow.getByText("Skipped by checker", { exact: true })).toBeVisible();
  await expect(skippedRow.getByText("No IPv6 route", { exact: true })).toBeVisible();
  await expect(page.getByText(/did not answer over/)).toHaveCount(0);
  const ipv6Row = page.getByRole("table", { name: /UDP, TCP, and authoritative/ }).getByRole("row").filter({ hasText: "2001:db8::53" });
  await expect(ipv6Row.getByText("Not run", { exact: true })).toHaveCount(2);
  await expect(ipv6Row.getByText("Not checked", { exact: true })).toBeVisible();
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
  await page.goto("/soa-checker");
  await page.getByLabel("Domain or hostname").fill("example.com");
  await page.getByRole("button", { name: "Compare SOA records" }).click();

  await expect(page.getByText(/All addresses this checker could query for example\.com/)).toBeVisible();
  const resultsTable = page.getByRole("table", { name: /SOA values for example\.com/ });
  const skipped = resultsTable.locator("tbody tr").filter({ hasText: "2001:db8::53" });
  await expect(skipped).toContainText(/Skipped by checker\s*No IPv6 route/);
  await expect(resultsTable.locator('tbody th[data-label="Source"] code')).toHaveText([
    "a-very-long-nameserver-hostname.example.net",
    "a-very-long-nameserver-hostname.example.net",
  ]);
  await expect(resultsTable.locator('td[data-label="Serial"]', { hasText: "2,407,160,699" })).toBeVisible();
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
  await page.goto("/dns-lookup");
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("banner")).toHaveCSS("position", "static");
  await expect(page.locator("[data-app-sidebar]")).toBeHidden();
  await expect(page.getByRole("contentinfo")).toBeHidden();
  await expect(page.locator(".dns-lookup-main")).toHaveCSS("display", "block");
  const supportingTable = page.locator('[data-tool-page-content] [role="region"]').first();
  await expect(supportingTable).toHaveCSS("overflow-x", "visible");
  await expect(supportingTable.locator("td").first()).toHaveCSS("overflow-wrap", "normal");
});
