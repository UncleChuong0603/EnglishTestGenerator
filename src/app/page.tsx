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

export const metadata: Metadata = { alternates: { canonical: "/" } };
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
    eyebrow: "TOEIC GYM · Luyện đúng cách, tiến bộ mỗi ngày",
    title: "Luyện TOEIC không chỉ là làm thêm câu hỏi.",
    body: "Bắt đầu bằng 10 câu Part 5 miễn phí, xem lời giải, rồi chọn phần nghe hoặc đọc cần luyện tiếp theo nhịp của bạn.",
    primary: "Thử 10 câu miễn phí",
    secondary: "Khám phá TOEIC GYM",
    reassurance: "Không cần tài khoản · Có kết quả và lời giải ngay",
    publishedQuestions: "câu hỏi đã xuất bản",
    bankKicker: "Nền tảng của mọi buổi luyện",
    bankTitle: "Từ Part 1 đến Part 7, luôn có cách bắt đầu phù hợp.",
    bankBody: "Kho câu hỏi được tổ chức theo cấu trúc TOEIC. Bạn có thể luyện một phần cụ thể, thử sức với Listening và Reading, rồi quay lại nội dung mình còn yếu.",
    featuresKicker: "Không chỉ là làm bài",
    featuresTitle: "Mỗi buổi học đều giúp bạn đi xa hơn.",
    featuresBody: "Chọn bài vừa sức, hiểu đáp án và giữ lại kiến thức để lần luyện tiếp theo hiệu quả hơn.",
    features: [
      { title: "Tự chọn bài luyện", body: "Chọn Part 5–7, kỹ năng, nội dung trọng tâm và độ dài bài Reading theo thời gian bạn có.", tag: "Luyện theo ý bạn" },
      { title: "Hiểu vì sao mình sai", body: "Xem đáp án và lời giải bằng tiếng Việt, tiếng Anh hoặc cả hai sau khi hoàn thành bài.", tag: "Lời giải rõ ràng" },
      { title: "Được gợi ý bài tiếp theo", body: "Kết quả theo Part và lịch sử luyện tập giúp bạn biết phần nào nên dành thêm thời gian.", tag: "Luyện có hướng đi" },
      { title: "Nhớ từ vựng lâu hơn", body: "Lưu từ trong câu hỏi, học theo chủ đề và ôn lại các từ đến hạn ngay trong TOEIC GYM.", tag: "Từ vựng & ôn tập" },
      { title: "Giữ nhịp với mục tiêu tuần", body: "Đặt mục tiêu, xem tiến độ và chia hành trình luyện tập thành từng tuần dễ theo dõi.", tag: "Lộ trình của bạn" },
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
      ["03", "Luyện tiếp có mục tiêu", "Theo gợi ý bài tiếp theo, ôn lỗi sai hoặc làm một thử thách ngắn khác."],
    ],
    closing: "Bắt đầu từ 10 câu. Khám phá cả kho luyện tập.",
    closingBody: "Thử miễn phí mà không cần tài khoản. Tạo tài khoản khi bạn muốn lưu kết quả và tiếp tục theo mục tiêu của mình.",
  },
  en: {
    eyebrow: "TOEIC GYM · Practice with purpose",
    title: "TOEIC practice is more than answering questions.",
    body: "Start with ten free Part 5 questions, read the explanations, then choose a Listening or Reading topic to practice next.",
    primary: "Try 10 questions free",
    secondary: "Explore TOEIC GYM",
    reassurance: "No account needed · Instant results and explanations",
    publishedQuestions: "published questions",
    bankKicker: "The foundation of every session",
    bankTitle: "From Part 1 to Part 7, find your place to start.",
    bankBody: "Questions are organized around the TOEIC format. Focus on a Part, practice Listening and Reading, and return to the areas that need work.",
    featuresKicker: "More than answering questions",
    featuresTitle: "Make every session move you forward.",
    featuresBody: "Choose a focused workout, understand your answers and keep what you learn for the next session.",
    features: [
      { title: "Build your own practice", body: "Choose Reading Parts 5–7, a skill, a focus area and a session length that fits your day.", tag: "Your choice" },
      { title: "Understand each mistake", body: "Review answers and explanations in English, Vietnamese or both after you finish.", tag: "Clear explanations" },
      { title: "Know what to do next", body: "Part-level results and your practice history show where to spend more time.", tag: "Guided practice" },
      { title: "Remember more vocabulary", body: "Save words from questions, study by topic and review words when they are due.", tag: "Vocabulary & review" },
      { title: "Keep pace with a weekly goal", body: "Set a target, see your progress and follow your learning journey week by week.", tag: "Your learning path" },
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
      ["03", "Practice with purpose", "Follow a recommendation, revisit mistakes or try another short challenge."],
    ],
    closing: "Start with 10 questions. Explore the whole gym.",
    closingBody: "Try it free without an account. Sign up when you want to save your results and keep working toward your goal.",
  },
} as const;

export default async function Home() {
  const [user, bankStats] = await Promise.all([
    getCurrentUser(),
    getPublishedQuestionBankStats().catch(() => null),
  ]);
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  const copy = content[vi ? "vi" : "en"];
  const primary = user ? "/dashboard" : "/challenge/part-5";
  const siteUrl = getSiteUrl();
  const websiteStructuredData = { "@context": "https://schema.org", "@type": "WebSite", name: "TOEIC GYM", alternateName: "TOEICGym", url: siteUrl };

  return (
    <main className="marketing-page min-h-screen overflow-x-hidden">
      <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(websiteStructuredData) }} type="application/ld+json" />
      <PublicHeader locale={locale} signedIn={Boolean(user)} />
      <section className="marketing-hero" aria-labelledby="home-title">
        <div className="marketing-hero-copy">
          <p className="section-kicker">{copy.eyebrow}</p>
          <h1 id="home-title">{copy.title}</h1>
          <p className="marketing-lead">{copy.body}</p>
          {bankStats && bankStats.total > 0 ? <p className="marketing-bank-total"><strong>{bankStats.total.toLocaleString(vi ? "vi-VN" : "en-US")}</strong><span>{copy.publishedQuestions}</span></p> : null}
          <div className="marketing-actions">
            <Link className="button-primary" href={primary}>{user ? (vi ? "Tiếp tục học" : "Continue learning") : copy.primary}<span aria-hidden="true">↗</span></Link>
            <Link className="button-text" href="#explore">{copy.secondary} <span aria-hidden="true">→</span></Link>
          </div>
          {!user && <p className="marketing-reassurance">{copy.reassurance}</p>}
        </div>
        <div className="marketing-hero-visual">
          <div className="gym-preview">
            <div className="gym-preview-top"><span className="bank-preview-mark">TG</span><span>TOEIC GYM / {vi ? "KHÔNG GIAN HỌC" : "YOUR LEARNING SPACE"}</span><span className="gym-preview-live">● {vi ? "SẴN SÀNG" : "READY"}</span></div>
            <div className="gym-preview-body">
              <p className="section-kicker">{vi ? "Mỗi ngày một bước tiến" : "A better session, every day"}</p>
              <h2>{vi ? "Hôm nay bạn muốn luyện gì?" : "What will you practice today?"}</h2>
              <div className="gym-preview-main">
                <div className="gym-preview-diagnostic"><span className="gym-preview-icon" aria-hidden="true">◎</span><small>{vi ? "BẮT ĐẦU TỪ ĐÂU?" : "WHERE TO START?"}</small><strong>{vi ? "Đánh giá điểm xuất phát" : "Find your starting point"}</strong><p>{vi ? "Xem kết quả theo Part và biết nên luyện gì tiếp." : "See results by Part and discover your next step."}</p><Link href="/diagnostic">{vi ? "Khám phá bài đánh giá" : "Explore the diagnostic"} <span aria-hidden="true">↗</span></Link></div>
                <div className="gym-preview-stack"><div><span aria-hidden="true">♫</span><strong>{vi ? "Luyện nghe" : "Listening"}</strong><small>Part 1–4</small></div><div><span aria-hidden="true">▤</span><strong>{vi ? "Luyện đọc" : "Reading"}</strong><small>Part 5–7</small></div><div><span aria-hidden="true">◷</span><strong>{vi ? "Thử thách" : "Challenge"}</strong><small>Part 5</small></div></div>
              </div>
              <div className="gym-preview-footer"><span aria-hidden="true">↗</span><p><strong>{vi ? "Làm bài → hiểu lỗi sai → luyện tiếp" : "Practice → understand → improve"}</strong><small>{vi ? "Một hành trình học nối liền từng buổi luyện." : "Every session points to what comes next."}</small></p></div>
            </div>
          </div>
          <span className="marketing-visual-caption">{vi ? "Minh họa các tính năng trong TOEIC GYM" : "TOEIC GYM feature illustration"}</span>
        </div>
      </section>

      <section className="marketing-explore" id="explore" aria-labelledby="explore-title">
        <div className="marketing-explore-heading"><div><p className="section-kicker">{vi ? "Một phòng tập, nhiều cách tiến bộ" : "Explore your gym"}</p><h2 id="explore-title">{vi ? "Chọn điều bạn cần ngay hôm nay." : "Choose what you need today."}</h2></div><p>{vi ? "Dù chỉ có vài phút hay muốn ôn một chủ điểm, hãy chọn điểm bắt đầu phù hợp." : "Whether you have a few minutes or want to review a topic, choose a useful place to start."}</p></div>
        <div className="marketing-explore-grid">
          {[
            { href: "/diagnostic", icon: "◎", label: vi ? "TÌM ĐIỂM XUẤT PHÁT" : "FIND YOUR STARTING POINT", title: vi ? "Đánh giá đầu vào" : "Diagnostic", body: vi ? "Một bài đánh giá Listening và Reading để thấy Part nào cần ưu tiên." : "See which Listening and Reading Parts deserve your attention.", tone: "mint" },
            { href: "/listening-lessons", icon: "♫", label: vi ? "NGHE VÀ NÓI THEO" : "LISTEN AND SHADOW", title: vi ? "Luyện nghe có transcript" : "Listening with transcripts", body: vi ? "Nghe các câu chuyện ngắn, theo dõi từng câu và luyện nói theo." : "Follow short talks line by line and practice speaking along.", tone: "peach" },
            { href: "/challenge/part-5", icon: "◷", label: vi ? "LÀM BÀI NGAY" : "PRACTICE NOW", title: vi ? "Thử thách Part 5" : "Part 5 challenge", body: vi ? "Làm 10 câu miễn phí, không cần đăng nhập; xem lời giải sau khi nộp." : "Answer ten free questions without an account, then read the explanations.", tone: "lavender" },
            { href: "/mistakes", icon: "↺", label: vi ? "HỌC TỪ MỖI LỖI SAI" : "LEARN FROM MISTAKES", title: vi ? "Ôn tập thông minh" : "Smart review", body: vi ? "Quay lại câu đã sai, làm lại và theo dõi những gì mình đã nắm chắc." : "Retry missed questions and keep track of what you have mastered.", tone: "yellow" },
          ].map((item) => <Link className={`marketing-explore-card ${item.tone}`} href={item.href} key={item.href}><span className="marketing-explore-icon" aria-hidden="true">{item.icon}</span><span className="marketing-explore-label">{item.label}</span><h3>{item.title}</h3><p>{item.body}</p><span className="marketing-explore-arrow" aria-hidden="true">↗</span></Link>)}
        </div>
        <div className="marketing-explore-more"><span>{vi ? "Còn có" : "Also inside"}</span><Link href="/vocabulary">{vi ? "Từ vựng" : "Vocabulary"} ↗</Link><Link href="/progress">{vi ? "Theo dõi tiến độ" : "Track progress"} ↗</Link><Link href="/ranking">{vi ? "Thử thách & bảng xếp hạng" : "Challenges & rankings"} ↗</Link></div>
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
        <div className="marketing-feature-grid">{copy.features.map((feature, index) => <article className="marketing-feature" key={feature.title}><span className="marketing-feature-number">0{index + 1}</span><span className="marketing-feature-tag">{feature.tag}</span><h3>{feature.title}</h3><p>{feature.body}</p><Link aria-label={`${vi ? "Khám phá" : "Explore"} ${feature.title}`} className="marketing-feature-link" href={["/practice", "/try", "/progress", "/vocabulary", "/dashboard", "/ranking"][index]}>{vi ? "Khám phá" : "Explore"} <span aria-hidden="true">↗</span></Link></article>)}</div>
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
            { href: "/challenge/part-5", title: vi ? "Thử thách Part 5" : "Part 5 challenge", detail: vi ? "Làm 10 câu miễn phí, xem kết quả và lời giải." : "Try ten free questions with results and explanations." },
            { href: "/toeic/part-5", title: "Part 5", detail: vi ? "Hoàn thành câu: ngữ pháp và từ vựng." : "Sentence completion, grammar and vocabulary." },
            { href: "/toeic/part-5/thi-dong-tu", title: vi ? "Thì động từ Part 5" : "Part 5 verb tenses", detail: vi ? "Làm 3 câu có giải thích đáp án." : "Try three questions with explanations." },
            { href: "/toeic/part-5/word-form", title: "Word Form", detail: vi ? "Làm thử 3 câu có giải thích đáp án." : "Try three questions with explanations." },
            { href: "/toeic/part-6", title: "Part 6", detail: vi ? "Điền từ và câu theo mạch đoạn văn." : "Complete a text using its context." },
            { href: "/toeic/part-7", title: "Part 7", detail: vi ? "Tìm bằng chứng trong bài đọc." : "Find evidence in reading passages." },
            { href: "/blog", title: vi ? "Bài hướng dẫn TOEIC" : "TOEIC guides", detail: vi ? "Đọc cách sửa lỗi và chọn chủ điểm cần ôn." : "Review common errors and choose a topic to study." },
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
