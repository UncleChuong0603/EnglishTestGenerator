import type { Metadata } from "next";
import Link from "next/link";
import { startPart5Challenge } from "@/app/challenge/actions";
import { ChallengeStartButton } from "@/components/challenge-start-button";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { FeatureDirectory } from "@/components/marketing/feature-directory";
import { GuideCarousel } from "@/components/marketing/guide-carousel";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getSiteUrl } from "@/lib/seo/site-url";
import { serializeStructuredData } from "@/lib/seo/structured-data";
import { toeicGymOrganizationStructuredData } from "@/lib/seo/site-structured-data";
import { featureAccessLabel, productFeatures } from "@/lib/marketing/features";
import { listeningTalks } from "@/lib/listening-lessons/talks";
import styles from "./home.module.css";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export const dynamic = "force-dynamic";

const copy = {
  vi: {
    eyebrow: "TOEIC GYM / BẮT ĐẦU MIỄN PHÍ",
    title: "Luyện đề. Nghe transcript. Tập mỗi ngày.",
    lead: "Thử 10 câu Part 5 không cần tài khoản. Học thêm bằng audio có transcript, workout gợi ý mỗi ngày, flashcards và bảng xếp hạng tuần với tài khoản miễn phí.",
    start: "Làm thử 10 câu miễn phí",
    starting: "Đang chuẩn bị bài…",
    continue: "Tiếp tục học",
    how: "Xem các tính năng miễn phí",
    promise: ["Không cần đăng nhập", "Có lời giải sau khi nộp", "Biết phần cần luyện tiếp"],
    sample: "Ví dụ về cách TOEIC GYM giải thích đáp án",
    sampleLabel: "PART 5 / HOÀN THÀNH CÂU",
    samplePrompt: "Please submit the report ___ Friday.",
    sampleAnswer: "Đáp án: by",
    sampleWhy: "“By Friday” diễn tả hạn chót: báo cáo cần được nộp trước hoặc chậm nhất vào thứ Sáu.",
    sampleNext: "Làm bài thật để xem lời giải cho từng câu",
    entryEyebrow: "KHÔNG CHỈ LÀ LÀM ĐỀ",
    entryTitle: "Đổi cách tập. Giữ hứng thú học.",
    entryLead: "Nghe một câu chuyện, làm workout hôm nay hoặc xem thứ hạng tuần. Chọn hoạt động bạn muốn thử ngay bên dưới.",
    loopEyebrow: "CÁC TÍNH NĂNG CỦA TOEIC GYM",
    loopTitle: "Chọn tính năng để bắt đầu.",
    bankEyebrow: "KHO LUYỆN TẬP",
    bankTitle: "Đủ 7 Part. Chọn đúng phần cần tập.",
    bankLead: "Chọn dạng bài để đọc chiến lược và làm câu mẫu miễn phí. Muốn tự chọn số câu cho buổi luyện? Mở mục Luyện riêng từng Part ở trên.",
    listening: "Listening",
    reading: "Reading",
    guideEyebrow: "HỌC THÊM MỘT CHÚT",
    guideTitle: "Bài viết trọng tâm để học TOEIC đúng hướng.",
    guideCarouselLabel: "Bài viết TOEIC nổi bật",
    guideItemLabel: "Bài",
    guidePrevious: "Xem bài viết trước",
    guideNext: "Xem bài viết tiếp theo",
    guideRead: "Đọc bài viết",
    guideAll: "Xem tất cả bài viết TOEIC",
    guideLinks: [
      { category: "BẮT ĐẦU", href: "/toeic", title: "Cấu trúc đề thi TOEIC: 7 Part, 200 câu", description: "Nắm bố cục Listening và Reading, dạng câu hỏi và cách chọn phần cần luyện trước." },
      { category: "LỘ TRÌNH", href: "/blog/chien-luoc-tang-diem-toeic-450-den-700", title: "Từ mục tiêu điểm đến kế hoạch học", description: "Biến mục tiêu TOEIC thành các chặng luyện có thể theo dõi và điều chỉnh." },
      { category: "LISTENING", href: "/blog/cach-luyen-nghe-toeic-part-3-4", title: "Luyện nghe Part 3–4 mà không cần nghe từng từ", description: "Đọc trước câu hỏi, dự đoán bối cảnh, bắt paraphrase và sửa bài bằng transcript." },
      { category: "READING", href: "/blog/quan-ly-thoi-gian-toeic-reading-75-phut", title: "Chia 75 phút Reading để không bỏ dở Part 7", description: "Thiết lập mốc chuyển Part 5–6–7, xử lý câu mắc kẹt và review buổi bấm giờ." },
      { category: "NGỮ PHÁP", href: "/blog/ngu-phap-toeic-part-5-can-hoc", title: "7 chủ điểm ngữ pháp Part 5 cần học trước", description: "Ưu tiên loại từ, động từ, hòa hợp, mệnh đề, liên từ, giới từ và lượng từ." },
      { category: "TỪ VỰNG", href: "/blog/tu-vung-toeic-theo-chu-de-cong-so", title: "Học từ vựng TOEIC theo cụm và ngữ cảnh", description: "Xây vốn từ dùng được ngay trong Listening và Reading thay vì ghi nhớ từ rời rạc." },
    ],
    closing: "Bắt đầu bằng một bài ngắn. Biết mình cần làm gì tiếp.",
    closingBody: "10 câu Part 5, kết quả và lời giải ngay sau khi nộp. Không cần tài khoản.",
  },
  en: {
    eyebrow: "TOEIC GYM / START FREE",
    title: "Practice questions. Follow transcripts. Train daily.",
    lead: "Try 10 Part 5 questions without an account. Add audio with transcripts, suggested daily workouts, flashcards and weekly rankings with a free account.",
    start: "Try 10 questions free",
    starting: "Preparing your questions…",
    continue: "Continue learning",
    how: "See the free features",
    promise: ["No account needed", "Explanations after submission", "A clear next step"],
    sample: "An example of a TOEIC GYM explanation",
    sampleLabel: "PART 5 / SENTENCE COMPLETION",
    samplePrompt: "Please submit the report ___ Friday.",
    sampleAnswer: "Answer: by",
    sampleWhy: "“By Friday” gives a deadline: the report should be submitted no later than Friday.",
    sampleNext: "Take a real set to see each explanation",
    entryEyebrow: "MORE THAN PRACTICE TESTS",
    entryTitle: "Switch up your practice. Keep it interesting.",
    entryLead: "Listen to a story, do today’s workout or check the weekly standings. Choose an activity to try below.",
    loopEyebrow: "TOEIC GYM FEATURES",
    loopTitle: "Choose a feature to start.",
    bankEyebrow: "QUESTION BANK",
    bankTitle: "All 7 Parts. Practice what matters.",
    bankLead: "Choose a task to read strategies and try free sample questions. To configure your own set size, open Practice Parts 1–7 above.",
    listening: "Listening",
    reading: "Reading",
    guideEyebrow: "LEARN A LITTLE MORE",
    guideTitle: "Essential TOEIC guides, selected for your next step.",
    guideCarouselLabel: "Featured TOEIC guides",
    guideItemLabel: "Guide",
    guidePrevious: "View previous guide",
    guideNext: "View next guide",
    guideRead: "Read guide",
    guideAll: "View all TOEIC guides",
    guideLinks: [
      { category: "START HERE", href: "/toeic", title: "TOEIC test format: 7 Parts and 200 questions", description: "Understand the Listening and Reading structure, question types and where to begin practicing." },
      { category: "ROADMAP", href: "/blog/chien-luoc-tang-diem-toeic-450-den-700", title: "Turn a target score into a study plan", description: "Break your TOEIC goal into practice stages you can review, measure and adjust." },
      { category: "LISTENING", href: "/blog/cach-luyen-nghe-toeic-part-3-4", title: "Train for Parts 3–4 without catching every word", description: "Preview questions, predict context, notice paraphrases and review with transcripts." },
      { category: "READING", href: "/blog/quan-ly-thoi-gian-toeic-reading-75-phut", title: "Plan the 75-minute Reading section", description: "Set checkpoints for Parts 5–7, move past stuck questions and review timed sessions." },
      { category: "GRAMMAR", href: "/blog/ngu-phap-toeic-part-5-can-hoc", title: "Seven Part 5 grammar topics to learn first", description: "Prioritize word forms, verbs, agreement, clauses, connectors, prepositions and quantifiers." },
      { category: "VOCABULARY", href: "/blog/tu-vung-toeic-theo-chu-de-cong-so", title: "Learn TOEIC vocabulary in phrases and context", description: "Build vocabulary you can recognize in Listening and Reading instead of memorizing isolated words." },
    ],
    closing: "Start with a short set. Know what comes next.",
    closingBody: "Ten Part 5 questions, with results and explanations after submission. No account needed.",
  },
} as const;

const parts = [
  { number: 1, vi: "Hình ảnh", en: "Photographs" },
  { number: 2, vi: "Hỏi đáp", en: "Question response" },
  { number: 3, vi: "Hội thoại", en: "Conversations" },
  { number: 4, vi: "Bài nói", en: "Talks" },
  { number: 5, vi: "Hoàn thành câu", en: "Sentence completion" },
  { number: 6, vi: "Hoàn thành đoạn", en: "Text completion" },
  { number: 7, vi: "Đọc hiểu", en: "Reading comprehension" },
] as const;

export default async function Home() {
  const user = await getCurrentUser();
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const vi = locale === "vi";
  const t = copy[vi ? "vi" : "en"];
  const featuredTalk = listeningTalks.find(talk => talk.minutes === 1) ?? listeningTalks[0];
  const listeningFeature = productFeatures.find(feature => feature.id === "listening")!;
  const siteUrl = getSiteUrl();
  const websiteStructuredData = { "@context": "https://schema.org", "@graph": [
    { "@type": "WebSite", "@id": `${siteUrl}#website`, name: "TOEIC GYM", alternateName: "TOEICGym", url: siteUrl, publisher: { "@id": `${siteUrl}#organization` } },
    toeicGymOrganizationStructuredData(siteUrl),
  ] };

  return <div className={styles.page}>
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(websiteStructuredData) }} type="application/ld+json" />
    <a className={styles.skipLink} href="#main-content">{vi ? "Bỏ qua điều hướng" : "Skip to content"}</a>
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <main id="main-content" lang={locale}>

    <section aria-labelledby="home-title" className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>{t.eyebrow}</p>
        <h1 id="home-title">{t.title}</h1>
        <p className={styles.lead}>{t.lead}</p>
        <ul className={styles.promise}>{t.promise.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className={styles.actions}>
          {user ? <Link className={styles.primaryAction} href="/dashboard">{t.continue}<span aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge}><ChallengeStartButton className={styles.primaryAction} label={t.start} pendingLabel={t.starting} /></form>}
          <Link className={styles.secondaryAction} href="#features">{t.how} <span aria-hidden="true">↓</span></Link>
        </div>
      </div>
      <div className={styles.heroVisual}>
        <div className={styles.sample}>
          <div className={styles.sampleTop}><span>TOEIC GYM</span><span>{vi ? "MINH HỌA" : "EXAMPLE"}</span></div>
          <div className={styles.sampleBody}>
            <p className={styles.sampleKicker}>{t.sampleLabel}</p>
            <p className={styles.sampleQuestion}>{t.samplePrompt}</p>
            <div className={styles.sampleChoices} aria-label={vi ? "Các lựa chọn minh họa" : "Example choices"}>
              <span>A <strong>at</strong></span><span className={styles.chosen}>B <strong>by</strong></span><span>C <strong>on</strong></span><span>D <strong>for</strong></span>
            </div>
            <div className={styles.explanation}><strong>{t.sampleAnswer}</strong><p>{t.sampleWhy}</p></div>
          </div>
          <div className={styles.sampleFoot}><span>{t.sampleNext}</span>{user ? <Link href="/dashboard">{t.continue} <span aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge}><ChallengeStartButton className={styles.sampleFootAction} label={t.start} pendingLabel={t.starting} /></form>}</div>
        </div>
        <p className={styles.sampleCaption}>{t.sample}</p>
      </div>
    </section>

    <div className={styles.proof} aria-label={vi ? "Điểm mạnh của TOEIC GYM" : "TOEIC GYM highlights"}>
      {[
        { href: "/listening-lessons", label: vi ? "Nghe theo transcript" : "Audio with transcripts", marker: "01" },
        { href: "/dashboard", label: vi ? "Workout hằng ngày" : "Daily workouts", marker: "02" },
        { href: "/ranking", label: vi ? "Bảng xếp hạng tuần" : "Weekly leaderboard", marker: "03" },
        { href: "/vocabulary", label: vi ? "Từ vựng & flashcards" : "Vocabulary & flashcards", marker: "04" },
      ].map(item => <Link href={item.href} key={item.href}><strong>{item.marker}</strong><span>{item.label}</span><span aria-hidden="true">↗</span></Link>)}
    </div>

    <section aria-labelledby="explore-title" className={styles.section} id="explore">
      <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>{t.entryEyebrow}</p><h2 id="explore-title">{t.entryTitle}</h2></div><p>{t.entryLead}</p></div>
      <div className={styles.spotlights}>
        <article className={styles.listeningSpotlight}>
          <p className={styles.eyebrow}>{vi ? "NGHE & NÓI THEO" : "LISTEN & SHADOW"}</p>
          <h3>{listeningFeature[locale].title}</h3>
          <p>{listeningFeature[locale].description}</p>
          <div className={styles.talkPreview}>
            <span>{vi ? "MỘT BÀI NGHE TRONG THƯ VIỆN" : "A TALK FROM THE LIBRARY"} · {featuredTalk.minutes} {vi ? "PHÚT" : "MINUTE"}</span>
            <h4>{vi ? featuredTalk.titleVi : featuredTalk.titleEn}</h4>
            <blockquote lang="en">{featuredTalk.transcript.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ")}</blockquote>
            <Link href={`/listening-lessons/talk/${featuredTalk.slug}`}>{vi ? "Mở bài nghe này" : "Open this talk"} <span aria-hidden="true">↗</span></Link>
          </div>
          <p className={styles.accessNote}>{featureAccessLabel(listeningFeature.access, locale)}</p>
          <Link className={styles.secondaryAction} href={listeningFeature.href}>{listeningFeature[locale].action}<span aria-hidden="true">↗</span></Link>
        </article>
        <div className={styles.habitSpotlights}>{["workout", "ranking"].map(id => {
          const feature = productFeatures.find(item => item.id === id)!;
          return <article key={id}><p className={styles.eyebrow}>{id === "workout" ? (vi ? "HÔM NAY TẬP GÌ?" : "WHAT’S TODAY’S PRACTICE?") : (vi ? "LUYỆN CÙNG CỘNG ĐỒNG" : "PRACTICE WITH OTHERS")}</p><h3>{feature[locale].title}</h3><p>{feature[locale].description}</p><p className={styles.accessNote}>{featureAccessLabel(feature.access, locale)}</p><Link className={styles.secondaryAction} href={feature.href}>{feature[locale].action}<span aria-hidden="true">↗</span></Link></article>;
        })}</div>
      </div>
    </section>

    <section aria-labelledby="features-title" className={styles.directorySection} id="features">
      <div className={styles.section}>
        <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>{t.loopEyebrow}</p><h2 id="features-title">{t.loopTitle}</h2></div></div>
        <FeatureDirectory compact locale={locale} />
      </div>
    </section>

    <section aria-labelledby="bank-title" className={styles.section} id="question-bank">
      <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>{t.bankEyebrow}</p><h2 id="bank-title">{t.bankTitle}</h2></div><p>{t.bankLead}</p></div>
      <div className={styles.partGroups}><div><h3>{t.listening}</h3><div>{parts.slice(0, 4).map((part) => <Link href={`/toeic/part-${part.number}`} key={part.number}><span>0{part.number}</span><strong>Part {part.number}</strong><small>{vi ? part.vi : part.en}</small><span aria-hidden="true">↗</span></Link>)}</div></div><div><h3>{t.reading}</h3><div>{parts.slice(4).map((part) => <Link href={`/toeic/part-${part.number}`} key={part.number}><span>0{part.number}</span><strong>Part {part.number}</strong><small>{vi ? part.vi : part.en}</small><span aria-hidden="true">↗</span></Link>)}</div></div></div>
    </section>

    <section aria-labelledby="method-title" className={styles.method} id="how-it-works">
      <p className={styles.eyebrow}>{t.guideEyebrow}</p>
      <h2 id="method-title">{t.guideTitle}</h2>
      <GuideCarousel
        allGuidesHref="/blog"
        allGuidesLabel={t.guideAll}
        itemLabel={t.guideItemLabel}
        items={t.guideLinks}
        label={t.guideCarouselLabel}
        locale={locale}
        nextLabel={t.guideNext}
        previousLabel={t.guidePrevious}
        readLabel={t.guideRead}
      />
    </section>

    <section aria-labelledby="closing-title" className={styles.closing}><div><p className={styles.eyebrow}>TOEIC GYM</p><h2 id="closing-title">{t.closing}</h2><p>{t.closingBody}</p></div>{user ? <Link className={styles.primaryAction} href="/dashboard">{t.continue}<span aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge}><ChallengeStartButton className={styles.primaryAction} label={t.start} pendingLabel={t.starting} /></form>}</section>
    </main>
    <PublicFooter locale={locale} />
  </div>;
}
