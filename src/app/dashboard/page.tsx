import Link from "next/link";
import { redirect } from "next/navigation";
import {
  RecommendationUnavailable,
} from "@/components/diagnosis/recommendation-card";
import { LearnerNav } from "@/components/learner-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard/service";
import { formatTimer, remainingSeconds } from "@/lib/demo-test/composition";
import { getActiveDemoTest } from "@/lib/demo-test/queries";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { daysUntilExam, formatExamDate } from "@/lib/goals/domain";
import { getLearnerGoal } from "@/lib/goals/service";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getCurrentProfile } from "@/lib/profiles/profile";
import type { SkillAreaProgress } from "@/lib/progress/types";
import { getUsageStatus } from "@/lib/entitlements/service";
import { getPremiumAccount } from "@/lib/premium/presentation";
import { TrendChart, UsageProgress } from "@/components/analytics/charts";
import { getLearnerTrend } from "@/lib/progress/queries";
import { startMasteryReview } from "@/app/mistakes/actions";
import { getAdvancedMockHistory } from "@/lib/full-mock/service";
import { compareCompatible } from "@/lib/full-mock/history";
import { getDiagnosticEligibility } from "@/lib/diagnostic/service";
import { PremiumPreviewCard } from "@/components/premium/premium-preview";
import { progressPreviewFrom } from "@/lib/premium/preview-policy";
import { startRecommendedPractice } from "@/app/practice/actions";
import { dailyGoalProgress, getDailyWorkload, getDashboardLifecycle, getGroupSafeWorkoutSize } from "@/lib/workout/policy";
import { shouldPromptForLearnerContext } from "@/lib/learner-context/service";
import { LearnerContextPrompt } from "@/components/learner-context-prompt";

function ProgressCard({
  area,
  locale,
}: {
  area: SkillAreaProgress;
  locale: InterfaceLanguage;
}) {
  const t = getTranslations(locale).workout;
  const title = area.skillArea === "LISTENING" ? t.listening : t.reading;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-black">{title}</h3>
      {area.accuracy === null ? (
        <p className="mt-4 text-lg font-semibold text-slate-500">{t.noData}</p>
      ) : (
        <>
          <p className="mt-3 text-3xl font-black">{area.accuracy}%</p>
          <div
            aria-label={`${title}: ${area.accuracy}%`}
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
            role="img"
          >
            <div
              className="h-full rounded-full bg-teal-600"
              style={{ width: `${area.accuracy}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {area.attemptedCount} {t.questionsPracticed}
          </p>
        </>
      )}
    </article>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const [profileResult, preferences, account, goal, showContextPrompt] = await Promise.all([
    getCurrentProfile(user.id),
    getPreferences(user.id),
    getPremiumAccount(user.id, user.email),
    getLearnerGoal(user.id).catch(() => null),
    shouldPromptForLearnerContext(user.id).catch(() => false),
  ]);
  const locale = preferences.interfaceLanguage;
  const translations = getTranslations(locale);
  if (profileResult.status === "missing") redirect("/onboarding");
  if (profileResult.status === "error")
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
        <div>
          <h1 className="text-2xl font-black">
            {translations.dashboard.loadErrorTitle}
          </h1>
          <p className="mt-2 text-slate-600">
            {translations.dashboard.loadErrorBody}
          </p>
        </div>
      </main>
    );

  const [dashboardResult, activeDemo, usage, diagnosticState] =
    await Promise.all([
      getDashboardData(user.id).catch((error) => {
        console.error("Could not load dashboard data", error);
        return null;
      }),
      getActiveDemoTest(user.id).catch((error) => {
        console.error("Could not load active demo", error);
        return null;
      }),
      getUsageStatus(user.id),
      getDiagnosticEligibility(user.id),
    ]);
  const profile = profileResult.profile!;
  const t = translations.workout;
  const trend = dashboardResult?.progress.attemptedCount
    ? await getLearnerTrend(user.id, 7).catch(() => null)
    : null;
  const recentAnswered =
    trend?.points.reduce((sum, point) => sum + point.answeredCount, 0) ?? 0;
  const recentCorrect =
    trend?.points.reduce((sum, point) => sum + point.correctCount, 0) ?? 0;
  const recentAccuracy = recentAnswered
    ? Math.round((recentCorrect / recentAnswered) * 100)
    : null;
  const recentLearningDays =
    trend?.points.filter((point) => point.answeredCount > 0).length ?? 0;
  const mockHistory =
    usage.effectivePlan === "PREMIUM"
      ? await getAdvancedMockHistory(user.id).catch(() => null)
      : null;
  const latestMock = mockHistory?.[0] ?? null;
  const latestMockComparison = latestMock
    ? compareCompatible(mockHistory!, latestMock.mode)
    : null;
  const examDaysRemaining = goal?.examDate ? daysUntilExam(goal.examDate) : null;
  const workload = getDailyWorkload({ goal, plan: usage.effectivePlan, workoutUsage: usage.entitlements.TODAYS_WORKOUT });
  const dailyGoal = dailyGoalProgress(dashboardResult?.completedQuestionsToday ?? 0, workload.targetQuestions);
  const workoutSize = dashboardResult?.recommendation
    ? getGroupSafeWorkoutSize(dashboardResult.recommendation.part, workload.targetQuestions)
    : null;
  const recommendation = dashboardResult?.recommendation && workoutSize
    ? { ...dashboardResult.recommendation, requestedQuestionCount: workload.targetQuestions, ...workoutSize }
    : null;
  const focusLabel = recommendation?.primarySubskill ?? recommendation?.primarySkill;
  const lifecycle = getDashboardLifecycle({
    recommendDiagnostic: dashboardResult?.recommendDiagnostic ?? false,
    hasResumablePractice: Boolean(dashboardResult?.resumablePractice),
    dailyGoalComplete: dailyGoal.complete,
    completedLearningSessions: dashboardResult?.completedLearningSessions ?? 0,
  });
  const dashboardPremiumPreview = dashboardResult
    ? progressPreviewFrom(dashboardResult.progress)
    : null;

  return (
    <main className="learner-page min-h-screen px-4 py-6 pb-24 text-slate-900 sm:px-6 sm:py-8 lg:pb-8">
      <div className="mx-auto max-w-6xl">
        <LearnerNav locale={locale} />
        {account.lifecycle === "ACTIVE_EXPIRING_SOON" ||
        account.lifecycle === "ACTIVE_EXPIRING_VERY_SOON" ? (
          <aside
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-teal-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            aria-label={
              locale === "vi"
                ? "Thông tin thời hạn Premium"
                : "Premium expiry notice"
            }
          >
            <div>
              <p className="font-bold">
                {locale === "vi"
                  ? `Premium còn ${account.daysRemaining} ngày`
                  : `${account.daysRemaining} Premium days remaining`}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {locale === "vi"
                  ? "Gia hạn sẽ cộng thêm thời gian sau ngày hết hạn hiện tại. Dữ liệu học tập của bạn vẫn được giữ nguyên."
                  : "Extending adds time after your current expiry. Your learning data is retained."}
              </p>
            </div>
            <Link href="/billing" className="shrink-0 font-bold text-teal-800">
              {locale === "vi" ? "Gia hạn Premium" : "Extend Premium"}
            </Link>
          </aside>
        ) : account.lifecycle === "EXPIRED" ? (
          <aside className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-700">
              {locale === "vi"
                ? "Premium đã hết hạn. Bạn vẫn có thể học với Free; dữ liệu học tập của bạn vẫn được giữ nguyên."
                : "Premium expired. Free learning remains available and your learning data is retained."}
            </p>
            <Link href="/billing" className="shrink-0 font-bold text-teal-800">
              {locale === "vi" ? "Khôi phục Premium" : "Restore Premium"}
            </Link>
          </aside>
        ) : null}
        <header className="learner-welcome mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
            {translations.dashboard.welcome}
          </p>
          <h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">
            {profile.full_name ?? user.email ?? "Learner"}
          </h1>
          {account.isPremium ? (
            <p className="mt-2 text-sm font-semibold text-amber-900">
              Premium
              {account.expiresAt
                ? ` · ${locale === "vi" ? "Hết hạn vào" : "Expires on"} ${account.expiresAt.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}`
                : ""}
            </p>
          ) : null}
        </header>
        <div className="mt-7">
          <span className="sr-only" id="today-workout">{locale === "vi" ? "Bài tập hôm nay" : "Today's workout"}</span>
          {lifecycle === "NEW" && dashboardResult ? (
            <section className="workout-card rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
              <p className="text-sm font-black uppercase tracking-wider text-teal-300">
                {locale === "vi"
                  ? "Xây dựng hồ sơ TOEIC"
                  : "Build your TOEIC profile"}
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {dashboardResult.activeDiagnosticId
                  ? locale === "vi"
                    ? "Tiếp tục bài đánh giá đầu vào"
                    : "Continue your diagnostic"
                  : locale === "vi"
                    ? "Bắt đầu bài đánh giá đầu vào"
                    : "Take your diagnostic assessment"}
              </h2>
              <p className="mt-3 max-w-2xl text-slate-300">
                {locale === "vi"
                  ? "Hoàn thành một bài ngắn qua Listening và Reading để cá nhân hóa luyện tập nhanh hơn."
                  : "Complete a short Listening and Reading assessment to personalize your training faster."}
              </p>
              <Link
                className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-teal-400 px-5 font-bold text-slate-950"
                href={
                  dashboardResult.activeDiagnosticId
                    ? `/diagnostic/${dashboardResult.activeDiagnosticId}`
                    : "/diagnostic"
                }
              >
                {dashboardResult.activeDiagnosticId
                  ? locale === "vi"
                    ? "Tiếp tục đánh giá"
                    : "Continue diagnostic"
                  : locale === "vi"
                    ? "Bắt đầu đánh giá"
                    : "Start diagnostic"}
              </Link>
            </section>
          ) : lifecycle === "RESUMABLE" && dashboardResult?.resumablePractice ? (
            <section className="workout-card rounded-3xl bg-slate-900 p-6 text-white sm:p-8" aria-labelledby="today-heading">
              <p className="text-xs font-black uppercase tracking-[.18em] text-teal-300">{locale === "vi" ? "Bài hôm nay" : "Today's Workout"}</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl" id="today-heading">{locale === "vi" ? "Tiếp tục bài đang làm" : "Continue your session"}</h2>
              <p className="mt-3 text-slate-300">{dashboardResult.resumablePractice.questionCount} {locale === "vi" ? "câu" : "questions"}{dashboardResult.resumablePractice.part ? ` · Part ${dashboardResult.resumablePractice.part}` : ""}</p>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">{locale === "vi" ? "Hoàn thành phiên hợp lệ đang dở trước khi tạo một bài mới." : "Finish your valid in-progress session before creating another one."}</p>
              <Link className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-teal-300 px-5 font-black text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200" href={`/practice/${dashboardResult.resumablePractice.id}`}>{locale === "vi" ? "Tiếp tục bài" : "Continue session"}</Link>
            </section>
          ) : lifecycle === "DAILY_GOAL_COMPLETE" ? (
            <section className="workout-card rounded-3xl bg-slate-900 p-6 text-white sm:p-8" aria-labelledby="today-heading">
              <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">{locale === "vi" ? "Bài hôm nay" : "Today's Workout"}</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl" id="today-heading">{locale === "vi" ? "✓ Mục tiêu hôm nay đã hoàn thành" : "✓ Today's goal is complete"}</h2>
              <p className="mt-3 max-w-2xl text-slate-200">{locale === "vi" ? `Bạn đã hoàn thành ${dailyGoal.completedQuestions} câu học có ý nghĩa hôm nay. Có thể ôn câu sai hoặc luyện thêm nếu quyền hiện tại cho phép.` : `You completed ${dailyGoal.completedQuestions} meaningful learning questions today. Review mistakes or keep practicing if your current access allows it.`}</p>
              <div className="mt-5 flex flex-wrap gap-3"><Link className="inline-flex min-h-12 items-center rounded-xl bg-emerald-300 px-5 font-black text-slate-950" href={dashboardResult?.mistakes.unresolvedCount ? "/mistakes" : "/practice"}>{dashboardResult?.mistakes.unresolvedCount ? (locale === "vi" ? "Ôn câu sai" : "Review mistakes") : (locale === "vi" ? "Luyện thêm" : "Keep practicing")}</Link><Link className="inline-flex min-h-12 items-center px-3 font-bold text-emerald-200" href="/progress">{locale === "vi" ? "Xem tiến độ" : "View progress"}</Link></div>
            </section>
          ) : recommendation ? (
            <section className="workout-card rounded-3xl bg-slate-900 p-6 text-white sm:p-8" aria-labelledby="today-heading">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[.14em] text-teal-300">
                    <span>{locale === "vi" ? "Bài hôm nay" : "Today's Workout"}</span>
                    {goal?.targetScore ? <span>· {locale === "vi" ? "Mục tiêu TOEIC" : "Target TOEIC"} {goal.targetScore}</span> : null}
                    {examDaysRemaining !== null && examDaysRemaining >= 0 ? <span>· {locale === "vi" ? `còn ${examDaysRemaining} ngày` : `${examDaysRemaining} days left`}</span> : null}
                  </div>
                  <h2 className="mt-3 text-3xl font-black" id="today-heading">{recommendation.skillArea === "LISTENING" ? "Listening" : "Reading"}{recommendation.part ? ` · Part ${recommendation.part}` : ""}</h2>
                  {focusLabel ? <p className="mt-2 text-lg font-bold text-teal-100">{focusLabel.replaceAll("_", " ")}</p> : null}
                  <p className="mt-3 font-semibold text-slate-200">~{workload.approximateMinutes} {locale === "vi" ? "phút" : "minutes"} · {recommendation.questionCount} {locale === "vi" ? "câu" : "questions"}{recommendation.groupCount ? ` · ${recommendation.groupCount} ${locale === "vi" ? "bộ" : "sets"}` : ""}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300"><strong className="text-white">{locale === "vi" ? "Vì sao?" : "Why?"}</strong> {recommendation.reasonCode === "SUPPORTED_WEAKNESS" ? (locale === "vi" ? "Đây là một trong những vùng đã luyện có ưu tiên cải thiện cao nhất của bạn." : "This is one of your highest-priority practiced areas for improvement.") : recommendation.reasonCode === "EARLY_EXPLORATION" ? (locale === "vi" ? "Dữ liệu còn sớm; bài này giúp xây dựng đề xuất đáng tin cậy hơn." : "Your data is still early; this workout builds a more reliable recommendation.") : (locale === "vi" ? "Bài cân bằng này giúp TOEICGym hiểu hồ sơ học tập của bạn mà không giả định điểm yếu." : "This balanced workout builds your learning profile without inventing a weakness.")}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-3">
                  {workload.workoutAvailable ? <form action={startRecommendedPractice}><button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-300 px-6 font-black text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200">{locale === "vi" ? "Bắt đầu bài hôm nay" : "Start today's workout"}</button></form> : <Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-teal-300 px-6 font-bold text-teal-100" href="/practice">{locale === "vi" ? "Chọn bài luyện khác" : "Choose other practice"}</Link>}
                  <Link className="text-center text-sm font-bold text-teal-200 underline-offset-4 hover:underline" href="/practice">{locale === "vi" ? "Tự chọn bài luyện" : "Choose your own practice"}</Link>
                </div>
              </div>
            </section>
          ) : (
            <RecommendationUnavailable locale={locale} />
          )}
        </div>

        {showContextPrompt ? <LearnerContextPrompt locale={locale} /> : null}

        <section className="daily-goal-card mt-4 rounded-2xl border border-teal-200 bg-white p-5" aria-labelledby="daily-goal-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-wider text-teal-700">{locale === "vi" ? "Nhịp học mỗi ngày" : "Daily pace"}</p><h2 className="mt-1 text-xl font-black" id="daily-goal-heading">{dailyGoal.complete ? (locale === "vi" ? "✓ Hoàn thành mục tiêu hôm nay" : "✓ Today's goal completed") : (locale === "vi" ? "Mục tiêu hôm nay" : "Today's Goal")}</h2></div>
            <p className="text-2xl font-black" aria-label={`${dailyGoal.completedQuestions} / ${dailyGoal.targetQuestions}`}>{dailyGoal.completedQuestions} / {dailyGoal.targetQuestions} <span className="text-sm font-semibold text-slate-500">{locale === "vi" ? "câu" : "questions"}</span></p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={dailyGoal.targetQuestions} aria-valuenow={Math.min(dailyGoal.completedQuestions, dailyGoal.targetQuestions)} aria-label={locale === "vi" ? "Tiến độ mục tiêu hôm nay" : "Today's goal progress"}><div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width: `${dailyGoal.percent}%` }} /></div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"><p>{dailyGoal.complete ? (locale === "vi" ? "Bạn vẫn có thể tiếp tục học nếu gói hiện tại cho phép." : "You can keep learning when your current plan allows it.") : (locale === "vi" ? `Còn ${dailyGoal.remainingQuestions} câu để hoàn thành mục tiêu hôm nay.` : `${dailyGoal.remainingQuestions} questions remaining today.`)}</p><Link className="font-bold text-teal-800" href="/settings?section=goal">{goal ? (locale === "vi" ? "Chỉnh sửa mục tiêu" : "Edit goal") : (locale === "vi" ? "Thiết lập mục tiêu" : "Set your goal")}</Link></div>
          {goal ? <p className="mt-3 text-xs text-slate-500">{goal.examDate ? `${locale === "vi" ? "Ngày thi" : "Test date"}: ${formatExamDate(goal.examDate, locale)} · ` : ""}{goal.studyDaysPerWeek ? `${goal.studyDaysPerWeek} ${locale === "vi" ? "ngày/tuần" : "days/week"} · ` : ""}{workload.studyMinutes} {locale === "vi" ? "phút/ngày" : "min/day"}</p> : null}
        </section>

        {usage.effectivePlan === "PREMIUM" &&
        diagnosticState.status !== "NEEDS_BASELINE" ? (
          <section
            className="mt-8 rounded-2xl border border-teal-200 bg-white p-5 sm:flex sm:items-center sm:justify-between sm:gap-6"
            aria-labelledby="reassessment-heading"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-teal-700">
                Premium · Diagnostic
              </p>
              <h2 className="mt-1 text-xl font-black" id="reassessment-heading">
                {diagnosticState.status === "ACTIVE"
                  ? locale === "vi"
                    ? "Đánh giá đang thực hiện"
                    : "Assessment in progress"
                  : diagnosticState.status === "ELIGIBLE"
                    ? locale === "vi"
                      ? "Đã đến lúc kiểm tra lại tiến độ"
                      : "Time for a progress checkpoint"
                    : locale === "vi"
                      ? "Đánh giá gần nhất"
                      : "Latest assessment"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {diagnosticState.status === "COOLDOWN" &&
                diagnosticState.nextEligibleAt
                  ? locale === "vi"
                    ? `Bạn có thể đánh giá lại sau ${diagnosticState.nextEligibleAt.toLocaleDateString("vi-VN")}.`
                    : `You can reassess after ${diagnosticState.nextEligibleAt.toLocaleDateString("en-US")}.`
                  : diagnosticState.status === "ELIGIBLE"
                    ? locale === "vi"
                      ? "Đánh giá lại để so sánh với lần trước."
                      : "Reassess to compare with your previous checkpoint."
                    : locale === "vi"
                      ? "Tiếp tục bài đang làm; quyền hoàn thành được giữ ngay cả khi gói hết hạn."
                      : "Continue your active assessment."}
              </p>
            </div>
            {diagnosticState.status === "ACTIVE" ||
            diagnosticState.status === "ELIGIBLE" ? (
              <Link
                className="mt-4 inline-flex min-h-12 shrink-0 items-center rounded-xl bg-teal-700 px-5 font-bold text-white sm:mt-0"
                href={
                  diagnosticState.activeRunId
                    ? `/diagnostic/${diagnosticState.activeRunId}`
                    : "/diagnostic"
                }
              >
                {diagnosticState.status === "ACTIVE"
                  ? locale === "vi"
                    ? "Tiếp tục đánh giá"
                    : "Continue assessment"
                  : locale === "vi"
                    ? "Đánh giá lại"
                    : "Reassess"}
              </Link>
            ) : null}
          </section>
        ) : null}

        <section className="mt-8" aria-labelledby="progress-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-black" id="progress-heading">
              {t.progressTitle}
            </h2>
            <Link
              className="font-bold text-teal-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              href="/progress"
            >
              {t.viewProgress}
            </Link>
          </div>
          {dashboardResult ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ProgressCard
                area={dashboardResult.progress.listening}
                locale={locale}
              />
              <ProgressCard
                area={dashboardResult.progress.reading}
                locale={locale}
              />
            </div>
          ) : (
            <p
              className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900"
              role="alert"
            >
              {translations.dashboard.progressError}
            </p>
          )}
        </section>

        {dashboardResult?.progress.attemptedCount ? (
          <section
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"
            aria-labelledby="snapshot-heading"
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
                  {locale === "vi" ? "7 ngày gần đây" : "Last 7 days"}
                </p>
                <h2 className="mt-1 text-xl font-black" id="snapshot-heading">
                  {locale === "vi" ? "Ảnh chụp học tập" : "Learning snapshot"}
                </h2>
              </div>
              <Link className="font-bold text-teal-700" href="/progress">
                {locale === "vi" ? "Phân tích chi tiết" : "Detailed analytics"}
              </Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4">
                <p className="text-sm text-slate-500">
                  {locale === "vi" ? "Độ chính xác gần đây" : "Recent accuracy"}
                </p>
                <p className="mt-1 text-2xl font-black">
                  {recentAccuracy === null ? "—" : `${recentAccuracy}%`}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {locale === "vi"
                    ? `${recentCorrect}/${recentAnswered} câu đúng`
                    : `${recentCorrect}/${recentAnswered} correct`}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm text-slate-500">
                  {locale === "vi" ? "Câu trong 7 ngày" : "7-day answers"}
                </p>
                <p className="mt-1 text-2xl font-black">{recentAnswered}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {locale === "vi" ? "Tổng lượt trả lời" : "Total responses"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm text-slate-500">
                  {locale === "vi" ? "Ngày có học" : "Learning days"}
                </p>
                <p className="mt-1 text-2xl font-black">{recentLearningDays}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {locale === "vi" ? "Trong 7 ngày gần nhất" : "Within the last 7 days"}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4">
                <p className="text-sm text-slate-500">
                  {locale === "vi" ? "Lỗi chưa xử lý" : "Unresolved mistakes"}
                </p>
                <p className="mt-1 text-2xl font-black">
                  {dashboardResult.mistakes.unresolvedCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {locale === "vi" ? "Đang chờ ôn lại" : "Waiting for review"}
                </p>
              </div>
            </div>
            {trend ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                <div className="mb-5">
                  <h3 className="font-black">
                    {locale === "vi"
                      ? "Độ chính xác và khối lượng luyện tập"
                      : "Accuracy and practice volume"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {locale === "vi"
                      ? "Mỗi điểm phần trăm chỉ phản ánh những câu đã trả lời trong ngày đó."
                      : "Each percentage point reflects only the questions answered on that day."}
                  </p>
                </div>
                <TrendChart
                  points={trend.points}
                  locale={locale}
                  title={
                    locale === "vi"
                      ? "Xu hướng độ chính xác 7 ngày"
                      : "7-day accuracy trend"
                  }
                  emptyText={
                    locale === "vi"
                      ? "Cần hoạt động trong ít nhất 2 ngày để vẽ xu hướng."
                      : "Activity on at least two days is needed for a trend."
                  }
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {account.lifecycle === "FREE" &&
        dashboardPremiumPreview?.hasSkillBreakdownPotential ? (
          <div className="mt-8">
            <PremiumPreviewCard
              locale={locale}
              title={
                locale === "vi"
                  ? "Dữ liệu của bạn đã sẵn sàng để phân tích sâu hơn"
                  : "Your data is ready for deeper analysis"
              }
              body={
                locale === "vi" ? (
                  <>
                    Bạn đã luyện{" "}
                    <strong>{dashboardPremiumPreview.answeredCount}</strong> câu.
                    TOEICGym hiện có đủ mẫu cho{" "}
                    <strong>
                      {dashboardPremiumPreview.eligibleSkillCount}
                    </strong>{" "}
                    skill và{" "}
                    <strong>
                      {dashboardPremiumPreview.eligibleSubskillCount}
                    </strong>{" "}
                    subskill.
                  </>
                ) : (
                  <>
                    You answered{" "}
                    <strong>{dashboardPremiumPreview.answeredCount}</strong>{" "}
                    questions. TOEICGym now has enough evidence for{" "}
                    <strong>
                      {dashboardPremiumPreview.eligibleSkillCount}
                    </strong>{" "}
                    skills and{" "}
                    <strong>
                      {dashboardPremiumPreview.eligibleSubskillCount}
                    </strong>{" "}
                    subskills.
                  </>
                )
              }
              values={["analytics"]}
            />
          </div>
        ) : null}

        {dashboardResult &&
        dashboardResult.mistakes.unresolvedCount +
          dashboardResult.mistakes.masteredCount >
          0 ? (
          usage.effectivePlan === "PREMIUM" ? (
            <section
              className="mt-8 rounded-2xl border border-teal-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"
              aria-labelledby="mistake-review-heading"
            >
              <div>
                <h2 className="text-xl font-black" id="mistake-review-heading">
                  {locale === "vi" ? "Ôn lỗi sai" : "Mistake review"}
                </h2>
                {dashboardResult.mistakes.unresolvedCount === 0 ? (
                  <p className="mt-2 font-semibold text-emerald-800">
                    {locale === "vi"
                      ? "Bạn đã làm chủ tất cả lỗi hiện tại."
                      : "You have mastered all current mistakes."}
                  </p>
                ) : dashboardResult.mistakes.reviewableCount > 0 ? (
                  <>
                    <p className="mt-2 text-slate-700">
                      <strong>
                        {dashboardResult.mistakes.unresolvedCount}
                      </strong>{" "}
                      {locale === "vi" ? "câu cần ôn" : "questions to review"}
                    </p>
                    {dashboardResult.mistakes.repeatedMistakeCount > 0 ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {locale === "vi"
                          ? `Sai nhiều lần: ${dashboardResult.mistakes.repeatedMistakeCount}`
                          : `Repeated misses: ${dashboardResult.mistakes.repeatedMistakeCount}`}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-slate-700">
                      {locale === "vi"
                        ? `${dashboardResult.mistakes.unresolvedCount} lỗi đang được lưu`
                        : `${dashboardResult.mistakes.unresolvedCount} mistakes are saved`}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {locale === "vi"
                        ? "Hiện chưa có câu phù hợp để tạo phiên ôn."
                        : "No questions are currently eligible for a review session."}
                    </p>
                  </>
                )}
              </div>
              {dashboardResult.mistakes.reviewableCount > 0 ? (
                <form action={startMasteryReview} className="mt-4 sm:mt-0">
                  <input name="smart" type="hidden" value="true" />
                  <input name="size" type="hidden" value="10" />
                  <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                    {locale === "vi" ? "Ôn ưu tiên" : "Priority review"}
                  </button>
                </form>
              ) : (
                <Link
                  className="mt-4 inline-flex min-h-11 items-center font-bold text-teal-800 sm:mt-0"
                  href={
                    dashboardResult.mistakes.unresolvedCount
                      ? "/mistakes"
                      : "/practice"
                  }
                >
                  {dashboardResult.mistakes.unresolvedCount
                    ? locale === "vi"
                      ? "Xem ngân hàng lỗi"
                      : "View Mistake Bank"
                    : locale === "vi"
                      ? "Luyện tập tiếp"
                      : "Keep practicing"}
                </Link>
              )}
            </section>
          ) : (
            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:flex sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black">
                  {translations.mastery.title}
                </h2>
                <p className="mt-2 text-slate-600">
                  {translations.mastery.toReview}:{" "}
                  <strong>{dashboardResult.mistakes.unresolvedCount}</strong>
                </p>
              </div>
              <Link
                className="mt-4 inline-flex rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800 sm:mt-0"
                href="/mistakes"
              >
                {translations.mastery.review}
              </Link>
            </section>
          )
        ) : null}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
              {translations.demoTest.shortTitle}
            </p>
            <h2 className="mt-1 text-xl font-black">
              {activeDemo
                ? translations.demoTest.resume
                : translations.demoTest.dashboardTitle}
            </h2>
            <p className="mt-2 text-slate-600">
              {activeDemo
                ? `${translations.demoTest.timeRemaining}: ${formatTimer(remainingSeconds(activeDemo.expires_at))}`
                : translations.demoTest.dashboardBody}
            </p>
          </div>
          <Link
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:mt-0"
            href={activeDemo ? `/demo-test/${activeDemo.id}` : "/demo-test"}
          >
            {activeDemo
              ? translations.demoTest.resume
              : translations.demoTest.start}
          </Link>
        </section>
        {usage.effectivePlan === "PREMIUM" ? (
          <section
            className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            aria-labelledby="plan-heading"
          >
            <div>
              <h2 className="font-black" id="plan-heading">
                Premium
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {locale === "vi"
                  ? "Không giới hạn luyện tập, ôn lỗi sai và mock theo quyền truy cập hiện tại."
                  : "Unlimited practice, mistake review, and mock access under the current policy."}
              </p>
            </div>
            <Link className="shrink-0 font-bold text-teal-700" href="/billing">
              {locale === "vi" ? "Quản lý gói" : "Manage plan"}
            </Link>
          </section>
        ) : (
          <section
            className="mt-8 rounded-2xl border border-slate-200 bg-white p-6"
            aria-labelledby="plan-heading"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-teal-700">
                  FREE
                </p>
                <h2 className="mt-1 text-xl font-black" id="plan-heading">
                  {locale === "vi" ? "Mức sử dụng" : "Plan usage"}
                </h2>
              </div>
              <Link className="font-bold text-teal-700" href="/pricing">
                {locale === "vi" ? "Xem Premium" : "View Premium"}
              </Link>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  [
                    "TODAYS_WORKOUT",
                    locale === "vi" ? "Bài hôm nay" : "Today's Workout",
                  ],
                  [
                    "MANUAL_PRACTICE",
                    locale === "vi" ? "Luyện tập" : "Practice",
                  ],
                  [
                    "MASTERY_REVIEW",
                    locale === "vi" ? "Ôn lỗi sai" : "Mastery Review",
                  ],
                  ["FULL_MOCK", "Full Mock"],
                ] as const
              ).map(([key, label]) => {
                const item = usage.entitlements[key];
                if (item.type === "UNLIMITED") return null;
                const period =
                  key === "FULL_MOCK"
                    ? locale === "vi"
                      ? "Đặt lại theo tháng"
                      : "Resets monthly"
                    : locale === "vi"
                      ? "Đặt lại hằng ngày"
                      : "Resets daily";
                return (
                  <UsageProgress
                    key={key}
                    label={label}
                    used={item.used}
                    limit={item.limit}
                    period={period}
                  />
                );
              })}
            </div>
          </section>
        )}

        {usage.effectivePlan === "PREMIUM" ? (
          <section className="mt-8 rounded-2xl border border-teal-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
                Thi thử gần nhất
              </p>
              {latestMock ? (
                <>
                  <h2 className="mt-1 text-xl font-black">
                    {latestMock.mode === "FULL"
                      ? "Full Mock"
                      : `${latestMock.mode[0]}${latestMock.mode.slice(1).toLowerCase()} Mock`}{" "}
                    · {latestMock.overall.correct}/{latestMock.overall.total}
                  </h2>
                  {latestMockComparison ? (
                    <p className="mt-1 text-sm text-slate-600">
                      {latestMockComparison.overallDelta > 0 ? "+" : ""}
                      {latestMockComparison.overallDelta} câu đúng so với lần
                      cùng loại trước
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-slate-600">
                      Hoàn thành thêm một bài cùng loại để bắt đầu so sánh.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="mt-1 text-xl font-black">
                    Chưa có kết quả thi thử
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Hoàn thành một bài để bắt đầu theo dõi.
                  </p>
                </>
              )}
            </div>
            <Link
              className="mt-4 inline-flex font-bold text-teal-700 sm:mt-0"
              href={latestMock ? "/full-mock/history" : "/full-mock"}
            >
              {latestMock ? "Xem lịch sử" : "Bắt đầu thi thử"}
            </Link>
          </section>
        ) : null}

      </div>
    </main>
  );
}
