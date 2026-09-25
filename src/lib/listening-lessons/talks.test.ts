import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getListeningTalk, listeningTalks } from "./talks";

describe("personal listening talks", () => {
  it("serves complete talks with matching generated audio at each requested length", async () => {
    const manifest = JSON.parse(await readFile(join(process.cwd(), "public/listening-talks/manifest.json"), "utf8")) as Record<string, { transcriptSha256: string; durationSeconds: number; byteSize: number }>;
    expect(listeningTalks.map(talk => talk.minutes)).toEqual([1, 3, 5, 10]);
    for (const talk of listeningTalks) {
      expect(getListeningTalk(talk.slug)).toBe(talk);
      expect(talk.transcript).toMatch(/^Last spring,/);
      expect(talk.transcript).toMatch(/small moments can change the way a whole day feels\.$/);
      expect(talk.transcript).not.toMatch(/(?:^|\s)(?:A|B|C|D)\.\s/);
      expect(talk.transcript).not.toMatch(/choose the (?:best|correct) (?:answer|response)/i);
      expect(manifest[talk.slug].transcriptSha256).toBe(createHash("sha256").update(talk.transcript).digest("hex"));
      expect(manifest[talk.slug].durationSeconds).toBeGreaterThan(talk.minutes * 60 - 10);
      expect(manifest[talk.slug].durationSeconds).toBeLessThanOrEqual(talk.minutes * 60);
      const audio = await readFile(join(process.cwd(), "public", talk.audioUrl));
      expect(audio.byteLength).toBe(manifest[talk.slug].byteSize);
      expect(audio.subarray(0, 3).toString() === "ID3" || (audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0)).toBe(true);
    }
  });
});
