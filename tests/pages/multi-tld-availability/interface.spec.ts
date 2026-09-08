import { expect, test, type Page, type Route } from "playwright/test";

type RowState = "not_registered" | "registered" | "cannot_check" | "check_failed";

function row(tld: string, state: RowState, overrides: Record<string, unknown> = {}) {
  return {
    detail: state === "check_failed" ? `The .${tld} registry did not answer in time.` : "",
    domain: `stack127.${tld}`,
    expiryDate: state === "registered" ? "2027-09-05T00:00:00.000Z" : null,
    fetchedAt: state === "cannot_check" ? null : "2026-09-05T12:00:00.000Z",
    fromCache: tld === "net",
    registrar: state === "registered" ? `${"Long Registrar Name ".repeat(8)}Ltd` : null,
    sourceHost: state === "cannot_check" ? null : `${"registry-".repeat(18)}${tld}.example.test`,
    state,
    tld,
    ...overrides,
  };
}

function result(tld: string, state: RowState, overrides: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-09-05T12:00:00.000Z",
    checkedCount: 1,
    maxTlds: 12,
    name: "stack127",
    rows: [row(tld, state)],
    unicode: "stack127",
    ...overrides,
  };
}

async function fulfill(route: Route, body: unknown, status = 200) {
  await route.fulfill({ body: JSON.stringify(body), contentType: "application/json", status });
}

function submittedTld(route: Route) {
  return (route.request().postDataJSON() as { tlds: string[] }).tlds[0];
}

function checkbox(page: Page, tld: string) {
  return page.getByRole("checkbox", { name: new RegExp(`^\\.${tld}(?: |$)`) });
}

async function toggleCheckbox(page: Page, tld: string) {
  await checkbox(page, tld).focus();
  await checkbox(page, tld).press("Space");
}

async function submit(page: Page, name = "stack127") {
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await page.getByRole("textbox", { name: /Name without an ending/ }).fill(name);
  await page.getByRole("button", { name: /Check 10 endings/ }).click();
}

test("keeps the name empty and focuses local validation errors", async ({ page }) => {
  let requests = 0;
  await page.route("**/api/domain/multi-tld", (route) => {
    requests += 1;
    return fulfill(route, result(submittedTld(route), "not_registered"));
  });
  await page.goto("/multi-tld-availability");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(page).toHaveURL(/\/multi-tld-availability$/);
  await page.getByRole("button", { name: /Check 10 endings/ }).click();
  const input = page.getByRole("textbox", { name: /Name without an ending/ });
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a name to check.", { exact: true })).toHaveCount(1);
  expect(requests).toBe(0);

  await page.goto("/multi-tld-availability?name=stack127");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await expect(input).toHaveValue("");
  await expect(page).toHaveURL(/\?name=stack127$/);
  expect(requests).toBe(0);
  await input.fill("stack127");

  for (const tld of ["com", "net", "org", "dev", "app", "ai", "io", "xyz", "info", "biz"]) {
    await toggleCheckbox(page, tld);
  }
  await expect(page.getByText("0 selected, 12 maximum", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Check 0 endings" }).click();
  await expect(page.getByText("Choose at least one ending.", { exact: true })).toHaveCount(1);
  await expect(checkbox(page, "com")).toBeFocused();
  expect(requests).toBe(0);
});

test("enforces the selection cap without trapping selected choices", async ({ page }) => {
  await page.goto("/multi-tld-availability");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
  await toggleCheckbox(page, "co");
  await toggleCheckbox(page, "me");
  await expect(page.getByText("12 selected, 12 maximum. Remove one to choose another.", { exact: true })).toBeVisible();
  await expect(checkbox(page, "us")).toBeDisabled();
  await expect(checkbox(page, "com")).toBeEnabled();
  await toggleCheckbox(page, "com");
  await expect(checkbox(page, "us")).toBeEnabled();
});

test("renders one honest summary, row evidence, Unicode, and local retry", async ({ page }) => {
  const calls = new Map<string, number>();
  await page.route("**/api/domain/multi-tld", (route) => {
    const tld = submittedTld(route);
    calls.set(tld, (calls.get(tld) ?? 0) + 1);
    const states: Record<string, RowState> = { com: "registered", dev: "check_failed", org: "cannot_check" };
    const state = tld === "dev" && calls.get(tld) === 2 ? "not_registered" : (states[tld] ?? "not_registered");
    return fulfill(route, result(tld, state, {
      name: "xn--bcher-kva",
      rows: [row(tld, state, { domain: `xn--bcher-kva.${tld}` })],
      unicode: "bücher",
    }));
  });
  await page.goto("/multi-tld-availability");
  await submit(page, "bücher");

  const resultRegion = page.getByRole("region", { name: "Multi-TLD result" });
  const lead = resultRegion.getByRole("status", { name: "Set result" });
  await expect(lead).toContainText("7 of 10");
  await expect(lead).toContainText("1 registered. 1 cannot be checked. 1 check failed.");
  await expect(resultRegion.getByText("No registration record does not rule out a reserved, blocked, or premium-priced name.", { exact: true })).toHaveCount(1);
  const table = resultRegion.getByRole("table", { name: "Domain registry results" });
  await expect(table.getByRole("row")).toHaveCount(11);
  await expect(table).toContainText("bücher.com");
  await expect(table).toContainText("xn--bcher-kva.com");
  await expect(table).toContainText("Long Registrar Name");
  await expect(table).toContainText("live response");
  await expect(table).toContainText("from cache");
  await expect(resultRegion.getByRole("link", { name: "Open registration lookup" })).toHaveAttribute("href", "/domain-lookup?name=xn--bcher-kva.com");
  await expect(resultRegion.getByRole("link", { name: "Open TLD directory" })).toHaveAttribute("href", "/tld-directory");

  await resultRegion.getByRole("button", { name: "Retry .dev" }).click();
  await expect(resultRegion.getByRole("button", { name: "Retry .dev" })).toHaveCount(0);
  await expect(resultRegion.getByRole("status", { name: "Set result" })).toContainText("8 of 10");
  expect(calls.get("dev")).toBe(2);
});

test("clears edited results, blocks duplicate batches, and shows one whole-request failure", async ({ page }) => {
  let requests = 0;
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/domain/multi-tld", async (route) => {
    requests += 1;
    await held;
    return fulfill(route, result(submittedTld(route), "not_registered"));
  });
  await page.goto("/multi-tld-availability");
  await submit(page);
  await expect.poll(() => requests).toBe(10);
  await page.getByRole("textbox", { name: /Name without an ending/ }).press("Enter");
  expect(requests).toBe(10);
  release?.();
  await expect(page.getByRole("status", { name: "Set result" })).toContainText("10 of 10");

  await page.getByRole("textbox", { name: /Name without an ending/ }).fill("changed");
  await expect(page.getByRole("region", { name: "Multi-TLD result" })).toHaveCount(0);
  await page.unroute("**/api/domain/multi-tld");
  await page.route("**/api/domain/multi-tld", (route) => fulfill(route, { error: { message: "That is a lot of checking in a short time. Try again in a few minutes." } }, 429));
  await page.getByRole("button", { name: /Check 10 endings/ }).click();
  await expect(page.locator("[data-tool-workbench]").getByRole("alert")).toHaveText("That is a lot of checking in a short time. Try again in a few minutes.");
  await expect(page.getByRole("region", { name: "Multi-TLD result" })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: /Name without an ending/ })).toHaveValue("changed");
});

test("treats malformed responses as one request failure rather than empty success", async ({ page }) => {
  await page.route("**/api/domain/multi-tld", (route) => fulfill(route, { name: "stack127", rows: [] }));
  await page.goto("/multi-tld-availability");
  await submit(page);
  await expect(page.locator("[data-tool-workbench]").getByRole("alert")).toHaveText("The check returned an incomplete response. Try the selected endings again.");
  await expect(page.getByRole("region", { name: "Multi-TLD result" })).toHaveCount(0);
});

for (const theme of ["dark", "light"] as const) {
  for (const width of [320, 375, 760, 1440]) {
    test(`contains choices and long results at ${width}px in ${theme} mode`, async ({ page }) => {
      await page.route("**/api/domain/multi-tld", (route) => fulfill(route, result(submittedTld(route), "registered")));
      await page.setViewportSize({ height: 900, width });
      await page.goto("/multi-tld-availability");
      if (theme === "light") await page.getByRole("button", { name: "Switch to light mode" }).click();
      await submit(page);
      if (width === 320) await page.locator("html").evaluate((element) => { element.style.fontSize = "200%"; });
      const sizes = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
      expect(sizes.scroll).toBe(sizes.client);
      if (width === 320) {
        const boxes = await page.getByRole("checkbox").evaluateAll((elements) =>
          elements.map((element) => element.closest("label")?.getBoundingClientRect().height ?? 0),
        );
        expect(Math.min(...boxes)).toBeGreaterThanOrEqual(44);
      }
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    });
  }
}
