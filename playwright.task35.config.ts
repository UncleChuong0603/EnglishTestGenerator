import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "task35-weekly-review.spec.ts",
  workers: 1,
  retries: 0,
  expect: { timeout: 30_000 },
  use: { baseURL: "http://127.0.0.1:3101", browserName: "chromium", trace: "retain-on-failure" },
});
