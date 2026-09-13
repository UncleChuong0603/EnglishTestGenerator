import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ReadingPart } from "@/lib/practice/types";

import { calculateLearnerAnalytics, percentage } from "./calculate";
import type { AnalyticsAttempt, LearnerAnalytics, RecentSession } from "./types";

type SessionRow = {
  id: string;
  score_correct: number;
  score_total: number;
  question_count: number;
  submitted_at: string;
  practice_type: RecentSession["mode"];
};
type AnswerRow = { session_id: string; question_id: string; is_correct: boolean; created_at: string };
type QuestionRow = { id: string; skill: string; sub_skill: string; toeic_part: number };

/**
 * Source-of-truth rules: only this authenticated user's submitted sessions are
 * considered. A session is discarded unless its stored totals, unique answer
 * rows, correctness total, and Reading taxonomy all agree with question_count.
 * The database uniqueness constraint makes repeat submissions idempotent.
 */
export async function getLearnerAnalytics(
  userId: string,
  options: { excludeSessionId?: string } = {},
): Promise<LearnerAnalytics> {
  const admin = createAdminClient();
  const { data: sessionData, error: sessionError } = await admin.from("practice_sessions")
    .select("id, score_correct, score_total, question_count, submitted_at, practice_type")
    .eq("user_id", userId).eq("status", "submitted").not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });
  if (sessionError) {
    console.error("Could not load learner sessions", sessionError);
    throw new Error("ANALYTICS_LOAD_FAILED");
  }

  const candidates = ((sessionData ?? []) as SessionRow[]).filter((session) =>
    session.id !== options.excludeSessionId
    && session.question_count > 0
    && session.score_total === session.question_count
    && session.score_correct >= 0
    && session.score_correct <= session.score_total,
  );
  if (!candidates.length) return calculateLearnerAnalytics([], []);

  const sessionIds = candidates.map((session) => session.id);
  const { data: answerData, error: answerError } = await admin.from("attempt_answers")
    .select("session_id, question_id, is_correct, created_at").eq("user_id", userId).in("session_id", sessionIds);
  if (answerError) {
    console.error("Could not load learner answers", answerError);
    throw new Error("ANALYTICS_LOAD_FAILED");
  }
  const answers = (answerData ?? []) as AnswerRow[];
  const questionIds = [...new Set(answers.map((answer) => answer.question_id))];
  const { data: questionData, error: questionError } = questionIds.length
    ? await admin.from("questions").select("id, skill, sub_skill, toeic_part").in("id", questionIds)
    : { data: [], error: null };
  if (questionError) {
    console.error("Could not load analytics taxonomy", questionError);
    throw new Error("ANALYTICS_LOAD_FAILED");
  }

  const taxonomy = new Map(((questionData ?? []) as QuestionRow[]).map((question) => [question.id, question]));
  const answersBySession = new Map<string, AnswerRow[]>();
  for (const answer of answers) answersBySession.set(answer.session_id, [...(answersBySession.get(answer.session_id) ?? []), answer]);
  const validSessions = candidates.filter((session) => {
    const rows = answersBySession.get(session.id) ?? [];
    return rows.length === session.question_count
      && new Set(rows.map((answer) => answer.question_id)).size === session.question_count
      && rows.filter((answer) => answer.is_correct).length === session.score_correct
      && rows.every((answer) => {
        const question = taxonomy.get(answer.question_id);
        return question && [5, 6, 7].includes(question.toeic_part) && question.skill && question.sub_skill;
      });
  });
  const validSessionIds = new Set(validSessions.map((session) => session.id));
  const submittedAtBySession = new Map(validSessions.map((session) => [session.id, session.submitted_at]));
  const attempts: AnalyticsAttempt[] = answers.flatMap((answer) => {
    if (!validSessionIds.has(answer.session_id)) return [];
    const question = taxonomy.get(answer.question_id)!;
    return [{
      isCorrect: answer.is_correct,
      skill: question.skill,
      subSkill: question.sub_skill,
      part: question.toeic_part as ReadingPart,
      answeredAt: answer.created_at ?? submittedAtBySession.get(answer.session_id)!,
      sessionId: answer.session_id,
    }];
  });
  const sessions: RecentSession[] = validSessions.map((session) => ({
    id: session.id,
    submittedAt: session.submitted_at,
    correct: session.score_correct,
    total: session.score_total,
    accuracy: percentage(session.score_correct, session.score_total),
    mode: session.practice_type,
  }));
  return calculateLearnerAnalytics(attempts, sessions);
}
