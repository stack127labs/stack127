#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const argument = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const baseUrl = argument("--base-url") ?? "http://127.0.0.1:3333";
const outputDirectory = argument("--output") ?? "/tmp/stack127-zigbee-qa";
const widths = [1280, 760, 375, 320];
const themes = ["dark", "light"];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const affiliateLedger = JSON.parse(await readFile(path.join(repositoryRoot, "lib/amazon-affiliate/data/confirmed.json"), "utf8"));
const zigbeeSnapshot = JSON.parse(await readFile(path.join(repositoryRoot, "lib/zigbee-devices/data/devices.json"), "utf8"));

try {
  for (const theme of themes) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { height: 1000, width } });
      await page.goto(`${baseUrl}/zigbee-devices?sort=capabilities`, {
        timeout: 45_000,
        waitUntil: "networkidle",
      });
      await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
      const cleanScreenshot = path.join(outputDirectory, `${theme}-${width}-page.png`);
      await page.screenshot({ path: cleanScreenshot });
      await page.locator(".directory-card").first().click();
      await page.getByRole("dialog").waitFor();

      const measurement = await page.evaluate(() => {
        const visibleDeviceImages = [...document.querySelectorAll('img[src^="/zigbee-device-images/"]')]
          .filter((image) => {
            const box = image.getBoundingClientRect();
            return box.bottom > 0 && box.top < window.innerHeight;
          });
        const selectors = {
          card: ".directory-card",
          dialog: '[role="dialog"]',
          main: "[data-app-main]",
          results: ".directory-results",
        };
        const regions = Object.fromEntries(Object.entries(selectors).map(([name, selector]) => {
          const element = document.querySelector(selector);
          if (!(element instanceof HTMLElement)) return [name, null];
          const box = element.getBoundingClientRect();
          return [name, {
            clientWidth: element.clientWidth,
            left: box.left,
            right: box.right,
            scrollWidth: element.scrollWidth,
            width: box.width,
          }];
        }));

        return {
          brokenVisibleImages: visibleDeviceImages.filter((image) =>
            !(image instanceof HTMLImageElement) || !image.complete || image.naturalWidth === 0,
          ).length,
          documentClientWidth: document.documentElement.clientWidth,
          documentScrollWidth: document.documentElement.scrollWidth,
          regions,
          visibleDeviceImages: visibleDeviceImages.length,
        };
      });

      if (measurement.visibleDeviceImages === 0 || measurement.brokenVisibleImages > 0) {
        throw new Error(`${theme} ${width}px has missing or broken visible device images.`);
      }

      if (measurement.documentScrollWidth > measurement.documentClientWidth) {
        throw new Error(`${theme} ${width}px has page-level horizontal overflow.`);
      }

      for (const [name, region] of Object.entries(measurement.regions)) {
        if (!region) throw new Error(`${theme} ${width}px is missing ${name}.`);
        if (region.scrollWidth > region.clientWidth + 1) {
          throw new Error(`${theme} ${width}px ${name} overflows by ${region.scrollWidth - region.clientWidth}px.`);
        }
        if (region.left < -1 || region.right > width + 1) {
          throw new Error(`${theme} ${width}px ${name} is outside the viewport.`);
        }
      }

      const screenshot = path.join(outputDirectory, `${theme}-${width}.png`);
      await page.screenshot({ path: screenshot });
      results.push({ cleanScreenshot, measurement, screenshot, theme, width });

      await page.keyboard.press("Escape");
      if (await page.getByRole("dialog").count()) {
        throw new Error(`${theme} ${width}px dialog did not close with Escape.`);
      }

      if (width <= 900) {
        const filterToggle = page.getByRole("button", { name: "Filters" });
        await filterToggle.click();
        await page.waitForFunction(() =>
          document.querySelector('button[aria-controls="app-sidebar-drawer"]')?.getAttribute("aria-expanded") === "true",
        );
        await page.waitForTimeout(250);
        const sidebarBox = await page.locator("[data-app-sidebar]").boundingBox();
        if (!sidebarBox || sidebarBox.left < -1 || sidebarBox.right > width + 1) {
          throw new Error(`${theme} ${width}px filter drawer is outside the viewport.`);
        }
        await page.screenshot({ path: path.join(outputDirectory, `${theme}-${width}-filters.png`) });
        await page.keyboard.press("Escape");
      }
      await page.close();
    }
  }

  const page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
  await page.goto(`${baseUrl}/zigbee-devices`, { timeout: 45_000, waitUntil: "networkidle" });
  const search = page.getByRole("searchbox");
  await search.fill("SNZB-02P");
  await page.waitForURL(/q=SNZB-02P/, { timeout: 10_000 });
  await page.getByRole("button", { name: /SNZB-02P/i }).waitFor();
  results.push({ flow: "search", url: page.url(), visibleModel: "SNZB-02P" });
  await page.close();

  const confirmed = affiliateLedger.reviews.find((review) => review.directory === "zigbee-devices");
  if (confirmed) {
    const device = zigbeeSnapshot.devices.find((item) => item.slug === confirmed.record_slug);
    if (!device) throw new Error(`Confirmed Amazon review has no Zigbee record: ${confirmed.record_slug}`);
    const affiliatePage = await browser.newPage({ viewport: { height: 900, width: 1280 } });
    await affiliatePage.goto(`${baseUrl}/zigbee-devices?q=${encodeURIComponent(device.model)}`, { timeout: 45_000, waitUntil: "networkidle" });
    await affiliatePage.getByRole("button", { name: new RegExp(device.model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }).first().click();
    const link = affiliatePage.getByRole("link", { name: "Check price on Amazon" });
    if (await link.getAttribute("href") !== `https://www.amazon.com/dp/${confirmed.asin}/ref=nosim?tag=stack127-20`) throw new Error("The rendered Amazon link does not use the confirmed ASIN and stack127 tag.");
    const rel = (await link.getAttribute("rel") ?? "").split(/\s+/);
    if (!rel.includes("sponsored") || !rel.includes("noreferrer")) throw new Error("The rendered Amazon link is missing sponsored or noreferrer.");
    results.push({ asin: confirmed.asin, flow: "amazon-affiliate", model: device.model });
    await affiliatePage.close();
  }
} finally {
  await browser.close();
}

const reportPath = path.join(outputDirectory, "report.json");
await writeFile(reportPath, `${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
console.log(`Zigbee directory QA passed. Report: ${reportPath}`);
