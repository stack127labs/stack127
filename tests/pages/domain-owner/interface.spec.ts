import { expect, test, type Page, type Route } from "playwright/test";

function entity(source: "registry" | "registrar", overrides: Record<string, unknown> = {}) {
  return {
    contactUri: null,
    country: null,
    email: null,
    fields: [],
    handle: null,
    name: null,
    organization: null,
    phone: null,
    roles: ["registrant"],
    source,
    stateProvince: null,
    ...overrides,
  };
}

function registration(overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-09-05T10:00:00.000Z",
    coverage: { operator: "Verisign", source: "iana_bootstrap", unknownTld: false, url: "https://rdap.verisign.com/com/v1/" },
    dnssecSigned: null,
    dsRecordCount: null,
    durationMs: 120,
    entities: [
      entity("registry", {
        email: "relay@example.test",
        fields: [{ label: "Organization", value: "Example Ltd" }, { label: "Email", value: "relay@example.test" }],
        organization: "Example Ltd",
      }),
      entity("registrar", {
        contactUri: "https://contact.example.test/" + "path/".repeat(40),
        fields: [{ label: "Organization", value: "Example Ltd" }],
        organization: "Example Ltd",
      }),
      entity("registrar", { email: "abuse@example.test", roles: ["abuse"] }),
    ],
    events: [],
    lastChangedDate: null,
    lockedDate: null,
    nameservers: [],
    notes: ["One provider returned a qualification that is not repeated elsewhere."],
    query: { domain: "example.com", guessedSuffix: false, input: "example.com", isIdn: false, reduced: false, suffix: "com", tld: "com", tldType: "generic", unicode: "example.com" },
    redactionDeclared: true,
    redactions: [],
    registrar: { abuseEmail: "abuse@example.test", abusePhone: null, ianaId: "999", name: "Example Registrar", rdapUrl: "https://rdap.registrar.test/", url: null },
    registrarExpiryDate: null,
    registrarFetch: {
      body: { rdapConformance: ["rdap_level_0", "redacted"], redacted: [{ method: "emptyValue", name: { type: "Registrant Email" } }] },
      error: null,
      fetchedAt: "2026-09-05T09:01:00.000Z",
      fromCache: true,
      httpStatus: 200,
      source: "registrar",
      status: "registered",
      url: "https://rdap.registrar.test/domain/example.com",
    },
    registrationDate: null,
    registryDatabaseUpdated: null,
    registryExpiryDate: null,
    registryFetch: {
      body: { evidence: "x".repeat(4_000), objectClassName: "domain" },
      error: null,
      fetchedAt: "2026-09-05T09:00:00.000Z",
      fromCache: false,
      httpStatus: 200,
      source: "registry",
      status: "registered",
      url: "https://rdap.registry.test/domain/example.com",
    },
    reregistrationDate: null,
    status: "registered",
    statuses: [],
    transferDate: null,
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function submit(page: Page, name = "example.com") {
  const input = page.getByRole("textbox", { name: /Domain name/ });
  await input.fill(name);
  await page.getByRole("button", { name: "Look up the registrant" }).click();
}

test("keeps clean URL state and focuses one precise validation error", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/domain/lookup", (route) => {
    requests += 1;
    return fulfill(route, registration());
  });
  await page.goto("/domain-owner");
  await expect(page).toHaveURL(/\/domain-owner$/);
  await page.getByRole("button", { name: "Look up the registrant" }).click();

  const input = page.getByRole("textbox", { name: /Domain name/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain name, including the ending.", { exact: true })).toHaveCount(1);
  expect(requests).toBe(0);

  await page.goto("/domain-owner?name=example.com");
  await expect(input).toHaveValue("example.com");
  await expect(page).toHaveURL(/\?name=example\.com$/);
  expect(requests).toBe(0);
});

test("shows one published verdict with sourced contact, redaction, and raw evidence", async ({ page }) => {
  await page.route("**/api/domain/lookup", (route) => fulfill(route, registration()));
  await page.goto("/domain-owner");
  await submit(page);

  const result = page.getByRole("region", { name: "Domain registrant result" });
  const lead = page.getByRole("status", { name: "Public registrant information" });
  await expect(lead).toContainText("Published");
  await expect(lead).toContainText("Example Ltd");
  await expect(result.getByText("Published", { exact: true })).toHaveCount(1);

  const sourceMap = page.getByRole("figure", { name: "Registry and registrar contributions to the public registrant record" });
  await expect(sourceMap).toContainText("rdap.registry.test");
  await expect(sourceMap).toContainText("rdap.registrar.test");
  await expect(page.getByRole("link", { name: "relay@example.test" })).toHaveAttribute("href", "mailto:relay@example.test");
  await expect(page.getByRole("link", { name: /contact\.example\.test/ })).toHaveAttribute("rel", "nofollow noreferrer");
  await expect(page.getByRole("table", { name: "Published domain contact fields" })).toContainText("Registry and registrar");
  await expect(page.getByRole("table", { name: "Declared domain contact redactions" })).toContainText("emptyValue");
  await expect(page.getByRole("link", { name: "Request nonpublic gTLD data through ICANN" })).toHaveCount(0);

  await page.getByRole("button", { name: "Lookup notes" }).click();
  await expect(page.getByText("One provider returned a qualification that is not repeated elsewhere.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Registry response from rdap\.registry\.test/ }).click();
  await expect(page.getByText(/"objectClassName": "domain"/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("example.com-registrant.json");
});

test("keeps unpublished, no-record, partial-hop, and request-failure states distinct", async ({ page }) => {
  const emptyEntities = [entity("registrar", { contactUri: "https://contact.example.test/form" })];
  const noRecordRegistrar = { abuseEmail: null, abusePhone: null, ianaId: null, name: null, rdapUrl: null, url: null };
  const responses = [
    registration({ entities: emptyEntities }),
    registration({ entities: [], registrar: noRecordRegistrar, registrarFetch: null, status: "not_registered" }),
    registration({ entities: [], registrarFetch: { ...registration().registrarFetch, body: null, error: "Timed out", status: "timeout" } }),
  ];
  let index = 0;
  await page.route("**/api/domain/lookup", (route) => fulfill(route, responses[index++]));
  await page.goto("/domain-owner");

  await submit(page);
  let lead = page.getByRole("status", { name: "Public registrant information" });
  await expect(lead).toContainText("Not published");
  await expect(page.getByRole("link", { name: "Request nonpublic gTLD data through ICANN" })).toBeVisible();

  await submit(page);
  lead = page.getByRole("status", { name: "Public registrant information" });
  await expect(lead).toContainText("No registrant");
  await expect(page.getByRole("heading", { name: "What is published" })).toHaveCount(0);

  await submit(page);
  lead = page.getByRole("status", { name: "Public registrant information" });
  await expect(lead).toContainText("Cannot determine");
  await expect(lead).toContainText("Retry before treating the data as unpublished");
  await expect(page.getByText("The registrar response failed.", { exact: false })).toHaveCount(1);

  await page.unroute("**/api/domain/lookup");
  await page.route("**/api/domain/lookup", (route) => fulfill(route, { error: { message: "The registrant service is unavailable." } }, 503));
  await submit(page, "changed.example");
  lead = page.getByRole("status", { name: "Public registrant information" });
  await expect(lead).toContainText("Cannot determine");
  await expect(page.getByText("The registrant service is unavailable.", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("textbox", { name: /Domain name/ })).toHaveValue("changed.example");
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long contact and evidence values at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.route("**/api/domain/lookup", (route) => fulfill(route, registration()));
      await page.setViewportSize({ height: 900, width });
      await page.goto("/domain-owner");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await submit(page);
      await page.getByRole("button", { name: /Registry response from rdap\.registry\.test/ }).click();
      await page.getByRole("button", { name: /Registrar response from rdap\.registrar\.test/ }).click();
      const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(widths.scroll).toBe(widths.client);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    });
  }
}
