import { expect, test } from "playwright/test";

async function gotoPlanner(page: import("playwright/test").Page) {
  await page.goto("/self-hosted-app-resource-planner");
  await page.locator('[data-tool-workbench][data-hydrated="true"]').waitFor();
}

async function addCustomApp(page: import("playwright/test").Page, withRanges = true) {
  await page.getByRole("button", { name: "Open App to add" }).click();
  await page.getByRole("option", { name: "Custom app" }).click();
  await page.getByRole("button", { name: "Add app", exact: true }).click();
  await page.getByRole("textbox", { name: "Custom app name" }).fill("Test service");
  if (withRanges) {
    await page.getByRole("textbox", { name: "RAM lower bound" }).fill("0.25");
    await page.getByRole("textbox", { name: "RAM upper bound" }).fill("0.5");
    await page.getByRole("textbox", { name: "Storage lower bound" }).fill("1");
    await page.getByRole("textbox", { name: "Storage upper bound" }).fill("2");
  }
}

async function calculate(page: import("playwright/test").Page, withRanges = true) {
  await addCustomApp(page, withRanges);
  await page.getByRole("textbox", { name: "RAM budget" }).fill("8");
  await page.getByRole("textbox", { name: "App storage budget" }).fill("100");
  await page.getByRole("button", { name: "Calculate plan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toBeFocused();
  const position = await page.getByRole("heading", { name: "Resource plan result", exact: true }).evaluate((element) => ({
    bottom: element.getBoundingClientRect().bottom,
    headerBottom: document.querySelector("header")?.getBoundingClientRect().bottom ?? 0,
    top: element.getBoundingClientRect().top,
    viewportHeight: window.innerHeight,
  }));
  expect(position.top).toBeGreaterThanOrEqual(position.headerBottom);
  expect(position.bottom).toBeLessThanOrEqual(position.viewportHeight);
}

async function installPickerClickTrace(page: import("playwright/test").Page) {
  await page.evaluate(() => {
    const trace = { clicks: [] as Array<Record<string, unknown>> };
    (window as Window & { __stack127PlannerPickerTrace?: typeof trace }).__stack127PlannerPickerTrace = trace;
    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const control = target?.closest('input[role="combobox"], button');
      if (!control) return;
      trace.clicks.push({
        defaultPrevented: event.defaultPrevented,
        expanded: control.getAttribute("aria-expanded"),
        role: control.getAttribute("role"),
        tag: control.tagName,
        text: control.textContent?.trim() ?? "",
      });
    }, true);
  });
}

async function pickerDomState(page: import("playwright/test").Page) {
  return page.evaluate(() => {
    const input = document.querySelector<HTMLInputElement>('input[role="combobox"]');
    const group = input?.closest('[role="group"]') ?? input?.parentElement;
    const trigger = group?.querySelector<HTMLButtonElement>("button") ?? null;
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return {
      activeElement: activeElement
        ? { role: activeElement.getAttribute("role"), tag: activeElement.tagName, text: activeElement === document.body ? "" : activeElement.textContent?.trim().slice(0, 120) ?? "" }
        : null,
      heading: document.querySelector("h1")?.textContent?.trim() ?? null,
      input: input ? {
        ariaControls: input.getAttribute("aria-controls"),
        ariaExpanded: input.getAttribute("aria-expanded"),
        disabled: input.disabled,
        value: input.value,
      } : null,
      listboxes: [...document.querySelectorAll<HTMLElement>('[role="listbox"]')].map((listbox) => ({
        hidden: listbox.getAttribute("hidden") !== null || getComputedStyle(listbox).display === "none",
        id: listbox.id,
        options: [...listbox.querySelectorAll<HTMLElement>('[role="option"]')].map((option) => option.textContent?.trim() ?? ""),
      })),
      options: [...document.querySelectorAll<HTMLElement>('[role="option"]')].map((option) => ({
        ariaDescribedBy: option.getAttribute("aria-describedby"),
        ariaLabel: option.getAttribute("aria-label"),
        ariaLabelledBy: option.getAttribute("aria-labelledby"),
        hidden: option.getAttribute("hidden") !== null || getComputedStyle(option).display === "none",
        text: option.textContent?.trim() ?? "",
      })),
      trigger: trigger ? {
        ariaLabel: trigger.getAttribute("aria-label"),
        ariaLabelledBy: trigger.getAttribute("aria-labelledby"),
        boundingBox: (() => {
          const rect = trigger.getBoundingClientRect();
          return { bottom: rect.bottom, height: rect.height, left: rect.left, right: rect.right, top: rect.top, width: rect.width };
        })(),
        computedDisplay: getComputedStyle(trigger).display,
        computedVisibility: getComputedStyle(trigger).visibility,
        disabled: trigger.disabled,
        expanded: trigger.getAttribute("aria-expanded"),
        id: trigger.id,
      } : null,
      url: location.href,
      workbench: Boolean(document.querySelector("[data-tool-workbench]")),
    };
  });
}

async function pickerClickTrace(page: import("playwright/test").Page) {
  return page.evaluate(() => (window as Window & {
    __stack127PlannerPickerTrace?: { clicks: Array<Record<string, unknown>> };
  }).__stack127PlannerPickerTrace?.clicks ?? []);
}

test("clean planner keeps the URL and has no result until an app is added", async ({ page }) => {
  await gotoPlanner(page);
  await expect(page).toHaveURL(/self-hosted-app-resource-planner$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Self-hosted app resource planner");
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Calculate plan", exact: true })).toBeVisible();
});

test("calculates one known app, exposes the lead answer, and clears stale output on edit", async ({ page }) => {
  await gotoPlanner(page);
  await calculate(page);
  const result = page.getByRole("region", { name: "Resource plan result" });
  await expect(result).toContainText(/within the available budget/i);
  await expect(result).toContainText("RAM");
  await expect(result).toContainText("Storage");
  await expect(result).not.toContainText(/CPU total|provider recommendation|docker run|kubernetes/i);
  await page.getByRole("textbox", { name: "RAM budget" }).fill("0.1");
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toHaveCount(0);
});

test("keeps missing custom requirements unknown without showing zero ranges", async ({ page }) => {
  await gotoPlanner(page);
  await calculate(page, false);
  const result = page.getByRole("region", { name: "Resource plan result" });
  await expect(result).toContainText(/RAM[\s\S]*Unknown/i);
  await expect(result).toContainText(/Storage[\s\S]*Unknown/i);
  await expect(result).not.toContainText("0.0 GiB to 0.0 GiB");
  await expect(result).not.toContainText("0.0 GB to 0.0 GB");
});

test("shows each allocation label and a truthful over-budget split", async ({ page }) => {
  await gotoPlanner(page);
  await addCustomApp(page);
  await page.getByRole("textbox", { name: "RAM budget" }).fill("0.3");
  await page.getByRole("textbox", { name: "App storage budget" }).fill("1");
  await page.getByRole("textbox", { name: "Headroom reserve" }).fill("0");
  await page.getByRole("button", { name: "Calculate plan", exact: true }).click();
  const result = page.getByRole("region", { name: "Resource plan result" });
  await expect(result.getByRole("heading", { name: "RAM budget" })).toBeVisible();
  await expect(result.getByRole("heading", { name: "Storage budget" })).toBeVisible();
  await expect(result.getByText("Within available budget", { exact: true }).first()).toBeVisible();
  await expect(result.getByText("Over budget", { exact: true }).first()).toBeVisible();
  await expect(result).not.toContainText("RAM binds");
});

test("invalid submit focuses the first bad field and keeps values", async ({ page }) => {
  await gotoPlanner(page);
  const submitButton = page.getByRole("button", { name: "Calculate plan", exact: true });
  const combo = page.getByRole("combobox", { name: "App to add" });
  const status = page.getByRole("status");
  await submitButton.click();
  await expect(combo).toBeFocused();
  await expect(status).toContainText(/add an app|host budget/i);
  await submitButton.focus();
  await submitButton.press("Enter");
  await expect(combo).toBeFocused();
  await expect(status).toContainText(/add an app|host budget/i);
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toHaveCount(0);
});

test("reset restores the empty state and focus", async ({ page }) => {
  await gotoPlanner(page);
  await calculate(page);
  await page.getByRole("button", { name: "Reset plan", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "App to add" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Headroom reserve" })).toHaveValue("20");
});

test("keeps the app picker reachable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await gotoPlanner(page);
  await page.getByRole("button", { name: "Open App to add" }).click();
  const customApp = page.getByRole("option", { name: "Custom app" });
  await expect(customApp).toBeVisible();
  await customApp.click();
  await expect(page.getByRole("button", { name: "Add app", exact: true })).toBeEnabled();
});

test("planner picker opens its custom option at every contracted width", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const diagnostics: Array<Record<string, unknown>> = [];
  for (const width of [1440, 390, 320]) {
    const consoleStart = consoleErrors.length;
    const pageErrorStart = pageErrors.length;
    await page.setViewportSize({ width, height: 900 });
    await gotoPlanner(page);
    await installPickerClickTrace(page);
    const before = await pickerDomState(page);
    const input = page.getByRole("combobox", { name: "App to add", exact: true });
    const trigger = page.getByRole("button", { name: "Open App to add", exact: true });
    await expect(input).toBeEnabled();
    await expect(trigger).toHaveCount(1);
    await trigger.click();
    await page.waitForTimeout(100);
    const after = await pickerDomState(page);
    const customVisible = await page.getByRole("option", { name: "Custom app", exact: true }).isVisible().catch(() => false);
    diagnostics.push({
      after,
      before,
      clickTrace: await pickerClickTrace(page),
      consoleErrors: consoleErrors.slice(consoleStart),
      customVisible,
      pageErrors: pageErrors.slice(pageErrorStart),
      width,
    });
  }

  await test.info().attach("planner-picker-diagnostics.json", {
    body: JSON.stringify(diagnostics, null, 2),
    contentType: "application/json",
  });
  const failures = diagnostics.filter((entry) => entry.customVisible !== true).map((entry) => ({
    after: entry.after,
    clickTrace: entry.clickTrace,
    consoleErrors: entry.consoleErrors,
    customVisible: entry.customVisible,
    pageErrors: entry.pageErrors,
    width: entry.width,
  }));
  expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
});

test("keeps the app picker uniquely named and usable by mouse and keyboard", async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await gotoPlanner(page);

    const input = page.getByRole("combobox", { name: "App to add", exact: true });
    const trigger = page.getByRole("button", { name: "Open App to add", exact: true });
    await expect(input).toBeEnabled();
    await expect(trigger).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Open App to add App to add", exact: true })).toHaveCount(0);

    await trigger.click();
    const customApp = page.getByRole("option", { name: "Custom app", exact: true });
    await expect(customApp).toBeVisible();
    await customApp.click();
    await expect(page.getByRole("button", { name: "Add app", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Add app", exact: true }).click();
    await page.getByRole("textbox", { name: "Custom app name" }).fill("Keyboard reachable service");
    await page.getByRole("textbox", { name: "RAM lower bound" }).fill("0.25");
    await page.getByRole("textbox", { name: "RAM upper bound" }).fill("0.5");
    await page.getByRole("textbox", { name: "Storage lower bound" }).fill("1");
    await page.getByRole("textbox", { name: "Storage upper bound" }).fill("2");

    await page.getByRole("button", { name: "Reset plan", exact: true }).click();
    await expect(input).toBeFocused();
    await input.press("ArrowDown");
    await expect(customApp).toBeVisible();
    await customApp.click();
    await expect(page.getByRole("button", { name: "Add app", exact: true })).toBeEnabled();
  }

  await page.getByRole("button", { name: "Add app", exact: true }).click();
  await page.getByRole("textbox", { name: "Custom app name" }).fill("Keyboard reachable service");
  await page.getByRole("textbox", { name: "RAM lower bound" }).fill("0.25");
  await page.getByRole("textbox", { name: "RAM upper bound" }).fill("0.5");
  await page.getByRole("textbox", { name: "Storage lower bound" }).fill("1");
  await page.getByRole("textbox", { name: "Storage upper bound" }).fill("2");
  await page.getByRole("textbox", { name: "RAM budget" }).fill("8");
  await page.getByRole("textbox", { name: "App storage budget" }).fill("100");
  await page.getByRole("button", { name: "Calculate plan", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Resource plan result", exact: true })).toBeVisible();
});

test("has no page overflow at the narrow target widths", async ({ page }) => {
  for (const width of [1440, 760, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await gotoPlanner(page);
    await calculate(page);
    const overflow = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      body: document.body.scrollWidth - document.body.clientWidth,
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.body).toBeLessThanOrEqual(1);
  }
});
