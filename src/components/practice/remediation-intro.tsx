import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { mistakeReasonDefinition, type MistakeReasonCode } from "@/lib/mistake-reasons/catalog";
import type { MicroLesson } from "@/lib/remediation/content";

export function RemediationIntro({ locale, reasonCode, lesson, questionCount }: {
  locale: InterfaceLanguage;
  reasonCode: MistakeReasonCode;
  lesson: MicroLesson;
  questionCount: number;
}) {
  const vi = locale === "vi";
  return (
    <section aria-labelledby="remediation-lesson-title" className="mb-6 rounded-3xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
      <p className="text-sm font-black uppercase tracking-wider text-teal-800">
        {vi ? "Bước 1/3 · Bài học ngắn" : "Step 1/3 · Micro lesson"}
      </p>
      <h1 className="mt-2 text-2xl font-black text-slate-950" id="remediation-lesson-title">
        {lesson.title[locale]}
      </h1>
      <p className="mt-2 text-sm font-semibold text-slate-600">
        {vi ? "Lý do đã chọn" : "Selected reason"}: {mistakeReasonDefinition(reasonCode).label[locale]}
      </p>
      <p className="mt-4 whitespace-pre-line leading-7 text-slate-800">{lesson.summary[locale]}</p>
      {lesson.href ? (
        <Link className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-teal-700 px-4 py-2 font-bold text-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={lesson.href}>
          {vi ? "Mở bài học đầy đủ" : "Open the full lesson"}
        </Link>
      ) : null}
      <p className="mt-5 border-t border-teal-200 pt-4 font-bold text-teal-950">
        {vi ? `Bước 2/3 · Làm ${questionCount} câu cùng dạng, sau đó xem lại để cập nhật mastery.` : `Step 2/3 · Answer ${questionCount} focused questions, then review them to update mastery.`}
      </p>
    </section>
  );
}
