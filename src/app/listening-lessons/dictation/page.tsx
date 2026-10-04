import { LearnerNav } from "@/components/learner-nav";
import { DictationCatalog } from "@/components/listening/dictation-catalog";
import { requireUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function DictationPage() {
  const user = await requireUser();
  const prefs = await getPreferences(user.id);
  const vi = prefs.interfaceLanguage === "vi";
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-6xl pb-20">
        <LearnerNav locale={prefs.interfaceLanguage} />
        <header className="mt-8">
          <p className="text-sm font-black uppercase tracking-wide text-teal-700">
            {vi ? "Luyện nghe chủ động" : "Active listening"}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">
            {vi ? "Nghe – chép chính tả" : "Listening dictation"}
          </h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            {vi
              ? "Nghe một segment 1 phút, chép điều bạn nghe, kiểm tra transcript rồi thử lại. Đây là tín hiệu luyện tập của từng segment, không phải dự đoán điểm TOEIC."
              : "Listen to a one-minute segment, transcribe it, check the transcript, then retry. This is a segment-level practice signal, not a TOEIC score prediction."}
          </p>
        </header>
        <DictationCatalog locale={prefs.interfaceLanguage} />
      </div>
    </main>
  );
}
