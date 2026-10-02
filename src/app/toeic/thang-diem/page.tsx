import Link from "next/link";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { BreadcrumbTrail } from "@/components/seo/breadcrumb-trail";
import { ToeicScoreCalculator } from "@/components/seo/toeic-score-calculator";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({
  title: "Thang điểm TOEIC 10–990: cách tính Listening và Reading",
  description: "Hiểu thang điểm TOEIC Listening & Reading: mỗi kỹ năng 5–495, tổng 10–990. Cộng điểm thành phần, tính khoảng cách mục tiêu và tránh bảng quy đổi số câu đúng thiếu căn cứ.",
  canonical: "/toeic/thang-diem",
});

const ETS_SCORE_GUIDE = "https://www.ets.org/pdfs/toeic/toeic-listening-reading-score-user-guide.pdf";
const ETS_DESCRIPTORS = "https://www.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-score-descriptors.pdf";

export default async function ToeicScorePage() {
  const user = await getCurrentUser();
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  return <main className="min-h-screen bg-[#f7f6f1] text-[#172821]">
    <PublicHeader locale={locale} signedIn={Boolean(user)} />
    <article className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16" lang="vi">
      <BreadcrumbTrail items={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Thang điểm TOEIC", path: "/toeic/thang-diem" }]} />
      <header className="mt-8 border-b border-[#dce3d9] pb-10">
        <p className="text-sm font-bold uppercase tracking-[.16em] text-[#245a43]">TOEIC Listening &amp; Reading</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Thang điểm TOEIC 10–990 và cách đọc đúng kết quả</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#45584d]">Listening và Reading được báo cáo riêng trên thang 5–495. Tổng điểm là phép cộng hai điểm thành phần, từ 10 đến 990. Số câu đúng được ETS quy đổi bằng quy trình thống kê để kết quả giữa các mã đề có ý nghĩa tương đương.</p>
      </header>

      <div className="grid gap-12 pt-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-12">
          <ToeicScoreCalculator locale={locale} />
          <section><h2 className="text-2xl font-black">Cách tính tổng điểm TOEIC</h2><p className="mt-4 leading-8 text-[#45584d]">Trên phiếu điểm, lấy điểm scaled score Listening cộng với điểm scaled score Reading. Ví dụ Listening 350 và Reading 300 cho tổng 650. ETS xác nhận tổng scaled score được tạo bằng cách cộng hai điểm kỹ năng.</p><p className="mt-4 leading-8 text-[#45584d]">TOEIC Listening &amp; Reading không có một mốc “đậu” chung cho mọi nơi. Trường học, doanh nghiệp hoặc vị trí công việc tự đặt yêu cầu dựa trên nhu cầu sử dụng tiếng Anh. Hãy kiểm tra văn bản của đơn vị nhận chứng chỉ thay vì suy ra từ một bảng chung.</p></section>
          <section><h2 className="text-2xl font-black">Vì sao không có một bảng số câu đúng → điểm dùng cho mọi đề?</h2><p className="mt-4 leading-8 text-[#45584d]">ETS cho biết số câu đúng của từng kỹ năng được chuyển sang thang 5–495 bằng một quy trình thống kê nhằm duy trì ý nghĩa điểm giữa các lần thi. Vì vậy, một bảng quy đổi lưu truyền trên mạng chỉ có thể là ước lượng hoặc thuộc một tài liệu cụ thể; không nên dùng nó để khẳng định điểm chính thức cho mọi mã đề.</p><p className="mt-4 leading-8 text-[#45584d]">Bạn có thể dùng số câu đúng trong bài luyện để theo dõi độ chính xác, nhưng hãy ghi rõ đó là kết quả luyện tập. TOEIC GYM không đổi độ chính xác của bài ngắn thành điểm TOEIC chính thức.</p></section>
          <section><h2 className="text-2xl font-black">Đọc hai điểm thành phần trước khi nhìn tổng</h2><p className="mt-4 leading-8 text-[#45584d]">Hai người cùng tổng 650 có thể có nhu cầu ôn khác nhau nếu một người mạnh Listening còn người kia mạnh Reading. So sánh hai kỹ năng, sau đó xem phần “Abilities Measured” hoặc mô tả năng lực trên báo cáo để tìm thao tác còn yếu. ETS cũng công bố mô tả năng lực Listening và Reading theo các vùng điểm tham chiếu.</p><div className="mt-5 flex flex-wrap gap-3"><Link className="inline-flex min-h-11 items-center rounded-md bg-[#245a43] px-5 font-bold text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#245a43]" href="/diagnostic">Đánh giá điểm mạnh theo Part</Link><Link className="inline-flex min-h-11 items-center rounded-md border border-[#245a43] px-5 font-bold text-[#245a43] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#245a43]" href="/blog/chien-luoc-tang-diem-toeic-450-den-700">Lập kế hoạch 450 → 700</Link></div></section>
        </div>
        <aside className="h-fit rounded-2xl border border-[#cbd9cd] bg-white p-6 lg:sticky lg:top-6">
          <h2 className="text-lg font-black">Nguồn đối chiếu</h2>
          <ul className="mt-4 space-y-4 text-sm leading-6"><li><a className="font-bold text-[#245a43] underline underline-offset-4" href={ETS_SCORE_GUIDE} rel="noopener noreferrer" target="_blank">ETS Score User Guide</a><p className="mt-1 text-[#45584d]">Cấu trúc đề, cách tạo scaled score, tổng điểm và cách sử dụng kết quả.</p></li><li><a className="font-bold text-[#245a43] underline underline-offset-4" href={ETS_DESCRIPTORS} rel="noopener noreferrer" target="_blank">ETS Score Descriptors</a><p className="mt-1 text-[#45584d]">Mô tả điểm mạnh và điểm cần cải thiện quanh các vùng điểm tham chiếu.</p></li><li><Link className="font-bold text-[#245a43] underline underline-offset-4" href="/toeic">Cấu trúc bài thi TOEIC</Link><p className="mt-1 text-[#45584d]">Xem 7 Part, số câu và đường dẫn luyện từng phần.</p></li></ul>
        </aside>
      </div>
      <p className="mt-12 text-xs leading-6 text-[#45584d]">TOEIC GYM là nền tảng luyện tập độc lập, không liên kết với ETS/IIG. Công cụ trên chỉ cộng điểm thành phần bạn nhập; không phát hành hoặc dự đoán điểm thi chính thức.</p>
    </article>
    <PublicFooter locale={locale} />
  </main>;
}
