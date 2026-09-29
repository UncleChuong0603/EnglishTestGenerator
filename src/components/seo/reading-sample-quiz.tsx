"use client";

import { useState } from "react";
import type { ReadingSampleQuestion } from "@/lib/seo/reading-long-tail";

export function ReadingSampleQuiz({ questions, id }: { questions: readonly ReadingSampleQuestion[]; id: string }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const score = questions.reduce((total, question, index) => total + Number(answers[index] === question.answer), 0);

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
        <strong>{answers[index] === question.answer ? "Đúng." : `Đáp án đúng: ${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}.`}</strong> {question.explanation}
      </p>}
    </fieldset>)}
    <button className="min-h-12 rounded-lg bg-teal-800 px-6 font-bold text-white" onClick={() => {
      if (answers.some(answer => answer === null)) {
        setError(`Hãy trả lời đủ ${questions.length} câu trước khi xem lời giải.`);
        return;
      }
      setError("");
      setSubmitted(true);
    }} type="button">Kiểm tra đáp án</button>
    {error && <p aria-live="polite" className="font-semibold text-amber-800">{error}</p>}
    {submitted && <p aria-live="polite" className="font-bold text-teal-900">Bạn đúng {score}/{questions.length} câu. Xem bằng chứng và lời giải dưới từng câu.</p>}
  </div>;
}
