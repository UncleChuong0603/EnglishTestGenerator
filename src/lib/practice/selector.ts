import "server-only";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, listeningTranscripts, mediaAssets, passageSets, passages, practiceSessionQuestions, practiceSessions, questionGroupMedia, questionOptions, questionSolutions, questions } from "@/db/schema";
import { validateListeningEligibility, validateListeningGroupEligibility } from "@/lib/listening/eligibility";
import { MIXED_PART_WEIGHTS, READING_TAXONOMY } from "./constants";
import { flattenUniqueQuestionIds, rankSelectionUnits, RECENT_CONTENT_SESSION_WINDOW, selectClosestUnits, shuffle, type ContentHistory, type SelectionUnit } from "./selection";
import type { PracticeConfig, ReadingPart } from "./types";
import { GUEST_TTL_DAYS } from "@/lib/guest/identity";
import { MASTERY_REVIEW_BATCH_SIZE } from "@/lib/mastery/constants";
import { expandReviewGroups, getReviewCandidates } from "@/lib/mastery/queries";

const EMPTY_HISTORY: ContentHistory = { seenQuestionIds: new Set(), recentQuestionIds: new Set() };
const keepOrder = () => 0.999;

async function loadContentHistory(userId: string, candidateIds: readonly string[]): Promise<ContentHistory> {
  if (!candidateIds.length) return EMPTY_HISTORY;
  const recentSessions = await db.select({ id: practiceSessions.id }).from(practiceSessions)
    .where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted")))
    .orderBy(desc(practiceSessions.submittedAt)).limit(RECENT_CONTENT_SESSION_WINDOW);
  const seen = await db.select({ questionId: attemptAnswers.questionId, sessionId: attemptAnswers.sessionId }).from(attemptAnswers)
    .where(and(eq(attemptAnswers.userId, userId), inArray(attemptAnswers.questionId, [...candidateIds])));
  const recentSessionIds = new Set(recentSessions.map((row) => row.id));
  return {
    seenQuestionIds: new Set(seen.map((row) => row.questionId)),
    recentQuestionIds: new Set(seen.filter((row) => recentSessionIds.has(row.sessionId)).map((row) => row.questionId)),
  };
}

type ListeningTarget = { userId?: string; skill?: string; subSkill?: string; diverse?: boolean };

export function preferTaxonomyDiversity<T extends { id: string; skill: string; subSkill: string }>(items: readonly T[]): T[] {
  const remaining = [...items].sort((a, b) => a.id.localeCompare(b.id));
  const selected: T[] = []; const skills = new Set<string>(); const subskills = new Set<string>();
  while (remaining.length) {
    remaining.sort((a, b) => Number(subskills.has(a.subSkill)) - Number(subskills.has(b.subSkill)) || Number(skills.has(a.skill)) - Number(skills.has(b.skill)) || a.id.localeCompare(b.id));
    const next = remaining.shift()!; selected.push(next); skills.add(next.skill); subskills.add(next.subSkill);
  }
  return selected;
}

export async function selectListeningPractice(part: 1 | 2 | 3 | 4, target = 10, focus?: ListeningTarget) {
  const candidates = await db.select().from(questions).where(and(eq(questions.skillArea, "LISTENING"), eq(questions.toeicPart, part), eq(questions.status, "published"))).limit(200);
  const setIds = [...new Set(candidates.flatMap((q) => q.passageSetId ?? []))];
  if (!setIds.length) throw new Error(`NOT_ENOUGH_LISTENING_PART_${part}`);
  const questionIds = candidates.map((q) => q.id);
  const [sets, options, solutions, attachments, transcripts] = await Promise.all([
    db.select().from(passageSets).where(and(inArray(passageSets.id, setIds), eq(passageSets.status, "published"))),
    db.select().from(questionOptions).where(inArray(questionOptions.questionId, questionIds)),
    db.select().from(questionSolutions).where(inArray(questionSolutions.questionId, questionIds)),
    db.select({ groupId: questionGroupMedia.questionGroupId, role: questionGroupMedia.role, kind: mediaAssets.kind, accessScope: mediaAssets.accessScope, status: mediaAssets.status }).from(questionGroupMedia).innerJoin(mediaAssets, eq(questionGroupMedia.mediaAssetId, mediaAssets.id)).where(inArray(questionGroupMedia.questionGroupId, setIds)),
    db.select().from(listeningTranscripts).where(inArray(listeningTranscripts.questionGroupId, setIds)),
  ]);
  const published = new Set(sets.map((s) => s.id));
  const history = focus?.userId ? await loadContentHistory(focus.userId, questionIds) : EMPTY_HISTORY;
  const relevance = (q: (typeof candidates)[number]) => focus?.subSkill && q.subSkill === focus.subSkill ? 3 : focus?.skill && q.skill === focus.skill ? 2 : 1;
  if (part <= 2) {
    const eligible = candidates.filter((q) => q.passageSetId && published.has(q.passageSetId) && validateListeningEligibility({ skillArea: q.skillArea, part: q.toeicPart, responseType: q.responseType, questionCount: candidates.filter((other) => other.passageSetId === q.passageSetId).length, options: options.filter((o) => o.questionId === q.id), correctOptionId: solutions.find((s) => s.questionId === q.id)?.correctOptionId ?? null, explanationEn: solutions.find((s) => s.questionId === q.id)?.explanationEn ?? null, explanationVi: solutions.find((s) => s.questionId === q.id)?.explanationVi ?? null, transcript: transcripts.find((t) => t.questionGroupId === q.passageSetId)?.content ?? null, media: attachments.filter((a) => a.groupId === q.passageSetId) as Parameters<typeof validateListeningEligibility>[0]["media"] }).eligible);
    const ranked = focus ? rankSelectionUnits(eligible.map((q) => ({ ...q, part, questionIds: [q.id] })), history, relevance) : shuffle(eligible);
    const valid = focus?.diverse ? preferTaxonomyDiversity(ranked) : ranked;
    if (valid.length < target) throw new Error(`NOT_ENOUGH_LISTENING_PART_${part}`);
    return valid.slice(0, target);
  }
  const eligibleSets = sets.filter((set) => {
    const children = candidates.filter((q) => q.passageSetId === set.id).sort((a, b) => a.questionOrder - b.questionOrder);
    return validateListeningGroupEligibility({ skillArea: "LISTENING", part, setType: set.setType, status: set.status, transcript: transcripts.find((t) => t.questionGroupId === set.id)?.content ?? null, media: attachments.filter((a) => a.groupId === set.id) as Parameters<typeof validateListeningGroupEligibility>[0]["media"], questions: children.map((q) => { const solution = solutions.find((s) => s.questionId === q.id); return { order: q.questionOrder, responseType: q.responseType, options: options.filter((o) => o.questionId === q.id), correctOptionId: solution?.correctOptionId ?? null, explanationEn: solution?.explanationEn ?? null, explanationVi: solution?.explanationVi ?? null }; }) }).eligible;
  });
  if (eligibleSets.length < target) throw new Error(`NOT_ENOUGH_LISTENING_PART_${part}`);
  const rankedSets = focus ? rankSelectionUnits(eligibleSets.map((set) => ({ ...set, part, questionIds: candidates.filter((q) => q.passageSetId === set.id).map((q) => q.id) })), history, (set) => {
    const children = candidates.filter((q) => q.passageSetId === set.id);
    return 1 + children.filter((q) => focus.subSkill && q.subSkill === focus.subSkill).length * 3 + children.filter((q) => focus.skill && q.skill === focus.skill).length * 2;
  }) : shuffle(eligibleSets);
  const selectedIds = rankedSets.slice(0, target).map((set) => set.id);
  return selectedIds.flatMap((id) => candidates.filter((q) => q.passageSetId === id).sort((a, b) => a.questionOrder - b.questionOrder));
}

export async function createListeningPracticeSession(userId: string, part: 1 | 2 | 3 | 4, target = 10) {
  const selected = await selectListeningPractice(part, target);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:practice`}, 0))`);
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.practiceType, "demo_test"), ne(practiceSessions.source, "diagnostic")));
    const [session] = await tx.insert(practiceSessions).values({ userId, skillArea: "LISTENING", practiceType: `listening_part_${part}`, part, questionCount: selected.length, requestedQuestionCount: target, source: "custom" }).returning({ id: practiceSessions.id });
    await tx.insert(practiceSessionQuestions).values(selected.map((q, index) => ({ sessionId: session.id, questionId: q.id, displayOrder: index + 1, passageSetId: q.passageSetId })));
    return session.id;
  });
}

export async function createRecommendedListeningPracticeSession(userId: string, target: { part: 1 | 2 | 3 | 4; skill?: string; subSkill?: string; count: number }) {
  const selected = await selectListeningPractice(target.part, target.count, { userId, skill: target.skill, subSkill: target.subSkill });
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:practice`}, 0))`);
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.practiceType, "demo_test"), ne(practiceSessions.source, "diagnostic")));
    const [session] = await tx.insert(practiceSessions).values({ userId, skillArea: "LISTENING", practiceType: `listening_part_${target.part}`, part: target.part, questionCount: selected.length, requestedQuestionCount: target.part >= 3 ? target.count * 3 : target.count, source: "recommended", requestedSkill: target.skill ?? null, requestedSubSkill: target.subSkill ?? null }).returning({ id: practiceSessions.id });
    await tx.insert(practiceSessionQuestions).values(selected.map((q, index) => ({ sessionId: session.id, questionId: q.id, displayOrder: index + 1, passageSetId: q.passageSetId })));
    return session.id;
  });
}

function partForMode(mode: PracticeConfig["mode"]): ReadingPart | null { return mode === "part_5" ? 5 : mode === "part_6" ? 6 : mode === "part_7" ? 7 : null; }
export function validatePracticeConfig(config: PracticeConfig) { const part = partForMode(config.mode); if (![10, 15, 20].includes(config.targetQuestionCount)) return false; if (!part && (config.skill || config.subSkill)) return false; if (!part) return true; if (config.skill && !(config.skill in READING_TAXONOMY[part])) return false; return !(config.subSkill && (!config.skill || !READING_TAXONOMY[part][config.skill]?.includes(config.subSkill))); }

export async function loadUnits(part: ReadingPart, skill?: string, subSkill?: string): Promise<SelectionUnit[]> {
  const conditions = [eq(questions.toeicPart, part), eq(questions.status, "published")]; if (skill) conditions.push(eq(questions.skill, skill)); if (subSkill) conditions.push(eq(questions.subSkill, subSkill));
  const matched = await db.select().from(questions).where(and(...conditions)).limit(500); const setIds = [...new Set(matched.flatMap((q) => q.passageSetId ?? []))];
  let candidates = matched;
  if (part !== 5) {
    if (!setIds.length) return []; const [sets, docs] = await Promise.all([db.select().from(passageSets).where(and(inArray(passageSets.id, setIds), eq(passageSets.status, "published"))), db.select().from(passages).where(inArray(passages.passageSetId, setIds))]);
    const expected: Record<string, number> = { part6: 1, single: 1, double: 2, triple: 3 }; const valid = sets.filter((s) => { const rows = docs.filter((d) => d.passageSetId === s.id); return rows.length === expected[s.setType] && rows.every((d) => d.status === "published"); }).map((s) => s.id);
    if (!valid.length) return []; candidates = await db.select().from(questions).where(and(eq(questions.toeicPart, part), eq(questions.status, "published"), inArray(questions.passageSetId, valid))).orderBy(asc(questions.questionOrder));
  }
  const ids = candidates.map((q) => q.id); if (!ids.length) return [];
  const [opts, solutions] = await Promise.all([db.select({ questionId: questionOptions.questionId }).from(questionOptions).where(inArray(questionOptions.questionId, ids)), db.select({ questionId: questionSolutions.questionId }).from(questionSolutions).where(inArray(questionSolutions.questionId, ids))]);
  const counts = new Map<string, number>(); for (const o of opts) counts.set(o.questionId, (counts.get(o.questionId) ?? 0) + 1); const solutionIds = new Set(solutions.map((s) => s.questionId)); const validQuestions = candidates.filter((q) => counts.get(q.id) === 4 && solutionIds.has(q.id));
  if (part === 5) return validQuestions.map((q) => ({ id: q.id, part, questionIds: [q.id] }));
  const bySet = new Map<string, string[]>(); for (const q of validQuestions) if (q.passageSetId) bySet.set(q.passageSetId, [...(bySet.get(q.passageSetId) ?? []), q.id]); const totals = new Map<string, number>(); for (const q of candidates) if (q.passageSetId) totals.set(q.passageSetId, (totals.get(q.passageSetId) ?? 0) + 1);
  return [...bySet].flatMap(([id, questionIds]) => questionIds.length === totals.get(id) ? [{ id, part, questionIds }] : []);
}
export async function getAvailableReadingQuestionCount(part: ReadingPart, skill?: string, subSkill?: string) { return flattenUniqueQuestionIds(await loadUnits(part, skill, subSkill)).length; }
export async function selectReadingPractice(config: PracticeConfig) {
  if (!validatePracticeConfig(config)) throw new Error("INVALID_PRACTICE_CONFIG"); const fixed = partForMode(config.mode); let selected: SelectionUnit[];
  if (fixed) selected = selectClosestUnits(await loadUnits(fixed, config.skill, config.subSkill), config.targetQuestionCount);
  else { const parts: ReadingPart[] = [5, 6, 7]; const available = await Promise.all(parts.map((p) => loadUnits(p))); selected = shuffle(parts.flatMap((p, i) => selectClosestUnits(available[i], Math.max(1, Math.round(config.targetQuestionCount * MIXED_PART_WEIGHTS[p]))))); }
  const questionIds = flattenUniqueQuestionIds(selected); if (!questionIds.length) throw new Error("NO_PUBLISHED_CONTENT"); return { units: selected, questionIds, actualQuestionCount: questionIds.length };
}
export async function createReadingPracticeSession(userId: string, config: PracticeConfig) {
  const selection = await selectReadingPractice(config); const part = partForMode(config.mode);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:practice`}, 0))`);
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.practiceType, "demo_test"), ne(practiceSessions.source, "diagnostic")));
    const [session] = await tx.insert(practiceSessions).values({ userId, practiceType: config.mode, part, questionCount: selection.actualQuestionCount, source: config.source, requestedQuestionCount: config.targetQuestionCount, requestedSkill: config.skill ?? null, requestedSubSkill: config.subSkill ?? null }).returning({ id: practiceSessions.id });
    const setByQuestion = new Map(selection.units.flatMap((u) => u.questionIds.map((id) => [id, u.part === 5 ? null : u.id] as const)));
    await tx.insert(practiceSessionQuestions).values(selection.questionIds.map((questionId, i) => ({ sessionId: session.id, questionId, displayOrder: i + 1, passageSetId: setByQuestion.get(questionId) ?? null })));
    return session.id;
  });
}

export async function createGuestReadingPracticeSession(guestOwnerHash: string) {
  const config: PracticeConfig = { mode: "mixed_reading", targetQuestionCount: 10, source: "custom" };
  const selection = await selectReadingPractice(config);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${guestOwnerHash}:guest-practice`}, 0))`);
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.guestOwnerHash, guestOwnerHash), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.source, "diagnostic")));
    const [session] = await tx.insert(practiceSessions).values({ guestOwnerHash, userId: null, practiceType: config.mode, part: null, questionCount: selection.actualQuestionCount, source: "guest", requestedQuestionCount: 10, expiresAt: new Date(Date.now() + GUEST_TTL_DAYS * 86_400_000) }).returning({ id: practiceSessions.id });
    const setByQuestion = new Map(selection.units.flatMap((unit) => unit.questionIds.map((id) => [id, unit.part === 5 ? null : unit.id] as const)));
    await tx.insert(practiceSessionQuestions).values(selection.questionIds.map((questionId, index) => ({ sessionId: session.id, questionId, displayOrder: index + 1, passageSetId: setByQuestion.get(questionId) ?? null })));
    return session.id;
  });
}

export async function createGuestListeningPracticeSession(guestOwnerHash: string) {
  const part = 3 as const; const selected = await selectListeningPractice(part, 3);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${guestOwnerHash}:guest-practice`}, 0))`);
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.guestOwnerHash, guestOwnerHash), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.source, "diagnostic")));
    const [session] = await tx.insert(practiceSessions).values({ guestOwnerHash, userId: null, skillArea: "LISTENING", practiceType: "listening_part_3", part, questionCount: selected.length, requestedQuestionCount: selected.length, source: "guest", expiresAt: new Date(Date.now() + GUEST_TTL_DAYS * 86_400_000) }).returning({ id: practiceSessions.id });
    await tx.insert(practiceSessionQuestions).values(selected.map((question, index) => ({ sessionId: session.id, questionId: question.id, displayOrder: index + 1, passageSetId: question.passageSetId })));
    return session.id;
  });
}

/** Recommended-only 60/20/20 selector. Whole passage units are never split. */
export async function createRecommendedReadingPracticeSession(userId: string, target: { part: ReadingPart; skill?: string; subSkill?: string; questionCount: number }) {
  const primaryPools = [await loadUnits(target.part, target.skill, target.subSkill), await loadUnits(target.part, target.skill), await loadUnits(target.part)];
  const otherParts = ([5, 6, 7] as ReadingPart[]).filter((part) => part !== target.part);
  const allOtherUnits = (await Promise.all(otherParts.map((part) => loadUnits(part)))).flat();
  const allCandidateIds = flattenUniqueQuestionIds([...primaryPools.flat(), ...allOtherUnits]);
  const history = await loadContentHistory(userId, allCandidateIds);
  const primarySpecificity = new Map<string, number>();
  primaryPools.forEach((pool, index) => pool.forEach((unit) => primarySpecificity.set(unit.id, Math.max(primarySpecificity.get(unit.id) ?? 0, 3 - index))));
  const primaryPool = rankSelectionUnits([...new Map(primaryPools.flat().map((unit) => [unit.id, unit])).values()], history, (unit) => primarySpecificity.get(unit.id) ?? 0);
  const primary = selectClosestUnits(primaryPool, Math.max(1, Math.round(target.questionCount * 0.6)), keepOrder);
  const used = new Set(primary.map((unit) => unit.id));
  const supportPool = rankSelectionUnits(primaryPools[2].filter((unit) => !used.has(unit.id)), history);
  const support = selectClosestUnits(supportPool, Math.max(1, Math.round(target.questionCount * 0.2)), keepOrder); support.forEach((unit) => used.add(unit.id));
  const maintenancePool = rankSelectionUnits(allOtherUnits.filter((unit) => !used.has(unit.id)), history);
  const maintenance = selectClosestUnits(maintenancePool, Math.max(1, Math.round(target.questionCount * 0.2)), keepOrder);
  let units = [...primary, ...support, ...maintenance];
  if (!units.length) units = selectClosestUnits(rankSelectionUnits(allOtherUnits, history), target.questionCount, keepOrder);
  const questionIds = flattenUniqueQuestionIds(units); if (!questionIds.length) throw new Error("NO_PUBLISHED_CONTENT");
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:practice`}, 0))`);
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.practiceType, "demo_test"), ne(practiceSessions.source, "diagnostic")));
    const [session] = await tx.insert(practiceSessions).values({ userId, practiceType: `part_${target.part}`, part: target.part, questionCount: questionIds.length, source: "recommended", requestedQuestionCount: target.questionCount, requestedSkill: target.skill ?? null, requestedSubSkill: target.subSkill ?? null }).returning({ id: practiceSessions.id });
    const setByQuestion = new Map(units.flatMap((unit) => unit.questionIds.map((id) => [id, unit.part === 5 ? null : unit.id] as const)));
    await tx.insert(practiceSessionQuestions).values(questionIds.map((questionId, index) => ({ sessionId: session.id, questionId, displayOrder: index + 1, passageSetId: setByQuestion.get(questionId) ?? null })));
    return session.id;
  });
}
import { sql } from "drizzle-orm";

/** Creates a server-authoritative, single-Part review session; grouped content is expanded atomically. */
export async function createMasteryReviewSession(userId: string, requestedPart?: number) {
  const candidates = await getReviewCandidates(userId, requestedPart);
  if (!candidates.length) throw new Error("NO_MISTAKES");
  const part = requestedPart ?? candidates[0].part;
  const samePart = candidates.filter((row) => row.part === part);
  const seedIds: string[] = []; const units = new Set<string>(); let estimatedQuestions = 0;
  for (const row of samePart) {
    const unit = row.passageSetId ?? row.questionId;
    if (units.has(unit)) continue;
    units.add(unit); seedIds.push(row.questionId); estimatedQuestions += [3, 4, 7].includes(part) ? 3 : part === 6 ? 4 : 1;
    if (estimatedQuestions >= MASTERY_REVIEW_BATCH_SIZE) break;
  }
  const expanded = await expandReviewGroups(seedIds, part);
  if (!expanded.length) throw new Error("NO_REVIEWABLE_MISTAKES");
  const skillArea = samePart[0].skillArea as "LISTENING" | "READING";
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:practice`}, 0))`);
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.practiceType, "demo_test"), ne(practiceSessions.source, "diagnostic")));
    const [session] = await tx.insert(practiceSessions).values({ userId, skillArea, practiceType: skillArea === "LISTENING" ? `listening_part_${part}` : `part_${part}`, part, questionCount: expanded.length, requestedQuestionCount: MASTERY_REVIEW_BATCH_SIZE, source: "mastery_review" }).returning({ id: practiceSessions.id });
    await tx.insert(practiceSessionQuestions).values(expanded.map((row, index) => ({ sessionId: session.id, questionId: row.id, displayOrder: index + 1, passageSetId: row.passageSetId })));
    return session.id;
  });
}
