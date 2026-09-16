import { defineConfig, devices } from "playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function findNonPublishedBrowserSpecs(directory: string): string[] {
  const patterns: string[] = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      patterns.push(...findNonPublishedBrowserSpecs(entryPath));
      continue;
    }
    if (entry.name !== "page.json") continue;

    const manifest = JSON.parse(readFileSync(entryPath, "utf8")) as { state?: string };
    if (manifest.state !== "published") {
      const relativeDirectory = path.relative(process.cwd(), directory).split(path.sep).join("/");
      patterns.push(`**/${relativeDirectory}/**/*.spec.ts`);
    }
  }

  return patterns;
}

const nonPublishedBrowserSpecs = process.env.STACK127_INCLUDE_NONPUBLISHED_BROWSER_TESTS === "1"
  ? []
  : findNonPublishedBrowserSpecs(path.join(process.cwd(), "tests/pages"));

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts"],
  testIgnore: nonPublishedBrowserSpecs,
  timeout: Number(process.env.STACK127_TEST_TIMEOUT_MS ?? 60_000),
  workers: 2,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3334",
    trace: "on-first-retry",
  },
  webServer: {
    command: "node scripts/stack127/quality/playwright-web-server.mjs",
    reuseExistingServer: false,
    timeout: 300_000,
    url: "http://127.0.0.1:3334",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
