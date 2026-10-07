import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { startPart5Challenge } from "@/app/challenge/actions";
import { ChallengeStartButton } from "@/components/challenge-start-button";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { FeatureDirectory } from "@/components/marketing/feature-directory";
import { GuideCarousel } from "@/components/marketing/guide-carousel";
import { HomeScrollEffects } from "@/components/marketing/home-scroll-effects";
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
    eyebrow: "TOEIC GYM / LUYỆN THEO LỖI SAI",
    title: "Luyện đúng lỗi sai.",
    titleAccent: "Mỗi ngày biết nên học gì.",
    lead: "TOEIC GYM dùng kết quả luyện để chọn bài nên học hôm nay, đồng thời đưa lỗi chưa vững và mục tiêu của bạn vào lộ trình được điều chỉnh theo từng tuần.",
    start: "Làm 10 câu để bắt đầu",
    starting: "Đang chuẩn bị bài…",
    continue: "Bài hôm nay",
    how: "Xem cách hệ thống chọn bài",
    promise: ["Gợi ý từ kết quả thật", "Ôn lại lỗi chưa vững", "Điều chỉnh theo ngày & tuần"],
    sample: "Minh họa cách tín hiệu học tập trở thành bài luyện tiếp theo",
    sampleLabel: "BÀI NÊN HỌC HÔM NAY · 20 PHÚT",
    sampleFocus: "Part 5 · Giới từ chỉ thời hạn",
    sampleReason: "Kết quả gần đây đã đủ để xác định “by + thời hạn” là dạng cần ưu tiên. Bài tiếp theo tập trung vào dạng này, đồng thời vẫn giữ câu hỗ trợ và câu duy trì.",
    sampleSessions: ["Hôm nay / Luyện trọng tâm", "Buổi 2 / Ôn câu sai", "Buổi 3 / Nghe transcript"],
    samplePrompt: "Please submit the report ___ Friday.",
    sampleAnswer: "Đáp án: by",
    sampleWhy: "“By Friday” diễn tả hạn chót: báo cáo cần được nộp trước hoặc chậm nhất vào thứ Sáu.",
    sampleNext: "Làm bài thật để TOEIC GYM bắt đầu hiểu cách bạn học",
    entryEyebrow: "CÔNG CỤ HỌC MIỄN PHÍ",
    entryTitle: "Gỡ đúng chỗ vướng, không chỉ làm thêm câu.",
    entryLead: "Nghe lại với transcript, học từ trong ngữ cảnh hoặc xem bài ngữ pháp liên quan. Mỗi công cụ đều dẫn bạn quay lại luyện tập.",
    loopEyebrow: "CÁC TÍNH NĂNG CỦA TOEIC GYM",
    loopTitle: "Từ lỗi sai đến bài học tiếp theo.",
    roadmapEyebrow: "KHÔNG CẦN TỰ LÊN LỊCH",
    roadmapTitle: "Một lộ trình biết tự điều chỉnh.",
    roadmapLead: "Kế hoạch không đứng yên. Mỗi lần bạn làm bài, ôn lỗi hay bỏ dở một buổi, TOEIC GYM có thêm dữ liệu để chọn bước tiếp theo hữu ích hơn.",
    roadmapItems: [
      { status: "Sau mỗi bài", title: "Nhìn ra lỗi cần xử lý", description: "Câu sai, lỗi lặp và kết quả theo Part trở thành tín hiệu để chọn nội dung cần ưu tiên — không quy đổi thành điểm TOEIC chính thức." },
      { status: "Mỗi ngày", title: "Mở ra là có bài nên học", description: "Workout hôm nay cân bằng phần còn yếu với nội dung hỗ trợ và duy trì, để bạn không phải tự chọn giữa hàng chục bài luyện." },
      { status: "Mỗi tuần", title: "Sắp lại lộ trình theo tiến độ thật", description: "Kế hoạch tuần kết hợp mục tiêu, thời lượng học, lỗi cần ôn và buổi chưa hoàn thành; sau mỗi tuần, thứ tự ưu tiên được tính lại từ hoạt động thực tế." },
    ],
    roadmapNote: "Khi chưa có đủ dữ liệu, TOEIC GYM bắt đầu bằng bài khám phá cân bằng. Đề xuất sẽ cụ thể hơn sau khi có đủ câu trả lời làm bằng chứng.",
    roadmapAction: "Hiểu rõ cách lộ trình hoạt động",
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
    closing: "Bắt đầu bằng 10 câu. TOEIC GYM lo bước tiếp theo.",
    closingBody: "Làm Part 5 không cần tài khoản, xem lời giải ngay sau khi nộp và bắt đầu tạo tín hiệu cho lộ trình học của bạn.",
  },
  en: {
    eyebrow: "TOEIC GYM / PRACTICE FROM MISTAKES",
    title: "Practice your real mistakes.",
    titleAccent: "Know what to study each day.",
    lead: "TOEIC GYM uses your practice results to choose today's useful session, while unresolved mistakes and goals shape a plan that adjusts week by week.",
    start: "Take 10 questions to begin",
    starting: "Preparing your questions…",
    continue: "Today's workout",
    how: "See how recommendations work",
    promise: ["Based on real results", "Revisits unresolved mistakes", "Adjusts daily and weekly"],
    sample: "An illustration of how learning evidence becomes the next practice session",
    sampleLabel: "TODAY'S RECOMMENDED SESSION · 20 MIN",
    sampleFocus: "Part 5 · Deadline prepositions",
    sampleReason: "Recent results provide enough evidence to prioritize the “by + deadline” pattern. The next set focuses on it while keeping support and maintenance questions in the mix.",
    sampleSessions: ["Today / Focused practice", "Session 2 / Mistake review", "Session 3 / Transcript listening"],
    samplePrompt: "Please submit the report ___ Friday.",
    sampleAnswer: "Answer: by",
    sampleWhy: "“By Friday” gives a deadline: the report should be submitted no later than Friday.",
    sampleNext: "Take a real set so TOEIC GYM can start learning how you study",
    entryEyebrow: "FREE LEARNING TOOLS",
    entryTitle: "Fix the sticking point, not just another question.",
    entryLead: "Replay with a transcript, learn words in context or open the related grammar lesson. Each tool leads back to useful practice.",
    loopEyebrow: "TOEIC GYM FEATURES",
    loopTitle: "From a mistake to the next useful session.",
    roadmapEyebrow: "NO MANUAL STUDY PLANNING",
    roadmapTitle: "A study path that adjusts itself.",
    roadmapLead: "The plan does not stand still. Every completed set, reviewed mistake or unfinished session gives TOEIC GYM better evidence for the next useful step.",
    roadmapItems: [
      { status: "After each set", title: "Find what needs attention", description: "Missed questions, repeated errors and results by Part become recommendation signals — never an unofficial TOEIC score." },
      { status: "Every day", title: "Open one useful next session", description: "Today's workout balances a current weakness with support and maintenance questions, so you do not have to choose from dozens of sets." },
      { status: "Every week", title: "Rebuild the path from real progress", description: "The weekly plan combines your goal, available study time, reviewable mistakes and unfinished work, then recalculates priorities from actual activity." },
    ],
    roadmapNote: "When there is not enough evidence yet, TOEIC GYM starts with balanced exploration. Recommendations become more specific after enough answers support them.",
    roadmapAction: "Understand how the study path works",
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
    closing: "Start with 10 questions. Let TOEIC GYM handle the next step.",
    closingBody: "Try Part 5 without an account, get explanations after submitting and begin creating signals for your study path.",
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

  return <div className={styles.page} data-home-page>
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(websiteStructuredData) }} type="application/ld+json" />
    <HomeScrollEffects locale={locale} />
    <div aria-hidden="true" className={styles.scrollProgress}><span data-home-progress-value /></div>
    <a className={styles.skipLink} href="#main-content">{vi ? "Bỏ qua điều hướng" : "Skip to content"}</a>
    <PublicHeader locale={locale} signedIn={Boolean(user)} signedInPrimaryHref="/dashboard" signedInPrimaryLabel={t.continue} tone="dark" />
    <main id="main-content" lang={locale}>

    <section aria-labelledby="home-title" className={styles.hero} data-home-hero>
      <div className={styles.heroCopy} data-home-reveal="hero-copy">
        <p className={styles.eyebrow}>{t.eyebrow}</p>
        <h1 id="home-title"><span>{t.title}</span>{" "}<span className={styles.titleAccent}>{t.titleAccent}</span></h1>
        <p className={styles.lead}>{t.lead}</p>
        <ul className={styles.promise}>{t.promise.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className={styles.actions}>
          {user ? <Link className={styles.primaryAction} href="/dashboard">{t.continue}<span aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge}><ChallengeStartButton className={styles.primaryAction} label={t.start} pendingLabel={t.starting} /></form>}
          <Link className={styles.secondaryAction} href="#roadmap">{t.how} <span aria-hidden="true">↓</span></Link>
        </div>
      </div>
      <div className={styles.heroVisual} data-home-hero-visual data-home-reveal="hero-visual">
        <div className={styles.heroMascot} aria-label={vi ? "Milo, huấn luyện viên học tập của TOEIC GYM" : "Milo, TOEIC GYM's study coach"}>
          <Image src="/mascot/milo-coach.webp" alt="" width={170} height={184} priority />
          <p><strong>Milo</strong><span>{vi ? "Coach học cùng bạn" : "Your study coach"}</span></p>
        </div>
        <div className={styles.sample}>
          <div className={styles.sampleTop}><span>TOEIC GYM</span><span>{vi ? "MINH HỌA" : "EXAMPLE"}</span></div>
          <div className={styles.sampleBody}>
            <p className={styles.sampleKicker}>{t.sampleLabel}</p>
            <p className={styles.sampleQuestion}>{t.sampleFocus}</p>
            <p className={styles.sampleReason}>{t.sampleReason}</p>
            <ol className={styles.samplePlan}>{t.sampleSessions.map((session, index) => <li className={index === 0 ? styles.currentSession : undefined} key={session}><span>{String(index + 1).padStart(2, "0")}</span><strong>{session}</strong></li>)}</ol>
            <div className={styles.explanation}><strong>{t.sampleAnswer}</strong><p lang="en">{t.samplePrompt.replace("___", "by")}</p><p>{t.sampleWhy}</p></div>
          </div>
          <div className={styles.sampleFoot}><span>{t.sampleNext}</span>{user ? <Link href="/dashboard">{t.continue} <span aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge}><ChallengeStartButton className={styles.sampleFootAction} label={t.start} pendingLabel={t.starting} /></form>}</div>
        </div>
        <p className={styles.sampleCaption}>{t.sample}</p>
      </div>
    </section>

    <div className={styles.proof} aria-label={vi ? "Điểm mạnh của TOEIC GYM" : "TOEIC GYM highlights"}>
      {[
        { href: "/dashboard", label: vi ? "Bài học theo lỗi sai" : "Mistake-led workouts", marker: "01" },
        { href: "/dashboard#weekly-plan-heading", label: vi ? "Lộ trình ngày & tuần" : "Daily & weekly path", marker: "02" },
        { href: "/listening-lessons", label: vi ? "Nghe transcript miễn phí" : "Free transcript listening", marker: "03" },
        { href: "/vocabulary", label: vi ? "Từ vựng miễn phí" : "Free vocabulary", marker: "04" },
      ].map(item => <Link data-home-reveal="proof" href={item.href} key={item.href}><strong>{item.marker}</strong><span>{item.label}</span><span aria-hidden="true">↗</span></Link>)}
    </div>

    <section aria-labelledby="roadmap-title" className={styles.roadmapSection} data-home-roadmap id="roadmap">
      <div className={styles.roadmapIntro} data-home-reveal="heading">
        <div><p className={styles.eyebrow}>{t.roadmapEyebrow}</p><h2 id="roadmap-title">{t.roadmapTitle}</h2></div>
        <p>{t.roadmapLead}</p>
      </div>
      <ol className={styles.roadmapList}>
        {t.roadmapItems.map((item, index) => <li data-home-roadmap-item key={item.title}>
          <div className={styles.roadmapMeta}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{item.status}</span></div>
          <div className={styles.roadmapCopy}><h3>{item.title}</h3><p>{item.description}</p></div>
        </li>)}
      </ol>
      <div className={styles.roadmapFoot} data-home-reveal="rise">
        <p>{t.roadmapNote}</p>
        <Link className={styles.roadmapAction} href="/ve-toeic-gym#adaptive-plan">{t.roadmapAction}<span aria-hidden="true">↗</span></Link>
      </div>
    </section>

    <section aria-labelledby="explore-title" className={styles.section} id="explore">
      <div className={styles.sectionIntro} data-home-reveal="heading"><div><p className={styles.eyebrow}>{t.entryEyebrow}</p><h2 id="explore-title">{t.entryTitle}</h2></div><p>{t.entryLead}</p></div>
      <div className={styles.spotlights} data-home-reveal="rise">
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
        <div className={styles.habitSpotlights}>{["vocabulary", "grammar"].map(id => {
          const feature = productFeatures.find(item => item.id === id)!;
          return <article key={id}><p className={styles.eyebrow}>{id === "vocabulary" ? (vi ? "HỌC TỪ TRONG NGỮ CẢNH" : "WORDS IN CONTEXT") : (vi ? "HIỂU VÌ SAO MÌNH SAI" : "UNDERSTAND THE RULE")}</p><h3>{feature[locale].title}</h3><p>{feature[locale].description}</p><p className={styles.accessNote}>{featureAccessLabel(feature.access, locale)}</p><Link className={styles.secondaryAction} href={feature.href}>{feature[locale].action}<span aria-hidden="true">↗</span></Link></article>;
        })}</div>
      </div>
    </section>

    <section aria-labelledby="features-title" className={styles.directorySection} id="features">
      <div className={styles.section}>
        <div className={styles.sectionIntro} data-home-reveal="heading"><div><p className={styles.eyebrow}>{t.loopEyebrow}</p><h2 id="features-title">{t.loopTitle}</h2></div></div>
        <FeatureDirectory compact locale={locale} tone="dark" />
      </div>
    </section>

    <section aria-labelledby="bank-title" className={styles.section} id="question-bank">
      <div className={styles.sectionIntro} data-home-reveal="heading"><div><p className={styles.eyebrow}>{t.bankEyebrow}</p><h2 id="bank-title">{t.bankTitle}</h2></div><p>{t.bankLead}</p></div>
      <div className={styles.partGroups} data-home-reveal="rise"><div><h3>{t.listening}</h3><div>{parts.slice(0, 4).map((part) => <Link href={`/toeic/part-${part.number}`} key={part.number}><span>0{part.number}</span><strong>Part {part.number}</strong><small>{vi ? part.vi : part.en}</small><span aria-hidden="true">↗</span></Link>)}</div></div><div><h3>{t.reading}</h3><div>{parts.slice(4).map((part) => <Link href={`/toeic/part-${part.number}`} key={part.number}><span>0{part.number}</span><strong>Part {part.number}</strong><small>{vi ? part.vi : part.en}</small><span aria-hidden="true">↗</span></Link>)}</div></div></div>
    </section>

    <section aria-labelledby="method-title" className={styles.method} id="how-it-works">
      <div data-home-reveal="heading"><p className={styles.eyebrow}>{t.guideEyebrow}</p>
      <h2 id="method-title">{t.guideTitle}</h2></div>
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
        tone="dark"
      />
    </section>

    <section aria-labelledby="closing-title" className={styles.closing} data-home-reveal="rise"><div><p className={styles.eyebrow}>TOEIC GYM</p><h2 id="closing-title">{t.closing}</h2><p>{t.closingBody}</p></div>{user ? <Link className={styles.primaryAction} href="/dashboard">{t.continue}<span aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge}><ChallengeStartButton className={styles.primaryAction} label={t.start} pendingLabel={t.starting} /></form>}</section>
    </main>
    <PublicFooter locale={locale} tone="dark" />
  </div>;
}
