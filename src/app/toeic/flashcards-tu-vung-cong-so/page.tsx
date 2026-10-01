import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { getSiteUrl } from "@/lib/seo/site-url";
import { serializeStructuredData } from "@/lib/seo/structured-data";
import { TOEIC_VOCABULARY_FLASHCARDS } from "@/lib/seo/vocabulary-flashcards";

export const metadata = publicPageMetadata({
  title: "Flashcard từ vựng TOEIC công sở: 8 cụm có ví dụ",
  description: "Ôn 8 cụm từ vựng TOEIC công sở bằng flashcard tự biên soạn: hóa đơn, hạn chót, giao hàng, tuyển dụng và dự án.",
  canonical: "/toeic/flashcards-tu-vung-cong-so",
});

export default async function VocabularyFlashcardsPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  const vi = locale === "vi";
  const base = getSiteUrl();
  const quizStructuredData = {
    "@context": "https://schema.org/",
    "@type": "Quiz",
    "@id": `${base}/toeic/flashcards-tu-vung-cong-so#quiz`,
    name: "TOEIC workplace vocabulary flashcards",
    about: { "@type": "Thing", name: "TOEIC workplace vocabulary" },
    educationalAlignment: [{ "@type": "AlignmentObject", alignmentType: "educationalSubject", targetName: "TOEIC English" }],
    hasPart: TOEIC_VOCABULARY_FLASHCARDS.map(card => ({
      "@type": "Question",
      "@id": `${base}/toeic/flashcards-tu-vung-cong-so#${card.id}`,
      eduQuestionType: "Flashcard",
      text: card.question,
      acceptedAnswer: { "@type": "Answer", text: card.answer },
    })),
  };
  return <main className="min-h-screen bg-[#f7f6f1] text-[#172821]">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(quizStructuredData) }} type="application/ld+json" />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14" lang={locale}>
      <BreadcrumbTrail items={[{ name: vi ? "Trang chủ" : "Home", path: "/" }, { name: vi ? "TOEIC" : "TOEIC", path: "/toeic" }, { name: vi ? "Flashcard từ vựng công sở" : "Workplace vocabulary flashcards", path: "/toeic/flashcards-tu-vung-cong-so" }]} />
      <header className="mt-8 max-w-3xl border-b border-[#dce3d9] pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-[#245a43]">TOEIC Reading · Vocabulary</p>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{vi ? "Flashcard từ vựng TOEIC công sở" : "TOEIC workplace vocabulary flashcards"}</h1>
        <p className="mt-5 text-lg leading-8 text-[#45584d]">{vi ? "Ôn 8 cụm từ qua câu hỏi và đáp án trong bối cảnh hóa đơn, giao hàng, tuyển dụng và dự án. Mở từng thẻ, tự nhớ câu trả lời trước rồi mới xem giải thích." : "Review 8 collocations through questions and answers about invoices, shipping, hiring and projects. Open each card, recall the answer first and then read the explanation."}</p>
        <p className="mt-4 text-sm leading-6 text-[#45584d]">{vi ? "Tài liệu tự biên soạn · không cần tài khoản · không phải đề ETS" : "Original TOEIC GYM resource · no account needed · not an ETS test"}</p>
      </header>
      <section className="mt-10 grid gap-4" aria-label={vi ? "Flashcard từ vựng" : "Vocabulary flashcards"}>
        {TOEIC_VOCABULARY_FLASHCARDS.map((card, index) => <details className="group rounded-md border border-[#cbd9cd] bg-white open:border-[#245a43]" key={card.id} id={card.id}>
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-5 py-4 font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]"><span className="text-sm text-[#245a43]">{String(index + 1).padStart(2, "0")}</span><span className="flex-1">{card.question}</span><span aria-hidden="true" className="text-xl group-open:rotate-45">+</span></summary>
          <div className="border-t border-[#dce3d9] px-5 pb-5 pt-4"><p className="text-sm font-bold uppercase tracking-wider text-[#245a43]">{vi ? "Đáp án" : "Answer"}</p><p className="mt-2 text-lg font-black" lang="en">{card.answer}</p><p className="mt-3 text-sm font-bold text-[#45584d]">{card.phrase}</p><p className="mt-2 leading-7 text-[#45584d]">{card.explanation}</p></div>
        </details>)}
      </section>
      <section className="mt-12 rounded-md border border-[#cbd9cd] bg-[#e7eee8] p-6 sm:p-8"><h2 className="text-2xl font-black">{vi ? "Cách ôn để nhớ lâu hơn" : "How to review for retention"}</h2><ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-[#45584d]"><li>{vi ? "Đọc câu hỏi và trả lời thành tiếng trước khi mở thẻ." : "Read the question and answer aloud before opening the card."}</li><li>{vi ? "Viết một câu mới với cụm từ, rồi đối chiếu chủ thể và danh từ đi kèm." : "Write a new sentence with the phrase, then check its subject and object."}</li><li>{vi ? "Ôn lại sau 1, 3 và 7 ngày; sau đó thử bài Part 5 hỗn hợp." : "Review after 1, 3 and 7 days, then try mixed Part 5 practice."}</li></ol></section>
      <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm"><Link className="font-bold text-[#245a43] underline" href="/blog/tu-vung-toeic-theo-chu-de-cong-so">{vi ? "Đọc bài hướng dẫn từ vựng công sở →" : "Read the workplace vocabulary guide →"}</Link><Link className="font-bold text-[#245a43] underline" href="/toeic/part-5/practice">{vi ? "Làm bài Part 5 hỗn hợp →" : "Try mixed Part 5 practice →"}</Link></div>
      <p className="mt-8 text-xs leading-5 text-[#45584d]">{vi ? "Nội dung và flashcard do TOEIC GYM tự biên soạn. Kết quả luyện tập không phải điểm TOEIC chính thức." : "The content and flashcards are original to TOEIC GYM. Practice results are not official TOEIC scores."}</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
