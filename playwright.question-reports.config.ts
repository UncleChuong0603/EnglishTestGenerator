import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "question-reports.spec.ts",
  workers: 1,
  retries: 0,
  use: { baseURL: "http://127.0.0.1:3112", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3112",
    url: "http://127.0.0.1:3112/sign-in",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
