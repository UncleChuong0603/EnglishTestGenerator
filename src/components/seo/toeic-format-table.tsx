import Link from "next/link";
import { TOEIC_FORMAT_ROWS, TOEIC_SECTION_TIMES, toeicFormatTotals } from "@/lib/seo/toeic-format";

export function ToeicFormatTable({ id, tone = "light" }: { id?: string; tone?: "light" | "dark" } = {}) {
  const totals = toeicFormatTotals();
  const dark = tone === "dark";
  return <section aria-labelledby="toeic-format-title" className={`mt-10 rounded-2xl border p-5 sm:p-8 ${dark ? "border-[#315c4d] bg-[#0b211b] text-[#eef9f2]" : "border-[#cbd9cd] bg-white"}`} id={id}>
    <p className={`text-sm font-bold uppercase tracking-[.14em] ${dark ? "text-[#7be5bd]" : "text-[#245a43]"}`}>Cấu trúc chính thức</p>
    <h2 className="mt-2 text-2xl font-black leading-snug" id="toeic-format-title">7 Part, 200 câu trong 120 phút làm bài</h2>
    <p className={`mt-3 max-w-3xl leading-7 ${dark ? "text-[#a9c0b5]" : "text-[#45584d]"}`}>Listening có {totals.Listening} câu trong khoảng {TOEIC_SECTION_TIMES.Listening} phút; Reading có {totals.Reading} câu trong {TOEIC_SECTION_TIMES.Reading} phút. Thời gian làm bài là 2 giờ, chưa tính thủ tục và phần thông tin cá nhân tại điểm thi.</p>
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
        <caption className="sr-only">Số câu và dạng bài của bảy Part TOEIC Listening và Reading</caption>
        <thead><tr className={`border-b-2 ${dark ? "border-[#7be5bd] text-[#eef9f2]" : "border-[#245a43] text-[#172821]"}`}><th className="px-3 py-3 font-black" scope="col">Phần</th><th className="px-3 py-3 font-black" scope="col">Part</th><th className="px-3 py-3 font-black" scope="col">Dạng bài</th><th className="px-3 py-3 text-right font-black" scope="col">Số câu</th></tr></thead>
        <tbody>{TOEIC_FORMAT_ROWS.map((row) => <tr className={`border-b ${dark ? "border-[#21463b]" : "border-[#dce3d9]"}`} key={row.part}><td className="px-3 py-3 font-bold">{row.section}</td><td className="px-3 py-3">Part {row.part}</td><td className="px-3 py-3">{row.task}</td><td className="px-3 py-3 text-right tabular-nums">{row.questions}</td></tr>)}</tbody>
        <tfoot><tr className={`font-black ${dark ? "bg-[#102d25]" : "bg-[#e7eee8]"}`}><th className="px-3 py-3" colSpan={3} scope="row">Tổng</th><td className="px-3 py-3 text-right tabular-nums">{totals.all}</td></tr></tfoot>
      </table>
    </div>
    <p className={`mt-5 text-sm leading-6 ${dark ? "text-[#a9c0b5]" : "text-[#45584d]"}`}>Nguồn: <a className={`font-bold underline underline-offset-4 ${dark ? "text-[#7be5bd]" : "text-[#245a43]"}`} href="https://www.ets.org/pdfs/toeic/toeic-listening-reading-score-user-guide.pdf" rel="noopener noreferrer" target="_blank">ETS TOEIC Listening &amp; Reading Score User Guide</a>. Xem thêm <Link className={`font-bold underline underline-offset-4 ${dark ? "text-[#7be5bd]" : "text-[#245a43]"}`} href="/toeic/thang-diem">cách đọc thang điểm TOEIC</Link>.</p>
  </section>;
}
