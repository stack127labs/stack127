import { readFileSync } from "node:fs";
import { expect, test } from "playwright/test";

const favicon = readFileSync("public/favicon-32x32.png");

test("DNS Change results show the site favicon and download the complete report", async ({ page }, testInfo) => {
  const hostname = "favicon.test";
  await page.route(`https://${hostname}/favicon.ico`, (route) => route.fulfill({
    body: favicon,
    contentType: "image/png",
    status: 200,
  }));
  await page.route("**/api/dns/change-checker", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      query: { name: hostname, recordType: "A", expectedAnswer: null },
      checkedAt: "2026-07-13T10:00:00.000Z",
      durationMs: 120,
      zone: hostname,
      authoritative: [{ id: "authority-0", label: "ns1.favicon.test", kind: "authoritative", server: { hostname: "ns1.favicon.test", address: "192.0.2.53" }, responseCode: "NOERROR", authoritative: true, authenticatedData: null, records: [{ ownerName: hostname, type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 300 }], error: null, rawResponse: { Status: 0, AA: true } }],
      resolvers: [{ id: "cloudflare", label: "Cloudflare", kind: "resolver", server: null, responseCode: "NOERROR", authoritative: null, authenticatedData: false, records: [{ ownerName: hostname, type: "A", typeCode: 1, value: "192.0.2.10", resolverTtlSeconds: 240 }], error: null, rawResponse: { Status: 0 } }],
      summary: { authoritativeServersAgree: true, matchingAuthoritativeSources: 1, totalAuthoritativeSources: 1, agreeingResolvers: 1, totalResolvers: 1, expectedAnswerMatches: null },
    }),
  }));
  await page.goto("/dns-tools/dns-change-checker");
  await page.getByLabel("Domain or hostname").fill(hostname);
  await page.getByRole("button", { name: "Check DNS change" }).click();
  if (testInfo.project.name !== "mobile") {
    await expect(page.locator(`img[src="https://${hostname}/favicon.ico"]`)).toBeVisible();
  }

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  await expect(download.suggestedFilename()).toBe(`${hostname}-A-dns-change-report.json`);
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({
    tool: "DNS Change Checker",
    query: { name: hostname, recordType: "A" },
    authoritative: [{ rawResponse: { Status: 0, AA: true } }],
    resolvers: [{ rawResponse: { Status: 0 } }],
  });
});
