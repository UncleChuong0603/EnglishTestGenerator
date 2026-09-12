import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getPracticeResult } from "@/lib/practice/queries";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ sessionId: string }> };

export default async function PracticeResultsPage({ params }: PageProps) {
  const [{ sessionId }, supabase] = await Promise.all([params, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const result = await getPracticeResult(sessionId, user.id);
  if (!result) notFound();
  if (result === "in_progress") redirect(`/practice/part-5/${sessionId}`);
  const accuracy = Math.round((result.scoreCorrect / result.scoreTotal) * 100);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-3xl bg-slate-900 p-8 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-300">Part 5 practice complete</p>
          <h1 className="mt-3 text-4xl font-black">{result.scoreCorrect} / {result.scoreTotal}</h1>
          <p className="mt-2 text-lg text-slate-300">Accuracy: {accuracy}%</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link className="rounded-xl bg-white px-5 py-2.5 font-bold text-slate-900" href="/practice/part-5">Practice again</Link>
            <Link className="rounded-xl border border-slate-600 px-5 py-2.5 font-bold" href="/dashboard">Dashboard</Link>
          </div>
        </section>
        <h2 className="mt-10 text-2xl font-black">Answer review</h2>
        <div className="mt-5 space-y-5">
          {result.questions.map((question) => {
            const selected = question.options.find((option) => option.id === question.selectedOptionId);
            const correct = question.options.find((option) => option.id === question.correctOptionId);
            return (
              <article className="rounded-2xl border border-slate-200 bg-white p-6" key={question.id}>
                <p className={`text-sm font-bold ${question.isCorrect ? "text-emerald-700" : "text-red-700"}`}>Question {question.number} · {question.isCorrect ? "Correct" : "Incorrect"}</p>
                <h3 className="mt-3 text-lg font-bold leading-7">{question.text}</h3>
                <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4"><dt className="font-semibold text-slate-500">Your answer</dt><dd className="mt-1 font-bold">{selected ? `${selected.key}. ${selected.text}` : "Unanswered"}</dd></div>
                  <div className="rounded-xl bg-emerald-50 p-4"><dt className="font-semibold text-emerald-700">Correct answer</dt><dd className="mt-1 font-bold">{correct ? `${correct.key}. ${correct.text}` : "Unavailable"}</dd></div>
                </dl>
                {question.explanationEn ? <div className="mt-5"><h4 className="font-bold">Explanation</h4><p className="mt-1 leading-7 text-slate-600">{question.explanationEn}</p></div> : null}
                {question.explanationVi ? <div className="mt-4"><h4 className="font-bold">Giải thích</h4><p className="mt-1 leading-7 text-slate-600">{question.explanationVi}</p></div> : null}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
