import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getDiagnosticChild } from "@/lib/diagnostic/service";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { getPreferences } from "@/lib/i18n/get-translations";
import { DiagnosticClient } from "./diagnostic-client";

export default async function DiagnosticRunPage({ params }: { params: Promise<{ runId: string }> }) {
  const [{ runId }, user, guest] = await Promise.all([params, getCurrentUser(), getGuestOwnerHash()]); if (!user && !guest) redirect("/diagnostic");
  const owner = user ? { userId: user.id } as const : { guestOwnerHash: guest! } as const; const { run, session } = await getDiagnosticChild(runId, owner); if (!run) notFound();
  if (run.status === "COMPLETED") redirect(`/diagnostic/${runId}/result`); if (run.status === "EXPIRED") redirect("/diagnostic?error=expired"); if (!session || session === "submitted") redirect(`/diagnostic/${runId}`);
  const preferences = await getPreferences(user?.id); return <DiagnosticClient completed={run.completedQuestions} locale={preferences.interfaceLanguage} partIndex={run.current!.diagnosticOrder!} runId={runId} session={session} total={run.totalQuestions} />;
}
