import { expect, test } from "playwright/test";

test("domain age supporting comparisons wrap inside the reading column", async ({ page }) => {
  await page.goto("/domain-age");
  const article = page.locator("main article");
  const table = article.getByRole("table");
  await expect(table).toBeVisible();

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const bounds = await table.evaluate((node) => {
      const region = node.parentElement!;
      return {
        table: node.getBoundingClientRect().width,
        region: region.clientWidth,
        scroll: region.scrollWidth,
        page: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
      };
    });
    expect(bounds.table).toBeLessThanOrEqual(bounds.region + 1);
    expect(bounds.scroll).toBe(bounds.region);
    expect(bounds.page).toBe(bounds.viewport);
  }
});

const registered = {
  query: { input: "example.com", domain: "example.com", unicode: "example.com", tld: "com", suffix: "com", reduced: false, isIdn: false, guessedSuffix: false },
  coverage: { source: "iana", operator: "VeriSign", url: "https://rdap.verisign.com/com/v1/domain/example.com", unknownTld: false },
  status: "registered",
  checkedAt: "2026-09-04T09:00:00Z",
  durationMs: 178,
  registrationDate: "1995-08-14T04:00:00Z",
  reregistrationDate: null,
  registryExpiryDate: "2027-08-13T04:00:00Z",
  registrarExpiryDate: null,
  lastChangedDate: "2026-08-14T07:01:39Z",
  transferDate: null,
  lockedDate: null,
  registryDatabaseUpdated: "2026-09-04T08:30:00Z",
  events: [],
  statuses: [],
  nameservers: [],
  dnssecSigned: true,
  dsRecordCount: 1,
  registrar: { name: null, ianaId: null, abuseEmail: null, abusePhone: null, url: null, rdapUrl: null },
  entities: [],
  redactions: [],
  redactionDeclared: false,
  registryFetch: {
    status: "registered",
    httpStatus: 200,
    url: "https://rdap.verisign.com/com/v1/domain/example.com",
    source: "registry",
    body: { objectClassName: "domain", ldhName: "EXAMPLE.COM" },
    error: null,
    fetchedAt: "2026-09-04T09:00:00Z",
    fromCache: false,
  },
  registrarFetch: null,
  notes: [],
};

test("domain age focuses one inline error when the required name is empty", async ({ page }) => {
  await page.goto("/domain-age");
  await page.getByRole("button", { name: "Check domain age" }).click();

  const input = page.getByRole("textbox", { name: /Domain name/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain name.", { exact: true })).toHaveCount(1);
  await expect(page.locator("label").filter({ hasText: "Domain name" })).toContainText("*");
});

test("domain age leads with one large answer and keeps evidence contained", async ({ page }) => {
  await page.route("**/api/domain/lookup", (route) => route.fulfill({ contentType: "application/json", json: registered, status: 200 }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/domain-age");
  await page.getByRole("textbox", { name: /Domain name/ }).fill("example.com");
  await page.getByRole("button", { name: "Check domain age" }).click();

  const answer = page.getByRole("status", { name: "Current registration age" });
  const timeline = page.getByRole("list", { name: "Registration timeline" });
  await expect(answer).toContainText(/year/);
  await expect(answer).toContainText("example.com");
  await expect(timeline).toContainText("Registered");
  await expect(timeline).toContainText("Today");
  await expect(timeline).toContainText("Registry expiry");
  await expect(page.getByText("Registration date only. It does not date the website or its current owner.")).toBeVisible();
  await expect(page.getByText("rdap.verisign.com", { exact: true })).toBeVisible();

  const rawTrigger = page.getByRole("button", { name: /Registry response/ });
  await rawTrigger.click();
  await expect(page.getByText('"objectClassName": "domain"')).toBeVisible();
  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(widths.scroll).toBe(widths.client);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("example.com-age.json");

  expect(await page.locator('output[aria-label="Current registration age"], ol[aria-label="Registration timeline"]').evaluateAll(
    (nodes) => nodes.map((node) => node.tagName),
  )).toEqual(["OUTPUT", "OL"]);
});

test("a re-registration is visible in the answer and timeline without a prose dump", async ({ page }) => {
  const reregistered = {
    ...registered,
    registrationDate: "2003-03-04T12:00:00Z",
    reregistrationDate: "2026-02-02T12:00:00Z",
  };
  await page.route("**/api/domain/lookup", (route) => route.fulfill({ contentType: "application/json", json: reregistered, status: 200 }));
  await page.goto("/domain-age");
  await page.getByRole("textbox", { name: /Domain name/ }).fill("example.com");
  await page.getByRole("button", { name: "Check domain age" }).click();

  await expect(page.getByRole("status", { name: "Current registration age" })).toContainText("Current registration");
  const timeline = page.getByRole("list", { name: "Registration timeline" });
  await expect(timeline).toContainText("First registered");
  await expect(timeline).toContainText("Re-registered");
  await expect(page.getByText(/does not say why the domain was registered again/)).toBeVisible();
  await expect(page.locator(".domain-answer p")).toHaveCount(0);
});
