import Link from "next/link";
import { LearnerNav } from "@/components/learner-nav";
import { requireUser } from "@/lib/auth/session";
import {
  getActiveMock,
  getFullMockHistory,
  getMockHubReadiness,
} from "@/lib/full-mock/service";
import type { MockMode } from "@/lib/full-mock/blueprint";
import { getPreferences } from "@/lib/i18n/get-translations";
import { startMock } from "./actions";
import { getActiveDemoTest } from "@/lib/demo-test/queries";
import { getEffectiveCapabilities } from "@/lib/entitlements/service";
import {
  PremiumPreviewCard,
  PremiumRenewalCard,
} from "@/components/premium/premium-preview";
import { getPremiumPreview } from "@/lib/premium/preview";
import { getActiveShortMock, getShortMockReadiness } from "@/lib/short-mock/service";
import { ShortMockPicker } from "./short-mock-picker";

const copy = {
  vi: {
    title: "Thi thử",
    intro: "Luyện tập với thời gian và điều kiện tương tự bài thi TOEIC.",
    start: "Bắt đầu",
    resume: "Tiếp tục",
    active: "Đang làm",
    soon: "Sắp ra mắt",
    unavailable:
      "Chúng tôi đang chuẩn bị thêm câu hỏi đã được kiểm tra cho dạng bài thi này.",
    conditions: "Điều kiện làm bài",
    rules: [
      "Đồng hồ chạy liên tục",
      "Không xem đáp án trong khi thi",
      "Kết quả chỉ mở sau khi hoàn thành",
      "Đây là bài luyện tập theo định dạng TOEIC, không phải bài thi chính thức của ETS",
    ],
    history: "Lịch sử thi thử",
    shortTitle: "Đề thi thử ngắn",
    shortIntro: "Chọn độ khó và kiểm tra nhanh Part 5 trước khi bước vào bài thi dài.",
  },
  en: {
    title: "Mock Tests",
    intro: "Practice under realistic TOEIC timing and test conditions.",
    start: "Start",
    resume: "Continue",
    active: "In progress",
    soon: "Coming soon",
    unavailable:
      "We're preparing enough validated questions for this test format.",
    conditions: "Test conditions",
    rules: [
      "The timer runs continuously",
      "Answers stay hidden during the test",
      "Results unlock only after completion",
      "This is TOEIC-style practice, not an official ETS test",
    ],
    history: "Mock test history",
    shortTitle: "Short mock test",
    shortIntro: "Choose a difficulty and check your Part 5 readiness before a longer test.",
  },
} as const;

type Props = { searchParams: Promise<{ shortError?: string }> };

export default async function FullMockPage({ searchParams }: Props) {
  const user = await requireUser();
  const [
    ready,
    actives,
    history,
    preferences,
    activeDemo,
    capabilities,
    preview,
    shortReadiness,
    activeShortMock,
    query,
  ] = await Promise.all([
    getMockHubReadiness(),
    Promise.all(
      (["LISTENING", "READING", "FULL"] as MockMode[]).map((mode) =>
        getActiveMock(user.id, mode),
      ),
    ),
    getFullMockHistory(user.id, 3),
    getPreferences(user.id),
    getActiveDemoTest(user.id),
    getEffectiveCapabilities(user.id),
    getPremiumPreview(),
    getShortMockReadiness(),
    getActiveShortMock(user.id),
    searchParams,
  ]);
  const locale = preferences.interfaceLanguage === "en" ? "en" : "vi",
    t = copy[locale];
  const cards = [
    {
      mode: "READING" as const,
      title: locale === "vi" ? "Thi thử Reading" : "Reading Mock Test",
      stats:
        locale === "vi"
          ? ["100 câu", "75 phút", "Part 5–7"]
          : ["100 questions", "75 minutes", "Parts 5–7"],
      description:
        locale === "vi"
          ? "Làm trọn phần Reading theo thời gian thi thực tế."
          : "Practice the complete TOEIC Reading section.",
      readiness: ready.reading,
      active: actives[1],
    },
    {
      mode: "LISTENING" as const,
      title: locale === "vi" ? "Thi thử Listening" : "Listening Mock Test",
      stats:
        locale === "vi"
          ? ["100 câu", "45 phút", "Part 1–4"]
          : ["100 questions", "45 minutes", "Parts 1–4"],
      description:
        locale === "vi"
          ? "Làm trọn phần Listening theo thời gian thi thực tế."
          : "Practice the complete TOEIC Listening section.",
      readiness: ready.listening,
      active: actives[0],
    },
    {
      mode: "FULL" as const,
      title: locale === "vi" ? "Thi thử TOEIC đầy đủ" : "Full Mock Test",
      stats:
        locale === "vi"
          ? ["200 câu", "Listening 45 phút · Reading 75 phút", "Part 1–7"]
          : ["200 questions", "Listening 45 min · Reading 75 min", "Parts 1–7"],
      description:
        locale === "vi"
          ? "Làm cả Listening và Reading trong điều kiện thi có giới hạn thời gian."
          : "Complete Listening and Reading under full timed conditions.",
      readiness: ready.full,
      active: actives[2],
    },
  ];
  const mockUsage = preview.usage.FULL_MOCK;
  const quotaReached = mockUsage.type === "LIMITED" && mockUsage.limit > 0 && mockUsage.remaining === 0 && (ready.listening.ready || ready.full.ready);
  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <LearnerNav locale={preferences.interfaceLanguage} />
        <header className="mt-8 max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">{t.intro}</p>
        </header>
        <section
          aria-labelledby="short-mock-title"
          className="mt-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          id="short-mock"
        >
          <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">
            {locale === "vi" ? "12 phút tập trung" : "12-minute focus"}
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl" id="short-mock-title">
            {t.shortTitle}
          </h2>
          <p className="mt-2 max-w-2xl leading-7 text-slate-600">{t.shortIntro}</p>
          {query.shortError ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950" role="alert">
              {query.shortError === "usage_limit" ? (
                <>
                  {locale === "vi"
                    ? "Bạn đã dùng hết lượt luyện tập miễn phí trong kỳ này. "
                    : "You have used all free practice sessions for this period. "}
                  <Link className="font-bold underline" href="/pricing">
                    {locale === "vi" ? "Xem bảng giá" : "View pricing"}
                  </Link>
                </>
              ) : query.shortError === "content_not_ready" ? (
                locale === "vi" ? "Mức này chưa có đủ 20 câu đã được kiểm tra. Hãy chọn mức khác." : "This level does not yet have 20 validated questions. Choose another level."
              ) : query.shortError === "invalid_level" ? (
                locale === "vi" ? "Hãy chọn một mức Dễ, Vừa hoặc Khó." : "Choose Easy, Medium, or Hard."
              ) : locale === "vi" ? "Chưa thể tạo đề ngắn. Vui lòng thử lại." : "Could not build the short mock. Please try again."}
            </div>
          ) : null}
          <ShortMockPicker active={activeShortMock} locale={preferences.interfaceLanguage} readiness={shortReadiness} />
        </section>
        {quotaReached && preview.visible ? (
          <div className="mt-6">
            <PremiumPreviewCard
              locale={preferences.interfaceLanguage}
              title={
                locale === "vi"
                  ? `Bạn đã dùng ${mockUsage.used}/${mockUsage.limit} lượt Mock tháng này`
                  : `You used ${mockUsage.used}/${mockUsage.limit} mocks this month`
              }
              body={
                locale === "vi"
                  ? "Premium mở thi thử không giới hạn đối với các mode đang READY; không vượt qua trạng thái sẵn sàng của nội dung."
                  : "Premium unlocks unlimited mocks for modes that are READY; it does not bypass content readiness."
              }
            />
          </div>
        ) : quotaReached &&
          preview.lifecycle === "EXPIRED" ? (
          <div className="mt-6">
            <PremiumRenewalCard
              locale={preferences.interfaceLanguage}
              title={
                locale === "vi"
                  ? "Khôi phục hạn mức thi thử Premium"
                  : "Restore your Premium mock allowance"
              }
              body={
                locale === "vi"
                  ? "Gói trước đây đã hết hạn. Lịch sử thi thử vẫn được giữ nguyên; khôi phục Premium để tiếp tục các mode đang READY."
                  : "Your previous plan expired. Your mock history remains intact; restore Premium to continue modes that are READY."
              }
            />
          </div>
        ) : null}
        <section
          aria-label={t.title}
          className="mt-7 grid gap-4 lg:grid-cols-3"
        >
          {cards.map((card) => (
            <article
              className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${card.mode === "READING" ? "border-teal-300" : "border-slate-200"}`}
              key={card.mode}
            >
              <p className="text-xs font-black tracking-[.16em] text-teal-700">
                {card.mode}
              </p>
              <h2 className="mt-3 text-2xl font-black">{card.title}</h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {card.stats.map((stat) => (
                  <li
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold"
                    key={stat}
                  >
                    {stat}
                  </li>
                ))}
              </ul>
              <p className="mt-5 leading-7 text-slate-600">
                {card.description}
              </p>
              <div className="mt-auto pt-7">
                {card.active ? (
                  <>
                    <p className="mb-3 font-bold text-teal-800">
                      {t.active} ·{" "}
                      {card.active.status === "LISTENING"
                        ? "Listening"
                        : "Reading"}
                    </p>
                    <Link
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 font-black text-white outline-offset-2 hover:bg-teal-800 focus-visible:outline-2"
                      href={`/full-mock/${card.active.id}`}
                    >
                      {t.resume} {card.title}
                    </Link>
                  </>
                ) : card.mode === "READING" ? (
                  <>
                    <p className="mb-3 text-sm font-bold text-teal-800">
                      {activeDemo
                        ? t.active
                        : locale === "vi"
                          ? "Có thể bắt đầu"
                          : "Available"}
                    </p>
                    <Link
                      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 py-3 text-center font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2"
                      href={
                        activeDemo
                          ? `/demo-test/${activeDemo.id}`
                          : "/demo-test"
                      }
                    >
                      {activeDemo
                        ? locale === "vi"
                          ? "Tiếp tục bài thi Reading"
                          : "Continue Reading Mock"
                        : locale === "vi"
                          ? "Bắt đầu thi Reading"
                          : "Start Reading Mock"}
                    </Link>
                  </>
                ) : card.readiness.ready ? (
                  <form action={startMock.bind(null, card.mode)}>
                    <button className="min-h-12 w-full rounded-xl bg-teal-700 px-5 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2">
                      {t.start} {card.title}
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="font-black text-amber-800">{t.soon}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {t.unavailable}
                    </p>
                    <button
                      className="mt-4 min-h-12 w-full cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3 font-black text-slate-600"
                      disabled
                    >
                      {t.soon}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </section>
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-black">{t.conditions}</h2>
          <ul className="mt-4 grid gap-3 text-slate-700 sm:grid-cols-2">
            {t.rules.map((rule) => (
              <li className="flex gap-3" key={rule}>
                <span aria-hidden="true" className="font-black text-teal-700">
                  ✓
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </section>
        {history.some(Boolean) ? (
          <section className="mt-8">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-2xl font-black">{t.history}</h2>
              {capabilities.canUseAdvancedMockHistory ? (
                <Link
                  className="font-bold text-teal-700"
                  href="/full-mock/history"
                >
                  Xem phân tích lịch sử
                </Link>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3">
              {history.flatMap((item) =>
                item
                  ? [
                      <Link
                        className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-teal-300"
                        href={`/full-mock/${item.id}/results`}
                        key={item.id}
                      >
                        <strong>
                          {item.mode === "FULL"
                            ? "Full Mock"
                            : `${item.mode[0]}${item.mode.slice(1).toLowerCase()} Mock`}
                        </strong>{" "}
                        ·{" "}
                        {new Date(item.completedAt).toLocaleDateString(
                          locale === "vi" ? "vi-VN" : "en-US",
                        )}{" "}
                        · {item.overall.correct}/{item.overall.attempted}
                      </Link>,
                    ]
                  : [],
              )}
            </div>
          </section>
        ) : null}
        {!capabilities.canUseAdvancedMockHistory &&
        preview.visible &&
        preview.mock.hasComparableHistory ? (
          <div className="mt-8">
            <PremiumPreviewCard
              locale={preferences.interfaceLanguage}
              title={
                locale === "vi"
                  ? `Bạn đã hoàn thành ${preview.mock.completedCount} bài Mock`
                  : `You completed ${preview.mock.completedCount} mocks`
              }
              body={
                locale === "vi"
                  ? "Premium mở so sánh các lần thi cùng mode, xu hướng kết quả và breakdown Part theo thời gian."
                  : "Premium unlocks same-mode comparisons, result trends, and Part breakdowns over time."
              }
              values={["mockHistory"]}
              cta={
                locale === "vi" ? "Mở khóa Mock History" : "Unlock Mock History"
              }
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
