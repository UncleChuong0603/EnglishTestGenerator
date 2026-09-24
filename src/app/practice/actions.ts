"use server";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { attemptAnswers, listeningTranscripts, practiceSessionQuestions, practiceSessions, questionOptions, questionSolutions, questions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { createGuestListeningPracticeSession, createGuestReadingPracticeSession, createListeningPracticeSession, createMasteryReviewSession, createPreferUnseenReadingSession, createReadingPracticeSession, createRecommendedListeningPracticeSession, createRecommendedReadingPracticeSession, validatePracticeConfig } from "@/lib/practice/selector";
import { getGuestOwnerHash, requireGuestOwnerHash } from "@/lib/guest/identity";
import { createAuthorizedListeningMediaUrl } from "@/lib/listening/media-access";
import { canUnlockListeningGroupReview, hasExactCompleteGroupAnswers } from "@/lib/listening/group-submission";
import { createMediaStorage } from "@/lib/media/storage";
import type { PracticeConfig, ReadingPracticeMode, SubmittedAnswer } from "@/lib/practice/types";
import { evaluateMultipleChoice } from "@/lib/toeic/evaluation";
import { isListeningPart, loadRecommendedWorkout } from "@/lib/diagnosis/service";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { reconcileMasteryAnswers } from "@/lib/mastery/persistence";
import { UsageLimitError } from "@/lib/entitlements/service";
import { getEffectiveCapabilities } from "@/lib/entitlements/service";
import { getReadingRecommendation } from "@/lib/practice/recommendation";
import { getMistakeCounts } from "@/lib/mastery/queries";
import { awardCompletedLearning } from "@/lib/gamification/award";
import { getLearnerGoal } from "@/lib/goals/service";
import { getUsageStatus } from "@/lib/entitlements/service";
import { getDailyWorkload, getGroupSafeWorkoutSize } from "@/lib/workout/policy";
import { recordChallengeCompletion, recordFirstWorkoutAfterChallenge } from "@/lib/challenge/acquisition";

function parseConfig(formData: FormData): PracticeConfig | null { const config = { mode: String(formData.get("mode") ?? "") as ReadingPracticeMode, targetQuestionCount: Number(formData.get("questionCount")), source: formData.get("source") === "recommended" ? "recommended" : "custom", skill: String(formData.get("skill") ?? "").trim() || undefined, subSkill: String(formData.get("subSkill") ?? "").trim() || undefined } as PracticeConfig; return validatePracticeConfig(config) ? config : null; }
export async function loadAdvancedTargetingAccess() { const user = await getCurrentUser(); if (!user) return { enabled: false, unresolvedMistakes: 0 }; const [capabilities, counts] = await Promise.all([getEffectiveCapabilities(user.id), getMistakeCounts(user.id)]); return { enabled: capabilities.canUseAdvancedTargeting, unresolvedMistakes: counts.unresolved }; }
async function currentOwner() { const user = await getCurrentUser(); if (user) return { userId: user.id, guestOwnerHash: null }; return { userId: null, guestOwnerHash: await getGuestOwnerHash() }; }
function ownedSessionCondition(sessionId: string, owner: Awaited<ReturnType<typeof currentOwner>>) { return owner.userId ? and(eq(practiceSessions.id, sessionId), eq(practiceSessions.userId, owner.userId)) : owner.guestOwnerHash ? and(eq(practiceSessions.id, sessionId), eq(practiceSessions.guestOwnerHash, owner.guestOwnerHash)) : and(eq(practiceSessions.id, sessionId), eq(practiceSessions.id, "00000000-0000-0000-0000-000000000000")); }
export async function startGuestPractice(formData: FormData) { const kind = formData.get("kind"); const user = await getCurrentUser(); if (user) redirect("/practice"); const requestHeaders = await headers(); const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? requestHeaders.get("x-real-ip") ?? "unknown"; try { await enforceRateLimit("guest_practice", ip); const guestOwnerHash = await requireGuestOwnerHash(); redirect(`/practice/${kind === "listening" ? await createGuestListeningPracticeSession(guestOwnerHash) : await createGuestReadingPracticeSession(guestOwnerHash)}`); } catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; console.error("Could not start guest practice", error); redirect("/try?error=start_failed"); } }
export async function startReadingPractice(formData: FormData) { const config = parseConfig(formData); if (!config) redirect("/practice?error=invalid_config"); const user = await getCurrentUser(); if (!user) redirect("/sign-in"); try { redirect(`/practice/${await createReadingPracticeSession(user.id, config)}`); } catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; if (error instanceof UsageLimitError) redirect(`/practice?error=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}`); console.error("Could not start Reading practice", error); redirect(`/practice?error=${error instanceof Error && error.message === "NO_PUBLISHED_CONTENT" ? "not_enough_content" : "start_failed"}`); } }
export async function startAdvancedTargeting(formData: FormData) {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in");
  const capabilities = await getEffectiveCapabilities(user.id);
  if (!capabilities.canUseAdvancedTargeting) redirect("/practice?error=premium_required");
  const targetingMode = String(formData.get("targetingMode") ?? "");
  const config = parseConfig(formData); if (!config) redirect("/practice?error=invalid_config");
  try {
    if (targetingMode === "review_mistakes") redirect(`/practice/${await createMasteryReviewSession(user.id, config.mode === "mixed_reading" ? undefined : Number(config.mode.slice(-1)))}`);
    if (targetingMode === "prefer_unseen") redirect(`/practice/${await createPreferUnseenReadingSession(user.id, config)}`);
    if (targetingMode === "target_weakness") {
      const scope = config.mode === "mixed_reading" ? undefined : { part: Number(config.mode.slice(-1)) as 5 | 6 | 7 };
      const recommendation = await getReadingRecommendation(user.id, undefined, scope);
      if (!recommendation.part) redirect("/practice?error=not_enough_history");
      redirect(`/practice/${await createRecommendedReadingPracticeSession(user.id, { part: recommendation.part, skill: recommendation.skill, subSkill: recommendation.subSkill, questionCount: config.targetQuestionCount }, "target_weakness")}`);
    }
    if (targetingMode === "adaptive") redirect(`/practice/${await createReadingPracticeSession(user.id, config)}`);
    redirect("/practice?error=invalid_config");
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    if (error instanceof UsageLimitError) redirect(`/practice?error=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}`);
    const code = error instanceof Error ? error.message : "";
    redirect(`/practice?error=${code === "NO_MISTAKES" || code === "NO_REVIEWABLE_MISTAKES" ? "no_mistakes" : code === "NO_PUBLISHED_CONTENT" ? "not_enough_content" : "start_failed"}`);
  }
}
type SubmitResult = { ok: true; sessionId: string } | { ok: false; error: "session_expired" | "submit_failed" };
export async function submitReadingPractice(sessionId: string, answers: SubmittedAnswer[]): Promise<SubmitResult> {
  const owner = await currentOwner(); if (!owner.userId && !owner.guestOwnerHash) return { ok: false, error: "session_expired" }; if (!sessionId || !Array.isArray(answers) || answers.length > 30 || new Set(answers.map((a) => a.questionId)).size !== answers.length) return { ok: false, error: "submit_failed" };
  try { await db.transaction(async (tx) => {
    const [session] = await tx.select().from(practiceSessions).where(ownedSessionCondition(sessionId, owner)).for("update").limit(1); if (!session || (session.expiresAt && session.expiresAt <= new Date())) throw new Error("NOT_FOUND"); if (session.status === "submitted") return; if (session.status !== "in_progress" || session.practiceType === "demo_test" || session.source === "ranked_challenge") throw new Error("INVALID");
    const assigned = await tx.select().from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, sessionId)); if (assigned.length !== session.questionCount) throw new Error("INCOMPLETE"); const ids = assigned.map((a) => a.questionId); if (answers.some((a) => !ids.includes(String(a.questionId)))) throw new Error("INJECTED");
    const [solutions, options] = await Promise.all([tx.select().from(questionSolutions).where(inArray(questionSolutions.questionId, ids)), tx.select().from(questionOptions).where(inArray(questionOptions.questionId, ids))]); const solutionMap = new Map(solutions.map((s) => [s.questionId, s.correctOptionId])); const input = new Map(answers.map((a) => [String(a.questionId), a])); let correct = 0;
    const rows = assigned.map((a) => { const answer = input.get(a.questionId); if (answer?.responseType && answer.responseType !== "MULTIPLE_CHOICE") throw new Error("BAD_RESPONSE_TYPE"); const selected = answer?.selectedOptionId ? String(answer.selectedOptionId) : null; if (selected && !options.some((o) => o.id === selected && o.questionId === a.questionId)) throw new Error("BAD_OPTION"); const correctOptionId = solutionMap.get(a.questionId); if (!correctOptionId) throw new Error("MISSING_SOLUTION"); const evaluation = evaluateMultipleChoice({ type: "MULTIPLE_CHOICE", selectedOptionId: selected }, correctOptionId); if (evaluation.isCorrect) correct++; return { sessionId, userId: owner.userId, questionId: a.questionId, responseType: "MULTIPLE_CHOICE", selectedOptionId: selected, isCorrect: evaluation.isCorrect, responseTimeMs: Number.isInteger(answer?.responseTimeMs) ? Math.min(Math.max(answer!.responseTimeMs!, 0), 86_400_000) : null, answeredAt: selected ? new Date() : null }; });
    await tx.insert(attemptAnswers).values(rows); await reconcileMasteryAnswers(tx, owner.userId, session.source, rows); await tx.update(practiceSessions).set({ status: "submitted", submittedAt: new Date(), scoreCorrect: correct, scoreTotal: session.questionCount }).where(and(eq(practiceSessions.id, sessionId), eq(practiceSessions.status, "in_progress"))); await awardCompletedLearning(tx,{userId:owner.userId,sourceType:"PRACTICE_SESSION",sourceId:sessionId,questionIds:rows.map(r=>r.questionId),completion:session.source==="recommended"?"WORKOUT":session.source==="mastery_review"?"MASTERY":undefined});
  });
    try {
      await recordChallengeCompletion(owner.userId ? { userId: owner.userId } : { guestReference: owner.guestOwnerHash! }, sessionId);
      if (owner.userId) await recordFirstWorkoutAfterChallenge(owner.userId, sessionId);
    } catch (error) { console.error("[challenge:analytics] reading completion", error); }
    revalidatePath("/progress"); revalidatePath("/dashboard"); revalidatePath("/mistakes"); revalidatePath(`/practice/${sessionId}/results`); return { ok: true, sessionId }; } catch (error) { console.error("Could not submit Reading practice", error); return { ok: false, error: "submit_failed" }; }
}
export async function startPart5Practice(formData: FormData) { formData.set("mode", "part_5"); formData.set("source", "custom"); return startReadingPractice(formData); }
export const submitPart5Practice = submitReadingPractice;

export async function startListeningPractice(formData: FormData) {
  const part = Number(formData.get("part")); const user = await getCurrentUser();
  if (!user) redirect("/sign-in"); if (![1, 2, 3, 4].includes(part)) redirect("/practice?error=invalid_config");
  try { const typedPart = part as 1 | 2 | 3 | 4; redirect(`/practice/${await createListeningPracticeSession(user.id, typedPart, typedPart <= 2 ? (typedPart === 1 ? 5 : 10) : 3)}`); }
  catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; if (error instanceof UsageLimitError) redirect(`/practice?error=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}`); console.error("Could not start Listening practice", error); redirect(`/practice?error=not_enough_listening_${part}`); }
}

/** Recalculates on the server; no client-supplied weakness or taxonomy is trusted. */
export async function startRecommendedPractice() {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in");
  try {
    const [recommendation, goal, usage] = await Promise.all([loadRecommendedWorkout(user.id), getLearnerGoal(user.id), getUsageStatus(user.id)]);
    const workload = getDailyWorkload({ goal, plan: usage.effectivePlan, workoutUsage: usage.entitlements.TODAYS_WORKOUT });
    const safeSize = getGroupSafeWorkoutSize(recommendation.part, workload.targetQuestions);
    if (recommendation.skillArea === "LISTENING" && isListeningPart(recommendation.part)) {
      const target = recommendation.part >= 3 ? safeSize.groupCount! : safeSize.questionCount;
      redirect(`/practice/${await createRecommendedListeningPracticeSession(user.id, { part: recommendation.part, skill: recommendation.primarySkill ?? undefined, subSkill: recommendation.primarySubskill ?? undefined, count: target })}`);
    }
    if (recommendation.skillArea === "READING") {
      const part = recommendation.part && recommendation.part >= 5 ? recommendation.part as 5 | 6 | 7 : null;
      if (part) redirect(`/practice/${await createRecommendedReadingPracticeSession(user.id, { part, skill: recommendation.primarySkill ?? undefined, subSkill: recommendation.primarySubskill ?? undefined, questionCount: safeSize.questionCount })}`);
      const attempts: PracticeConfig[] = part ? [
        { mode: `part_${part}` as ReadingPracticeMode, skill: recommendation.primarySkill ?? undefined, subSkill: recommendation.primarySubskill ?? undefined, targetQuestionCount: 10, source: "recommended" },
        { mode: `part_${part}` as ReadingPracticeMode, skill: recommendation.primarySkill ?? undefined, targetQuestionCount: 10, source: "recommended" },
        { mode: `part_${part}` as ReadingPracticeMode, targetQuestionCount: 10, source: "recommended" },
        { mode: "mixed_reading", targetQuestionCount: 10, source: "recommended" },
      ] : [{ mode: "mixed_reading", targetQuestionCount: 10, source: "recommended" }];
      for (const config of attempts) try { redirect(`/practice/${await createReadingPracticeSession(user.id, config)}`); } catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; }
    }
    redirect("/practice?error=not_enough_content");
  } catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; if (error instanceof UsageLimitError) redirect(`/practice?error=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}`); console.error("Could not start recommended practice", error); redirect("/practice?error=start_failed"); }
}

/** Premium weekly focus is recalculated at click time; the browser supplies no focus or question IDs. */
export async function startWeeklyFocusedReading() {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in");
  const capabilities = await getEffectiveCapabilities(user.id);
  if (!capabilities.canUseAdvancedTargeting) redirect("/practice?error=premium_required");
  try {
    const [recommendation, goal, usage] = await Promise.all([loadRecommendedWorkout(user.id), getLearnerGoal(user.id), getUsageStatus(user.id)]);
    const part = recommendation.part;
    if (recommendation.reasonCode !== "SUPPORTED_WEAKNESS" || recommendation.skillArea !== "READING" || part === null || part < 5) redirect("/practice?error=not_enough_history");
    const workload = getDailyWorkload({ goal, plan: usage.effectivePlan, workoutUsage: usage.entitlements.TODAYS_WORKOUT });
    const size = getGroupSafeWorkoutSize(part, workload.targetQuestions);
    redirect(`/practice/${await createRecommendedReadingPracticeSession(user.id, { part: part as 5 | 6 | 7, skill: recommendation.primarySkill ?? undefined, subSkill: recommendation.primarySubskill ?? undefined, questionCount: size.questionCount }, "target_weakness")}`);
  } catch (error) {
    if (typeof error === "object" && error && "digest" in error) throw error;
    if (error instanceof UsageLimitError) redirect(`/practice?error=usage_limit&resetAt=${encodeURIComponent(error.status.resetAt)}`);
    console.error("Could not start weekly focused practice", error);
    redirect("/practice?error=start_failed");
  }
}

export type ListeningGroupReview = { groupId: string; transcript: string; questions: Array<{ questionId: string; selectedOptionId: string; correctOptionId: string; isCorrect: boolean; explanationEn: string | null; explanationVi: string | null }> };
export async function submitListeningGroup(sessionId: string, groupId: string, answers: SubmittedAnswer[]): Promise<{ ok: true; review: ListeningGroupReview; complete: boolean } | { ok: false; error: "session_expired" | "submit_failed" }> {
  const owner = await currentOwner(); if (!owner.userId && !owner.guestOwnerHash) return { ok: false, error: "session_expired" };
  if (!sessionId || !groupId || answers.length !== 3) return { ok: false, error: "submit_failed" };
  try {
    const result = await db.transaction(async (tx) => {
      const [session] = await tx.select().from(practiceSessions).where(ownedSessionCondition(sessionId, owner)).for("update").limit(1);
      if (!session || session.source === "ranked_challenge" || session.skillArea !== "LISTENING" || ![3, 4].includes(session.part ?? 0) || !["in_progress", "submitted"].includes(session.status)) throw new Error("INVALID_SESSION");
      const assigned = await tx.select({ questionId: practiceSessionQuestions.questionId, passageSetId: practiceSessionQuestions.passageSetId, part: questions.toeicPart }).from(practiceSessionQuestions).innerJoin(questions, eq(questions.id, practiceSessionQuestions.questionId)).where(and(eq(practiceSessionQuestions.sessionId, sessionId), eq(practiceSessionQuestions.passageSetId, groupId)));
      if (assigned.length !== 3 || assigned.some((q) => q.passageSetId !== groupId || q.part !== session.part)) throw new Error("INVALID_GROUP");
      const expectedIds = assigned.map((q) => q.questionId).sort(); if (!hasExactCompleteGroupAnswers(expectedIds, answers.map((answer) => ({ questionId: String(answer.questionId), selectedOptionId: answer.selectedOptionId ? String(answer.selectedOptionId) : null })))) throw new Error("INVALID_QUESTIONS");
      const [solutions, options, transcriptRows, existing] = await Promise.all([tx.select().from(questionSolutions).where(inArray(questionSolutions.questionId, expectedIds)), tx.select().from(questionOptions).where(inArray(questionOptions.questionId, expectedIds)), tx.select().from(listeningTranscripts).where(eq(listeningTranscripts.questionGroupId, groupId)), tx.select().from(attemptAnswers).where(and(eq(attemptAnswers.sessionId, sessionId), inArray(attemptAnswers.questionId, expectedIds)))]);
      const answerMap = new Map(answers.map((a) => [String(a.questionId), String(a.selectedOptionId)])); const existingMap = new Map(existing.map((a) => [a.questionId, a]));
      const rows = expectedIds.map((questionId) => { const selectedOptionId = answerMap.get(questionId)!; if (!options.some((o) => o.id === selectedOptionId && o.questionId === questionId)) throw new Error("INVALID_OPTION"); const correctOptionId = solutions.find((s) => s.questionId === questionId)?.correctOptionId; if (!correctOptionId) throw new Error("MISSING_SOLUTION"); const old = existingMap.get(questionId); if (old && old.selectedOptionId !== selectedOptionId) throw new Error("IDEMPOTENCY_CONFLICT"); return { sessionId, userId: owner.userId, questionId, responseType: "MULTIPLE_CHOICE", selectedOptionId, isCorrect: evaluateMultipleChoice({ type: "MULTIPLE_CHOICE", selectedOptionId }, correctOptionId).isCorrect, answeredAt: new Date() }; });
      if (existing.length !== 0 && existing.length !== 3) throw new Error("PARTIAL_GROUP");
      if (!existing.length) { await tx.insert(attemptAnswers).values(rows); await reconcileMasteryAnswers(tx, owner.userId, session.source, rows); await awardCompletedLearning(tx,{userId:owner.userId,sourceType:"PRACTICE_SESSION",sourceId:sessionId,questionIds:rows.map(r=>r.questionId)}); }
      const allAnswers = await tx.select().from(attemptAnswers).where(eq(attemptAnswers.sessionId, sessionId)); const complete = allAnswers.length === session.questionCount;
      if (complete && session.status === "in_progress") { await tx.update(practiceSessions).set({ status: "submitted", submittedAt: new Date(), scoreCorrect: allAnswers.filter((a) => a.isCorrect).length, scoreTotal: session.questionCount }).where(eq(practiceSessions.id, sessionId)); if(session.source==="recommended"||session.source==="mastery_review") await awardCompletedLearning(tx,{userId:owner.userId,sourceType:"PRACTICE_SESSION",sourceId:sessionId,questionIds:[],completion:session.source==="recommended"?"WORKOUT":"MASTERY"}); }
      const persisted = existing.length ? existing : rows; if (!canUnlockListeningGroupReview(expectedIds, persisted.map((answer) => answer.questionId))) throw new Error("INCOMPLETE_GROUP"); const transcript = transcriptRows[0]?.content; if (!transcript) throw new Error("MISSING_TRANSCRIPT");
      return { ok: true as const, complete, review: { groupId, transcript, questions: expectedIds.map((questionId) => { const solution = solutions.find((s) => s.questionId === questionId)!; const answer = persisted.find((a) => a.questionId === questionId)!; return { questionId, selectedOptionId: answer.selectedOptionId!, correctOptionId: solution.correctOptionId, isCorrect: answer.isCorrect, explanationEn: solution.explanationEn, explanationVi: solution.explanationVi }; }) } };
    });
    if (result.complete) { try { if (owner.userId) await recordFirstWorkoutAfterChallenge(owner.userId, sessionId); } catch (error) { console.error("[challenge:analytics] listening completion", error); } revalidatePath("/progress"); revalidatePath("/dashboard"); revalidatePath("/mistakes"); revalidatePath(`/practice/${sessionId}/results`); }
    return result;
  } catch (error) { console.error("Could not submit Listening group", error); return { ok: false, error: "submit_failed" }; }
}

export async function refreshListeningMedia(sessionId: string, questionId: string, assetId: string, groupId?: string): Promise<{ ok: true; url: string } | { ok: false }> {
  const owner = await currentOwner(); if (!owner.userId && !owner.guestOwnerHash) return { ok: false };
  try { return { ok: true, url: await createAuthorizedListeningMediaUrl({ ...owner, sessionId, questionId, groupId, assetId }, createMediaStorage()) }; }
  catch (error) { console.error("Could not refresh Listening media URL", error); return { ok: false }; }
}
