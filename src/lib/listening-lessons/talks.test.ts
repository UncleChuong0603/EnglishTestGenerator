import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getListeningTalk, listeningTalks } from "./talks";

describe("personal listening talks", () => {
  it("serves different stories and topics with matching generated audio at every length", async () => {
    const manifest = JSON.parse(await readFile(join(process.cwd(), "public/listening-talks/manifest.json"), "utf8")) as Record<string, { transcriptSha256: string; durationSeconds: number; byteSize: number }>;
    expect(listeningTalks).toHaveLength(10);
    expect([1, 3, 5, 10].map(minutes => listeningTalks.filter(talk => talk.minutes === minutes).length)).toEqual([3, 3, 3, 1]);
    expect(new Set(listeningTalks.map(talk => talk.topicEn)).size).toBe(listeningTalks.length);
    expect(new Set(listeningTalks.map(talk => talk.titleEn)).size).toBe(listeningTalks.length);
    expect(new Set(listeningTalks.map(talk => talk.transcript)).size).toBe(listeningTalks.length);
    const allParagraphs = listeningTalks.flatMap(talk => talk.transcript.split(/\n\s*\n/));
    expect(new Set(allParagraphs).size).toBe(allParagraphs.length);
    for (const talk of listeningTalks) {
      expect(getListeningTalk(talk.slug)).toBe(talk);
      expect(talk.transcript.split(/\s+/).length).toBeGreaterThan(120);
      expect(talk.transcript.trim().endsWith(".")).toBe(true);
      expect(talk.transcript).not.toMatch(/(?:^|\s)(?:A|B|C|D)\.\s/);
      expect(talk.transcript).not.toMatch(/choose the (?:best|correct) (?:answer|response)/i);
      expect(manifest[talk.slug].transcriptSha256).toBe(createHash("sha256").update(talk.transcript).digest("hex"));
      expect(manifest[talk.slug].durationSeconds).toBeGreaterThan(talk.minutes * 60 * 0.75);
      expect(manifest[talk.slug].durationSeconds).toBeLessThanOrEqual(talk.minutes * 60);
      const audio = await readFile(join(process.cwd(), "public", talk.audioUrl));
      expect(audio.byteLength).toBe(manifest[talk.slug].byteSize);
      expect(audio.subarray(0, 3).toString() === "ID3" || (audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0)).toBe(true);
    }
  });
});
