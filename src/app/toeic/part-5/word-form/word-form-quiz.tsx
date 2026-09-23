"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { WordFormQuestion } from "@/lib/seo/word-form";
import { gradeWordFormQuiz, type WordFormResult } from "./actions";

export function WordFormQuiz({ questions }: { questions: WordFormQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<WordFormResult | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (questions.length < 5) return <section className="rounded-2xl border border-teal-200 bg-white p-6 sm:p-8" id="quiz"><h2 className="text-2xl font-black">Luyện Word Form</h2><p className="mt-3 text-slate-700">Bộ câu hỏi đang được cập nhật. Bạn có thể luyện Part 5 Challenge ngay.</p><Link className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-5 font-bold text-white" href="/challenge/part-5">Làm Part 5 Challenge</Link></section>;

  const score = results?.filter((result) => answers[result.id] === result.correctOptionId).length ?? 0;
  function submit() {
    if (questions.some((question) => !answers[question.id])) {
      setError("Hãy chọn đáp án cho đủ 5 câu trước khi kiểm tra.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const graded = await gradeWordFormQuiz(questions.map((question) => question.id), questions.map((question) => answers[question.id]));
        setResults(graded);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Chưa thể chấm bài. Vui lòng thử lại.");
      }
    });
  }

  return <section className="rounded-2xl border border-teal-200 bg-white p-5 sm:p-8" id="quiz" aria-labelledby="quiz-heading">
    <h2 className="text-2xl font-black" id="quiz-heading">Làm thử 5 câu Word Form</h2>
    <p className="mt-2 leading-7 text-slate-600">Chọn một đáp án cho mỗi câu. Đáp án và giải thích xuất hiện sau khi bạn nộp.</p>
    <div className="mt-7 space-y-8">{questions.map((question, index) => {
      const result = results?.find((item) => item.id === question.id);
      const correct = question.options.find((option) => option.id === result?.correctOptionId);
      return <fieldset className="min-w-0 border-t border-slate-200 pt-6" key={question.id}>
        <legend className="text-lg font-bold leading-8">{index + 1}. {question.text}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <label className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border p-3 ${answers[question.id] === option.id ? "border-teal-700 bg-teal-50" : "border-slate-200"}`} key={option.id}>
          <input checked={answers[question.id] === option.id} disabled={pending} name={`word-form-${question.id}`} onChange={() => { setAnswers({ ...answers, [question.id]: option.id }); setResults(null); setError(""); }} type="radio" value={option.id} /><span className="min-w-0 break-words">{option.key}. {option.text}</span>
        </label>)}</div>
        {result && <p className={`mt-3 rounded-lg p-4 leading-7 ${answers[question.id] === result.correctOptionId ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"}`}>
          <strong>{answers[question.id] === result.correctOptionId ? "Đúng." : `Đáp án đúng: ${correct?.key}. ${correct?.text}.`}</strong> {result.explanation}
        </p>}
      </fieldset>;
    })}</div>
    <button className="mt-8 min-h-12 w-full rounded-lg bg-teal-800 px-6 font-bold text-white disabled:opacity-60 sm:w-auto" disabled={pending} onClick={submit} type="button">{pending ? "Đang chấm…" : "Kiểm tra đáp án"}</button>
    {error && <p aria-live="polite" className="mt-4 text-sm font-semibold text-amber-800">{error}</p>}
    {results && <p aria-live="polite" className="mt-4 text-lg font-bold">Bạn đúng {score}/5 câu. Xem giải thích ngay dưới từng câu.</p>}
  </section>;
}
