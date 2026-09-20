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
const externalServer = process.env.STACK127_EXTERNAL_SERVER === "1";
const baseURL = process.env.STACK127_TEST_BASE_URL ?? "http://127.0.0.1:3334";
const analyticsConsentState = {
  cookies: [],
  origins: [{
    origin: new URL(baseURL).origin,
    localStorage: [{
      name: "stack127.analytics-consent",
      value: JSON.stringify({ choice: "denied", version: 1 }),
    }],
  }],
};

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts"],
  testIgnore: nonPublishedBrowserSpecs,
  timeout: Number(process.env.STACK127_TEST_TIMEOUT_MS ?? 60_000),
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL,
    storageState: analyticsConsentState,
    trace: "on-first-retry",
  },
  webServer: externalServer ? undefined : {
    command: "node scripts/stack127/quality/playwright-web-server.mjs",
    reuseExistingServer: false,
    timeout: 300_000,
    url: baseURL,
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
