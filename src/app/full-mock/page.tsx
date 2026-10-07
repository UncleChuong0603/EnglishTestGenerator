import type { Metadata } from "next";
import Link from "next/link";
import { LearnerNav } from "@/components/learner-nav";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getActiveMock,
  getFullMockHistory,
  getMockHubReadiness,
} from "@/lib/full-mock/service";
import {
  FULL_MOCK_BANK_FORMS,
  FULL_MOCK_BANK_QUESTIONS,
  type MockMode,
} from "@/lib/full-mock/blueprint";
import { getCookieLanguage, getPreferences } from "@/lib/i18n/get-translations";
import { startMock } from "./actions";
import { getActiveDemoTest } from "@/lib/demo-test/queries";
import { getEffectiveCapabilities } from "@/lib/entitlements/service";
import {
  PremiumPreviewCard,
  PremiumRenewalCard,
} from "@/components/premium/premium-preview";
import { getPremiumPreview } from "@/lib/premium/preview";
import {
  getActiveShortMock,
  getShortMockReadiness,
} from "@/lib/short-mock/service";
import { ShortMockPicker } from "./short-mock-picker";
import { MockStartButton } from "./mock-start-button";
import styles from "./full-mock.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCookieLanguage();
  return {
    title: locale === "vi" ? "Kho đề thi thử TOEIC" : "TOEIC Mock Test Bank",
    robots: { index: false, follow: false },
  };
}

const copy = {
  vi: {
    eyebrow: "Ngân hàng đề TOEIC",
    title: "Thi thử không lo hết đề",
    intro:
      "Từ bài kiểm tra nhanh 12 phút đến đề đủ 200 câu. Chọn đúng nhịp luyện hôm nay, làm bài và xem lại từng phần sau khi nộp.",
    explore: "Khám phá kho đề",
    resume: "Tiếp tục bài đang làm",
    stats: ["đề thi đầy đủ", "câu hỏi trong ngân hàng", "Part Listening & Reading"],
    nav: ["Đề thi đầy đủ", "Luyện theo Part", "Đề thi ngắn"],
    fullEyebrow: "Thi như ngày thi thật",
    fullTitle: "Kho đề thi đầy đủ",
    fullIntro:
      "25 bộ đề riêng biệt được luân phiên tự động, đúng cấu trúc 200 câu và đủ 7 Part.",
    fullCardTitle: "Full Mock · Listening & Reading",
    fullCardBody:
      "Làm trọn bài trong 120 phút. Đồng hồ chạy liên tục, đáp án được giữ kín đến khi bạn hoàn thành.",
    fullSequence: "Lộ trình 25 đề",
    fullSequenceHint: "Mỗi lần bắt đầu, hệ thống chuyển sang đề kế tiếp.",
    currentForm: "Đề đang làm",
    ready: "Sẵn sàng",
    active: "Đang làm",
    soon: "Đang bổ sung",
    unavailable:
      "Chế độ này cần thêm nội dung đã được kiểm tra trước khi có thể bắt đầu.",
    startFull: "Bắt đầu Full Mock",
    resumeFull: "Tiếp tục Full Mock",
    building: "Đang tạo đề…",
    sectionModes: "Chưa có 120 phút?",
    sectionModesIntro: "Thi riêng một kỹ năng, vẫn giữ đúng số câu và thời gian chuẩn.",
    partEyebrow: "7 Part · 7 trọng tâm",
    partTitle: "Luyện riêng phần bạn muốn cải thiện",
    partIntro:
      "Đi thẳng vào từng dạng câu hỏi trước khi ghép lại thành một bài thi hoàn chỉnh.",
    practicePart: "Luyện Part",
    shortEyebrow: "12 phút tập trung",
    shortTitle: "Đề thi thử ngắn",
    shortIntro:
      "20 câu Part 5 theo ba mức độ — đủ ngắn để bắt đầu ngay, đủ rõ để biết mình cần ôn gì tiếp theo.",
    conditions: "Một bài thi thử diễn ra thế nào?",
    conditionsIntro:
      "Mô phỏng áp lực thời gian nhưng vẫn giữ mục tiêu học tập rõ ràng sau khi nộp bài.",
    rules: [
      ["120 phút liền mạch", "Listening 45 phút, sau đó Reading 75 phút."],
      ["Không lộ đáp án", "Kết quả và lời giải chỉ mở sau khi hoàn thành."],
      ["Phân tích theo Part", "Biết phần nào đang mạnh và phần nào cần luyện tiếp."],
      ["Nội dung TOEIC-style", "Bài luyện theo định dạng TOEIC, không phải đề thi chính thức của ETS."],
    ],
    history: "Bài thi gần đây",
    historyIntro: "Mở lại kết quả để xem phần làm tốt và câu cần ôn lại.",
    historyLink: "Xem phân tích lịch sử",
    fullError: "Chưa thể tạo bài thi này. Vui lòng chọn một chế độ khác hoặc thử lại.",
  },
  en: {
    eyebrow: "TOEIC test bank",
    title: "A mock for every study day",
    intro:
      "Go from a focused 12-minute check to a complete 200-question test. Choose today's pace, finish the test, then review every section.",
    explore: "Explore the test bank",
    resume: "Continue active test",
    stats: ["complete mock tests", "questions in the bank", "Listening & Reading Parts"],
    nav: ["Full mock tests", "Practice by Part", "Short tests"],
    fullEyebrow: "Test-day conditions",
    fullTitle: "Complete mock test bank",
    fullIntro:
      "25 distinct forms rotate automatically, each following the full 200-question, seven-Part structure.",
    fullCardTitle: "Full Mock · Listening & Reading",
    fullCardBody:
      "Complete the entire test in 120 minutes. The timer runs continuously and answers stay hidden until you finish.",
    fullSequence: "25-test sequence",
    fullSequenceHint: "Each new attempt advances to the next form.",
    currentForm: "Active test",
    ready: "Ready",
    active: "In progress",
    soon: "More content coming",
    unavailable:
      "This mode needs more reviewed content before it can be started.",
    startFull: "Start Full Mock",
    resumeFull: "Continue Full Mock",
    building: "Building test…",
    sectionModes: "Short on 120 minutes?",
    sectionModesIntro: "Test one skill with the standard question count and time limit.",
    partEyebrow: "7 Parts · 7 focus areas",
    partTitle: "Practice the section you want to improve",
    partIntro:
      "Work directly on each question format before combining them into a complete test.",
    practicePart: "Practice Part",
    shortEyebrow: "12-minute focus",
    shortTitle: "Short mock test",
    shortIntro:
      "20 Part 5 questions at three difficulty levels—short enough to start now and useful enough to reveal what to review next.",
    conditions: "What happens in a mock test?",
    conditionsIntro:
      "Get realistic time pressure with a clear learning outcome after submission.",
    rules: [
      ["120 continuous minutes", "45 minutes of Listening, then 75 minutes of Reading."],
      ["Answers stay hidden", "Results and explanations unlock only after completion."],
      ["Part-by-Part analysis", "See which areas are strong and what to practice next."],
      ["TOEIC-style content", "Practice follows the TOEIC format and is not an official ETS test."],
    ],
    history: "Recent mock tests",
    historyIntro: "Reopen a result to review strengths and questions that need more work.",
    historyLink: "View history analysis",
    fullError: "We couldn't build this test. Choose another mode or try again.",
  },
} as const;

const partCatalog = {
  vi: [
    [1, "Mô tả tranh", "Nhìn tranh, nghe và chọn mô tả đúng", "6 câu", "/practice#listening-practice"],
    [2, "Hỏi & đáp", "Nghe câu hỏi và chọn câu trả lời", "25 câu", "/practice#listening-practice"],
    [3, "Hội thoại ngắn", "Nghe hội thoại và trả lời theo nhóm", "39 câu", "/practice#listening-practice"],
    [4, "Bài nói ngắn", "Nghe bài nói và nắm thông tin chính", "30 câu", "/practice#listening-practice"],
    [5, "Hoàn thành câu", "Ngữ pháp và từ vựng trong câu", "30 câu", "/practice/part-5"],
    [6, "Hoàn thành đoạn văn", "Điền từ và câu vào đoạn văn", "16 câu", "/practice#choose-focus"],
    [7, "Đọc hiểu", "Đọc đơn, đôi và ba văn bản", "54 câu", "/practice#choose-focus"],
  ],
  en: [
    [1, "Photographs", "Choose the statement that matches the image", "6 questions", "/practice#listening-practice"],
    [2, "Question–Response", "Hear a question and choose the response", "25 questions", "/practice#listening-practice"],
    [3, "Conversations", "Listen and answer grouped questions", "39 questions", "/practice#listening-practice"],
    [4, "Talks", "Follow a short talk and find key details", "30 questions", "/practice#listening-practice"],
    [5, "Incomplete Sentences", "Grammar and vocabulary in context", "30 questions", "/practice/part-5"],
    [6, "Text Completion", "Complete gaps in short passages", "16 questions", "/practice#choose-focus"],
    [7, "Reading Comprehension", "Read single and multiple documents", "54 questions", "/practice#choose-focus"],
  ],
} as const;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
      <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="mt-0.5 size-5 shrink-0" fill="none" viewBox="0 0 20 20">
      <path d="m4 10.5 3.5 3.5L16 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function signInFor(path: string) {
  return `/sign-in?next=${encodeURIComponent(path)}`;
}

function SignInToStart({
  featured = false,
  locale,
}: {
  featured?: boolean;
  locale: "vi" | "en";
}) {
  return (
    <Link
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 ${featured ? "w-full focus-visible:outline-white sm:w-auto" : "w-full focus-visible:outline-teal-700"}`}
      href={signInFor("/full-mock")}
    >
      {locale === "vi" ? "Đăng nhập để bắt đầu" : "Sign in to start"}
      <ArrowIcon />
    </Link>
  );
}

type Props = {
  searchParams: Promise<{
    shortError?: string;
    error?: string;
    unavailable?: string;
  }>;
};

export default async function FullMockPage({ searchParams }: Props) {
  const user = await getCurrentUser();
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
    user
      ? Promise.all(
          (["LISTENING", "READING", "FULL"] as MockMode[]).map((mode) =>
            getActiveMock(user.id, mode),
          ),
        )
      : Promise.resolve([null, null, null] as const),
    user ? getFullMockHistory(user.id, 3) : Promise.resolve([]),
    getPreferences(user?.id),
    user ? getActiveDemoTest(user.id) : Promise.resolve(null),
    user ? getEffectiveCapabilities(user.id) : Promise.resolve(null),
    user ? getPremiumPreview() : Promise.resolve(null),
    getShortMockReadiness(),
    user ? getActiveShortMock(user.id) : Promise.resolve(null),
    searchParams,
  ]);
  const locale = preferences.interfaceLanguage === "en" ? "en" : "vi";
  const t = copy[locale];
  const fullActive = actives[2];
  const mockUsage = preview?.usage.FULL_MOCK;
  const quotaReached = Boolean(
    mockUsage?.type === "LIMITED" &&
    mockUsage.limit > 0 &&
    mockUsage.remaining === 0 &&
    (ready.listening.ready || ready.full.ready),
  );
  const bankStats = [
    FULL_MOCK_BANK_FORMS.toLocaleString(locale === "vi" ? "vi-VN" : "en-US"),
    FULL_MOCK_BANK_QUESTIONS.toLocaleString(locale === "vi" ? "vi-VN" : "en-US"),
    "7",
  ];
  const sectionModes = [
    {
      mode: "LISTENING" as const,
      title: "Listening Mock",
      meta: locale === "vi" ? "100 câu · 45 phút · Part 1–4" : "100 questions · 45 minutes · Parts 1–4",
      body: locale === "vi" ? "Rèn nhịp nghe liên tục với đủ bốn dạng bài." : "Build sustained listening pace across all four formats.",
      active: actives[0],
      readiness: ready.listening,
    },
    {
      mode: "READING" as const,
      title: "Reading Mock",
      meta: locale === "vi" ? "100 câu · 75 phút · Part 5–7" : "100 questions · 75 minutes · Parts 5–7",
      body: locale === "vi" ? "Kiểm tra tốc độ xử lý ngữ pháp và đọc hiểu." : "Test your pace across grammar and reading comprehension.",
      active: actives[1],
      readiness: ready.reading,
    },
  ];

  return (
    <main className={`${styles.page} min-h-screen overflow-x-hidden bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 sm:py-7`}>
      <div className="mx-auto max-w-7xl">
        <LearnerNav locale={preferences.interfaceLanguage} />

        <header className="relative mt-6 overflow-hidden rounded-3xl border border-slate-900 bg-slate-900 px-5 py-8 text-white sm:px-8 sm:py-10 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)] lg:gap-12 lg:px-12 lg:py-12">
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
              {t.eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              {t.intro}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                href={fullActive ? `/full-mock/${fullActive.id}` : "#full-tests"}
              >
                {fullActive ? t.resume : t.explore}
                <ArrowIcon />
              </Link>
              {history.some(Boolean) ? (
                <Link
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-600 px-6 py-3 font-bold text-white hover:border-emerald-300 hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  href="#recent-tests"
                >
                  {t.history}
                </Link>
              ) : null}
            </div>
          </div>
          <dl className="relative z-10 mt-9 grid grid-cols-3 border-y border-slate-700 lg:mt-0 lg:self-end">
            {bankStats.map((value, index) => (
              <div className="flex min-w-0 flex-col py-5 pr-3 sm:pr-5" key={t.stats[index]}>
                <dt className="order-2 mt-1 text-xs leading-5 text-slate-300 sm:text-sm">{t.stats[index]}</dt>
                <dd className="text-2xl font-black tabular-nums text-white sm:text-3xl">{value}</dd>
              </div>
            ))}
          </dl>
          <div aria-hidden="true" className="absolute -right-16 -top-20 size-72 rounded-full border border-emerald-300/15" />
          <div aria-hidden="true" className="absolute -bottom-40 right-24 size-72 rounded-full border border-emerald-300/10" />
        </header>

        <nav aria-label={locale === "vi" ? "Các loại đề" : "Test categories"} className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:flex sm:gap-3">
          {["#full-tests", "#part-practice", "#short-mock"].map((href, index) => (
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-black leading-4 text-slate-700 hover:bg-slate-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:px-5 sm:text-sm"
              href={href}
              key={href}
            >
              {t.nav[index]}
            </Link>
          ))}
        </nav>

        {query.error === "usage_limit" || query.unavailable ? (
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950" role="alert">
            {query.error === "usage_limit"
              ? locale === "vi"
                ? "Bạn đã dùng hết lượt thi thử trong kỳ này. Hạn mức và lựa chọn nâng cấp nằm ngay bên dưới."
                : "You have used all mock attempts for this period. Your allowance and upgrade options appear below."
              : t.fullError}
          </div>
        ) : null}

        {quotaReached && preview?.visible && mockUsage?.type === "LIMITED" ? (
          <div className="mt-6">
            <PremiumPreviewCard
              body={locale === "vi" ? "Premium mở thi thử không giới hạn cho các chế độ đã sẵn sàng." : "Premium unlocks unlimited mock tests for modes that are ready."}
              locale={preferences.interfaceLanguage}
              title={locale === "vi" ? `Bạn đã dùng ${mockUsage.used}/${mockUsage.limit} lượt Mock tháng này` : `You used ${mockUsage.used}/${mockUsage.limit} mocks this month`}
            />
          </div>
        ) : quotaReached && preview?.lifecycle === "EXPIRED" ? (
          <div className="mt-6">
            <PremiumRenewalCard
              body={locale === "vi" ? "Lịch sử thi thử vẫn được giữ nguyên; khôi phục Premium để tiếp tục các chế độ đã sẵn sàng." : "Your mock history is intact; restore Premium to continue modes that are ready."}
              locale={preferences.interfaceLanguage}
              title={locale === "vi" ? "Khôi phục hạn mức thi thử Premium" : "Restore your Premium mock allowance"}
            />
          </div>
        ) : null}

        <section aria-labelledby="full-tests-title" className="scroll-mt-4 pt-14" id="full-tests">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{t.fullEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl" id="full-tests-title">{t.fullTitle}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">{t.fullIntro}</p>
          </div>

          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,.55fr)]">
            <article className="flex min-w-0 flex-col rounded-3xl border border-slate-900 bg-slate-900 p-5 text-white sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-emerald-200">
                  {fullActive ? t.active : ready.full.ready ? t.ready : t.soon}
                </span>
                <span className="text-sm font-bold text-slate-300">200 {locale === "vi" ? "câu" : "questions"} · 120 {locale === "vi" ? "phút" : "minutes"}</span>
              </div>
              <h3 className="mt-6 text-2xl font-black text-white sm:text-3xl">{t.fullCardTitle}</h3>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">{t.fullCardBody}</p>

              <div className="mt-7 border-t border-slate-700 pt-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                  <p className="font-black text-white">{t.fullSequence}</p>
                  <p className="text-sm text-slate-400">{t.fullSequenceHint}</p>
                </div>
                <ol className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5 xl:grid-cols-10">
                  {Array.from({ length: FULL_MOCK_BANK_FORMS }, (_, index) => index + 1).map((formNumber) => {
                    const isActive = fullActive?.formNumber === formNumber;
                    return (
                      <li
                        aria-label={isActive ? `${t.currentForm}: ${formNumber}` : `${locale === "vi" ? "Đề" : "Test"} ${formNumber}`}
                        className={isActive ? "grid min-h-10 place-items-center rounded-lg border border-emerald-300 bg-emerald-300 font-black text-slate-950" : "grid min-h-10 place-items-center rounded-lg border border-slate-700 bg-slate-800 text-sm font-bold tabular-nums text-slate-300"}
                        key={formNumber}
                      >
                        {String(formNumber).padStart(2, "0")}
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="mt-auto pt-7">
                {fullActive ? (
                  <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto" href={`/full-mock/${fullActive.id}`}>
                    {t.resumeFull}<ArrowIcon />
                  </Link>
                ) : ready.full.ready && user ? (
                  <form action={startMock.bind(null, "FULL")}>
                    <MockStartButton featured label={t.startFull} pendingLabel={t.building} />
                  </form>
                ) : ready.full.ready ? (
                  <SignInToStart featured locale={locale} />
                ) : (
                  <div className="rounded-xl border border-amber-300/25 bg-amber-200/10 p-4 text-sm leading-6 text-amber-100">
                    <strong className="block">{t.soon}</strong>
                    {t.unavailable}
                  </div>
                )}
              </div>
            </article>

            <div className="grid gap-4">
              <div className="px-1">
                <h3 className="text-xl font-black">{t.sectionModes}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t.sectionModesIntro}</p>
              </div>
              {sectionModes.map((card) => (
                <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5" key={card.mode}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">{card.mode}</p>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{card.active ? t.active : card.readiness.ready || card.mode === "READING" ? t.ready : t.soon}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-black">{card.title}</h3>
                  <p className="mt-2 text-sm font-bold text-slate-700">{card.meta}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.body}</p>
                  <div className="mt-auto pt-5">
                    {card.active ? (
                      <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`/full-mock/${card.active.id}`}>
                        {t.resume}<ArrowIcon />
                      </Link>
                    ) : !user && (card.mode === "READING" || card.readiness.ready) ? (
                      <SignInToStart locale={locale} />
                    ) : card.mode === "READING" ? (
                      <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={activeDemo ? `/demo-test/${activeDemo.id}` : "/demo-test"}>
                        {locale === "vi" ? "Bắt đầu Reading Mock" : "Start Reading Mock"}<ArrowIcon />
                      </Link>
                    ) : card.readiness.ready ? (
                      <form action={startMock.bind(null, card.mode)}>
                        <MockStartButton label={locale === "vi" ? "Bắt đầu Listening Mock" : "Start Listening Mock"} pendingLabel={t.building} />
                      </form>
                    ) : (
                      <p className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">{t.unavailable}</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="part-practice-title" className="scroll-mt-4 pt-16" id="part-practice">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{t.partEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl" id="part-practice-title">{t.partTitle}</h2>
            <p className="mt-3 leading-7 text-slate-600">{t.partIntro}</p>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {partCatalog[locale].map(([part, name, detail, questions, href]) => (
              <article className={`group flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5 ${part === 7 ? "lg:col-span-2" : ""}`} key={part}>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-4xl font-black tabular-nums text-slate-200">{String(part).padStart(2, "0")}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{questions}</span>
                </div>
                <h3 className="mt-4 text-lg font-black">Part {part} · {name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
                <Link className="mt-auto inline-flex min-h-11 items-center gap-2 pt-4 font-black text-teal-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={user ? href : signInFor(href)}>
                  {t.practicePart} {part}<ArrowIcon />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="short-mock-title" className="scroll-mt-4 mt-16 rounded-3xl border border-slate-200 bg-white p-5 sm:p-8" id="short-mock">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,.55fr)_minmax(0,1.45fr)] lg:gap-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{t.shortEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black" id="short-mock-title">{t.shortTitle}</h2>
              <p className="mt-3 leading-7 text-slate-600">{t.shortIntro}</p>
            </div>
            <div>
              {query.shortError ? (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950" role="alert">
                  {query.shortError === "usage_limit" ? (
                    <>{locale === "vi" ? "Bạn đã dùng hết lượt luyện tập miễn phí trong kỳ này. " : "You have used all free practice sessions for this period. "}<Link className="font-bold underline" href="/pricing">{locale === "vi" ? "Xem bảng giá" : "View pricing"}</Link></>
                  ) : query.shortError === "content_not_ready" ? (
                    locale === "vi" ? "Mức này chưa có đủ 20 câu đã được kiểm tra. Hãy chọn mức khác." : "This level does not yet have 20 reviewed questions. Choose another level."
                  ) : query.shortError === "invalid_level" ? (
                    locale === "vi" ? "Hãy chọn một mức Dễ, Vừa hoặc Khó." : "Choose Easy, Medium, or Hard."
                  ) : locale === "vi" ? "Chưa thể tạo đề ngắn. Vui lòng thử lại." : "Could not build the short mock. Please try again."}
                </div>
              ) : null}
              <ShortMockPicker active={activeShortMock} locale={preferences.interfaceLanguage} readiness={shortReadiness} signedIn={Boolean(user)} />
            </div>
          </div>
        </section>

        <section aria-labelledby="conditions-title" className="mt-16 border-y border-slate-200 py-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-14">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl" id="conditions-title">{t.conditions}</h2>
              <p className="mt-3 leading-7 text-slate-600">{t.conditionsIntro}</p>
            </div>
            <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {t.rules.map(([title, detail]) => (
                <li className="flex gap-3" key={title}>
                  <span className="text-teal-700"><CheckIcon /></span>
                  <span><strong className="block text-slate-900">{title}</strong><span className="mt-1 block text-sm leading-6 text-slate-600">{detail}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {history.some(Boolean) ? (
          <section aria-labelledby="recent-tests-title" className="scroll-mt-4 py-14" id="recent-tests">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black sm:text-3xl" id="recent-tests-title">{t.history}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t.historyIntro}</p>
              </div>
              {capabilities?.canUseAdvancedMockHistory ? (
                <Link className="inline-flex min-h-11 items-center gap-2 font-bold text-teal-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/full-mock/history">{t.historyLink}<ArrowIcon /></Link>
              ) : null}
            </div>
            <div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
              {history.flatMap((item) => item ? [
                <Link className="grid min-h-20 gap-2 p-4 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-6 sm:px-5" href={`/full-mock/${item.id}/results`} key={item.id}>
                  <strong>{item.mode === "FULL" ? "Full Mock" : `${item.mode[0]}${item.mode.slice(1).toLowerCase()} Mock`}</strong>
                  <span className="text-sm text-slate-600">{new Date(item.completedAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}</span>
                  <span className="font-black tabular-nums text-teal-800">{item.overall.correct}/{item.overall.attempted}</span>
                </Link>,
              ] : [])}
            </div>
          </section>
        ) : null}

        {capabilities && preview && !capabilities.canUseAdvancedMockHistory && preview.visible && preview.mock.hasComparableHistory ? (
          <div className="pb-14">
            <PremiumPreviewCard
              body={locale === "vi" ? "Premium mở so sánh các lần thi cùng chế độ, xu hướng kết quả và phân tích Part theo thời gian." : "Premium unlocks same-mode comparisons, result trends, and Part breakdowns over time."}
              cta={locale === "vi" ? "Mở khóa lịch sử Mock" : "Unlock Mock History"}
              locale={preferences.interfaceLanguage}
              title={locale === "vi" ? `Bạn đã hoàn thành ${preview.mock.completedCount} bài Mock` : `You completed ${preview.mock.completedCount} mocks`}
              values={["mockHistory"]}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
