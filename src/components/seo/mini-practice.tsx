"use client";

import { useId, useState } from "react";
import type { MiniQuestion } from "@/lib/seo/mini-practice";

export function MiniPractice({ questions }: { questions: MiniQuestion[] }) {
  const id = useId();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  return <section id="bai-tap" aria-labelledby={`${id}-title`} className="my-8 rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-7">
    <h2 id={`${id}-title`} className="text-2xl font-black">Làm thử {questions.length} câu có lời giải</h2>
    <p className="mt-3 leading-7">Câu hỏi do TOEICGym tự biên soạn, không phải đề ETS/IIG. Miễn phí, không cần đăng nhập.</p>
    <div className="mt-6 space-y-7">{questions.map((q, index) => <fieldset key={q.id}>
      <legend className="font-bold leading-7">{index + 1}. {q.text}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{q.options.map((option, i) => <label key={i} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-teal-200 bg-white p-3">
        <input type="radio" name={`${id}-${q.id}`} value={i} checked={answers[q.id] === i} onChange={() => { setAnswers({ ...answers, [q.id]: i }); setSubmitted(false); setError(""); }} className="mt-1" />
        <span>{String.fromCharCode(65 + i)}. {option}</span>
      </label>)}</div>
      {submitted && <div className="mt-3 rounded-lg bg-white p-4 leading-7">
        <p className="font-bold">{answers[q.id] === q.answer ? "Đúng." : "Cần xem lại."} Đáp án {String.fromCharCode(65 + q.answer)}: {q.options[q.answer]}.</p>
        <p>{q.explanation}</p>
        <ul className="mt-2 list-disc pl-5">{q.distractors.map((reason, i) => i === q.answer ? null : <li key={i}>{String.fromCharCode(65 + i)}: {reason}</li>)}</ul>
      </div>}
    </fieldset>)}</div>
    <button type="button" className="mt-6 min-h-12 rounded-lg bg-teal-800 px-5 font-bold text-white" onClick={() => {
      if (questions.some(q => answers[q.id] === undefined)) { setError("Hãy trả lời đủ các câu trước khi kiểm tra."); return; }
      setError(""); setSubmitted(true);
    }}>Kiểm tra đáp án</button>
    <p aria-live="polite" className="mt-4 font-bold">{error || (submitted ? `Bạn đúng ${questions.filter(q => answers[q.id] === q.answer).length}/${questions.length} câu. Đây là kết quả bài luyện, không quy đổi thành điểm TOEIC.` : "")}</p>
    <noscript><p>Chọn đáp án trên giấy rồi mở lời giải bên dưới.</p>{questions.map(q => <details key={q.id}><summary>{q.text}</summary><p>{q.options[q.answer]} — {q.explanation}</p></details>)}</noscript>
  </section>;
}
