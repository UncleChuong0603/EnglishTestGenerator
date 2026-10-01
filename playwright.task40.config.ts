import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "task40-question-reports.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 120_000,
  use: {
    baseURL: process.env.TASK40_BASE_URL ?? "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
});
