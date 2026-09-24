import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getIndependentLesson, independentLessons } from "./independent";

describe("independent listening exercises", () => {
  it("ships usable audio and answerable questions for every linked exercise", async () => {
    expect(independentLessons.length).toBeGreaterThan(0);
    expect(new Set(independentLessons.map(lesson => lesson.slug)).size).toBe(independentLessons.length);
    for (const lesson of independentLessons) {
      expect(getIndependentLesson(lesson.slug)).toBe(lesson);
      expect(lesson.audioUrl).toBe(`/listening-exercises/${lesson.slug}.mp3`);
      const audio = await readFile(join(process.cwd(), "public", lesson.audioUrl));
      expect(audio.byteLength).toBeGreaterThan(10_000);
      expect(audio.subarray(0, 3).toString() === "ID3" || (audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0)).toBe(true);
      expect(lesson.questions.length).toBeGreaterThan(0);
      for (const question of lesson.questions) {
        expect(question.answerIndex).toBeGreaterThanOrEqual(0);
        expect(question.answerIndex).toBeLessThan(question.options.length);
        expect(question.options[question.answerIndex]).toBeTruthy();
      }
    }
  });
});
