import "server-only";
import { and, asc, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/db";
import { attemptAnswers, diagnosticRuns, fullMockRuns, listeningTranscripts, mediaAssets, passageSets, passages, practiceSessionQuestions, practiceSessions, questionGroupMedia, questionOptions, questionSolutions, questions, rankedChallengeRuns, rankedChallenges } from "@/db/schema";
import { createMediaStorage } from "@/lib/media/storage";
import type { PracticeGroup, PracticeQuestion, PracticeResult, PracticeSession } from "./types";
import { toLearnerPracticeQuestion } from "./learner-dto";
import { challengePhase } from "@/lib/challenges/policy";

export type PracticeOwner = { userId: string; guestOwnerHash?: never } | { userId?: never; guestOwnerHash: string };
function ownerCondition(owner: PracticeOwner) { return "userId" in owner ? eq(practiceSessions.userId, owner.userId!) : and(eq(practiceSessions.guestOwnerHash, owner.guestOwnerHash), gt(practiceSessions.expiresAt, new Date())); }
async function getOwnedSession(sessionId: string, owner: PracticeOwner) { return (await db.select().from(practiceSessions).where(and(eq(practiceSessions.id, sessionId), ownerCondition(owner))).limit(1))[0] ?? null; }

export async function getSafeSessionContent(sessionId: string, listening = false) {
  const assigned = await db.select().from(practiceSessionQuestions).where(eq(practiceSessionQuestions.sessionId, sessionId)).orderBy(asc(practiceSessionQuestions.displayOrder));
  const questionIds = assigned.map((row) => row.questionId); if (!questionIds.length) return { questions: [], groups: [] };
  const setIds = [...new Set(assigned.flatMap((row) => row.passageSetId ?? []))];
  const [questionRows, options, sets, docs] = await Promise.all([
    db.select().from(questions).where(inArray(questions.id, questionIds)), db.select().from(questionOptions).where(inArray(questionOptions.questionId, questionIds)).orderBy(asc(questionOptions.displayOrder)),
    setIds.length ? db.select().from(passageSets).where(inArray(passageSets.id, setIds)) : [], setIds.length ? db.select().from(passages).where(inArray(passages.passageSetId, setIds)).orderBy(asc(passages.position)) : [],
  ]);
  if (listening) {
    const [attachments, transcripts] = await Promise.all([
      db.select({ groupId: questionGroupMedia.questionGroupId, id: mediaAssets.id, kind: mediaAssets.kind, role: questionGroupMedia.role, storageKey: mediaAssets.storageKey, status: mediaAssets.status, scope: mediaAssets.accessScope }).from(questionGroupMedia).innerJoin(mediaAssets, eq(questionGroupMedia.mediaAssetId, mediaAssets.id)).where(inArray(questionGroupMedia.questionGroupId, setIds)),
      db.select().from(listeningTranscripts).where(inArray(listeningTranscripts.questionGroupId, setIds)),
    ]);
    const storage = createMediaStorage();
    const safeQuestions = await Promise.all(assigned.map(async (assignment) => {
      const q = questionRows.find((row) => row.id === assignment.questionId); if (!q || ![1, 2, 3, 4].includes(q.toeicPart) || q.skillArea !== "LISTENING" || !q.passageSetId) throw new Error("INVALID_LISTENING_QUESTION");
      const assets = attachments.filter((asset) => asset.groupId === q.passageSetId && asset.status === "READY" && asset.scope === "CONTENT");
      const safe = toLearnerPracticeQuestion({ ...q, displayOrder: assignment.displayOrder, options: options.filter((o) => o.questionId === q.id) });
      safe.media = await Promise.all(assets.map(async (asset) => ({ id: asset.id, kind: asset.kind as "AUDIO" | "IMAGE", url: await storage.createReadUrl(asset.storageKey), alt: asset.kind === "IMAGE" ? `TOEIC Listening Part ${q.toeicPart} graphic` : "TOEIC listening audio" })));
      return safe;
    }));
    const groups: PracticeGroup[] = [];
    for (const question of safeQuestions) {
      if (groups.some((group) => group.id === question.passageSetId)) continue;
      const set = sets.find((row) => row.id === question.passageSetId); if (!set) throw new Error("INVALID_LISTENING_GROUP");
      const setType = question.part === 1 ? "photographs" : question.part === 2 ? "question_response" : set.setType;
      groups.push({ id: set.id, part: question.part, setType: setType as PracticeGroup["setType"], title: set.title, passages: [], questions: safeQuestions.filter((q) => q.passageSetId === set.id) });
    }
    return { questions: safeQuestions, groups, transcripts };
  }
  const questionMap = new Map(questionRows.map((q) => [q.id, q]));
  const safeQuestions: PracticeQuestion[] = assigned.map((assignment) => { const q = questionMap.get(assignment.questionId); if (!q || ![5, 6, 7].includes(q.toeicPart) || q.passageSetId !== assignment.passageSetId) throw new Error("INVALID_PRACTICE_QUESTION"); return toLearnerPracticeQuestion({ ...q, displayOrder: assignment.displayOrder, options: options.filter((o) => o.questionId === q.id) }); });
  const setMap = new Map(sets.map((set) => [set.id, set])); const groups: PracticeGroup[] = [];
  for (const question of safeQuestions) {
    if (!question.passageSetId) { groups.push({ id: question.id, part: question.part, setType: "standalone", title: null, passages: [], questions: [question] }); continue; }
    if (groups.some((group) => group.id === question.passageSetId)) continue; const set = setMap.get(question.passageSetId); if (!set || set.status !== "published") throw new Error("INVALID_PASSAGE_SET");
    const setDocs = docs.filter((p) => p.passageSetId === set.id); if (!setDocs.length || setDocs.some((p) => p.status !== "published" || !p.content || !p.position || !p.documentType)) throw new Error("INCOMPLETE_PASSAGE_SET");
    groups.push({ id: set.id, part: set.toeicPart as 6 | 7, setType: set.setType as PracticeGroup["setType"], title: set.title, passages: setDocs.map((p) => ({ id: p.id, title: p.title, content: p.content!, position: p.position!, documentType: p.documentType! })), questions: safeQuestions.filter((item) => item.passageSetId === set.id) });
  }
  return { questions: safeQuestions, groups };
}

export async function getPracticeSession(sessionId: string, owner: PracticeOwner): Promise<PracticeSession | null | "submitted"> {
  const session = await getOwnedSession(sessionId, owner); if (!session || session.practiceType === "demo_test" || session.fullMockRunId || session.rankedChallengeRunId) return null; if (session.status === "submitted") return "submitted"; if (session.status !== "in_progress") return null;
  const listening = session.skillArea === "LISTENING"; const content = await getSafeSessionContent(session.id, listening); const expected = session.part === 2 ? 3 : 4;
  if (content.questions.length !== session.questionCount || content.questions.some((q) => q.options.length !== expected)) throw new Error("PRACTICE_LOAD_FAILED");
  return { id: session.id, status: "in_progress", questionCount: session.questionCount, requestedQuestionCount: session.requestedQuestionCount, mode: session.practiceType as PracticeSession["mode"], skillArea: listening ? "LISTENING" : "READING", source: session.source as PracticeSession["source"], requestedSkill: session.requestedSkill, requestedSubSkill: session.requestedSubSkill, questions: content.questions, groups: content.groups };
}

export async function getPracticeResult(sessionId: string, owner: PracticeOwner): Promise<PracticeResult | null | "in_progress"> {
  const session = await getOwnedSession(sessionId, owner); if (!session || session.practiceType === "demo_test") return null; if (session.status === "in_progress") return "in_progress";
  if (session.diagnosticRunId) { const parent = (await db.select({ status: diagnosticRuns.status }).from(diagnosticRuns).where(eq(diagnosticRuns.id, session.diagnosticRunId)).limit(1))[0]; if (!parent || parent.status !== "COMPLETED") return null; }
  if (session.fullMockRunId) { const parent = (await db.select({ status: fullMockRuns.status }).from(fullMockRuns).where(eq(fullMockRuns.id, session.fullMockRunId)).limit(1))[0]; if (!parent || parent.status !== "COMPLETED") return null; }
  if (session.rankedChallengeRunId) { const parent=(await db.select({status:rankedChallengeRuns.status,challenge:rankedChallenges}).from(rankedChallengeRuns).innerJoin(rankedChallenges,eq(rankedChallenges.id,rankedChallengeRuns.challengeId)).where(eq(rankedChallengeRuns.id,session.rankedChallengeRunId)).limit(1))[0];if(!parent||parent.status!=="COMPLETED"||challengePhase(parent.challenge)!=="CLOSED")return null; }
  if (session.status !== "submitted" || session.scoreCorrect === null || session.scoreTotal === null || !session.submittedAt) return null;
  const listening = session.skillArea === "LISTENING"; const content = await getSafeSessionContent(session.id, listening); const ids = content.questions.map((q) => q.id);
  const [answers, solutions] = await Promise.all([db.select().from(attemptAnswers).where(eq(attemptAnswers.sessionId, session.id)), db.select().from(questionSolutions).where(inArray(questionSolutions.questionId, ids))]);
  const answerMap = new Map(answers.map((a) => [a.questionId, a])); const solutionMap = new Map(solutions.map((s) => [s.questionId, s]));
  const transcriptRows = "transcripts" in content && content.transcripts ? content.transcripts : [];
  const transcriptMap = new Map<string, string>();
  for (const row of transcriptRows) if (row.questionGroupId) transcriptMap.set(row.questionGroupId, row.content);
  const fullOptions = listening ? await db.select().from(questionOptions).where(inArray(questionOptions.questionId, ids)).orderBy(asc(questionOptions.displayOrder)) : [];
  const reviewQuestions = content.questions.map((q) => { const a = answerMap.get(q.id); const s = solutionMap.get(q.id); if (!a || !s) throw new Error("INCOMPLETE_PRACTICE_RESULT"); return { ...q, options: listening ? fullOptions.filter((o) => o.questionId === q.id).map((o) => ({ id: o.id, key: o.optionKey, text: o.optionText })) : q.options, selectedOptionId: a.selectedOptionId, correctOptionId: s.correctOptionId, isCorrect: a.isCorrect, explanationEn: s.explanationEn, explanationVi: s.explanationVi, ...(listening ? { transcript: q.passageSetId ? transcriptMap.get(q.passageSetId) ?? "" : "" } : {}) }; });
  const map = new Map(reviewQuestions.map((q) => [q.id, q]));
  return { id: session.id, mode: session.practiceType as PracticeResult["mode"], skillArea: listening ? "LISTENING" : "READING", source: session.source as PracticeResult["source"], requestedSkill: session.requestedSkill, requestedSubSkill: session.requestedSubSkill, requestedQuestionCount: session.requestedQuestionCount, scoreCorrect: session.scoreCorrect, scoreTotal: session.scoreTotal, submittedAt: session.submittedAt.toISOString(), questions: reviewQuestions, groups: content.groups.map((group) => ({ ...group, questions: group.questions.map((q) => map.get(q.id)!) })) };
}
