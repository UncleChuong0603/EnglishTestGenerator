import Link from "next/link";
import { redirect } from "next/navigation";
import { LearnerNav } from "@/components/learner-nav";
import { ShadowingPlayer, type ShadowingClip } from "@/components/listening/shadowing-player";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { listeningTalks } from "@/lib/listening-lessons/talks";

export default async function ListeningLessonsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/listening-lessons");
  const prefs = await getPreferences(user.id);
  const vi = prefs.interfaceLanguage === "vi";
  const clips: ShadowingClip[] = listeningTalks.map(talk => ({
    id: talk.slug,
    minutes: talk.minutes,
    title: vi ? talk.titleVi : talk.titleEn,
    audioUrl: talk.audioUrl,
    transcript: talk.transcript,
  }));

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900"><div className="mx-auto max-w-6xl pb-20">
    <LearnerNav locale={prefs.interfaceLanguage} />
    <div className="mt-8">
      <p className="text-sm font-bold uppercase tracking-wider text-teal-700">{vi ? "Ôn tập / Luyện nghe audio" : "Review / Audio shadowing"}</p>
      <h1 className="mt-3 text-3xl font-black">{vi ? "Nghe một câu chuyện, theo dõi từng câu" : "Listen to a story, follow each sentence"}</h1>
      <p className="mt-2 max-w-3xl text-slate-600">{vi ? "Chọn bài chia sẻ tự nhiên theo thời lượng và chủ đề. Mỗi audio có câu chuyện riêng; nghe, nhìn trước câu tiếp theo và luyện nói theo, không có câu hỏi hay chấm điểm." : "Choose a natural personal talk by length and topic. Every audio tells a different story, with a transcript you can follow and speak along to."}</p>
    </div>

    <ShadowingPlayer clips={clips} locale={prefs.interfaceLanguage} />

    <section aria-labelledby="talks-heading" className="mt-12">
      <div><h2 className="text-2xl font-black" id="talks-heading">{vi ? "Khám phá bài nghe" : "Explore talks"}</h2><p className="mt-1 text-slate-600">{vi ? "Các chủ đề độc lập về đời sống, gia đình, cộng đồng và trải nghiệm cá nhân." : "Independent talks about everyday life, family, community, and personal experiences."}</p></div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{listeningTalks.map(talk => <Link className="rounded-2xl border bg-white p-6 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`/listening-lessons/talk/${talk.slug}`} key={talk.slug}><span className="text-sm font-black uppercase tracking-wide text-teal-700">{talk.minutes} {vi ? "phút" : talk.minutes === 1 ? "minute" : "minutes"} · {vi ? talk.topicVi : talk.topicEn}</span><h3 className="mt-3 text-xl font-black">{vi ? talk.titleVi : talk.titleEn}</h3><p className="mt-2 text-slate-600">{vi ? talk.descriptionVi : talk.descriptionEn}</p><span className="mt-4 inline-block font-bold text-teal-800">{vi ? "Nghe bài này →" : "Listen to this talk →"}</span></Link>)}</div>
    </section>
  </div></main>;
}
