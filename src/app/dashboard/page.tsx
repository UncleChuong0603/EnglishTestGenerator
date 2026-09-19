import Link from "next/link";
import { redirect } from "next/navigation";
import { RecommendationUnavailable, UnifiedRecommendationCard } from "@/components/diagnosis/recommendation-card";
import { LearnerNav } from "@/components/learner-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/dashboard/service";
import { formatTimer, remainingSeconds } from "@/lib/demo-test/composition";
import { getActiveDemoTest } from "@/lib/demo-test/queries";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getCurrentProfile } from "@/lib/profiles/profile";
import type { SkillAreaProgress } from "@/lib/progress/types";
import { getUsageStatus } from "@/lib/entitlements/service";
import { getPremiumAccount } from "@/lib/premium/presentation";
import { TrendChart, UsageProgress } from "@/components/analytics/charts";
import { getLearnerTrend } from "@/lib/progress/queries";

function ProgressCard({ area, locale }: { area: SkillAreaProgress; locale: InterfaceLanguage }) {
  const t = getTranslations(locale).workout;
  const title = area.skillArea === "LISTENING" ? t.listening : t.reading;
  return <article className="rounded-2xl border border-slate-200 bg-white p-5">
    <h3 className="text-lg font-black">{title}</h3>
    {area.accuracy === null ? <p className="mt-4 text-lg font-semibold text-slate-500">{t.noData}</p> : <><p className="mt-3 text-3xl font-black">{area.accuracy}%</p><div aria-label={`${title}: ${area.accuracy}%`} className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="img"><div className="h-full rounded-full bg-teal-600" style={{ width: `${area.accuracy}%` }} /></div><p className="mt-3 text-sm text-slate-600">{area.attemptedCount} {t.questionsPracticed}</p></>}
  </article>;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const [profileResult, preferences, account] = await Promise.all([getCurrentProfile(user.id), getPreferences(user.id), getPremiumAccount(user.id,user.email)]);
  const locale = preferences.interfaceLanguage;
  const translations = getTranslations(locale);
  if (profileResult.status === "missing") redirect("/onboarding");
  if (profileResult.status === "error") return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center"><div><h1 className="text-2xl font-black">{translations.dashboard.loadErrorTitle}</h1><p className="mt-2 text-slate-600">{translations.dashboard.loadErrorBody}</p></div></main>;

  const [dashboardResult, activeDemo, usage] = await Promise.all([
    getDashboardData(user.id).catch((error) => { console.error("Could not load dashboard data", error); return null; }),
    getActiveDemoTest(user.id).catch((error) => { console.error("Could not load active demo", error); return null; }),
    getUsageStatus(user.id),
  ]);
  const profile = profileResult.profile!;
  const t = translations.workout;
  const trend = dashboardResult?.progress.attemptedCount ? await getLearnerTrend(user.id, 7).catch(() => null) : null;

  return <main className="min-h-screen bg-slate-50 px-4 py-6 pb-24 text-slate-900 sm:px-6 sm:py-8 lg:pb-8"><div className="mx-auto max-w-6xl">
    <LearnerNav locale={locale} />
    <header className="mt-8"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{translations.dashboard.welcome}</p><h1 className="mt-2 break-words text-3xl font-black sm:text-4xl">{profile.full_name ?? user.email ?? "Learner"}</h1>{account.isPremium?<p className="mt-2 text-sm font-semibold text-amber-900">Premium{account.expiresAt ? ` · ${locale === "vi" ? "Hết hạn vào" : "Expires on"} ${account.expiresAt.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}` : ""}</p>:null}</header>
    <div className="mt-7">{dashboardResult?.recommendDiagnostic ? <section className="rounded-3xl bg-slate-900 p-6 text-white sm:p-8"><p className="text-sm font-black uppercase tracking-wider text-teal-300">{locale === "vi" ? "Xây dựng hồ sơ TOEIC" : "Build your TOEIC profile"}</p><h2 className="mt-2 text-2xl font-black">{dashboardResult.activeDiagnosticId ? (locale === "vi" ? "Tiếp tục bài đánh giá đầu vào" : "Continue your diagnostic") : (locale === "vi" ? "Bắt đầu bài đánh giá đầu vào" : "Take your diagnostic assessment")}</h2><p className="mt-3 max-w-2xl text-slate-300">{locale === "vi" ? "Hoàn thành một bài ngắn qua Listening và Reading để cá nhân hóa luyện tập nhanh hơn." : "Complete a short Listening and Reading assessment to personalize your training faster."}</p><Link className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-teal-400 px-5 font-bold text-slate-950" href={dashboardResult.activeDiagnosticId ? `/diagnostic/${dashboardResult.activeDiagnosticId}` : "/diagnostic"}>{dashboardResult.activeDiagnosticId ? (locale === "vi" ? "Tiếp tục đánh giá" : "Continue diagnostic") : (locale === "vi" ? "Bắt đầu đánh giá" : "Start diagnostic")}</Link></section> : dashboardResult?.recommendation ? <UnifiedRecommendationCard dashboard locale={locale} recommendation={dashboardResult.recommendation} /> : <RecommendationUnavailable locale={locale} />}</div>

    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="plan-heading"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-teal-700">{usage.effectivePlan}</p><h2 className="mt-1 text-xl font-black" id="plan-heading">{locale === "vi" ? "Mức sử dụng" : "Plan usage"}</h2></div><Link className="font-bold text-teal-700" href="/pricing">{locale === "vi" ? "Xem các gói" : "View plans"}</Link></div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">{([['TODAYS_WORKOUT', locale === 'vi' ? 'Bài hôm nay' : "Today's Workout"],['MANUAL_PRACTICE', locale === 'vi' ? 'Luyện tập' : 'Practice'],['MASTERY_REVIEW', locale === 'vi' ? 'Ôn lỗi sai' : 'Mastery Review'],['FULL_MOCK','Full Mock']] as const).map(([key,label]) => { const item = usage.entitlements[key]; const period = key === 'FULL_MOCK' ? (locale === 'vi' ? 'Đặt lại theo tháng' : 'Resets monthly') : (locale === 'vi' ? 'Đặt lại hằng ngày' : 'Resets daily'); return item.type === 'UNLIMITED' ? <div className="rounded-xl bg-slate-50 p-4" key={key}><strong>{label}</strong><p className="mt-3 text-sm font-bold text-teal-700">{locale === 'vi' ? 'Không giới hạn' : 'Unlimited'}</p></div> : <UsageProgress key={key} label={label} used={item.used} limit={item.limit} period={period} />; })}</div></section>

    <section className="mt-8" aria-labelledby="progress-heading"><div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-2xl font-black" id="progress-heading">{t.progressTitle}</h2><Link className="font-bold text-teal-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/progress">{t.viewProgress}</Link></div>
      {dashboardResult ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><ProgressCard area={dashboardResult.progress.listening} locale={locale} /><ProgressCard area={dashboardResult.progress.reading} locale={locale} /></div> : <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900" role="alert">{translations.dashboard.progressError}</p>}
    </section>

    {dashboardResult?.progress.attemptedCount ? <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="snapshot-heading"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{locale === "vi" ? "7 ngày gần đây" : "Last 7 days"}</p><h2 className="mt-1 text-xl font-black" id="snapshot-heading">{locale === "vi" ? "Ảnh chụp học tập" : "Learning snapshot"}</h2></div><Link className="font-bold text-teal-700" href="/progress">{locale === "vi" ? "Phân tích chi tiết" : "Detailed analytics"}</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{locale === "vi" ? "Độ chính xác" : "Accuracy"}</p><p className="mt-1 text-2xl font-black">{dashboardResult.progress.accuracy}%</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{locale === "vi" ? "Câu đã làm" : "Answered"}</p><p className="mt-1 text-2xl font-black">{dashboardResult.progress.attemptedCount}</p></div><div className="rounded-xl bg-slate-50 p-4"><p className="text-sm text-slate-500">{locale === "vi" ? "Lỗi chưa xử lý" : "Unresolved mistakes"}</p><p className="mt-1 text-2xl font-black">{dashboardResult.unresolvedMistakes}</p></div></div>{trend ? <div className="mt-6"><TrendChart points={trend.points} title={locale === "vi" ? "Xu hướng độ chính xác 7 ngày" : "7-day accuracy trend"} emptyText={locale === "vi" ? "Cần hoạt động trong ít nhất 2 ngày để vẽ xu hướng." : "Activity on at least two days is needed for a trend."} /></div> : null}</section> : null}

    {dashboardResult ? <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:flex sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">{translations.mastery.title}</h2><p className="mt-2 text-slate-600">{translations.mastery.toReview}: <strong>{dashboardResult.unresolvedMistakes}</strong></p></div><Link className="mt-4 inline-flex rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800 sm:mt-0" href="/mistakes">{translations.mastery.review}</Link></section> : null}

    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6"><div><p className="text-sm font-bold uppercase tracking-wider text-teal-700">{translations.demoTest.shortTitle}</p><h2 className="mt-1 text-xl font-black">{activeDemo ? translations.demoTest.resume : translations.demoTest.dashboardTitle}</h2><p className="mt-2 text-slate-600">{activeDemo ? `${translations.demoTest.timeRemaining}: ${formatTimer(remainingSeconds(activeDemo.expires_at))}` : translations.demoTest.dashboardBody}</p></div><Link className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:mt-0" href={activeDemo ? `/demo-test/${activeDemo.id}` : "/demo-test"}>{activeDemo ? translations.demoTest.resume : translations.demoTest.start}</Link></section>
  </div></main>;
}
