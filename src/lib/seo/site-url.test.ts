import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl } from "./site-url";

afterEach(() => vi.unstubAllEnvs());

describe("public SEO URL", () => {
  it("uses the public HTTPS origin in production even if the build has a local APP_URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "http://localhost:3000");
    expect(getSiteUrl()).toBe("https://toeicgym.net");
  });

  it("uses the configured origin for local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("APP_URL", "http://localhost:3000/test/");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
