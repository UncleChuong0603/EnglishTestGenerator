import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "task41-remediation.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: "http://localhost:3102",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
});
