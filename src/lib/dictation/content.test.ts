import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listeningTalks } from "@/lib/listening-lessons/talks";

describe("dictation audio segments", () => {
  it("uses only complete one-minute audio/transcript pairs", () => {
    const segments = listeningTalks.filter((talk) => talk.minutes === 1);
    expect(segments.length).toBeGreaterThanOrEqual(3);
    for (const segment of segments) {
      expect(segment.audioUrl).toMatch(/^\/listening-talks\/[a-z0-9-]+\.mp3$/);
      const path = join("public", segment.audioUrl);
      expect(existsSync(path), `${segment.slug} audio exists`).toBe(true);
      expect(statSync(path).size).toBeGreaterThan(1_000);
      expect(segment.transcript.trim().split(/\s+/).length).toBeGreaterThan(80);
    }
  });
});
