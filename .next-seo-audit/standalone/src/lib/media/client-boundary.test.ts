import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("local media boundary", () => {
  it("keeps signing configuration server-only and removes object-storage clients", () => {
    const env = readFileSync("src/lib/env.ts", "utf8");
    const adapter = readFileSync("src/lib/media/local-storage.ts", "utf8");
    expect(env.startsWith('import "server-only"')).toBe(true);
    expect(adapter).not.toContain("process.env");
    expect(readFileSync("package.json", "utf8")).not.toContain("@aws-sdk");
    expect(readFileSync("next.config.ts", "utf8")).not.toContain("MEDIA_SIGNING_SECRET");
  });
});
