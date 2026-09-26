import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { getCurrentUser } from "@/lib/auth/session";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { VerbTenseSample } from "./verb-tense-sample";

export const metadata = publicPageMetadata({
  title: "Bài tập thì động từ TOEIC Part 5 có đáp án",
  description: "Luyện 5 câu thì động từ TOEIC Part 5 miễn phí: quá khứ đơn, hiện tại hoàn thành, quá khứ hoàn thành và các dấu hiệu thời gian, có lời giải.",
  canonical: "/toeic/part-5/thi-dong-tu",
});

export default async function Page() {
  const user = await getCurrentUser();
  return <main className="min-h-screen bg-[#f7f6f1] text-slate-900">
    <PublicHeader locale="vi" signedIn={Boolean(user)} />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Part 5", path: "/toeic/part-5" }, { name: "Thì động từ", path: "/toeic/part-5/thi-dong-tu" }]} />
      <header className="mt-8 border-b border-slate-300 pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-teal-800">TOEIC Reading · Part 5</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Bài tập thì động từ TOEIC Part 5 có đáp án</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">Chọn dạng động từ đúng không chỉ bằng một từ chỉ thời gian. Bạn cần xác định sự kiện đã kết thúc, còn kéo dài hay xảy ra trước một sự kiện khác. Luyện 5 câu dưới đây, rồi xem vì sao từng đáp án phù hợp.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-6 font-bold text-white" href="#bai-tap">Làm 5 câu ngay <span aria-hidden="true" className="ml-3">↓</span></Link>
      </header>
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="space-y-9 leading-8 text-slate-700">
          <section><h2 className="text-2xl font-black text-slate-900">Ba câu hỏi trước khi nhìn đáp án</h2><ol className="mt-4 list-decimal space-y-2 pl-6"><li><strong>Thời điểm nào?</strong> Yesterday hoặc last Monday thường báo một mốc quá khứ đã kết thúc; since 2021 có thể báo việc bắt đầu trước và còn liên quan hiện tại.</li><li><strong>Việc nào xảy ra trước?</strong> Khi có hai mốc quá khứ, đọc cả hai vế để xem hành động nào đã hoàn tất trước hành động còn lại.</li><li><strong>Ai thực hiện hành động?</strong> Nếu chủ ngữ là thứ nhận hành động, đáp án có thể cần dạng bị động như <em>will be sent</em>.</li></ol></section>
          <section><h2 className="text-2xl font-black text-slate-900">Đừng chọn chỉ vì thấy một từ khóa</h2><p className="mt-4">Một câu có <em>tomorrow</em> chưa chắc chỉ kiểm tra thì tương lai: bạn vẫn phải xem chủ ngữ có gửi hay được gửi. Tương tự, <em>since</em> có thể mang nhiều nghĩa; hãy đọc cả cấu trúc và ý câu. Với Part 5, loại nhanh phương án sai về thời gian hoặc cấu trúc, rồi đọc lại toàn câu để kiểm tra nghĩa.</p></section>
          <VerbTenseSample />
          <section><h2 className="text-2xl font-black text-slate-900">Luyện tiếp sau khi xem lời giải</h2><p className="mt-4">Với mỗi câu sai, ghi hai mẩu thông tin: dấu hiệu bạn đã bỏ qua và dạng động từ đúng. Thử làm lại sau vài ngày, sau đó chuyển sang bộ câu Part 5 trộn nhiều dạng để kiểm tra bạn còn nhận ra tín hiệu khi không biết trước chủ đề.</p><div className="mt-5 flex flex-wrap gap-3"><Link className="inline-flex min-h-12 items-center rounded-lg bg-teal-800 px-5 font-bold text-white" href="/challenge/part-5">Làm 10 câu Part 5</Link><Link className="inline-flex min-h-12 items-center rounded-lg border border-teal-800 px-5 font-bold text-teal-900" href="/toeic/part-5/word-form">Thử dạng Word Form</Link></div></section>
        </div>
        <aside className="h-fit rounded-2xl bg-[#e7eee8] p-6 lg:sticky lg:top-6"><h2 className="text-lg font-black">Học tiếp</h2><ul className="mt-4 space-y-4"><li><Link className="font-bold text-teal-900 underline" href="/blog/thi-va-dang-dong-tu-toeic">Thì và dạng động từ trong TOEIC</Link><p className="mt-1 text-sm leading-6">Đọc thêm cách nhận ra mốc thời gian và dạng động từ.</p></li><li><Link className="font-bold text-teal-900 underline" href="/toeic/part-5">Tổng quan Part 5</Link><p className="mt-1 text-sm leading-6">Xem cách xử lý cả câu ngữ pháp lẫn từ vựng.</p></li></ul></aside>
      </div>
      <p className="mt-12 text-xs text-slate-600">Các câu luyện tập trên do TOEIC GYM tự biên soạn, không phải câu hỏi ETS.</p>
    </article>
    <PublicFooter locale="vi" />
  </main>;
}
