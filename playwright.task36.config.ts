import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", testMatch: "task36-email.spec.ts", workers: 1, retries: 0,
  timeout: 90_000, expect: { timeout: 30_000 },
  use: { baseURL: "http://127.0.0.1:3106", browserName: "chromium", trace: "off" },
});
