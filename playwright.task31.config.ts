import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "task31-acquisition.spec.ts",
  workers: 1,
  retries: 0,
  expect: { timeout: 30_000 },
  use: { baseURL: "http://127.0.0.1:3101", browserName: "chromium", launchOptions: process.env.TASK31_BROWSER_EXECUTABLE ? { executablePath: process.env.TASK31_BROWSER_EXECUTABLE } : undefined, trace: "retain-on-failure" },
});
