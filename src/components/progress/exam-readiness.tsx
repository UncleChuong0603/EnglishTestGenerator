import Link from "next/link";
import { taxonomyLabel } from "@/lib/i18n/labels";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { EvidenceState, ExamReadiness as Readiness } from "@/lib/readiness/policy";

const stateStyle: Record<EvidenceState, string> = {
  INSUFFICIENT_DATA: "border-slate-200 bg-slate-100 text-slate-700",
  NEEDS_WORK: "border-rose-200 bg-rose-50 text-rose-800",
  DEVELOPING: "border-amber-200 bg-amber-50 text-amber-900",
  STABLE: "border-sky-200 bg-sky-50 text-sky-900",
  STRONG: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const labels: Record<EvidenceState, { vi: string; en: string }> = {
  INSUFFICIENT_DATA: { vi: "Chưa đủ dữ liệu", en: "Insufficient data" },
  NEEDS_WORK: { vi: "Cần củng cố", en: "Needs work" },
  DEVELOPING: { vi: "Đang phát triển", en: "Developing" },
  STABLE: { vi: "Ổn định", en: "Stable" },
  STRONG: { vi: "Vững", en: "Strong" },
};

function StateBadge({ state, locale }: { state: EvidenceState; locale: InterfaceLanguage }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${stateStyle[state]}`}>{labels[state][locale]}</span>;
}

function EvidenceCard({ name, evidence, locale }: {
  name: string;
  evidence: Readiness["listening"];
  locale: InterfaceLanguage;
}) {
  const vi = locale === "vi";
  return <article className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-lg font-black">{name}</h3><StateBadge state={evidence.state} locale={locale} /></div>
    <p className="mt-4 text-2xl font-black">{evidence.accuracy === null ? "—" : `${evidence.accuracy}%`}</p>
    <p className="mt-1 text-sm leading-6 text-slate-600">
      {vi
        ? `Dựa trên ${evidence.answered} câu đã trả lời${evidence.answered < evidence.minimumSample ? `; cần ít nhất ${evidence.minimumSample} câu để phân loại.` : "."}`
        : `Based on ${evidence.answered} answered questions${evidence.answered < evidence.minimumSample ? `; at least ${evidence.minimumSample} are needed to classify.` : "."}`}
    </p>
  </article>;
}

export function ExamReadiness({ readiness, locale }: { readiness: Readiness; locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  const actionLabels = {
    TAKE_DIAGNOSTIC: vi ? "Làm bài đánh giá đầu vào" : "Take the diagnostic",
    REVIEW_MISTAKES: vi ? `Ôn ${readiness.mastery.unresolved} lỗi chưa xử lý` : `Review ${readiness.mastery.unresolved} unresolved mistakes`,
    PRACTICE_LISTENING: vi ? "Luyện Listening tiếp theo" : "Practice Listening next",
    PRACTICE_READING: vi ? "Luyện Reading tiếp theo" : "Practice Reading next",
    TAKE_FULL_MOCK: vi ? "Làm Full Mock" : "Take a Full Mock",
    CONTINUE_WEEKLY_PLAN: vi ? "Tiếp tục kế hoạch tuần" : "Continue weekly plan",
  } as const;
  const examText = readiness.goal.daysUntilExam === null
    ? (vi ? "Chưa đặt ngày thi" : "No exam date set")
    : readiness.goal.daysUntilExam < 0
      ? (vi ? "Ngày thi đã qua" : "Exam date has passed")
      : readiness.goal.daysUntilExam === 0
        ? (vi ? "Ngày thi là hôm nay" : "Exam is today")
        : (vi ? `Còn ${readiness.goal.daysUntilExam} ngày đến kỳ thi` : `Exam in ${readiness.goal.daysUntilExam} days`);

  return <section className="mt-8 overflow-hidden rounded-3xl border border-teal-200 bg-[#f7fbf9]" aria-labelledby="exam-readiness-heading">
    <div className="border-b border-teal-100 px-5 py-6 sm:px-7">
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-800">Road to Target</p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="exam-readiness-heading" className="text-2xl font-black sm:text-3xl">{vi ? "Mức sẵn sàng dựa trên bằng chứng" : "Evidence-based exam readiness"}</h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">{vi ? "Đây là trạng thái từ lịch sử học thật, không phải điểm TOEIC dự đoán hay xác suất đạt mục tiêu." : "These states come from real learning history—not a predicted TOEIC score or target probability."}</p>
        </div>
        <div className="sm:text-right">
          <p className="font-black text-slate-900">{examText}</p>
          <p className="mt-1 text-sm text-slate-600">{readiness.goal.targetScore ? `${vi ? "Mục tiêu" : "Target"}: ${readiness.goal.targetScore}` : (vi ? "Chưa đặt điểm mục tiêu" : "No target score set")}</p>
          {!readiness.goal.examDate || !readiness.goal.targetScore ? <Link className="inline-flex min-h-11 items-center text-sm font-bold text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/settings?section=goal">{vi ? "Cập nhật mục tiêu" : "Update goal"}</Link> : null}
        </div>
      </div>
    </div>

    <div className="p-5 sm:p-7">
      <div className="grid gap-4 md:grid-cols-2">
        <EvidenceCard name="Listening" evidence={readiness.listening} locale={locale} />
        <EvidenceCard name="Reading" evidence={readiness.reading} locale={locale} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4"><StateBadge state={readiness.consistency.state} locale={locale} /><h3 className="mt-3 font-black">{vi ? "Tính đều đặn" : "Consistency"}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{vi ? `${readiness.consistency.learningDays28} ngày học trong 28 ngày` : `${readiness.consistency.learningDays28} learning days in 28 days`}{readiness.consistency.targetDays28 ? ` · ${vi ? "mục tiêu" : "target"} ${readiness.consistency.targetDays28}` : ""}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4"><StateBadge state={readiness.weeklyPlan.state} locale={locale} /><h3 className="mt-3 font-black">Weekly Plan</h3><p className="mt-1 text-sm leading-6 text-slate-600">{readiness.weeklyPlan.planned ? (vi ? `${readiness.weeklyPlan.completed}/${readiness.weeklyPlan.planned} buổi đã hoàn thành tuần này` : `${readiness.weeklyPlan.completed}/${readiness.weeklyPlan.planned} sessions completed this week`) : (vi ? "Chưa có snapshot kế hoạch tuần." : "No weekly plan snapshot yet.")}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-black">Diagnostic</h3><p className="mt-3 text-sm leading-6 text-slate-600">{readiness.diagnostic.completed ? (vi ? "Đã hoàn tất; bằng chứng được tính vào kết quả." : "Completed; its evidence is included.") : (vi ? "Chưa hoàn tất bài đánh giá đầu vào." : "No completed diagnostic yet.")}</p></article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4"><h3 className="font-black">Full Mock</h3><p className="mt-3 text-sm leading-6 text-slate-600">{vi ? `${readiness.mocks.completed} bài đã hoàn tất.` : `${readiness.mocks.completed} completed.`} {readiness.mocks.recommended ? (vi ? "Bằng chứng Nghe và Đọc đã ổn định để làm mock." : "Listening and Reading evidence is stable enough for a mock.") : (vi ? "Tiếp tục xây bằng chứng ở cả hai phần trước." : "Keep building evidence in both sections first.")}</p></article>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <h3 className="text-lg font-black">{vi ? "Ưu tiên cần xử lý" : "Priority evidence"}</h3>
          {readiness.priorities.length ? <ul className="mt-3 space-y-2">{readiness.priorities.map((item) => <li className="rounded-xl border border-slate-200 bg-white p-4" key={`${item.part}-${item.skill ?? "part"}`}><div className="flex flex-wrap items-center justify-between gap-2"><strong>Part {item.part}{item.skill ? ` · ${taxonomyLabel(item.skill, locale)}` : ""}</strong><StateBadge state={item.state} locale={locale} /></div><p className="mt-2 text-sm text-slate-600">{vi ? `Dựa trên ${item.answered} câu; ${item.correct} câu đúng.` : `Based on ${item.answered} answers; ${item.correct} correct.`}</p></li>)}</ul> : <p className="mt-3 text-sm text-slate-600">{vi ? "Chưa có câu trả lời để xác định ưu tiên theo Part." : "No answers yet to identify a Part-level priority."}</p>}
        </div>
        <div>
          <h3 className="text-lg font-black">{vi ? "Việc nên làm trước kỳ thi" : "Suggested before the exam"}</h3>
          <div className="mt-3 grid gap-2">{readiness.actions.map((action, index) => <Link className={`${index === 0 ? "bg-teal-800 text-white" : "border border-teal-800 bg-white text-teal-900"} inline-flex min-h-12 items-center justify-between rounded-xl px-4 py-3 font-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700`} href={action.href} key={action.code}><span>{actionLabels[action.code]}</span><span aria-hidden="true">→</span></Link>)}</div>
          {readiness.mocks.recommended && readiness.mocks.access === "QUOTA_REACHED" ? <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{vi ? "Bạn đã dùng hết lượt Full Mock của kỳ hiện tại; trang Full Mock sẽ hiển thị thời điểm đặt lại." : "You have reached the current Full Mock limit; the Full Mock page shows when it resets."}</p> : null}
        </div>
      </div>
    </div>
  </section>;
}
