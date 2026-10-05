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
    <PublicHeader locale={locale} signedIn={Boolean(user)} tone="dark" />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(aboutStructuredData) }} type="application/ld+json" />
    <main id="main-content"><article className={styles.aboutArticle} lang={locale}>
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: t.title, path: "/ve-toeic-gym" }]} />
      <header className={styles.aboutHero}>
        <p className={styles.eyebrow}>{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
        <div className={styles.actions}><Link className={styles.primaryAction} href="/challenge/part-5">{locale === "vi" ? "Làm thử 10 câu miễn phí" : "Try 10 questions free"}<span aria-hidden="true">↗</span></Link><Link className={styles.secondaryAction} href="#about-features">{locale === "vi" ? "Xem tất cả tính năng" : "See all features"}<span aria-hidden="true">↓</span></Link></div>
      </header>
      <section aria-labelledby="adaptive-plan-title" className={styles.aboutSection} id="adaptive-plan">
        <div className={styles.aboutSplit}>
          <div>
            <p className={styles.eyebrow}>{t.adaptiveEyebrow}</p>
            <h2 className={styles.aboutHeading} id="adaptive-plan-title">{t.adaptiveTitle}</h2>
            <p className={styles.aboutLead}>{t.adaptiveLead}</p>
          </div>
          <div>
            <h3 className={styles.signalTitle}>{t.signalTitle}</h3>
            <ul className={styles.signalList}>
              {t.signals.map((signal, index) => <li key={signal}><span>{String(index + 1).padStart(2, "0")}</span><span>{signal}</span></li>)}
            </ul>
          </div>
        </div>
        <ol className={styles.aboutSteps}>
          {t.adaptiveSteps.map(([number, title, description]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></li>)}
        </ol>
      </section>
      <section aria-labelledby="about-features-title" className={styles.aboutSection} id="about-features">
        <div className={styles.aboutSectionHeader}><h2 id="about-features-title">{t.featuresTitle}</h2><p>{t.featuresLead}</p></div>
        <FeatureDirectory locale={locale} tone="dark" />
      </section>
      <section aria-labelledby="workflow-title" className={styles.aboutSection}>
        <div className={styles.aboutSectionHeader}><h2 id="workflow-title">{t.workflowTitle}</h2></div>
        <ol className={styles.workflowList}>{t.next.map(([label, href, description]) => <li key={href}><Link href={href}>{label}<span aria-hidden="true">↗</span></Link><p>{description}</p></li>)}</ol>
      </section>
      <section aria-labelledby="trust-title" className={styles.aboutSection}>
        <div className={styles.aboutSectionHeader}><h2 id="trust-title">{t.trustTitle}</h2></div>
        <div className={styles.trustGrid}>
        <div className={styles.trustCopy}>
          {t.sections.map(section => <section key={section.title}><h3>{section.title}</h3><p>{section.body}</p></section>)}
        </div>
        <aside className={styles.officialLinks}>
          <h2>{locale === "vi" ? "Liên kết chính thức" : "Official links"}</h2>
          <p>{locale === "vi" ? "Theo dõi thông tin và gửi phản hồi qua các kênh của TOEIC GYM." : "Follow updates and send feedback through TOEIC GYM channels."}</p>
          <div><Link href="/support">{locale === "vi" ? "Trung tâm hỗ trợ" : "Support Center"}</Link><a href="https://www.facebook.com/profile.php?id=61594521208737" rel="noopener noreferrer" target="_blank">Facebook Page</a><a href="https://www.facebook.com/groups/1632623558419538" rel="noopener noreferrer" target="_blank">Facebook Group</a></div>
        </aside>
        </div>
      </section>
      <section className={styles.aboutCta}><div><h2>{t.cta}</h2><p>{locale === "vi" ? "Bắt đầu với một nhóm câu ngắn, xem lời giải và tạo tín hiệu đầu tiên cho bài học được đề xuất." : "Start with a short set, read the explanations and create the first signal for a recommended next session."}</p></div><Link className={styles.primaryAction} href="/try">{t.cta} <span aria-hidden="true">→</span></Link></section>
    </article></main>
    <PublicFooter locale={locale} tone="dark" />
  </div>;
}
