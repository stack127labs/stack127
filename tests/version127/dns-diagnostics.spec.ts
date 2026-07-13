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

test("diagnostic results show the site favicon and offer a useful export", async ({ page }) => {
  await page.route("https://example.com/favicon.ico", (route) => route.fulfill({ body: Buffer.from("favicon"), contentType: "image/x-icon", status: 200 }));
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
  await expect(page.locator('img[src="https://example.com/favicon.ico"]')).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download" }).click();
  await expect((await downloadPromise).suggestedFilename()).toBe("example.com-A-dns-change.csv");
});

test("DNSSEC result leads with the real validation steps and requested answer", async ({ page }) => {
  await page.route("**/api/dns/dnssec-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      query: { name: "example.com", recordType: "A" }, checkedAt: "2026-07-13T10:00:00.000Z", durationMs: 310,
      verdict: "secure", explanation: "validated",
      validation: { outcome: "secure-positive", steps: [{ kind: "root-trust-anchor", zone: ".", ok: true, detail: "Root trust anchor loaded." }, { kind: "answer", qname: "example.com.", qtype: "A", ok: true, detail: "RRSIG verified for the A answer." }] },
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
});
