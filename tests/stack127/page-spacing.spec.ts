import { expect, test } from "playwright/test";

const routes = [
  "/", "/about", "/privacy", "/terms", "/labs", "/self-host-apps", "/cli-apps",
  "/matter-devices", "/zigbee-devices", "/dns-tools", "/domain-tools", "/storage-tools",
  "/self-hosting-for-beginners", "/self-hosting-for-beginners/basic-setup",
  "/dns-lookup", "/dnssec-checker", "/domain-age", "/zfs-capacity-calculator",
  "/epp-status-codes", "/software-licenses-for-self-hosting", "/keyboard-shortcuts",
  "/keyboard-shortcuts/chrome",
];

const readingRoutes = new Set([
  "/about",
  "/privacy",
  "/terms",
  "/self-hosting-for-beginners",
  "/self-hosting-for-beginners/basic-setup",
]);

const toolRoutes = new Set([
  "/dns-lookup",
  "/dnssec-checker",
  "/domain-age",
  "/zfs-capacity-calculator",
]);

const routesWithReadingTables = new Set([
  "/dns-lookup",
  "/matter-devices",
  "/zigbee-devices",
]);

for (const route of routes) {
  test(`${route} shares directory gutters and header alignment`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "This test covers mobile widths directly.");
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("[data-app-main] h1")).toBeVisible();
    await expect(page.locator("[data-app-main] [data-page-canvas]").first()).toBeVisible();
    for (const width of [1600, 1280, 1100, 960, 900, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["dark", "light"]) {
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        const geometry = await page.evaluate(() => {
          const main = document.querySelector("[data-app-main]")!;
          const mainRect = main.getBoundingClientRect();
          const heading = main.querySelector("h1")!.getBoundingClientRect();
          return {
            mainX: mainRect.x, mainWidth: mainRect.width, headingX: heading.x,
            topInset: heading.y - mainRect.y,
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            frames: Array.from(main.querySelectorAll("[data-page-canvas]")).map(element => {
              const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
              return {
                x: rect.x,
                width: rect.width,
                left: parseFloat(style.paddingLeft),
                right: parseFloat(style.paddingRight),
                reading: element.getAttribute("data-page-width") === "reading",
              };
            }),
            toolText: Array.from(main.querySelectorAll("[data-tool-page-content] > :is(h2, h3, h4, p, ul, ol, blockquote)"))
              .map(element => {
                const rect = element.getBoundingClientRect();
                return { x: rect.x, width: rect.width };
              }),
            readingTables: Array.from(main.querySelectorAll("[data-tool-page-content] > [role='region'], [data-reading-table]"))
              .map(element => {
                const rect = element.getBoundingClientRect();
                return { x: rect.x, width: rect.width };
              }),
          };
        });
        const gutter = width <= 900 ? 22 : Math.min(36, Math.max(24, width * 0.025));
        expect(geometry.overflow, `${route} at ${width}px`).toBe(false);
        expect(geometry.headingX - geometry.mainX, `${route} heading at ${width}px`).toBeCloseTo(gutter, 0);
        expect(geometry.topInset, `${route} title top spacing at ${width}px`).toBeCloseTo(width <= 900 ? 24 : 30, 0);
        for (const frame of geometry.frames) {
          expect(frame.x).toBeCloseTo(geometry.mainX, 0);
          expect(frame.width).toBeCloseTo(
            frame.reading ? Math.min(geometry.mainWidth, 760 + (2 * gutter)) : geometry.mainWidth,
            0,
          );
          expect(frame.left).toBeCloseTo(gutter, 0);
          expect(frame.right).toBeCloseTo(gutter, 0);
        }
        expect(
          geometry.frames.some(frame => frame.reading),
          `${route} reading-width canvas`,
        ).toBe(readingRoutes.has(route));
        if (toolRoutes.has(route)) {
          expect(geometry.toolText.length, `${route} supporting text`).toBeGreaterThan(0);
          for (const textBlock of geometry.toolText) {
            expect(textBlock.x - geometry.mainX, `${route} supporting text left edge`).toBeCloseTo(gutter, 0);
            expect(textBlock.width, `${route} supporting text width`).toBeLessThanOrEqual(760.5);
          }
        }
        if (routesWithReadingTables.has(route)) {
          expect(geometry.readingTables.length, `${route} explanatory tables`).toBeGreaterThan(0);
        }
        for (const table of geometry.readingTables) {
          expect(table.x - geometry.mainX, `${route} explanatory table left edge`).toBeCloseTo(gutter, 0);
          expect(table.width, `${route} explanatory table width`).toBeLessThanOrEqual(760.5);
        }
        const art = page.locator("[data-entry-hero] > span > svg");
        if (width >= 1100 && await art.count()) {
          const artBox = await art.boundingBox();
          const headerBox = await page.locator("[data-entry-hero] > div").boundingBox();
          expect(headerBox!.x + headerBox!.width).toBeLessThanOrEqual(artBox!.x);
        }
        if ([1600, 390].includes(width) && ["/about", "/self-host-apps", "/self-hosting-for-beginners/basic-setup", "/zfs-capacity-calculator"].includes(route)) {
          await page.screenshot({ path: testInfo.outputPath(`${theme}-${width}.png`), animations: "disabled" });
        }
      }
    }
  });
}
