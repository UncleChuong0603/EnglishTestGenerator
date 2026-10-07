import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import config from "../../../next.config";
import { STATIC_PUBLIC_PATHS } from "./routes";

describe("public listening library indexability", () => {
  it("publishes the library with its own canonical metadata and sitemap entry", () => {
    const page = readFileSync("src/app/listening-lessons/page.tsx", "utf8");
    expect(page).toContain('canonical: "/listening-lessons"');
    expect(STATIC_PUBLIC_PATHS).toContain("/listening-lessons");
  });

  it("keeps descendants noindex without excluding the public library root", async () => {
    const headers = await config.headers!();
    const noindexSources = headers
      .filter(rule => rule.headers.some(header => /noindex/i.test(header.value)))
      .map(rule => rule.source);

    expect(noindexSources).toContain("/listening-lessons/:path+");
    expect(noindexSources).not.toContain("/listening-lessons");
    expect(noindexSources).not.toContain("/listening-lessons/:path*");
  });
});
