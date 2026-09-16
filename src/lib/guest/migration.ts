import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
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
    const runs = await tx.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(eq(diagnosticRuns.guestOwnerHash, guestOwnerHash), isNull(diagnosticRuns.userId), gt(diagnosticRuns.expiresAt, new Date()))).for("update");
    if (!rows.length && !runs.length) return 0;
    for (const row of rows) {
      await tx.update(practiceSessions).set({ userId, guestOwnerHash: null, expiresAt: null }).where(and(eq(practiceSessions.id, row.id), eq(practiceSessions.guestOwnerHash, guestOwnerHash), isNull(practiceSessions.userId)));
      await tx.update(attemptAnswers).set({ userId }).where(and(eq(attemptAnswers.sessionId, row.id), isNull(attemptAnswers.userId)));
      await reconcileMasteryAnswers(tx, userId, row.source, await tx.select().from(attemptAnswers).where(and(eq(attemptAnswers.sessionId, row.id), eq(attemptAnswers.userId, userId))));
    }
    for (const run of runs) {
      await tx.update(diagnosticRuns).set({ userId, guestOwnerHash: null }).where(and(eq(diagnosticRuns.id, run.id), eq(diagnosticRuns.guestOwnerHash, guestOwnerHash), isNull(diagnosticRuns.userId)));
      const children = await tx.select({ id: practiceSessions.id, source: practiceSessions.source }).from(practiceSessions).where(and(eq(practiceSessions.diagnosticRunId, run.id), eq(practiceSessions.guestOwnerHash, guestOwnerHash)));
      for (const child of children) {
        await tx.update(practiceSessions).set({ userId, guestOwnerHash: null }).where(eq(practiceSessions.id, child.id));
        await tx.update(attemptAnswers).set({ userId }).where(and(eq(attemptAnswers.sessionId, child.id), isNull(attemptAnswers.userId)));
        await reconcileMasteryAnswers(tx, userId, child.source, await tx.select().from(attemptAnswers).where(and(eq(attemptAnswers.sessionId, child.id), eq(attemptAnswers.userId, userId))));
      }
    }
    return new Set([...rows.map((row) => row.id), ...runs.map((run) => run.id)]).size;
  });
  if (migrated) {
    await clearGuestIdentity();
    revalidatePath("/dashboard"); revalidatePath("/progress"); revalidatePath("/diagnosis"); revalidatePath("/mistakes");
    console.info("[guest:migration] success", { migrated });
  }
  return migrated;
}
