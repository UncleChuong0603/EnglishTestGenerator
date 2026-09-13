import { notFound, redirect } from "next/navigation";
import { finalizeDemoTest, getDemoTestSession } from "@/lib/demo-test/queries";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
import { DemoTestClient } from "./test-client";

export default async function DemoTestPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const [{ sessionId }, user] = await Promise.all([params, getCurrentUser()]);
  if (!user) redirect("/sign-in");
  const session = await getDemoTestSession(sessionId, user.id);
  if (!session) notFound();
  if (session === "submitted") redirect(`/demo-test/${sessionId}/results`);
  if (session === "expired") {
    await finalizeDemoTest(sessionId, user.id, "time_expired");
    redirect(`/demo-test/${sessionId}/results`);
  }
  const preferences = await getPreferences(user.id);
  return <DemoTestClient locale={preferences.interfaceLanguage} session={session} />;
}
