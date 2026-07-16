import { expect, test, type Page } from "playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

type PageCoverageEntry = {
  route: string;
  state: "published" | "unpublished" | "noindex";
  tests: string[];
  reason?: string;
};

function pageManifests(directory = path.join(process.cwd(), "tests", "pages")): PageCoverageEntry[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return pageManifests(entryPath);
    if (entry.name !== "page.json") return [];
    return [JSON.parse(readFileSync(entryPath, "utf8")) as PageCoverageEntry];
  });
}

const routes = Object.fromEntries(pageManifests().map((entry) => [entry.route, entry]));
const publishedPaths = Object.entries(routes)
  .filter(([, entry]) => entry.state === "published")
  .map(([path]) => path);
const unpublishedPaths = Object.entries(routes)
  .filter(([, entry]) => entry.state === "unpublished")
  .map(([path]) => path);
const noindexPaths = Object.entries(routes)
  .filter(([, entry]) => entry.state === "noindex")
  .map(([path]) => path);

async function robotsContent(page: Page) {
  return page.locator('meta[name="robots"]').getAttribute("content");
}

function canonicalPattern(path: string) {
  if (path === "/") return /^https:\/\/version127\.com\/?$/;
  return new RegExp(`^https://version127\\.com${path}$`);
}

test.describe("Version127 publication SEO", () => {
  for (const path of publishedPaths) {
    test(`${path} is published and indexable`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("[data-app-main] h1")).toHaveCount(1);
      await expect(page.locator("[data-app-main] h1")).toBeVisible();
      await expect(page.locator("[data-app-sidebar] h1")).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonicalPattern(path));
      await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);

      const robots = await robotsContent(page);
      expect(robots ?? "index, follow").not.toContain("noindex");
    });
  }

  test("query variants are noindex and keep the clean canonical", async ({ page }) => {
    const response = await page.goto("/self-host-apps?category=automation");

    expect(response?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/self-host-apps$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  });

  test("old self-hosting course slug is not redirected", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "request-level route guard only needs one project");

    const root = await request.get("/self-hosting");
    expect(root?.status()).toBe(404);

    const lesson = await request.get("/self-hosting/linux-ssh-basics");
    expect(lesson?.status()).toBe(404);
  });

  test("all unpublished route manifest entries remain unavailable", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "request-level route guard only needs one project");
    test.setTimeout(120_000);

    const failures: string[] = [];
    for (const path of unpublishedPaths) {
      const response = await request.get(path);
      if (response.status() !== 404) {
        failures.push(`${path} returned ${response.status()}`);
      }
    }

    expect(failures).toEqual([]);
  });

  for (const path of noindexPaths) {
    test(`${path} is visible but remains noindex`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.locator("[data-app-main] h1")).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
    });
  }

  test("robots.txt allows public crawling and excludes API routes", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "request-level robots guard only needs one project");

    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);

    const lines = (await response.text())
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    expect(lines).toContain("User-Agent: *");
    expect(lines).toContain("Allow: /");
    expect(lines).toContain("Disallow: /api/");
    expect(lines).not.toContain("Disallow: /");
    expect(lines).toContain("Sitemap: https://version127.com/sitemap.xml");
  });

  test("sitemap includes published pages and excludes unpublished routes", async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "request-level sitemap guard only needs one project");

    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);

    const xml = await response.text();
    for (const path of publishedPaths) {
      expect(xml).toContain(`https://version127.com${path === "/" ? "" : path}`);
    }
    for (const path of unpublishedPaths) {
      expect(xml).not.toContain(`https://version127.com${path}`);
    }
    for (const path of noindexPaths) {
      expect(xml).not.toContain(`https://version127.com${path}`);
    }
    expect(xml).not.toContain("https://version127.com/self-hosting</loc>");
    expect(xml).not.toContain("https://version127.com/self-hosting/");
  });
});
