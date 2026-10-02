import { afterEach, describe, expect, it, vi } from "vitest";
import config from "../../../next.config";

afterEach(() => vi.unstubAllEnvs());

describe("printable vocabulary canonical", () => {
  it("points the duplicate PDF to the HTML collection on the production host", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "https://preview.example");
    const headers = await config.headers!();
    const pdf = headers.find(rule => rule.source === "/seo/toeic-100-tu-vung.pdf");
    expect(pdf?.headers).toContainEqual({ key: "Link", value: '<https://toeicgym.net/toeic/tu-vung>; rel="canonical"' });
    expect(pdf?.headers.some(header => /noindex/i.test(header.value))).toBe(false);
  });
  it("uses the local site origin for development checks", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("APP_URL", "http://127.0.0.1:3100");
    const headers = await config.headers!();
    const pdf = headers.find(rule => rule.source === "/seo/toeic-100-tu-vung.pdf");
    expect(pdf?.headers).toContainEqual({ key: "Link", value: '<http://127.0.0.1:3100/toeic/tu-vung>; rel="canonical"' });
  });
});
