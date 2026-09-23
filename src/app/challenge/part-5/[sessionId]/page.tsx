import { notFound, redirect } from "next/navigation";
import { ReadingPracticeClient } from "@/app/practice/[sessionId]/practice-client";
import { getCurrentUser } from "@/lib/auth/session";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getPracticeSession } from "@/lib/practice/queries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Part5ChallengeRunPage({ params }: PageProps<"/challenge/part-5/[sessionId]">) {
  const [{ sessionId }, user, guestOwnerHash] = await Promise.all([params, getCurrentUser(), getGuestOwnerHash()]);
  if (!UUID.test(sessionId)) notFound();
  if (!user && !guestOwnerHash) redirect("/challenge/part-5");
  const session = await getPracticeSession(sessionId, user ? { userId: user.id } : { guestOwnerHash: guestOwnerHash! });
  if (!session) notFound();
  if (session === "submitted") redirect(`/challenge/part-5/${sessionId}/result`);
  if (session.mode !== "part_5" || session.questionCount !== 10 || session.questions.some((question) => question.part !== 5)) notFound();
  const locale = (await getPreferences(user?.id)).interfaceLanguage;
  return <ReadingPracticeClient challenge locale={locale} session={session} />;
}
