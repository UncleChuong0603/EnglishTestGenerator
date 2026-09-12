import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PerformanceList } from "@/components/analytics/performance-list";
import { LearnerNav } from "@/components/learner-nav";
import { aggregatePerformance, percentage } from "@/lib/analytics/calculate";
import { getPracticeResult } from "@/lib/practice/queries";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ sessionId: string }> };

function performanceMessage(accuracy: number) {
  if (accuracy >= 85) return "Strong result. Review the missed answers to make the details stick.";
  if (accuracy >= 70) return "Solid work. The review below shows where you can gain the next few points.";
  if (accuracy >= 50) return "You have a useful foundation. Focus on the lowest-scoring subskills below.";
  return "This set found useful learning gaps. Review each explanation before your next practice.";
}

export default async function PracticeResultsPage({ params }: PageProps) {
  const [{ sessionId }, supabase] = await Promise.all([params, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const result = await getPracticeResult(sessionId, user.id);
  if (!result) notFound();
  if (result === "in_progress") redirect(`/practice/part-5/${sessionId}`);

  const accuracy = percentage(result.scoreCorrect, result.scoreTotal);
  const answeredCount = result.questions.filter((question) => question.selectedOptionId !== null).length;
  const attempts = result.questions.map((question) => ({ isCorrect: question.isCorrect, skill: question.skill, subSkill: question.subSkill }));
  const skills = aggregatePerformance(attempts, "skill");
  const subskills = aggregatePerformance(attempts, "subSkill");
  const focusAreas = subskills.filter((metric) => metric.attempted >= 5).slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <LearnerNav />
        <section className="mt-8 rounded-3xl bg-slate-900 p-7 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-300">Practice complete</p>
          <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
            <h1 className="text-5xl font-black">{result.scoreCorrect}/{result.scoreTotal}</h1>
            <p className="pb-1 text-xl font-bold text-teal-300">{accuracy}% accuracy</p>
          </div>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">{performanceMessage(accuracy)}</p>
          <p className="mt-2 text-sm text-slate-400">Answered {answeredCount} of {result.scoreTotal} questions. Unanswered items are graded as incorrect.</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950" href="/practice/part-5">Practice again</Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-600 px-5 py-3 font-bold" href="/progress">View progress</Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-600 px-5 py-3 font-bold" href="/dashboard">Back to dashboard</Link>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="mb-5 text-xl font-black">Skill performance</h2><PerformanceList metrics={skills} /></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black">Focus next</h2>
            {focusAreas.length ? <div className="mt-5"><PerformanceList metrics={focusAreas} /></div> : <p className="mt-3 leading-7 text-slate-600">This session does not contain 5 answers in one subskill, so it is too early to classify a weakness. Your progress page combines data across sessions.</p>}
          </section>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-teal-700">Learn from this set</p><h2 className="mt-2 text-2xl font-black">Answer review</h2></div><p className="text-sm text-slate-500">English and Vietnamese explanations</p></div>
        <div className="mt-5 space-y-5 pb-12">
          {result.questions.map((question) => {
            const selected = question.options.find((option) => option.id === question.selectedOptionId);
            const correct = question.options.find((option) => option.id === question.correctOptionId);
            return (
              <article className={`rounded-2xl border bg-white p-5 sm:p-7 ${question.isCorrect ? "border-emerald-200" : "border-red-200"}`} key={question.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-sm font-black ${question.isCorrect ? "text-emerald-700" : "text-red-700"}`}>Question {question.number} · {question.isCorrect ? "Correct" : "Incorrect"}</p>
                  <p className="text-xs font-semibold text-slate-500">{question.skill} · {question.subSkill}</p>
                </div>
                <h3 className="mt-3 text-lg font-bold leading-7">{question.text}</h3>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className={`rounded-xl p-4 ${question.isCorrect ? "bg-emerald-50" : "bg-red-50"}`}><dt className="text-sm font-semibold text-slate-600">Your answer</dt><dd className="mt-1 font-bold">{selected ? `${selected.key}. ${selected.text}` : "Unanswered"}</dd></div>
                  <div className="rounded-xl bg-emerald-50 p-4"><dt className="text-sm font-semibold text-emerald-700">Correct answer</dt><dd className="mt-1 font-bold">{correct ? `${correct.key}. ${correct.text}` : "Unavailable"}</dd></div>
                </dl>
                <div className="mt-5 border-t border-slate-100 pt-5"><h4 className="font-black">English explanation</h4><p className="mt-1 leading-7 text-slate-600">{question.explanationEn ?? "No English explanation is available for this question yet."}</p></div>
                <div className="mt-4"><h4 className="font-black">Giải thích tiếng Việt</h4><p className="mt-1 leading-7 text-slate-600">{question.explanationVi ?? "Chưa có phần giải thích tiếng Việt cho câu hỏi này."}</p></div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
