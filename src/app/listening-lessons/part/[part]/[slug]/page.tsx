import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { IndependentLessonWorkspace } from "@/components/listening/independent-lesson-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getPartExercise } from "@/lib/listening-lessons/part-exercises";

export default async function PartListeningExercisePage({ params }: { params: Promise<{ part: string; slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/listening-lessons");
  const { part, slug } = await params;
  const lesson = getPartExercise(Number(part), slug);
  if (!lesson) notFound();
  const prefs = await getPreferences(user.id);
  const vi = prefs.interfaceLanguage === "vi";
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl">
    <LearnerNav locale={prefs.interfaceLanguage} />
    <Link className="mt-8 inline-block text-sm font-bold text-teal-700" href={`/listening-lessons?part=${lesson.toeicPart}`}>← {vi ? `Bài nghe Part ${lesson.toeicPart}` : `Part ${lesson.toeicPart} lessons`}</Link>
    <p className="mt-6 text-sm font-black uppercase tracking-wider text-teal-700">Part {lesson.toeicPart} · {vi ? "Bài luyện nghe" : "Listening exercise"}</p>
    <h1 className="mt-2 text-3xl font-black">{vi ? lesson.titleVi : lesson.titleEn}</h1>
    <p className="mt-3 max-w-3xl text-slate-600">{vi ? lesson.descriptionVi : lesson.descriptionEn}</p>
    <IndependentLessonWorkspace key={lesson.slug} lesson={lesson} locale={prefs.interfaceLanguage} />
  </div></main>;
}
