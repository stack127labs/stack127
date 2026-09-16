import { expect, test, type Page } from "playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const fixture = (name: string) => readFileSync(path.join(process.cwd(), "tests/pages/docker-compose-checker/fixtures", name), "utf8");

async function waitForChecker(page: Page) {
  await page.locator('[data-tool-workbench]').waitFor();
  await expect(page.getByLabel("Compose file")).toBeVisible();
}

async function submit(page: Page, compose: string, environment = "") {
  await page.getByLabel("Compose file").fill(compose);
  await page.getByLabel("Interpolation environment").fill(environment);
  await page.getByRole("button", { name: "Check Compose file" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/docker-compose-checker");
  await waitForChecker(page);
});

test("shows the clean workbench and keeps the route canonical", async ({ page }) => {
  await expect(page.locator("[data-app-main] h1")).toContainText("Docker Compose checker");
  await expect(page.getByLabel("Compose file")).toHaveAttribute("aria-required", "true");
  await expect(page.getByLabel("Interpolation environment")).toBeVisible();
  await expect(page.getByRole("button", { name: "Check Compose file" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Load example" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Reset/ })).toHaveCount(1);
  await expect(page.locator("#compose-result")).toHaveCount(0);
  await expect(page).toHaveURL(/\/docker-compose-checker$/);

  await page.goto("/docker-compose-checker?state=not-supported&keep=1#draft");
  await waitForChecker(page);
  await expect(page).toHaveURL(/\/docker-compose-checker\?keep=1#draft$/);
  await expect(page.getByText("Shared inputs are not supported", { exact: true })).toHaveCount(1);
  await expect(page.locator("#compose-result")).toHaveCount(0);
});

test("focuses the empty field and leaves drafts editable after syntax failure", async ({ page }) => {
  await page.getByRole("button", { name: "Check Compose file" }).click();
  await expect(page.getByText("Paste a Compose file before checking.", { exact: true })).toHaveCount(1);
  await expect(page.getByLabel("Compose file")).toBeFocused();

  await submit(page, fixture("valid-current-compose.yml"));
  await expect(page.locator("#compose-result")).toBeVisible();
  await submit(page, fixture("syntax-error.yml"));
  await expect(page.getByRole("heading", { name: "YAML syntax needs fixing" })).toBeVisible();
  await expect(page.getByText("Compose model", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Compose file")).toBeFocused();
  await expect(page.getByLabel("Compose file")).toHaveValue(fixture("syntax-error.yml"));
});

test("renders one answer, three layers, counts, findings, summary, and limitations", async ({ page }) => {
  await submit(page, fixture("valid-current-compose.yml"));
  await expect(page.locator("#compose-result")).toBeFocused();
  const answerPosition = await page.locator("#compose-result").evaluate((element) => ({
    resultTop: element.getBoundingClientRect().top,
    headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
  }));
  expect(answerPosition.resultTop).toBeGreaterThanOrEqual(answerPosition.headerBottom);
  await expect(page.getByRole("heading", { name: "No blocking static issues found" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Check layers" })).toBeVisible();
  const resultOrder = await page.locator("#compose-result h3").allTextContents();
  expect(resultOrder.indexOf("Findings")).toBeLessThan(resultOrder.indexOf("Check layers"));
  await expect(page.getByText("YAML syntax", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Compose model", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Static advisories", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Normalized model" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Limitations" })).toBeVisible();
  await expect(page.getByText("No findings.", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Docker", { exact: true })).toHaveCount(0);
});

test("accepts env_file mappings and reports missing service images", async ({ page }) => {
  await submit(page, `services:
  web:
    image: nginx:1.27
    env_file:
      - path: ./default.env
        required: false
      - path: ./literal.env
        format: raw`);
  await expect(page.getByText("COMPOSE-ENV-FILE-TYPE", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No blocking static issues found" })).toBeVisible();

  await submit(page, "services:\n  web:\n    command: echo hello");
  await expect(page.getByText("COMPOSE-SERVICE-IMAGE-MISSING", { exact: true })).toBeVisible();
});

test("keeps the focused answer below the sticky header at the breakpoint width", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 900 });
  await page.getByRole("button", { name: "Check Compose file" }).click();
  await expect(page.getByLabel("Compose file")).toBeFocused();
  await submit(page, fixture("valid-current-compose.yml"));
  const answerPosition = await page.locator("#compose-result").evaluate((element) => ({
    resultTop: element.getBoundingClientRect().top,
    headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
  }));
  expect(answerPosition.resultTop).toBeGreaterThanOrEqual(answerPosition.headerBottom);
  await expect(page.getByRole("heading", { name: "No blocking static issues found" })).toBeVisible();
});

test("keeps input and model failures separate and accepts Compose-specific forms", async ({ page }) => {
  await submit(page, "- service");
  await expect(page.getByRole("heading", { name: "Compose model findings" })).toBeVisible();
  await expect(page.getByText("COMPOSE-ROOT-MAPPING", { exact: true })).toBeVisible();

  await submit(page, fixture("malformed-known-fields.yml"));
  await expect(page.getByRole("heading", { name: "Compose model has blocking issues" })).toBeVisible();
  for (const code of ["COMPOSE-IMAGE-TYPE", "COMPOSE-BUILD-TYPE", "COMPOSE-HEALTHCHECK-TYPE", "COMPOSE-ENVIRONMENT-TYPE", "COMPOSE-NETWORKS-TYPE"]) {
    await expect(page.getByText(code, { exact: true })).toBeVisible();
  }

  await submit(page, fixture("compose-compatible-ports.yml"));
  await expect(page.getByText("COMPOSE-PORT-INVALID", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/\*:8000-8005\/tcp/)).toBeVisible();
  await expect(page.getByText(/::1:6001\/tcp/)).toBeVisible();

  await submit(page, fixture("network-mapping.yml"));
  await expect(page.getByText("COMPOSE-NETWORK-MISSING", { exact: true })).toHaveCount(0);
  await expect(page.getByText("COMPOSE-NETWORKS-TYPE", { exact: true })).toHaveCount(0);

  await submit(page, fixture("unknown-structural-interpolation.yml"));
  await expect(page.getByText("COMPOSE-INTERPOLATION-UNRESOLVED", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/COMPOSE-(DEPENDENCY|VOLUME|NETWORK)-MISSING/)).toHaveCount(0);
});

test("focuses the Compose editor for an input boundary error", async ({ page }) => {
  const oversized = `services:\n  web:\n    image: nginx\n${"# line\n".repeat(4_000)}`;
  await submit(page, oversized);
  await expect(page.getByRole("heading", { name: "Input findings" })).toBeVisible();
  await expect(page.getByText("INPUT-COMPOSE-LINES", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Compose file")).toBeFocused();
});

test("separates model errors, incomplete boundaries, and advisory-only findings", async ({ page }) => {
  await submit(page, fixture("service-references.yml"));
  await expect(page.getByRole("heading", { name: "Compose model has blocking issues" })).toBeVisible();
  await expect(page.getByText("COMPOSE-DEPENDENCY-MISSING", { exact: true })).toBeVisible();

  await submit(page, fixture("incomplete-composition.yml"));
  await expect(page.getByRole("heading", { name: "Cannot fully resolve this file" })).toBeVisible();
  await expect(page.getByText("COMPOSE-INCOMPLETE-MODEL", { exact: true })).toHaveCount(2);

  await submit(page, fixture("risk-advisories.yml"));
  await expect(page.getByRole("heading", { name: "No blocking static issues found" })).toBeVisible();
  await expect(page.getByText("Advisory", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/\b(safe|secure|compliant|production-ready)\b/i)).toHaveCount(0);
});

test("clears stale output on edit, supports example and reset, and copies only on request", async ({ page }) => {
  await submit(page, fixture("valid-current-compose.yml"));
  await expect(page.locator("#compose-result")).toBeVisible();
  await page.getByLabel("Compose file").press("End");
  await page.getByLabel("Compose file").type("\n# changed");
  await expect(page.locator("#compose-result")).toHaveCount(0);
  await expect(page.getByText("Inputs changed", { exact: true })).toHaveCount(1);

  await page.getByRole("button", { name: "Load example" }).click();
  await expect(page.getByLabel("Compose file")).toHaveValue(/depends_on:/);
  await expect(page.getByLabel("Interpolation environment")).toHaveValue("APP_TAG=latest");
  await expect(page.locator("#compose-result")).toHaveCount(0);
  await expect(page.getByLabel("Compose file")).toBeFocused();

  await page.getByRole("button", { name: /Reset/ }).click();
  await expect(page.getByLabel("Compose file")).toHaveValue("");
  await expect(page.getByLabel("Interpolation environment")).toHaveValue("");
  await expect(page.getByLabel("Compose file")).toBeFocused();
});

test("copies a stable report and preserves the result when copying fails", async ({ page }) => {
  await page.addInitScript(() => {
    let copied = "";
    Object.defineProperty(window, "__composeCopied", { configurable: true, get: () => copied });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { copied = value; } } });
  });
  await page.reload();
  await waitForChecker(page);
  await submit(page, fixture("valid-current-compose.yml"));
  await page.getByRole("button", { name: "Copy report" }).click();
  await expect(page.getByRole("button", { name: "Report copied" })).toBeVisible();
  const copied = await page.evaluate(() => (window as Window & { __composeCopied?: string }).__composeCopied ?? "");
  expect(JSON.parse(copied)).toMatchObject({ schemaVersion: 1, engineVersion: "compose-checker-resolution-2" });

  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("blocked"); } } });
    document.execCommand = () => false;
  });
  await page.getByRole("button", { name: "Report copied" }).click();
  await expect(page.getByRole("button", { name: "Copy failed" })).toBeVisible();
  await expect(page.locator("#compose-result")).toBeVisible();
});

test("keeps pasted input out of requests, storage, clipboard reads, and the URL", async ({ page }) => {
  const secret = "hunter2-test-value";
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.evaluate(() => {
    const violations = { storageReads: 0, storageWrites: 0, clipboardReads: 0 };
    Object.defineProperty(window, "__composePrivacy", { configurable: true, value: violations });
    const storageGet = Storage.prototype.getItem;
    const storageSet = Storage.prototype.setItem;
    Storage.prototype.getItem = function (...args) { violations.storageReads += 1; return storageGet.apply(this, args); };
    Storage.prototype.setItem = function (...args) { violations.storageWrites += 1; return storageSet.apply(this, args); };
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { readText: async () => { violations.clipboardReads += 1; return ""; }, writeText: async () => undefined } });
  });
  await submit(page, `services:\n  web:\n    image: nginx\n    environment:\n      DB_PASSWORD: ${secret}`);
  const privacy = await page.evaluate(() => (window as Window & { __composePrivacy?: { storageReads: number; storageWrites: number; clipboardReads: number } }).__composePrivacy);
  expect(privacy?.storageWrites).toBe(0);
  expect(privacy?.storageReads).toBeLessThanOrEqual(1);
  expect(privacy?.clipboardReads).toBe(0);
  expect(page.url()).not.toContain(secret);
  expect(requests.some((url) => url.includes(secret) || url.includes("/api/") || url.includes("registry") || url.includes("include"))).toBe(false);
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`keeps long findings inside ${width}px in ${theme} mode`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 400 ? 1000 : 900 });
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await submit(page, fixture("risk-advisories.yml"));
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
        rows: [...document.querySelectorAll<HTMLElement>(".findings tr")].map((row) => ({ right: row.getBoundingClientRect().right, width: row.getBoundingClientRect().width })),
      }));
      expect(dimensions.scroll).toBe(dimensions.client);
      for (const row of dimensions.rows) expect(row.right).toBeLessThanOrEqual(dimensions.client + 1);
      await expect(page.getByText("Fix", { exact: true }).last()).toBeVisible();
    });
  }
}
