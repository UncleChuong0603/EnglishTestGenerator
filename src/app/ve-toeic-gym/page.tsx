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
  title: "Về TOEIC GYM: luyện theo lỗi sai và lộ trình cá nhân",
  description: "TOEIC GYM đề xuất bài học mỗi ngày từ lỗi sai và kết quả luyện, điều chỉnh lộ trình theo tuần, kèm nghe transcript và từ vựng miễn phí.",
  canonical: "/ve-toeic-gym",
});

const copy = {
  vi: {
    eyebrow: "LUYỆN ĐÚNG CHỖ CẦN CẢI THIỆN",
    title: "TOEIC GYM giúp bạn biết hôm nay nên học gì.",
    intro: "Thay vì tự chọn bài mỗi ngày, bạn luyện tập và để kết quả thật dẫn đường. TOEIC GYM gom lỗi sai, nhận ra phần cần ưu tiên và sắp bài học theo ngày, theo tuần — kèm transcript, từ vựng và ngữ pháp để bạn hiểu sâu hơn.",
    adaptiveEyebrow: "KHÁC BIỆT CỐT LÕI",
    adaptiveTitle: "Lộ trình được tính lại từ chính cách bạn học.",
    adaptiveLead: "Đề xuất không dựa trên một con số chung chung. Hệ thống kết hợp nhiều tín hiệu có bằng chứng và chỉ gọi một phần là điểm yếu khi đã có đủ câu trả lời để hỗ trợ kết luận đó.",
    signalTitle: "TOEIC GYM dựa vào",
    signals: ["Kết quả theo Listening, Reading và từng Part", "Câu sai, lỗi lặp và nội dung đã ôn lại", "Mục tiêu, ngày thi và thời lượng học", "Buổi đã hoàn thành hoặc còn dang dở"],
    adaptiveSteps: [
      ["01", "Bài hôm nay", "Một workout được chọn để xử lý ưu tiên hiện tại mà vẫn duy trì các phần khác."],
      ["02", "Lộ trình tuần", "Các buổi luyện và ôn lỗi được xếp theo số ngày cùng thời lượng bạn có thể học."],
      ["03", "Tự điều chỉnh", "Tổng kết tuần cập nhật lỗi còn tồn tại, phần cần ưu tiên và việc chưa hoàn thành cho tuần mới."],
    ],
    featuresTitle: "Mọi công cụ xoay quanh lộ trình của bạn",
    featuresLead: "Bắt đầu bằng bài thử miễn phí, dùng transcript và từ vựng để gỡ chỗ vướng, rồi để kết quả mới cập nhật bài học tiếp theo.",
    workflowTitle: "Một vòng học khép kín",
    trustTitle: "Nguồn nội dung & cách đọc kết quả",
    sections: [
      { title: "Kết quả bài luyện cho biết điều gì?", body: "Số câu đúng và độ chính xác cho biết kết quả trên nhóm câu vừa làm. Dùng lịch sử theo Part để chọn phần cần luyện tiếp. Đây không phải điểm TOEIC chính thức và không được dùng để dự đoán điểm thi." },
      { title: "Nội dung được xây dựng như thế nào?", body: "Câu hỏi mẫu công khai do TOEIC GYM tự biên soạn theo tình huống công việc và thao tác của từng Part. Lời giải chỉ ra tín hiệu trong câu, bằng chứng trong tài liệu hoặc lý do loại lựa chọn. Các trang hướng dẫn ghi rõ nguồn tham khảo khi có sử dụng tài liệu bên ngoài; ví dụ và bài luyện của TOEIC GYM không sao chép đề ETS." },
      { title: "Góp ý câu hỏi và transcript", body: "Gửi câu hỏi, đoạn transcript hoặc đường dẫn gặp lỗi qua Trung tâm hỗ trợ để chúng tôi kiểm tra. Bạn cũng có thể trao đổi cách học trong nhóm Facebook của TOEIC GYM." },
    ],
    nextTitle: "Bắt đầu từ một việc cụ thể",
    next: [
      ["01 / Làm một bài ngắn", "/challenge/part-5", "Thử 10 câu Part 5, rồi đọc vì sao đáp án đúng và lựa chọn khác sai."],
      ["02 / Hiểu và sửa lỗi", "/mistakes", "Câu sai được gom lại để bạn xem lời giải, nhận ra lỗi lặp và luyện lại."],
      ["03 / Mở bài được đề xuất", "/dashboard", "TOEIC GYM chọn workout hôm nay và sắp lại kế hoạch tuần từ hoạt động thật."],
    ],
    cta: "Thử bài luyện miễn phí",
  },
  en: {
    eyebrow: "PRACTICE WHAT ACTUALLY NEEDS WORK",
    title: "TOEIC GYM tells you what is useful to study today.",
    intro: "Instead of choosing a set from scratch every day, practice and let real results guide the path. TOEIC GYM collects mistakes, identifies supported priorities and arranges daily and weekly sessions — with transcripts, vocabulary and grammar to help you go deeper.",
    adaptiveEyebrow: "THE CORE DIFFERENCE",
    adaptiveTitle: "A study path recalculated from how you actually learn.",
    adaptiveLead: "Recommendations are not built from one vague number. The system combines evidence-based signals and only calls something a weakness after enough answers support that conclusion.",
    signalTitle: "TOEIC GYM considers",
    signals: ["Listening, Reading and Part-level results", "Missed questions, repeated errors and reviewed material", "Your target, test date and available study time", "Completed and unfinished sessions"],
    adaptiveSteps: [
      ["01", "Today's session", "One workout selected for the current priority while maintaining other areas."],
      ["02", "Weekly path", "Practice and mistake-review sessions arranged around your available days and time."],
      ["03", "Automatic adjustment", "The weekly review carries unresolved errors, supported priorities and unfinished work into the new week."],
    ],
    featuresTitle: "Every tool supports your study path",
    featuresLead: "Start with free practice, use transcripts and vocabulary to fix a sticking point, then let the new result update what comes next.",
    workflowTitle: "A closed learning loop",
    trustTitle: "Content sources & understanding results",
    sections: [
      { title: "What do practice results tell you?", body: "Correct answers and accuracy describe your result on the set you just completed. Use Part history to choose your next practice. These are not official TOEIC scores and must not be used to predict a test score." },
      { title: "How is the content made?", body: "Public sample questions are written by TOEIC GYM around workplace situations and the task in each Part. Explanations point to a sentence signal, evidence in a document or the reason each distractor fails. Pages disclose outside references when used; TOEIC GYM examples and practice items do not reproduce ETS tests." },
      { title: "Question and transcript feedback", body: "Send the question, transcript passage or affected link through the Support Center so we can check it. You can also discuss study methods in the TOEIC GYM Facebook group." },
    ],
    nextTitle: "Start with one useful action",
    next: [
      ["01 / Complete a short set", "/challenge/part-5", "Try 10 Part 5 questions, then read why the answer works and other options do not."],
      ["02 / Understand and fix errors", "/mistakes", "Missed questions are collected so you can revisit explanations, spot repeats and practice again."],
      ["03 / Open the recommendation", "/dashboard", "TOEIC GYM chooses today's workout and reshapes the week from real activity."],
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
      <section aria-labelledby="adaptive-plan-title" className="border-b border-[#dce3d9] py-12" id="adaptive-plan">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,.85fr)] lg:gap-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.16em] text-[#245a43]">{t.adaptiveEyebrow}</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-5xl" id="adaptive-plan-title">{t.adaptiveTitle}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#45584d]">{t.adaptiveLead}</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[.12em] text-[#245a43]">{t.signalTitle}</h3>
            <ul className="mt-4 border-t border-[#bdcdbf]">
              {t.signals.map((signal, index) => <li className="grid min-h-14 grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 border-b border-[#bdcdbf] py-3 text-[#45584d]" key={signal}><span className="text-xs font-black text-[#245a43]">{String(index + 1).padStart(2, "0")}</span><span className="leading-7">{signal}</span></li>)}
            </ul>
          </div>
        </div>
        <ol className="mt-10 grid border-y border-[#bdcdbf] md:grid-cols-3">
          {t.adaptiveSteps.map(([number, title, description], index) => <li className={`py-6 md:px-6 ${index > 0 ? "border-t border-[#bdcdbf] md:border-l md:border-t-0" : ""}`} key={number}><span className="text-xs font-black tracking-[.12em] text-[#af744f]">{number}</span><h3 className="mt-3 text-xl font-black">{title}</h3><p className="mt-2 leading-7 text-[#45584d]">{description}</p></li>)}
        </ol>
      </section>
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
      <section className="mt-14 rounded-md bg-[#172821] p-7 text-white sm:p-10"><h2 className="text-2xl font-black">{t.cta}</h2><p className="mt-3 max-w-2xl leading-7 text-[#dce3d9]">{locale === "vi" ? "Bắt đầu với một nhóm câu ngắn, xem lời giải và tạo tín hiệu đầu tiên cho bài học được đề xuất." : "Start with a short set, read the explanations and create the first signal for a recommended next session."}</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-md bg-[#bfe5c9] px-5 font-bold text-[#172821] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#bfe5c9]" href="/try">{t.cta} <span aria-hidden="true" className="ml-3">→</span></Link></section>
    </article></main>
    <PublicFooter locale={locale} />
  </div>;
}
