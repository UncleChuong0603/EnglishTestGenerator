import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { updateDraftQuestionAction } from "@/app/admin/content/actions";
import { requireAdmin } from "@/lib/admin/authorization";
import { getAdminContentDetail, getAdminTaxonomy } from "@/lib/admin/content";
import { getPreferences } from "@/lib/i18n/get-translations";
import { taxonomyLabel } from "@/lib/i18n/labels";

export default async function Page({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{question?:string}>}) {
  const actor=await requireAdmin("CONTENT_MANAGE");
  const [{id},query,prefs]=await Promise.all([params,searchParams,getPreferences(actor.id)]);
  const d=await getAdminContentDetail(id);
  if (!d || d.group.status !== "draft") notFound();
  const q=d.questions.find(item=>item.id===query.question) ?? d.questions[0];
  if (!q) notFound();
  const taxonomy=getAdminTaxonomy()[d.group.toeicPart];
  const vi=prefs.interfaceLanguage==="vi";
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-4xl"><AdminNav locale={prefs.interfaceLanguage}/><Link className="mt-6 inline-block font-bold text-teal-800 underline" href={`/admin/content/questions/${id}`}>← {vi?"Quay lại nhóm":"Back to group"}</Link><h1 className="my-5 text-3xl font-black">{vi?"Sửa bản nháp":"Edit draft"} · Part {d.group.toeicPart}</h1><p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm">{vi?"Xem trước hiển thị phiên bản đã lưu gần nhất. Kiểm tra cả nhóm trước khi xuất bản.":"Preview shows the latest saved version. Validate the whole group before publishing."} <Link className="font-bold text-teal-800 underline" href={`/admin/content/questions/${id}/preview`}>{vi?"Xem như người học":"Preview as learner"}</Link></p>
    <nav aria-label={vi?"Câu hỏi trong nhóm":"Group questions"} className="mb-4 flex flex-wrap gap-2">{d.questions.map((item,i)=><Link className={`rounded-lg border px-3 py-2 ${item.id===q.id?"bg-teal-700 text-white":"bg-white"}`} href={`?question=${item.id}`} key={item.id}>{vi?"Câu":"Question"} {i+1}</Link>)}</nav>
    <form action={updateDraftQuestionAction} className="space-y-4 rounded-2xl border bg-white p-5"><input type="hidden" name="id" value={id}/><input type="hidden" name="questionId" value={q.id}/><input type="hidden" name="updatedAt" value={d.group.updatedAt.toISOString()}/><input type="hidden" name="optionCount" value={q.options.length}/>
      <label className="block font-bold">{vi?"Nội dung câu hỏi":"Question text"}<textarea className="mt-1 block w-full rounded-lg border p-3" name="text" rows={4} defaultValue={q.questionText}/></label>
      <div className="grid gap-3 sm:grid-cols-2">{q.options.map((option,i)=><label className="font-bold" key={option.id}>{option.optionKey}<input className="mt-1 block w-full rounded-lg border p-3" name={`option${i}`} required defaultValue={option.optionText}/></label>)}</div>
      <label className="block font-bold">{vi?"Đáp án đúng":"Correct answer"}<select className="mt-1 block w-full rounded-lg border p-3" name="correct" defaultValue={q.options.findIndex(o=>o.id===q.solution?.correctOptionId)}>{q.options.map((o,i)=><option key={o.id} value={i}>{o.optionKey}</option>)}</select></label>
      <div className="grid gap-3 sm:grid-cols-3"><label className="font-bold">Skill<select className="mt-1 block w-full rounded-lg border p-3" name="skill" defaultValue={q.skill}>{Object.keys(taxonomy).map(s=><option key={s} value={s}>{taxonomyLabel(s,prefs.interfaceLanguage)}</option>)}</select></label><label className="font-bold">Subskill<select className="mt-1 block w-full rounded-lg border p-3" name="subSkill" defaultValue={q.subSkill}>{[...new Set(Object.values(taxonomy).flat())].map(s=><option key={s} value={s}>{taxonomyLabel(s,prefs.interfaceLanguage)}</option>)}</select></label><label className="font-bold">{vi?"Độ khó":"Difficulty"}<select className="mt-1 block w-full rounded-lg border p-3" name="difficulty" defaultValue={q.difficulty}>{["easy","medium","hard"].map(v=><option key={v}>{v}</option>)}</select></label></div>
      <label className="block font-bold">{vi?"Giải thích EN":"Explanation EN"}<textarea className="mt-1 block w-full rounded-lg border p-3" name="explanationEn" rows={4} defaultValue={q.solution?.explanationEn??""}/></label><label className="block font-bold">{vi?"Giải thích VI":"Explanation VI"}<textarea className="mt-1 block w-full rounded-lg border p-3" name="explanationVi" rows={4} defaultValue={q.solution?.explanationVi??""}/></label>
      <button className="rounded-lg bg-teal-700 px-5 py-3 font-bold text-white">{vi?"Lưu bản nháp":"Save draft"}</button>
    </form></div></main>;
}
