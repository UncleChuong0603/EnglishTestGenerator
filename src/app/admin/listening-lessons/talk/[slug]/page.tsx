import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { LessonWorkspace } from "@/components/listening/lesson-workspace";
import { requireAdmin } from "@/lib/admin/authorization";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getListeningTalk } from "@/lib/listening-lessons/talks";

export default async function AdminListeningTalkPage({ params }: { params: Promise<{ slug: string }> }) {
  const actor = await requireAdmin("CONTENT_READ");
  const [{ slug }, prefs] = await Promise.all([params, getPreferences(actor.id)]);
  const talk = getListeningTalk(slug);
  if (!talk) notFound();

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl pb-16">
    <AdminNav locale={prefs.interfaceLanguage} />
    <Link className="mt-8 inline-block font-bold text-teal-800" href="/admin/listening-lessons">← Kho luyện nghe</Link>
    <p className="mt-7 text-sm font-black uppercase tracking-wide text-teal-700">Bài nghe đã có · {talk.minutes} phút · {talk.topicVi}</p>
    <h1 className="mt-2 text-3xl font-black">{talk.titleVi}</h1>
    <p className="mt-2 max-w-3xl text-slate-600">{talk.descriptionVi}</p>
    <LessonWorkspace audioUrl={talk.audioUrl} imageAlt={null} imageUrl={null} locale={prefs.interfaceLanguage} transcript={talk.transcript} />
    <Link className="mt-7 inline-block rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800 hover:bg-teal-50" href={`/listening-lessons/talk/${talk.slug}`}>Mở trang học viên ↗</Link>
  </div></main>;
}
