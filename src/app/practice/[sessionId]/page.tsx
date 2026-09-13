import { notFound, redirect } from "next/navigation";

import { getPracticeSession } from "@/lib/practice/queries";
import { createClient } from "@/lib/supabase/server";
import { getPreferences } from "@/lib/i18n/get-translations";

import { ReadingPracticeClient } from "./practice-client";

export default async function PracticeSessionPage({ params }: PageProps<"/practice/[sessionId]">) {
  const [{ sessionId }, supabase] = await Promise.all([params, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const session = await getPracticeSession(sessionId, user.id);
  if (!session) notFound();
  if (session === "submitted") redirect(`/practice/${sessionId}/results`);
  const preferences = await getPreferences(user.id);
  return <ReadingPracticeClient locale={preferences.interfaceLanguage} session={session} />;
}
