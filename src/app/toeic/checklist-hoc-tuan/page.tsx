import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { PrintChecklistButton } from "@/components/seo/print-checklist-button";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import styles from "./page.module.css";

export const metadata = publicPageMetadata({
  title: "Checklist học TOEIC một tuần: mẫu in và PDF miễn phí",
  description: "Lập tuần học TOEIC với hai mục tiêu, năm buổi luyện và review lỗi. Điền checklist rồi in hoặc tải PDF trống miễn phí, không cần tài khoản.",
  canonical: "/toeic/checklist-hoc-tuan",
});

const sessions = [
  { title: "Kỹ năng Reading", task: "Chọn một lỗi lặp lại, làm câu mới và chỉ ra tín hiệu hoặc câu chứa bằng chứng." },
  { title: "Kỹ năng Listening", task: "Nghe và trả lời trước khi xem transcript. Nghe lại, ghi cụm từ hoặc ý đã bỏ lỡ." },
  { title: "Luyện hỗn hợp", task: "Trộn dạng câu. Ghi thời gian thực tế và đánh dấu câu đúng do đoán." },
  { title: "Thử lại bằng câu mới", task: "Kiểm tra lỗi đã chọn ở buổi 1–2 bằng nội dung khác, rồi giải thích đáp án." },
  { title: "Review và chọn tuần sau", task: "Chọn vài lỗi còn lặp lại. Viết cách sửa và một việc cụ thể cho buổi tiếp theo." },
];

const linkStyle = "font-semibold text-[#245a43] underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-4";

export default async function Page() {
  const [user, locale] = await Promise.all([getCurrentUser(), getCookieLanguage()]);
  return <main className={styles.page}>
    <div className={styles.screenOnly}><PublicHeader locale={locale} signedIn={Boolean(user)} showPrimary={false} /></div>
    <article lang="vi" className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <header className={styles.screenOnly}>
        <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Checklist tuần học", path: "/toeic/checklist-hoc-tuan" }]} />
        <p className="mt-8 text-sm font-bold uppercase tracking-wider text-[#245a43]">Tài nguyên học tập · TOEIC GYM</p>
        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Checklist học TOEIC một tuần</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#45584d]">Biến lỗi sai thành hai mục tiêu và năm buổi học có việc cụ thể. Điền mẫu rồi in, hoặc tải PDF trống để viết tay. Không cần tài khoản.</p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <PrintChecklistButton locale={locale} />
          <a className={`${linkStyle} inline-flex min-h-12 items-center`} href="/seo/toeic-checklist-hoc-tuan.pdf" download>{locale === "vi" ? "Tải mẫu PDF trống (A4)" : "Download blank PDF (A4)"}</a>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#45584d]">Thông tin điền trên trang không được lưu khi tải lại. Dùng chức năng in của trình duyệt và chọn “Lưu dưới dạng PDF” nếu muốn giữ bản đã điền.</p>
        <noscript><p className="mt-3 text-sm">Bạn có thể tải mẫu PDF hoặc dùng lệnh In của trình duyệt để in trang này.</p></noscript>
        <section className="mt-10 border-t border-[#dce3d9] pt-6">
          <h2 className="text-2xl font-bold">Chọn mục tiêu trước khi lập lịch</h2>
          <ol className="mt-4 list-decimal space-y-3 pl-5 leading-7 text-[#45584d]">
            <li>Làm một bài chưa biết đáp án, ghi số câu đúng/tổng câu và thời gian. Chọn một lỗi Reading và một lỗi Listening rõ nhất.</li>
            <li>Đặt mục tiêu bằng thao tác: “nhận diện mệnh đề sau because” hoặc “nghe được lý do đổi lịch”, thay vì chỉ ghi “tăng điểm”.</li>
            <li>Điền thời lượng phù hợp với lịch thật. Mẫu gợi ý năm buổi 30–45 phút; nếu chỉ có ba buổi, giữ một buổi kỹ năng, một buổi nghe/đọc và một buổi review.</li>
          </ol>
        </section>
      </header>

      <section className={`${styles.sheet} mt-8 rounded-md border border-[#dce3d9] bg-white p-5 sm:p-8`} aria-labelledby="worksheet-title">
        <p className={`${styles.printOnly} text-sm font-bold`}>TOEIC GYM · Tài nguyên tự biên soạn</p>
        <h2 id="worksheet-title" className="text-2xl font-black">Kế hoạch tuần của bạn</h2>
        <p className="mt-2 text-sm leading-6 text-[#45584d]">Tích buổi đã hoàn thành. Kết quả ghi: số câu đúng/tổng câu mới, số câu đúng do đoán, thời gian và lỗi cần sửa.</p>
        <div className={`${styles.goals} mt-5 grid gap-4 sm:grid-cols-2`}>
          <label className={styles.field}>Tuần bắt đầu (ngày/tháng)<input name="week-start" type="text" placeholder="Ví dụ: 05/10" autoComplete="off" /></label>
          <label className={styles.field}>Thời lượng dự kiến mỗi buổi<input name="session-duration" type="text" placeholder="Ví dụ: 30 phút" autoComplete="off" /></label>
          <label className={styles.field}>Mục tiêu Reading<input name="reading-goal" type="text" placeholder="Ví dụ: because / because of" autoComplete="off" /></label>
          <label className={styles.field}>Mục tiêu Listening<input name="listening-goal" type="text" placeholder="Ví dụ: nghe lý do đổi lịch họp" autoComplete="off" /></label>
        </div>
        <ol className="mt-6">
          {sessions.map((session, index) => <li key={session.title} className={styles.session}>
            <label className={styles.completion}><input type="checkbox" name={`session-${index + 1}-done`} /><span>Buổi {index + 1} · {session.title}</span></label>
            <p className="mt-1 text-sm leading-6 text-[#45584d]">{session.task}</p>
            <label className={`${styles.field} mt-2`}>Kết quả buổi {index + 1}<input name={`session-${index + 1}-result`} type="text" placeholder="4/6 đúng · 1 do đoán · 8 phút" autoComplete="off" /></label>
          </li>)}
        </ol>
        <label className={`${styles.field} mt-5`}>Lỗi còn lặp lại và việc sẽ đổi tuần sau<textarea name="next-week-action" rows={2} placeholder="Ví dụ: còn nhầm however; ôn dấu câu rồi thử câu mới." /></label>
        <p className="mt-4 text-xs leading-5 text-[#45584d]">Mẫu theo dõi việc học, không quy đổi độ chính xác thành điểm TOEIC. TOEIC GYM là nền tảng độc lập, không liên kết với ETS.</p>
        <p className="mt-2 text-xs leading-5 text-[#45584d]">Nguồn: toeicgym.net/toeic/checklist-hoc-tuan · Có thể in và chia sẻ miễn phí bản nguyên vẹn kèm nguồn TOEIC GYM.</p>
      </section>

      <div className={`${styles.screenOnly} mt-10 space-y-8`}>
        <section>
          <h2 className="text-2xl font-bold">Ví dụ ghi kết quả để chọn buổi sau</h2>
          <p className="mt-3 leading-8 text-[#45584d]">“4/6 câu mới đúng, 1 câu đúng do đoán, 8 phút; nhầm however với although” cho thấy cần ôn dấu câu và mệnh đề. “Đã học ngữ pháp” chưa cho biết nên luyện gì tiếp. Nếu làm lại câu cũ, ghi là ôn tập, không so với kết quả trên câu mới.</p>
        </section>
        <section className="border-t border-[#dce3d9] pt-6">
          <h2 className="text-2xl font-bold">Bắt đầu buổi đầu tiên</h2>
          <ul className="mt-4 space-y-4 leading-7 text-[#45584d]">
            <li><Link className={linkStyle} href="/toeic/part-5/practice">Làm bảy câu Part 5 hỗn hợp</Link>: chọn lỗi Reading cần đưa vào tuần học.</li>
            <li><Link className={linkStyle} href="/toeic/listening">Chọn bài nghe mẫu Part 1–4</Link>: trả lời rồi đối chiếu transcript và lời giải.</li>
            <li><Link className={linkStyle} href="/blog/chien-luoc-tang-diem-toeic-450-den-700">Đọc lộ trình TOEIC 450–700</Link>: điều chỉnh khối lượng theo đầu vào và thời gian.</li>
            <li><Link className={linkStyle} href="/blog/cach-review-loi-sai-toeic">Viết sổ lỗi bốn dòng</Link>: lưu cách sửa cho buổi review.</li>
          </ul>
        </section>
      </div>
    </article>
    <div className={styles.screenOnly}><PublicFooter locale={locale} /></div>
  </main>;
}
