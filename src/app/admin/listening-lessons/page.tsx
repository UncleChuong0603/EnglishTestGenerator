import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { getPreferences } from "@/lib/i18n/get-translations";
import { listAdminListeningLessons } from "@/lib/listening-lessons/service";

export default async function AdminListeningLessonsPage() {
  const actor = await requireAdmin("CONTENT_READ");
  const [prefs, lessons] = await Promise.all([getPreferences(actor.id), listAdminListeningLessons()]);
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-5xl"><AdminNav locale={prefs.interfaceLanguage} />
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-black">Kho luyện nghe</h1><p className="mt-2 text-slate-600">Bài học riêng, không tính điểm và không thuộc question bank.</p></div><Link className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href="/admin/listening-lessons/new">Tạo bài học</Link></div>
    <div className="mt-6 divide-y rounded-2xl border bg-white">{lessons.map(lesson => <Link className="block p-5 hover:bg-slate-50" href={`/admin/listening-lessons/${lesson.id}`} key={lesson.id}><span className="font-bold text-teal-800">{lesson.title}</span><span className="ml-3 text-sm text-slate-500">Part {lesson.toeicPart} · {lesson.status}</span><p className="mt-1 line-clamp-2 text-sm text-slate-600">{lesson.description || lesson.transcript}</p></Link>)}{!lessons.length && <p className="p-8 text-slate-600">Chưa có bài học nào.</p>}</div>
  </div></main>;
}
