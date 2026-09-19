import { expect, test, type Page } from "playwright/test";

type Policy = {
  unrestricted: boolean;
  denied: boolean;
  issuers: string[];
};

const issueRecord = {
  ownerName: "example.com",
  flags: 0,
  critical: false,
  tag: "issue",
  value: "letsencrypt.org",
  ttlSeconds: 300,
  valid: true,
};

function resultFixture(overrides: Record<string, unknown> = {}) {
  return {
    query: { inputName: "www.example.com" },
    checkedAt: "2026-09-05T10:30:00.000Z",
    durationMs: 176,
    status: "policy_found",
    effectiveName: "example.com",
    levels: [
      {
        name: "www.example.com",
        searchReason: "requested",
        responseCode: "NOERROR",
        records: [],
        aliasTarget: "customer.hosting.test",
        rawResponse: { Status: 0, Answer: [{ type: 5, data: "customer.hosting.test" }] },
        error: null,
      },
      {
        name: "customer.hosting.test",
        searchReason: "alias",
        responseCode: "NOERROR",
        records: [],
        aliasTarget: null,
        rawResponse: { Status: 0, Answer: [] },
        error: null,
      },
      {
        name: "example.com",
        searchReason: "parent",
        responseCode: "NOERROR",
        records: [issueRecord],
        aliasTarget: null,
        rawResponse: { Status: 0, Answer: [{ type: 257, data: "0 issue letsencrypt.org" }] },
        error: null,
      },
    ],
    records: [issueRecord],
    normal: { unrestricted: false, denied: false, issuers: ["letsencrypt.org"] } satisfies Policy,
    wildcard: { unrestricted: false, denied: false, issuers: ["letsencrypt.org"] } satisfies Policy,
    usesIssueForWildcard: true,
    iodef: [],
    unknownCriticalTags: [],
    malformedRecords: 0,
    error: null,
    ...overrides,
  };
}

async function runCheck(page: Page, fixture: ReturnType<typeof resultFixture>, name = fixture.query.inputName) {
  await page.route("**/api/dns/caa-checker", (route) => route.fulfill({
    contentType: "application/json",
    json: fixture,
    status: 200,
  }));
  await page.goto("/caa-checker");
  await page.getByRole("textbox", { name: /Domain or hostname/ }).fill(name);
  await page.getByRole("button", { name: "Check CAA policy" }).click();
}

test("CAA input keeps the canonical URL clean and focuses one required-field error", async ({ page }) => {
  await page.goto("/caa-checker");
  await expect(page).toHaveURL(/\/caa-checker$/);
  await page.waitForTimeout(50);
  await expect(page).toHaveURL(/\/caa-checker$/);

  await page.getByRole("button", { name: "Check CAA policy" }).click();
  const input = page.getByRole("textbox", { name: /Domain or hostname/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a domain or hostname.", { exact: true })).toHaveCount(1);
  await expect(page.locator("label").filter({ hasText: "Domain or hostname" })).toContainText("*");

  await page.goto("/caa-checker?name=www.example.com");
  await expect(input).toHaveValue("www.example.com");
  await expect(page).toHaveURL(/\/caa-checker\?name=www\.example\.com$/);
});

test("a restricted policy has one answer, one record table, and one ordered lookup path", async ({ page }) => {
  const records = [
    { ...issueRecord, value: "digicert.com" },
    { ...issueRecord, value: "globalsign.com" },
    { ...issueRecord, tag: "issuewild", value: "letsencrypt.org" },
  ];
  const fixture = resultFixture({
    records,
    normal: { unrestricted: false, denied: false, issuers: ["digicert.com", "globalsign.com"] },
    wildcard: { unrestricted: false, denied: false, issuers: ["letsencrypt.org"] },
    usesIssueForWildcard: false,
    levels: [
      ...resultFixture().levels.slice(0, 2),
      { ...resultFixture().levels[2], records },
    ],
  });
  await runCheck(page, fixture);

  const result = page.locator("[data-caa-result]");
  await expect(result.getByText("Effective CAA policy", { exact: true })).toHaveCount(1);
  await expect(result.getByText("digicert.com and globalsign.com may issue.", { exact: true })).toHaveCount(1);
  await expect(result.getByText("letsencrypt.org may issue.", { exact: true })).toHaveCount(1);
  await expect(result.getByText("Policy inherited from example.com.", { exact: true })).toHaveCount(1);
  await expect(result.getByText(/No issuewild record/)).toHaveCount(0);

  const table = result.getByRole("table", { name: "Effective CAA records" });
  await expect(table.getByRole("columnheader")).toHaveText(["Flag", "Tag", "Value", "Resolver TTL"]);
  await expect(table.getByRole("row")).toHaveCount(4);
  await expect(table).toContainText("digicert.com");

  const path = result.getByRole("list", { name: "CAA lookup path" });
  await expect(path.getByRole("listitem")).toHaveCount(3);
  await expect(path.getByRole("listitem").nth(0)).toContainText("Requested name");
  await expect(path.getByRole("listitem").nth(0)).toContainText("CNAME to customer.hosting.test");
  await expect(path.getByRole("listitem").nth(1)).toContainText("Alias target");
  await expect(path.getByRole("listitem").nth(2)).toContainText("Parent name");
  await expect(path.getByRole("listitem").nth(2)).toContainText("Policy found, 3 records");

  await expect(result.getByRole("button", { name: "Raw CAA responses" })).toHaveCount(1);
  await result.getByRole("button", { name: "Raw CAA responses" }).click();
  await expect(result.getByText('"searchReason": "alias"')).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await result.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("www.example.com-caa-report.json");
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({
    tool: "CAA Policy Checker",
    reportVersion: 1,
    query: { inputName: "www.example.com" },
    levels: [{ searchReason: "requested" }, { searchReason: "alias" }, { searchReason: "parent" }],
  });
});

test("policy qualifications stay grouped while their records remain visible", async ({ page }) => {
  const records = [
    issueRecord,
    { ...issueRecord, flags: 128, critical: true, tag: "future-policy", value: "required" },
    { ...issueRecord, tag: "", value: "broken record", valid: false, ttlSeconds: null },
    { ...issueRecord, tag: "iodef", value: "ftp://reports.example.com" },
  ];
  await runCheck(page, resultFixture({
    records,
    levels: [{ ...resultFixture().levels[2], records }],
    iodef: [{ value: "ftp://reports.example.com", validUrl: false }],
    unknownCriticalTags: ["future-policy"],
    malformedRecords: 1,
  }));

  const qualifications = page.locator('[aria-label="Policy qualifications"]').getByRole("status");
  await expect(qualifications).toHaveCount(1);
  await expect(qualifications).toContainText("future-policy");
  await expect(qualifications).toContainText("1 CAA record is malformed");
  await expect(qualifications).toContainText("1 iodef destination has an invalid URL");

  const table = page.getByRole("table", { name: "Effective CAA records" });
  await expect(table).toContainText("128, critical");
  await expect(table).toContainText("future-policy");
  await expect(table).toContainText("Malformed");
  await expect(table).toContainText("Not reported");
  await expect(page.getByText("No issuewild record was found, so the issue policy also applies to wildcard certificates.", { exact: true })).toHaveCount(1);
});

test("issuewild-only policy can deny wildcard issuance without restricting normal certificates", async ({ page }) => {
  const denyWildcard = { ...issueRecord, tag: "issuewild", value: ";" };
  await runCheck(page, resultFixture({
    records: [denyWildcard],
    levels: [{ ...resultFixture().levels[2], records: [denyWildcard] }],
    normal: { unrestricted: true, denied: false, issuers: [] },
    wildcard: { unrestricted: false, denied: true, issuers: [] },
    usesIssueForWildcard: false,
  }));

  const result = page.locator("[data-caa-result]");
  const normal = result.getByRole("heading", { name: "Normal certificates" }).locator("..");
  const wildcard = result.getByRole("heading", { name: "Wildcard certificates" }).locator("..");
  await expect(normal).toContainText("CAA does not restrict this kind of certificate.");
  await expect(wildcard).toContainText("No certificate authority is allowed.");
  await expect(wildcard).toHaveAttribute("data-tone", "danger");
  await expect(result.getByText(/No issuewild record/)).toHaveCount(0);
});

test("server validation preserves the entered name and keeps one retry action", async ({ page }) => {
  await page.route("**/api/dns/caa-checker", (route) => route.fulfill({
    contentType: "application/json",
    json: { error: { message: "Enter a hostname, not an IP address." } },
    status: 400,
  }));
  await page.goto("/caa-checker");
  const input = page.getByRole("textbox", { name: /Domain or hostname/ });
  await input.fill("192.0.2.1");
  await page.getByRole("button", { name: "Check CAA policy" }).click();

  await expect(input).toHaveValue("192.0.2.1");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a hostname, not an IP address.", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Check CAA policy" })).toHaveCount(1);
  await expect(page.locator("[data-caa-result]")).toHaveCount(0);
});

test("no-policy and undetermined results keep distinct, truthful answer states", async ({ page }) => {
  const noPolicy = resultFixture({
    query: { inputName: "example.test" },
    status: "no_policy",
    effectiveName: null,
    records: [],
    levels: [{ ...resultFixture().levels[0], name: "example.test", aliasTarget: null }],
    normal: { unrestricted: true, denied: false, issuers: [] },
    wildcard: { unrestricted: true, denied: false, issuers: [] },
    usesIssueForWildcard: false,
  });
  await runCheck(page, noPolicy, "example.test");
  const noPolicyResult = page.locator("[data-caa-result]");
  await expect(noPolicyResult.getByText("CAA does not restrict normal or wildcard issuance for example.test.", { exact: true })).toHaveCount(1);
  await expect(noPolicyResult.getByText("This does not promise that a certificate authority will issue.", { exact: true })).toHaveCount(1);
  await expect(noPolicyResult.getByRole("table", { name: "Effective CAA records" })).toHaveCount(0);
  await expect(noPolicyResult.getByText(/Policy (?:found|inherited) from/)).toHaveCount(0);

  await page.unroute("**/api/dns/caa-checker");
  const undetermined = resultFixture({
    query: { inputName: "broken.example" },
    status: "undetermined",
    effectiveName: null,
    records: [],
    levels: [{
      name: "broken.example",
      searchReason: "requested",
      responseCode: null,
      records: [],
      aliasTarget: null,
      rawResponse: null,
      error: "The nameserver did not answer before the timeout.",
    }],
    normal: { unrestricted: true, denied: false, issuers: [] },
    wildcard: { unrestricted: true, denied: false, issuers: [] },
    usesIssueForWildcard: false,
    error: "The nameserver did not answer before the timeout.",
  });
  await page.route("**/api/dns/caa-checker", (route) => route.fulfill({ contentType: "application/json", json: undetermined, status: 200 }));
  await page.getByRole("textbox", { name: /Domain or hostname/ }).fill("broken.example");
  await page.getByRole("button", { name: "Check CAA policy" }).click();
  const unknownResult = page.locator("[data-caa-result]");
  await expect(unknownResult.getByText("The effective CAA policy could not be determined.", { exact: true })).toBeVisible();
  await expect(unknownResult.getByText(/may issue\.|does not restrict normal or wildcard/)).toHaveCount(0);
  await expect(unknownResult.getByRole("table", { name: "Effective CAA records" })).toHaveCount(0);
  await expect(unknownResult.getByRole("button", { name: "Download report" })).toBeVisible();
  await expect(unknownResult.getByRole("listitem")).toContainText("Lookup failed");

  const downloadPromise = page.waitForEvent("download");
  await unknownResult.getByRole("button", { name: "Download report" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let contents = "";
  for await (const chunk of stream) contents += chunk.toString();
  expect(JSON.parse(contents)).toMatchObject({
    status: "undetermined",
    error: "The nameserver did not answer before the timeout.",
    levels: [{ rawResponse: null, error: "The nameserver did not answer before the timeout." }],
  });
});

test("a later check clears stale evidence during loading and after request failure", async ({ page }) => {
  let requestCount = 0;
  let releaseSecond!: () => void;
  const secondResponse = new Promise<void>((resolve) => { releaseSecond = resolve; });
  await page.route("**/api/dns/caa-checker", async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await route.fulfill({ contentType: "application/json", json: resultFixture(), status: 200 });
      return;
    }
    await secondResponse;
    await route.fulfill({
      contentType: "application/json",
      json: { error: { message: "The CAA check took too long and was stopped safely." } },
      status: 504,
    });
  });

  await page.goto("/caa-checker");
  const input = page.getByRole("textbox", { name: /Domain or hostname/ });
  await input.fill("www.example.com");
  await page.getByRole("button", { name: "Check CAA policy" }).click();
  await expect(page.locator("[data-caa-result]")).toBeVisible();

  await input.fill("failed.example");
  await page.getByRole("button", { name: "Check CAA policy" }).click();
  await expect(page.locator("[data-caa-result]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Checking CAA policy..." })).toBeDisabled();
  await expect(page.getByText("Checking CAA policy...", { exact: true })).toHaveCount(2);

  releaseSecond();
  await expect(page.getByText("The CAA check took too long and was stopped safely.", { exact: true })).toHaveCount(1);
  await expect(input).toHaveValue("failed.example");
  await expect(page.locator("[data-caa-result]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Check CAA policy" })).toBeEnabled();
});

test("long records and raw evidence stay inside a 320px page", async ({ page }) => {
  const longName = `${"a".repeat(63)}.${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(57)}`;
  const longValue = `letsencrypt.org; validationmethods=dns-01,accounturi=https://acme.example/account/${"x".repeat(180)}`;
  const records = [{ ...issueRecord, ownerName: longName, value: longValue }];
  const fixture = resultFixture({
    query: { inputName: longName },
    effectiveName: longName,
    records,
    normal: { unrestricted: false, denied: false, issuers: ["letsencrypt.org"] },
    wildcard: { unrestricted: false, denied: false, issuers: ["letsencrypt.org"] },
    levels: [{
      ...resultFixture().levels[2],
      name: longName,
      searchReason: "requested",
      records,
      rawResponse: { answer: "z".repeat(3_000) },
    }],
  });

  await page.setViewportSize({ width: 320, height: 900 });
  await runCheck(page, fixture, longName);
  const tableScroll = page.getByRole("table", { name: "Effective CAA records" }).locator("..");
  expect(await tableScroll.evaluate((node) => node.scrollWidth)).toBe(
    await tableScroll.evaluate((node) => node.clientWidth),
  );
  const recordValue = page.getByRole("table", { name: "Effective CAA records" }).getByText(longValue);
  expect(await recordValue.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
  await page.getByRole("button", { name: "Raw CAA responses" }).click();
  const rawViewport = page.locator("pre").filter({ hasText: '"answer"' }).locator("..");
  expect(await rawViewport.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  const width = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(width.scroll).toBe(width.client);
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`CAA results keep their hierarchy at ${width}px in ${theme} mode`, async ({ page }, testInfo) => {
      const records = [
        { ...issueRecord, value: "digicert.com" },
        { ...issueRecord, value: "globalsign.com" },
        { ...issueRecord, tag: "issuewild", value: "letsencrypt.org" },
      ];
      const fixture = resultFixture({
        records,
        normal: { unrestricted: false, denied: false, issuers: ["digicert.com", "globalsign.com"] },
        wildcard: { unrestricted: false, denied: false, issuers: ["letsencrypt.org"] },
        usesIssueForWildcard: false,
        levels: [
          ...resultFixture().levels.slice(0, 2),
          { ...resultFixture().levels[2], records },
        ],
      });
      await page.route("**/api/dns/caa-checker", (route) => route.fulfill({
        contentType: "application/json",
        json: fixture,
        status: 200,
      }));

      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((selectedTheme) => localStorage.setItem("stack127-theme", selectedTheme), theme);
      await page.goto("/caa-checker");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

      const input = page.getByRole("textbox", { name: /Domain or hostname/ });
      const action = page.getByRole("button", { name: "Check CAA policy" });
      await input.fill("www.example.com");
      await action.click();
      const result = page.locator("[data-caa-result]");
      await expect(result).toBeVisible();
      await expect(result.getByText("Effective CAA policy", { exact: true })).toBeVisible();

      const tableViewport = result.getByRole("table", { name: "Effective CAA records" }).locator("..");
      const path = result.getByRole("list", { name: "CAA lookup path" });
      const layout = await page.evaluate(() => {
        const documentElement = document.documentElement;
        const nodes = [
          document.querySelector('[data-caa-result]'),
          document.querySelector('table[aria-label="Effective CAA records"]')?.parentElement,
          document.querySelector('ol[aria-label="CAA lookup path"]'),
        ].filter((node): node is Element => Boolean(node));
        return {
          clientWidth: documentElement.clientWidth,
          scrollWidth: documentElement.scrollWidth,
          bounds: nodes.map((node) => {
            const rect = node.getBoundingClientRect();
            return { left: rect.left, right: rect.right };
          }),
        };
      });
      expect(layout.scrollWidth).toBe(layout.clientWidth);
      for (const bounds of layout.bounds) {
        expect(bounds.left).toBeGreaterThanOrEqual(-0.5);
        expect(bounds.right).toBeLessThanOrEqual(layout.clientWidth + 0.5);
      }
      await expect(tableViewport).toBeVisible();
      await expect(path).toBeVisible();

      if (width <= 700) {
        const inputBox = await input.boundingBox();
        const actionBox = await action.boundingBox();
        expect(inputBox).not.toBeNull();
        expect(actionBox).not.toBeNull();
        expect(actionBox!.y).toBeGreaterThan(inputBox!.y + inputBox!.height);
        expect(Math.abs(actionBox!.width - inputBox!.width)).toBeLessThanOrEqual(1);
      }

      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath(`caa-${theme}-${width}.png`),
      });
    });
  }
}
