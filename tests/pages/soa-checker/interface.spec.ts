import { expect, test, type Page, type Route } from "playwright/test";

const baseSoa = {
  expireSeconds: 1_209_600,
  minimumSeconds: 300,
  ownerName: "example.com",
  primaryNameserver: "ns1.example.net",
  refreshSeconds: 3_600,
  responsibleMailbox: "hostmaster.example.com",
  retrySeconds: 600,
  serial: 4_294_967_295,
  ttlSeconds: 900,
};

function observation(address = "192.0.2.10", overrides: Record<string, unknown> = {}) {
  return {
    authoritative: true,
    error: null,
    rawResponses: { tcp: { Answer: [{ data: "SOA over TCP" }], Status: 0 }, udp: { Answer: [{ data: "SOA over UDP" }], Status: 0 } },
    server: { address, hostname: "ns1.example.net" },
    skippedReason: null,
    soa: baseSoa,
    ...overrides,
  };
}

function result(observations = [observation()], overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-09-05T10:00:00.000Z",
    durationMs: 420,
    ipv6Connectivity: true,
    observations,
    query: { inputName: "www.example.com", zone: "example.com" },
    summary: { allAnswered: true, differences: [], newestSerial: 4_294_967_295, serialsAgree: true },
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

async function submit(page: Page, name = "www.example.com") {
  await page.getByLabel("Domain or hostname").fill(name);
  await page.getByRole("button", { name: "Compare SOA records" }).click();
}

test("keeps clean and explicit URLs and handles validation, loading, and request recovery", async ({ page }) => {
  let request = 0;
  let release: (() => void) | undefined;
  await page.route("**/api/dns/soa-checker", async (route) => {
    request += 1;
    if (request === 1) return fulfill(route, { error: { message: "Enter a domain or hostname rather than an IP address." } }, 400);
    if (request === 2) return fulfill(route, result());
    await new Promise<void>((resolve) => { release = resolve; });
    return fulfill(route, { error: { message: "The SOA check took too long and was stopped safely." } }, 504);
  });

  await page.goto("/soa-checker");
  await expect(page).toHaveURL(/\/soa-checker$/);
  await expect(page.locator("[data-soa-result]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Download report" })).toHaveCount(0);
  await page.getByRole("button", { name: "Compare SOA records" }).click();
  await expect(page.getByText("Enter a domain or hostname.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Domain or hostname")).toBeFocused();

  await submit(page, "192.0.2.10");
  await expect(page.getByText("Enter a domain or hostname rather than an IP address.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Domain or hostname")).toBeFocused();
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("192.0.2.10");

  await submit(page);
  await expect(page.locator("[data-soa-result]")).toBeVisible();
  await page.getByLabel("Domain or hostname").fill("failed.example.com");
  await page.getByRole("button", { name: "Compare SOA records" }).click();
  await expect(page.getByRole("button", { name: "Comparing SOA records..." })).toBeDisabled();
  await expect(page.getByText("Comparing SOA records...", { exact: true })).toHaveCount(2);
  await expect(page.locator("[data-soa-result]")).toHaveCount(0);
  release?.();
  await expect(page.getByText("The SOA check took too long and was stopped safely.", { exact: true })).toHaveCount(1);
  await expect(page.locator("[data-soa-result]")).toHaveCount(0);
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("failed.example.com");

  await page.goto("/soa-checker?name=mail.example.com");
  await expect(page.getByLabel("Domain or hostname")).toHaveValue("mail.example.com");
  await expect(page.locator("[data-soa-result]")).toHaveCount(0);
  await expect(page).toHaveURL(/\/soa-checker\?name=mail\.example\.com$/);
});

test("renders agreement, RFC 1982 disagreement, undefined order, incomplete, skipped, and empty states", async ({ page }) => {
  const responses = [
    result([
      observation("192.0.2.10"),
      observation("2001:db8::10", { server: { address: "2001:db8::10", hostname: "ns1.example.net" } }),
    ]),
    result([
      observation("192.0.2.10"),
      observation("198.51.100.20", { server: { address: "198.51.100.20", hostname: "ns2.example.net" }, soa: { ...baseSoa, refreshSeconds: 7_200, serial: 0 } }),
    ]),
    result([
      observation("192.0.2.10", { soa: { ...baseSoa, serial: 0 } }),
      observation("198.51.100.20", { server: { address: "198.51.100.20", hostname: "ns2.example.net" }, soa: { ...baseSoa, serial: 2_147_483_648 } }),
    ]),
    result([
      observation("192.0.2.10"),
      observation("198.51.100.20", { authoritative: false, error: "UDP timed out.", rawResponses: { tcp: null, udp: null }, server: { address: "198.51.100.20", hostname: "ns2.example.net" }, soa: null }),
    ]),
    result([
      observation("192.0.2.10"),
      observation("2001:db8::10", { authoritative: false, rawResponses: { tcp: null, udp: null }, server: { address: "2001:db8::10", hostname: "ns1.example.net" }, skippedReason: "checker_ipv6_unavailable", soa: null }),
    ], { ipv6Connectivity: false }),
    result([], { summary: { allAnswered: false, differences: [], newestSerial: null, serialsAgree: false } }),
  ];
  await page.route("**/api/dns/soa-checker", (route) => fulfill(route, responses.shift()));
  await page.goto("/soa-checker");

  await submit(page);
  await expect(page.getByText(/All 2 checked addresses for example\.com returned authoritative SOA records and agree/)).toBeVisible();
  const grouped = page.getByRole("table", { name: "SOA values for example.com by authoritative source" });
  await expect(grouped.getByRole("row")).toHaveCount(2);
  await expect(grouped.getByText("192.0.2.10", { exact: true })).toBeVisible();
  await expect(grouped.getByText("2001:db8::10", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Compare SOA records" }).click();
  await expect(page.getByText("SOA records for example.com disagree. RFC 1982 identifies serial 0 as newest; serial and refresh differ across the checked authoritative replies.", { exact: true })).toBeVisible();
  await expect(page.locator('[data-soa-difference="serial"]')).toHaveCount(2);
  await expect(page.locator('[data-soa-difference="serial"]').filter({ hasText: "0, newest" })).toBeVisible();

  await page.getByRole("button", { name: "Compare SOA records" }).click();
  await expect(page.getByText(/RFC 1982 cannot order them unambiguously/)).toBeVisible();
  await expect(page.locator("[data-soa-result]").getByText(/newest/)).toHaveCount(0);

  await page.getByRole("button", { name: "Compare SOA records" }).click();
  await expect(page.getByText("The SOA comparison for example.com is incomplete because ns2.example.net at 198.51.100.20 did not return an authoritative SOA; UDP timed out.", { exact: true })).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "198.51.100.20" })).toContainText("FailedUDP timed out.");

  await page.getByRole("button", { name: "Compare SOA records" }).click();
  await expect(page.getByText(/addresses this checker could query/)).toBeVisible();
  const skipped = page.getByRole("row").filter({ hasText: "2001:db8::10" });
  await expect(skipped).toContainText("Skipped by checkerNo IPv6 route");
  await expect(skipped).not.toContainText(/failed/i);

  await page.getByRole("button", { name: "Compare SOA records" }).click();
  await expect(page.getByText("No authoritative SOA records were available for example.com, so serial and field agreement cannot be determined.", { exact: true })).toBeVisible();
  await expect(page.getByRole("table", { name: /SOA values for/ })).toHaveCount(0);
});

test("keeps raw source evidence ordered and downloads the complete report", async ({ page }) => {
  const fixture = result([
    observation("192.0.2.10"),
    observation("2001:db8::10", {
      authoritative: false,
      rawResponses: { tcp: null, udp: null },
      server: { address: "2001:db8::10", hostname: "ns1.example.net" },
      skippedReason: "checker_ipv6_unavailable",
      soa: null,
    }),
  ], { ipv6Connectivity: false });
  await page.route("**/api/dns/soa-checker", (route) => fulfill(route, fixture));
  await page.goto("/soa-checker");
  await submit(page);

  await expect(page.getByRole("button", { name: "Raw SOA responses" })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Raw SOA responses" }).click();
  await expect(page.getByRole("button", { name: "UDP response from ns1.example.net at 192.0.2.10" })).toBeVisible();
  await expect(page.getByRole("button", { name: "TCP response from ns1.example.net at 192.0.2.10" })).toBeVisible();
  await expect(page.getByText("No response captured. Skipped by checker because it has no IPv6 route.", { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("example.com-soa-report.json");
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({
    ipv6Connectivity: false,
    observations: [{ rawResponses: { tcp: { Status: 0 }, udp: { Status: 0 } } }, { skippedReason: "checker_ipv6_unavailable" }],
    summary: fixture.summary,
    tool: "SOA Consistency Checker",
  });
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains the long SOA table and expanded raw evidence at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 375 ? 820 : 950 });
      const longZone = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}.com`;
      const longHost = `${"n".repeat(63)}.${"s".repeat(63)}.${longZone}`;
      const longSoa = {
        ...baseSoa,
        ownerName: longZone,
        primaryNameserver: longHost,
        responsibleMailbox: `${"hostmaster".repeat(18)}.${longZone}`,
      };
      const fixture = result([
        observation("2001:0db8:ffff:ffff:ffff:ffff:ffff:0001", {
          rawResponses: {
            tcp: { Answer: [{ data: "K".repeat(12_000), name: longZone }], Status: 0 },
            udp: { Answer: [{ data: "v".repeat(11_000), name: longZone }], Status: 0 },
          },
          server: { address: "2001:0db8:ffff:ffff:ffff:ffff:ffff:0001", hostname: longHost },
          soa: longSoa,
        }),
        observation("2001:0db8:ffff:ffff:ffff:ffff:ffff:0002", {
          authoritative: false,
          error: `${"Long safe timeout detail ".repeat(40)}ended.`,
          rawResponses: { tcp: null, udp: null },
          server: { address: "2001:0db8:ffff:ffff:ffff:ffff:ffff:0002", hostname: `${"x".repeat(63)}.${longHost}` },
          soa: null,
        }),
      ], {
        query: { inputName: longZone, zone: longZone },
        summary: { allAnswered: false, differences: [], newestSerial: 4_294_967_295, serialsAgree: true },
      });
      await page.route("**/api/dns/soa-checker", (route) => fulfill(route, fixture));
      await page.goto("/soa-checker");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await submit(page, longZone);
      await page.getByRole("button", { name: "Raw SOA responses" }).click();
      await page.getByRole("button", { name: `UDP response from ${longHost} at 2001:0db8:ffff:ffff:ffff:ffff:ffff:0001` }).click();
      await page.getByRole("button", { name: `TCP response from ${longHost} at 2001:0db8:ffff:ffff:ffff:ffff:ffff:0001` }).click();

      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
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
        .slice(0, 12));
      expect(widths.scroll, JSON.stringify(overflowOwners)).toBeLessThanOrEqual(widths.client);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const table = page.getByRole("table", { name: `SOA values for ${longZone} by authoritative source` });
      await expect(table).toBeVisible();
      const tableWidths = await table.locator("xpath=..").evaluate((element) => ({ client: element.clientWidth, scroll: element.scrollWidth }));
      expect(tableWidths.scroll).toBeGreaterThanOrEqual(tableWidths.client);
    });
  }
}
