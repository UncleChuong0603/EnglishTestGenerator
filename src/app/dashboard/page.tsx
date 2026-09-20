import Link from "next/link";
import { redirect } from "next/navigation";
import {
  RecommendationUnavailable,
  UnifiedRecommendationCard,
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
import { getPremiumPreview } from "@/lib/premium/preview";

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
  const [profileResult, preferences, account, goal] = await Promise.all([
    getCurrentProfile(user.id),
    getPreferences(user.id),
    getPremiumAccount(user.id, user.email),
    getLearnerGoal(user.id).catch(() => null),
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

  const [dashboardResult, activeDemo, usage, diagnosticState, preview] =
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
      getPremiumPreview(user.id),
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 pb-24 text-slate-900 sm:px-6 sm:py-8 lg:pb-8">
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
        <header className="mt-8">
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
        <section className="mt-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5" aria-labelledby="goal-summary-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-800">{locale === "vi" ? "Mục tiêu học tập" : "Learning goal"}</p>
              <h2 className="mt-1 text-xl font-black" id="goal-summary-heading">{goal ? (goal.targetScore ? `${locale === "vi" ? "Mục tiêu TOEIC" : "Target TOEIC"}: ${goal.targetScore}` : (locale === "vi" ? "Kế hoạch học của bạn" : "Your study plan")) : (locale === "vi" ? "Chưa thiết lập mục tiêu" : "No goal set yet")}</h2>
              {goal ? <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">{goal.examDate ? <span>{locale === "vi" ? "Ngày thi" : "Test date"}: {formatExamDate(goal.examDate, locale)}</span> : null}{goal.dailyStudyMinutes ? <span>{goal.dailyStudyMinutes} {locale === "vi" ? "phút/ngày" : "min/day"}</span> : null}{goal.studyDaysPerWeek ? <span>{goal.studyDaysPerWeek} {locale === "vi" ? "ngày/tuần" : "days/week"}</span> : null}</div> : <p className="mt-2 max-w-2xl text-sm text-slate-600">{locale === "vi" ? "Cho TOEICGym biết mục tiêu và khả năng học thực tế của bạn. Bạn có thể bỏ qua và thiết lập sau." : "Tell TOEICGym your target and realistic study capacity. You can skip this and set it later."}</p>}
              {examDaysRemaining !== null ? <p className="mt-2 text-sm font-semibold text-slate-700">{examDaysRemaining < 0 ? (locale === "vi" ? "Ngày thi đã qua. Cập nhật ngày thi mới?" : "The test date has passed. Update it?") : examDaysRemaining === 0 ? (locale === "vi" ? "Ngày thi là hôm nay." : "Your test date is today.") : (locale === "vi" ? `Còn ${examDaysRemaining} ngày đến ngày thi` : `${examDaysRemaining} days until the test`)}</p> : null}
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end"><Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-700 px-4 font-bold text-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700" href="/settings?section=goal">{goal ? (locale === "vi" ? "Chỉnh sửa mục tiêu" : "Edit goal") : (locale === "vi" ? "Thiết lập mục tiêu" : "Set a goal")}</Link>{!goal ? <a className="inline-flex min-h-10 items-center justify-center text-sm font-semibold text-slate-500" href="#today-workout">{locale === "vi" ? "Bỏ qua lúc này" : "Skip for now"}</a> : null}</div>
          </div>
        </section>
        <div className="mt-7">
          <span className="sr-only" id="today-workout">{locale === "vi" ? "Bài tập hôm nay" : "Today's workout"}</span>
          {dashboardResult?.recommendDiagnostic ? (
            <section className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8">
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
          ) : dashboardResult?.recommendation ? (
            <UnifiedRecommendationCard
              dashboard
              locale={locale}
              recommendation={dashboardResult.recommendation}
            />
          ) : (
            <RecommendationUnavailable locale={locale} />
          )}
        </div>

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

        {preview.visible && preview.progress.hasSkillBreakdownPotential ? (
          <div className="mt-8">
            <PremiumPreviewCard
              locale={locale}
              title={
                locale === "vi"
                  ? "Phân tích sâu hơn từ dữ liệu của bạn"
                  : "Go deeper with your learning data"
              }
              body={
                locale === "vi" ? (
                  <>
                    Bạn đã luyện{" "}
                    <strong>{preview.progress.answeredCount}</strong> câu.
                    TOEICGym đã có đủ mẫu cho{" "}
                    <strong>{preview.progress.eligibleSkillCount}</strong> skill
                    và <strong>{preview.progress.eligibleSubskillCount}</strong>{" "}
                    subskill.
                  </>
                ) : (
                  <>
                    You answered{" "}
                    <strong>{preview.progress.answeredCount}</strong> questions.
                    TOEICGym has enough evidence for{" "}
                    <strong>{preview.progress.eligibleSkillCount}</strong>{" "}
                    skills and{" "}
                    <strong>{preview.progress.eligibleSubskillCount}</strong>{" "}
                    subskills.
                  </>
                )
              }
              values={["analytics"]}
            />
          </div>
        ) : null}

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
      </div>
    </main>
  );
}
