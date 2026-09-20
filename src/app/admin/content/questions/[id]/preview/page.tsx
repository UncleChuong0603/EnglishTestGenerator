import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { LearnerPreview } from "@/components/admin/learner-preview";
import { requireAdmin } from "@/lib/admin/authorization";
import { getAdminContentDetail, validateContent } from "@/lib/admin/content";
import { getPreferences } from "@/lib/i18n/get-translations";
import type { PracticeQuestion } from "@/lib/practice/types";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin("CONTENT_READ");
  const { id } = await params;
  const [prefs, detail] = await Promise.all([getPreferences(actor.id), getAdminContentDetail(id)]);
  if (!detail) notFound();
  const issues = await validateContent(id);
  const part = detail.group.toeicPart as PracticeQuestion["part"];
  const questions = detail.questions.map((q, index) => ({
    id: q.id, number: index + 1, part, text: q.questionText, skill: q.skill, subSkill: q.subSkill,
    passageSetId: detail.group.id,
    options: q.options.map(o => ({ id: o.id, key: o.optionKey, text: o.optionText })),
    correctOptionId: q.solution?.correctOptionId ?? "",
    explanationEn: q.solution?.explanationEn ?? null, explanationVi: q.solution?.explanationVi ?? null,
  }));
  const passages = detail.passages.map(p => ({ id: p.id, title: p.title, content: p.content ?? "", position: p.position ?? 0, documentType: p.documentType ?? "" }));
  const data = { part, title: detail.group.title, passages, questions, media: detail.media.map(m => ({ id: m.asset.id, kind: m.asset.kind, status: m.asset.status })), issues, lifecycle: detail.group.status };
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl"><AdminNav locale={prefs.interfaceLanguage}/><div className="mt-6"><Link className="font-bold text-teal-800 underline" href={`/admin/content/questions/${encodeURIComponent(id)}`}>â† {prefs.interfaceLanguage === "vi" ? "Quay láº¡i chá»‰nh sá»­a" : "Back to edit"}</Link><h1 className="my-5 text-3xl font-black">{prefs.interfaceLanguage === "vi" ? "Xem nhÆ° ngÆ°á»i há»c" : "Preview as learner"}</h1><LearnerPreview data={data} initialLocale={prefs.interfaceLanguage}/></div></div></main>;
}

