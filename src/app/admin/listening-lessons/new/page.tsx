import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { ListeningLessonForm } from "@/components/admin/listening-lesson-form";
import { requireAdmin } from "@/lib/admin/authorization";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function NewListeningLessonPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const actor = await requireAdmin("CONTENT_MANAGE"); const [prefs, query] = await Promise.all([getPreferences(actor.id), searchParams]);
  return <main className="min-h-screen bg-slate-50 px-4 py-6"><div className="mx-auto max-w-4xl"><AdminNav locale={prefs.interfaceLanguage} /><Link className="mt-8 inline-block text-teal-700" href="/admin/listening-lessons">← Kho luyện nghe</Link><h1 className="mt-5 text-3xl font-black">Bài học mới</h1>{query.error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-red-800" role="alert">Không thể lưu: {query.error}</p>}<ListeningLessonForm /></div></main>;
}
