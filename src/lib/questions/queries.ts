import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { passageSets, passages, questionOptions, questions } from "@/db/schema";
import type { Difficulty, LearnerPassageSet, LearnerQuestion, PassageSet, Passage, PassageSetType, ToeicPart } from "./types";

export type ReadingQuestionFilters = { skill?: string; subSkill?: string; difficulty?: Difficulty };
export type PassageSetFilters = ReadingQuestionFilters & { setType?: PassageSetType; limit?: number };
const mapOption = (o: typeof questionOptions.$inferSelect) => ({ id: o.id, question_id: o.questionId, option_key: o.optionKey, option_text: o.optionText, display_order: o.displayOrder, created_at: o.createdAt.toISOString() });
const mapQuestion = (q: typeof questions.$inferSelect, options: typeof questionOptions.$inferSelect[]): LearnerQuestion => ({ id: q.id, toeic_part: q.toeicPart as ToeicPart, skill_area: q.skillArea as LearnerQuestion["skill_area"], response_type: q.responseType as LearnerQuestion["response_type"], question_type: q.questionType, skill: q.skill, sub_skill: q.subSkill, difficulty: q.difficulty as Difficulty, question_text: q.questionText, passage_id: q.passageId, audio_url: q.audioUrl, image_url: q.imageUrl, metadata: q.metadata, status: q.status as LearnerQuestion["status"], created_at: q.createdAt.toISOString(), updated_at: q.updatedAt.toISOString(), passage_set_id: q.passageSetId, question_order: q.questionOrder, options: options.filter((o) => o.questionId === q.id).map(mapOption) });

export async function getPublishedQuestionsByPart(part: ToeicPart, limit = 20, filters: ReadingQuestionFilters = {}) {
  const conditions = [eq(questions.toeicPart, part), eq(questions.status, "published")];
  if (filters.skill) conditions.push(eq(questions.skill, filters.skill)); if (filters.subSkill) conditions.push(eq(questions.subSkill, filters.subSkill)); if (filters.difficulty) conditions.push(eq(questions.difficulty, filters.difficulty));
  const rows = await db.select().from(questions).where(and(...conditions)).orderBy(asc(questions.questionOrder), asc(questions.createdAt)).limit(Math.min(Math.max(limit, 1), 100));
  const options = rows.length ? await db.select().from(questionOptions).where(inArray(questionOptions.questionId, rows.map((q) => q.id))).orderBy(asc(questionOptions.displayOrder)) : [];
  return rows.map((q) => mapQuestion(q, options));
}

export async function getPublishedPassageSets(part: 6 | 7, filters: PassageSetFilters = {}): Promise<LearnerPassageSet[]> {
  const questionConditions = [eq(questions.toeicPart, part), eq(questions.status, "published")];
  if (filters.skill) questionConditions.push(eq(questions.skill, filters.skill)); if (filters.subSkill) questionConditions.push(eq(questions.subSkill, filters.subSkill)); if (filters.difficulty) questionConditions.push(eq(questions.difficulty, filters.difficulty));
  let matchingIds: string[] | undefined;
  if (filters.skill || filters.subSkill || filters.difficulty) matchingIds = [...new Set((await db.select({ id: questions.passageSetId }).from(questions).where(and(...questionConditions))).flatMap((r) => r.id ?? []))];
  if (matchingIds && !matchingIds.length) return [];
  const setConditions = [eq(passageSets.toeicPart, part), eq(passageSets.status, "published")]; if (filters.setType) setConditions.push(eq(passageSets.setType, filters.setType)); if (matchingIds) setConditions.push(inArray(passageSets.id, matchingIds));
  const sets = await db.select().from(passageSets).where(and(...setConditions)).orderBy(asc(passageSets.createdAt)).limit(Math.min(Math.max(filters.limit ?? 20, 1), 50));
  if (!sets.length) return [];
  const ids = sets.map((s) => s.id);
  const [docs, qs] = await Promise.all([db.select().from(passages).where(and(inArray(passages.passageSetId, ids), eq(passages.status, "published"))).orderBy(asc(passages.position)), db.select().from(questions).where(and(inArray(questions.passageSetId, ids), eq(questions.status, "published"))).orderBy(asc(questions.questionOrder))]);
  const opts = qs.length ? await db.select().from(questionOptions).where(inArray(questionOptions.questionId, qs.map((q) => q.id))).orderBy(asc(questionOptions.displayOrder)) : [];
  return sets.map((s) => ({ id: s.id, toeic_part: s.toeicPart as 6 | 7, skill_area: s.skillArea as "READING", set_type: s.setType as PassageSet["set_type"], title: s.title, metadata: s.metadata, status: s.status as PassageSet["status"], created_at: s.createdAt.toISOString(), updated_at: s.updatedAt.toISOString(), passages: docs.filter((p) => p.passageSetId === s.id).map((p) => ({ id: p.id, toeic_part: p.toeicPart as ToeicPart, passage_type: p.passageType as Passage["passage_type"], title: p.title, content: p.content, audio_url: p.audioUrl, image_url: p.imageUrl, metadata: p.metadata, status: p.status as Passage["status"], created_at: p.createdAt.toISOString(), updated_at: p.updatedAt.toISOString(), passage_set_id: p.passageSetId, position: p.position, document_type: p.documentType as Passage["document_type"] })), questions: qs.filter((q) => q.passageSetId === s.id).map((q) => mapQuestion(q, opts)) }));
}
export const getPart6Sets = (filters?: PassageSetFilters) => getPublishedPassageSets(6, { ...filters, setType: "part6" });
export const getPart7Sets = (filters?: PassageSetFilters) => getPublishedPassageSets(7, filters);
