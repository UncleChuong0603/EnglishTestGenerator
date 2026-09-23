import "server-only";
import { and, eq, gt, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attemptAnswers, diagnosticRuns, practiceSessions } from "@/db/schema";
import { clearGuestIdentity, getGuestOwnerHash } from "./identity";
import { reconcileMasteryAnswers } from "@/lib/mastery/persistence";

export async function migrateGuestAttempts(userId: string) {
  const guestOwnerHash = await getGuestOwnerHash();
  if (!guestOwnerHash) return 0;
  const migrated = await db.transaction(async (tx) => {
    const rows = await tx.select({ id: practiceSessions.id, source: practiceSessions.source }).from(practiceSessions).where(and(eq(practiceSessions.guestOwnerHash, guestOwnerHash), isNull(practiceSessions.userId), eq(practiceSessions.status, "submitted"), gt(practiceSessions.expiresAt, new Date()))).for("update");
    const runs = await tx.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(eq(diagnosticRuns.guestOwnerHash, guestOwnerHash), isNull(diagnosticRuns.userId), eq(diagnosticRuns.status, "COMPLETED"), gt(diagnosticRuns.expiresAt, new Date()))).for("update");
    if (!rows.length && !runs.length) return 0;
    const runIds = runs.map((run) => run.id);
    const children = runIds.length ? await tx.select({ id: practiceSessions.id, source: practiceSessions.source }).from(practiceSessions).where(and(inArray(practiceSessions.diagnosticRunId, runIds), eq(practiceSessions.guestOwnerHash, guestOwnerHash), isNull(practiceSessions.userId), eq(practiceSessions.status, "submitted"))).for("update") : [];
    const sessions = [...new Map([...rows, ...children].map((row) => [row.id, row])).values()];
    if (sessions.length) {
      const ids = sessions.map((row) => row.id);
      await tx.update(practiceSessions).set({ userId, guestOwnerHash: null, expiresAt: null }).where(and(inArray(practiceSessions.id, ids), eq(practiceSessions.guestOwnerHash, guestOwnerHash), isNull(practiceSessions.userId)));
      await tx.update(attemptAnswers).set({ userId }).where(and(inArray(attemptAnswers.sessionId, ids), isNull(attemptAnswers.userId)));
      const answers = await tx.select().from(attemptAnswers).where(and(inArray(attemptAnswers.sessionId, ids), eq(attemptAnswers.userId, userId)));
      const bySession = new Map<string, typeof answers>();
      for (const answer of answers) {
        const existing = bySession.get(answer.sessionId) ?? [];
        existing.push(answer);
        bySession.set(answer.sessionId, existing);
      }
      for (const row of sessions) await reconcileMasteryAnswers(tx, userId, row.source, bySession.get(row.id) ?? []);
    }
    if (runIds.length) await tx.update(diagnosticRuns).set({ userId, guestOwnerHash: null }).where(and(inArray(diagnosticRuns.id, runIds), eq(diagnosticRuns.guestOwnerHash, guestOwnerHash), isNull(diagnosticRuns.userId)));
    return new Set([...rows.map((row) => row.id), ...runs.map((run) => run.id)]).size;
  });
  if (migrated) {
    await clearGuestIdentity();
    revalidatePath("/dashboard"); revalidatePath("/progress"); revalidatePath("/diagnosis"); revalidatePath("/mistakes");
    console.info("[guest:migration] success", { migrated });
  }
  return migrated;
}
