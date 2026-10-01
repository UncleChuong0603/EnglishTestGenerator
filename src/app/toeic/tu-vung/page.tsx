import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { PUBLIC_TOEIC_VOCABULARY_ENTRIES, PUBLIC_TOEIC_VOCABULARY_TOPICS } from "@/lib/seo/public-vocabulary";
import { getSiteUrl } from "@/lib/seo/site-url";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export const metadata = publicPageMetadata({
  title: "100 từ vựng TOEIC theo chủ đề: nghĩa và ví dụ",
  description: "Học 100 từ vựng TOEIC theo 10 chủ đề công sở, có nghĩa tiếng Việt, giải thích tiếng Anh và câu ví dụ tự biên soạn.",
  canonical: "/toeic/tu-vung",
});

export default async function PublicVocabularyPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  const vi = locale === "vi";
  const base = getSiteUrl();
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${base}/toeic/tu-vung#collection`,
    url: `${base}/toeic/tu-vung`,
    name: "100 TOEIC vocabulary terms by topic",
    about: { "@type": "Thing", name: "TOEIC vocabulary" },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: PUBLIC_TOEIC_VOCABULARY_ENTRIES.length,
      itemListElement: PUBLIC_TOEIC_VOCABULARY_ENTRIES.map((entry, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: entry.term,
        url: `${base}/toeic/tu-vung#${entry.key}`,
      })),
    },
  };

  return <main className="min-h-screen bg-[#f7f6f1] text-[#172821]">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(collectionStructuredData) }} type="application/ld+json" />
    <article className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <BreadcrumbTrail items={[{ name: vi ? "Trang chủ" : "Home", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: vi ? "Từ vựng TOEIC" : "TOEIC vocabulary", path: "/toeic/tu-vung" }]} />
      <header className="mt-8 max-w-4xl border-b border-[#dce3d9] pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-[#245a43]">TOEIC Reading · Vocabulary</p>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{vi ? "100 từ vựng TOEIC theo chủ đề" : "100 TOEIC vocabulary terms by topic"}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#45584d]">{vi ? "Học từ trong 10 tình huống thường gặp ở môi trường công sở. Mỗi mục có nghĩa tiếng Việt, định nghĩa tiếng Anh và câu ví dụ để bạn gặp lại từ trong ngữ cảnh." : "Study words from 10 common workplace situations. Each entry includes Vietnamese meaning, an English definition and an example sentence so you meet the word in context."}</p>
        <p className="mt-4 text-sm leading-6 text-[#45584d]">{vi ? "100 mục đầu tiên do TOEIC GYM biên soạn và rà soát cho tài nguyên công khai; nội dung không phải đề ETS và không cần tài khoản." : "These 100 entries are written and reviewed by TOEIC GYM for this public resource; they are not ETS questions and no account is required."}</p>
        <a className="mt-5 inline-flex min-h-11 items-center rounded-md bg-[#245a43] px-4 font-bold text-white hover:bg-[#184631] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#245a43] print:hidden" download href="/seo/toeic-100-tu-vung.pdf">{vi ? "Tải PDF 100 từ vựng (A4)" : "Download 100-word PDF (A4)"}</a>
      </header>
      <nav aria-label={vi ? "Chủ đề từ vựng" : "Vocabulary topics"} className="mt-8 flex flex-wrap gap-2 print:hidden">
        {PUBLIC_TOEIC_VOCABULARY_TOPICS.map((topic) => <a className="rounded-full border border-[#b9cdbd] bg-white px-4 py-2 text-sm font-bold text-[#245a43] underline-offset-2 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href={`#${topic.id}`} key={topic.id}>{vi ? topic.titleVi : topic.titleEn}</a>)}
      </nav>
      <div className="mt-10 space-y-12">
        {PUBLIC_TOEIC_VOCABULARY_TOPICS.map((topic) => <section aria-labelledby={`${topic.id}-title`} className="scroll-mt-6" id={topic.id} key={topic.id}>
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#dce3d9] pb-3"><h2 className="text-2xl font-black sm:text-3xl" id={`${topic.id}-title`}>{vi ? topic.titleVi : topic.titleEn}</h2><span className="text-sm font-bold text-[#45584d]">{topic.entries.length} {vi ? "mục" : "terms"}</span></div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topic.entries.map((entry) => <div className="min-w-0 rounded-md border border-[#cbd9cd] bg-white p-5" id={entry.key} key={entry.key}>
              <dt className="text-xl font-black" lang="en">{entry.term}</dt>
              <dd className="mt-2 font-bold text-[#245a43]">{vi ? entry.meaningVi : entry.meaningEn}</dd>
              <dd className="mt-3 text-sm leading-6 text-[#45584d]" lang="en">{entry.example}</dd>
            </div>)}
          </dl>
        </section>)}
      </div>
      <section className="mt-14 rounded-md border border-[#cbd9cd] bg-[#e7eee8] p-6 sm:p-8 print:hidden">
        <h2 className="text-2xl font-black">{vi ? "Biến danh sách từ thành buổi luyện" : "Turn the list into a practice session"}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[#45584d]">{vi ? "Sau khi học một chủ đề, hãy tự đặt câu, mở flashcard để kiểm tra nhớ cụm và làm Part 5 để gặp từ trong dạng câu thi." : "After one topic, write a sentence, use the flashcards to check recall and try Part 5 to meet the words in test-style sentences."}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm"><Link className="font-bold text-[#245a43] underline" href="/toeic/flashcards-tu-vung-cong-so">{vi ? "Ôn flashcard từ vựng công sở →" : "Review workplace flashcards →"}</Link><Link className="font-bold text-[#245a43] underline" href="/toeic/part-5/practice">{vi ? "Làm bài Part 5 hỗn hợp →" : "Try mixed Part 5 practice →"}</Link><Link className="font-bold text-[#245a43] underline" href="/blog/tu-vung-toeic-theo-chu-de-cong-so">{vi ? "Đọc phương pháp học theo cụm →" : "Read the collocation study guide →"}</Link></div>
      </section>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
