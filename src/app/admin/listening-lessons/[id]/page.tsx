import Link from "next/link";
import { notFound } from "next/navigation";
import { archiveLessonAction, publishLessonAction } from "../actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { ListeningLessonForm } from "@/components/admin/listening-lesson-form";
import { LessonWorkspace } from "@/components/listening/lesson-workspace";
import { requireAdmin } from "@/lib/admin/authorization";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getAdminListeningLesson } from "@/lib/listening-lessons/service";
import { createMediaStorage } from "@/lib/media/storage";

export default async function AdminListeningLessonPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string; published?: string; archived?: string }> }) {
  const actor = await requireAdmin("CONTENT_READ"); const [{ id }, query, prefs] = await Promise.all([params, searchParams, getPreferences(actor.id)]);
  const lesson = await getAdminListeningLesson(id); if (!lesson) notFound();
  const storage = createMediaStorage();
  const [audioUrl, imageUrl] = await Promise.all([storage.createReadUrl(lesson.audioStorageKey, 3600), lesson.imageStorageKey ? storage.createReadUrl(lesson.imageStorageKey, 3600) : Promise.resolve(null)]);
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-4xl"><AdminNav locale={prefs.interfaceLanguage} /><Link className="mt-8 inline-block text-teal-700" href="/admin/listening-lessons">← Kho luyện nghe</Link><h1 className="mt-5 text-3xl font-black">{lesson.title}</h1><p className="mt-2 text-slate-600">Part {lesson.toeicPart} · {lesson.status}</p>
    {query.error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-red-800" role="alert">Không thể thực hiện: {query.error}</p>}{(query.saved || query.published || query.archived) && <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-800">Đã cập nhật bài học.</p>}
    <h2 className="mt-8 text-xl font-black">Xem trước bài học</h2><LessonWorkspace audioUrl={audioUrl} imageAlt={lesson.imageAlt} imageUrl={imageUrl} locale={prefs.interfaceLanguage} transcript={lesson.transcript} />
    {lesson.status === "DRAFT" && <><ListeningLessonForm lesson={lesson} /><form action={publishLessonAction} className="mt-5"><input name="id" type="hidden" value={id} /><button className="min-h-12 rounded-xl bg-slate-900 px-6 font-bold text-white">Xuất bản bài học</button></form></>}
    {lesson.status === "PUBLISHED" && <Link className="mt-6 inline-block rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href={`/listening-lessons/${id}`}>Xem bài học</Link>}
    {lesson.status !== "ARCHIVED" && <form action={archiveLessonAction} className="mt-5"><input name="id" type="hidden" value={id} /><button className="min-h-11 rounded-xl border border-red-200 px-5 font-semibold text-red-700">Lưu trữ bài học</button></form>}
  </div></main>;
}
