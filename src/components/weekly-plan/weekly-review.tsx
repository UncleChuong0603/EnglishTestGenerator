import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { WeeklyReview as Review } from "@/lib/weekly-review/policy";
import type { WeeklyPlan } from "@/lib/weekly-plan/policy";

const labels = {
  WORKOUT: { vi: "Bài đề xuất", en: "Recommended practice" }, FOCUSED_READING: { vi: "Reading trọng tâm", en: "Focused Reading" },
  REVIEW: { vi: "Ôn câu sai", en: "Mistake review" }, READING: { vi: "Reading Part 5", en: "Reading Part 5" },
  LISTENING: { vi: "Listening Part 2", en: "Listening Part 2" }, MOCK_LISTENING: { vi: "Thi thử Listening", en: "Listening mock" },
} as const;

export function WeeklyReviewCard({ review, weekly, locale, premium }: { review: Review | null; weekly: WeeklyPlan | null; locale: InterfaceLanguage; premium: boolean }) {
  const vi = locale === "vi";
  if (!review?.hasActivity) return <section id="weekly-review" className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="weekly-review-heading">
    <h2 id="weekly-review-heading" className="text-xl font-black">{vi ? "Tổng kết tuần" : "Weekly Review"}</h2>
    <p className="mt-2 text-sm text-slate-600">{vi ? "Chưa có hoạt động học trong tuần đã kết thúc. Hãy bắt đầu với bài luyện hôm nay; tổng kết sẽ xuất hiện khi có dữ liệu thực." : "There was no learning activity in the completed week. Start with today's practice; your review will appear when there is real activity."}</p>
    <Link className="mt-4 inline-flex min-h-11 items-center font-bold text-teal-800" href="#today-workout">{vi ? "Bắt đầu học hôm nay" : "Start today's practice"}</Link>
  </section>;
  const activities = Object.entries(review.activities).filter(([, count]) => count && count > 0);
  const focus = review.focus.map(key => key === "review_repeated" ? vi ? "Ôn các lỗi lặp còn tồn tại" : "Review remaining repeated mistakes"
    : key.startsWith("part_") ? vi ? `Tiếp tục luyện Part ${key.slice(5)} có đủ dữ liệu cần cải thiện` : `Continue Part ${key.slice(5)} with a supported weakness`
    : key === "resume_plan" ? vi ? "Tiếp tục hoạt động chưa hoàn thành" : "Continue an unfinished activity"
    : vi ? "Giữ nhịp học cân bằng" : "Keep a balanced study pace");
  return <section id="weekly-review" className="mt-5 rounded-3xl border border-teal-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="weekly-review-heading">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.14em] text-teal-700">Road to Target</p><h2 id="weekly-review-heading" className="mt-1 text-xl font-black">{vi ? "Tổng kết tuần" : "Weekly Review"}</h2><p className="mt-1 text-sm text-slate-600">{vi ? "Tuần bắt đầu" : "Week of"} {review.weekStart} · {vi ? "đã kết thúc" : "completed"}</p></div><Link href="#weekly-plan-heading" className="inline-flex min-h-11 items-center font-bold text-teal-800">{vi ? "Bắt đầu kế hoạch tuần mới" : "Start the new weekly plan"}</Link></div>
    <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[
      [vi ? "Ngày có học" : "Learning days", String(review.learningDays)], [vi ? "Buổi hoàn thành" : "Completed sessions", String(review.completedSessions)],
      [vi ? "Câu đã trả lời" : "Questions answered", String(review.answered)], [vi ? "Độ chính xác" : "Accuracy", review.accuracy === null ? "—" : `${review.accuracy}%`],
    ].map(([label, value]) => <div key={label} className="rounded-2xl bg-teal-50 p-3"><dt className="text-xs font-semibold text-slate-600">{label}</dt><dd className="mt-1 text-2xl font-black text-slate-900">{value}</dd></div>)}</dl>
    {activities.length ? <div className="mt-5"><h3 className="font-black">{vi ? "Hoạt động đã hoàn thành" : "Completed activities"}</h3><ul className="mt-2 flex flex-wrap gap-2">{activities.map(([activity, count]) => <li key={activity} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{labels[activity as keyof typeof labels]?.[locale] ?? activity}: {count}</li>)}</ul></div> : null}
    {review.planCompletion ? <p className="mt-4 text-sm text-slate-700">{vi ? "Hoàn thành kế hoạch đã lưu" : "Saved plan completed"}: <strong>{review.planCompletion.completed}/{review.planCompletion.planned}</strong></p> : <p className="mt-4 text-sm text-slate-600">{vi ? "Chưa có bản kế hoạch đã lưu cho tuần này; không ước tính tỉ lệ hoàn thành." : "No saved plan for this week; plan completion is not estimated."}</p>}
    <p className="mt-2 text-sm text-slate-600">{vi ? "Lỗi chưa xử lý hiện tại" : "Currently unresolved mistakes"}: {review.unresolvedMistakes}</p>
    {focus.length ? <div className="mt-5"><h3 className="font-black">{vi ? "Gợi ý cho tuần tới" : "Focus for next week"}</h3><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">{focus.map(item => <li key={item}>{item}</li>)}</ul></div> : null}
    {premium ? <div className="mt-6 border-t border-slate-200 pt-5"><h3 className="font-black">{vi ? "Chi tiết có đủ dữ liệu" : "Breakdown with enough data"}</h3>
      {review.parts.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{review.parts.slice(0, 7).map(row => <li className="rounded-xl bg-slate-50 p-3 text-sm" key={row.part}>Part {row.part}: <strong>{row.accuracy}%</strong> · {row.answered} {vi ? "câu" : "questions"}</li>)}</ul> : <p className="mt-2 text-sm text-slate-600">{vi ? "Mỗi Part cần ít nhất 8 câu để phân tích." : "Each Part needs at least 8 answers for analysis."}</p>}
      {review.skills.length ? <div className="mt-4"><h4 className="text-sm font-bold">{vi ? "Kỹ năng" : "Skills"}</h4><ul className="mt-2 grid gap-2 sm:grid-cols-2">{review.skills.slice(0, 4).map(row => <li className="rounded-xl bg-slate-50 p-3 text-sm" key={`${row.part}-${row.skill}`}>Part {row.part} · {row.skill}: <strong>{row.accuracy}%</strong> · {row.answered} {vi ? "câu" : "answers"}</li>)}</ul></div> : null}
      {review.subskills.length ? <div className="mt-4"><h4 className="text-sm font-bold">{vi ? "Kỹ năng chi tiết" : "Subskills"}</h4><ul className="mt-2 grid gap-2 sm:grid-cols-2">{review.subskills.slice(0, 4).map(row => <li className="rounded-xl bg-slate-50 p-3 text-sm" key={`${row.part}-${row.skill}-${row.subskill}`}>Part {row.part} · {row.subskill}: <strong>{row.accuracy}%</strong> · {row.answered} {vi ? "câu" : "answers"}</li>)}</ul></div> : null}
      {review.weakness ? <p className="mt-3 text-sm text-slate-700">{vi ? "Ưu tiên có bằng chứng" : "Evidence-based priority"}: Part {review.weakness.part}{review.weakness.skill ? ` · ${review.weakness.skill}` : ""}{review.weakness.subskill ? ` · ${review.weakness.subskill}` : ""} ({review.weakness.answered} {vi ? "câu" : "answers"}, {review.weakness.accuracy}%).</p> : null}
      {review.repeatedMistakes > 0 ? <p className="mt-2 text-sm text-slate-700">{review.repeatedMistakes} {vi ? "lỗi lặp hiện còn chưa xử lý; ưu tiên ôn lại." : "repeated mistakes remain unresolved; review is prioritized."}</p> : null}
      {review.masteredMistakes > 0 ? <p className="mt-2 text-sm text-slate-700">{review.masteredMistakes} {vi ? "lỗi được nắm vững trong tuần." : "mistakes were mastered during the week."}</p> : null}
      {review.comparison ? <p className="mt-3 text-sm text-slate-700">{vi ? "So với tuần trước" : "Compared with the prior week"}: {review.comparison.questionDelta === 0 ? vi ? "số câu giữ nguyên" : "the same number of answers" : `${Math.abs(review.comparison.questionDelta)} ${vi ? "câu" : "answers"} ${review.comparison.questionDelta > 0 ? vi ? "nhiều hơn" : "more" : vi ? "ít hơn" : "fewer"}`}; {review.comparison.accuracyDelta === 0 ? vi ? "độ chính xác giữ nguyên" : "accuracy unchanged" : `${Math.abs(review.comparison.accuracyDelta)} ${vi ? "điểm phần trăm" : "percentage points"} ${review.comparison.accuracyDelta > 0 ? vi ? "cao hơn" : "higher" : vi ? "thấp hơn" : "lower"}`}.</p> : <p className="mt-3 text-sm text-slate-600">{vi ? "Cần ít nhất 8 câu ở mỗi tuần để so sánh." : "At least 8 answers in each week are needed for comparison."}</p>}
      {weekly?.adjustmentReasons.length ? <p className="mt-3 text-sm text-slate-700">{vi ? "Kế hoạch tuần mới được điều chỉnh theo" : "The new plan was adjusted for"}: {weekly.adjustmentReasons.map(reason => reason === "repeated_mistakes" ? vi ? "lỗi lặp" : "repeated mistakes" : reason === "supported_weakness" ? vi ? "điểm yếu đủ dữ liệu" : "a supported weakness" : reason === "resume_unfinished" ? vi ? "hoạt động chưa xong" : "unfinished activity" : reason === "mastered_review" ? vi ? "lỗi đã nắm vững" : "mastered mistakes" : vi ? "nhịp học thực tế" : "actual study pace").join(", ")}.</p> : null}
    </div> : null}
  </section>;
}
