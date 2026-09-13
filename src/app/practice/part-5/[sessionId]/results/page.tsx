import { notFound, redirect } from "next/navigation";

import { getPracticeResult } from "@/lib/practice/queries";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LegacyPart5ResultsPage({ params }: PageProps<"/practice/part-5/[sessionId]/results">) {
  const [{ sessionId }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) redirect("/sign-in");
  const result = await getPracticeResult(sessionId, user.id);
  if (!result) notFound();
  redirect(result === "in_progress" ? `/practice/${sessionId}` : `/practice/${sessionId}/results`);
}
