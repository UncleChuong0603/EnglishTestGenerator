import "server-only";

import { and, asc, eq, gt, isNotNull, lt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { mobileNotificationPreferences, mobilePushDeliveries, mobilePushDevices, profiles, questionMastery, userVocabulary, users } from "@/db/schema";
import { getGamificationSummary } from "@/lib/gamification/queries";
import { getVietnamLocalDate } from "@/lib/gamification/time";
import { getDashboardData } from "@/lib/dashboard/service";
import { getServerEnv } from "@/lib/env";
import { selectRetentionKind, shouldRemovePushDevice, type RetentionKind } from "./policy";

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  enabled: false,
  todaysWorkout: true,
  vocabularyDue: true,
  unresolvedReview: true,
  weeklyReview: true,
  streak: true,
} as const;

export class PushDeviceOwnershipError extends Error {}

export async function getNotificationPreferences(userId: string) {
  const [row] = await db.select().from(mobileNotificationPreferences).where(eq(mobileNotificationPreferences.userId, userId)).limit(1);
  return row ? {
    enabled: row.enabled,
    todaysWorkout: row.todaysWorkout,
    vocabularyDue: row.vocabularyDue,
    unresolvedReview: row.unresolvedReview,
    weeklyReview: row.weeklyReview,
    streak: row.streak,
  } : { ...DEFAULT_NOTIFICATION_PREFERENCES };
}

type NotificationPreferences = { [Key in keyof typeof DEFAULT_NOTIFICATION_PREFERENCES]: boolean };

export async function updateNotificationPreferences(userId: string, input: NotificationPreferences) {
  const now = new Date();
  await db.insert(mobileNotificationPreferences).values({ userId, ...input, updatedAt: now }).onConflictDoUpdate({
    target: mobileNotificationPreferences.userId,
    set: { ...input, updatedAt: now },
  });
  return getNotificationPreferences(userId);
}

export async function registerPushDevice(userId: string, input: { expoPushToken: string; platform: "android" | "ios" }) {
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${input.expoPushToken}, 0))`);
    const [existing] = await tx.select({ id: mobilePushDevices.id, userId: mobilePushDevices.userId }).from(mobilePushDevices).where(eq(mobilePushDevices.expoPushToken, input.expoPushToken)).for("update").limit(1);
    if (existing && existing.userId !== userId) throw new PushDeviceOwnershipError("PUSH_TOKEN_ALREADY_OWNED");
    if (existing) {
      await tx.update(mobilePushDevices).set({ platform: input.platform, lastSeenAt: new Date(), updatedAt: new Date() }).where(and(eq(mobilePushDevices.id, existing.id), eq(mobilePushDevices.userId, userId)));
      return existing.id;
    }
    const [created] = await tx.insert(mobilePushDevices).values({ userId, ...input }).returning({ id: mobilePushDevices.id });
    return created.id;
  });
}

export async function revokePushDevice(userId: string, deviceId: string) {
  const removed = await db.delete(mobilePushDevices).where(and(eq(mobilePushDevices.id, deviceId), eq(mobilePushDevices.userId, userId))).returning({ id: mobilePushDevices.id });
  return removed.length > 0;
}

type PushMessage = { kind: RetentionKind; title: string; body: string; data: { target: "workout" | "vocabulary" | "mistakes" | "weekly" } };

function vietnamWeekday(now: Date) {
  return new Date(now.getTime() + 7 * 60 * 60_000).getUTCDay();
}

export async function chooseRetentionMessage(userId: string, preferences: Awaited<ReturnType<typeof getNotificationPreferences>>, vi: boolean, now: Date): Promise<PushMessage | null> {
  const [dueRows, mistakeRows, dashboard, streak] = await Promise.all([
    db.select({ id: userVocabulary.id }).from(userVocabulary).where(and(eq(userVocabulary.userId, userId), lte(userVocabulary.dueAt, now))).limit(50),
    db.select({ id: questionMastery.id }).from(questionMastery).where(and(eq(questionMastery.userId, userId), eq(questionMastery.status, "UNRESOLVED"))).limit(50),
    getDashboardData(userId),
    preferences.streak ? getGamificationSummary(userId) : Promise.resolve({ currentStreak: 0, bestStreak: 0 }),
  ]);
  const streakText = preferences.streak && streak.currentStreak > 0
    ? (vi ? ` Chuỗi hiện tại: ${streak.currentStreak} ngày.` : ` Current streak: ${streak.currentStreak} days.`)
    : "";
  const kind = selectRetentionKind({ preferences, vietnamWeekday: vietnamWeekday(now), dueVocabulary: dueRows.length, unresolvedMistakes: mistakeRows.length, completedQuestionsToday: dashboard.completedQuestionsToday });
  if (kind === "WEEKLY_REVIEW") return { kind, title: vi ? "Xem lại tuần học" : "Weekly review", body: (vi ? "Kế hoạch tuần của bạn đã sẵn sàng." : "Your weekly learning plan is ready.") + streakText, data: { target: "weekly" } };
  if (kind === "VOCAB_DUE") return { kind, title: vi ? "Từ vựng đến hạn" : "Vocabulary due", body: (vi ? `${dueRows.length}${dueRows.length === 50 ? "+" : ""} từ đang chờ ôn.` : `${dueRows.length}${dueRows.length === 50 ? "+" : ""} words are ready to review.`) + streakText, data: { target: "vocabulary" } };
  if (kind === "UNRESOLVED_REVIEW") return { kind, title: vi ? "Câu sai cần ôn" : "Mistake review", body: (vi ? `${mistakeRows.length}${mistakeRows.length === 50 ? "+" : ""} câu chưa thành thạo.` : `${mistakeRows.length}${mistakeRows.length === 50 ? "+" : ""} questions are not mastered yet.`) + streakText, data: { target: "mistakes" } };
  if (kind === "TODAYS_WORKOUT") return { kind, title: vi ? "Bài tập hôm nay" : "Today’s Workout", body: (vi ? "Bài luyện phù hợp tiếp theo đã sẵn sàng." : "Your next useful practice is ready.") + streakText, data: { target: "workout" } };
  return null;
}

type ExpoTicket = { status: "ok"; id: string } | { status: "error"; message?: string; details?: { error?: string } };
type ExpoReceipt = { status: "ok" } | { status: "error"; message?: string; details?: { error?: string } };

function expoHeaders() {
  const token = getServerEnv().EXPO_PUSH_ACCESS_TOKEN;
  return { Accept: "application/json", "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function dispatchRetentionPushes(now = new Date()) {
  const localDate = getVietnamLocalDate(now);
  const rows = await db.select({
    deviceId: mobilePushDevices.id,
    userId: mobilePushDevices.userId,
    token: mobilePushDevices.expoPushToken,
    interfaceLanguage: profiles.interfaceLanguage,
    enabled: mobileNotificationPreferences.enabled,
    todaysWorkout: mobileNotificationPreferences.todaysWorkout,
    vocabularyDue: mobileNotificationPreferences.vocabularyDue,
    unresolvedReview: mobileNotificationPreferences.unresolvedReview,
    weeklyReview: mobileNotificationPreferences.weeklyReview,
    streak: mobileNotificationPreferences.streak,
  }).from(mobilePushDevices)
    .innerJoin(mobileNotificationPreferences, eq(mobileNotificationPreferences.userId, mobilePushDevices.userId))
    .innerJoin(users, eq(users.id, mobilePushDevices.userId))
    .leftJoin(profiles, eq(profiles.id, mobilePushDevices.userId))
    .where(and(eq(mobileNotificationPreferences.enabled, true), eq(users.status, "active")))
    .orderBy(asc(mobilePushDevices.createdAt));
  let sent = 0; let suppressed = 0; let failed = 0;
  for (const row of rows) {
    const preferences = { enabled: row.enabled, todaysWorkout: row.todaysWorkout, vocabularyDue: row.vocabularyDue, unresolvedReview: row.unresolvedReview, weeklyReview: row.weeklyReview, streak: row.streak };
    const message = await chooseRetentionMessage(row.userId, preferences, row.interfaceLanguage !== "en", now);
    if (!message) { suppressed += 1; continue; }
    const [delivery] = await db.insert(mobilePushDeliveries).values({ userId: row.userId, deviceId: row.deviceId, kind: message.kind, localDate }).onConflictDoNothing().returning({ id: mobilePushDeliveries.id });
    if (!delivery) { suppressed += 1; continue; }
    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", { method: "POST", headers: expoHeaders(), body: JSON.stringify({ to: row.token, title: message.title, body: message.body, data: message.data, sound: "default", channelId: "learning-reminders" }), signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`EXPO_PUSH_${response.status}`);
      const payload = await response.json() as { data?: ExpoTicket };
      const ticket = payload.data;
      if (!ticket) throw new Error("EXPO_PUSH_INVALID_RESPONSE");
      if (ticket.status === "error") {
        const code = ticket.details?.error ?? "UNKNOWN";
        await db.update(mobilePushDeliveries).set({ status: "FAILED", errorCode: code, sentAt: now, updatedAt: now }).where(eq(mobilePushDeliveries.id, delivery.id));
        if (shouldRemovePushDevice(code)) await db.delete(mobilePushDevices).where(eq(mobilePushDevices.id, row.deviceId));
        failed += 1;
      } else {
        await db.update(mobilePushDeliveries).set({ status: "TICKETED", expoTicketId: ticket.id, sentAt: now, updatedAt: now }).where(eq(mobilePushDeliveries.id, delivery.id));
        sent += 1;
      }
    } catch {
      await db.delete(mobilePushDeliveries).where(eq(mobilePushDeliveries.id, delivery.id));
      failed += 1;
    }
  }
  return { sent, suppressed, failed };
}

export async function processPushReceipts(now = new Date()) {
  const rows = await db.select({ id: mobilePushDeliveries.id, deviceId: mobilePushDeliveries.deviceId, ticketId: mobilePushDeliveries.expoTicketId }).from(mobilePushDeliveries).where(and(
    eq(mobilePushDeliveries.status, "TICKETED"),
    isNotNull(mobilePushDeliveries.expoTicketId),
    lt(mobilePushDeliveries.sentAt, new Date(now.getTime() - 15 * 60_000)),
    gt(mobilePushDeliveries.sentAt, new Date(now.getTime() - 24 * 60 * 60_000)),
  )).limit(1000);
  if (!rows.length) return { checked: 0, delivered: 0, failed: 0, removedDevices: 0 };
  const response = await fetch("https://exp.host/--/api/v2/push/getReceipts", { method: "POST", headers: expoHeaders(), body: JSON.stringify({ ids: rows.map((row) => row.ticketId) }), signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`EXPO_RECEIPTS_${response.status}`);
  const payload = await response.json() as { data?: Record<string, ExpoReceipt> };
  let delivered = 0; let failed = 0; let removedDevices = 0;
  for (const row of rows) {
    const receipt = row.ticketId ? payload.data?.[row.ticketId] : undefined;
    if (!receipt) continue;
    if (receipt.status === "ok") {
      await db.update(mobilePushDeliveries).set({ status: "DELIVERED", receiptCheckedAt: now, updatedAt: now }).where(eq(mobilePushDeliveries.id, row.id));
      delivered += 1;
    } else {
      const code = receipt.details?.error ?? "UNKNOWN";
      await db.update(mobilePushDeliveries).set({ status: "FAILED", errorCode: code, receiptCheckedAt: now, updatedAt: now }).where(eq(mobilePushDeliveries.id, row.id));
      if (shouldRemovePushDevice(code) && row.deviceId) { const removed = await db.delete(mobilePushDevices).where(eq(mobilePushDevices.id, row.deviceId)).returning({ id: mobilePushDevices.id }); removedDevices += removed.length; }
      failed += 1;
    }
  }
  return { checked: rows.length, delivered, failed, removedDevices };
}
