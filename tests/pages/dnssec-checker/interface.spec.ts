import { expect, test, type Page, type Route } from "playwright/test";

type Outcome = "secure-positive" | "secure-nodata" | "secure-nxdomain" | "insecure" | "bogus" | null;

function record(value = "192.0.2.10", type = "A", ownerName = "example.com", ttl = 300) {
  return { ownerName, type, typeCode: type === "TXT" ? 16 : 1, value, resolverTtlSeconds: ttl };
}

function evidence(overrides: Record<string, unknown> = {}) {
  return {
    responseCode: "NOERROR",
    authenticatedData: true,
    records: [record()],
    rawResponse: { Status: 0, AD: true, Answer: [{ data: "192.0.2.10" }] },
    error: null,
    ...overrides,
  };
}

function result(overrides: Record<string, unknown> = {}) {
  return {
    query: { name: "example.com", recordType: "A" },
    checkedAt: "2026-09-05T09:12:00.000Z",
    durationMs: 684,
    verdict: "secure",
    explanation: "This engine explanation must not render.",
    validation: {
      outcome: "secure-positive" as Outcome,
      steps: [
        { kind: "root-trust-anchor", zone: ".", ok: true, detail: "Root trust anchor loaded." },
        { kind: "ds", zone: "com", ok: true, detail: "The parent DS matches key tag 19718." },
        { kind: "dnskey", zone: "example.com", ok: true, detail: "The DNSKEY set has a valid signature." },
        { kind: "answer", qname: "example.com", qtype: "A", ok: true, detail: "RRSIG verified for the A answer." },
      ],
    },
    signatures: [
      { ownerName: "example.com", queryName: "example.com", queryType: "A", typeCovered: "A", algorithm: 13, algorithmName: "ECDSAP256SHA256", keyTag: 2371, signerName: "example.com", inception: "2026-09-01T00:00:00.000Z", expiration: "2026-09-12T00:00:00.000Z", status: "valid", secondsRemaining: 600000 },
      { ownerName: "com", queryName: "com", queryType: "DNSKEY", typeCovered: "DNSKEY", algorithm: 13, algorithmName: "ECDSAP256SHA256", keyTag: 19718, signerName: "com", inception: "2026-08-28T00:00:00.000Z", expiration: "2026-09-08T00:00:00.000Z", status: "valid", secondsRemaining: 250000 },
    ],
    answer: evidence(),
    chain: [
      { zone: ".", ds: null, dnskey: evidence({ records: [record("257 3 8 LONGROOTKEY", "DNSKEY", ".", 172800)] }) },
      { zone: "com", ds: evidence({ records: [record("19718 13 2 ABCDEF", "DS", "com", 86400)] }), dnskey: evidence({ records: [record("257 3 13 LONGCOMKEY", "DNSKEY", "com", 86400)] }) },
    ],
    validator: { name: "Namefi DNSSEC Audit", performedLocalValidation: true, exitCode: 0, rawReport: { private: "download only" } },
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function waitForTool(page: Page) {
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
}

async function submit(page: Page, name = "example.com") {
  await waitForTool(page);
  await page.getByLabel("Domain or hostname").fill(name);
  await page.getByRole("button", { name: "Validate DNSSEC" }).click();
}

async function chooseRecordType(page: Page, recordType: string) {
  await waitForTool(page);
  await page.getByText(recordType, { exact: true }).click();
}

test("keeps the clean URL, visible radio choices, and focused field validation", async ({ page }) => {
  await page.goto("/dnssec-checker");
  await waitForTool(page);
  await expect(page).toHaveURL(/\/dnssec-checker$/);
  await expect(page.getByLabel("Domain or hostname")).toHaveAttribute("aria-required", "true");
  await expect(page.getByRole("radio")).toHaveCount(9);
  await expect(page.getByRole("radio", { name: "A", exact: true })).toBeChecked();
  await page.getByRole("radio", { name: "A", exact: true }).focus();
  await page.getByRole("radio", { name: "A", exact: true }).press("ArrowRight");
  await expect(page.getByRole("radio", { name: "AAAA", exact: true })).toBeChecked();
  await expect(page.getByRole("button", { name: "Validate DNSSEC" })).toHaveCount(1);

  await page.getByRole("button", { name: "Validate DNSSEC" }).click();
  await expect(page.getByText("Enter a domain or hostname.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Domain or hostname")).toBeFocused();

  await page.goto("/dnssec-checker?name=example.com&type=MX");
  await waitForTool(page);
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("example.com");
  await expect(page.getByRole("radio", { name: "MX", exact: true })).toBeChecked();
  await expect(page).toHaveURL(/name=example\.com&type=MX$/);
});

test("leads with one exact verdict and shows each evidence collection once", async ({ page }) => {
  await page.route("**/api/dns/dnssec-checker", (route) => fulfill(route, result()));
  await page.goto("/dnssec-checker");
  await submit(page);

  const lead = page.locator("[data-dnssec-verdict]");
  await expect(lead).toHaveText("Secure. The A answer for example.com is signed and validates through the chain to the DNS root.");
  await expect(lead.locator("[data-verdict-word]" )).toHaveText("Secure.");
  await expect(page.getByRole("heading", { name: "example.com", exact: true })).toHaveCount(0);
  await expect(page.locator("img[src*='/favicon.ico']")).toHaveCount(0);
  await expect(page.getByText("This engine explanation must not render.")).toHaveCount(0);
  await expect(page.getByText("Complete validator report", { exact: true })).toHaveCount(0);

  const chain = page.getByRole("list", { name: "DNSSEC validation chain" });
  await expect(chain.getByRole("listitem")).toHaveCount(4);
  await expect(chain.getByText("RRSIG verified for the A answer.")).toHaveCount(1);

  const answer = page.getByRole("table", { name: "Requested answer records" });
  await expect(answer.getByRole("row")).toHaveCount(2);
  await expect(answer.getByRole("cell", { name: "192.0.2.10" })).toHaveCount(1);
  await expect(page.getByText("Set. Supporting resolver evidence only.", { exact: true })).toBeVisible();

  const signatures = page.getByRole("table", { name: "DNSSEC signatures" });
  await expect(signatures.getByRole("row")).toHaveCount(3);
  await expect(signatures.getByRole("row").nth(1)).toContainText("19718");
  await expect(signatures.getByRole("row").nth(2)).toContainText("2371");
  await expect(page.getByText(/whole domain|domain-wide expiry/i)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Download report" })).toBeVisible();
});

test("clears a previous result during a later request and keeps it cleared after failure", async ({ page }) => {
  let request = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/dns/dnssec-checker", async (route) => {
    request += 1;
    if (request === 1) return fulfill(route, result());
    await new Promise<void>((resolve) => { release = resolve; });
    return fulfill(route, { error: { message: "The DNSSEC check took too long and was stopped safely." } }, 504);
  });
  await page.goto("/dnssec-checker");
  await submit(page);
  await expect(page.locator("[data-dnssec-verdict]")).toBeVisible();

  await page.getByLabel("Domain or hostname").fill("changed.example.com");
  await page.getByRole("button", { name: "Validate DNSSEC" }).click();
  await expect(page.getByRole("button", { name: "Validating DNSSEC..." })).toBeDisabled();
  await expect(page.getByText("Validating DNSSEC...", { exact: true })).toHaveCount(2);
  await expect(page.locator("[data-dnssec-verdict]")).toHaveCount(0);
  release?.();
  await expect(page.getByText("The DNSSEC check took too long and was stopped safely.", { exact: true })).toHaveCount(1);
  await expect(page.locator("[data-dnssec-verdict]")).toHaveCount(0);
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("changed.example.com");
});

test("renders every validator outcome without dropping returned steps", async ({ page }) => {
  const cases = [
    { outcome: "secure-nodata", verdict: "secure", expected: "Secure. example.com exists, but it has no MX record. DNSSEC validated the signed proof of that absence.", name: "example.com", type: "MX" },
    { outcome: "secure-nxdomain", verdict: "secure", expected: "Secure. missing.example.com does not exist, and DNSSEC validated the signed denial proof.", name: "missing.example.com", type: "A" },
    { outcome: "insecure", verdict: "insecure", expected: "Insecure. The chain proves that unsigned.example.com is not DNSSEC-protected, but the chain is not broken.", name: "unsigned.example.com", type: "A" },
    { outcome: "bogus", verdict: "bogus", expected: "Bogus. The A answer for broken.example.com should validate, but the first failed chain step was Verify the DS link for example.com. Validating resolvers may return SERVFAIL.", name: "broken.example.com", type: "A" },
    { outcome: null, verdict: "indeterminate", expected: "Indeterminate. The validator could not gather enough evidence to classify the A answer for slow.example.com.", name: "slow.example.com", type: "A" },
  ] as const;
  let current = result();
  await page.route("**/api/dns/dnssec-checker", (route) => fulfill(route, current));
  await page.goto("/dnssec-checker");

  for (const item of cases) {
    const steps = item.outcome === "bogus"
      ? [{ kind: "root-trust-anchor", zone: ".", ok: true, detail: "Root passed." }, { kind: "ds", zone: "example.com", ok: false, detail: "The parent DS does not match the child DNSKEY." }]
      : item.outcome === null
        ? [{ kind: "root-trust-anchor", zone: ".", ok: true, detail: "Root passed." }, { kind: "dnskey", zone: "example.com", ok: false, detail: "DNSKEY lookup unavailable." }]
        : [{ kind: item.outcome === "insecure" ? "insecure" : "denial", zone: "example.com", ok: true, detail: "Returned outcome step." }];
    current = result({
      query: { name: item.name ?? "example.com", recordType: item.type },
      verdict: item.verdict,
      validation: { outcome: item.outcome, steps },
      answer: evidence({ records: [] }),
      signatures: [],
    });
    await page.getByLabel("Domain or hostname").fill(item.name ?? "example.com");
    if (!(await page.getByRole("radio", { name: item.type, exact: true }).isChecked())) {
      await chooseRecordType(page, item.type);
    }
    await page.getByRole("button", { name: "Validate DNSSEC" }).click();
    await expect(page.locator("[data-dnssec-verdict]")).toHaveText(item.expected);
    await expect(page.getByRole("list", { name: "DNSSEC validation chain" }).getByRole("listitem")).toHaveCount(steps.length);
  }

  current = result({ query: { name: "stalled.example.com", recordType: "A" }, verdict: "indeterminate", validation: { outcome: null, steps: [] }, signatures: [] });
  await page.getByLabel("Domain or hostname").fill("stalled.example.com");
  await page.getByRole("button", { name: "Validate DNSSEC" }).click();
  await expect(page.locator("[data-dnssec-verdict]")).toHaveText("Indeterminate. The validator could not complete the A check for stalled.example.com.");
  await expect(page.getByText("No validation steps were returned.", { exact: true })).toHaveCount(1);
});

test("distinguishes empty and failed requested evidence and expands zone records by type", async ({ page }) => {
  const fixture = result({
    verdict: "indeterminate",
    validation: { outcome: null, steps: [{ kind: "root-trust-anchor", zone: ".", ok: true, detail: "Root passed." }] },
    signatures: [],
    answer: evidence({ records: [], rawResponse: null, error: "The requested evidence lookup failed." }),
    chain: [
      { zone: ".", ds: null, dnskey: evidence({ records: [] }) },
      { zone: "example.com", ds: evidence({ records: [], error: "DS lookup failed.", rawResponse: null }), dnskey: evidence({ records: [record("257 3 13 LONGKEY", "DNSKEY")] }) },
    ],
  });
  await page.route("**/api/dns/dnssec-checker", (route) => fulfill(route, fixture));
  await page.goto("/dnssec-checker");
  await submit(page);

  await expect(page.getByText("The requested evidence lookup failed.", { exact: true })).toHaveCount(1);
  await page.getByRole("button", { name: "DS and DNSKEY evidence by zone" }).click();
  const zoneEvidence = page.locator("[data-zone-evidence]");
  await expect(zoneEvidence.getByRole("heading", { name: ". zone", exact: true })).toBeVisible();
  await expect(zoneEvidence.getByText("No DNSKEY records were returned.", { exact: true })).toBeVisible();
  await expect(zoneEvidence.getByText("DS lookup failed.", { exact: true })).toBeVisible();
  await expect(zoneEvidence.getByRole("table", { name: "DNSKEY records for example.com" })).toBeVisible();
  await expect(page.locator("[data-dnssec-verdict]")).toBeVisible();
});

test("downloads the complete result without rendering the complete validator report", async ({ page }) => {
  await page.route("**/api/dns/dnssec-checker", (route) => fulfill(route, result()));
  await page.goto("/dnssec-checker");
  await submit(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("example.com-A-dnssec-report.json");
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({ tool: "DNSSEC Chain Checker", validator: { rawReport: { private: "download only" } } });
  await expect(page.getByText("Complete validator report", { exact: true })).toHaveCount(0);
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long expanded evidence at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 375 ? 820 : 950 });
      const longName = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}.com`;
      const longValue = `"${"v".repeat(4094)}"`;
      const fixture = result({
        query: { name: longName, recordType: "TXT" },
        validation: { outcome: "secure-positive", steps: [{ kind: "answer", qname: longName, qtype: "TXT", ok: true, detail: `Validated ${longName}.` }] },
        answer: evidence({ records: [record(longValue, "TXT", longName)], rawResponse: { Status: 0, Answer: [{ data: "x".repeat(11_000) }] } }),
        signatures: [{ ownerName: longName, queryName: longName, queryType: "TXT", typeCovered: "TXT", algorithm: 14, algorithmName: "ECDSAP384SHA384", keyTag: 65535, signerName: longName, inception: "2026-09-01T00:00:00.000Z", expiration: "2026-09-12T00:00:00.000Z", status: "valid", secondsRemaining: 600000 }],
        chain: [{ zone: longName, ds: evidence({ records: [record(`65535 14 2 ${"A".repeat(256)}`, "DS", longName)] }), dnskey: evidence({ records: [record(`257 3 14 ${"K".repeat(2048)}`, "DNSKEY", longName)] }) }],
      });
      await page.route("**/api/dns/dnssec-checker", (route) => fulfill(route, fixture));
      await page.goto("/dnssec-checker");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await page.getByLabel("Domain or hostname").fill(longName);
      await chooseRecordType(page, "TXT");
      await page.getByRole("button", { name: "Validate DNSSEC" }).click();
      await page.getByRole("button", { name: "Raw requested answer" }).click();
      await page.getByRole("button", { name: "DS and DNSKEY evidence by zone" }).click();

      const documentWidth = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      const overflowOwners = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return {
            className: element.className,
            right: Math.round(bounds.right),
            scrollWidth: element.scrollWidth,
            tag: element.tagName,
          };
        })
        .filter((item) => item.right > document.documentElement.clientWidth + 1)
        .sort((left, right) => right.right - left.right)
        .slice(0, 8));
      expect(documentWidth.scroll, JSON.stringify(overflowOwners)).toBeLessThanOrEqual(documentWidth.client);
      const raw = page.locator("[data-requested-raw]");
      await expect(raw).toBeVisible();
      const rawWidth = await raw.evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
      expect(rawWidth.scroll).toBeGreaterThanOrEqual(rawWidth.client);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    });
  }
}
