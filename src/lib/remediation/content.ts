import { GRAMMAR_LESSONS } from "@/lib/blog/grammar-learning-path";
import type { MistakeReasonCode } from "@/lib/mistake-reasons/catalog";

export type RemediationLessonKind =
  | "GRAMMAR_ARTICLE"
  | "LISTENING_LESSON"
  | "QUESTION_EXPLANATION";

export type MicroLesson = {
  kind: RemediationLessonKind;
  title: { vi: string; en: string };
  summary: { vi: string; en: string };
  href: string | null;
};

const grammarBySubSkill: Record<string, string> = {
  word_form: "loai-tu-trong-toeic-part-5",
  subject_verb_agreement: "hoa-hop-chu-ngu-dong-tu-toeic",
  passive_voice: "cau-bi-dong-toeic-part-5",
  verb_tense: "thi-va-dang-dong-tu-toeic",
  tense: "thi-va-dang-dong-tu-toeic",
  prepositions: "gioi-tu-toeic-trong-cong-viec",
  conjunctions_connectors: "lien-tu-va-tu-noi-toeic",
  connectors: "lien-tu-va-tu-noi-toeic",
  relative_clauses: "menh-de-quan-he-toeic",
  pronouns_determiners: "dai-tu-va-tu-han-dinh-toeic",
  reference_words: "dai-tu-va-tu-han-dinh-toeic",
  gerunds_infinitives: "ving-va-to-infinitive-toeic",
  comparatives: "so-sanh-va-luong-tu-toeic",
  modifiers: "tu-bo-nghia-toeic-part-5",
};

function partGrammarSlug(part: number) {
  if (part <= 2) return "ngu-phap-toeic-part-1-2-nghe-cau";
  if (part <= 4) return "ngu-phap-toeic-part-3-4-theo-doi-hoi-thoai";
  if (part === 5) return "ngu-phap-toeic-part-5-can-hoc";
  return "ngu-phap-toeic-part-6-7-doc-cau-phuc";
}

export function remediationLessonReference(input: {
  reasonCode: MistakeReasonCode;
  part: number;
  subSkill: string;
  listeningLessonId?: string | null;
}): { kind: RemediationLessonKind; ref: string | null } {
  if (input.reasonCode === "GRAMMAR_RULE") {
    return { kind: "GRAMMAR_ARTICLE", ref: grammarBySubSkill[input.subSkill] ?? partGrammarSlug(input.part) };
  }
  if (input.reasonCode === "MISHEARD_WORD" && input.listeningLessonId) {
    return { kind: "LISTENING_LESSON", ref: input.listeningLessonId };
  }
  return { kind: "QUESTION_EXPLANATION", ref: null };
}

export function buildMicroLesson(input: {
  reasonCode: MistakeReasonCode;
  part: number;
  skill: string;
  subSkill: string;
  explanationEn: string | null;
  explanationVi: string | null;
  lessonKind: RemediationLessonKind;
  lessonRef: string | null;
  listeningLesson?: { id: string; title: string; description: string } | null;
}): MicroLesson {
  if (input.lessonKind === "GRAMMAR_ARTICLE" && input.lessonRef) {
    const lesson = GRAMMAR_LESSONS.find((item) => item.slug === input.lessonRef);
    if (lesson) return {
      kind: input.lessonKind,
      title: { vi: lesson.label, en: "Grammar concept review" },
      summary: {
        vi: lesson.summary,
        en: input.explanationEn?.trim() || "Review the grammar rule in context, then apply it to the focused questions.",
      },
      href: `/blog/${lesson.slug}`,
    };
  }
  if (input.lessonKind === "LISTENING_LESSON" && input.listeningLesson) {
    return {
      kind: input.lessonKind,
      title: { vi: input.listeningLesson.title, en: input.listeningLesson.title },
      summary: { vi: input.listeningLesson.description, en: input.listeningLesson.description },
      href: `/listening-lessons/${input.listeningLesson.id}`,
    };
  }
  const fallbackTitles: Partial<Record<MistakeReasonCode, { vi: string; en: string }>> = {
    VOCAB_UNKNOWN: { vi: "Ôn từ trong ngữ cảnh", en: "Vocabulary in context" },
    PARAPHRASE_MISSED: { vi: "Nối câu hỏi với cách diễn đạt tương đương", en: "Match the question to its paraphrase" },
    DISTRACTOR_TRAP: { vi: "Loại phương án gây nhiễu", en: "Eliminate the distractor" },
    MISHEARD_WORD: { vi: "Nghe lại tín hiệu quan trọng", en: "Listen for the key signal" },
    LOST_CONTEXT: { vi: "Khôi phục mạch ngữ cảnh", en: "Recover the context" },
    INFERENCE_ERROR: { vi: "Suy luận từ bằng chứng", en: "Infer from evidence" },
    TIME_PRESSURE: { vi: "Rút gọn bước giải", en: "Use a shorter solving sequence" },
    CARELESS: { vi: "Kiểm tra lại bằng chứng", en: "Verify the evidence" },
  };
  const title = fallbackTitles[input.reasonCode] ?? { vi: "Xem lại lời giải", en: "Review the explanation" };
  return {
    kind: "QUESTION_EXPLANATION",
    title,
    summary: {
      vi: input.explanationVi?.trim() || input.explanationEn?.trim() || "Đọc lại lời giải trước khi làm nhóm câu cùng dạng.",
      en: input.explanationEn?.trim() || input.explanationVi?.trim() || "Review the explanation before trying the focused questions.",
    },
    href: null,
  };
}
