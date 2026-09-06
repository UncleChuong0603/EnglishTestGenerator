"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { submitAttempt } from "@/app/tests/actions";
import type { AnswerKey, ReadingQuestion } from "@/lib/tests/types";

export function TestRunner({ attemptId, passage, questions, title }: { attemptId: string; passage: string; questions: ReadingQuestion[]; title: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});
  const [submitting, setSubmitting] = useState(false); const [error, setError] = useState("");
  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  async function submit() {
    const unanswered = questions.length - answered;
    if (unanswered && !window.confirm(`${unanswered} question${unanswered === 1 ? " is" : "s are"} unanswered. Submit anyway?`)) return;
    if (!window.confirm("Submit your answers? You cannot change them afterwards.")) return;
    setSubmitting(true); setError("");
    const result = await submitAttempt(attemptId, questions.map((q) => ({ questionId: q.id, selectedAnswer: answers[q.id] ?? null })));
    if (!result.ok) { setError(result.message); setSubmitting(false); return; }
    router.push(`/results/${result.id}`);
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-teal-700">VSTEP-style Reading</p><h1 className="text-2xl font-bold">{title}</h1></div><p className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">Answered {answered}/{questions.length}</p></header>
      <article className="rounded-2xl border border-slate-200 bg-white p-6 leading-8 shadow-sm sm:p-8"><h2 className="mb-4 text-lg font-bold">Reading passage</h2><div className="whitespace-pre-wrap text-slate-700">{passage}</div></article>
      <div className="mt-7 space-y-5">{questions.map((q) => <fieldset className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" key={q.id}><legend className="px-1 font-bold">{q.question_order}. {q.question}</legend><div className="mt-4 space-y-3">{q.options.map((option) => <label className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${answers[q.id] === option.key ? "border-teal-600 bg-teal-50" : "border-slate-200 hover:bg-slate-50"}`} key={option.key}><input checked={answers[q.id] === option.key} name={q.id} onChange={() => setAnswers((current) => ({ ...current, [q.id]: option.key }))} type="radio" value={option.key}/><span><strong>{option.key}.</strong> {option.text}</span></label>)}</div></fieldset>)}</div>
      {error ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700" role="alert">{error}</p> : null}
      <div className="sticky bottom-4 mt-8 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur"><button className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-slate-700 disabled:opacity-60" disabled={submitting} onClick={submit} type="button">{submitting ? "Submitting…" : "Submit test"}</button></div>
    </div>
  </main>;
}
