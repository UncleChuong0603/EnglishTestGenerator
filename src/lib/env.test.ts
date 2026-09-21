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
    ]) vi.stubEnv(name, "");
    vi.stubEnv("MEDIA_ENABLED", "false");

    expect(getServerEnv()).toMatchObject({
      DATABASE_URL: validProductionEnv.DATABASE_URL,
      MEDIA_STORAGE_PROVIDER: "LOCAL",
    });
  });

  it("rejects non-local media providers", () => {
    stubValidProductionEnv();
    vi.stubEnv("MEDIA_STORAGE_PROVIDER", "R2");

    expect(() => getServerEnv()).toThrow("MEDIA_STORAGE_PROVIDER");
  });

  it("keeps Google OAuth optional in production", () => {
    stubValidProductionEnv();
    vi.stubEnv("GOOGLE_CLIENT_ID", "");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");

    expect(getServerEnv()).toMatchObject({
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
    });
  });

  it("rejects a partially configured optional Google OAuth integration", () => {
    stubValidProductionEnv();
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "");

    expect(() => getServerEnv()).toThrow("must be configured together");
  });

  it("does not expose secret values in validation errors", () => {
    stubValidProductionEnv();
    vi.stubEnv("SESSION_SECRET", "do-not-log-this-secret");
    vi.stubEnv("MEDIA_STORAGE_PROVIDER", "external-provider");

    let message = "";
    try { getServerEnv(); } catch (error) { message = error instanceof Error ? error.message : String(error); }
    expect(message).toContain("MEDIA_STORAGE_PROVIDER");
    expect(message).not.toContain("do-not-log-this-secret");
  });
});
