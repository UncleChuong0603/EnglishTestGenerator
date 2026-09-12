import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { aggregatePerformance, percentage } from "./calculate";
import type { AnalyticsAttempt, LearnerAnalytics, RecentSession } from "./types";

type SessionRow = {
  id: string;
  score_correct: number;
  score_total: number;
  submitted_at: string;
};

export async function getLearnerAnalytics(userId: string): Promise<LearnerAnalytics> {
  const admin = createAdminClient();
  const { data: sessionData, error: sessionError } = await admin
    .from("practice_sessions")
    .select("id, score_correct, score_total, submitted_at")
    .eq("user_id", userId)
    .eq("practice_type", "part_5")
    .eq("status", "submitted")
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false });

  if (sessionError) {
    console.error("Could not load learner sessions", sessionError);
    throw new Error("ANALYTICS_LOAD_FAILED");
  }

  const sessions = (sessionData ?? []) as SessionRow[];
  const recentSessions: RecentSession[] = sessions.slice(0, 5).map((session) => ({
    id: session.id,
    submittedAt: session.submitted_at,
    correct: session.score_correct,
    total: session.score_total,
    accuracy: percentage(session.score_correct, session.score_total),
  }));

  if (!sessions.length) {
    return {
      totalAttempted: 0,
      totalCorrect: 0,
      overallAccuracy: 0,
      sessionCount: 0,
      skills: [],
      subskills: [],
      focusAreas: [],
      recentSessions,
    };
  }

  const sessionIds = sessions.map((session) => session.id);
  const { data: answerData, error: answerError } = await admin
    .from("attempt_answers")
    .select("question_id, is_correct")
    .eq("user_id", userId)
    .in("session_id", sessionIds);

  if (answerError) {
    console.error("Could not load learner answers", answerError);
    throw new Error("ANALYTICS_LOAD_FAILED");
  }

  const questionIds = [...new Set((answerData ?? []).map((answer) => answer.question_id))];
  const { data: questionData, error: questionError } = questionIds.length
    ? await admin.from("questions").select("id, skill, sub_skill").in("id", questionIds)
    : { data: [], error: null };

  if (questionError) {
    console.error("Could not load analytics taxonomy", questionError);
    throw new Error("ANALYTICS_LOAD_FAILED");
  }

  const taxonomy = new Map((questionData ?? []).map((question) => [question.id, question]));
  const attempts: AnalyticsAttempt[] = (answerData ?? []).flatMap((answer) => {
    const question = taxonomy.get(answer.question_id);
    return question
      ? [{ isCorrect: answer.is_correct, skill: question.skill, subSkill: question.sub_skill }]
      : [];
  });
  const totalCorrect = attempts.filter((attempt) => attempt.isCorrect).length;
  const subskills = aggregatePerformance(attempts, "subSkill");

  return {
    totalAttempted: attempts.length,
    totalCorrect,
    overallAccuracy: percentage(totalCorrect, attempts.length),
    sessionCount: sessions.length,
    skills: aggregatePerformance(attempts, "skill"),
    subskills,
    focusAreas: subskills.filter((metric) => metric.status === "Weak" || metric.status === "Needs improvement").slice(0, 3),
    recentSessions,
  };
}
