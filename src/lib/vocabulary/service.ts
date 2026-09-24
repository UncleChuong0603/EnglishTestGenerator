import "server-only";
import { and, asc, eq, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { userVocabulary } from "@/db/schema";
import { getPracticeResult } from "@/lib/practice/queries";
import { vocabularyByKey, vocabularySuggestions } from "./catalog";
import { studyEntryByKey } from "./study-list";
import { nextVocabularySchedule } from "./schedule";

export async function saveVocabularyFromResult(userId: string, sessionId: string, questionId: string, entryKey: string) {
  const result = await getPracticeResult(sessionId, { userId });
  if (!result || result === "in_progress") return false;
  const question = result.questions.find((item) => item.id === questionId);
  if (!question) return false;
  const correct = question.options.find((option) => option.id === question.correctOptionId)?.text ?? "";
  const questionContext = question.text.replace(/_{2,}/g, correct);
  const transcript = question.transcript ?? "";
  const passages = result.groups.find((group) => group.questions.some((item) => item.id === questionId))?.passages.map((passage) => passage.content) ?? [];
  const entry = vocabularySuggestions(question.text, correct, [...passages, transcript], 100).find((item) => item.key === entryKey);
  if (!entry) return false;
  const source = [questionContext, ...passages, transcript].find((text) => vocabularySuggestions(text, "", [], 100).some((item) => item.key === entryKey)) ?? questionContext;
  const position = Math.max(0, source.toLowerCase().indexOf(entry.term));
  const context = source.slice(Math.max(0, position - 100), Math.min(source.length, position + entry.term.length + 120)).slice(0, 1200);
  await db.insert(userVocabulary).values({ userId, entryKey, sourceQuestionId: questionId, sourceSessionId: sessionId, sourceQuestionNumber: question.number, contextSentence: context, toeicPart: question.part }).onConflictDoNothing({ target: [userVocabulary.userId, userVocabulary.entryKey] });
  return true;
}

export async function saveVocabularyFromStudyList(userId: string, entryKey: string) {
  const entry = studyEntryByKey(entryKey);
  if (!entry) return false;
  await db.insert(userVocabulary).values({ userId, entryKey, contextSentence: entry.example || entry.term, toeicPart: 5 }).onConflictDoNothing({ target: [userVocabulary.userId, userVocabulary.entryKey] });
  return true;
}

export async function getVocabularyCards(userId: string) {
  const rows = await db.select().from(userVocabulary).where(eq(userVocabulary.userId, userId)).orderBy(asc(userVocabulary.dueAt), asc(userVocabulary.createdAt));
  return rows.flatMap((row) => {
    const entry = vocabularyByKey(row.entryKey);
    return entry ? [{ ...row, entry }] : [];
  });
}

export async function reviewVocabulary(userId: string, cardId: string, remembered: boolean) {
  return db.transaction(async (tx) => {
    const [card] = await tx.select().from(userVocabulary).where(and(eq(userVocabulary.id, cardId), eq(userVocabulary.userId, userId))).for("update").limit(1);
    if (!card || !vocabularyByKey(card.entryKey) || card.dueAt.getTime() > Date.now()) return false;
    const now = new Date();
    const { intervalDays, dueAt } = nextVocabularySchedule(card.intervalDays, remembered, now);
    await tx.update(userVocabulary).set({ intervalDays, dueAt, correctStreak: remembered ? card.correctStreak + 1 : 0, reviewCount: sql`${userVocabulary.reviewCount} + 1`, lastReviewedAt: now, updatedAt: now }).where(and(eq(userVocabulary.id, cardId), eq(userVocabulary.userId, userId), lte(userVocabulary.dueAt, now)));
    return true;
  });
}
