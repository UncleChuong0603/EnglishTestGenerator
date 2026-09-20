import Link from "next/link";
import { startMasteryReview } from "@/app/mistakes/actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export type ReviewOutcomeData = {
  trackedItems: number;
  answeredQuestions: number;
  masteredThisSession: number;
  stillToReview: number;
  remainingReviewable: number;
  unresolvedTotal: number;
};

export function ReviewOutcome({ data, locale }: { data: ReviewOutcomeData; locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  return <section className="mt-8 rounded-2xl border border-teal-200 bg-white p-5 sm:p-6" aria-labelledby="review-outcome-heading">
    <p className="text-sm font-black uppercase tracking-wider text-teal-700">{vi ? "Mục tiêu · Ôn lỗi sai · Ưu tiên thông minh" : "Target · Mistake review · Smart priority"}</p>
    <h2 className="mt-2 text-xl font-black" id="review-outcome-heading">{vi ? "Kết quả ôn lỗi sai" : "Mistake review outcome"}</h2>
    <p className="mt-2 text-sm text-slate-600">{vi ? `${data.answeredQuestions} câu đã trả lời · ${data.trackedItems} lỗi sai được theo dõi` : `${data.answeredQuestions} questions answered · ${data.trackedItems} tracked mistakes`}</p>
    <dl className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-emerald-50 p-4"><dt className="text-sm font-semibold text-emerald-800">{vi ? "Đã làm chủ trong phiên" : "Mastered this session"}</dt><dd className="mt-1 text-3xl font-black">{data.masteredThisSession}</dd></div>
      <div className="rounded-xl bg-amber-50 p-4"><dt className="text-sm font-semibold text-amber-900">{vi ? "Vẫn cần ôn" : "Still to review"}</dt><dd className="mt-1 text-3xl font-black">{data.stillToReview}</dd></div>
    </dl>
    {data.remainingReviewable > 0 ? <form action={startMasteryReview} className="mt-5"><input name="smart" type="hidden" value="true"/><input name="size" type="hidden" value="10"/><button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto">{vi ? "Tiếp tục ôn ưu tiên" : "Continue priority review"}</button></form> : data.unresolvedTotal === 0 ? <div className="mt-5"><p className="font-bold text-emerald-800">{vi ? "Bạn đã làm chủ tất cả lỗi hiện tại." : "You have mastered all current mistakes."}</p><Link className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-teal-700 px-4 font-bold text-teal-800" href="/practice">{vi ? "Luyện tập tiếp" : "Keep practicing"}</Link></div> : <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{vi ? "Các lỗi còn lại đang được lưu nhưng chưa có nội dung hoặc media phù hợp để tạo phiên ôn." : "Remaining mistakes are saved, but their content or media is not currently reviewable."}</p>}
  </section>;
}
