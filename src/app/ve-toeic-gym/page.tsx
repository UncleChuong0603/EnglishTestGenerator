import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { getSiteUrl } from "@/lib/seo/site-url";
import { serializeStructuredData } from "@/lib/seo/structured-data";
import { toeicGymOrganizationStructuredData } from "@/lib/seo/site-structured-data";

export const metadata = publicPageMetadata({
  title: "Về TOEIC GYM: phương pháp luyện và nguồn nội dung",
  description: "Tìm hiểu TOEIC GYM, cách xây dựng câu hỏi và lời giải, giới hạn kết quả, nguồn nội dung và cách gửi phản hồi.",
  canonical: "/ve-toeic-gym",
});

const copy = {
  vi: {
    eyebrow: "MINH BẠCH NỘI DUNG",
    title: "Về TOEIC GYM",
    intro: "TOEIC GYM là nền tảng luyện TOEIC độc lập. Chúng tôi nối bài làm, lời giải và bước ôn tiếp theo để người học biết mình nên làm gì sau mỗi câu hỏi.",
    sections: [
      { title: "TOEIC GYM giúp người học làm gì?", body: "Bạn có thể bắt đầu bằng bài ngắn không cần tài khoản, luyện theo Listening và Reading Part 1–7, đọc lời giải, rồi chọn nội dung tiếp theo dựa trên lỗi vừa gặp. Kết quả trên bài luyện là độ chính xác thô; không phải điểm TOEIC chính thức và không được dùng để dự đoán điểm thi." },
      { title: "Nội dung được xây dựng như thế nào?", body: "Câu hỏi mẫu công khai do TOEIC GYM tự biên soạn theo tình huống công việc và thao tác của từng Part. Lời giải chỉ ra tín hiệu trong câu, bằng chứng trong tài liệu hoặc lý do loại lựa chọn. Các trang hướng dẫn ghi rõ nguồn tham khảo khi có sử dụng tài liệu bên ngoài; ví dụ và bài luyện của TOEIC GYM không sao chép đề ETS." },
      { title: "Cách kiểm tra một nội dung trước khi xuất bản", body: "Mỗi trang công khai được kiểm tra cấu trúc tiêu đề, canonical, breadcrumb, liên kết nội bộ, trạng thái hiển thị và cách hoạt động của bài luyện. Bộ kiểm tra nội dung cũng xác nhận mỗi lựa chọn có lý do giải thích. Khi nội dung được sửa đáng kể, ngày cập nhật được thay đổi để phản ánh lần sửa đó." },
      { title: "Phản hồi và giới hạn", body: "Nếu thấy câu hỏi, transcript hoặc liên kết có vấn đề, bạn có thể gửi phản hồi ở Trung tâm hỗ trợ. Nội dung có thể được chỉnh sửa khi phát hiện lỗi; việc có mặt trên trang không bảo đảm một URL sẽ đứng hạng cao hoặc được Google lập chỉ mục ngay." },
    ],
    nextTitle: "Bắt đầu từ một việc cụ thể",
    next: [
      ["Làm bài luyện miễn phí", "/try", "Thử một nhóm câu và xem lời giải trước khi tạo tài khoản."],
      ["Xem hướng dẫn theo Part", "/toeic", "Chọn Listening hoặc Reading theo dạng bài cần luyện."],
      ["Dùng checklist tuần học", "/toeic/checklist-hoc-tuan", "Ghi mục tiêu, kết quả trên câu mới và lỗi cần sửa."],
      ["Đọc thư viện TOEIC", "/blog", "Tìm bài về ngữ pháp, từ vựng, Listening, Reading và chiến lược."],
    ],
    cta: "Thử bài luyện miễn phí",
  },
  en: {
    eyebrow: "CONTENT TRANSPARENCY",
    title: "About TOEIC GYM",
    intro: "TOEIC GYM is an independent TOEIC practice platform. We connect questions, explanations and the next review step so learners know what to do after each answer.",
    sections: [
      { title: "What can learners do here?", body: "Start with a short set without an account, practice Listening and Reading Parts 1–7, read explanations and choose the next activity from the mistake just reviewed. Practice results are raw accuracy, not official TOEIC scores and not a score prediction." },
      { title: "How is the content made?", body: "Public sample questions are written by TOEIC GYM around workplace situations and the task in each Part. Explanations point to a sentence signal, evidence in a document or the reason each distractor fails. Pages disclose outside references when used; TOEIC GYM examples and practice items do not reproduce ETS tests." },
      { title: "What is checked before publication?", body: "Each public page is checked for headings, canonical URL, breadcrumbs, internal links, visibility and the behavior of its exercise. The content checks also require a reason for every answer option. A substantial revision receives a new modification date that reflects that work." },
      { title: "Feedback and limits", body: "If a question, transcript or link looks wrong, send feedback through the Support Center. Content can be corrected when an issue is found; being published does not guarantee a URL will rank highly or be indexed immediately by Google." },
    ],
    nextTitle: "Start with one useful action",
    next: [
      ["Try free practice", "/try", "Complete a short set and read the explanations before creating an account."],
      ["Explore by Part", "/toeic", "Choose a Listening or Reading task to practice."],
      ["Use the weekly checklist", "/toeic/checklist-hoc-tuan", "Record goals, results on new questions and the next mistake to fix."],
      ["Read the TOEIC library", "/blog", "Browse grammar, vocabulary, Listening, Reading and strategy guides."],
    ],
    cta: "Try free practice",
  },
} as const;

export default async function AboutToeicGymPage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  const t = copy[locale];
  const base = getSiteUrl();
  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "AboutPage", "@id": `${base}/ve-toeic-gym#about`, url: `${base}/ve-toeic-gym`, name: t.title, description: t.intro, about: { "@id": `${base}#organization` }, inLanguage: locale },
      toeicGymOrganizationStructuredData(base),
    ],
  };
  return <main className="min-h-screen bg-[#f7f6f1] text-[#172821]">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(aboutStructuredData) }} type="application/ld+json" />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14" lang={locale}>
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: t.title, path: "/ve-toeic-gym" }]} />
      <header className="mt-8 max-w-3xl border-b border-[#dce3d9] pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-[#245a43]">{t.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">{t.title}</h1>
        <p className="mt-5 text-lg leading-8 text-[#45584d]">{t.intro}</p>
      </header>
      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-10">
          {t.sections.map(section => <section key={section.title}><h2 className="text-2xl font-black leading-snug">{section.title}</h2><p className="mt-4 leading-8 text-[#45584d]">{section.body}</p></section>)}
        </div>
        <aside className="h-fit rounded-md border border-[#cbd9cd] bg-[#e7eee8] p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-black">{locale === "vi" ? "Liên kết chính thức" : "Official links"}</h2>
          <p className="mt-3 text-sm leading-6 text-[#45584d]">{locale === "vi" ? "Theo dõi thông tin và gửi phản hồi qua các kênh của TOEIC GYM." : "Follow updates and send feedback through TOEIC GYM channels."}</p>
          <div className="mt-5 grid gap-3 text-sm"><Link className="font-bold text-[#245a43] underline" href="/support">{locale === "vi" ? "Trung tâm hỗ trợ" : "Support Center"}</Link><a className="font-bold text-[#245a43] underline" href="https://www.facebook.com/profile.php?id=61594521208737" rel="noopener noreferrer" target="_blank">Facebook Page</a><a className="font-bold text-[#245a43] underline" href="https://www.facebook.com/groups/1632623558419538" rel="noopener noreferrer" target="_blank">Facebook Group</a></div>
        </aside>
      </div>
      <section className="mt-14 border-t border-[#dce3d9] pt-10" aria-labelledby="next-title">
        <h2 className="text-2xl font-black" id="next-title">{t.nextTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{t.next.map(([label, href, description]) => <Link className="rounded-md border border-[#cbd9cd] bg-white p-5 transition hover:border-[#245a43] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#245a43]" href={href} key={href}><h3 className="font-black text-[#245a43] underline">{label}</h3><p className="mt-2 text-sm leading-6 text-[#45584d]">{description}</p></Link>)}</div>
      </section>
      <section className="mt-14 rounded-md bg-[#172821] p-7 text-white sm:p-10"><h2 className="text-2xl font-black">{t.cta}</h2><p className="mt-3 max-w-2xl leading-7 text-[#dce3d9]">{locale === "vi" ? "Bắt đầu với một nhóm câu ngắn, xem lời giải và chọn việc cần ôn tiếp." : "Start with a short set, read the explanations and choose what to review next."}</p><Link className="mt-6 inline-flex min-h-12 items-center rounded-md bg-[#bfe5c9] px-5 font-bold text-[#172821] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#bfe5c9]" href="/try">{t.cta} <span aria-hidden="true" className="ml-3">→</span></Link></section>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
