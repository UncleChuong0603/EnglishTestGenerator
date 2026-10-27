"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { acquisitionSource, trackBrowserProductEvent } from "@/lib/product-analytics/browser";
import type { MiniQuestion } from "@/lib/seo/mini-practice";

type MiniPracticeProps = {
  questions: MiniQuestion[];
  locale?: "vi" | "en";
  signedIn?: boolean;
  analyticsEnabled?: boolean;
};

export function MiniPractice({
  questions,
  locale = "vi",
  signedIn = false,
  analyticsEnabled = true,
}: MiniPracticeProps) {
  const id = useId();
  const pathname = usePathname();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [incomplete, setIncomplete] = useState(false);
  const section = useRef<HTMLElement | null>(null);
  const firstOptions = useRef<Record<string, HTMLInputElement | null>>({});
  const vi = locale === "vi";
  const score = questions.filter(question => answers[question.id] === question.answer).length;
  const nextHref = signedIn ? "/practice" : "/sign-up?next=%2Fpractice";

  useEffect(() => {
    if (!analyticsEnabled) return;
    const trackView = () => trackBrowserProductEvent("seo_practice_viewed", pathname, {
        ...acquisitionSource(),
        questionCount: questions.length,
      });
    if (!("IntersectionObserver" in window) || !section.current) {
      trackView();
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      trackView();
      observer.disconnect();
    }, { threshold: 0.15 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, [analyticsEnabled, pathname, questions.length]);

  function trackInteraction(eventName: "seo_practice_started" | "seo_practice_completed" | "seo_practice_signup_clicked", properties?: Record<string, string | number | boolean>) {
    if (!analyticsEnabled) return;
    trackBrowserProductEvent(eventName, pathname, {
      questionCount: questions.length,
      ...properties,
    });
  }

  return <section ref={section} id="bai-tap" lang={locale} aria-labelledby={`${id}-title`} className="my-8 scroll-mt-24 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-teal-800">{vi ? "Luyện ngay trên trang" : "Practice on this page"}</p>
        <h2 id={`${id}-title`} className="mt-2 text-2xl font-black">{vi ? `Làm thử ${questions.length} câu có lời giải` : `Try ${questions.length} questions with explanations`}</h2>
      </div>
      <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-teal-900 shadow-sm">{vi ? "Miễn phí · Không cần đăng nhập" : "Free · No sign-in"}</span>
    </div>
    <p className="mt-3 leading-7">{vi ? "Câu hỏi do TOEIC GYM tự biên soạn, không phải đề ETS/IIG. Chọn đáp án rồi kiểm tra để xem kết quả và lời giải từng phương án." : "Original TOEIC GYM questions, independent of ETS/IIG. Answer and check your result before reviewing every option."}</p>
    <div className="mt-6 space-y-7">{questions.map((question, index) => <fieldset key={question.id}>
      <legend lang="en" className="font-bold leading-7">{index + 1}. {question.text}</legend>
      <div lang="en" className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <label key={optionIndex} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-teal-200 bg-white p-3 hover:border-teal-500 focus-within:ring-2 focus-within:ring-teal-800">
        <input
          type="radio"
          ref={optionIndex === 0 ? element => { firstOptions.current[question.id] = element; } : undefined}
          name={`${id}-${question.id}`}
          value={optionIndex}
          checked={answers[question.id] === optionIndex}
          onChange={() => {
            if (Object.keys(answers).length === 0) trackInteraction("seo_practice_started");
            setAnswers(current => ({ ...current, [question.id]: optionIndex }));
            setSubmitted(false);
            setIncomplete(false);
          }}
          className="mt-1"
        />
        <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
      </label>)}</div>
      {submitted && <p className={`mt-3 rounded-lg p-3 font-bold ${answers[question.id] === question.answer ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>
        {answers[question.id] === question.answer ? (vi ? "Đúng." : "Correct.") : (vi ? "Cần xem lại." : "Review this answer.")} {vi ? "Đáp án" : "Answer"} {String.fromCharCode(65 + question.answer)}: <span lang="en">{question.options[question.answer]}</span>.
      </p>}
      <details className="mt-3 rounded-lg border border-teal-200 bg-white p-3 leading-7">
        <summary className="min-h-11 cursor-pointer content-center font-bold text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">{vi ? `Xem đáp án và lời giải câu ${index + 1}` : `Answer and explanation for question ${index + 1}`}</summary>
        <div lang="vi" className="mt-3">
          <p className="font-bold">Đáp án {String.fromCharCode(65 + question.answer)}: <span lang="en">{question.options[question.answer]}</span>.</p>
          <p>{question.explanation}</p>
          <ul className="mt-2 list-disc pl-5">{question.distractors.map((reason, optionIndex) => optionIndex === question.answer ? null : <li key={optionIndex}>{String.fromCharCode(65 + optionIndex)}: {reason}</li>)}</ul>
        </div>
      </details>
    </fieldset>)}</div>
    <button type="button" className="mt-6 min-h-12 rounded-lg bg-teal-800 px-5 font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800" onClick={() => {
      const missing = questions.find(question => answers[question.id] === undefined);
      if (missing) {
        setIncomplete(true);
        firstOptions.current[missing.id]?.focus();
        return;
      }
      setIncomplete(false);
      setSubmitted(true);
      trackInteraction("seo_practice_completed", { score });
    }}>{vi ? "Kiểm tra đáp án" : "Check answers"}</button>
    <p aria-live="polite" className="mt-4 font-bold">{incomplete ? (vi ? "Hãy trả lời đủ các câu trước khi kiểm tra." : "Answer every question before checking.") : submitted ? (vi ? `Bạn đúng ${score}/${questions.length} câu. Đây là kết quả bài luyện, không quy đổi thành điểm TOEIC.` : `You answered ${score}/${questions.length} correctly. This practice result is not an official TOEIC score.`) : ""}</p>
    {submitted && <aside className="mt-5 rounded-xl border border-teal-300 bg-white p-5" aria-labelledby={`${id}-next-title`}>
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-800">{vi ? "Bước tiếp theo" : "Next step"}</p>
      <h3 className="mt-2 text-xl font-black" id={`${id}-next-title`}>{signedIn ? (vi ? "Luyện tiếp theo điểm yếu" : "Continue with your weak areas") : (vi ? "Nhận bài luyện phù hợp hơn" : "Get more relevant practice")}</h3>
      <p className="mt-2 leading-7 text-slate-700">{signedIn
        ? (vi ? "Chọn một bài mới trong hệ thống để kết quả tiếp theo được lưu và dùng vào theo dõi tiến bộ." : "Choose a workout in the learning system so your next result is saved and included in progress tracking.")
        : (vi ? "Tạo tài khoản miễn phí để luyện theo Part và bắt đầu theo dõi các bài làm tiếp theo. Các câu vừa làm vẫn luôn xem được trên trang này." : "Create a free account to practice by Part and track future workouts. These questions remain available on this page.")}</p>
      <Link
        className="mt-4 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-5 font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
        href={nextHref}
        onClick={() => { if (!signedIn) trackInteraction("seo_practice_signup_clicked"); }}
      >{signedIn ? (vi ? "Chọn bài luyện tiếp" : "Choose next practice") : (vi ? "Tạo tài khoản miễn phí" : "Create a free account")} <span aria-hidden="true" className="ml-2">→</span></Link>
    </aside>}
    <noscript><p>{vi ? "Chọn đáp án trên giấy rồi mở lời giải từng câu. Chấm bài tự động cần JavaScript." : "Record your answers on paper, then open each explanation. Automatic scoring requires JavaScript."}</p></noscript>
  </section>;
}
