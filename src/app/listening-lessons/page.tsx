import Link from "next/link";
import { redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { independentLessons } from "@/lib/listening-lessons/independent";
import { partExercises } from "@/lib/listening-lessons/part-exercises";
import { listPublishedListeningLessons } from "@/lib/listening-lessons/service";

export default async function ListeningLessonsPage({ searchParams }: { searchParams: Promise<{ part?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/listening-lessons");
  const query = await searchParams;
  const part = Number(query.part);
  const selected = [1, 2, 3, 4].includes(part) ? part : undefined;
  const [prefs, lessons] = await Promise.all([getPreferences(user.id), listPublishedListeningLessons(selected)]);
  const vi = prefs.interfaceLanguage === "vi";
  const visiblePartExercises = selected ? partExercises.filter(lesson => lesson.toeicPart === selected) : partExercises;

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl">
    <LearnerNav locale={prefs.interfaceLanguage} />
    <div className="mt-8"><Link className="text-sm font-bold text-teal-700" href="/practice">← {vi ? "Luyện tập" : "Practice"}</Link>
      <h1 className="mt-5 text-3xl font-black">{vi ? "Thư viện luyện nghe" : "Listening study library"}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">{vi ? "Nghe và luyện hiểu nội dung theo nhịp riêng. Bài học không tính vào điểm thi, thứ hạng hoặc số lượt luyện đề." : "Listen and practice comprehension at your own pace. Lessons do not affect test scores, rankings or practice quotas."}</p>
    </div>

    <section aria-labelledby="independent-listening" className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-2xl font-black" id="independent-listening">{vi ? "Luyện nghe độc lập" : "Independent listening"}</h2><p className="mt-1 text-slate-600">{vi ? "Bài nghe ngắn có audio, câu hỏi và transcript; không gắn với Part thi." : "Short audio exercises with questions and transcripts, outside the test Parts."}</p></div><span className="text-sm font-semibold text-teal-800">{independentLessons.length} {vi ? "bài tập" : "exercises"}</span></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{independentLessons.map(lesson => <Link className="rounded-2xl border bg-white p-6 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`/listening-lessons/independent/${lesson.slug}`} key={lesson.slug}><span className="text-sm font-black uppercase tracking-wide text-teal-700">{vi ? "Nghe và trả lời" : "Listen and answer"} · {lesson.questions.length} {vi ? "câu" : "questions"}</span><h3 className="mt-3 text-xl font-black">{vi ? lesson.titleVi : lesson.titleEn}</h3><p className="mt-2 text-slate-600">{vi ? lesson.descriptionVi : lesson.descriptionEn}</p><span className="mt-4 inline-block font-bold text-teal-800">{vi ? "Bắt đầu nghe →" : "Start listening →"}</span></Link>)}</div>
    </section>

    <section aria-labelledby="part-listening" className="mt-10"><div className="flex flex-wrap items-end justify-between gap-2"><h2 className="text-2xl font-black" id="part-listening">{vi ? "Bài học theo Part" : "Lessons by Part"}</h2><span className="text-sm font-semibold text-teal-800">{visiblePartExercises.length + lessons.length} {vi ? "bài tập" : "exercises"}</span></div>
      <nav aria-label={vi ? "Lọc theo Part" : "Filter by part"} className="mt-4 flex flex-wrap gap-2">{[null, 1, 2, 3, 4].map(value => <Link aria-current={selected === (value ?? undefined) ? "page" : undefined} className={`rounded-full px-4 py-2 font-semibold ${selected === (value ?? undefined) ? "bg-teal-800 text-white" : "border bg-white text-teal-800"}`} href={value ? `/listening-lessons?part=${value}` : "/listening-lessons"} key={value ?? "all"}>{value ? `Part ${value}` : (vi ? "Tất cả" : "All")}</Link>)}</nav>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visiblePartExercises.map(lesson => <Link className="rounded-2xl border bg-white p-6 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`/listening-lessons/part/${lesson.toeicPart}/${lesson.slug}`} key={lesson.slug}><span className="text-sm font-black uppercase tracking-wide text-teal-700">Part {lesson.toeicPart} · {vi ? "Nghe và trả lời" : "Listen and answer"}</span><h3 className="mt-3 text-xl font-black">{vi ? lesson.titleVi : lesson.titleEn}</h3><p className="mt-2 text-slate-600">{vi ? lesson.descriptionVi : lesson.descriptionEn}</p><span className="mt-4 inline-block font-bold text-teal-800">{vi ? "Bắt đầu nghe →" : "Start listening →"}</span></Link>)}{lessons.map(lesson => <Link className="rounded-2xl border bg-white p-6 hover:border-teal-500" href={`/listening-lessons/${lesson.id}`} key={lesson.id}><span className="text-sm font-black uppercase tracking-wide text-teal-700">Part {lesson.toeicPart}{lesson.hasImage ? ` · ${vi ? "Có ảnh" : "Image"}` : ""}</span><h3 className="mt-3 text-xl font-black">{lesson.title}</h3><p className="mt-2 text-slate-600">{lesson.description}</p></Link>)}</div>
    </section>
  </div></main>;
}
