import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  retries: 0,
  expect: { timeout: 30_000 },
  use: {
    baseURL: process.env.TASK30_BASE_URL ?? "http://127.0.0.1:3100",
    launchOptions: process.env.TASK30_BROWSER_EXECUTABLE ? { executablePath: process.env.TASK30_BROWSER_EXECUTABLE } : {},
    trace: "retain-on-failure",
  },
});
