"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import type { PracticeSession, SubmittedAnswer } from "@/lib/practice/types";
import { submitPart5Practice } from "../../actions";

export function PracticeClient({ session }: { session: PracticeSession }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const enteredAt = useRef<number | null>(null);
  const question = session.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  useEffect(() => { enteredAt.current = Date.now(); }, []);

  function moveTo(index: number) {
    setCurrentIndex(index);
    enteredAt.current = Date.now();
  }

  function choose(optionId: string) {
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
    setResponseTimes((current) => current[question.id] === undefined && enteredAt.current !== null
      ? { ...current, [question.id]: Date.now() - enteredAt.current }
      : current);
  }

  function submit() {
    if (isPending) return;
    const unanswered = session.questionCount - answeredCount;
    if (unanswered > 0 && !window.confirm(`You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Unanswered questions will be marked incorrect. Submit now?`)) return;

    setError(null);
    const submittedAnswers: SubmittedAnswer[] = session.questions.map((item) => ({
      questionId: item.id,
      selectedOptionId: answers[item.id] ?? null,
      responseTimeMs: responseTimes[item.id],
    }));

    startTransition(async () => {
      const result = await submitPart5Practice(session.id, submittedAnswers);
      if (!result.ok) { setError(result.message); return; }
      router.push(`/practice/part-5/${result.sessionId}/results`);
    });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link className="font-semibold text-teal-700" href="/dashboard">Exit to dashboard</Link>
          <p className="text-sm font-semibold text-slate-600">Answered {answeredCount}/{session.questionCount}</p>
        </header>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200" aria-label={`${answeredCount} of ${session.questionCount} answered`} role="progressbar" aria-valuemin={0} aria-valuemax={session.questionCount} aria-valuenow={answeredCount}>
          <div className="h-full bg-teal-600 transition-all" style={{ width: `${(answeredCount / session.questionCount) * 100}%` }} />
        </div>
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-700">Part 5 · Question {currentIndex + 1} of {session.questionCount}</p>
          <h1 className="mt-5 text-xl font-bold leading-8 sm:text-2xl">{question.text}</h1>
          <fieldset className="mt-7 space-y-3">
            <legend className="sr-only">Choose one answer</legend>
            {question.options.map((option) => {
              const selected = answers[question.id] === option.id;
              return <label className={`flex min-h-14 cursor-pointer items-start gap-4 rounded-xl border p-4 transition ${selected ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600" : "border-slate-200 hover:border-slate-400"}`} key={option.id}><input checked={selected} className="mt-1" name={`question-${question.id}`} onChange={() => choose(option.id)} type="radio" value={option.id} /><span><strong className="mr-2">{option.key}.</strong>{option.text}</span></label>;
            })}
          </fieldset>
          {error ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p> : null}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:justify-between">
            <button className="min-h-11 rounded-xl border border-slate-300 px-4 py-2.5 font-bold disabled:opacity-40" disabled={currentIndex === 0 || isPending} onClick={() => moveTo(currentIndex - 1)} type="button">Previous</button>
            {currentIndex < session.questionCount - 1 ? <button className="min-h-11 rounded-xl bg-slate-900 px-4 py-2.5 font-bold text-white disabled:opacity-50" disabled={isPending} onClick={() => moveTo(currentIndex + 1)} type="button">Next</button> : null}
            <button className="col-span-2 min-h-11 rounded-xl bg-teal-700 px-5 py-2.5 font-bold text-white disabled:cursor-wait disabled:opacity-50 sm:ml-auto" disabled={isPending} onClick={submit} type="button">{isPending ? "Submitting..." : "Submit practice"}</button>
          </div>
        </section>
        <nav className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Question navigation">
          {session.questions.map((item, index) => <button aria-label={`Question ${index + 1}${answers[item.id] ? ", answered" : ""}`} className={`h-11 rounded-lg border text-sm font-bold ${index === currentIndex ? "border-slate-900 bg-slate-900 text-white" : answers[item.id] ? "border-teal-300 bg-teal-50 text-teal-800" : "border-slate-300 bg-white"}`} key={item.id} onClick={() => moveTo(index)} type="button">{index + 1}</button>)}
        </nav>
      </div>
    </main>
  );
}
