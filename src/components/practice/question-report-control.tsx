"use client";

import { useActionState, useRef, useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { QUESTION_REPORT_DESCRIPTION_MAX, QUESTION_REPORT_REASONS, questionReportLabels, type QuestionReportFormState } from "@/lib/question-reports/catalog";

const initialState: QuestionReportFormState = { status: "idle" };

export function QuestionReportControl({ questionId, sessionId, locale, action }: { questionId: string; sessionId: string; locale: InterfaceLanguage; action: (previous: QuestionReportFormState, formData: FormData) => Promise<QuestionReportFormState> }) {
  const vi = locale === "vi";
  const dialog = useRef<HTMLDialogElement>(null);
  const [description, setDescription] = useState("");
  const [state, formAction, pending] = useActionState(action, initialState);
  const error = state.code === "DUPLICATE"
    ? (vi ? "Bạn đã báo câu hỏi này và nhóm nội dung đang xem xét." : "You already reported this question and it is being reviewed.")
    : state.code === "RATE_LIMITED"
      ? (vi ? "Bạn đã gửi nhiều báo cáo trong thời gian ngắn. Vui lòng thử lại sau." : "You sent several reports recently. Please try again later.")
      : state.code === "NOT_ALLOWED"
        ? (vi ? "Bạn chỉ có thể báo câu hỏi trong bài đã nộp của mình." : "You can only report questions from your own submitted work.")
        : state.code === "AUTH_REQUIRED"
          ? (vi ? "Phiên học đã hết hạn. Hãy đăng nhập hoặc mở lại kết quả." : "Your learning session expired. Sign in or reopen the result.")
          : (vi ? "Chưa thể gửi báo cáo. Vui lòng thử lại." : "The report could not be sent. Please try again.");

  return <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
    <button
      type="button"
      className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      onClick={() => dialog.current?.showModal()}
    >
      {vi ? "Báo lỗi câu hỏi" : "Report a question issue"}
    </button>
    <dialog
      ref={dialog}
      aria-labelledby={`report-title-${questionId}`}
      aria-describedby={`report-description-${questionId}`}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/35"
      onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
      onClose={() => setDescription("")}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black" id={`report-title-${questionId}`}>{vi ? "Báo lỗi câu hỏi" : "Report a question issue"}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600" id={`report-description-${questionId}`}>{vi ? "Báo cáo không làm gián đoạn bài học. Đội nội dung sẽ kiểm tra trước khi thay đổi hoặc xuất bản." : "Reporting will not interrupt your learning. The content team reviews every change before publication."}</p>
          </div>
          <button type="button" className="flex size-11 shrink-0 items-center justify-center rounded-full text-2xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" aria-label={vi ? "Đóng" : "Close"} onClick={() => dialog.current?.close()}>×</button>
        </div>
        {state.status === "success" ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4" role="status">
          <p className="font-bold text-emerald-900">{vi ? "Đã gửi báo cáo" : "Report sent"}</p>
          <p className="mt-1 text-sm text-emerald-900">{vi ? "Cảm ơn bạn. Bạn có thể tiếp tục xem kết quả." : "Thank you. You can continue reviewing your result."}</p>
          <button type="button" className="mt-4 min-h-11 rounded-lg bg-teal-700 px-4 font-bold text-white" onClick={() => dialog.current?.close()}>{vi ? "Tiếp tục học" : "Continue learning"}</button>
        </div> : <form action={formAction} className="mt-5 space-y-5">
          <input name="questionId" type="hidden" value={questionId} />
          <input name="sessionId" type="hidden" value={sessionId} />
          <label className="block font-bold" htmlFor={`report-reason-${questionId}`}>
            {vi ? "Loại lỗi" : "Issue type"}
            <select autoFocus className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3" id={`report-reason-${questionId}`} name="reason" required defaultValue="">
              <option disabled value="">{vi ? "Chọn một lý do" : "Choose a reason"}</option>
              {QUESTION_REPORT_REASONS.map((reason) => <option key={reason} value={reason}>{questionReportLabels[reason][locale]}</option>)}
            </select>
          </label>
          <label className="block font-bold" htmlFor={`report-details-${questionId}`}>
            {vi ? "Mô tả thêm (không bắt buộc)" : "Additional details (optional)"}
            <textarea
              className="mt-2 block min-h-28 w-full resize-y rounded-lg border border-slate-300 p-3 text-base"
              id={`report-details-${questionId}`}
              maxLength={QUESTION_REPORT_DESCRIPTION_MAX}
              name="description"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
            <span className="mt-1 block text-right text-xs font-normal tabular-nums text-slate-500">{description.length}/{QUESTION_REPORT_DESCRIPTION_MAX}</span>
          </label>
          {state.status === "error" ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-900" role="alert">{error}</p> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="min-h-12 rounded-xl border border-slate-300 px-5 font-bold" onClick={() => dialog.current?.close()}>{vi ? "Hủy" : "Cancel"}</button>
            <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-teal-700 px-5 font-bold text-white disabled:cursor-wait disabled:opacity-60">{pending ? (vi ? "Đang gửi…" : "Sending…") : (vi ? "Gửi báo cáo" : "Send report")}</button>
          </div>
        </form>}
      </div>
    </dialog>
  </div>;
}
