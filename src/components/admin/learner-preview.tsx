"use client";
import { useState } from "react";
import Image from "next/image";
import { LocaleProvider } from "@/components/locale-provider";
import { PassageDocuments } from "@/components/practice/passage-documents";
import { QuestionBlock } from "@/components/practice/question-block";
import { AnswerReviewCard } from "@/components/practice/answer-review-card";
import type { InterfaceLanguage, ExplanationLanguage } from "@/lib/i18n/config";
import type { PracticePassage, PracticeQuestion, ReviewQuestion } from "@/lib/practice/types";

type PreviewQuestion = PracticeQuestion & { correctOptionId: string; explanationEn: string | null; explanationVi: string | null };
type PreviewData = { part: number; title: string; passages: PracticePassage[]; questions: PreviewQuestion[]; media: { id: string; kind: string; status: string }[]; issues: string[]; lifecycle: string };
export function LearnerPreview({ data, initialLocale }: { data: PreviewData; initialLocale: InterfaceLanguage }) {
  const [locale, setLocale] = useState<InterfaceLanguage>(initialLocale);
  const [explanationLanguage, setExplanationLanguage] = useState<ExplanationLanguage>("both");
  const [mobile, setMobile] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState<Record<string,string>>({});
  const [index, setIndex] = useState(0);
  const q = data.questions[index];
  const review: ReviewQuestion = { ...q, selectedOptionId: selected[q.id] ?? null, isCorrect: selected[q.id] === q.correctOptionId, correctOptionId: q.correctOptionId, explanationEn: q.explanationEn, explanationVi: q.explanationVi };
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-4">
      <span className="rounded bg-slate-100 px-2 py-1 text-sm font-bold">{data.lifecycle === "draft" ? (locale === "vi" ? "Bản nháp" : "Draft") : data.lifecycle}</span>
      <label>UI <select className="ml-1 rounded border p-1" value={locale} onChange={e=>setLocale(e.target.value as InterfaceLanguage)}><option value="vi">VI</option><option value="en">EN</option></select></label>
      <label>{locale === "vi" ? "Giải thích" : "Explanation"} <select className="ml-1 rounded border p-1" value={explanationLanguage} onChange={e=>setExplanationLanguage(e.target.value as ExplanationLanguage)}><option value="en">EN</option><option value="vi">VI</option><option value="both">EN + VI</option></select></label>
      <button className="rounded border px-3 py-1" onClick={()=>setMobile(v=>!v)} type="button">{mobile ? "Desktop" : "Mobile 390px"}</button>
      <button className="rounded border px-3 py-1" onClick={()=>setSubmitted(v=>!v)} type="button">{submitted ? (locale === "vi" ? "Trước khi nộp" : "Before submission") : (locale === "vi" ? "Xem kết quả mô phỏng" : "Simulate result")}</button>
    </div>
    <div role="status" className={`rounded-xl border p-4 ${data.issues.length ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}`}><strong>{data.issues.length ? `${data.issues.length} ${locale === "vi" ? "lỗi cần sửa" : "issues to fix"}` : (locale === "vi" ? "Nội dung hợp lệ" : "Content valid")}</strong>{data.issues.length > 0 && <ul className="mt-2 list-disc pl-5">{data.issues.map((issue,i)=><li key={i}>{issue}</li>)}</ul>}</div>
    <div className={`mx-auto min-w-0 space-y-4 overflow-x-hidden rounded-2xl bg-slate-50 p-3 sm:p-5 ${mobile ? "max-w-[390px]" : "max-w-5xl"}`}>
      <p className="text-sm font-black text-teal-800">Part {data.part} · {data.title}</p>
      {data.media.map(m=><div key={m.id}>{m.status === "READY" ? m.kind === "AUDIO" ? <audio aria-label="Audio" controls src={`/admin/content/media/${m.id}/preview`}/> : <Image unoptimized alt={locale === "vi" ? "Hình ảnh câu hỏi" : "Question image"} className="h-auto max-h-80 max-w-full object-contain" height={640} width={960} src={`/admin/content/media/${m.id}/preview`}/> : <p role="alert" className="rounded bg-amber-100 p-3">{m.kind === "AUDIO" ? (locale === "vi" ? "Audio chưa sẵn sàng" : "Audio is not ready") : (locale === "vi" ? "Ảnh chưa sẵn sàng" : "Image is not ready")}</p>}</div>)}
      {data.part >= 6 && <LocaleProvider locale={locale}><PassageDocuments passages={data.passages}/></LocaleProvider>}
      {q && (submitted ? <AnswerReviewCard question={review} locale={locale} explanationLanguage={explanationLanguage}/> : <QuestionBlock question={q} selectedId={selected[q.id]} onChoose={id=>setSelected(v=>({...v,[q.id]:id}))} locale={locale}/>)}
      {data.questions.length > 1 && <nav aria-label={locale === "vi" ? "Câu hỏi trong nhóm" : "Questions in group"} className="flex items-center justify-between gap-3"><button disabled={index===0} className="rounded border bg-white px-4 py-2 disabled:opacity-40" onClick={()=>setIndex(v=>v-1)} type="button">← {locale === "vi" ? "Câu trước" : "Previous"}</button><span>{locale === "vi" ? "Câu" : "Question"} {index+1} / {data.questions.length}</span><button disabled={index===data.questions.length-1} className="rounded border bg-white px-4 py-2 disabled:opacity-40" onClick={()=>setIndex(v=>v+1)} type="button">{locale === "vi" ? "Câu tiếp" : "Next"} →</button></nav>}
    </div>
  </div>;
}
