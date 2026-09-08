import { expect, test, type Page, type Route } from "playwright/test";

const longHost = `${"authoritative-nameserver-".repeat(8)}example.net`;

function registration(overrides: Record<string, unknown> = {}) {
  return {
    entities: [],
    nameservers: [{ addresses: [], hostname: longHost }, { addresses: [], hostname: "ns2.example.net" }],
    query: { domain: "example.com", input: "example.com", unicode: "example.com" },
    registrar: { name: "Example Registrar" },
    registrarFetch: {
      fetchedAt: "2026-09-05T09:01:00.000Z",
      fromCache: true,
      url: "https://rdap.registrar.test/domain/example.com",
    },
    registryFetch: {
      fetchedAt: "2026-09-05T09:00:00.000Z",
      fromCache: false,
      url: `https://${"registry-".repeat(24)}example.test/domain/example.com`,
    },
    status: "registered",
    ...overrides,
  };
}

function delegation(overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-09-05T09:02:00.000Z",
    childPublishedNameservers: [longHost, "ns3.example.net"],
    findings: [],
    parentDelegatedNameservers: [longHost, "ns2.example.net"],
    parentZone: "com",
    zone: "example.com",
    ...overrides,
  };
}

function report(overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-09-05T10:00:00.000Z",
    delegation: delegation(),
    delegationError: null,
    durationMs: 180,
    findings: [
      { detail: "Sets differ.", evidence: "registry: hidden duplicate evidence", id: "ns-mismatch", state: "attention", title: "The registry and the live zone list different nameservers", tool: { href: "/nameserver-checker", label: "Nameserver Delegation Checker" } },
      { detail: "Duplicate engine row.", evidence: null, id: "ns-mismatch", state: "attention", title: "Duplicate", tool: null },
      { detail: "A DS record is published.", evidence: "delegationSigned: true, 1 DS record", id: "dnssec-signed", state: "decide", title: "DNSSEC is switched on at the registry", tool: { href: "/dnssec-checker", label: "DNSSEC Chain Checker" } },
      { detail: "Sets agree.", evidence: longHost, id: "ns-match", state: "context", title: "The registry and the live zone agree on nameservers", tool: null },
      { detail: `The provider returned ${"one-long-unbroken-value-".repeat(16)}.`, evidence: null, id: "dns-provider", state: "context", title: "DNS context", tool: null },
    ],
    ranChecks: ["Registration record", "Nameserver delegation"],
    registration: registration(),
    registrationError: null,
    skippedChecks: [],
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
  await page.getByRole("button", { name: "Run the report" }).click();
}

test("keeps URL state deliberate and focuses one required-field error", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/domain/report", (route) => {
    requests += 1;
    return fulfill(route, report());
  });
  await page.goto("/domain-report");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(page).toHaveURL(/\/domain-report$/);
  await page.getByRole("button", { name: "Run the report" }).click();

  const input = page.getByRole("textbox", { name: /Domain name/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain name, including the ending.", { exact: true })).toHaveCount(1);
  expect(requests).toBe(0);

  await page.goto("/domain-report?name=example.com");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(input).toHaveValue("example.com");
  await expect(page).toHaveURL(/\?name=example\.com$/);
  expect(requests).toBe(0);
});

test("renders one coverage-aware summary, source comparison, findings, and report download", async ({ page }) => {
  await page.route("**/api/domain/report", (route) => fulfill(route, report()));
  await page.goto("/domain-report");
  await submit(page);

  const result = page.getByRole("region", { name: "Domain registration report result" });
  const lead = result.locator('[aria-live="polite"]').first();
  await expect(lead).toContainText("The registry and the live zone list different nameservers for example.com.");
  await expect(result.getByText("Legacy summary that must not render.", { exact: true })).toHaveCount(0);

  const coverage = result.getByRole("table", { name: "Registration and nameserver check coverage" });
  await expect(coverage.getByRole("row")).toHaveCount(3);
  await expect(coverage).toContainText("Completed");
  const sources = result.getByRole("list", { name: "Registration, parent, and child nameserver sources" });
  await expect(sources).toContainText("Registration record");
  await expect(sources).toContainText("Parent referral");
  await expect(sources).toContainText("Child zone");
  await expect(sources).toContainText(longHost);
  await expect(result.getByRole("heading", { name: "Needs attention" })).toBeVisible();
  await expect(result.getByRole("heading", { name: "Duplicate" })).toHaveCount(0);
  await expect(result.getByText("registry: hidden duplicate evidence", { exact: true })).toHaveCount(0);
  await expect(result.getByRole("link", { name: "Investigate with Nameserver Delegation Checker" })).toHaveAttribute("href", "/nameserver-checker");
  await expect(result.getByRole("link", { name: "Investigate with DNSSEC Chain Checker" })).toHaveAttribute("href", "/dnssec-checker");
  await expect(result.getByRole("heading", { name: "The registry and the live zone agree on nameservers" })).toHaveCount(0);
  const sourceSnapshot = result.getByRole("heading", { name: "Source snapshot" }).locator("..");
  await expect(sourceSnapshot).toContainText("live response");
  await expect(sourceSnapshot).toContainText("cached");

  const downloadPromise = page.waitForEvent("download");
  await result.getByRole("button", { name: "Download report" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("example.com-report.json");
});

test("keeps no-record, both partial directions, and zero-check reports honest", async ({ page }) => {
  const responses = [
    report({ findings: [], registration: registration({ status: "not_registered" }) }),
    report({ findings: [], ranChecks: ["Nameserver delegation"], registration: null, registrationError: "Registry failed", skippedChecks: [{ name: "Registration record", reason: "Registry failed" }] }),
    report({ delegation: null, delegationError: "DNS timed out", findings: [], ranChecks: ["Registration record"], skippedChecks: [{ name: "Nameserver delegation", reason: "DNS timed out" }] }),
    report({ delegation: null, delegationError: "DNS timed out", findings: [], ranChecks: [], registration: null, registrationError: "Registry failed", skippedChecks: [{ name: "Registration record", reason: "Registry failed" }, { name: "Nameserver delegation", reason: "DNS timed out" }] }),
  ];
  let index = 0;
  await page.route("**/api/domain/report", (route) => fulfill(route, responses[index++]));
  await page.goto("/domain-report");

  await submit(page);
  await expect(page.getByRole("region", { name: "Domain registration report result" }).locator('[aria-live="polite"]').first()).toContainText("does not prove the name is available");

  await submit(page);
  await expect(page.getByRole("region", { name: "Domain registration report result" }).locator('[aria-live="polite"]').first()).toContainText("registration check is unavailable");

  await submit(page);
  await expect(page.getByRole("region", { name: "Domain registration report result" }).locator('[aria-live="polite"]').first()).toContainText("no live DNS conclusion");

  await submit(page);
  const empty = page.getByRole("region", { name: "Domain registration report result" });
  await expect(empty.locator('[aria-live="polite"]').first()).toContainText("No registration or DNS conclusion is available");
  await expect(empty.getByRole("status")).toHaveText("Try the report again.");
  await expect(empty.getByRole("button", { name: "Download report" })).toBeVisible();
});

test("clears stale results, blocks duplicate requests, and renders one request error", async ({ page }) => {
  let requests = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/domain/report", async (route) => {
    requests += 1;
    if (requests === 1) return fulfill(route, report());
    await new Promise<void>((resolve) => { release = resolve; });
    return fulfill(route, { error: { message: "The report service is unavailable." } }, 503);
  });
  await page.goto("/domain-report");
  await submit(page);
  await expect(page.getByRole("region", { name: "Domain registration report result" })).toBeVisible();

  await page.getByRole("textbox", { name: /Domain name/ }).fill("changed.example");
  await page.getByRole("button", { name: "Run the report" }).click();
  await expect(page.getByRole("button", { name: "Running registration and DNS checks..." })).toBeDisabled();
  await expect(page.getByRole("region", { name: "Domain registration report result" })).toHaveCount(0);
  await page.getByRole("textbox", { name: /Domain name/ }).press("Enter");
  expect(requests).toBe(2);
  release?.();

  await expect(page.locator("[data-tool-workbench]").getByRole("alert")).toHaveText("The report service is unavailable.");
  await expect(page.getByRole("region", { name: "Domain registration report result" })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: /Domain name/ })).toHaveValue("changed.example");
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains long report values at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.route("**/api/domain/report", (route) => fulfill(route, report()));
      await page.setViewportSize({ height: 900, width });
      await page.goto("/domain-report");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await submit(page);
      if (width === 320) await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
      const sizes = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      const overflow = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
        .map((element) => {
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return { className: String(element.className), clientWidth: element.clientWidth, left: Math.round(bounds.left), overflowX: style.overflowX, right: Math.round(bounds.right), scrollWidth: element.scrollWidth, tag: element.tagName, text: element.textContent?.trim().slice(0, 50), whiteSpace: style.whiteSpace, width: Math.round(bounds.width) };
        })
        .filter((item) => item.scrollWidth > item.clientWidth + 1)
        .sort((left, right) => (right.scrollWidth - right.clientWidth) - (left.scrollWidth - left.clientWidth))
        .slice(0, 20));
      expect(sizes.scroll, JSON.stringify(overflow)).toBe(sizes.client);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    });
  }
}
