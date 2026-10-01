import { defineConfig } from "@playwright/test";

if (process.env.TASK42_QA !== "isolated-task42") throw new Error("TASK42_QA guard required");
export default defineConfig({
  testDir: "./e2e",
  testMatch: "task42-account-data.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:30442", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 30442",
    url: "http://127.0.0.1:30442/sign-in",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
