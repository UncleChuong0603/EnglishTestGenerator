import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getPartExercise, partExercises } from "./part-exercises";

describe("Part listening exercises", () => {
  it("includes ten complete, distinct exercises for every Part", async () => {
    expect(partExercises).toHaveLength(40);
    expect(new Set(partExercises.map(lesson => lesson.slug)).size).toBe(40);
    for (const part of [1, 2, 3, 4]) {
      const lessons = partExercises.filter(lesson => lesson.toeicPart === part);
      expect(lessons).toHaveLength(10);
      expect(new Set(lessons.map(lesson => lesson.transcript)).size).toBe(10);
      expect(new Set(lessons.map(lesson => lesson.questions[0].answerIndex))).toEqual(new Set([0, 1, 2]));
      for (const lesson of lessons) {
        expect(getPartExercise(part, lesson.slug)).toBe(lesson);
        expect(lesson.questions).toHaveLength(1);
        const question = lesson.questions[0];
        expect(new Set(question.options).size).toBe(3);
        expect(question.options[question.answerIndex]).toBeTruthy();
        const audio = await readFile(join(process.cwd(), "public", lesson.audioUrl));
        expect(audio.byteLength).toBeGreaterThan(30_000);
        expect(audio.subarray(0, 3).toString() === "ID3" || (audio[0] === 0xff && (audio[1] & 0xe0) === 0xe0)).toBe(true);
        if (part === 1) {
          expect(lesson.imageUrl).toBeTruthy();
          const image = await stat(join(process.cwd(), "public", lesson.imageUrl!));
          expect(image.size).toBeGreaterThan(100);
        } else {
          expect(lesson.imageUrl).toBeUndefined();
        }
        if (part <= 2) {
          expect(lesson.transcript).toContain(`A. ${question.options[0]} B. ${question.options[1]} C. ${question.options[2]}`);
        }
      }
    }
  });
});
