import { LearnerNav } from "@/components/learner-nav";
import { DictationWorkspace } from "@/components/listening/dictation-workspace";
import { requireUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function DictationSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const prefs = await getPreferences(user.id);
  const { id } = await params;
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-6xl pb-20">
        <LearnerNav locale={prefs.interfaceLanguage} />
        <DictationWorkspace locale={prefs.interfaceLanguage} sessionId={id} />
      </div>
    </main>
  );
}
