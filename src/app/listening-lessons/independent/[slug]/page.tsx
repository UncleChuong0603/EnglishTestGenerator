import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { IndependentLessonWorkspace } from "@/components/listening/independent-lesson-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getIndependentLesson } from "@/lib/listening-lessons/independent";

export default async function IndependentListeningLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/listening-lessons");
  const { slug } = await params;
  const lesson = getIndependentLesson(slug);
  if (!lesson) notFound();
  const prefs = await getPreferences(user.id);
  const vi = prefs.interfaceLanguage === "vi";

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl">
    <LearnerNav locale={prefs.interfaceLanguage} />
    <Link className="mt-8 inline-block text-sm font-bold text-teal-700" href="/listening-lessons">← {vi ? "Thư viện luyện nghe" : "Listening library"}</Link>
    <p className="mt-6 text-sm font-black uppercase tracking-wider text-teal-700">{vi ? "Luyện nghe độc lập" : "Independent listening"}</p>
    <h1 className="mt-2 text-3xl font-black">{vi ? lesson.titleVi : lesson.titleEn}</h1>
    <p className="mt-3 max-w-3xl text-slate-600">{vi ? lesson.descriptionVi : lesson.descriptionEn}</p>
    <IndependentLessonWorkspace lesson={lesson} locale={prefs.interfaceLanguage} />
  </div></main>;
}
