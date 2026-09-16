import { notFound, redirect } from "next/navigation";

import { getPracticeSession } from "@/lib/practice/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { diagnosticRunForSession } from "@/lib/diagnostic/service";

import { ReadingPracticeClient } from "./practice-client";
import { ListeningPracticeClient } from "./listening-practice-client";

export default async function PracticeSessionPage({ params }: PageProps<"/practice/[sessionId]">) {
  const [{ sessionId }, user, guestOwnerHash] = await Promise.all([params, getCurrentUser(), getGuestOwnerHash()]);
  if (!user && !guestOwnerHash) redirect("/try");
  const diagnostic = await diagnosticRunForSession(sessionId); if (diagnostic?.runId) redirect(diagnostic.status === "COMPLETED" ? `/diagnostic/${diagnostic.runId}/result` : `/diagnostic/${diagnostic.runId}`);
  const session = await getPracticeSession(sessionId, user ? { userId: user.id } : { guestOwnerHash: guestOwnerHash! });
  if (!session) notFound();
  if (session === "submitted") redirect(`/practice/${sessionId}/results`);
  const preferences = await getPreferences(user?.id);
  return session.skillArea === "LISTENING" ? <ListeningPracticeClient locale={preferences.interfaceLanguage} session={session} /> : <ReadingPracticeClient locale={preferences.interfaceLanguage} session={session} />;
}
