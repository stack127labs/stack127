import { defineConfig, devices } from "playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts"],
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
