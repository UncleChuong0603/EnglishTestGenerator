import Link from "next/link";
import { redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { listPublishedListeningLessons } from "@/lib/listening-lessons/service";

export default async function ListeningLessonsPage({ searchParams }: { searchParams: Promise<{ part?: string }> }) {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in?next=/listening-lessons");
  const query = await searchParams; const part = Number(query.part); const selected = [1, 2, 3, 4].includes(part) ? part : undefined;
  const [prefs, lessons] = await Promise.all([getPreferences(user.id), listPublishedListeningLessons(selected)]);
  const vi = prefs.interfaceLanguage === "vi";
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl"><LearnerNav locale={prefs.interfaceLanguage} /><div className="mt-8"><Link className="text-sm font-bold text-teal-700" href="/practice">← {vi ? "Luyện tập" : "Practice"}</Link><h1 className="mt-5 text-3xl font-black">{vi ? "Thư viện luyện nghe" : "Listening study library"}</h1><p className="mt-2 max-w-2xl text-slate-600">{vi ? "Nghe, xem hình và đối chiếu transcript theo nhịp riêng. Bài học không tính vào điểm thi, thứ hạng hoặc số lượt luyện đề." : "Listen, view the image and read the transcript at your own pace. Lessons do not affect test scores, rankings or practice quotas."}</p></div>
    <nav aria-label={vi ? "Lọc theo Part" : "Filter by part"} className="mt-6 flex flex-wrap gap-2">{[null, 1, 2, 3, 4].map(value => <Link aria-current={selected === (value ?? undefined) ? "page" : undefined} className={`rounded-full px-4 py-2 font-semibold ${selected === (value ?? undefined) ? "bg-teal-800 text-white" : "border bg-white text-teal-800"}`} href={value ? `/listening-lessons?part=${value}` : "/listening-lessons"} key={value ?? "all"}>{value ? `Part ${value}` : (vi ? "Tất cả" : "All")}</Link>)}</nav>
    <div className="mt-6 grid gap-4 md:grid-cols-2">{lessons.map(lesson => <Link className="rounded-2xl border bg-white p-6 hover:border-teal-500" href={`/listening-lessons/${lesson.id}`} key={lesson.id}><span className="text-sm font-black uppercase tracking-wide text-teal-700">Part {lesson.toeicPart}{lesson.hasImage ? ` · ${vi ? "Có ảnh" : "Image"}` : ""}</span><h2 className="mt-3 text-xl font-black">{lesson.title}</h2><p className="mt-2 text-slate-600">{lesson.description}</p></Link>)}{!lessons.length && <p className="rounded-2xl border bg-white p-8 text-slate-600">{vi ? "Chưa có bài học cho mục này." : "There are no lessons in this section yet."}</p>}</div>
  </div></main>;
}
