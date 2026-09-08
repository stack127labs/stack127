import { expect, test, type Page, type Route } from "playwright/test";

function registration(overrides: Record<string, unknown> = {}) {
  return {
    query: { input: "example.com", domain: "example.com", unicode: "example.com", tld: "com", tldType: "generic", suffix: "com", reduced: false, isIdn: false, guessedSuffix: false },
    coverage: { source: "iana_bootstrap", operator: "Verisign", url: "https://rdap.verisign.com/com/v1/", unknownTld: false },
    status: "registered",
    checkedAt: "2026-09-05T10:00:00.000Z",
    durationMs: 120,
    registrationDate: "1995-08-14T04:00:00.000Z",
    reregistrationDate: null,
    registryExpiryDate: "2027-08-13T04:00:00.000Z",
    registrarExpiryDate: null,
    lastChangedDate: null,
    transferDate: null,
    lockedDate: null,
    registryDatabaseUpdated: "2026-09-04T08:30:00.000Z",
    events: [],
    statuses: [{ rdap: "redemption period", epp: "redemptionPeriod", known: true }],
    nameservers: [],
    dnssecSigned: null,
    dsRecordCount: null,
    registrar: { name: "Example Registrar", ianaId: "999", abuseEmail: null, abusePhone: null, url: null, rdapUrl: null },
    entities: [],
    redactions: [],
    redactionDeclared: false,
    registryFetch: {
      status: "registered",
      httpStatus: 200,
      url: "https://rdap.verisign.com/com/v1/domain/example.com",
      source: "registry",
      body: { objectClassName: "domain", evidence: "x".repeat(4_000) },
      error: null,
      fetchedAt: "2026-09-05T09:59:00.000Z",
      fromCache: true,
    },
    registrarFetch: null,
    notes: [],
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function submit(page: Page, name = "example.com") {
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await page.getByRole("textbox", { name: /Domain name/ }).fill(name);
  await page.getByRole("button", { name: "Check domain availability" }).click();
}

test("keeps URL state deliberate and focuses one required-field error", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/domain/lookup", (route) => {
    requests += 1;
    return fulfill(route, registration());
  });

  await page.goto("/domain-availability");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(page).toHaveURL(/\/domain-availability$/);
  await page.getByRole("button", { name: "Check domain availability" }).click();

  const input = page.getByRole("textbox", { name: /Domain name/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain name, including the ending.", { exact: true })).toHaveCount(1);
  expect(requests).toBe(0);

  await page.goto("/domain-availability?name=example.com");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(input).toHaveValue("example.com");
  await expect(page).toHaveURL(/\?name=example\.com$/);
  expect(requests).toBe(0);
});

test("registered results keep one verdict, contracted facts, and contained evidence", async ({ page }) => {
  await page.route("**/api/domain/lookup", (route) => fulfill(route, registration()));
  await page.setViewportSize({ width: test.info().project.name === "mobile" ? 320 : 1440, height: 900 });
  await page.goto("/domain-availability");
  await submit(page);

  const result = page.getByRole("region", { name: "Domain availability result" });
  const lead = page.getByRole("status", { name: "Registry result" });
  await expect(lead).toContainText("Registered");
  await expect(lead).toContainText("example.com has a current registry record.");
  await expect(result.getByText("Registered", { exact: true })).toHaveCount(2);
  const facts = page.getByRole("heading", { name: "Registration facts" }).locator("..");
  await expect(facts).toContainText("14 August 1995");
  await expect(facts).toContainText("13 August 2027");
  await expect(facts).toContainText("Example Registrar");
  await expect(facts).toContainText("Redemption period");
  await expect(page.getByRole("link", { name: "Check the domain expiry and lifecycle" })).toHaveAttribute("href", "/domain-expiry?name=example.com");
  await expect(page.getByText("rdap.verisign.com", { exact: true })).toHaveCount(1);
  await expect(page.getByText("5 September 2026, cached", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Registry response/ })).toHaveAttribute("aria-expanded", "false");

  await page.getByRole("button", { name: /Registry response/ }).click();
  const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBe(widths.client);

  if (test.info().project.name === "mobile") {
    await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
    await page.getByRole("button", { name: "Switch to light mode" }).focus();
    await page.getByRole("button", { name: "Switch to light mode" }).press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const lightWidths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    const overflowOwners = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          className: element.className,
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
          scrollWidth: element.scrollWidth,
          tag: element.tagName,
          text: element.textContent?.trim().slice(0, 60),
          width: Math.round(bounds.width),
        };
      })
      .filter((item) => item.right > document.documentElement.clientWidth + 1 && item.right < 1_000)
      .sort((left, right) => right.right - left.right)
      .slice(0, 8));
    expect(lightWidths.scroll, JSON.stringify(overflowOwners)).toBe(lightWidths.client);
  } else {
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  }
});

test("a missing record is not presented as guaranteed availability", async ({ page }) => {
  const missing = registration({
    status: "not_registered",
    registrationDate: null,
    registryExpiryDate: null,
    registryDatabaseUpdated: null,
    statuses: [],
    registrar: { name: null, ianaId: null, abuseEmail: null, abusePhone: null, url: null, rdapUrl: null },
    registryFetch: { ...registration().registryFetch, status: "not_registered", httpStatus: 404, body: null },
  });
  await page.route("**/api/domain/lookup", (route) => fulfill(route, missing));
  await page.goto("/domain-availability");
  await submit(page);

  const lead = page.getByRole("status", { name: "Registry result" });
  await expect(lead).toContainText("No registration found");
  await expect(lead).toContainText("reserved, blocked, premium-priced, or newly released");
  await expect(page.getByRole("heading", { name: "Registration facts" })).toHaveCount(0);
  expect((await lead.innerText()).toLowerCase()).not.toContain("available");
});

test("all registry failures remain inconclusive and preserve the input", async ({ page }) => {
  let current = registration();
  await page.route("**/api/domain/lookup", (route) => fulfill(route, current));
  await page.goto("/domain-availability");

  for (const status of ["no_service", "rate_limited", "blocked", "timeout", "registry_error"] as const) {
    current = registration({
      status,
      registryFetch: { ...registration().registryFetch, status, body: null, error: "Provider detail" },
    });
    await submit(page, `${status.replace("_", "-")}.example`);
    await expect(page.getByRole("status", { name: "Registry result" })).toContainText("Cannot determine");
    await expect(page.getByRole("textbox", { name: /Domain name/ })).toHaveValue(`${status.replace("_", "-")}.example`);
    await expect(page.getByRole("region", { name: "Domain availability result" }).getByText("No registration found", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Domain availability result" }).getByRole("link", { name: "TLD directory" })).toHaveCount(status === "no_service" ? 1 : 0);
  }
});

test("later loading clears stale evidence, blocks duplicate requests, and renders client failure", async ({ page }) => {
  let requests = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/domain/lookup", async (route) => {
    requests += 1;
    if (requests === 1) return fulfill(route, registration());
    await new Promise<void>((resolve) => { release = resolve; });
    return fulfill(route, { error: { message: "The domain check could not be completed." } }, 503);
  });
  await page.goto("/domain-availability");
  await submit(page);
  await expect(page.getByRole("status", { name: "Registry result" })).toContainText("Registered");

  await page.getByRole("textbox", { name: /Domain name/ }).fill("changed.example");
  await page.getByRole("button", { name: "Check domain availability" }).click();
  await expect(page.getByRole("button", { name: "Checking domain availability..." })).toBeDisabled();
  await expect(page.getByRole("status", { name: "Registry result" })).toHaveCount(0);
  await page.getByRole("textbox", { name: /Domain name/ }).press("Enter");
  expect(requests).toBe(2);
  release?.();

  const lead = page.getByRole("status", { name: "Registry result" });
  await expect(lead).toContainText("Cannot determine");
  await expect(lead).toContainText("The domain check could not be completed.");
  await expect(page.getByRole("textbox", { name: /Domain name/ })).toHaveValue("changed.example");
});
