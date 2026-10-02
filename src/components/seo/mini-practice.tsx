"use client";

import { useId, useRef, useState } from "react";
import type { MiniQuestion } from "@/lib/seo/mini-practice";

export function MiniPractice({ questions, locale = "vi" }: { questions: MiniQuestion[]; locale?: "vi" | "en" }) {
  const id = useId();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [incomplete, setIncomplete] = useState(false);
  const firstOptions = useRef<Record<string, HTMLInputElement | null>>({});
  const vi = locale === "vi";
  return <section id="bai-tap" lang={locale} aria-labelledby={`${id}-title`} className="my-8 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-7">
    <h2 id={`${id}-title`} className="text-2xl font-black">{vi ? `Làm thử ${questions.length} câu có lời giải` : `Try ${questions.length} questions with explanations`}</h2>
    <p className="mt-3 leading-7">{vi ? "Câu hỏi do TOEICGym tự biên soạn, không phải đề ETS/IIG. Miễn phí, không cần đăng nhập. Chọn đáp án trước khi mở lời giải." : "Original TOEIC GYM questions, independent of ETS/IIG. Free, no account needed. Answer before opening the Vietnamese explanations."}</p>
    <div className="mt-6 space-y-7">{questions.map((q, index) => <fieldset key={q.id}>
      <legend lang="en" className="font-bold leading-7">{index + 1}. {q.text}</legend>
      <div lang="en" className="mt-3 grid gap-2 sm:grid-cols-2">{q.options.map((option, i) => <label key={i} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-teal-200 bg-white p-3 focus-within:ring-2 focus-within:ring-teal-800">
        <input type="radio" ref={i === 0 ? (element) => { firstOptions.current[q.id] = element; } : undefined} name={`${id}-${q.id}`} value={i} checked={answers[q.id] === i} onChange={() => { setAnswers({ ...answers, [q.id]: i }); setSubmitted(false); setIncomplete(false); }} className="mt-1" />
        <span>{String.fromCharCode(65 + i)}. {option}</span>
      </label>)}</div>
      {submitted && <p className="mt-3 font-bold">{answers[q.id] === q.answer ? (vi ? "Đúng." : "Correct.") : (vi ? "Cần xem lại." : "Review this answer.")} {vi ? "Đáp án" : "Answer"} {String.fromCharCode(65 + q.answer)}: {q.options[q.answer]}.</p>}
      <details className="mt-3 rounded-lg border border-teal-200 bg-white p-3 leading-7">
        <summary className="min-h-11 cursor-pointer content-center font-bold text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800">{vi ? `Xem đáp án và lời giải câu ${index + 1}` : `Answer and explanation for question ${index + 1}`}</summary>
        <div lang="vi" className="mt-3">
          <p className="font-bold">Đáp án {String.fromCharCode(65 + q.answer)}: <span lang="en">{q.options[q.answer]}</span>.</p>
          <p>{q.explanation}</p>
          <ul className="mt-2 list-disc pl-5">{q.distractors.map((reason, i) => i === q.answer ? null : <li key={i}>{String.fromCharCode(65 + i)}: {reason}</li>)}</ul>
        </div>
      </details>
    </fieldset>)}</div>
    <button type="button" className="mt-6 min-h-12 rounded-lg bg-teal-800 px-5 font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800" onClick={() => {
      const missing = questions.find(q => answers[q.id] === undefined);
      if (missing) { setIncomplete(true); firstOptions.current[missing.id]?.focus(); return; }
      setIncomplete(false); setSubmitted(true);
    }}>{vi ? "Kiểm tra đáp án" : "Check answers"}</button>
    <p aria-live="polite" className="mt-4 font-bold">{incomplete ? (vi ? "Hãy trả lời đủ các câu trước khi kiểm tra." : "Answer every question before checking.") : submitted ? (vi ? `Bạn đúng ${questions.filter(q => answers[q.id] === q.answer).length}/${questions.length} câu. Đây là kết quả bài luyện, không quy đổi thành điểm TOEIC.` : `You answered ${questions.filter(q => answers[q.id] === q.answer).length}/${questions.length} correctly. This practice result is not an official TOEIC score.`) : ""}</p>
    <noscript><p>{vi ? "Chọn đáp án trên giấy rồi mở lời giải từng câu. Chấm bài tự động cần JavaScript." : "Record your answers on paper, then open each explanation. Automatic scoring requires JavaScript."}</p></noscript>
  </section>;
}
