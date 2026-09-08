#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const argument = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const baseUrl = argument("--base-url") ?? "http://127.0.0.1:3333";
const outputDirectory = argument("--output") ?? "/tmp/stack127-hardware-directory-qa";
const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const allDirectories = [
  "zigbee-coordinators",
  "z-wave-devices",
  "nut-compatible-ups",
  "local-security-cameras",
  "matter-devices",
];
const requestedRoute = argument("--route");
const directories = requestedRoute ? allDirectories.filter((route) => route === requestedRoute) : allDirectories;
if (directories.length === 0) throw new Error(`Unknown directory route: ${requestedRoute}`);
const requestedWidth = Number.parseInt(argument("--width") ?? "", 10);
const widths = Number.isFinite(requestedWidth) ? [requestedWidth] : [1280, 375];
const themes = ["dark", "light"];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
const affiliateLedger = JSON.parse(await readFile(path.join(repositoryRoot, "lib/amazon-affiliate/data/confirmed.json"), "utf8"));

async function pageMeasurement(page, route) {
  return page.evaluate((imagePrefix) => {
    const images = [...document.querySelectorAll(`img[src^="${imagePrefix}"]`)];
    const regions = Object.fromEntries([
      ["card", ".directory-card"],
      ["main", "[data-app-main]"],
      ["results", ".directory-results"],
    ].map(([name, selector]) => {
      const element = document.querySelector(selector);
      if (!(element instanceof HTMLElement)) return [name, null];
      const box = element.getBoundingClientRect();
      return [name, { clientWidth: element.clientWidth, left: box.left, right: box.right, scrollWidth: element.scrollWidth }];
    }));
    return {
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      imageCount: images.length,
      missingImageCount: [...document.querySelectorAll("span")].filter((element) => element.textContent === "Product image not published").length,
      overflowElements: [...document.querySelectorAll("body *")].map((element) => {
        const box = element.getBoundingClientRect();
        return { className: element.className, right: Math.round(box.right), scrollWidth: element.scrollWidth, tag: element.tagName };
      }).filter((element) => element.right > document.documentElement.clientWidth + 1).slice(0, 8),
      regions,
    };
  }, `/hardware-directory-images/${route}/`);
}

function assertLayout(measurement, label, width) {
  if (measurement.imageCount + measurement.missingImageCount === 0) throw new Error(`${label} has no rendered product-image state.`);
  if (measurement.documentScrollWidth > measurement.documentClientWidth) throw new Error(`${label} has page-level horizontal overflow: ${JSON.stringify({ overflowElements: measurement.overflowElements, regions: measurement.regions })}.`);
  for (const [name, region] of Object.entries(measurement.regions)) {
    if (!region) throw new Error(`${label} is missing ${name}.`);
    if (region.scrollWidth > region.clientWidth + 1) throw new Error(`${label} ${name} overflows horizontally.`);
    if (region.left < -1 || region.right > width + 1) throw new Error(`${label} ${name} is outside the viewport.`);
  }
}

try {
  for (const route of directories) {
    const snapshot = JSON.parse(await readFile(path.join(repositoryRoot, `lib/hardware-directories/data/${route}.json`), "utf8"));
    for (const theme of themes) {
      for (const width of widths) {
        const page = await browser.newPage({ viewport: { height: 1000, width } });
        const label = `${route} ${theme} ${width}px`;
        await page.goto(`${baseUrl}/${route}`, { timeout: 45_000, waitUntil: "networkidle" });
        await page.evaluate((value) => document.documentElement.setAttribute("data-theme", value), theme);
        await page.locator(".directory-card").first().waitFor();

        const productImages = page.locator(`img[src^="/hardware-directory-images/${route}/"]`);
        if (theme === "dark" && width === 1280) {
          for (let index = 0; index < await productImages.count(); index += 1) {
            const image = productImages.nth(index);
            await image.scrollIntoViewIfNeeded();
            await image.evaluate((element) => element.complete && element.naturalWidth > 0 || new Promise((resolve) => {
              element.addEventListener("load", () => resolve(true), { once: true });
              element.addEventListener("error", () => resolve(false), { once: true });
            })).then((loaded) => {
              if (!loaded) throw new Error(`${label} has a broken product image.`);
            });
          }
          await page.locator(".directory-card").first().scrollIntoViewIfNeeded();
        }

        const measurement = await pageMeasurement(page, route);
        assertLayout(measurement, label, width);
        await page.screenshot({ path: path.join(outputDirectory, `${route}-${theme}-${width}-page.png`), fullPage: true });

        const opener = page.locator(".directory-card").first();
        await opener.click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();
        const dialogImage = dialog.locator(`img[src^="/hardware-directory-images/${route}/"]`);
        if (await dialogImage.count()) {
          if (!await dialogImage.evaluate((element) => element.complete && element.naturalWidth > 0)) throw new Error(`${label} dialog image is broken.`);
        } else if (!await dialog.getByText("Product image not published", { exact: true }).count()) {
          throw new Error(`${label} dialog has no product-image state.`);
        }
        const dialogBox = await dialog.boundingBox();
        if (!dialogBox || dialogBox.x < -1 || dialogBox.x + dialogBox.width > width + 1) throw new Error(`${label} dialog is outside the viewport.`);
        await page.screenshot({ path: path.join(outputDirectory, `${route}-${theme}-${width}-dialog.png`) });
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "detached" });
        if (!await opener.evaluate((element) => element === document.activeElement)) throw new Error(`${label} did not restore focus to the opened card.`);

        if (width <= 900) {
          const filterToggle = page.getByRole("button", { name: "Filters" });
          await filterToggle.click();
          await page.waitForFunction(() => document.querySelector('button[aria-controls="app-sidebar-drawer"]')?.getAttribute("aria-expanded") === "true");
          await page.waitForTimeout(250);
          const sidebarBox = await page.locator("[data-app-sidebar]").boundingBox();
          if (!sidebarBox || sidebarBox.x < -1 || sidebarBox.x + sidebarBox.width > width + 1) throw new Error(`${label} filter drawer is outside the viewport.`);
          await page.screenshot({ path: path.join(outputDirectory, `${route}-${theme}-${width}-filters.png`) });
          await page.keyboard.press("Escape");
        }

        results.push({ imageCount: measurement.imageCount, route, theme, width });
        await page.close();
      }
    }

    const page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
    const query = snapshot.records[0].model;
    await page.goto(`${baseUrl}/${route}`, { timeout: 45_000, waitUntil: "networkidle" });
    await page.locator('[data-live-filter-ready="true"]').waitFor();
    await page.getByRole("searchbox").fill(query);
    await page.waitForURL((url) => url.searchParams.get("q") === query, { timeout: 30_000 });
    await page.locator(".directory-card").first().waitFor();
    results.push({ flow: "search", query, route, url: page.url() });
    await page.close();

    const confirmed = affiliateLedger.reviews.find((review) => review.directory === route);
    if (confirmed) {
      const record = snapshot.records.find((item) => item.slug === confirmed.record_slug);
      if (!record) throw new Error(`Confirmed Amazon review has no ${route} record: ${confirmed.record_slug}`);
      const affiliatePage = await browser.newPage({ viewport: { height: 900, width: 1280 } });
      await affiliatePage.goto(`${baseUrl}/${route}?q=${encodeURIComponent(record.model)}`, { timeout: 45_000, waitUntil: "networkidle" });
      await affiliatePage.getByRole("button", { name: new RegExp(record.model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }).first().click();
      const link = affiliatePage.getByRole("link", { name: "Check price on Amazon" });
      if (await link.getAttribute("href") !== `https://www.amazon.com/dp/${confirmed.asin}/ref=nosim?tag=stack127-20`) throw new Error(`${route} rendered the wrong Amazon ASIN or partner tag.`);
      const rel = (await link.getAttribute("rel") ?? "").split(/\s+/);
      if (!rel.includes("sponsored") || !rel.includes("noreferrer")) throw new Error(`${route} Amazon link is missing sponsored or noreferrer.`);
      results.push({ asin: confirmed.asin, flow: "amazon-affiliate", model: record.model, route });
      await affiliatePage.close();
    }
  }
} finally {
  await browser.close();
}

const reportPath = path.join(outputDirectory, "report.json");
await writeFile(reportPath, `${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
console.log(`Hardware directory QA passed. Report: ${reportPath}`);
