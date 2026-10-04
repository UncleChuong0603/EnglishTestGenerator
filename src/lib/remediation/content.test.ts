import { describe, expect, it } from "vitest";
import { GRAMMAR_LESSONS } from "@/lib/blog/grammar-learning-path";
import { buildMicroLesson, remediationLessonReference } from "./content";

describe("remediation micro lessons", () => {
  it("links grammar reasons to a real canonical lesson", () => {
    const reference = remediationLessonReference({ reasonCode: "GRAMMAR_RULE", part: 5, subSkill: "word_form" });
    expect(reference).toEqual({ kind: "GRAMMAR_ARTICLE", ref: "loai-tu-trong-toeic-part-5" });
    expect(GRAMMAR_LESSONS.some((lesson) => lesson.slug === reference.ref)).toBe(true);
  });

  it("uses a published listening lesson reference only when available", () => {
    expect(remediationLessonReference({ reasonCode: "MISHEARD_WORD", part: 3, subSkill: "detail", listeningLessonId: "lesson-1" }))
      .toEqual({ kind: "LISTENING_LESSON", ref: "lesson-1" });
    expect(remediationLessonReference({ reasonCode: "MISHEARD_WORD", part: 3, subSkill: "detail" }))
      .toEqual({ kind: "QUESTION_EXPLANATION", ref: null });
  });

  it("falls back to the canonical question explanation without runtime generation", () => {
    const lesson = buildMicroLesson({
      reasonCode: "PARAPHRASE_MISSED", part: 7, skill: "detail", subSkill: "explicit_information",
      explanationEn: "The notice restates the deadline as Friday.", explanationVi: "Thông báo diễn đạt lại hạn chót là thứ Sáu.",
      lessonKind: "QUESTION_EXPLANATION", lessonRef: null,
    });
    expect(lesson.summary.en).toContain("restates");
    expect(lesson.href).toBeNull();
  });
});
