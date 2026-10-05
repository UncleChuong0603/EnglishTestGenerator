import Link from "next/link";
import { GrammarLessonBrowser } from "@/components/grammar/grammar-lesson-browser";
import { LearnerNav } from "@/components/learner-nav";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { listPublishedPosts } from "@/lib/blog/service";
import { GRAMMAR_LEARNING_PATH, GRAMMAR_TOEIC_COVERAGE } from "@/lib/blog/grammar-learning-path";
import { grammarSearchTerms } from "@/lib/blog/grammar-search";
import { getPreferences } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { getSiteUrl } from "@/lib/seo/site-url";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export const metadata = publicPageMetadata({
  title: "Ngữ pháp TOEIC A–Z: từ nền tảng đến Part 1–7",
  description: "Học ngữ pháp TOEIC theo lộ trình có ví dụ, lỗi thường gặp và bài tự kiểm tra. Bao quát cấu trúc cần dùng để nghe, đọc và làm Part 1–7.",
  canonical: "/ngu-phap",
  socialTitle: "Ngữ pháp TOEIC A–Z | TOEIC GYM",
  socialDescription: "Chọn chủ điểm theo lỗi đang gặp, hiểu cách áp dụng vào từng Part và luyện lại bằng câu TOEIC.",
  image: "/blog/cover/grammar",
});

export default async function GrammarPage() {
  const user = await getCurrentUser();
  const [preferences, posts] = await Promise.all([getPreferences(user?.id), listPublishedPosts(500)]);
  const locale = preferences.interfaceLanguage;
  const vi = locale === "vi";
  const available = new Set(posts.filter((post) => post.category === "GRAMMAR").map((post) => post.slug));
  let lessonNumber = 0;
  const units = GRAMMAR_LEARNING_PATH.map((unit) => ({
    ...unit,
    lessons: unit.lessons.filter((lesson) => available.has(lesson.slug)).map((lesson) => ({
      ...lesson,
      number: ++lessonNumber,
      searchTerms: grammarSearchTerms(lesson.slug),
    })),
  })).filter((unit) => unit.lessons.length);
  const count = lessonNumber;
  const base = getSiteUrl();
  const url = new URL("/ngu-phap", base).toString();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        url,
        name: "Ngữ pháp TOEIC A–Z từ nền tảng đến Part 1–7",
        description: "Lộ trình ngữ pháp có ví dụ, bài tự kiểm tra và bản đồ áp dụng vào TOEIC Listening & Reading Part 1–7.",
        inLanguage: "vi",
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: count,
          itemListElement: units.flatMap((unit) => unit.lessons).map((lesson) => ({
            "@type": "ListItem",
            position: lesson.number,
            name: lesson.label,
            url: new URL(`/blog/${lesson.slug}`, base).toString(),
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "TOEIC GYM", item: base },
          { "@type": "ListItem", position: 2, name: "Ngữ pháp TOEIC A–Z", item: url },
        ],
      },
    ],
  };

  return <div className="min-h-screen bg-[#f7f6f1] text-[#172821]">
    <a className="sr-only z-[60] rounded-md bg-white px-4 py-3 font-bold text-[#245a43] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-2 focus:outline-offset-2 focus:outline-[#245a43]" href="#grammar-content">{vi ? "Bỏ qua điều hướng" : "Skip to content"}</a>
    {!user ? <PublicHeader locale={locale} signedIn={false} /> : null}
    <main className={user ? "learner-page min-h-screen px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8" : undefined} id="grammar-content" lang={locale}>
      <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} type="application/ld+json" />
      <div className={user ? "mx-auto max-w-6xl" : "mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 sm:pt-10"}>
        {user ? <LearnerNav locale={locale} /> : null}
        <nav aria-label={vi ? "Đường dẫn" : "Breadcrumb"} className="text-sm text-[#45584d]">
          <Link className="font-semibold text-[#245a43] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href={user ? "/dashboard" : "/"}>{user ? (vi ? "Trang học" : "Learner home") : "TOEIC GYM"}</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span>{vi ? "Ngữ pháp TOEIC A–Z" : "TOEIC Grammar A–Z"}</span>
        </nav>

        <header className="mt-6 overflow-hidden rounded-2xl bg-[#172821] text-white">
          <div className="grid gap-7 px-6 py-8 sm:px-8 sm:py-10 xl:grid-cols-[minmax(0,1fr)_16rem] xl:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#9dd6b8]">{vi ? "HỌC THEO LỖI · ÁP DỤNG THEO PART" : "LEARN BY ERROR · APPLY BY PART"}</p>
              <h1 className="mt-3 max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">{vi ? "Ngữ pháp TOEIC A–Z" : "TOEIC Grammar A–Z"}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[#dce3d9] sm:text-lg sm:leading-8">{vi
                ? `${count} bài học đi từ khung câu và loại từ đến mệnh đề, rồi chỉ rõ cách dùng ngữ pháp để nghe và đọc trong TOEIC Part 1–7. Mỗi bài có ví dụ công việc, bẫy thường gặp và phần tự kiểm tra.`
                : `${count} Vietnamese lessons move from sentence foundations to clauses, then show how grammar supports Listening and Reading across TOEIC Parts 1–7.`}</p>
              {!vi && <p className="mt-3 max-w-3xl text-sm leading-6 text-[#bfcac1]">The article library is currently written in Vietnamese. Navigation and the Part coverage map are available in English.</p>}
              <div className="mt-7 flex flex-wrap gap-3">
                <Link className="inline-flex min-h-12 items-center rounded-lg bg-[#9dd6b8] px-5 font-bold text-[#172821] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="#nen-tang">{vi ? "Bắt đầu từ nền tảng" : "Start with foundations"}</Link>
                <Link className="inline-flex min-h-12 items-center rounded-lg border border-white/50 px-5 font-bold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="#ap-dung-theo-part">{vi ? "Xem theo Part 1–7" : "Browse Parts 1–7"}</Link>
              </div>
            </div>
            <div className="border-l-2 border-[#af744f] pl-5">
              <p className="text-4xl font-black tabular-nums">{count}</p>
              <p className="mt-1 font-semibold text-[#dce3d9]">{vi ? "bài học có thể mở miễn phí" : "free-to-open lessons"}</p>
              <p className="mt-4 text-sm leading-6 text-[#bfcac1]">{vi ? "Không cần học thuộc toàn bộ trước khi luyện. Chọn bài từ lỗi bạn vừa gặp, rồi quay lại câu mới để kiểm tra." : "Start from a real mistake, study one focused lesson, then check the rule on new questions."}</p>
            </div>
          </div>
        </header>

        <GrammarLessonBrowser locale={locale} units={units}>
        <section aria-labelledby="coverage-title" className="mt-12">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#245a43]">{vi ? "PHẠM VI TOEIC LISTENING & READING" : "TOEIC LISTENING & READING COVERAGE"}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl" id="coverage-title">{vi ? "Ngữ pháp được dùng khác nhau ở từng Part" : "Grammar supports each Part differently"}</h2>
            <p className="mt-4 leading-7 text-[#45584d]">{vi
              ? "Part 5–6 hỏi cấu trúc trực tiếp hơn. Ở Part 1–4 và 7, ngữ pháp là công cụ để hiểu hành động, thời gian, quan hệ giữa ý và từ tham chiếu — không thay thế kỹ năng nghe, từ vựng hay tìm bằng chứng."
              : "Parts 5–6 test form and structure more directly. In Parts 1–4 and 7, grammar helps you interpret actions, time, relationships and references; it does not replace listening, vocabulary or evidence-finding."}</p>
          </div>
          <div className="mt-7 grid gap-px border border-[#dce3d9] bg-[#dce3d9] sm:grid-cols-2 xl:grid-cols-4">
            {GRAMMAR_TOEIC_COVERAGE.map((item) => <Link className="group min-h-44 bg-white p-5 outline-offset-[-3px] hover:bg-[#eef3eb] focus-visible:outline-2 focus-visible:outline-[#245a43]" href={item.href} key={item.parts}>
              <span className="text-xs font-black uppercase tracking-[.16em] text-[#af744f]">Part {item.parts}</span>
              <h3 className="mt-3 text-xl font-black group-hover:text-[#245a43]">{item[locale].title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#45584d]">{item[locale].summary}</p>
              <span aria-hidden="true" className="mt-4 block font-bold text-[#245a43]">→</span>
            </Link>)}
          </div>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-[#45584d]">{vi ? "Phạm vi trên được TOEIC GYM biên soạn từ các cấu trúc xuất hiện trong ngữ cảnh giao tiếp công việc. ETS công bố định dạng và kỹ năng của từng Part, không công bố một “danh sách ngữ pháp TOEIC” hữu hạn." : "This map is TOEIC GYM's editorial study framework. ETS publishes the test format and skills, not a finite official TOEIC grammar syllabus."} <a className="font-bold text-[#245a43] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href="https://www.ets.org/toeic/test-takers/about/listening-reading.html" rel="noopener noreferrer">{vi ? "Xem định dạng TOEIC Listening & Reading của ETS" : "See the ETS Listening & Reading format"}</a>.</p>
        </section>
        </GrammarLessonBrowser>

        <section aria-labelledby="study-method-title" className="mt-16 grid gap-8 rounded-2xl border border-[#cbd7cb] bg-[#eef3eb] p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#245a43]">{vi ? "HỌC ĐỂ DÙNG ĐƯỢC" : "TURN A RULE INTO A SKILL"}</p>
            <h2 className="mt-3 text-3xl font-black" id="study-method-title">{vi ? "Một vòng học ngắn cho mỗi chủ điểm" : "A short loop for each topic"}</h2>
            <ol className="mt-5 grid gap-3 leading-7 text-[#45584d] sm:grid-cols-3">
              <li><strong className="block text-[#172821]">01 · {vi ? "Nhận diện" : "Recognize"}</strong>{vi ? "Tìm tín hiệu và gọi tên phần câu đang thiếu." : "Find the signal and identify what the sentence needs."}</li>
              <li><strong className="block text-[#172821]">02 · {vi ? "Giải thích" : "Explain"}</strong>{vi ? "Nói vì sao đáp án đúng và loại từng phương án sai." : "Explain the answer and eliminate each distractor."}</li>
              <li><strong className="block text-[#172821]">03 · {vi ? "Kiểm tra lại" : "Retest"}</strong>{vi ? "Làm câu mới không báo trước chủ điểm." : "Apply it to a new question without a topic label."}</li>
            </ol>
          </div>
          <div>
            <Link className="flex min-h-12 items-center justify-center rounded-lg bg-[#245a43] px-5 text-center font-bold text-white hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href="/challenge/part-5">{vi ? "Làm 10 câu Part 5" : "Try 10 Part 5 questions"}</Link>
            <p className="mt-3 text-center text-sm leading-6 text-[#45584d]">{vi ? "Không cần tài khoản · xem kết quả và lời giải sau khi nộp" : "No account needed · results and explanations after submission"}</p>
          </div>
        </section>

        <aside className="mt-12 border-l-2 border-[#af744f] pl-5 text-sm leading-7 text-[#45584d]">
          <p><strong className="text-[#172821]">{vi ? "Nguồn và cách biên soạn:" : "Sources and editorial method:"}</strong> {vi ? "Ví dụ và câu tự kiểm tra do TOEIC GYM tự viết theo ngữ cảnh công việc; thuật ngữ ngữ pháp được đối chiếu với các nguồn học tiếng Anh công khai." : "Examples and self-check questions are written by TOEIC GYM for workplace contexts; terminology is checked against public English-learning references."}</p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            <a className="font-bold text-[#245a43] underline underline-offset-4" href="https://dictionary.cambridge.org/grammar/british-grammar/" rel="noopener noreferrer">Cambridge Grammar</a>
            <a className="font-bold text-[#245a43] underline underline-offset-4" href="https://learnenglish.britishcouncil.org/grammar" rel="noopener noreferrer">British Council Grammar</a>
            <Link className="font-bold text-[#245a43] underline underline-offset-4" href="/ve-toeic-gym">{vi ? "Quy trình nội dung TOEIC GYM" : "TOEIC GYM content process"}</Link>
          </div>
        </aside>
      </div>
    </main>
    {!user ? <PublicFooter locale={locale} /> : null}
  </div>;
}
