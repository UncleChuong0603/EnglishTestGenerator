import { notFound, redirect } from "next/navigation";

import { getPracticeSession } from "@/lib/practice/queries";
import { createClient } from "@/lib/supabase/server";
import { PracticeClient } from "./practice-client";

type PageProps = { params: Promise<{ sessionId: string }> };

export default async function PracticeSessionPage({ params }: PageProps) {
  const [{ sessionId }, supabase] = await Promise.all([params, createClient()]);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const session = await getPracticeSession(sessionId, user.id);
  if (!session) notFound();
  if (session === "submitted") redirect(`/practice/part-5/${sessionId}/results`);

  return <PracticeClient session={session} />;
}
