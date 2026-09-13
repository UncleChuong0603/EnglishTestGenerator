import { notFound, redirect } from "next/navigation";

import { getPracticeSession } from "@/lib/practice/queries";
import { createClient } from "@/lib/supabase/server";

export default async function LegacyPart5SessionPage({ params }: PageProps<"/practice/part-5/[sessionId]">) {
  const [{ sessionId }, supabase] = await Promise.all([params, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const session = await getPracticeSession(sessionId, user.id);
  if (!session) notFound();
  redirect(session === "submitted" ? `/practice/${sessionId}/results` : `/practice/${sessionId}`);
}
