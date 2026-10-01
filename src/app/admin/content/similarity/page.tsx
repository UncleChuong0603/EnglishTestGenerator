import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminFilterPanel } from "@/components/admin/admin-filter-panel";
import { AdminNav } from "@/components/admin/admin-nav";
import { PendingSubmit } from "@/components/admin/pending-submit";
import { QuestionReportFilters } from "@/components/admin/question-report-filters";
import { requireAdmin } from "@/lib/admin/authorization";
import {
  listQuestionIssueReports,
  QUESTION_REPORT_STATUSES,
  QUESTION_REPORT_TYPES,
  syncDuplicateQuestionReports,
  type QuestionIssueReportRow,
  type QuestionReportStatus,
  type QuestionReportType,
} from "@/lib/admin/question-issue-reports";
import { getPreferences } from "@/lib/i18n/get-translations";
import { updateQuestionIssueReportStatusAction } from "./actions";

const queuePath = "/admin/content/similarity";
const statusStyle: Record<QuestionReportStatus, string> = {
  OPEN: "bg-rose-50 text-rose-800 ring-rose-200",
  IN_REVIEW: "bg-amber-50 text-amber-900 ring-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  DISMISSED: "bg-slate-100 text-slate-700 ring-slate-200",
};

function reportStatusLabel(status: QuestionReportStatus, vi: boolean) {
  return ({
    OPEN: vi ? "Đang mở" : "Open",
    IN_REVIEW: vi ? "Đang kiểm tra" : "In review",
    RESOLVED: vi ? "Đã xử lý" : "Resolved",
    DISMISSED: vi ? "Bỏ qua" : "Dismissed",
  } as const)[status];
}

function reportTypeLabel(type: QuestionReportType, vi: boolean) {
  return ({
    DUPLICATE: vi ? "Nghi trùng lặp" : "Possible duplicate",
    CONTENT_ERROR: vi ? "Lỗi nội dung" : "Content error",
    ANSWER_ERROR: vi ? "Lỗi đáp án" : "Answer error",
    MEDIA_ERROR: vi ? "Lỗi media" : "Media error",
    OTHER: vi ? "Khác" : "Other",
  } as const)[type];
}

function ContentSummary({ item, part, vi }: { item: QuestionIssueReportRow["primary"]; part: number; vi: boolean }) {
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
        <span className="rounded-full bg-white px-2.5 py-1 text-slate-700 ring-1 ring-slate-200">{({ draft: vi ? "Bản nháp" : "Draft", published: vi ? "Đã xuất bản" : "Published", archived: vi ? "Đã lưu trữ" : "Archived" })[item.lifecycle]}</span>
        <span className="text-slate-500">{item.provenance === "ADMIN" ? "Admin" : vi ? "Hệ thống" : "Seeded"} · {item.questionCount} {vi ? "câu" : item.questionCount === 1 ? "question" : "questions"}</span>
      </div>
      <h3 className="mt-3 break-words text-base font-black leading-6 text-slate-950">{item.title}</h3>
      {item.preview ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">{item.preview}</p> : null}
      <Link className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-bold text-teal-800 hover:border-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800" href={`/admin/content/questions/${item.id}?part=${part}`}>
        {vi ? "Mở nội dung" : "Open content"}<span aria-hidden="true" className="ml-1">↗</span>
      </Link>
    </article>
  );
}

function ReportCard({ report, selectedStatus, part, issueType, vi }: { report: QuestionIssueReportRow; selectedStatus: QuestionReportStatus; part?: number; issueType?: QuestionReportType; vi: boolean }) {
  const sharedTerms = Array.isArray(report.evidence.sharedTerms) ? report.evidence.sharedTerms.filter((term): term is string => typeof term === "string") : [];
  const exact = report.evidence.exact === true;
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-black text-teal-900 ring-1 ring-teal-200">{report.source === "SYSTEM" ? (vi ? "Hệ thống" : "System") : (vi ? "Người học" : "Learner")}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-800">Part {report.part} · {reportTypeLabel(report.issueType, vi)}</span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${statusStyle[report.status]}`}>{reportStatusLabel(report.status, vi)}</span>
          </div>
          <h2 className="mt-3 text-lg font-black text-slate-950">{report.issueType !== "DUPLICATE" ? reportTypeLabel(report.issueType, vi) : exact ? (vi ? "Văn bản trùng hoàn toàn" : "Exact text match") : (vi ? "Hai nhóm câu hỏi có độ tương đồng cao" : "Two question groups are highly similar")}</h2>
          <p className="mt-1 text-sm text-slate-600">{vi ? "Phát hiện gần nhất" : "Last detected"}: {report.lastDetectedAt.toLocaleString(vi ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
        </div>
        {report.confidencePercent !== null ? <div className="rounded-xl bg-slate-950 px-4 py-3 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-300">{vi ? "Tương đồng" : "Similarity"}</p>
          <p className="mt-1 text-2xl font-black tabular-nums">{report.confidencePercent}%</p>
        </div> : null}
      </div>
      {report.evidence.autoResolved === true ? <p className="border-b border-slate-200 px-5 py-3 text-sm text-slate-700">{vi ? "Hệ thống đã đóng báo cáo vì cặp nội dung không còn nằm trong kết quả phát hiện." : "The system closed this report because the pair no longer appears in detection results."}</p> : null}
      {sharedTerms.length > 0 ? <p className="border-b border-slate-200 bg-amber-50 px-5 py-3 text-sm text-amber-950 [overflow-wrap:anywhere]"><strong>{vi ? "Bằng chứng chung" : "Shared evidence"}:</strong> {sharedTerms.join(" · ")}</p> : null}
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <ContentSummary item={report.primary} part={report.part} vi={vi} />
        {report.related ? <ContentSummary item={report.related} part={report.part} vi={vi} /> : null}
      </div>
      <form action={updateQuestionIssueReportStatusAction} className="flex flex-wrap items-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <input name="id" type="hidden" value={report.id} />
        <input name="part" type="hidden" value={part ?? ""} />
        <input name="type" type="hidden" value={issueType ?? ""} />
        <input name="returnStatus" type="hidden" value={selectedStatus} />
        <input name="expectedStatus" type="hidden" value={report.status} />
        <div className="text-sm font-bold text-slate-800">
          <label htmlFor={`review-${report.id}`}>{vi ? "Kết quả kiểm tra" : "Review status"}</label>
          <select id={`review-${report.id}`} className="mt-1 block min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-base" defaultValue={report.status} name="status">
            {QUESTION_REPORT_STATUSES.map((status) => <option key={status} value={status}>{reportStatusLabel(status, vi)}</option>)}
          </select>
        </div>
        <PendingSubmit className="min-h-11 rounded-lg bg-teal-800 px-4 text-sm font-black text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800" pendingLabel={vi ? "Đang lưu…" : "Saving…"}>{vi ? "Lưu trạng thái" : "Save status"}</PendingSubmit>
      </form>
    </article>
  );
}

export default async function SimilarityPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const actor = await requireAdmin("CONTENT_READ");
  const [prefs, query] = await Promise.all([getPreferences(actor.id), searchParams]);
  const vi = prefs.interfaceLanguage === "vi";
  const rawPart = Number(query.part);
  const part = Number.isInteger(rawPart) && rawPart >= 1 && rawPart <= 7 ? rawPart : undefined;
  const status = QUESTION_REPORT_STATUSES.includes(query.status as QuestionReportStatus) ? query.status as QuestionReportStatus : "OPEN";
  const issueType = QUESTION_REPORT_TYPES.includes(query.type as QuestionReportType) ? query.type as QuestionReportType : "DUPLICATE";
  for (const scanPart of part ? [part] : [1, 2, 3, 4, 5, 6, 7]) await syncDuplicateQuestionReports(scanPart);
  const rawPage = Number(query.page);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const result = await listQuestionIssueReports({ part, status, issueType, page });
  const pageCount = Math.ceil(result.total / result.pageSize);
  const queueHref = (nextStatus: QuestionReportStatus, nextPage = 1) => {
    const params = new URLSearchParams({ status: nextStatus, type: issueType });
    if (part) params.set("part", String(part));
    if (nextPage > 1) params.set("page", String(nextPage));
    return `${queuePath}?${params}`;
  };
  if (page > Math.max(1, pageCount)) redirect(queueHref(status, Math.max(1, pageCount)));
  const activeFilterCount = [query.part, query.status, query.type].filter(Boolean).length;
  return (
    <main className="min-h-screen px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <AdminNav locale={prefs.interfaceLanguage} />
        <header className="mt-8 max-w-4xl">
          <p className="text-sm font-black uppercase tracking-[.16em] text-teal-800">Content QA</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{vi ? "Kiểm tra nội dung trùng lặp" : "Duplicate content review"}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">{vi ? "Hệ thống ghi nhận các cặp nội dung nghi trùng lặp để admin kiểm tra; không tự sửa hoặc xuất bản nội dung." : "The system records possible duplicate pairs for admin review; it never edits or publishes content automatically."}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{vi ? "Độ tương đồng dựa trên văn bản. Đối chiếu thêm đáp án và media trước khi kết luận." : "Similarity is based on text. Check answers and media before deciding."}</p>
        </header>
        <AdminFilterPanel activeCount={activeFilterCount} clearHref={`${queuePath}?type=DUPLICATE&status=OPEN`} clearLabel={vi ? "Xóa bộ lọc" : "Clear filters"} label={vi ? "Bộ lọc" : "Filters"} summary={`${part ? `Part ${part}` : vi ? "Tất cả Part" : "All Parts"} · ${reportStatusLabel(status, vi)} · ${reportTypeLabel(issueType, vi)}`}>
          <QuestionReportFilters action={queuePath} issueType={issueType} locale={prefs.interfaceLanguage} part={part} status={status} />
        </AdminFilterPanel>
        {query.updated ? <p aria-live="polite" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-900">{vi ? "Đã cập nhật trạng thái báo cáo." : "Report status updated."}</p> : null}
        {query.error ? <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-900">{query.error === "stale" ? (vi ? "Báo cáo đã được cập nhật ở nơi khác. Kiểm tra trạng thái hiện tại trước khi lưu lại." : "This report was updated elsewhere. Check its current status before saving again.") : (vi ? "Không thể cập nhật báo cáo. Hãy thử lại." : "The report could not be updated. Please try again.")}</p> : null}
        <section aria-label={vi ? "Tóm tắt hàng đợi" : "Queue summary"} className="mt-6 flex flex-wrap gap-2">
          {QUESTION_REPORT_STATUSES.map((item) => <Link aria-current={item === status ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-3 rounded-lg border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 ${item === status ? "border-[var(--green)] bg-[var(--green)] text-white" : "border-slate-200 bg-white text-slate-900"}`} href={queueHref(item)} key={item}><span>{reportStatusLabel(item, vi)}</span><span className="tabular-nums">{result.counts[item].toLocaleString(vi ? "vi-VN" : "en-US")}</span></Link>)}
        </section>
        <p className="mt-6 font-bold text-slate-700">{result.total} {vi ? "báo cáo phù hợp" : "matching reports"}</p>
        <div className="mt-4 grid gap-5">
          {result.rows.map((report) => <ReportCard key={report.id} report={report} selectedStatus={status} part={part} issueType={issueType} vi={vi} />)}
          {result.rows.length === 0 ? <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12"><h2 className="text-2xl font-black">{vi ? "Không có báo cáo phù hợp" : "No matching reports"}</h2><p className="mt-2 text-slate-600">{vi ? "Thử đổi bộ lọc hoặc kiểm tra lại sau khi nội dung được cập nhật." : "Try another filter or check again after content is updated."}</p></section> : null}
        </div>
        {pageCount > 1 ? <nav aria-label={vi ? "Phân trang báo cáo" : "Report pagination"} className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-bold">
          {page > 1 ? <Link className="inline-flex min-h-11 items-center rounded-lg border bg-white px-4" href={queueHref(status, page - 1)}>{vi ? "Trang trước" : "Previous"}</Link> : <span />}
          <span>{vi ? "Trang" : "Page"} {page} / {pageCount}</span>
          {page < pageCount ? <Link className="inline-flex min-h-11 items-center rounded-lg border bg-white px-4" href={queueHref(status, page + 1)}>{vi ? "Trang sau" : "Next"}</Link> : <span />}
        </nav> : null}
      </div>
    </main>
  );
}
