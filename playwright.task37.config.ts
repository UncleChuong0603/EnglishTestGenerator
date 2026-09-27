import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "task37-pricing.spec.ts",
  workers: 1,
  retries: 0,
  expect: { timeout: 30_000 },
  use: { baseURL: "http://127.0.0.1:3101", browserName: "chromium", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3101",
    url: "http://127.0.0.1:3101/pricing",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
