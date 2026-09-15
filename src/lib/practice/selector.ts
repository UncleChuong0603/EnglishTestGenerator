import "server-only";
import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { listeningTranscripts, mediaAssets, passageSets, passages, practiceSessionQuestions, practiceSessions, questionGroupMedia, questionOptions, questionSolutions, questions } from "@/db/schema";
import { validateListeningEligibility, validateListeningGroupEligibility } from "@/lib/listening/eligibility";
import { MIXED_PART_WEIGHTS, READING_TAXONOMY } from "./constants";
import { flattenUniqueQuestionIds, selectClosestUnits, shuffle, type SelectionUnit } from "./selection";
import type { PracticeConfig, ReadingPart } from "./types";

export async function selectListeningPractice(part: 1 | 2 | 3 | 4, target = 10) {
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
  if (part <= 2) {
    const valid = shuffle(candidates.filter((q) => q.passageSetId && published.has(q.passageSetId) && validateListeningEligibility({ skillArea: q.skillArea, part: q.toeicPart, responseType: q.responseType, questionCount: candidates.filter((other) => other.passageSetId === q.passageSetId).length, options: options.filter((o) => o.questionId === q.id), correctOptionId: solutions.find((s) => s.questionId === q.id)?.correctOptionId ?? null, explanationEn: solutions.find((s) => s.questionId === q.id)?.explanationEn ?? null, explanationVi: solutions.find((s) => s.questionId === q.id)?.explanationVi ?? null, transcript: transcripts.find((t) => t.questionGroupId === q.passageSetId)?.content ?? null, media: attachments.filter((a) => a.groupId === q.passageSetId) as Parameters<typeof validateListeningEligibility>[0]["media"] }).eligible));
    if (valid.length < target) throw new Error(`NOT_ENOUGH_LISTENING_PART_${part}`);
    return valid.slice(0, target);
  }
  const eligibleSets = shuffle(sets.filter((set) => {
    const children = candidates.filter((q) => q.passageSetId === set.id).sort((a, b) => a.questionOrder - b.questionOrder);
    return validateListeningGroupEligibility({ skillArea: "LISTENING", part, setType: set.setType, status: set.status, transcript: transcripts.find((t) => t.questionGroupId === set.id)?.content ?? null, media: attachments.filter((a) => a.groupId === set.id) as Parameters<typeof validateListeningGroupEligibility>[0]["media"], questions: children.map((q) => { const solution = solutions.find((s) => s.questionId === q.id); return { order: q.questionOrder, responseType: q.responseType, options: options.filter((o) => o.questionId === q.id), correctOptionId: solution?.correctOptionId ?? null, explanationEn: solution?.explanationEn ?? null, explanationVi: solution?.explanationVi ?? null }; }) }).eligible;
  }));
  if (eligibleSets.length < target) throw new Error(`NOT_ENOUGH_LISTENING_PART_${part}`);
  const selectedIds = eligibleSets.slice(0, target).map((set) => set.id);
  return selectedIds.flatMap((id) => candidates.filter((q) => q.passageSetId === id).sort((a, b) => a.questionOrder - b.questionOrder));
}

export async function createListeningPracticeSession(userId: string, part: 1 | 2 | 3 | 4, target = 10) {
  const selected = await selectListeningPractice(part, target);
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${userId}:practice`}, 0))`);
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.practiceType, "demo_test")));
    const [session] = await tx.insert(practiceSessions).values({ userId, skillArea: "LISTENING", practiceType: `listening_part_${part}`, part, questionCount: selected.length, requestedQuestionCount: target, source: "custom" }).returning({ id: practiceSessions.id });
    await tx.insert(practiceSessionQuestions).values(selected.map((q, index) => ({ sessionId: session.id, questionId: q.id, displayOrder: index + 1, passageSetId: q.passageSetId })));
    return session.id;
  });
}

function partForMode(mode: PracticeConfig["mode"]): ReadingPart | null { return mode === "part_5" ? 5 : mode === "part_6" ? 6 : mode === "part_7" ? 7 : null; }
export function validatePracticeConfig(config: PracticeConfig) { const part = partForMode(config.mode); if (![10, 15, 20].includes(config.targetQuestionCount)) return false; if (!part && (config.skill || config.subSkill)) return false; if (!part) return true; if (config.skill && !(config.skill in READING_TAXONOMY[part])) return false; return !(config.subSkill && (!config.skill || !READING_TAXONOMY[part][config.skill]?.includes(config.subSkill))); }

async function loadUnits(part: ReadingPart, skill?: string, subSkill?: string): Promise<SelectionUnit[]> {
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
    await tx.update(practiceSessions).set({ status: "abandoned" }).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "in_progress"), ne(practiceSessions.practiceType, "demo_test")));
    const [session] = await tx.insert(practiceSessions).values({ userId, practiceType: config.mode, part, questionCount: selection.actualQuestionCount, source: config.source, requestedQuestionCount: config.targetQuestionCount, requestedSkill: config.skill ?? null, requestedSubSkill: config.subSkill ?? null }).returning({ id: practiceSessions.id });
    const setByQuestion = new Map(selection.units.flatMap((u) => u.questionIds.map((id) => [id, u.part === 5 ? null : u.id] as const)));
    await tx.insert(practiceSessionQuestions).values(selection.questionIds.map((questionId, i) => ({ sessionId: session.id, questionId, displayOrder: i + 1, passageSetId: setByQuestion.get(questionId) ?? null })));
    return session.id;
  });
}
import { sql } from "drizzle-orm";
