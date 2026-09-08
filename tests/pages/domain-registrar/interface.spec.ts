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
    roles: ["registrar"],
    source,
    stateProvince: null,
    ...overrides,
  };
}

function registration(overrides: Record<string, unknown> = {}) {
  const longHost = `registrar-${"evidence-".repeat(16)}example.test`;
  return {
    checkedAt: "2026-09-05T10:00:00.000Z",
    coverage: { operator: "Verisign", source: "iana_bootstrap", unknownTld: false, url: "https://rdap.verisign.com/com/v1/" },
    dnssecSigned: null,
    dsRecordCount: null,
    durationMs: 120,
    entities: [
      entity("registry", { handle: "999", name: "Example Registrar" }),
      entity("registrar", { fields: [{ label: "Website", value: `https://${longHost}/account` }], handle: "999", name: "Example Registrar Legal Name" }),
      entity("registry", { email: `abuse-${"long-".repeat(30)}@example.test`, roles: ["abuse"] }),
      entity("registrar", { name: "Example Reseller", roles: ["reseller"] }),
    ],
    events: [
      { action: "transfer", date: "2025-01-02T00:00:00.000Z", source: "registry" },
      { action: "last changed", date: "2026-08-01T00:00:00.000Z", source: "registry" },
    ],
    lastChangedDate: "2026-08-01T00:00:00.000Z",
    lockedDate: null,
    nameservers: [],
    notes: ["A provider returned one qualification."],
    query: { domain: "example.com", guessedSuffix: false, input: "example.com", isIdn: false, reduced: false, suffix: "com", tld: "com", tldType: "generic", unicode: "example.com" },
    redactionDeclared: false,
    redactions: [],
    registrar: { abuseEmail: `abuse-${"long-".repeat(30)}@example.test`, abusePhone: "+1.5550100", ianaId: "999", name: "Example Registrar", rdapUrl: `https://${longHost}/domain/example.com`, url: `https://${longHost}/account` },
    registrarExpiryDate: null,
    registrarFetch: {
      body: { evidence: "r".repeat(4_000), objectClassName: "domain", registrarMarker: true },
      error: null,
      fetchedAt: "2026-09-05T09:01:00.000Z",
      fromCache: true,
      httpStatus: 200,
      source: "registrar",
      status: "registered",
      url: `https://${longHost}/domain/example.com`,
    },
    registrationDate: null,
    registryDatabaseUpdated: null,
    registryExpiryDate: null,
    registryFetch: {
      body: { evidence: "x".repeat(4_000), objectClassName: "domain", registryMarker: true },
      error: null,
      fetchedAt: "2026-09-05T09:00:00.000Z",
      fromCache: false,
      httpStatus: 200,
      source: "registry",
      status: "registered",
      url: "https://rdap.verisign.com/com/v1/domain/example.com",
    },
    reregistrationDate: null,
    status: "registered",
    statuses: [],
    transferDate: "2025-01-02T00:00:00.000Z",
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function submit(page: Page, name = "example.com") {
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await page.getByRole("textbox", { name: /Domain name/ }).fill(name);
  await page.getByRole("button", { name: "Find the registrar" }).click();
}

test("keeps URL state deliberate and focuses one required-field error", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/domain/lookup", (route) => {
    requests += 1;
    return fulfill(route, registration());
  });

  await page.goto("/domain-registrar");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(page).toHaveURL(/\/domain-registrar$/);
  await page.getByRole("button", { name: "Find the registrar" }).click();

  const input = page.getByRole("textbox", { name: /Domain name/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain name, including the ending.", { exact: true })).toHaveCount(1);
  expect(requests).toBe(0);

  await page.goto("/domain-registrar?name=example.com");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(input).toHaveValue("example.com");
  await expect(page).toHaveURL(/\?name=example\.com$/);
  expect(requests).toBe(0);
});

test("shows one registrar answer with sourced contacts, roles, dates, and evidence", async ({ page }) => {
  await page.route("**/api/domain/lookup", (route) => fulfill(route, registration()));
  await page.goto("/domain-registrar");
  await submit(page);

  const result = page.getByRole("region", { name: "Registrar result" });
  const lead = page.getByRole("status", { name: "Registrar" });
  await expect(lead).toContainText("Example Registrar");
  await expect(lead).toContainText("manages example.com");
  const details = result.getByRole("heading", { name: "Registrar contacts and identifiers" }).locator("..");
  await expect(details).toContainText("999");
  await expect(details).toContainText("Registry and registrar");
  await expect(details.getByRole("link", { name: /registrar-evidence/ }).first()).toHaveAttribute("rel", "nofollow noreferrer");
  await expect(details.getByRole("link", { name: /abuse-long/ })).toHaveAttribute("href", /^mailto:/);

  const roles = result.getByRole("list", { name: "Registry, registrar, reseller, and registrant account roles" });
  await expect(roles).toContainText("Verisign");
  await expect(roles).toContainText("Example Reseller");
  await expect(result.getByRole("table", { name: "Registrar transfer and record-change dates" })).toContainText("2 January 2025");
  await expect(result.getByRole("link", { name: "Check domain transfer readiness" })).toHaveAttribute("href", "/transfer-readiness?name=example.com");
  const freshness = result.locator('dl[aria-label="Source freshness"]');
  await expect(freshness).toContainText("Live response");
  await expect(freshness).toContainText("Cached");

  await result.getByRole("button", { name: "Lookup notes" }).click();
  await expect(result.getByText("A provider returned one qualification.", { exact: true })).toBeVisible();
  await result.getByRole("button", { name: /Registry response from rdap\.verisign\.com/ }).click();
  await expect(result.getByText(/"registryMarker": true/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await result.getByRole("button", { name: "Download report" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("example.com-registrar.json");
});

test("keeps absent, conflicting, no-record, no-service, and partial states distinct", async ({ page }) => {
  const base = registration();
  const unidentified = registration({ entities: [], registrar: { ...base.registrar, name: null, url: null }, registrarFetch: null });
  const conflict = registration({ entities: [...base.entities, entity("registrar", { handle: "123", name: "Different Registrar" })] });
  const noRecord = registration({ entities: [], registrar: { abuseEmail: null, abusePhone: null, ianaId: null, name: null, rdapUrl: null, url: null }, registrarFetch: null, status: "not_registered" });
  const noService = registration({ entities: [], registrar: { abuseEmail: null, abusePhone: null, ianaId: null, name: null, rdapUrl: null, url: null }, registrarFetch: null, status: "no_service" });
  const partial = registration({ registrarFetch: { ...base.registrarFetch, body: null, error: "Timed out", status: "timeout" } });
  const responses = [unidentified, conflict, noRecord, noService, partial];
  let index = 0;
  await page.route("**/api/domain/lookup", (route) => fulfill(route, responses[index++]));
  await page.goto("/domain-registrar");

  await submit(page);
  await expect(page.getByRole("status", { name: "Registrar" })).toContainText("Not published");
  await expect(page.getByRole("status", { name: "Registrar" })).toContainText("registrar ID 999");

  await submit(page);
  await expect(page.getByRole("status", { name: "Registrar" })).toContainText("Cannot determine");
  await expect(page.getByRole("heading", { name: "Next steps" })).toHaveCount(0);

  await submit(page);
  await expect(page.getByRole("status", { name: "Registrar" })).toContainText("No registrar");
  await expect(page.getByRole("heading", { name: "Who does what" })).toHaveCount(0);

  await submit(page);
  await expect(page.getByRole("status", { name: "Registrar" })).toContainText("no known RDAP service");
  await expect(page.getByRole("region", { name: "Registrar result" }).getByRole("link", { name: "TLD directory" })).toBeVisible();

  await submit(page);
  await expect(page.getByRole("status", { name: "Registrar" })).toContainText("Example Registrar");
  await expect(page.getByText("The registrar response failed.", { exact: false })).toHaveCount(1);
});

test("clears stale evidence, blocks duplicate requests, and renders client failure", async ({ page }) => {
  let requests = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/domain/lookup", async (route) => {
    requests += 1;
    if (requests === 1) return fulfill(route, registration());
    await new Promise<void>((resolve) => { release = resolve; });
    return fulfill(route, { error: { message: "The registrar service is unavailable." } }, 503);
  });
  await page.goto("/domain-registrar");
  await submit(page);
  await expect(page.getByRole("status", { name: "Registrar" })).toContainText("Example Registrar");

  await page.getByRole("textbox", { name: /Domain name/ }).fill("changed.example");
  await page.getByRole("button", { name: "Find the registrar" }).click();
  await expect(page.getByRole("button", { name: "Finding the registrar..." })).toBeDisabled();
  await expect(page.getByRole("status", { name: "Registrar" })).toHaveCount(0);
  await page.getByRole("textbox", { name: /Domain name/ }).press("Enter");
  expect(requests).toBe(2);
  release?.();

  const result = page.getByRole("region", { name: "Registrar result" });
  await expect(result.getByRole("status", { name: "Registrar" })).toContainText("Cannot determine");
  await expect(result.getByRole("alert")).toHaveText("The registrar service is unavailable.");
  await expect(page.getByRole("textbox", { name: /Domain name/ })).toHaveValue("changed.example");
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long registrar values at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.route("**/api/domain/lookup", (route) => fulfill(route, registration()));
      await page.setViewportSize({ height: 900, width });
      await page.goto("/domain-registrar");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await submit(page);
      await page.getByRole("button", { name: /Registry response from rdap\.verisign\.com/ }).click();
      await page.getByRole("button", { name: /Registrar response from registrar-evidence/ }).click();
      if (width === 320) await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
      const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          return { className: String(element.className), left: Math.round(bounds.left), right: Math.round(bounds.right), tag: element.tagName, text: element.textContent?.trim().slice(0, 50), width: Math.round(bounds.width) };
        })
        .filter((item) => item.right > document.documentElement.clientWidth + 1 && item.right < 1_000)
        .sort((left, right) => right.right - left.right)
        .slice(0, 12));
      expect(widths.scroll, JSON.stringify(overflow)).toBe(widths.client);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    });
  }
}
