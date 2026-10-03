"use client";

import { useActionState, useState } from "react";
import type { MistakeReasonFormState } from "@/app/practice/mistake-reason-actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { ReviewQuestion } from "@/lib/practice/types";

const initialState: MistakeReasonFormState = { status: "idle" };

export function MistakeReasonControl({ action, locale, question, sessionId }: {
  action: (previous: MistakeReasonFormState, formData: FormData) => Promise<MistakeReasonFormState>;
  locale: InterfaceLanguage;
  question: ReviewQuestion;
  sessionId: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);
  const vi = locale === "vi";
  if (!question.mistakeReason || dismissed) return null;
  const selected = state.status === "success" ? state.selected : question.mistakeReason.selected;
  return <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-labelledby={`mistake-reason-${question.id}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-black" id={`mistake-reason-${question.id}`}>{vi ? "Bạn nghĩ mình sai vì đâu?" : "Why do you think you missed this?"}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{vi ? "Không bắt buộc. Câu trả lời giúp chọn bài ôn phù hợp hơn; đây không phải chẩn đoán." : "Optional. Your answer helps choose a more useful review; it is not a diagnosis."}</p>
      </div>
      {!selected ? <button className="min-h-11 px-2 text-sm font-semibold text-slate-600 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-teal-700" onClick={() => setDismissed(true)} type="button">{vi ? "Bỏ qua" : "Skip"}</button> : null}
    </div>
    <form action={formAction} className="mt-3 flex flex-wrap gap-2">
      <input name="sessionId" type="hidden" value={sessionId} />
      <input name="questionId" type="hidden" value={question.id} />
      {question.mistakeReason.choices.map((choice) => <button
        aria-pressed={selected === choice.code}
        className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-60 ${selected === choice.code ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-teal-600"}`}
        disabled={pending}
        key={choice.code}
        name="reasonCode"
        type="submit"
        value={choice.code}
      >
        {choice.label[locale]}
        {choice.suggested ? <span className={`ml-1 text-xs ${selected === choice.code ? "text-teal-100" : "text-teal-700"}`}>({vi ? "gợi ý" : "suggested"})</span> : null}
      </button>)}
    </form>
    <p aria-live="polite" className={`mt-3 text-sm ${state.status === "error" ? "font-semibold text-red-800" : "text-slate-600"}`}>
      {pending ? (vi ? "Đang lưu…" : "Saving…") : state.status === "success" ? (vi ? "Đã lưu. Bạn có thể đổi lý do bất cứ lúc nào." : "Saved. You can change the reason at any time.") : state.status === "error" ? (vi ? "Chưa thể lưu lý do. Hãy tải lại kết quả và thử lại." : "The reason could not be saved. Reload the result and try again.") : ""}
    </p>
  </section>;
}
