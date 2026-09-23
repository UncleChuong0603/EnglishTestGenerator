import Link from "next/link";
import { redirect } from "next/navigation";
import { RecommendationCard } from "@/components/analytics/recommendation-card";
import { LearnerNav } from "@/components/learner-nav";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { getCurrentProfile } from "@/lib/profiles/profile";
import { getReadingRecommendation } from "@/lib/practice/recommendation";
import { getCurrentUser } from "@/lib/auth/session";
import { startListeningPractice } from "./actions";
import { PracticeConfigurator } from "./practice-configurator";
import { getToeicProgress } from "@/lib/progress/queries";
import {
  PremiumPreviewCard,
  PremiumRenewalCard,
} from "@/components/premium/premium-preview";
import { getPremiumPreview } from "@/lib/premium/preview";

type Props = { searchParams: Promise<{ error?: string }> };
export default async function PracticePage({ searchParams }: Props) {
  const [{ error }, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (!user) redirect("/sign-in");
  const [profile, preferences, progress, preview] = await Promise.all([
    getCurrentProfile(user.id),
    getPreferences(user.id),
    getToeicProgress(user.id),
    getPremiumPreview(),
  ]);
  if (profile.status === "missing") redirect("/onboarding");
  const locale = preferences.interfaceLanguage;
  const t = getTranslations(locale);
  let recommendation;
  try {
    recommendation = await getReadingRecommendation(user.id);
  } catch (caught) {
    console.error("Could not load recommendation", caught);
    recommendation = null;
  }
  const errorMessage =
    error === "usage_limit"
      ? locale === "vi"
        ? "Bạn đã dùng hết lượt miễn phí trong kỳ này. Xem gói Premium tại trang Bảng giá."
        : "You have used all free sessions for this period. View Premium on Pricing."
      : error === "premium_required"
        ? locale === "vi"
          ? "Mục tiêu luyện tập này chỉ dành cho Premium."
          : "This practice target requires Premium."
        : error === "no_mistakes"
          ? locale === "vi"
            ? "Hiện không có lỗi sai chưa làm chủ để ôn tập."
            : "There are no unresolved mistakes to review."
          : error === "not_enough_history"
            ? locale === "vi"
              ? "Chưa có đủ dữ liệu đáng tin cậy để xác định điểm yếu."
              : "There is not enough reliable history to identify a weakness."
            : error?.startsWith("not_enough_listening")
              ? t.listening.notEnough
              : error === "not_enough_content"
                ? t.practiceConfig.content
                : error === "invalid_config"
                  ? t.practiceConfig.invalid
                  : t.practiceConfig.startError;
  const names = {
    1: t.listening.photographs,
    2: t.listening.questionResponse,
    3: t.listening.conversations,
    4: t.listening.talks,
  };
  const practiceUsage = preview.usage.MANUAL_PRACTICE;
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <LearnerNav locale={locale} />
      </div>
      <div className="mx-auto mt-8 max-w-5xl">
        <Link className="text-sm font-semibold text-teal-700" href="/dashboard">
          ← {t.practiceConfig.back}
        </Link>
        {error === "usage_limit" && preview.visible ? (
          <div className="mt-6">
            <PremiumPreviewCard
              locale={locale}
              title={
                locale === "vi"
                  ? `Bạn đã dùng ${practiceUsage.used}/${practiceUsage.type === "LIMITED" ? practiceUsage.limit : practiceUsage.used} lượt luyện hôm nay`
                  : `You used ${practiceUsage.used}/${practiceUsage.type === "LIMITED" ? practiceUsage.limit : practiceUsage.used} practice sessions today`
              }
              body={
                locale === "vi"
                  ? "Premium mở luyện không giới hạn và các mục tiêu luyện nâng cao từ chính lịch sử của bạn."
                  : "Premium unlocks unlimited practice and advanced targets based on your history."
              }
              values={["targeting"]}
            />
          </div>
        ) : error === "usage_limit" && preview.lifecycle === "EXPIRED" ? (
          <div className="mt-6">
            <PremiumRenewalCard
              locale={locale}
              title={
                locale === "vi"
                  ? "Khôi phục hạn mức luyện tập Premium"
                  : "Restore your Premium practice allowance"
              }
              body={
                locale === "vi"
                  ? "Gói trước đây đã hết hạn. Dữ liệu học tập vẫn được giữ nguyên; khôi phục Premium để tiếp tục luyện không giới hạn và dùng các mục tiêu nâng cao."
                  : "Your previous plan expired. Your learning data is intact; restore Premium to continue unlimited practice and advanced targets."
              }
            />
          </div>
        ) : null}
        {error && error !== "usage_limit" ? (
          <p
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">
            {t.practiceConfig.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            {t.practiceConfig.title}
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            {t.practiceConfig.intro}
          </p>
        </header>
        {recommendation ? (
          <div className="mt-8">
            <RecommendationCard
              dark
              locale={locale}
              recommendation={recommendation}
            />
          </div>
        ) : null}
        <section
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
          id="choose-focus"
        >
          <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
            {t.practiceConfig.choose}
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {t.practiceConfig.configure}
          </h2>
          <PracticeConfigurator locale={locale} />
        </section>
        <section className="practice-listening mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-9">
          <p className="text-sm font-bold uppercase tracking-wider text-teal-700">
            {t.listening.title}
          </p>
          <Link className="mt-3 inline-flex min-h-11 items-center font-bold text-teal-700 underline" href="/listening-lessons">{locale === "vi" ? "Thư viện luyện nghe với transcript và hình ảnh" : "Study listening with transcripts and images"}</Link>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {([1, 2, 3, 4] as const).map((part) => {
              const metric = progress.parts.find((item) => item.part === part);
              return (
                <form
                  action={startListeningPractice}
                  className="rounded-2xl bg-slate-50 p-5"
                  key={part}
                >
                  <input name="part" type="hidden" value={part} />
                  <h2 className="text-xl font-black">
                    Part {part} · {names[part]}
                  </h2>
                  {metric?.accuracy !== null &&
                  metric?.accuracy !== undefined ? (
                    <p className="mt-2 text-sm font-semibold text-teal-800">
                      {locale === "vi" ? "Độ chính xác" : "Accuracy"}{" "}
                      {metric.accuracy}% · {metric.attemptedCount}{" "}
                      {locale === "vi" ? "câu" : "questions"}
                    </p>
                  ) : part >= 3 ? (
                    <p className="mt-2 text-sm text-slate-600">
                      3 {t.listening.set.toLowerCase()} · 9{" "}
                      {t.listening.questions.toLowerCase()}
                    </p>
                  ) : null}
                  <button
                    className="mt-4 min-h-12 rounded-xl bg-slate-900 px-5 font-bold text-white"
                    type="submit"
                  >
                    {t.practiceConfig.start}
                  </button>
                </form>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
