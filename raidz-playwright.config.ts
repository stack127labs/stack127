import { defineConfig, devices } from "playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/*.spec.ts"],
  timeout: 60_000,
  workers: 1,
  expect: { timeout: 5_000 },
  use: {
    baseURL: "http://127.0.0.1:3333",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
