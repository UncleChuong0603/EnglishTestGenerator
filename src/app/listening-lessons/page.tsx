import Link from "next/link";
import { LearnerNav } from "@/components/learner-nav";
import {
  ShadowingPlayer,
  type ShadowingClip,
} from "@/components/listening/shadowing-player";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { listeningTalks } from "@/lib/listening-lessons/talks";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({
  title: "Luyện nghe tiếng Anh online với audio và transcript",
  description: "Nghe các bài nói tiếng Anh tự nhiên, theo dõi transcript từng câu và luyện shadowing miễn phí theo thời lượng, chủ đề.",
  canonical: "/listening-lessons",
});

export default async function ListeningLessonsPage() {
  const user = await getCurrentUser();
  const prefs = await getPreferences(user?.id);
  const vi = prefs.interfaceLanguage === "vi";
  const clips: ShadowingClip[] = listeningTalks.map((talk) => ({
    id: talk.slug,
    minutes: talk.minutes,
    topic: vi ? talk.topicVi : talk.topicEn,
    title: vi ? talk.titleVi : talk.titleEn,
    audioUrl: talk.audioUrl,
    transcript: talk.transcript,
  }));

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-6 text-[#172821]">
      <div className="mx-auto max-w-6xl pb-20">
        <LearnerNav locale={prefs.interfaceLanguage} />
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-[#245a43]">
            {vi ? "Ôn tập / Luyện nghe audio" : "Review / Audio shadowing"}
          </p>
          <h1 className="mt-3 text-3xl font-black">
            {vi
              ? "Nghe một câu chuyện, theo dõi từng câu"
              : "Listen to a story, follow each sentence"}
          </h1>
          <p className="mt-2 max-w-3xl leading-7 text-[#45584d]">
            {vi
              ? "Nghe một bài chia sẻ tự nhiên, theo dõi script và luyện nói theo. Khi muốn đổi bài, chọn thời lượng và chủ đề ở khu riêng phía dưới."
              : "Listen to a natural personal talk, follow the script, and speak along. When you want a new talk, choose its length and topic in the separate section below."}
          </p>
        </div>

        <ShadowingPlayer clips={clips} locale={prefs.interfaceLanguage} signedIn={Boolean(user)} />

        <section className="mt-10 rounded-2xl border border-[#b9d7c2] bg-[#eef3eb] p-6 sm:p-8">
          <p className="text-sm font-black uppercase tracking-wide text-[#245a43]">
            {vi ? "Luyện nghe chủ động" : "Active listening"}
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {vi
              ? "Nghe rồi chép lại trước khi xem transcript"
              : "Listen and transcribe before seeing the transcript"}
          </h2>
          <p className="mt-2 max-w-3xl leading-7 text-[#45584d]">
            {vi
              ? "Dùng các segment 1 phút có audio và transcript đã được biên soạn; kiểm tra từ nghe thiếu rồi thử lại."
              : "Use curated one-minute audio/transcript segments, check missed words, then retry."}
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#245a43] px-5 font-bold text-white hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]"
            href={user ? "/listening-lessons/dictation" : "/sign-in?next=%2Flistening-lessons%2Fdictation"}
          >
            {user ? (vi ? "Mở Dictation" : "Open Dictation") : (vi ? "Đăng nhập để mở Dictation" : "Sign in to open Dictation")}
          </Link>
        </section>

      </div>
    </main>
  );
}
