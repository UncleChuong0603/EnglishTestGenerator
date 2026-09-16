import { startRecommendedPractice } from "@/app/practice/actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { taxonomyLabel } from "@/lib/i18n/labels";
import type { WorkoutRecommendation } from "@/lib/diagnosis/types";

const copy = {
  en: { label: "Recommended next", focus: "Primary focus", why: "Why this workout?", start: "Start recommended workout", build: "We need more data", buildReason: "Complete a few more questions so TOEICGym can personalize your training.", early: "This exploration workout builds a more reliable profile.", supported: "Based on your observed practice, this is your highest-priority supported improvement area.", correct: "correct", questions: "questions" },
  vi: { label: "Bài luyện tiếp theo", focus: "Trọng tâm chính", why: "Vì sao đề xuất bài này?", start: "Bắt đầu bài luyện đề xuất", build: "Cần thêm dữ liệu", buildReason: "Hãy hoàn thành thêm một số câu để TOEICGym có thể cá nhân hóa việc luyện tập.", early: "Bài luyện khám phá này giúp xây dựng hồ sơ đáng tin cậy hơn.", supported: "Dựa trên kết quả luyện tập đã ghi nhận, đây là nội dung được hỗ trợ bởi đủ dữ liệu và cần ưu tiên cải thiện.", correct: "đúng", questions: "câu" },
} as const;

export function UnifiedRecommendationCard({ recommendation, locale }: { recommendation: WorkoutRecommendation; locale: InterfaceLanguage }) {
  const t = copy[locale]; const focus = recommendation.primarySubskill ?? recommendation.primarySkill;
  const title = recommendation.kind === "EXPLORATION" ? t.build : `${recommendation.skillArea === "LISTENING" ? "Listening" : "Reading"}${recommendation.part ? ` · Part ${recommendation.part}` : ""}${focus ? ` · ${taxonomyLabel(focus, locale)}` : ""}`;
  const reason = recommendation.evidence ? `${recommendation.evidence.correctCount}/${recommendation.evidence.attemptedCount} ${t.correct} · ${recommendation.evidence.accuracy}%. ${t.supported}` : recommendation.reasonCode === "EARLY_EXPLORATION" ? t.early : t.buildReason;
  return <section className="rounded-3xl border border-teal-200 bg-teal-50 p-6 text-slate-900 sm:p-8"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{t.label}</p><h2 className="mt-2 text-2xl font-black">{title}</h2>{focus ? <p className="mt-2 text-sm font-bold">{t.focus}: {taxonomyLabel(focus, locale)}</p> : null}<h3 className="mt-5 font-black">{t.why}</h3><p className="mt-2 max-w-3xl leading-7 text-slate-600">{reason}</p><p className="mt-3 text-sm text-slate-500">~{recommendation.questionCount} {t.questions}{recommendation.groupCount ? ` · ${recommendation.groupCount} groups` : ""}</p><form action={startRecommendedPractice} className="mt-6"><button className="min-h-12 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" type="submit">{t.start}</button></form></section>;
}
