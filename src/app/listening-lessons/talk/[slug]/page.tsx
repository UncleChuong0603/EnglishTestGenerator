import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { LessonWorkspace } from "@/components/listening/lesson-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getListeningTalk } from "@/lib/listening-lessons/talks";

export default async function ListeningTalkPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/listening-lessons");
  const { slug } = await params;
  const talk = getListeningTalk(slug);
  if (!talk) notFound();
  const prefs = await getPreferences(user.id);
  const vi = prefs.interfaceLanguage === "vi";
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl pb-20">
    <LearnerNav locale={prefs.interfaceLanguage} />
    <Link className="mt-8 inline-block text-sm font-bold text-teal-700" href="/listening-lessons">← {vi ? "Luyện nghe audio" : "Audio shadowing"}</Link>
    <p className="mt-6 text-sm font-black uppercase tracking-wider text-teal-700">{talk.minutes} {vi ? "phút · Bài chia sẻ" : "minutes · Personal talk"}</p>
    <h1 className="mt-2 text-3xl font-black">{vi ? talk.titleVi : talk.titleEn}</h1>
    <p className="mt-3 max-w-3xl text-slate-600">{vi ? talk.descriptionVi : talk.descriptionEn}</p>
    <LessonWorkspace audioUrl={talk.audioUrl} imageAlt={null} imageUrl={null} locale={prefs.interfaceLanguage} transcript={talk.transcript} />
  </div></main>;
}
