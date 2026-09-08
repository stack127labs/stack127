import { expect, test } from "playwright/test";

test("labels registrar fallback facts with their actual source", async ({ page }) => {
  const registryFetch = {
    body: { nameservers: [], secureDNS: {}, status: [] },
    error: null,
    fetchedAt: "2026-09-05T09:00:00Z",
    fromCache: false,
    httpStatus: 200,
    source: "registry",
    status: "registered",
    url: "https://rdap.registry.test/domain/example.com",
  };
  const registrarFetch = {
    body: {
      nameservers: [{ ldhName: "ns1.example.net" }],
      secureDNS: { delegationSigned: true },
      status: ["client transfer prohibited"],
    },
    error: null,
    fetchedAt: "2026-09-05T09:01:00Z",
    fromCache: false,
    httpStatus: 200,
    source: "registrar",
    status: "registered",
    url: "https://rdap.registrar.test/domain/example.com",
  };
  const result = {
    checkedAt: "2026-09-05T10:00:00Z",
    coverage: { operator: null, source: "iana_bootstrap", unknownTld: false, url: null },
    dnssecSigned: true,
    dsRecordCount: null,
    durationMs: 100,
    entities: [],
    events: [],
    lastChangedDate: null,
    lockedDate: null,
    nameservers: [{ addresses: [], hostname: "ns1.example.net" }],
    notes: [],
    query: { domain: "example.com", guessedSuffix: false, input: "example.com", isIdn: false, reduced: false, suffix: "com", tld: "com", unicode: "example.com" },
    redactionDeclared: false,
    redactions: [],
    registrar: { abuseEmail: null, abusePhone: null, ianaId: null, name: null, rdapUrl: registrarFetch.url, url: null },
    registrarExpiryDate: null,
    registrarFetch,
    registrationDate: null,
    registryDatabaseUpdated: null,
    registryExpiryDate: null,
    registryFetch,
    reregistrationDate: null,
    status: "registered",
    statuses: [{ epp: "clientTransferProhibited", known: true, rdap: "client transfer prohibited" }],
    transferDate: null,
  };

  await page.route("**/api/domain/lookup", (route) => route.fulfill({
    body: JSON.stringify(result),
    contentType: "application/json",
    status: 200,
  }));
  await page.goto("/domain-lookup");
  await page.getByLabel("Domain name").fill("example.com");
  await page.getByLabel("Domain name").press("Enter");

  const statusRow = page.getByRole("table", { name: "Registration status codes" }).getByRole("row").nth(1);
  const nameserverRow = page.getByRole("table", { name: "Nameservers on record" }).getByRole("row").nth(1);
  const dnssec = page.getByRole("heading", { name: "DNSSEC delegation" }).locator("xpath=..");
  await expect(statusRow.getByRole("cell").last()).toHaveText("Registrar");
  await expect(nameserverRow.getByRole("cell").last()).toHaveText("Registrar");
  await expect(dnssec.getByText("Registrar", { exact: true })).toBeVisible();

  const sourceMap = page.getByRole("figure", { name: "Sources contributing to the current registration record" });
  await expect(sourceMap).toContainText("Registrar");
  await expect(sourceMap).toContainText("status, nameservers, DNSSEC");
});
