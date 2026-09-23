import "server-only";
import { and, asc, eq, gt, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { practiceSessions, productEvents } from "@/db/schema";
import { getGuestOwnerHash } from "@/lib/guest/identity";
import { recordProductEvent, type ProductActor } from "@/lib/product-analytics/service";

const route = "/challenge/part-5";

export async function recordChallengeStart(actor: ProductActor, sessionId: string) {
  await recordProductEvent({ ...actor, eventName: "challenge_started", sessionId, route, deduplicationKey: `challenge:start:${sessionId}` });
}

export async function recordChallengeCompletion(actor: ProductActor, sessionId: string) {
  const [started] = await db.select({ id: productEvents.id }).from(productEvents).where(and(
    eq(productEvents.eventName, "challenge_started"), eq(productEvents.sessionId, sessionId),
    actor.userId ? eq(productEvents.userId, actor.userId) : actor.guestReference ? eq(productEvents.guestReference, actor.guestReference) : eq(productEvents.id, "00000000-0000-0000-0000-000000000000"),
  )).limit(1);
  if (started) await recordProductEvent({ ...actor, eventName: "challenge_completed", sessionId, route: `${route}/result`, deduplicationKey: `challenge:complete:${sessionId}` });
}

export async function recordChallengeSignup(userId: string) {
  const guestReference = await getGuestOwnerHash();
  if (!guestReference) return;
  const [completed] = await db.select({ sessionId: productEvents.sessionId }).from(productEvents).where(and(
    eq(productEvents.eventName, "challenge_completed"), eq(productEvents.guestReference, guestReference), isNotNull(productEvents.sessionId),
  )).orderBy(asc(productEvents.occurredAt)).limit(1);
  if (completed?.sessionId) await recordProductEvent({ eventName: "signup_after_challenge", userId, sessionId: completed.sessionId, route: "/sign-up", deduplicationKey: `challenge:signup:${userId}` });
}

export async function recordFirstWorkoutAfterChallenge(userId: string, sessionId: string) {
  const [signup] = await db.select({ occurredAt: productEvents.occurredAt }).from(productEvents).where(and(
    eq(productEvents.eventName, "signup_after_challenge"), eq(productEvents.userId, userId),
  )).limit(1);
  if (!signup) return;
  const [first] = await db.select({ id: practiceSessions.id }).from(practiceSessions).where(and(
    eq(practiceSessions.userId, userId), eq(practiceSessions.source, "recommended"), eq(practiceSessions.status, "submitted"),
    gt(practiceSessions.submittedAt, signup.occurredAt),
  )).orderBy(asc(practiceSessions.submittedAt), asc(practiceSessions.id)).limit(1);
  if (first?.id === sessionId) await recordProductEvent({ eventName: "first_authenticated_workout_after_challenge", userId, sessionId, route: "/practice", deduplicationKey: `challenge:first-workout:${userId}` });
}
