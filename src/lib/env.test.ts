import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getServerEnv } from "./env";

const validProductionEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://app:password@postgres:5432/toeicgym",
  SESSION_SECRET: "a-secure-production-session-secret",
  APP_URL: "https://toeicgym.net",
  GOOGLE_CLIENT_ID: "google-client",
  GOOGLE_CLIENT_SECRET: "google-secret",
};

function stubValidProductionEnv() {
  for (const [name, value] of Object.entries(validProductionEnv)) vi.stubEnv(name, value);
}

afterEach(() => vi.unstubAllEnvs());

describe("production server environment", () => {
  it("treats empty optional integration values as absent", () => {
    stubValidProductionEnv();
    for (const name of [
      "SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "MEDIA_SIGNING_SECRET",
      "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME", "R2_ENDPOINT", "R2_PUBLIC_BASE_URL",
    ]) vi.stubEnv(name, "");
    vi.stubEnv("MEDIA_ENABLED", "false");

    expect(getServerEnv()).toMatchObject({
      DATABASE_URL: validProductionEnv.DATABASE_URL,
      R2_ENDPOINT: undefined,
      R2_PUBLIC_BASE_URL: undefined,
    });
  });

  it("still rejects incomplete R2 configuration", () => {
    stubValidProductionEnv();
    vi.stubEnv("R2_ACCOUNT_ID", "configured-account");
    vi.stubEnv("R2_ACCESS_KEY_ID", "");

    expect(() => getServerEnv()).toThrow("R2 configuration must be complete");
  });

  it("does not expose secret values in validation errors", () => {
    stubValidProductionEnv();
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "do-not-log-this-secret");
    vi.stubEnv("R2_ENDPOINT", "not-a-url");

    let message = "";
    try { getServerEnv(); } catch (error) { message = error instanceof Error ? error.message : String(error); }
    expect(message).toContain("R2_ENDPOINT");
    expect(message).not.toContain("do-not-log-this-secret");
  });
});
