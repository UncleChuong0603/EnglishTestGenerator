import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { hasResumableDiagnostic } from "@/lib/diagnostic/service";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { startDiagnostic } from "./actions";

const copy = {
  vi: {
    back: "Quay lại", eyebrow: "Đánh giá đầu vào", title: "Xây dựng hồ sơ TOEIC ban đầu",
    intro: "Một bước ngắn để TOEICGym hiểu trình độ hiện tại và gợi ý lộ trình luyện tập phù hợp hơn với bạn.",
    disclaimer: "Kết quả đánh giá không phải điểm TOEIC chính thức.",
    benefitsTitle: "Sau khi hoàn thành, bạn sẽ có",
    benefits: ["Tổng quan năng lực Listening và Reading", "Kết quả và giải thích cho từng câu hỏi", "Gợi ý luyện tập dựa trên kết quả của bạn"],
    start: "Bắt đầu đánh giá", resume: "Tiếp tục đánh giá",
    startNote: "Bạn có thể rời đi và tiếp tục trong 7 ngày kể từ lúc bắt đầu.",
    resumeNote: "Bạn có thể tiếp tục bài đánh giá đang thực hiện trong thời hạn 7 ngày.",
    summary: "Tổng quan bài đánh giá", listening: "Listening", reading: "Reading", questions: "Số câu",
    questionsValue: "Khoảng 25–35 câu", groups: "Các nhóm câu hỏi được giữ nguyên",
    availability: "Tiến độ", availabilityValue: "Tiếp tục trong 7 ngày",
    result: "Kết quả", resultValue: "Mở sau khi hoàn thành",
    expired: "Bài đánh giá đã hết hạn. Hãy bắt đầu một bài mới.",
    unavailable: "Bài đánh giá hiện không khả dụng. Vui lòng thử lại.",
  },
  en: {
    back: "Back", eyebrow: "Diagnostic assessment", title: "Build your initial TOEIC profile",
    intro: "A short first step that helps TOEICGym understand your current level and suggest a more suitable practice path.",
    disclaimer: "This assessment does not provide an official TOEIC score.",
    benefitsTitle: "What you get after finishing",
    benefits: ["An overview of your Listening and Reading skills", "Results and explanations for each question", "Practice suggestions based on your results"],
    start: "Start assessment", resume: "Continue assessment",
    startNote: "You can leave and continue within 7 days of starting.",
    resumeNote: "You can continue your assessment within its 7-day window.",
    summary: "Assessment overview", listening: "Listening", reading: "Reading", questions: "Questions",
    questionsValue: "About 25–35 questions", groups: "Question groups stay together",
    availability: "Progress", availabilityValue: "Resume within 7 days",
    result: "Results", resultValue: "Available after completion",
    expired: "Your diagnostic expired. Start a new assessment.",
    unavailable: "The diagnostic is currently unavailable. Please try again.",
  },
};

export default async function DiagnosticLandingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [user, locale, query] = await Promise.all([getCurrentUser(), getCookieLanguage(), searchParams]);
  const guestHash = user ? null : await getGuestOwnerHash();
  const resumable = user || guestHash ? await hasResumableDiagnostic(user ? { userId: user.id } : { guestOwnerHash: guestHash! }) : false;
  const t = copy[locale === "vi" ? "vi" : "en"];

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10 lg:py-14">
    <div className="mx-auto max-w-6xl">
      <Link className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-teal-800 hover:text-teal-950 hover:underline" href={user ? "/dashboard" : "/try"}>← {t.back}</Link>
      {query.error ? <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950" role="alert">{query.error === "expired" ? t.expired : t.unavailable}</p> : null}
      <section aria-labelledby="diagnostic-title" className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_16px_48px_-28px_rgba(15,23,42,0.35)] sm:mt-7">
        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.8fr)]">
          <div className="min-w-0 px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">{t.eyebrow}</p>
            <h1 id="diagnostic-title" className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]">{t.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">{t.intro}</p>
            <p className="mt-4 max-w-2xl border-l-[3px] border-teal-600 pl-4 text-sm leading-6 text-slate-700">{t.disclaimer}</p>
            <div className="mt-9 border-t border-slate-200 pt-7">
              <h2 className="text-lg font-bold text-slate-950">{t.benefitsTitle}</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 sm:text-base">
                {t.benefits.map((benefit) => <li className="flex gap-3" key={benefit}><span aria-hidden="true" className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-black text-teal-800">✓</span><span>{benefit}</span></li>)}
              </ul>
            </div>
            <form action={startDiagnostic} className="mt-9"><button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-6 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-teal-800 sm:w-auto" type="submit">{resumable ? t.resume : t.start}<span aria-hidden="true" className="ml-3">→</span></button></form>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">{resumable ? t.resumeNote : t.startNote}</p>
          </div>
          <aside aria-labelledby="diagnostic-summary" className="min-w-0 border-t border-slate-200 bg-slate-50 px-6 py-8 sm:px-10 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:px-9">
            <h2 id="diagnostic-summary" className="text-lg font-bold text-slate-950">{t.summary}</h2>
            <dl className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
              <div className="py-4"><dt className="text-sm font-semibold text-slate-600">{t.listening}</dt><dd className="mt-1 text-base font-bold text-slate-950">Part 1–4</dd></div>
              <div className="py-4"><dt className="text-sm font-semibold text-slate-600">{t.reading}</dt><dd className="mt-1 text-base font-bold text-slate-950">Part 5–7</dd></div>
              <div className="py-4"><dt className="text-sm font-semibold text-slate-600">{t.questions}</dt><dd className="mt-1 text-base font-bold text-slate-950">{t.questionsValue}</dd><p className="mt-1 text-xs leading-5 text-slate-600">{t.groups}</p></div>
              <div className="py-4"><dt className="text-sm font-semibold text-slate-600">{t.availability}</dt><dd className="mt-1 text-base font-bold text-slate-950">{t.availabilityValue}</dd></div>
              <div className="py-4"><dt className="text-sm font-semibold text-slate-600">{t.result}</dt><dd className="mt-1 text-base font-bold text-slate-950">{t.resultValue}</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    </div>
  </main>;
}
