import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { getPreferences } from "@/lib/i18n/get-translations";
import { listAdminListeningLessons } from "@/lib/listening-lessons/service";
import { listeningTalks } from "@/lib/listening-lessons/talks";

const lessonStatus: Record<string, string> = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Đã lưu trữ",
};

export default async function AdminListeningLessonsPage() {
  const actor = await requireAdmin("CONTENT_READ");
  const [prefs, lessons] = await Promise.all([getPreferences(actor.id), listAdminListeningLessons()]);
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl pb-16"><AdminNav locale={prefs.interfaceLanguage} />
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-black">Kho luyện nghe</h1><p className="mt-2 text-slate-600">Bài nghe và transcript dành cho luyện tập, không tính điểm.</p></div><Link className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800" href="/admin/listening-lessons/new">Tạo bài học TOEIC</Link></div>

    <section aria-labelledby="talks-heading" className="mt-9">
      <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-2xl font-black" id="talks-heading">Bài nghe đã có ({listeningTalks.length})</h2><p className="mt-1 text-slate-600">Audio và transcript đang dùng trong mục Luyện nghe audio của học viên.</p></div><Link className="font-bold text-teal-800 underline" href="/listening-lessons">Xem trang học viên ↗</Link></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{listeningTalks.map(talk => <Link className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`/admin/listening-lessons/talk/${talk.slug}`} key={talk.slug}>
        <span className="text-xs font-black uppercase tracking-wide text-teal-700">{talk.minutes} phút · {talk.topicVi}</span><h3 className="mt-2 text-lg font-black">{talk.titleVi}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-600">{talk.descriptionVi}</p><span className="mt-4 inline-block text-sm font-bold text-teal-800">Nghe và xem transcript →</span>
      </Link>)}</div>
    </section>

    <section aria-labelledby="toeic-lessons-heading" className="mt-10">
      <h2 className="text-2xl font-black" id="toeic-lessons-heading">Bài học TOEIC trong admin ({lessons.length})</h2><p className="mt-1 text-slate-600">Bài học riêng theo Part, được tạo và xuất bản từ trang quản trị.</p>
      <div className="mt-4 divide-y rounded-2xl border border-slate-200 bg-white">{lessons.map(lesson => <Link className="block p-5 hover:bg-slate-50" href={`/admin/listening-lessons/${lesson.id}`} key={lesson.id}><span className="font-bold text-teal-800">{lesson.title}</span><span className="ml-3 text-sm text-slate-500">Part {lesson.toeicPart} · {lessonStatus[lesson.status] ?? lesson.status}</span><p className="mt-1 line-clamp-2 text-sm text-slate-600">{lesson.description || lesson.transcript}</p></Link>)}{!lessons.length && <p className="p-6 text-slate-600">Chưa có bài học TOEIC tạo trong admin.</p>}</div>
    </section>
  </div></main>;
}
