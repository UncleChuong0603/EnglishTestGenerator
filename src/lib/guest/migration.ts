import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attemptAnswers, practiceSessions } from "@/db/schema";
import { clearGuestIdentity, getGuestOwnerHash } from "./identity";

export async function migrateGuestAttempts(userId: string) {
  const guestOwnerHash = await getGuestOwnerHash();
  if (!guestOwnerHash) return 0;
  const migrated = await db.transaction(async (tx) => {
    const rows = await tx.select({ id: practiceSessions.id }).from(practiceSessions).where(and(eq(practiceSessions.guestOwnerHash, guestOwnerHash), isNull(practiceSessions.userId), eq(practiceSessions.status, "submitted"), gt(practiceSessions.expiresAt, new Date()))).for("update");
    if (!rows.length) return 0;
    for (const row of rows) {
      await tx.update(practiceSessions).set({ userId, guestOwnerHash: null, expiresAt: null }).where(and(eq(practiceSessions.id, row.id), eq(practiceSessions.guestOwnerHash, guestOwnerHash), isNull(practiceSessions.userId)));
      await tx.update(attemptAnswers).set({ userId }).where(and(eq(attemptAnswers.sessionId, row.id), isNull(attemptAnswers.userId)));
    }
    return rows.length;
  });
  if (migrated) {
    await clearGuestIdentity();
    revalidatePath("/dashboard"); revalidatePath("/progress"); revalidatePath("/diagnosis");
    console.info("[guest:migration] success", { migrated });
  }
  return migrated;
}
