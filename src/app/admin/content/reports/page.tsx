import Link from "next/link";
import { AdminFilterPanel } from "@/components/admin/admin-filter-panel";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { getPreferences } from "@/lib/i18n/get-translations";
import { QUESTION_REPORT_REASONS, QUESTION_REPORT_STATUSES, questionReportLabels, questionReportStatusLabels, type QuestionReportReason, type QuestionReportStatus } from "@/lib/question-reports/catalog";
import { listQuestionReports } from "@/lib/question-reports/service";
import { QuestionIssueReportsQueue } from "../similarity/page";

export default async function QuestionReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const initialQuery = await searchParams;
  if (initialQuery.type === "DUPLICATE") {
    return await QuestionIssueReportsQueue({ searchParams: Promise.resolve(initialQuery) });
  }
  const actor = await requireAdmin("CONTENT_READ");
  const [query, preferences] = await Promise.all([Promise.resolve(initialQuery), getPreferences(actor.id)]);
  const vi = preferences.interfaceLanguage === "vi";
  const status = query.status === undefined ? "OPEN" : query.status || undefined;
  const filters = { part: query.part ? Number(query.part) : undefined, reason: query.reason || undefined, status, page: Number(query.page) || 1 };
  const data = await listQuestionReports(filters);
  const activeFilterCount = Number(Boolean(filters.part)) + Number(Boolean(filters.reason)) + Number(Boolean(filters.status));
  const href = (page: number) => `/admin/content/reports?${new URLSearchParams(Object.entries({ ...query, page: String(page) }).filter((entry): entry is [string, string] => Boolean(entry[1])))}`;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 pb-16 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl">
    <AdminNav locale={preferences.interfaceLanguage} />
    <header className="mt-8"><p className="text-sm font-black uppercase tracking-wider text-teal-700">CONTENT QA</p><h1 className="mt-2 text-3xl font-black">{vi ? "Báo lỗi câu hỏi" : "Question reports"}</h1><p className="mt-2 max-w-3xl text-slate-600">{vi ? "Ưu tiên dựa trên số báo cáo đang mở và loại bằng chứng. Không có nội dung nào được AI tự sửa hoặc tự xuất bản." : "Priority reflects open report volume and issue evidence. Content is never auto-corrected or auto-published by AI."}</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-teal-700 px-4 font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/admin/content/reports?type=DUPLICATE&status=OPEN">{vi ? "Kiểm tra nghi trùng lặp" : "Review possible duplicates"} →</Link></header>
    <AdminFilterPanel activeCount={activeFilterCount} className="mt-5" clearHref="/admin/content/reports?status=OPEN" clearLabel={vi ? "Xóa bộ lọc" : "Clear filters"} label={vi ? "Bộ lọc" : "Filters"}>
      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-bold">Part<select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3" name="part" defaultValue={filters.part ?? ""}><option value="">{vi ? "Mọi Part" : "All Parts"}</option>{[1,2,3,4,5,6,7].map((part) => <option key={part} value={part}>Part {part}</option>)}</select></label>
        <label className="text-sm font-bold">{vi ? "Loại lỗi" : "Issue type"}<select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3" name="reason" defaultValue={filters.reason ?? ""}><option value="">{vi ? "Mọi loại" : "All types"}</option>{QUESTION_REPORT_REASONS.map((reason) => <option key={reason} value={reason}>{questionReportLabels[reason][preferences.interfaceLanguage]}</option>)}</select></label>
        <label className="text-sm font-bold">{vi ? "Trạng thái" : "Status"}<select className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3" name="status" defaultValue={filters.status ?? ""}><option value="">{vi ? "Mọi trạng thái" : "All statuses"}</option>{QUESTION_REPORT_STATUSES.map((item) => <option key={item} value={item}>{questionReportStatusLabels[item][preferences.interfaceLanguage]}</option>)}</select></label>
        <button className="min-h-11 self-end rounded-lg bg-slate-900 px-4 font-bold text-white">{vi ? "Áp dụng" : "Apply"}</button>
      </form>
    </AdminFilterPanel>
    <p className="mt-5 text-sm font-semibold text-slate-600">{data.total} {vi ? "báo cáo phù hợp" : "matching reports"}</p>
    <div className="mt-3 space-y-3">{data.rows.map((row) => {
      const priorityClass = row.priority === "HIGH" ? "bg-red-100 text-red-900" : row.priority === "MEDIUM" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700";
      const statusLabel = questionReportStatusLabels[row.status as QuestionReportStatus]?.[preferences.interfaceLanguage] ?? row.status;
      const reasonLabel = questionReportLabels[row.reason as QuestionReportReason]?.[preferences.interfaceLanguage] ?? row.reason;
      return <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" key={row.id}>
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs font-black ${priorityClass}`}>{row.priority}</span><span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-bold text-teal-900">Part {row.part}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold">{statusLabel}</span></div><h2 className="mt-3 font-black leading-6" lang="en">{row.questionText || (vi ? "Câu hỏi nghe" : "Listening question")}</h2><p className="mt-1 text-sm font-semibold text-slate-700">{reasonLabel}</p><p className="mt-2 text-sm text-slate-500">{row.reportCount} {vi ? "báo cáo tổng cộng" : "total reports"} · {row.openCount} {vi ? "đang mở" : "active"} · {row.sourceType} · {row.createdAt.toLocaleString(vi ? "vi-VN" : "en-US")}</p></div>
        <Link className="inline-flex min-h-11 items-center justify-center rounded-lg border border-teal-700 px-4 font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`/admin/content/reports/${row.questionId}`}>{vi ? "Kiểm tra" : "Review"} →</Link>
      </article>;
    })}</div>
    {!data.rows.length ? <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="text-xl font-black">{vi ? "Không có báo cáo phù hợp" : "No matching reports"}</h2><p className="mt-2 text-slate-600">{vi ? "Thử đổi bộ lọc hoặc kiểm tra lại sau." : "Change the filters or check again later."}</p></section> : null}
    {data.total > data.pageSize ? <nav aria-label={vi ? "Phân trang" : "Pagination"} className="mt-6 flex items-center justify-between"><Link aria-disabled={data.page === 1} className={`rounded-lg border px-4 py-3 font-bold ${data.page === 1 ? "pointer-events-none text-slate-400" : "bg-white"}`} href={href(Math.max(1, data.page - 1))}>← {vi ? "Trước" : "Previous"}</Link><span>{vi ? "Trang" : "Page"} {data.page}</span><Link aria-disabled={data.page * data.pageSize >= data.total} className={`rounded-lg border px-4 py-3 font-bold ${data.page * data.pageSize >= data.total ? "pointer-events-none text-slate-400" : "bg-white"}`} href={href(data.page + 1)}>{vi ? "Sau" : "Next"} →</Link></nav> : null}
  </div></main>;
}
