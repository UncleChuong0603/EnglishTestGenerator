"use client";

import { useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { ReadingSampleQuestion } from "@/lib/seo/reading-long-tail";

export function ReadingSampleQuiz({ questions, id, locale = "vi" }: { questions: readonly ReadingSampleQuestion[]; id: string; locale?: InterfaceLanguage }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const score = questions.reduce((total, question, index) => total + Number(answers[index] === question.answer), 0);
  const vi = locale === "vi";

  return <div className="mt-8 space-y-7">
    {questions.map((question, index) => <fieldset className="border-t border-slate-200 pt-6" key={question.prompt}>
      <legend className="font-bold leading-7 text-slate-900">{index + 1}. {question.prompt}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => <label className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${answers[index] === optionIndex ? "border-teal-700 bg-teal-50" : "border-slate-200"}`} key={option}>
          <input checked={answers[index] === optionIndex} name={`${id}-${index}`} onChange={() => {
            setAnswers(current => current.map((answer, answerIndex) => answerIndex === index ? optionIndex : answer));
            setSubmitted(false);
            setError("");
          }} type="radio" value={optionIndex} />
          <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
        </label>)}
      </div>
      {submitted && <p className={`mt-3 rounded-lg p-4 leading-7 ${answers[index] === question.answer ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"}`}>
        <strong>{answers[index] === question.answer ? (vi ? "Đúng." : "Correct.") : (vi ? `Đáp án đúng: ${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}.` : `Correct answer: ${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}.`)}</strong> <span lang="vi">{question.explanation}</span>
      </p>}
      <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
        <summary className="min-h-11 cursor-pointer py-2 font-bold text-teal-900 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-800">
          {vi ? `Đáp án và bằng chứng câu ${index + 1}` : `Answer and evidence for question ${index + 1}`}
        </summary>
        <p className="mt-2 leading-7" lang="vi"><strong>{String.fromCharCode(65 + question.answer)}. {question.options[question.answer]}.</strong> {question.explanation}</p>
      </details>
    </fieldset>)}
    <button className="min-h-12 rounded-lg bg-teal-800 px-6 font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-800" onClick={() => {
      if (answers.some(answer => answer === null)) {
        setError(vi ? `Hãy trả lời đủ ${questions.length} câu trước khi xem lời giải.` : `Answer all ${questions.length} questions before checking.`);
        return;
      }
      setError("");
      setSubmitted(true);
    }} type="button">{vi ? "Kiểm tra đáp án" : "Check answers"}</button>
    {error && <p aria-live="polite" className="font-semibold text-amber-800">{error}</p>}
    {submitted && <p aria-live="polite" className="font-bold text-teal-900">{vi ? `Bạn đúng ${score}/${questions.length} câu. Xem bằng chứng và lời giải dưới từng câu.` : `You answered ${score}/${questions.length} correctly. Review the evidence under each question.`}</p>}
    <noscript><p>{vi ? "Chọn đáp án trên giấy rồi mở phần đáp án và bằng chứng. Chấm tự động cần JavaScript." : "Record your answers, then open each answer and evidence section. Automatic scoring requires JavaScript."}</p></noscript>
  </div>;
}
