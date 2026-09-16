import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("rate limit configuration", () => {
  it("defines a concrete limit for every accepted action including guest practice", () => {
    const source = readFileSync("src/lib/auth/rate-limit.ts", "utf8");
    expect(source).toContain('"google_oauth" | "guest_practice"');
    expect(source).toContain("guest_practice: { attempts: 20, windowMs: 900_000 }");
  });
});
