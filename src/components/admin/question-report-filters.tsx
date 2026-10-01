"use client";

import Form from "next/form";
import { useFormStatus } from "react-dom";
import { useId } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { QuestionReportStatus, QuestionReportType } from "@/lib/admin/question-issue-reports";

function ApplyButton({ locale }: { locale: InterfaceLanguage }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="min-h-11 self-end rounded-lg bg-teal-800 px-5 font-black text-white transition-colors hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? (locale === "vi" ? "Đang lọc…" : "Applying…") : (locale === "vi" ? "Áp dụng" : "Apply")}
    </button>
  );
}

export function QuestionReportFilters({
  action = "/admin/content/reports",
  issueType,
  locale,
  part,
  status,
}: {
  action?: string;
  issueType?: QuestionReportType;
  locale: InterfaceLanguage;
  part?: number;
  status: QuestionReportStatus;
}) {
  const vi = locale === "vi";
  const id = useId();
  return (
    <Form action={action} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]" replace>
      <div className="min-w-0 text-sm font-bold text-slate-800">
        <label htmlFor={`${id}-part`}>Part</label>
        <select id={`${id}-part`} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base" defaultValue={part ?? ""} name="part">
          <option value="">{vi ? "Tất cả Part" : "All Parts"}</option>
          {[1, 2, 3, 4, 5, 6, 7].map((value) => <option key={value} value={value}>Part {value}</option>)}
        </select>
      </div>
      <div className="min-w-0 text-sm font-bold text-slate-800">
        <label htmlFor={`${id}-type`}>{vi ? "Loại báo cáo" : "Report type"}</label>
        <select id={`${id}-type`} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base" defaultValue={issueType ?? ""} name="type">
          <option value="">{vi ? "Tất cả loại báo cáo" : "All report types"}</option>
          <option value="DUPLICATE">{vi ? "Nghi trùng lặp" : "Possible duplicate"}</option>
          <option value="CONTENT_ERROR">{vi ? "Lỗi nội dung" : "Content error"}</option>
          <option value="ANSWER_ERROR">{vi ? "Lỗi đáp án" : "Answer error"}</option>
          <option value="MEDIA_ERROR">{vi ? "Lỗi media" : "Media error"}</option>
          <option value="OTHER">{vi ? "Khác" : "Other"}</option>
        </select>
      </div>
      <div className="min-w-0 text-sm font-bold text-slate-800">
        <label htmlFor={`${id}-status`}>{vi ? "Trạng thái" : "Status"}</label>
        <select id={`${id}-status`} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-base" defaultValue={status} name="status">
          <option value="OPEN">{vi ? "Đang mở" : "Open"}</option>
          <option value="IN_REVIEW">{vi ? "Đang kiểm tra" : "In review"}</option>
          <option value="RESOLVED">{vi ? "Đã xử lý" : "Resolved"}</option>
          <option value="DISMISSED">{vi ? "Bỏ qua" : "Dismissed"}</option>
        </select>
      </div>
      <ApplyButton locale={locale} />
    </Form>
  );
}
