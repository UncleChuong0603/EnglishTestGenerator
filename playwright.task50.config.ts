import { defineConfig } from "@playwright/test";

if (process.env.TASK50_QA !== "isolated-task50")
  throw new Error("TASK50_QA guard required");
export default defineConfig({
  testDir: "./e2e",
  testMatch: "task50-dictation.spec.ts",
  workers: 1,
  retries: 0,
  timeout: 90_000,
  use: { baseURL: "http://127.0.0.1:30550", trace: "retain-on-failure" },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 30550",
    url: "http://127.0.0.1:30550/sign-in",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
