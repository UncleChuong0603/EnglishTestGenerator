import Link from "next/link";
import { startRecommendedPractice, startReadingPractice, startListeningPractice, startWeeklyFocusedReading } from "@/app/practice/actions";
import { startMasteryReview } from "@/app/mistakes/actions";
import { startMock } from "@/app/full-mock/actions";
import { formatExamDate, type GoalProfile } from "@/lib/goals/domain";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { WeeklyPlanItem, WeeklyPlan } from "@/lib/weekly-plan/policy";

const names = {
  WORKOUT: { vi: "Bài luyện được đề xuất", en: "Recommended practice" },
  FOCUSED_READING: { vi: "Luyện sâu điểm yếu Reading", en: "Focused Reading weakness" },
  REVIEW: { vi: "Ôn câu sai", en: "Mistake review" },
  READING: { vi: "Luyện Reading · Part 5", en: "Reading practice · Part 5" },
  LISTENING: { vi: "Luyện Listening · Part 2", en: "Listening practice · Part 2" },
  MOCK_LISTENING: { vi: "Thi thử Listening", en: "Listening mock" },
} as const;
const reasons = {
  recommendation: { vi: "Dựa trên đề xuất luyện tập hiện tại.", en: "Based on your current practice recommendation." },
  mistakes: { vi: "Có câu sai đã sẵn sàng để ôn lại.", en: "Reviewable mistakes are waiting." },
  balance: { vi: "Bổ sung bài có nội dung sẵn sàng; Reading ưu tiên câu chưa làm.", en: "Adds ready content; Reading prioritizes unseen questions." },
  mock: { vi: "Nội dung thi thử đã sẵn sàng và phù hợp thời lượng.", en: "Mock content is ready and fits your study time." },
} as const;

function Action({ item, locale, premium }: { item: WeeklyPlanItem; locale: InterfaceLanguage; premium: boolean }) {
  if (item.completed) return <span className="text-sm font-bold text-emerald-700">{locale === "vi" ? "Đã học" : "Completed"}</span>;
  if (!item.available) return <span className="text-sm text-slate-500">{locale === "vi" ? "Tạm chưa khả dụng" : "Currently unavailable"}</span>;
  const action = item.activity === "WORKOUT" ? startRecommendedPractice : item.activity === "FOCUSED_READING" ? startWeeklyFocusedReading : item.activity === "REVIEW" ? startMasteryReview : item.activity === "READING" ? startReadingPractice : item.activity === "LISTENING" ? startListeningPractice : startMock.bind(null, "LISTENING");
  return <form action={action}>
    {item.activity === "REVIEW" ? <><input type="hidden" name="smart" value={premium ? "true" : "false"}/><input type="hidden" name="size" value={premium ? Math.min(20, item.minutes <= 10 ? 5 : item.minutes <= 20 ? 10 : 20) : 10}/></> : null}
    {item.activity === "READING" ? <><input type="hidden" name="mode" value="part_5"/><input type="hidden" name="source" value="custom"/><input type="hidden" name="questionCount" value={item.minutes >= 45 ? 20 : item.minutes >= 30 ? 15 : 10}/></> : null}
    {item.activity === "LISTENING" ? <input type="hidden" name="part" value="2"/> : null}
    <button type="submit" className="min-h-11 rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">{locale === "vi" ? "Bắt đầu" : "Start"}</button>
  </form>;
}

export function RoadToTarget({ goal, weekly, locale, premium, section, previewEligible = false }: { goal: GoalProfile | null; weekly: WeeklyPlan | null; locale: InterfaceLanguage; premium: boolean; section: "context" | "plan"; previewEligible?: boolean }) {
  const vi = locale === "vi";
  const days = goal?.studyDaysPerWeek ?? 5;
  const minutes = goal?.dailyStudyMinutes ?? 20;
  if (section === "context") return <section className="mt-5 rounded-3xl border border-teal-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="road-to-target-heading">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">Road to Target</p><h2 id="road-to-target-heading" className="mt-1 text-2xl font-black">{goal?.targetScore ? `${vi ? "Mục tiêu TOEIC" : "TOEIC target"} ${goal.targetScore}` : vi ? "Hành trình học của bạn" : "Your study journey"}</h2><p className="mt-2 text-sm text-slate-600">{goal?.examDate ? `${vi ? "Ngày thi" : "Test date"}: ${formatExamDate(goal.examDate, locale)} · ` : ""}{minutes} {vi ? "phút/ngày" : "minutes/day"} · {days} {vi ? "buổi/tuần" : "sessions/week"}</p></div>
      <Link className="inline-flex min-h-11 items-center font-bold text-teal-800 underline-offset-4 hover:underline" href="/settings?section=goal">{goal ? vi ? "Chỉnh sửa mục tiêu" : "Edit goal" : vi ? "Thiết lập mục tiêu" : "Set your goal"}</Link>
    </div>
    {!goal || !goal.targetScore ? <p className="mt-3 text-sm text-slate-600">{vi ? "Bạn vẫn có thể học ngay. Thêm mục tiêu khi sẵn sàng để kế hoạch sát với lịch học của bạn hơn." : "You can start now. Add a target whenever you're ready to tailor your plan."}</p> : null}
    <div className="mt-5 rounded-2xl bg-teal-50 p-4"><p className="text-sm font-bold text-teal-900">{vi ? "Ngày có học trong tuần này" : "Learning days this week"}</p><p className="mt-1 text-2xl font-black text-slate-900">{weekly?.learningDays ?? 0} / {days}</p><p className="mt-1 text-xs text-slate-600">{vi ? "Tính theo tuần sản phẩm; các buổi học không gắn với thứ cố định." : "Product week; sessions have no assigned weekdays."}</p></div>
  </section>;
  return <section className="mt-5 rounded-3xl border border-teal-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="weekly-plan-heading">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.14em] text-teal-700">{vi ? "Kế hoạch tuần" : "Weekly Plan"}</p><h2 id="weekly-plan-heading" className="mt-1 text-xl font-black">{premium ? vi ? "Kế hoạch học đầy đủ" : "Full study plan" : vi ? "Gợi ý cho tuần này" : "This week's suggestions"}</h2></div>{!premium ? <Link className="text-sm font-bold text-teal-800" href="/billing">{vi ? "Xem Premium" : "Explore Premium"}</Link> : null}</div>
    {weekly?.preview.length ? <ol className="mt-4 grid gap-3 lg:grid-cols-3">{weekly.preview.map(item => <li key={item.slot} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"><div><p className="text-xs font-bold uppercase tracking-wide text-teal-700">{vi ? "Buổi" : "Session"} {item.slot}</p><h4 className="mt-2 font-black">{names[item.activity][locale]}</h4><p className="mt-1 text-sm text-slate-600">{reasons[item.reason][locale]}</p><p className="mt-2 text-xs font-semibold text-slate-500">{vi ? "Khoảng" : "About"} {item.minutes} {vi ? "phút" : "minutes"}</p></div><div className="mt-4"><Action item={item} locale={locale} premium={premium}/></div></li>)}</ol> : <p className="mt-4 text-sm text-slate-600">{vi ? "Hiện chưa có hoạt động phù hợp với nội dung và quyền sử dụng còn lại. Bài hôm nay và trang luyện tập vẫn sẵn sàng khi có nội dung." : "No activity currently fits available content and access. Today's workout and practice remain available when content is ready."}</p>}
    {!premium && previewEligible && weekly && weekly.items.length > weekly.preview.length ? <p className="mt-4 text-sm text-slate-600">{vi ? "Premium có thể xây đầy đủ kế hoạch tuần dựa trên mục tiêu, thời gian và điểm yếu của bạn." : "Premium can build a full weekly plan around your target, study time, and learning needs."}</p> : null}
    {premium && weekly?.history.length ? <div className="mt-6 border-t border-slate-200 pt-5"><h3 className="font-black">{vi ? "Lịch sử học gần đây" : "Recent study history"}</h3><ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{weekly.history.map(row => <li key={row.weekStart} className="rounded-xl bg-slate-50 p-3 text-sm"><span className="font-semibold text-slate-600">{vi ? "Tuần từ" : "Week of"} {row.weekStart}</span><strong className="mt-1 block text-slate-900">{row.completedSessions} {vi ? "buổi học" : "completed sessions"}</strong></li>)}</ul></div> : null}
  </section>;
}
