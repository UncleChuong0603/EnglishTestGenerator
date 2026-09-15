import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("R2 client boundary", () => {
  it("keeps credentials server-only and out of browser configuration", () => {
    const env = readFileSync("src/lib/env.ts", "utf8");
    const adapter = readFileSync("src/lib/media/r2-storage.ts", "utf8");
    expect(env.startsWith('import "server-only"')).toBe(true);
    expect(adapter.startsWith('import "server-only"')).toBe(true);
    expect(env).not.toContain("NEXT_PUBLIC_R2");
    expect(readFileSync("next.config.ts", "utf8")).not.toMatch(/R2_(ACCESS|SECRET|ENDPOINT|BUCKET|ACCOUNT)/);
  });
});
