import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { Part3Sample } from "./part-3-sample";

export const metadata = publicPageMetadata({
  title: "Luyện nghe TOEIC Part 3: hội thoại có audio và lời giải",
  description: "Tìm hiểu cách làm TOEIC Listening Part 3, nghe một hội thoại tự biên soạn và trả lời 3 câu miễn phí. Có transcript và giải thích đáp án.",
  canonical: "/toeic/part-3",
});

export default async function Page() {
  const user = await getCurrentUser();
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Part 3", path: "/toeic/part-3" }]} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">TOEIC Listening · Part 3</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Luyện nghe TOEIC Part 3 bằng hội thoại và lời giải</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Ở Part 3, bạn nghe một hội thoại rồi trả lời nhóm câu hỏi về mục đích, chi tiết và hành động tiếp theo. Bài nghe ngắn dưới đây giúp bạn thử quy trình nghe, kiểm tra đáp án và tìm bằng chứng trong transcript.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-bold text-white" href="#bai-nghe-mau">Nghe và làm 3 câu <span aria-hidden="true" className="ml-3">↓</span></Link>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-9 leading-8 text-slate-700">
          <section><h2 className="text-2xl font-black text-slate-900">Đọc câu hỏi trước để biết mình cần nghe gì</h2><p className="mt-4">Nhìn nhanh ba câu hỏi trước khi phát audio: câu thứ nhất hỏi bối cảnh, câu thứ hai hỏi vấn đề, câu thứ ba hỏi người nói sẽ làm gì. Bạn không cần dịch toàn bộ hội thoại trong đầu. Hãy ghi nhớ vài dấu mốc như sự kiện, người liên quan và hành động được hứa sẽ làm.</p></section>
          <section><h2 className="text-2xl font-black text-slate-900">Nghe ý và nhận ra cách diễn đạt lại</h2><p className="mt-4">Đáp án có thể dùng từ khác với câu bạn nghe. Trong bài mẫu, người nói bảo sẽ <em>ask the printer</em> gửi phong bì mới; đáp án diễn đạt việc đó thành <em>contact the printer</em>. Đừng chọn chỉ vì một từ trong phương án giống audio; kiểm tra cả ý và người thực hiện hành động.</p></section>
          <Part3Sample />
          <section><h2 className="text-2xl font-black text-slate-900">Sửa bài theo từng lỗi nghe</h2><p className="mt-4">Sau khi xem lời giải, phát lại hội thoại và dừng ở chỗ chứa bằng chứng. Nếu bạn nghe ra từ nhưng chọn sai, lỗi nằm ở cách hiểu quan hệ giữa các ý. Nếu bạn bỏ lỡ cả câu, thử nghe lại một lần trước khi mở transcript. Ghi đúng lý do sai sẽ hữu ích hơn việc chỉ nhớ ba chữ cái đáp án.</p><p className="mt-4">Khi đã quen một hội thoại, hãy chuyển sang <Link className="font-bold text-teal-800 underline" href="/try#quick-practice">bài thử Listening dài hơn</Link> để làm nhiều nhóm Part 3 và xem kết quả sau khi nộp. Bài mẫu ở đây không dự đoán điểm TOEIC chính thức.</p></section>
        </div>
        <aside className="h-fit rounded-2xl bg-[#e7eee8] p-6 lg:sticky lg:top-6"><h2 className="text-lg font-black">Học tiếp</h2><ul className="mt-4 space-y-4"><li><Link className="font-bold text-teal-900 underline" href="/blog/cach-luyen-nghe-toeic-part-3-4">Cách luyện nghe Part 3–4</Link><p className="mt-1 text-sm leading-6">Xem quy trình nghe lại và sửa lỗi bằng transcript.</p></li><li><Link className="font-bold text-teal-900 underline" href="/toeic">Tổng quan TOEIC</Link><p className="mt-1 text-sm leading-6">Đặt Part 3 vào lộ trình Listening và Reading.</p></li></ul></aside>
      </div>
      <p className="mt-12 text-xs text-slate-600">Audio, câu hỏi và lời giải mẫu do TOEIC GYM tự biên soạn. TOEIC GYM không liên kết với ETS.</p>
    </article>
    <PublicFooter locale="vi" />
  </main>;
}
