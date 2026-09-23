import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { LessonWorkspace } from "@/components/listening/lesson-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getPublishedListeningLesson } from "@/lib/listening-lessons/service";

export default async function ListeningLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in?next=/listening-lessons");
  const { id } = await params;
  const [prefs, lesson] = await Promise.all([getPreferences(user.id), getPublishedListeningLesson(id)]);
  if (!lesson) notFound(); const vi = prefs.interfaceLanguage === "vi";
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl"><LearnerNav locale={prefs.interfaceLanguage} /><Link className="mt-8 inline-block text-sm font-bold text-teal-700" href="/listening-lessons">← {vi ? "Thư viện luyện nghe" : "Listening library"}</Link><p className="mt-6 text-sm font-black uppercase tracking-wider text-teal-700">Part {lesson.toeicPart} · {vi ? "Bài học" : "Study lesson"}</p><h1 className="mt-2 text-3xl font-black">{lesson.title}</h1>{lesson.description && <p className="mt-3 max-w-3xl text-slate-600">{lesson.description}</p>}<LessonWorkspace audioUrl={lesson.audioUrl} imageAlt={lesson.imageAlt} imageUrl={lesson.imageUrl} locale={prefs.interfaceLanguage} transcript={lesson.transcript} /></div></main>;
}
