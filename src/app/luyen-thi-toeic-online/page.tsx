import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Markdown } from "@/components/blog/markdown";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { managedMetadata } from "@/components/seo/managed-page";
import { getCurrentUser } from "@/lib/auth/session";
import { getPostRedirect, getPublishedPost } from "@/lib/blog/service";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { ONLINE_STUDY_LOOP, ONLINE_STUDY_SIGNALS, ONLINE_STUDY_STARTS, onlineStudyHubStructuredData } from "@/lib/seo/online-study-hub";
import { serializeStructuredData } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("seo-online"); }

const focusClass = "outline-offset-4 focus-visible:outline-3 focus-visible:outline-teal-800";

export default async function Page() {
  const destination = await getPostRedirect("seo-online");
  if (destination) permanentRedirect(destination);
  const [post, user, locale] = await Promise.all([getPublishedPost("seo-online"), getCurrentUser(), getCookieLanguage()]);
  if (!post) notFound();

  return <OnlineStudyContent locale={locale} post={post} signedIn={Boolean(user)} />;
}

function OnlineStudyContent({ locale, post, signedIn }: { locale: InterfaceLanguage; post: { title: string; excerpt: string; content: string }; signedIn: boolean }) {
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale={locale} signedIn={signedIn} />
    <script dangerouslySetInnerHTML={{ __html: serializeStructuredData(onlineStudyHubStructuredData()) }} type="application/ld+json" />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: locale === "vi" ? "Trang chủ" : "Home", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: locale === "vi" ? "Luyện thi online" : "Online study guide", path: "/luyen-thi-toeic-online" }]} />

      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-black uppercase tracking-[.16em] text-teal-800">TOEIC GYM · Lộ trình online</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">{post.title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{post.excerpt}</p>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">Bạn không cần hoàn thành toàn bộ thư viện trước khi tiến bộ. Hãy lấy một kết quả ban đầu, chọn một lỗi lặp lại, luyện bằng nội dung mới rồi mới tăng độ dài bài.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link className={`inline-flex min-h-12 items-center justify-center rounded-lg bg-teal-800 px-6 font-black text-white hover:bg-teal-900 ${focusClass}`} href="/diagnostic">Tìm Part cần ưu tiên <span className="ml-3" aria-hidden="true">→</span></Link>
          <Link className={`inline-flex min-h-12 items-center justify-center rounded-lg border border-teal-800 px-6 font-black text-teal-900 hover:bg-white ${focusClass}`} href="/try#quick-practice">Thử bài 7–10 phút</Link>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">Hai lựa chọn đều mở cho người chưa đăng nhập. Kết quả là độ chính xác luyện tập, không phải điểm TOEIC chính thức hoặc dự đoán điểm.</p>
      </header>

      <section aria-labelledby="start-title" className="mt-12">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Chọn đúng điểm bắt đầu</p><h2 className="mt-2 text-3xl font-black" id="start-title">Bạn đang ở tình huống nào?</h2><p className="mt-4 leading-8 text-slate-700">Chọn tình huống gần nhất thay vì bắt đầu từ bài dài nhất. Mỗi tuyến dưới đây trả lời một câu hỏi học tập khác nhau.</p></div>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          {ONLINE_STUDY_STARTS.map((item, index) => <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6" key={item.id}>
            <p className="text-sm font-black tabular-nums text-teal-800">0{index + 1}</p>
            <h3 className="mt-2 text-xl font-black">{item.situation}</h3>
            <p className="mt-3 leading-7 text-slate-700">{item.action}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
            <Link className={`mt-auto inline-flex min-h-11 items-center pt-5 font-black text-teal-800 underline decoration-2 underline-offset-4 hover:text-teal-950 ${focusClass}`} href={item.href}>{item.cta} <span className="ml-2" aria-hidden="true">→</span></Link>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="loop-title" className="mt-14 rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] lg:gap-12">
          <div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-300">Vòng học 4 bước</p><h2 className="mt-2 text-3xl font-black" id="loop-title">Đừng dừng ở việc xem đáp án</h2><p className="mt-4 leading-7 text-slate-300">Tiến bộ chỉ đáng tin khi bạn áp dụng được cách sửa vào câu chưa gặp. Một vòng học có thể hoàn thành trong vài buổi ngắn.</p></div>
          <ol className="grid gap-5 sm:grid-cols-2">{ONLINE_STUDY_LOOP.map(([title, detail], index) => <li className="border-l-2 border-teal-400 pl-4" key={title}><span className="text-sm font-black text-teal-300">BƯỚC {index + 1}</span><h3 className="mt-1 font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p></li>)}</ol>
        </div>
      </section>

      <section aria-labelledby="week-title" className="mt-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Mẫu tuần tối thiểu</p><h2 className="mt-2 text-3xl font-black" id="week-title">Ba buổi vẫn đủ để tạo một vòng phản hồi</h2><div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-slate-300 bg-slate-300 sm:grid-cols-3"><article className="bg-white p-5"><p className="text-sm font-black text-teal-800">BUỔI 1 · ĐO</p><h3 className="mt-2 text-lg font-black">Làm câu mới</h3><p className="mt-2 text-sm leading-6 text-slate-700">Chọn Listening hoặc Reading, ghi độ chính xác, thời gian và câu đúng do đoán.</p></article><article className="bg-white p-5"><p className="text-sm font-black text-teal-800">BUỔI 2 · SỬA</p><h3 className="mt-2 text-lg font-black">Luyện một lỗi</h3><p className="mt-2 text-sm leading-6 text-slate-700">Học đúng tín hiệu đã bỏ lỡ và giải thích được vì sao phương án cũ sai.</p></article><article className="bg-white p-5"><p className="text-sm font-black text-teal-800">BUỔI 3 · THỬ LẠI</p><h3 className="mt-2 text-lg font-black">Dùng nội dung khác</h3><p className="mt-2 text-sm leading-6 text-slate-700">Làm câu tương đương chưa gặp, rồi quyết định giữ mục tiêu hay chuyển lỗi khác.</p></article></div></div>
          <aside className="h-fit rounded-2xl border border-teal-200 bg-white p-6"><h2 className="text-xl font-black">Muốn lập lịch chi tiết?</h2><p className="mt-3 text-sm leading-6 text-slate-700">Dùng checklist năm buổi để ghi hai mục tiêu, kết quả từng buổi và việc cần đổi ở tuần sau. Có bản in và PDF trống.</p><Link className={`mt-5 inline-flex min-h-11 items-center font-black text-teal-800 underline decoration-2 underline-offset-4 ${focusClass}`} href="/toeic/checklist-hoc-tuan">Mở checklist tuần học <span className="ml-2" aria-hidden="true">→</span></Link></aside>
        </div>
      </section>

      <section aria-labelledby="signals-title" className="mt-14 border-t border-slate-300 pt-10">
        <div className="max-w-3xl"><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Theo dõi dữ liệu có ích</p><h2 className="mt-2 text-3xl font-black" id="signals-title">Bốn tín hiệu tốt hơn một con số tổng</h2><p className="mt-4 leading-8 text-slate-700">Điểm luyện tập chỉ có ý nghĩa khi bạn biết nó đến từ câu mới hay câu cũ, làm trong bao lâu và lỗi nào vẫn còn lặp lại.</p></div>
        <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-300 bg-white"><table className="w-full min-w-[44rem] border-collapse text-left"><thead className="bg-slate-100 text-sm"><tr><th className="px-5 py-4 font-black" scope="col">Tín hiệu</th><th className="px-5 py-4 font-black" scope="col">Cách ghi</th><th className="px-5 py-4 font-black" scope="col">Điều bạn biết được</th></tr></thead><tbody className="divide-y divide-slate-200">{ONLINE_STUDY_SIGNALS.map(([signal, record, meaning]) => <tr key={signal}><th className="px-5 py-4 align-top font-black" scope="row">{signal}</th><td className="px-5 py-4 align-top text-sm leading-6 text-slate-700">{record}</td><td className="px-5 py-4 align-top text-sm leading-6 text-slate-700">{meaning}</td></tr>)}</tbody></table></div>
      </section>

      <section aria-labelledby="guide-title" className="mt-14 grid gap-10 border-t border-slate-300 pt-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div><p className="text-sm font-black uppercase tracking-[.14em] text-teal-800">Hướng dẫn chi tiết</p><h2 className="mt-2 text-3xl font-black" id="guide-title">Tổ chức một buổi luyện online hiệu quả</h2><Markdown content={post.content} /></div>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-6"><h2 className="text-lg font-black">Đi nhanh đến tài nguyên</h2><ul className="mt-4 space-y-4 text-sm leading-6 text-slate-700"><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/listening">Listening Part 1–4</Link><span className="mt-1 block">Audio mẫu, transcript và tuyến sửa lỗi theo Part.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/toeic/part-5/practice">Reading Part 5</Link><span className="mt-1 block">Bài hỗn hợp có lời giải theo từng dạng lỗi.</span></li><li><Link className={`font-black text-teal-800 underline underline-offset-4 ${focusClass}`} href="/thi-thu-toeic-online">Thi thử online</Link><span className="mt-1 block">So sánh bài nhanh và mock dài theo mục tiêu.</span></li></ul></aside>
      </section>

      <p className="mt-12 text-sm leading-6 text-slate-600">TOEIC GYM là nền tảng luyện tập độc lập, không liên kết hoặc được ETS/IIG bảo trợ. Bài luyện và bài đánh giá không phát hành điểm TOEIC chính thức. Cấu trúc đề được đối chiếu với <a className={`font-bold text-teal-800 underline underline-offset-4 ${focusClass}`} href="https://www.ets.org/toeic/about/listening-reading.html" rel="noopener noreferrer" target="_blank">mô tả TOEIC Listening &amp; Reading của ETS</a>.</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
