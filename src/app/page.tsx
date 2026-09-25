import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { PricingSection } from "@/components/pricing-section";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getPaymentCatalog } from "@/lib/payments/catalog";
import { getPublishedQuestionBankStats } from "@/lib/questions/stats";
import { getSiteUrl } from "@/lib/seo/site-url";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export const metadata: Metadata = { alternates: { canonical: `${getSiteUrl()}/` } };
export const dynamic = "force-dynamic";

const parts = [
  { number: "01", vi: "Hình ảnh", en: "Photographs" },
  { number: "02", vi: "Hỏi đáp", en: "Question response" },
  { number: "03", vi: "Hội thoại", en: "Conversations" },
  { number: "04", vi: "Bài nói", en: "Talks" },
  { number: "05", vi: "Hoàn thành câu", en: "Sentence completion" },
  { number: "06", vi: "Hoàn thành đoạn", en: "Text completion" },
  { number: "07", vi: "Đọc hiểu", en: "Reading comprehension" },
] as const;

const content = {
  vi: {
    eyebrow: "Question bank · TOEIC GYM",
    title: "Kho câu hỏi TOEIC, biến thành bài luyện dành cho bạn.",
    body: "Luyện Listening và Reading từ Part 1 đến Part 7. Chọn đúng dạng bài, hiểu từng lỗi sai và để kết quả của bạn dẫn lối cho buổi học tiếp theo.",
    primary: "Thử 10 câu miễn phí",
    secondary: "Khám phá cách luyện",
    reassurance: "Không cần tài khoản · Có kết quả và lời giải ngay",
    previewLabel: "Bên trong TOEIC GYM",
    previewTitle: "Bắt đầu từ kho câu hỏi",
    previewBody: "Chọn một Part hoặc để TOEIC GYM gợi ý từ kết quả của bạn.",
    publishedQuestions: "câu hỏi đã xuất bản",
    questions: "câu",
    previewFocus: "Chọn trọng tâm",
    previewFocusValue: "Part · Kỹ năng · Số câu",
    previewNext: "Sau khi làm bài",
    previewNextValue: "Lời giải · Lỗi sai · Bài tiếp theo",
    bankKicker: "Nền tảng của mọi buổi luyện",
    bankTitle: "Từ Part 1 đến Part 7, luôn có cách bắt đầu phù hợp.",
    bankBody: "Kho câu hỏi được tổ chức theo cấu trúc TOEIC. Bạn có thể luyện một phần cụ thể, thử sức với Listening và Reading, rồi quay lại nội dung mình còn yếu.",
    featuresKicker: "Không chỉ là làm bài",
    featuresTitle: "Một kho câu hỏi, nhiều cách học thú vị.",
    featuresBody: "TOEIC GYM biến mỗi lần trả lời thành một cơ hội để hiểu rõ hơn và luyện tiếp có mục đích.",
    features: [
      { title: "Tự chọn bài luyện", body: "Chọn Part 5–7, kỹ năng, nội dung trọng tâm và độ dài bài Reading theo thời gian bạn có.", tag: "Luyện theo ý bạn" },
      { title: "Hiểu vì sao mình sai", body: "Xem đáp án và lời giải bằng tiếng Việt, tiếng Anh hoặc cả hai sau khi hoàn thành bài.", tag: "Lời giải rõ ràng" },
      { title: "Được gợi ý bài tiếp theo", body: "Kết quả theo Part và lịch sử luyện tập giúp bạn biết phần nào nên dành thêm thời gian.", tag: "Luyện có hướng đi" },
      { title: "Quay lại lỗi sai", body: "Ôn những câu chưa nắm chắc, làm lại và theo dõi phần kiến thức mình đang tiến bộ.", tag: "Ôn tập thông minh" },
      { title: "Thử sức như khi thi", body: "Luyện bài thi thử Listening, Reading hoặc toàn bộ đề với đồng hồ và kết quả sau khi nộp.", tag: "Thi thử có giờ" },
      { title: "Thêm động lực mỗi ngày", body: "Tham gia thử thách, xem bảng xếp hạng và theo dõi chặng đường đến mục tiêu của bạn.", tag: "Thử thách & tiến độ" },
    ],
    exampleKicker: "Kết quả dẫn đến hành động",
    example: "Làm xong không phải là kết thúc.",
    exampleBody: "Xem mình đang làm tốt ở đâu, cần cải thiện Part nào và nên luyện gì tiếp theo. Bảng bên cạnh chỉ là ví dụ minh họa.",
    sample: "Ví dụ minh họa",
    focus: "Nên tập trung",
    next: "Bài tiếp theo",
    nextValue: "Part 3 · Hội thoại ngắn",
    methodKicker: "Cách TOEIC GYM đồng hành",
    method: "Một vòng học, rõ từng bước.",
    methodBody: "Bạn có thể bắt đầu với bài thử ngắn, rồi dùng kết quả để xây dựng nhịp luyện tập của riêng mình.",
    steps: [
      ["01", "Chọn bài và bắt đầu", "Thử thách Part 5 miễn phí, làm bài đánh giá đầu vào hoặc tự chọn bài luyện."],
      ["02", "Hiểu câu trả lời", "Xem lời giải, transcript khi luyện nghe và kết quả theo từng Part."],
      ["03", "Luyện tiếp có mục tiêu", "Theo gợi ý bài tiếp theo, ôn lỗi sai hoặc thử sức với bài thi thử."],
    ],
    closing: "Bắt đầu từ 10 câu. Khám phá cả kho luyện tập.",
    closingBody: "Thử miễn phí mà không cần tài khoản. Tạo tài khoản khi bạn muốn lưu kết quả và tiếp tục theo mục tiêu của mình.",
  },
  en: {
    eyebrow: "Question bank · TOEIC GYM",
    title: "A TOEIC question bank that becomes your practice plan.",
    body: "Practice Listening and Reading across Parts 1–7. Choose the right question type, understand your mistakes, and let your results guide what you study next.",
    primary: "Try 10 questions free",
    secondary: "Explore how it works",
    reassurance: "No account needed · Instant results and explanations",
    previewLabel: "Inside TOEIC GYM",
    previewTitle: "Start with the question bank",
    previewBody: "Pick a Part or follow a suggestion based on your results.",
    publishedQuestions: "published questions",
    questions: "questions",
    previewFocus: "Choose your focus",
    previewFocusValue: "Part · Skill · Question count",
    previewNext: "After you finish",
    previewNextValue: "Explanations · Mistakes · Next practice",
    bankKicker: "The foundation of every session",
    bankTitle: "From Part 1 to Part 7, find your place to start.",
    bankBody: "Questions are organized around the TOEIC format. Focus on a Part, practice Listening and Reading, and return to the areas that need work.",
    featuresKicker: "More than answering questions",
    featuresTitle: "One question bank. Many ways to learn.",
    featuresBody: "TOEIC GYM turns each answer into a chance to understand more and practice with purpose.",
    features: [
      { title: "Build your own practice", body: "Choose Reading Parts 5–7, a skill, a focus area and a session length that fits your day.", tag: "Your choice" },
      { title: "Understand each mistake", body: "Review answers and explanations in English, Vietnamese or both after you finish.", tag: "Clear explanations" },
      { title: "Know what to do next", body: "Part-level results and your practice history show where to spend more time.", tag: "Guided practice" },
      { title: "Return to missed questions", body: "Review what you have not mastered, try again and track what is improving.", tag: "Smart review" },
      { title: "Practice under test conditions", body: "Try timed Listening, Reading or full mock tests and review results after submitting.", tag: "Timed mocks" },
      { title: "Keep your momentum", body: "Join challenges, view rankings and track your progress toward your goal.", tag: "Challenges & progress" },
    ],
    exampleKicker: "Turn results into action",
    example: "Finishing a session is only the start.",
    exampleBody: "See where you are doing well, which Part needs work and what to practice next. The panel is an illustration.",
    sample: "Illustrative example",
    focus: "Focus area",
    next: "Next practice",
    nextValue: "Part 3 · Short conversations",
    methodKicker: "Your learning loop",
    method: "A clear next step, every time.",
    methodBody: "Start with a short challenge, then use your results to build a practice rhythm that works for you.",
    steps: [
      ["01", "Choose and begin", "Try the free Part 5 challenge, take a diagnostic or build your own session."],
      ["02", "Understand your answers", "Review explanations, listening transcripts and Part-level results."],
      ["03", "Practice with purpose", "Follow a recommendation, revisit mistakes or take a mock test."],
    ],
    closing: "Start with 10 questions. Explore the whole gym.",
    closingBody: "Try it free without an account. Sign up when you want to save your results and keep working toward your goal.",
  },
} as const;

export default async function Home() {
  const [user, bankStats] = await Promise.all([getCurrentUser(), getPublishedQuestionBankStats()]);
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  const copy = content[vi ? "vi" : "en"];
  const primary = user ? "/dashboard" : "/challenge/part-5";
  const siteUrl = getSiteUrl();
  const websiteStructuredData = { "@context": "https://schema.org", "@type": "WebSite", name: "TOEIC GYM", alternateName: "TOEICGym", url: `${siteUrl}/` };

  return (
    <main className="marketing-page min-h-screen overflow-x-hidden">
      <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(websiteStructuredData) }} type="application/ld+json" />
      <PublicHeader locale={locale} signedIn={Boolean(user)} />
      <section className="marketing-hero" aria-labelledby="home-title">
        <div className="marketing-hero-copy">
          <p className="section-kicker">{copy.eyebrow}</p>
          <h1 id="home-title">{copy.title}</h1>
          <p className="marketing-lead">{copy.body}</p>
          <p className="marketing-bank-total"><strong>{bankStats.total.toLocaleString(vi ? "vi-VN" : "en-US")}</strong><span>{copy.publishedQuestions}</span></p>
          <div className="marketing-actions">
            <Link className="button-primary" href={primary}>{user ? (vi ? "Tiếp tục học" : "Continue learning") : copy.primary}<span aria-hidden="true">↗</span></Link>
            <Link className="button-text" href="#question-bank">{copy.secondary} <span aria-hidden="true">→</span></Link>
          </div>
          {!user && <p className="marketing-reassurance">{copy.reassurance}</p>}
        </div>
        <div className="marketing-hero-visual">
          <div className="bank-preview">
            <div className="bank-preview-top"><span className="bank-preview-mark">TG</span><span>TOEIC GYM / QUESTION BANK</span><span className="bank-preview-dots" aria-hidden="true">● ● ●</span></div>
            <div className="bank-preview-body">
              <p className="section-kicker">{copy.previewLabel}</p>
              <h2>{copy.previewTitle}</h2>
              <p>{copy.previewBody}</p>
              <div className="bank-preview-parts" aria-label={vi ? "Các phần luyện tập TOEIC" : "TOEIC practice parts"}>
                {parts.map((part) => <div className="bank-preview-part" key={part.number}><span>PART {part.number}</span><strong>{vi ? part.vi : part.en}</strong><small>{(bankStats.byPart[Number(part.number)] ?? 0).toLocaleString(vi ? "vi-VN" : "en-US")} {copy.questions}</small></div>)}
              </div>
              <div className="bank-preview-outcome"><div><span>{copy.previewFocus}</span><strong>{copy.previewFocusValue}</strong></div><div><span>{copy.previewNext}</span><strong>{copy.previewNextValue}</strong></div></div>
            </div>
          </div>
          <span className="marketing-visual-caption">{vi ? "Minh họa cách tổ chức bài luyện" : "Practice layout illustration"}</span>
        </div>
      </section>

      <section className="marketing-bank" id="question-bank" aria-labelledby="bank-title">
        <div className="marketing-bank-intro"><p className="section-kicker">{copy.bankKicker}</p><h2 id="bank-title">{copy.bankTitle}</h2><p>{copy.bankBody}</p></div>
        <div className="marketing-bank-groups">
          <div><span>Listening</span><div>{parts.slice(0, 4).map((part) => <span key={part.number}>P{Number(part.number)}</span>)}</div></div>
          <div><span>Reading</span><div>{parts.slice(4).map((part) => <span key={part.number}>P{Number(part.number)}</span>)}</div></div>
        </div>
      </section>

      <section className="marketing-features" id="features" aria-labelledby="features-title">
        <div className="marketing-features-heading"><div><p className="section-kicker">{copy.featuresKicker}</p><h2 id="features-title">{copy.featuresTitle}</h2></div><p>{copy.featuresBody}</p></div>
        <div className="marketing-feature-grid">{copy.features.map((feature, index) => <article className="marketing-feature" key={feature.title}><span className="marketing-feature-number">0{index + 1}</span><span className="marketing-feature-tag">{feature.tag}</span><h3>{feature.title}</h3><p>{feature.body}</p></article>)}</div>
      </section>

      <section className="marketing-example" aria-labelledby="example-title">
        <div className="marketing-section-intro"><p className="section-kicker">{copy.exampleKicker}</p><h2 id="example-title">{copy.example}</h2><p>{copy.exampleBody}</p></div>
        <ProductPreview copy={copy} />
      </section>
      <section className="marketing-method" id="how-it-works" aria-labelledby="method-title">
        <div className="marketing-section-intro"><p className="section-kicker">{copy.methodKicker}</p><h2 id="method-title">{copy.method}</h2><p>{copy.methodBody}</p></div>
        <ol className="method-steps">{copy.steps.map(([number, title, detail]) => <li key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{detail}</p></li>)}</ol>
      </section>
      <PricingSection compact locale={locale} products={getPaymentCatalog()} startHref={primary} />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6" aria-labelledby="learn-toeic-title">
        <p className="section-kicker">{vi ? "Bắt đầu từ kiến thức nền" : "Start with the fundamentals"}</p>
        <h2 className="mt-3 text-3xl font-black text-slate-900" id="learn-toeic-title">{vi ? "Chọn một chủ đề TOEIC để học ngay" : "Choose a TOEIC topic to study"}</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/toeic", title: vi ? "Tổng quan TOEIC" : "TOEIC overview", detail: vi ? "Hiểu từng Part và chọn điểm bắt đầu." : "Understand each Part and where to start." },
            { href: "/toeic/part-5", title: "Part 5", detail: vi ? "Hoàn thành câu: ngữ pháp và từ vựng." : "Sentence completion, grammar and vocabulary." },
            { href: "/toeic/part-5/word-form", title: "Word Form", detail: vi ? "Làm thử 5 câu có giải thích đáp án." : "Try five questions with explanations." },
            { href: "/toeic/part-6", title: "Part 6", detail: vi ? "Điền từ và câu theo mạch đoạn văn." : "Complete a text using its context." },
            { href: "/toeic/part-7", title: "Part 7", detail: vi ? "Tìm bằng chứng trong bài đọc." : "Find evidence in reading passages." },
            { href: "/luyen-thi-toeic-online", title: vi ? "Luyện TOEIC online" : "Online TOEIC practice", detail: vi ? "Lập một buổi luyện ngắn, có mục tiêu." : "Plan a focused practice session." },
          ].map((item) => <Link className="rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm transition hover:border-teal-700" href={item.href} key={item.href}><h3 className="text-lg font-black">{item.title} <span aria-hidden="true">→</span></h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p></Link>)}
        </div>
      </section>
      <section className="marketing-closing"><div><p className="section-kicker">{vi ? "Bắt đầu ngay" : "Get started"}</p><h2>{copy.closing}</h2><p>{copy.closingBody}</p></div><Link className="button-primary" href={primary}>{user ? (vi ? "Tiếp tục học" : "Continue learning") : copy.primary}<span aria-hidden="true">↗</span></Link></section>
      <PublicFooter locale={locale} />
    </main>
  );
}

function ProductPreview({ copy }: { copy: { sample: string; focus: string; next: string; nextValue: string } }) {
  return <div className="result-sheet">
    <div className="result-sheet-header"><span>TOEIC GYM / DIAGNOSTIC</span><span>{copy.sample}</span></div>
    <div className="result-sheet-grid"><Score label="Listening" items={[["Part 2", 78], ["Part 3", 58]]} /><Score label="Reading" items={[["Part 5", 82], ["Part 7", 61]]} /></div>
    <div className="result-sheet-next"><div><span>{copy.focus}</span><strong>Part 3 · Part 7</strong></div><div><span>{copy.next}</span><strong>{copy.nextValue}</strong></div></div>
  </div>;
}

function Score({ label, items }: { label: string; items: (readonly [string, number])[] }) {
  return <div className="result-score"><h3>{label}</h3>{items.map(([name, value]) => <div className="result-score-row" key={name}><div><span>{name}</span><strong>{value}%</strong></div><div className="result-bar"><span style={{ width: `${value}%` }} /></div></div>)}</div>;
}
