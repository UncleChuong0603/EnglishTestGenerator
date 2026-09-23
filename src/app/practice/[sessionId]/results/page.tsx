import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { startReadingPractice } from "@/app/practice/actions";
import { PerformanceList } from "@/components/analytics/performance-list";
import { LearnerNav } from "@/components/learner-nav";
import { PassageDocuments } from "@/components/practice/passage-documents";
import { AnswerReviewCard } from "@/components/practice/answer-review-card";
import { aggregatePerformance, percentage } from "@/lib/analytics/calculate";
import {
  formatMessage,
  getPreferences,
  getTranslations,
} from "@/lib/i18n/get-translations";
import { modeLabel, taxonomyLabel } from "@/lib/i18n/labels";
import { getPracticeResult } from "@/lib/practice/queries";
import type { ReadingPart } from "@/lib/toeic/domain";
import { ListeningResult } from "./listening-result";
import { getCurrentUser } from "@/lib/auth/session";
import { UnifiedRecommendationCard } from "@/components/diagnosis/recommendation-card";
import { loadRecommendedWorkout } from "@/lib/diagnosis/service";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { getMasteryReviewSummary } from "@/lib/mastery/queries";
import { ReviewOutcome } from "@/components/mastery/review-outcome";
import { PremiumPreviewCard } from "@/components/premium/premium-preview";
import { getPremiumPreview } from "@/lib/premium/preview";
import { guestContinuationPath } from "@/lib/auth/redirect";

export default async function PracticeResultsPage({
  params,
}: PageProps<"/practice/[sessionId]/results">) {
  const [{ sessionId }, user, guestOwnerHash] = await Promise.all([
    params,
    getCurrentUser(),
    getGuestOwnerHash(),
  ]);
  if (!user && !guestOwnerHash) redirect("/try");
  const [result, preferences] = await Promise.all([
    getPracticeResult(
      sessionId,
      user ? { userId: user.id } : { guestOwnerHash: guestOwnerHash! },
    ),
    getPreferences(user?.id),
  ]);
  if (!result) notFound();
  if (result === "in_progress") redirect(`/practice/${sessionId}`);
  const [recommendation, reviewOutcome, preview] = await Promise.all([
    user
      ? loadRecommendedWorkout(user.id).catch((error) => {
          console.error("Could not load post-practice recommendation", error);
          return null;
        })
      : null,
    user && result.source === "mastery_review"
      ? getMasteryReviewSummary(result.id, user.id)
      : null,
    user ? getPremiumPreview() : null,
  ]);
  const locale = preferences.interfaceLanguage;
  if (result.skillArea === "LISTENING")
    return (
      <>
        <ListeningResult
          locale={locale}
          premiumPreview={preview}
          recommendation={recommendation}
          result={result}
          reviewOutcome={reviewOutcome}
        />
        {!user ? (
          <aside className="fixed bottom-4 left-1/2 z-20 w-[min(92vw,42rem)] -translate-x-1/2 rounded-2xl bg-teal-700 p-4 text-center text-white shadow-2xl">
            <p className="font-bold">
              {locale === "vi"
                ? "Lưu kết quả & nhận bài luyện tiếp theo"
                : "Save this result & get your next practice"}
            </p>
            <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className="rounded-lg bg-white px-4 py-2 font-bold text-teal-800"
                href={`/sign-up?from=guest-result&next=${encodeURIComponent(guestContinuationPath(sessionId))}`}
              >
                {locale === "vi"
                  ? "Lưu & tiếp tục miễn phí"
                  : "Save & continue free"}
              </Link>
              <Link
                className="rounded-lg border border-white px-4 py-2 font-bold"
                href={`/sign-in?next=${encodeURIComponent(guestContinuationPath(sessionId))}`}
              >
                {locale === "vi" ? "Đăng nhập" : "Sign in"}
              </Link>
            </div>
          </aside>
        ) : null}
      </>
    );
  const t = getTranslations(locale);
  const accuracy = percentage(result.scoreCorrect, result.scoreTotal);
  const attempts = result.questions
    .filter((question) => question.part >= 5)
    .map((question) => ({
      isCorrect: question.isCorrect,
      skill: question.skill,
      subSkill: question.subSkill,
      part: question.part as ReadingPart,
      answeredAt: result.submittedAt,
      sessionId: result.id,
    }));
  const skills = aggregatePerformance(attempts, "skill");
  const parts = ([5, 6, 7] as const).flatMap((part) => {
    const questions = result.questions.filter((q) => q.part === part);
    if (!questions.length) return [];
    const correct = questions.filter((q) => q.isCorrect).length;
    return [
      {
        part,
        correct,
        total: questions.length,
        accuracy: percentage(correct, questions.length),
      },
    ];
  });
  const resultFocus =
    result.requestedSubSkill ??
    result.requestedSkill ??
    (result.source === "mastery_review"
      ? locale === "vi"
        ? "Ôn lỗi sai"
        : "Review mistakes"
      : result.source === "target_weakness"
        ? locale === "vi"
          ? "Điểm yếu"
          : "Target weakness"
        : result.source === "prefer_unseen"
          ? locale === "vi"
            ? "Câu chưa làm"
            : "Prefer unseen"
          : null);
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <LearnerNav locale={locale} />
        <section className="mt-8 rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-300">
            {t.results.complete}
          </p>
          {resultFocus ? (
            <p className="mt-2 font-bold text-slate-300">
              {parts.length === 1 ? `Part ${parts[0].part} — ` : ""}
              {taxonomyLabel(resultFocus, locale)}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-2">
            <h1 className="text-3xl font-black sm:text-4xl">
              {formatMessage(t.results.correctCount, {
                correct: result.scoreCorrect,
                total: result.scoreTotal,
              })}
            </h1>
            <p className="pb-1 text-lg font-bold text-teal-300">
              {formatMessage(t.results.accuracy, { accuracy })}
            </p>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            {formatMessage(t.results.answered, {
              answered: result.questions.filter((q) => q.selectedOptionId)
                .length,
              total: result.scoreTotal,
            })}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <form action={startReadingPractice}>
              <input name="mode" type="hidden" value={result.mode} />
              <input
                name="skill"
                type="hidden"
                value={result.requestedSkill ?? ""}
              />
              <input
                name="subSkill"
                type="hidden"
                value={result.requestedSubSkill ?? ""}
              />
              <input
                name="questionCount"
                type="hidden"
                value={result.requestedQuestionCount}
              />
              <input name="source" type="hidden" value={result.source} />
              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 hover:bg-teal-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300"
                type="submit"
              >
                {t.results.again}
              </button>
            </form>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-600 px-5 py-3 font-bold hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href="/progress"
            >
              {t.results.progress}
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center px-3 py-3 text-sm font-semibold text-slate-300 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-white"
              href="/dashboard"
            >
              {t.results.dashboard}
            </Link>
          </div>
        </section>
        {!user ? (
          <section className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-6">
            <h2 className="text-2xl font-black">
              {locale === "vi"
                ? "Lưu kết quả & tiếp tục miễn phí"
                : "Save your result & continue free"}
            </h2>
            <p className="mt-2 text-slate-700">
              {locale === "vi"
                ? "Tạo tài khoản để giữ kết quả này, nhận bài luyện tiếp theo và theo dõi tiến bộ. Kết quả guest sẽ được gắn an toàn sau khi đăng nhập."
                : "Create an account to keep this result, receive the next recommended practice, and track progress. Your guest result is safely attached after sign-in."}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-xl bg-teal-700 px-5 py-3 text-center font-bold text-white"
                href={`/sign-up?from=guest-result&next=${encodeURIComponent(guestContinuationPath(sessionId))}`}
              >
                {locale === "vi"
                  ? "Lưu kết quả & tiếp tục miễn phí"
                  : "Save result & continue free"}
              </Link>
              <Link
                className="rounded-xl border border-teal-700 px-5 py-3 text-center font-bold text-teal-800"
                href={`/sign-in?next=${encodeURIComponent(guestContinuationPath(sessionId))}`}
              >
                {locale === "vi"
                  ? "Tôi đã có tài khoản"
                  : "I already have an account"}
              </Link>
            </div>
          </section>
        ) : null}
        {reviewOutcome ? (
          <ReviewOutcome data={reviewOutcome} locale={locale} />
        ) : null}
        {recommendation ? (
          <div className="mt-6">
            <UnifiedRecommendationCard
              compact
              locale={locale}
              recommendation={recommendation}
            />
          </div>
        ) : null}
        {preview?.visible && preview.progress.hasSkillBreakdownPotential ? (
          <div className="mt-6">
            <PremiumPreviewCard
              locale={locale}
              title={
                locale === "vi"
                  ? "Muốn luyện sâu hơn từ kết quả này?"
                  : "Want to go deeper from this result?"
              }
              body={
                locale === "vi"
                  ? "Premium có thể dùng kết quả này cùng lịch sử của bạn để ưu tiên kỹ năng cần cải thiện."
                  : "Premium can combine this result with your history to prioritize skills that need improvement."
              }
              values={["targeting"]}
            />
          </div>
        ) : null}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black">{t.results.byPart}</h2>
            <div className="mt-5 space-y-4">
              {parts.map((part) => (
                <div key={part.part}>
                  <div className="flex justify-between font-bold">
                    <span>Part {part.part}</span>
                    <span>
                      {part.correct}/{part.total} · {part.accuracy}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-teal-600"
                      style={{ width: `${part.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-xl font-black">
              {t.results.skillPerformance}
            </h2>
            <PerformanceList locale={locale} metrics={skills} />
          </section>
        </div>
        <div className="mt-10">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
            {t.results.learn}
          </p>
          <h2 className="mt-2 text-2xl font-black">{t.results.review}</h2>
          <nav
            aria-label={t.results.reviewNavigation}
            className="mt-4 flex gap-2 overflow-x-auto pb-2"
          >
            {result.questions.map((question) => (
              <a
                className={`inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border px-2 text-sm font-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${question.isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}
                href={`#review-question-${question.number}`}
                key={question.id}
              >
                <span className="sr-only">{t.practice.question} </span>
                {question.number}{" "}
                <span aria-hidden="true" className="ml-1">
                  {question.isCorrect ? "✓" : "✕"}
                </span>
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-4 space-y-6 pb-12">
          {result.groups.map((group) => (
            <section
              className="rounded-3xl border border-slate-200 bg-white/50 p-4 sm:p-6"
              key={group.id}
            >
              <div className="mb-4">
                <p className="text-sm font-black uppercase tracking-wider text-teal-700">
                  Part {group.part} · {modeLabel(group.setType, locale)}
                </p>
                {group.title ? (
                  <h3 className="mt-1 text-xl font-black" lang="en">
                    {group.title}
                  </h3>
                ) : null}
              </div>
              {group.passages.length ? (
                <details className="mb-4 rounded-2xl border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-4 py-3 font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-teal-700">
                    {locale === "vi" ? "Xem lại bài đọc" : "Review passage"}
                  </summary>
                  <div className="border-t border-slate-200 p-3" lang="en">
                    <PassageDocuments passages={group.passages} />
                  </div>
                </details>
              ) : null}
              <div className="space-y-3">
                {group.questions.map((question) => (
                  <AnswerReviewCard
                    explanationLanguage={preferences.explanationLanguage}
                    key={question.id}
                    locale={locale}
                    question={question}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
