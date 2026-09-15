import { expect, test } from "playwright/test";

const representativeRoutes = [
  "/dns-lookup",
  "/domain-lookup",
  "/raid-calculator",
  "/dockerignore-tester",
  "/home-assistant-energy-entity-checker",
];

const routesWithoutExtraDivider = [
  "/domain-age",
  "/domain-expiry",
  "/domain-registrar",
  "/domain-report",
  "/multi-tld-availability",
  "/punycode-converter",
  "/transfer-readiness",
];

for (const route of routesWithoutExtraDivider) {
  test(`${route} has no standalone divider below the workbench`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator("[data-tool-workbench]")).toBeVisible();
    await expect(page.locator("main > hr")).toHaveCount(0);
  });
}

for (const route of ["/nfs-firewall-rules", "/nginx-proxy-pass-calculator", "/raid-calculator", "/shr-calculator", "/snapraid-mergerfs-planner", "/home-assistant-energy-entity-checker", "/transfer-readiness"]) {
  test(`${route} contains wide mobile guide tables in keyboard-accessible scroll regions`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 873 });
    await page.goto(route);
    const tables = page.locator("article table");
    await expect(tables.first()).toBeVisible();
    for (const table of await tables.all()) {
      const region = table.locator("..");
      await expect(region).toHaveAttribute("tabindex", "0");
      const bounds = await region.evaluate((element) => ({
        right: element.getBoundingClientRect().right,
        overflow: getComputedStyle(element).overflowX,
        documentWidth: document.documentElement.clientWidth,
        documentScroll: document.documentElement.scrollWidth,
      }));
      expect(bounds.right).toBeLessThanOrEqual(bounds.documentWidth);
      expect(bounds.documentScroll).toBe(bounds.documentWidth);
      expect(bounds.overflow).toBe("auto");
      for (const code of await table.locator("code").all()) {
        expect(await code.evaluate((element) => getComputedStyle(element).wordBreak)).toBe("normal");
      }
      await region.focus();
      await expect(region).toBeFocused();
      if (await region.evaluate((element) => element.scrollWidth > element.clientWidth)) {
        await region.press("ArrowRight");
        await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      }
    }
  });
}

for (const route of ["/domain-expiry", "/dnssec-checker", "/ceph-capacity-calculator", "/zfs-padding-calculator"]) {
  test(`${route} keeps explanatory tables readable inside the guide`, async ({ page }) => {
    await page.setViewportSize(test.info().project.name === "mobile"
      ? { width: 390, height: 873 }
      : { width: 1440, height: 873 });
    await page.goto(route);
    const tables = page.locator("article table");
    await expect(tables.first()).toBeVisible();
    for (const table of await tables.all()) {
      const bounds = await table.evaluate((element) => ({
        width: element.getBoundingClientRect().width,
        region: element.parentElement!.clientWidth,
        scroll: element.parentElement!.scrollWidth,
      }));
      expect(bounds.width).toBeLessThanOrEqual(bounds.region + 2);
      expect(bounds.scroll).toBeLessThanOrEqual(bounds.region + 2);
    }
  });
}

for (const route of representativeRoutes) {
  test(`${route} renders the tool as a divider-bounded workbench`, async ({ page }) => {
    await page.setViewportSize(test.info().project.name === "mobile"
      ? { width: 390, height: 873 }
      : { width: 1600, height: 873 });
    await page.goto(route);

    const workbench = page.locator("[data-tool-workbench]");
    await expect(workbench).toHaveCount(1);
    await expect(workbench).toBeVisible();

    const presentation = await workbench.evaluate((element) => {
      const style = getComputedStyle(element);
      const band = getComputedStyle(element, "::before");
      const rect = element.getBoundingClientRect();
      const mainRect = element.closest("[data-app-main]")?.getBoundingClientRect();
      const bandWidth = Number.parseFloat(band.width);
      const bandLeft = rect.left + (rect.width / 2) - (bandWidth / 2);
      return {
        background: band.backgroundColor,
        bandLeft,
        bandRight: bandLeft + bandWidth,
        borderBottom: Number.parseFloat(band.borderBottomWidth),
        borderLeft: Number.parseFloat(band.borderLeftWidth),
        borderRadius: Number.parseFloat(band.borderTopLeftRadius),
        borderRight: Number.parseFloat(band.borderRightWidth),
        borderTop: Number.parseFloat(band.borderTopWidth),
        mainLeft: mainRect?.left ?? Number.NaN,
        mainRight: mainRect?.right ?? Number.NaN,
        toolBackground: style.backgroundColor,
        toolWidth: rect.width,
      };
    });

    expect(presentation.background).not.toBe("rgba(0, 0, 0, 0)");
    expect(presentation.borderTop).toBeGreaterThan(0);
    expect(presentation.borderBottom).toBeGreaterThan(0);
    expect(presentation.borderLeft).toBe(0);
    expect(presentation.borderRight).toBe(0);
    expect(presentation.borderRadius).toBe(0);
    expect(Math.abs(presentation.bandLeft - presentation.mainLeft)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(presentation.bandRight - presentation.mainRight)).toBeLessThanOrEqual(1.5);
    expect(presentation.toolBackground).toBe("rgba(0, 0, 0, 0)");
    expect(presentation.toolWidth).toBeGreaterThan(300);
    if (test.info().project.name !== "mobile") {
      expect(presentation.mainRight - presentation.mainLeft - presentation.toolWidth).toBeGreaterThan(40);
    }

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
}
