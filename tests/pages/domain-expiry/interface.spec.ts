import { expect, test } from "playwright/test";

const registered = {
  query: { input: "example.com", domain: "example.com", unicode: "example.com", tld: "com", suffix: "com", reduced: false, isIdn: false, guessedSuffix: false },
  coverage: { source: "iana", operator: "VeriSign", url: "https://rdap.verisign.com/com/v1/domain/example.com", unknownTld: false },
  status: "registered",
  checkedAt: "2026-09-05T09:00:00Z",
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
    body: {
      objectClassName: "domain",
      ldhName: "EXAMPLE.COM",
      self: "https://rdap.verisign.com/com/v1/domain/example.com/a-very-long-unbroken-evidence-value-that-must-remain-inside-the-raw-result",
    },
    error: null,
    fetchedAt: "2026-09-05T09:00:00Z",
    fromCache: false,
  },
  registrarFetch: null,
  notes: [],
};

test("domain expiry focuses one required-field error", async ({ page }) => {
  await page.goto("/domain-expiry");
  await page.getByRole("button", { name: "Check domain expiry" }).click();

  const input = page.getByRole("textbox", { name: /Domain name/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain name.", { exact: true })).toHaveCount(1);
  await expect(page.locator("label").filter({ hasText: "Domain name" })).toContainText("*");
});

test("a normal registration leads with time remaining and keeps evidence contained", async ({ page }) => {
  await page.route("**/api/domain/lookup", (route) => route.fulfill({ contentType: "application/json", json: registered, status: 200 }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/domain-expiry");
  await page.getByRole("textbox", { name: /Domain name/ }).fill("example.com");
  await page.getByRole("button", { name: "Check domain expiry" }).click();

  const answer = page.getByRole("status", { name: "Time until registry expiry" });
  await expect(answer).toContainText(/month/);
  await expect(answer).toContainText("example.com");
  await expect(answer).toContainText("expires 13 August 2027");
  await expect(page.getByRole("list", { name: "Registration dates" })).toHaveCount(0);
  const path = page.getByRole("list", { name: "Typical path after expiry" });
  await expect(path).toContainText("Pending delete");
  await expect(path).toContainText("Registrar may renew or delete");
  await expect(path).toContainText("Release time varies");
  await expect(page.getByRole("list", { name: "Expiry lifecycle" })).toHaveCount(0);
  await expect(page.getByText("rdap.verisign.com", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Registry response" }).click();
  await expect(page.getByText('"objectClassName": "domain"')).toBeVisible();
  const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBe(widths.client);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("example.com-expiry.json");
});

test("redemption becomes the main answer and remains unavailable", async ({ page }) => {
  const redemption = {
    ...registered,
    registryExpiryDate: "2026-08-01T04:00:00Z",
    statuses: [{ rdap: "redemption period", epp: "redemptionPeriod", known: true }],
  };
  await page.route("**/api/domain/lookup", (route) => route.fulfill({ contentType: "application/json", json: redemption, status: 200 }));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/domain-expiry");
  await page.getByRole("textbox", { name: /Domain name/ }).fill("example.com");
  await page.getByRole("button", { name: "Check domain expiry" }).click();

  await expect(page.getByRole("status", { name: "Expiry state" })).toContainText("Redemption period");
  await expect(page.getByRole("status", { name: "Expiry state" })).toContainText("Not available to register");
  await expect(page.getByRole("list", { name: "Typical path after expiry" }).getByText("Redemption", { exact: true }).locator("..")).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("table", { name: "Expiry status evidence" })).toContainText("redemptionPeriod");
  await expect(page.locator(".domain-answer p")).toHaveCount(0);
  const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(widths.scroll).toBe(widths.client);
});

test("different registry and registrar dates stay visibly separate", async ({ page }) => {
  const mismatch = { ...registered, registrarExpiryDate: "2027-09-02T04:00:00Z" };
  await page.route("**/api/domain/lookup", (route) => route.fulfill({ contentType: "application/json", json: mismatch, status: 200 }));
  await page.goto("/domain-expiry");
  await page.getByRole("textbox", { name: /Domain name/ }).fill("example.com");
  await page.getByRole("button", { name: "Check domain expiry" }).click();

  const dates = page.locator('dl[aria-label="Published expiry dates"]');
  await expect(dates).toContainText("Registry expiry");
  await expect(dates).toContainText("Registrar expiry");
  await expect(page.getByText("Confirm the renewal deadline with your registrar.", { exact: true })).toBeVisible();
});

test("registry and registrar timestamps on the same day are not repeated", async ({ page }) => {
  const sameVisibleDate = { ...registered, registrarExpiryDate: "2027-08-13T21:30:00Z" };
  await page.route("**/api/domain/lookup", (route) => route.fulfill({ contentType: "application/json", json: sameVisibleDate, status: 200 }));
  await page.goto("/domain-expiry");
  await page.getByRole("textbox", { name: /Domain name/ }).fill("example.com");
  await page.getByRole("button", { name: "Check domain expiry" }).click();

  await expect(page.locator('dl[aria-label="Published expiry dates"]')).toHaveCount(0);
  const resultText = await page.getByRole("region", { name: "Domain expiry result" }).innerText();
  expect(resultText.match(/13 August 2027/g)).toHaveLength(1);
});
