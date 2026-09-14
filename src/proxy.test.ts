import { describe, expect, it } from "vitest";
import { getCanonicalUrl } from "./proxy";

describe("production canonical host", () => {
  it("redirects www to HTTPS non-www while preserving path and query", () => {
    expect(getCanonicalUrl("http://www.toeicgym.net/practice?part=7", "www.toeicgym.net")?.href)
      .toBe("https://toeicgym.net/practice?part=7");
  });

  it("leaves the canonical and internal hosts unchanged", () => {
    expect(getCanonicalUrl("https://toeicgym.net/", "toeicgym.net")).toBeNull();
    expect(getCanonicalUrl("http://app:3000/api/health", "app:3000")).toBeNull();
  });
});
