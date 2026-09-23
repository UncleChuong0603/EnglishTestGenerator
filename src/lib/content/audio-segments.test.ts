import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { describe, expect, it } from "vitest";
import { planListeningAudio, synthesizeListeningAudio } from "./audio-segments";
import { FakeContentTtsProvider } from "./tts";

const run = promisify(execFile);

describe("listening audio pauses", () => {
  it("separates Question and each answer label from spoken content", () => {
    expect(planListeningAudio({ part: 2, transcript: "Question: Who approved the plan?\nA. Ms. Lee.\nB. Tomorrow.\nC. Upstairs.", question: { options: [{ key: "A", text: "Ms. Lee." }, { key: "B", text: "Tomorrow." }, { key: "C", text: "Upstairs." }] } })).toEqual([
      { text: "Question.", pauseAfterMs: 450 },
      { text: "Who approved the plan?", pauseAfterMs: 1200 },
      { text: "A.", pauseAfterMs: 400 },
      { text: "Ms. Lee.", pauseAfterMs: 1000 },
      { text: "B.", pauseAfterMs: 400 },
      { text: "Tomorrow.", pauseAfterMs: 1000 },
      { text: "C.", pauseAfterMs: 400 },
      { text: "Upstairs.", pauseAfterMs: 0 },
    ]);
  });

  it("separates Part 1 labels and leaves conversation speech intact", () => {
    expect(planListeningAudio({ part: 1, transcript: "A. One.\nB. Two.", question: { options: [{ key: "A", text: "One." }, { key: "B", text: "Two." }] } })).toEqual([
      { text: "A.", pauseAfterMs: 400 }, { text: "One.", pauseAfterMs: 1000 },
      { text: "B.", pauseAfterMs: 400 }, { text: "Two.", pauseAfterMs: 0 },
    ]);
    expect(planListeningAudio({ part: 3, transcript: "MAN: Hello." })).toEqual([{ text: "MAN: Hello.", pauseAfterMs: 0 }]);
  });

  it("inserts a measurable silent interval into the encoded audio", async () => {
    if (!ffmpegPath) throw new Error("FFMPEG_UNAVAILABLE");
    const dir = await mkdtemp(join(tmpdir(), "audio-pause-test-"));
    try {
      const tonePath = join(dir, "tone.mp3");
      await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=0.2", "-af", "adelay=200,apad=pad_dur=0.8", "-ar", "24000", "-ac", "1", "-y", tonePath]);
      const provider = new FakeContentTtsProvider(new Uint8Array(await readFile(tonePath)));
      const result = await synthesizeListeningAudio(provider, { voice: "test", locale: "en-US", outputFormat: "mp3" }, [
        { text: "A.", pauseAfterMs: 400 }, { text: "Answer.", pauseAfterMs: 0 },
      ]);
      const output = join(dir, "result.mp3");
      const pcm = join(dir, "result.pcm");
      await writeFile(output, result);
      await run(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-i", output, "-f", "s16le", "-ar", "24000", "-ac", "1", "-y", pcm]);
      const bytes = await readFile(pcm);
      const samples = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
      const amplitude = (from: number, to: number) => Math.max(...samples.subarray(Math.round(from * 24000), Math.round(to * 24000)).map(Math.abs));
      expect(amplitude(0.05, 0.15)).toBeGreaterThan(1000);
      expect(amplitude(0.3, 0.5)).toBeLessThan(100);
      expect(amplitude(0.65, 0.75)).toBeGreaterThan(1000);
      expect(provider.requests.map(request => request.text)).toEqual(["A.", "Answer."]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
