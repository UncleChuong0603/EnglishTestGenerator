import type { InterfaceLanguage } from "@/lib/i18n/config";
import { taxonomyLabel } from "@/lib/i18n/labels";
import type { ReviewQuestion } from "@/lib/practice/types";
import { RemediationSubmit } from "./remediation-submit";

const stageStyles = {
  NEEDS_REVIEW: "border-amber-200 bg-amber-50 text-amber-900",
  STRENGTHENING: "border-sky-200 bg-sky-50 text-sky-900",
  MASTERED: "border-emerald-200 bg-emerald-50 text-emerald-900",
} as const;

export function RemediationCard({
  question,
  locale,
  sessionId,
  action,
}: {
  question: ReviewQuestion;
  locale: InterfaceLanguage;
  sessionId: string;
  action?: (formData: FormData) => void | Promise<void>;
}) {
  if (!question.remediation || question.isCorrect) return null;
  const vi = locale === "vi";
  const labels = vi
    ? {
        NEEDS_REVIEW: "Cần ôn",
        STRENGTHENING: "Đang củng cố",
        MASTERED: "Đã nắm",
      }
    : {
        NEEDS_REVIEW: "Needs review",
        STRENGTHENING: "Strengthening",
        MASTERED: "Mastered",
      };
  const stage = question.remediation.stage;

  return (
    <section
      aria-labelledby={`remediation-${question.number}`}
      className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black uppercase tracking-wider text-teal-800">
          {vi ? "Bước tiếp theo" : "Next step"}
        </p>
        <span
          className={`rounded-full border px-3 py-1 text-sm font-bold ${stageStyles[stage]}`}
        >
          {labels[stage]}
        </span>
      </div>
      <h4 className="mt-3 text-lg font-black" id={`remediation-${question.number}`}>
        {vi ? "Củng cố đúng dạng vừa sai" : "Reinforce the skill you missed"}
      </h4>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-3">
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {vi ? "Kỹ năng" : "Skill"}
          </dt>
          <dd className="mt-1 font-bold">{taxonomyLabel(question.skill, locale)}</dd>
        </div>
        <div className="rounded-xl bg-white p-3">
          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {vi ? "Dạng cần nhớ" : "Concept to remember"}
          </dt>
          <dd className="mt-1 font-bold">{taxonomyLabel(question.subSkill, locale)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm leading-6 text-slate-700">
        {vi
          ? `${question.remediation.reviewSuccessStreak}/2 lần đúng liên tiếp khi ôn. Một câu khác cùng dạng sẽ được ưu tiên nếu ngân hàng đủ nội dung.`
          : `${question.remediation.reviewSuccessStreak}/2 consecutive correct reviews. A different question with the same taxonomy is preferred when content is available.`}
      </p>
      {stage !== "MASTERED" && action ? (
        <form action={action} className="mt-4">
          <input name="sourceSessionId" type="hidden" value={sessionId} />
          <input name="questionNumber" type="hidden" value={question.number} />
          <RemediationSubmit locale={locale} />
        </form>
      ) : null}
      <p className="mt-3 text-xs leading-5 text-slate-600">
        {vi
          ? "Nếu chưa có câu khác đủ chuẩn, hệ thống sẽ chuyển về ôn lỗi sai hiện tại."
          : "If no suitable replacement exists, the current Mistake Review flow is used."}
      </p>
    </section>
  );
}
