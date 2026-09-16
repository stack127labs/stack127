import { expect, test } from "playwright/test";

async function installApiFixture(page: import("playwright/test").Page, mode: "ip" | "asn" = "ip") {
  await page.route("**/api/ip-asn-lookup", async (route) => {
    const request = route.request();
    const body = JSON.parse(request.postData() ?? "{}");
    if (body.query === "bad") {
      await route.fulfill({ status: 502, contentType: "application/json", body: JSON.stringify({ error: { code: "check_failed", message: "We could not complete this lookup." } }) });
      return;
    }
    const isAsn = mode === "asn" || String(body.query).toUpperCase().startsWith("AS");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        query: { raw: body.query, normalized: isAsn ? "AS13335" : "1.1.1.1", kind: isAsn ? "asn" : "ip", ipVersion: isAsn ? null : 4, address: isAsn ? null : "1.1.1.1", asn: isAsn ? 13335 : null },
        status: "registered",
        checkedAt: "2026-09-10T00:00:00.000Z",
        durationMs: 12,
        registry: { name: isAsn ? "ARIN" : "APNIC", host: isAsn ? "rdap.arin.net" : "rdap.apnic.net", url: "https://rdap.example.test/object", fetchedAt: "2026-09-10T00:00:00.000Z", fromCache: false, httpStatus: 200 },
        allocation: isAsn ? null : { range: "1.1.1.0 to 1.1.1.255", name: "APNIC-LABS", handle: "1.1.1.0 - 1.1.1.255", type: "ASSIGNED PORTABLE", status: ["ASSIGNED PORTABLE"], country: "AU", ipVersion: "v4", parentHandle: null },
        autnum: isAsn ? { range: "AS13335", name: "CLOUDFLARENET", handle: "AS13335", status: ["active"], country: "US", start: 13335, end: 13335 } : null,
        holder: { name: isAsn ? "Cloudflare, Inc." : "APNIC Research and Development", organization: isAsn ? "Cloudflare, Inc." : "APNIC Research and Development", country: isAsn ? "US" : "AU", source: "network-registry" },
        abuse: { name: isAsn ? "Cloudflare abuse" : "APNIC Abuse", email: isAsn ? "abuse@cloudflare.com" : "helpdesk@apnic.net", phone: null, contactUri: null, source: "network-registry" },
        events: [],
        remarks: [],
        notices: [],
        routing: isAsn ? null : { source: "Team Cymru", asn: 13335, prefix: "1.1.1.0/24", countryCode: "AU", networkName: "CLOUDFLARENET" },
        notes: ["RIR registration and current routing answer different questions."],
        raw: { objectClassName: isAsn ? "autnum" : "ip network" },
      }),
    });
  });
}

async function openTool(page: import("playwright/test").Page, path = "/ip-asn-lookup") {
  await page.goto(path);
  await expect(page.locator('[data-tool-workbench][data-client-ready="true"]')).toBeVisible();
}

test("clean route keeps its URL and has no result until submit", async ({ page }) => {
  await installApiFixture(page);
  await openTool(page);
  await expect(page).toHaveURL(/\/ip-asn-lookup$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("IP and ASN registration lookup");
  await expect(page.getByRole("region", { name: "IP and ASN registration result" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Look up registration", exact: true })).toBeVisible();
});

test("submits a public IP, leads with the RIR record, and keeps BGP separate", async ({ page }) => {
  await installApiFixture(page);
  await openTool(page);
  await page.getByRole("textbox", { name: "IP address or ASN" }).fill("1.1.1.1");
  await page.getByRole("button", { name: "Look up registration", exact: true }).click();
  const result = page.getByRole("region", { name: "IP and ASN registration result" });
  await expect(result).toContainText("APNIC Research and Development (APNIC)");
  await expect(result).toContainText("RIR registration");
  await expect(result).toContainText("Current BGP route");
  await expect(result).toContainText("AS13335");
  await expect(result).toContainText("Routing context, not registration.");
});

test("supports ASN input without rendering an IP routing panel", async ({ page }) => {
  await installApiFixture(page, "asn");
  await openTool(page, "/ip-asn-lookup?query=AS13335");
  await expect(page.getByRole("textbox", { name: "IP address or ASN" })).toHaveValue("AS13335");
  await expect(page.getByRole("region", { name: "IP and ASN registration result" })).toHaveCount(0);
  await page.getByRole("button", { name: "Look up registration", exact: true }).click();
  const result = page.getByRole("region", { name: "IP and ASN registration result" });
  await expect(result).toContainText("Cloudflare, Inc.");
  await expect(result).toContainText("AS13335");
  await expect(result.getByText("Current BGP route", { exact: true })).toHaveCount(0);
});

test("invalid input focuses the field and failed retry clears a stale result", async ({ page }) => {
  await installApiFixture(page);
  await openTool(page);
  const input = page.getByRole("textbox", { name: "IP address or ASN" });
  await page.getByRole("button", { name: "Look up registration", exact: true }).click();
  await expect(input).toBeFocused();
  await expect(page.getByText("Enter an IP address or ASN.", { exact: true })).toBeVisible();
  await input.fill("1.1.1.1");
  await page.getByRole("button", { name: "Look up registration", exact: true }).click();
  await expect(page.getByRole("region", { name: "IP and ASN registration result" })).toBeVisible();
  await input.fill("bad");
  await page.getByRole("button", { name: "Look up registration", exact: true }).click();
  await expect(page.getByRole("region", { name: "IP and ASN registration result" })).toHaveCount(1);
  await expect(page.getByRole("region", { name: "IP and ASN registration result" })).toContainText("Cannot determine");
});

test("editing during a lookup cancels the stale request", async ({ page }) => {
  await page.route("**/api/ip-asn-lookup", async (route) => {
    const query = JSON.parse(route.request().postData() ?? "{}").query as string;
    await new Promise((resolve) => setTimeout(resolve, query === "1.1.1.1" ? 300 : 20));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        query: { raw: query, normalized: query, kind: "ip", ipVersion: 4, address: query, asn: null },
        status: "registered",
        checkedAt: "2026-09-10T00:00:00.000Z",
        durationMs: 12,
        registry: { name: "ARIN", host: "rdap.arin.net", url: "https://rdap.example.test/object", fetchedAt: "2026-09-10T00:00:00.000Z", fromCache: false, httpStatus: 200 },
        allocation: { range: `${query} to ${query}`, name: query === "1.1.1.1" ? "STALE" : "CURRENT", handle: query, type: "ASSIGNED", status: ["active"], country: "US", ipVersion: "v4", parentHandle: null },
        autnum: null,
        holder: { name: query === "1.1.1.1" ? "Stale holder" : "Current holder", organization: query === "1.1.1.1" ? "Stale holder" : "Current holder", country: "US", source: "network-registry" },
        abuse: null,
        events: [], remarks: [], notices: [], routing: null, notes: [], raw: {},
      }),
    });
  });
  await openTool(page);
  const input = page.getByRole("textbox", { name: "IP address or ASN" });
  await input.fill("1.1.1.1");
  await page.getByRole("button", { name: "Look up registration", exact: true }).click();
  await expect(page.getByText("Looking up registration...", { exact: true }).first()).toBeVisible();
  await input.fill("8.8.8.8");
  await expect(page.getByRole("button", { name: "Look up registration", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Look up registration", exact: true }).click();
  const result = page.getByRole("region", { name: "IP and ASN registration result" });
  await expect(result).toContainText("Current holder");
  await expect(result).not.toContainText("Stale holder");
  await page.waitForTimeout(350);
  await expect(result).toContainText("Current holder");
  await expect(result).not.toContainText("Stale holder");
});

test("reset and raw evidence preserve the hierarchy", async ({ page }) => {
  await installApiFixture(page);
  await openTool(page);
  await page.getByRole("textbox", { name: "IP address or ASN" }).fill("1.1.1.1");
  await page.getByRole("button", { name: "Look up registration", exact: true }).click();
  await page.getByRole("button", { name: /Raw RDAP response/i }).click();
  await expect(page.getByText('"objectClassName": "ip network"')).toBeVisible();
  await page.getByRole("button", { name: "Reset lookup", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "IP address or ASN" })).toBeFocused();
  await expect(page.getByRole("region", { name: "IP and ASN registration result" })).toHaveCount(0);
});

test("keeps the page within the viewport at target widths and themes", async ({ page }) => {
  await installApiFixture(page);
  for (const colorScheme of ["dark", "light"] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [1440, 760, 375, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await openTool(page);
      await page.getByRole("textbox", { name: "IP address or ASN" }).fill("1.1.1.1");
      await page.getByRole("button", { name: "Look up registration", exact: true }).click();
      await expect(page.getByRole("region", { name: "IP and ASN registration result" })).toBeVisible();
      const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth,
      }));
      expect(overflow.document).toBeLessThanOrEqual(1);
      expect(overflow.body).toBeLessThanOrEqual(1);
    }
  }
});
