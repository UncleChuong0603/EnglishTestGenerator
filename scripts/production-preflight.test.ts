import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const run = (extra: Record<string, string> = {}) => spawnSync(process.execPath, ["scripts/production-preflight.mjs"], {
  cwd: process.cwd(), encoding: "utf8",
  env: { PATH: process.env.PATH, NODE_ENV: "test", SESSION_SECRET: "x".repeat(32), APP_URL: "https://toeicgym.net", DATABASE_URL: "postgresql://app:password@postgres/toeicgym", MEDIA_ENABLED: "false", ...extra },
});

describe("read-only production preflight", () => {
  it("passes without optional providers", () => {
    const result = run();
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/Google OAuth: NOT CONFIGURED/);
    expect(result.stdout).toMatch(/Network calls: NONE/);
    expect(result.stdout).not.toMatch(/password|postgresql:\/\//i);
  });

  it("rejects partial optional credentials without printing them", () => {
    const result = run({ PAYOS_API_KEY: "never-print-this" });
    expect(result.status).toBe(1);
    expect(result.stdout).toMatch(/Payment provider: PAYOS PARTIAL/);
    expect(result.stdout).not.toMatch(/never-print-this/);
  });
});
