import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { FeatureDirectory } from "@/components/marketing/feature-directory";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { getSiteUrl } from "@/lib/seo/site-url";
import { serializeStructuredData } from "@/lib/seo/structured-data";
import { toeicGymOrganizationStructuredData } from "@/lib/seo/site-structured-data";
import styles from "../home.module.css";

export const metadata = publicPageMetadata({
  title: "Về TOEIC GYM: tính năng miễn phí và cách bắt đầu",
  description: "Nghe theo transcript, workout hằng ngày, bảng xếp hạng tuần, flashcards, ôn câu sai và luyện Part 1–7. Xem từng tính năng và mở bài luyện.",
  canonical: "/ve-toeic-gym",
});

const copy = {
  vi: {
    eyebrow: "TÍNH NĂNG & CÁCH HỌC",
    title: "Về TOEIC GYM",
    intro: "TOEIC GYM là nơi bạn làm bài theo Part, nghe audio theo transcript, ôn từ bằng flashcards và nhận workout mỗi ngày. Bảng xếp hạng tuần, sổ câu sai và tiến độ học giúp bạn theo dõi những buổi luyện của mình.",
    featuresTitle: "Từng tính năng, từng lối vào",
    featuresLead: "Bài thử và tài liệu công khai mở ngay. Các công cụ lưu kết quả, workout và thư viện nghe dùng với tài khoản miễn phí.",
    workflowTitle: "Một buổi học trên TOEIC GYM",
    trustTitle: "Nguồn nội dung & cách đọc kết quả",
    sections: [
      { title: "Kết quả bài luyện cho biết điều gì?", body: "Số câu đúng và độ chính xác cho biết kết quả trên nhóm câu vừa làm. Dùng lịch sử theo Part để chọn phần cần luyện tiếp. Đây không phải điểm TOEIC chính thức và không được dùng để dự đoán điểm thi." },
      { title: "Nội dung được xây dựng như thế nào?", body: "Câu hỏi mẫu công khai do TOEIC GYM tự biên soạn theo tình huống công việc và thao tác của từng Part. Lời giải chỉ ra tín hiệu trong câu, bằng chứng trong tài liệu hoặc lý do loại lựa chọn. Các trang hướng dẫn ghi rõ nguồn tham khảo khi có sử dụng tài liệu bên ngoài; ví dụ và bài luyện của TOEIC GYM không sao chép đề ETS." },
      { title: "Góp ý câu hỏi và transcript", body: "Gửi câu hỏi, đoạn transcript hoặc đường dẫn gặp lỗi qua Trung tâm hỗ trợ để chúng tôi kiểm tra. Bạn cũng có thể trao đổi cách học trong nhóm Facebook của TOEIC GYM." },
    ],
    nextTitle: "Bắt đầu từ một việc cụ thể",
    next: [
      ["01 / Làm một bài ngắn", "/challenge/part-5", "Thử 10 câu Part 5, rồi đọc vì sao đáp án đúng và lựa chọn khác sai."],
      ["02 / Ôn điều vừa vướng", "/mistakes", "Khi học với tài khoản, mở sổ câu sai để xem lại lời giải và luyện lại."],
      ["03 / Chọn buổi tiếp theo", "/dashboard", "Mở workout được gợi ý, xem mục tiêu hôm nay hoặc tiếp tục bài đang làm."],
    ],
    cta: "Thử bài luyện miễn phí",
  },
  en: {
    eyebrow: "FEATURES & STUDY FLOW",
    title: "About TOEIC GYM",
    intro: "TOEIC GYM brings together practice by Part, audio with transcripts, vocabulary flashcards and daily workouts. Weekly rankings, a Mistake Bank and progress history help you keep track of your practice sessions.",
    featuresTitle: "Every feature, with a direct link",
    featuresLead: "Open sample practice and public resources right away. Use a free account for saved results, workouts and the listening library.",
    workflowTitle: "A study session on TOEIC GYM",
    trustTitle: "Content sources & understanding results",
    sections: [
      { title: "What do practice results tell you?", body: "Correct answers and accuracy describe your result on the set you just completed. Use Part history to choose your next practice. These are not official TOEIC scores and must not be used to predict a test score." },
      { title: "How is the content made?", body: "Public sample questions are written by TOEIC GYM around workplace situations and the task in each Part. Explanations point to a sentence signal, evidence in a document or the reason each distractor fails. Pages disclose outside references when used; TOEIC GYM examples and practice items do not reproduce ETS tests." },
      { title: "Question and transcript feedback", body: "Send the question, transcript passage or affected link through the Support Center so we can check it. You can also discuss study methods in the TOEIC GYM Facebook group." },
    ],
    nextTitle: "Start with one useful action",
    next: [
      ["01 / Complete a short set", "/challenge/part-5", "Try 10 Part 5 questions, then read why the answer works and other options do not."],
      ["02 / Review what was tricky", "/mistakes", "When studying with an account, open your Mistake Bank to review explanations and practice again."],
      ["03 / Choose your next session", "/dashboard", "Open the suggested workout, check today’s goal or resume an unfinished set."],
    ],
    cta: "Try free practice",
  },
} as const;

export default async function AboutToeicGymPage() {
  const user = await getCurrentUser();
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  const t = copy[locale];
  const base = getSiteUrl();
  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "AboutPage", "@id": `${base}/ve-toeic-gym#about`, url: `${base}/ve-toeic-gym`, name: t.title, description: t.intro, about: { "@id": `${base}#organization` }, inLanguage: locale },
      toeicGymOrganizationStructuredData(base),
    ],
  };
  return <div className={styles.page}>
    <a className={styles.skipLink} href="#main-content">{locale === "vi" ? "Bỏ qua điều hướng" : "Skip to content"}</a>
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(aboutStructuredData) }} type="application/ld+json" />
    <main id="main-content"><article className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14" lang={locale}>
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: t.title, path: "/ve-toeic-gym" }]} />
      <header className="mt-8 max-w-3xl border-b border-[#dce3d9] pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-[#245a43]">{t.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{t.title}</h1>
        <p className="mt-5 text-lg leading-8 text-[#45584d]">{t.intro}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4"><Link className={styles.primaryAction} href="/challenge/part-5">{locale === "vi" ? "Làm thử 10 câu miễn phí" : "Try 10 questions free"}<span aria-hidden="true">↗</span></Link><Link className={styles.secondaryAction} href="#about-features">{locale === "vi" ? "Xem tất cả tính năng" : "See all features"}<span aria-hidden="true">↓</span></Link></div>
      </header>
      <section aria-labelledby="about-features-title" className="py-12" id="about-features">
        <h2 className="text-3xl font-black leading-tight" id="about-features-title">{t.featuresTitle}</h2>
        <p className="mb-8 mt-4 max-w-3xl leading-8 text-[#45584d]">{t.featuresLead}</p>
        <FeatureDirectory locale={locale} />
      </section>
      <section aria-labelledby="workflow-title" className="border-y border-[#dce3d9] py-10">
        <h2 className="text-2xl font-black" id="workflow-title">{t.workflowTitle}</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">{t.next.map(([label, href, description]) => <li key={href}><Link className="inline-flex min-h-11 items-center font-black text-[#245a43] underline underline-offset-4" href={href}>{label}<span aria-hidden="true" className="ml-3">↗</span></Link><p className="mt-2 leading-7 text-[#45584d]">{description}</p></li>)}</ol>
      </section>
      <h2 className="mt-12 text-3xl font-black leading-tight">{t.trustTitle}</h2>
      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-10">
          {t.sections.map(section => <section key={section.title}><h3 className="text-xl font-black leading-snug">{section.title}</h3><p className="mt-4 leading-8 text-[#45584d]">{section.body}</p></section>)}
        </div>
        <aside className="h-fit rounded-md border border-[#cbd9cd] bg-[#e7eee8] p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-black">{locale === "vi" ? "Liên kết chính thức" : "Official links"}</h2>
          <p className="mt-3 text-sm leading-6 text-[#45584d]">{locale === "vi" ? "Theo dõi thông tin và gửi phản hồi qua các kênh của TOEIC GYM." : "Follow updates and send feedback through TOEIC GYM channels."}</p>
          <div className="mt-5 grid gap-3 text-sm"><Link className="font-bold text-[#245a43] underline" href="/support">{locale === "vi" ? "Trung tâm hỗ trợ" : "Support Center"}</Link><a className="font-bold text-[#245a43] underline" href="https://www.facebook.com/profile.php?id=61594521208737" rel="noopener noreferrer" target="_blank">Facebook Page</a><a className="font-bold text-[#245a43] underline" href="https://www.facebook.com/groups/1632623558419538" rel="noopener noreferrer" target="_blank">Facebook Group</a></div>
        </aside>
      </div>
      <section className="mt-14 rounded-md bg-[#172821] p-7 text-white sm:p-10"><h2 className="text-2xl font-black">{t.cta}</h2><p className="mt-3 max-w-2xl leading-7 text-[#dce3d9]">{locale === "vi" ? "Bắt đầu với một nhóm câu ngắn, xem lời giải và chọn việc cần ôn tiếp." : "Start with a short set, read the explanations and choose what to review next."}</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-md bg-[#bfe5c9] px-5 font-bold text-[#172821] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#bfe5c9]" href="/try">{t.cta} <span aria-hidden="true" className="ml-3">→</span></Link></section>
    </article></main>
    <PublicFooter locale={locale} />
  </div>;
}
