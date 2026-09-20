import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { PremiumValueRecap } from "@/lib/premium/value-recap";

export function PremiumValueRecapView({ recap, locale }: { recap: PremiumValueRecap; locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  const metrics = [
    [recap.questionsAnswered, vi ? "câu đã trả lời" : "questions answered"],
    [recap.practiceSessionsCompleted, vi ? "phiên luyện tập hoàn thành" : "practice sessions completed"],
    [recap.mistakesMastered, vi ? "lỗi đã làm chủ" : "mistakes mastered"],
    [recap.mocksCompleted, vi ? "bài Mock hoàn thành" : "mock tests completed"],
    [recap.reassessmentsCompleted, vi ? "lần đánh giá lại" : "reassessments completed"],
  ].filter(([value]) => Number(value) > 0).slice(0, 5) as [number, string][];
  if (!metrics.length) return null;
  return <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="premium-recap-heading">
    <p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal-700">{vi ? "30 ngày gần đây" : "Last 30 days"}</p>
    <h2 className="mt-2 text-2xl font-black" id="premium-recap-heading">{vi ? "Premium của bạn" : "Your Premium value"}</h2>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{metrics.map(([value, label]) => <div className="min-w-0 rounded-2xl bg-slate-50 p-4" key={label}><p className="text-2xl font-black tabular-nums text-teal-900">{new Intl.NumberFormat(vi ? "vi-VN" : "en-US").format(value)}</p><p className="mt-1 text-sm leading-5 text-slate-600">{label}</p></div>)}</div>
  </section>;
}
