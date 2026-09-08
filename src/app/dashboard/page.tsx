import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/profiles/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  aggregateStoredAnswers,
  formatSkill,
  getPerformanceInsights,
} from "@/lib/tests/analysis";
import type { Skill } from "@/lib/tests/types";

import { signOut } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/sign-in");
  }

  const profileResult = await getCurrentProfile(user.id);

  if (profileResult.status === "missing") {
    redirect("/onboarding");
  }

  if (profileResult.status === "error") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">
            We could not load your profile
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Please try again in a moment.
          </p>

          <Link
            className="mt-6 inline-flex rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            href="/"
          >
            Back to home
          </Link>
        </section>
      </main>
    );
  }

  const profile = profileResult.profile;
  const welcomeName = profile.full_name ?? user.email ?? "learner";

  const {
    data: attempts,
    count: attemptCount,
    error: attemptsError,
  } = await supabase
    .from("attempts")
    .select(
      `
        id,
        test_id,
        difficulty,
        correct_answers,
        total_questions,
        score_percent,
        submitted_at
      `,
      { count: "exact" },
    )
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(10);

  if (attemptsError) {
    console.error("Failed to load attempts:", attemptsError);
  }

  const attemptIds = attempts?.map((attempt) => attempt.id) ?? [];

  const { data: storedAnswers, error: answersError } = attemptIds.length
    ? await supabase
        .from("attempt_answers")
        .select("question_id, is_correct")
        .in("attempt_id", attemptIds)
    : { data: [], error: null };

  if (answersError) {
    console.error("Failed to load attempt answers:", answersError);
  }

  const questionIds = [
    ...new Set(
      (storedAnswers ?? []).map((answer) => answer.question_id),
    ),
  ];

  /*
   * Questions belong to the curated question bank.
   *
   * Use the admin client here because learners may not have direct SELECT
   * permission on fields such as skill/correct answers depending on RLS.
   *
   * This file is a Server Component, so the service-role client remains
   * server-side.
   */
  const admin = createAdminClient();

  const { data: questions, error: questionsError } = questionIds.length
    ? await admin
        .from("questions")
        .select("id, skill")
        .in("id", questionIds)
    : { data: [], error: null };

  if (questionsError) {
    console.error("Failed to load question skills:", questionsError);
  }

  const skillMap = new Map(
    (questions ?? []).map((question) => [
      question.id,
      question.skill as Skill,
    ]),
  );

  const skillResults = aggregateStoredAnswers(
    (storedAnswers ?? []).flatMap((answer) => {
      const skill = skillMap.get(answer.question_id);

      if (!skill) {
        return [];
      }

      return [
        {
          skill,
          isCorrect: answer.is_correct,
        },
      ];
    }),
  );

  const insights = getPerformanceInsights(skillResults);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-xl font-black" href="/">
            VSTEP Practice
          </Link>

          <div className="flex items-center gap-4">
            <Link
              className="font-semibold text-teal-700 transition hover:text-teal-800"
              href="/practice"
            >
              Practice
            </Link>

            <form action={signOut}>
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold transition hover:bg-slate-50"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="mt-10 rounded-3xl bg-slate-900 p-8 text-white sm:p-10">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-300">
            Your learning space
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Welcome, {welcomeName}
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-300">
            Your next Reading set is selected from the curated question bank
            using your recent skill performance. Skills that need improvement
            receive more attention while stronger skills stay in the mix.
          </p>

          <Link
            className="mt-7 inline-flex rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-teal-300"
            href="/practice"
          >
            Start practice
          </Link>
        </section>

        <section className="mt-7 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Practice sets completed
            </p>

            <p className="mt-2 text-3xl font-black">
              {attemptCount ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Current strengths
            </p>

            <p className="mt-2 font-bold">
              {insights.strengths.length
                ? insights.strengths
                    .map((strength) => formatSkill(strength.skill))
                    .join(", ")
                : "Complete a set to find out"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">
              Recommended next step
            </p>

            <p className="mt-2 text-sm leading-6">
              {insights.recommendation.message}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">
              Recent practice
            </h2>

            <Link
              className="font-semibold text-teal-700 transition hover:text-teal-800"
              href="/practice"
            >
              Start another set
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {attempts?.length ? (
              attempts.map((attempt) => (
                <Link
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-500"
                  href={`/results/${attempt.id}`}
                  key={attempt.id}
                >
                  <div>
                    <p className="font-bold">
                      Adaptive Reading practice
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {attempt.difficulty ?? "Reading"} ·{" "}
                      {attempt.submitted_at
                        ? new Date(
                            attempt.submitted_at,
                          ).toLocaleDateString("en-GB")
                        : "Completed"}
                    </p>
                  </div>

                  <p className="text-xl font-black">
                    {attempt.correct_answers}/{attempt.total_questions}{" "}
                    <span className="text-sm text-slate-500">
                      (
                      {Math.round(
                        Number(attempt.score_percent ?? 0),
                      )}
                      %)
                    </span>
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="font-bold">
                  No practice completed yet.
                </p>

                <p className="mt-2 text-slate-600">
                  Complete your first adaptive Reading set to start building
                  your learning history.
                </p>

                <Link
                  className="mt-5 inline-flex rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-800"
                  href="/practice"
                >
                  Start your first practice
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
