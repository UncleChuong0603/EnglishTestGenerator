import { notFound, redirect } from "next/navigation";

import { getPracticeResult } from "@/lib/practice/queries";
import { createClient } from "@/lib/supabase/server";

export default async function LegacyPart5ResultsPage({ params }: PageProps<"/practice/part-5/[sessionId]/results">) {
  const [{ sessionId }, supabase] = await Promise.all([params, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");
  const result = await getPracticeResult(sessionId, user.id);
  if (!result) notFound();
  redirect(result === "in_progress" ? `/practice/${sessionId}` : `/practice/${sessionId}/results`);
}
