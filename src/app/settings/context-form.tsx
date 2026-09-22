"use client";
import { useActionState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { ACQUISITION_SOURCES, STUDY_PURPOSES, acquisitionSourceLabel, studyPurposeLabel, type LearnerContext } from "@/lib/learner-context/domain";
import { saveContext, type ContextActionState } from "./context-actions";

const initialState: ContextActionState = { ok: false };
const option = "flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 has-checked:border-teal-700 has-checked:bg-teal-50 focus-within:outline-2 focus-within:outline-teal-700";
export function ContextForm({ context, locale, compact = false }: { context: LearnerContext | null; locale: InterfaceLanguage; compact?: boolean }) {
  const [state, action, pending] = useActionState(saveContext, initialState); const vi = locale === "vi";
  return <form action={action} className={compact ? "mt-5 space-y-5" : "mt-6 space-y-7"}>
    <fieldset><legend className="font-bold">{vi ? "Bạn đang luyện TOEIC để làm gì?" : "Why are you studying TOEIC?"}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2"><label className={option}><input defaultChecked={!context?.studyPurpose} name="studyPurpose" type="radio" value=""/><span className="font-semibold">{vi?"Chưa chọn":"Not provided"}</span></label>{STUDY_PURPOSES.map(value => <label className={option} key={value}><input defaultChecked={context?.studyPurpose === value} name="studyPurpose" type="radio" value={value}/><span className="font-semibold">{studyPurposeLabel(value, locale)}</span></label>)}</div><input className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 px-3" defaultValue={context?.studyPurposeOther ?? ""} maxLength={120} name="studyPurposeOther" placeholder={vi ? "Nếu chọn Khác, bạn có thể nói rõ hơn" : "If Other, add a short note"}/></fieldset>
    <fieldset><legend className="font-bold">{vi ? "Bạn biết TOEICGym từ đâu?" : "How did you hear about TOEICGym?"}</legend><div className="mt-3 grid gap-2 sm:grid-cols-2"><label className={option}><input defaultChecked={!context?.acquisitionSource} name="acquisitionSource" type="radio" value=""/><span className="font-semibold">{vi?"Chưa chọn":"Not provided"}</span></label>{ACQUISITION_SOURCES.map(value => <label className={option} key={value}><input defaultChecked={context?.acquisitionSource === value} name="acquisitionSource" type="radio" value={value}/><span className="font-semibold">{acquisitionSourceLabel(value, locale)}</span></label>)}</div><input className="mt-3 min-h-11 w-full rounded-xl border border-slate-300 px-3" defaultValue={context?.acquisitionSourceOther ?? ""} maxLength={120} name="acquisitionSourceOther" placeholder={vi ? "Nếu chọn Khác, bạn có thể nói rõ hơn" : "If Other, add a short note"}/></fieldset>
    <p className="text-sm text-slate-500">{vi ? "Cả hai câu đều không bắt buộc và không ảnh hưởng đến gói học." : "Both questions are optional and do not affect your plan."}</p>
    {state.error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{vi ? "Không thể lưu. Hãy kiểm tra nội dung và thử lại." : "We couldn't save this. Check the values and try again."}</p> : state.ok ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{vi ? "Đã lưu thông tin học tập." : "Learning context saved."}</p> : null}
    <button className="min-h-12 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-60" disabled={pending}>{pending ? (vi ? "Đang lưu…" : "Saving…") : (vi ? "Lưu" : "Save")}</button>
  </form>;
}
