import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "task32-seo.spec.ts",
  workers: 1,
  use: { baseURL: process.env.TASK32_BASE_URL },
});
