import { notFound, redirect } from "next/navigation";

import { getPracticeSession } from "@/lib/practice/queries";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LegacyPart5SessionPage({ params }: PageProps<"/practice/part-5/[sessionId]">) {
  const [{ sessionId }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) redirect("/sign-in");
  const session = await getPracticeSession(sessionId, user.id);
  if (!session) notFound();
  redirect(session === "submitted" ? `/practice/${sessionId}/results` : `/practice/${sessionId}`);
}
