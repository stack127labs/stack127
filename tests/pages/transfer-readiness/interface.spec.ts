import { expect, test, type Page, type Route } from "playwright/test";

const longHost = `${"authoritative-nameserver-".repeat(8)}example.net`;

const policy = {
  afterRegistrantChangeDays: 60,
  afterRegistrationDays: 60,
  afterTransferDays: 60,
  effectiveDate: "2016-12-01",
  id: "2016-transfer-policy",
  label: "Transfer Policy in force today",
  note: "Current ICANN transfer policy.",
  source: "https://www.icann.org/en/contracted-parties/accredited-registrars/resources/domain-name-transfers/policy",
  verifiedAt: "2026-07-28",
};

const pendingPolicyChange = {
  afterRegistrantChangeDays: null,
  afterRegistrationDays: 30,
  afterTransferDays: 30,
  effectiveDate: null,
  id: "2026-transfer-policy-review",
  label: "Adopted, waiting to be implemented",
  note: "No effective date is published.",
  source: "https://www.icann.org/en/board-activities-and-meetings/materials/approved-resolutions-regular-meeting-of-the-icann-board-07-06-2026-en",
  verifiedAt: "2026-07-28",
};

function registration(overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-09-05T10:00:00.000Z",
    coverage: { operator: "Verisign", source: "iana_bootstrap", unknownTld: false, url: "https://rdap.verisign.com/com/v1/" },
    dnssecSigned: true,
    dsRecordCount: 2,
    durationMs: 120,
    entities: [],
    events: [],
    lastChangedDate: null,
    lockedDate: null,
    nameservers: [{ addresses: [], hostname: longHost }, { addresses: [], hostname: "ns2.example.net" }],
    notes: [],
    query: { domain: "example.com", guessedSuffix: false, input: "https://www.example.com/path", isIdn: false, reduced: true, suffix: "com", tld: "com", tldType: "generic", unicode: "example.com" },
    redactionDeclared: false,
    redactions: [],
    registrar: { abuseEmail: null, abusePhone: null, ianaId: "999", name: "Example Registrar", rdapUrl: null, url: null },
    registrarExpiryDate: null,
    registrarFetch: {
      body: { evidence: "r".repeat(4_000), objectClassName: "domain", sourceMarker: "registrar" },
      error: null,
      fetchedAt: "2026-09-05T09:01:00.000Z",
      fromCache: true,
      httpStatus: 200,
      source: "registrar",
      status: "registered",
      url: "https://rdap.registrar.test/domain/example.com",
    },
    registrationDate: "2026-08-20T00:00:00.000Z",
    registryDatabaseUpdated: "2026-09-05T08:00:00.000Z",
    registryExpiryDate: "2026-09-12T00:00:00.000Z",
    registryFetch: {
      body: { evidence: "x".repeat(4_000), objectClassName: "domain", sourceMarker: "registry" },
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
    statuses: [{ epp: "clientTransferProhibited", known: true, rdap: "client transfer prohibited" }],
    transferDate: null,
    ...overrides,
  };
}

function findings() {
  return [
    { detail: "Registrar lock detail.", evidence: "client transfer prohibited", id: "client-lock", selfServiceable: true, state: "blocked", title: "Registrar transfer lock" },
    { detail: "Registry lock detail.", evidence: "server transfer prohibited", id: "server-lock", selfServiceable: false, state: "blocked", title: "Registry transfer lock" },
    { detail: "No pending transfer.", evidence: null, id: "pending-transfer", selfServiceable: false, state: "clear", title: "Pending transfer" },
    { detail: "No lifecycle block.", evidence: null, id: "lifecycle", selfServiceable: false, state: "clear", title: "Deletion lifecycle" },
    { detail: "Registered 16 days ago. About 44 days remain.", evidence: "2026-08-20T00:00:00.000Z", id: "registration-lock", selfServiceable: false, state: "blocked", title: "Time since it was registered" },
    { detail: "The registry does not publish a transfer date.", evidence: null, id: "transfer-lock", selfServiceable: false, state: "unknown", title: "Time since the last transfer" },
    { detail: "It expires in 7 days.", evidence: "2026-09-12T00:00:00.000Z", id: "expiry", selfServiceable: true, state: "risk", title: "How close it is to expiring" },
    { detail: "DNSSEC needs coordination.", evidence: "delegationSigned: true, 2 DS records", id: "dnssec", selfServiceable: true, state: "risk", title: "DNSSEC is switched on" },
    { detail: "Registration moves, but DNS does not.", evidence: `${longHost}, ns2.example.net`, id: "nameservers", selfServiceable: true, state: "risk", title: "Where DNS is hosted" },
  ];
}

function result(overrides: Record<string, unknown> = {}) {
  return {
    cannotCheck: [
      "Can you sign in and reach transfer controls?",
      "Can you obtain the authorization code?",
      "Can the registrant receive the approval email?",
      "Are there private balance, verification, or account locks?",
      "Did the registrant change recently?",
      "Does the registrar require another transfer-out step?",
    ],
    findings: findings(),
    pendingPolicyChange,
    policy,
    registration: registration(),
    summary: "Legacy summary that must not render.",
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function submit(page: Page, name = "example.com") {
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await page.getByRole("textbox", { name: /Domain name/ }).fill(name);
  await page.getByRole("button", { name: "Check transfer readiness" }).click();
}

test("keeps URL state deliberate and focuses one required-field error", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/domain/transfer-readiness", (route) => {
    requests += 1;
    return fulfill(route, result());
  });
  await page.goto("/transfer-readiness");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(page).toHaveURL(/\/transfer-readiness$/);
  await page.getByRole("button", { name: "Check transfer readiness" }).click();
  const input = page.getByRole("textbox", { name: /Domain name/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain name.", { exact: true })).toHaveCount(1);
  expect(requests).toBe(0);

  await page.goto("/transfer-readiness?name=example.com#public-checks");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(input).toHaveValue("example.com");
  await expect(page).toHaveURL(/\?name=example\.com#public-checks$/);
  expect(requests).toBe(0);
});

test("renders one public conclusion, complete checks, policy, account work, and raw evidence", async ({ page }) => {
  await page.route("**/api/domain/transfer-readiness", (route) => fulfill(route, result()));
  await page.goto("/transfer-readiness");
  await submit(page, "https://www.example.com/path");

  const output = page.getByRole("region", { name: "Domain transfer readiness result" });
  await expect(output.locator("[aria-live]")).toContainText("Three public blockers are visible");
  await expect(output.getByText("Legacy summary that must not render.", { exact: true })).toHaveCount(0);
  await expect(output.getByText(/Checked example\.com after reducing/)).toBeVisible();
  const checks = output.locator("ol").first();
  await expect(checks.getByRole("listitem")).toHaveCount(9);
  await expect(checks.getByRole("listitem").first()).toContainText("Registrar transfer lock");
  await expect(checks.getByRole("link", { name: "Explain this status" }).first()).toHaveAttribute("href", "/epp-status-codes");
  await expect(output.getByRole("link", { name: "Check the DNSSEC chain" })).toHaveAttribute("href", "/dnssec-checker?name=example.com");
  await expect(output.getByRole("link", { name: "Check nameserver delegation" })).toHaveAttribute("href", "/nameserver-checker?name=example.com");
  await expect(output.getByRole("heading", { name: "Policy used" }).locator("..")).toContainText("60 days after registration");
  await expect(output.getByRole("heading", { name: "Check in your registrar account" }).locator("..").getByRole("listitem")).toHaveCount(6);
  await expect(output.getByText(/ready to transfer|all clear|can transfer now/i)).toHaveCount(0);

  await output.getByRole("button", { name: /Registry response from rdap\.verisign\.com/ }).click();
  await output.getByRole("button", { name: /Registrar response from rdap\.registrar\.test/ }).click();
  await expect(output.getByText(/"sourceMarker": "registry"/)).toBeVisible();
  await expect(output.getByText(/"sourceMarker": "registrar"/)).toBeVisible();
});

test("keeps no-record, country-code, no-service, and request failure states bounded", async ({ page }) => {
  const responses = [
    result({ registration: registration({ status: "not_registered" }) }),
    result({ registration: registration({ query: { ...registration().query, tld: "uk", tldType: "country-code" } }) }),
    result({ registration: registration({ status: "no_service" }) }),
  ];
  let index = 0;
  await page.route("**/api/domain/transfer-readiness", (route) => fulfill(route, responses[index++]));
  await page.goto("/transfer-readiness");

  await submit(page);
  await expect(page.getByText(/no registry record/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Public checks" })).toHaveCount(0);

  await submit(page, "example.uk");
  const scopeResult = page.getByRole("region", { name: "Domain transfer readiness result" });
  await expect(scopeResult.getByText(/does not govern \.uk/)).toBeVisible();
  await expect(scopeResult.getByText(/60 days|720 hours/)).toHaveCount(0);

  await submit(page, "example.invalid");
  const noServiceResult = page.getByRole("region", { name: "Domain transfer readiness result" });
  await expect(noServiceResult.getByText(/No RDAP service is available/)).toBeVisible();
  await expect(noServiceResult.getByRole("link", { name: "TLD directory", exact: true })).toBeVisible();

  await page.unroute("**/api/domain/transfer-readiness");
  await page.route("**/api/domain/transfer-readiness", (route) => fulfill(route, { error: { message: "The registry service is unavailable." } }, 503));
  await submit(page, "changed.example");
  await expect(page.getByRole("alert").filter({ hasText: "The registry service is unavailable." })).toHaveText("The registry service is unavailable.");
  await expect(page.getByRole("region", { name: "Domain transfer readiness result" })).toHaveCount(0);
});

test("clears stale results, blocks duplicate requests, and announces loading", async ({ page }) => {
  let requests = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/domain/transfer-readiness", async (route) => {
    requests += 1;
    if (requests === 1) return fulfill(route, result());
    await new Promise<void>((resolve) => { release = resolve; });
    return fulfill(route, { error: { message: "The registry timed out." } }, 503);
  });
  await page.goto("/transfer-readiness");
  await submit(page);
  await expect(page.getByRole("region", { name: "Domain transfer readiness result" })).toBeVisible();

  await page.getByRole("textbox", { name: /Domain name/ }).fill("changed.example");
  await page.getByRole("button", { name: "Check transfer readiness" }).click();
  await expect(page.getByRole("button", { name: "Checking transfer readiness..." })).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("Checking public transfer data...");
  await expect(page.getByRole("region", { name: "Domain transfer readiness result" })).toHaveCount(0);
  await expect.poll(() => requests).toBe(2);
  await page.getByRole("textbox", { name: /Domain name/ }).press("Enter");
  expect(requests).toBe(2);
  release?.();
  await expect(page.getByRole("alert").filter({ hasText: "The registry timed out." })).toHaveText("The registry timed out.");
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long transfer evidence at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.route("**/api/domain/transfer-readiness", (route) => fulfill(route, result()));
      await page.setViewportSize({ height: 900, width });
      await page.goto("/transfer-readiness");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await submit(page);
      await page.getByRole("button", { name: /Registry response from rdap\.verisign\.com/ }).click();
      await page.getByRole("button", { name: /Registrar response from rdap\.registrar\.test/ }).click();
      if (width === 320) await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
      const sizes = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { className: String(element.className), clientWidth: element.clientWidth, overflowX: style.overflowX, right: Math.round(bounds.right), scrollWidth: element.scrollWidth, tag: element.tagName, text: element.textContent?.trim().slice(0, 50), whiteSpace: style.whiteSpace, width: Math.round(bounds.width) };
        })
        .filter((item) => item.scrollWidth > item.clientWidth + 1)
        .sort((left, right) => (right.scrollWidth - right.clientWidth) - (left.scrollWidth - left.clientWidth))
        .slice(0, 20));
      expect(sizes.scroll, JSON.stringify(overflow)).toBe(sizes.client);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const tool = page.getByRole("region", { name: "Domain transfer readiness" });
      for (const control of await tool.locator("button, input:not([type=radio])").all()) {
        const box = await control.boundingBox();
        if (box && await control.isVisible()) expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  }
}
