import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type {
  PracticeQuestion,
  PracticeResult,
  PracticeSession,
} from "./types";

type SessionRow = {
  id: string;
  question_count: number;
  score_correct: number | null;
  score_total: number | null;
  status: "in_progress" | "submitted" | "abandoned";
  submitted_at: string | null;
};

type QuestionRow = {
  id: string;
  question_text: string;
  toeic_part: number;
};

async function getOwnedSession(sessionId: string, userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("practice_sessions")
    .select("id, question_count, score_correct, score_total, status, submitted_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not load practice session", error);
    throw new Error("PRACTICE_LOAD_FAILED");
  }

  return data as SessionRow | null;
}

async function getSafeQuestions(sessionId: string): Promise<PracticeQuestion[]> {
  const admin = createAdminClient();
  const { data: assigned, error: assignedError } = await admin
    .from("practice_session_questions")
    .select("question_id, display_order")
    .eq("session_id", sessionId)
    .order("display_order");

  if (assignedError) throw assignedError;
  const questionIds = (assigned ?? []).map((row) => row.question_id);
  if (!questionIds.length) return [];

  const [{ data: questions, error: questionsError }, { data: options, error: optionsError }] =
    await Promise.all([
      admin.from("questions").select("id, question_text, toeic_part").in("id", questionIds),
      admin
        .from("question_options")
        .select("id, question_id, option_key, option_text, display_order")
        .in("question_id", questionIds)
        .order("display_order"),
    ]);

  if (questionsError) throw questionsError;
  if (optionsError) throw optionsError;

  const questionMap = new Map(
    ((questions ?? []) as QuestionRow[]).map((question) => [question.id, question]),
  );

  return (assigned ?? []).map((assignment) => {
    const question = questionMap.get(assignment.question_id);
    if (!question || question.toeic_part !== 5) throw new Error("INVALID_PRACTICE_QUESTION");

    return {
      id: question.id,
      number: assignment.display_order,
      part: 5,
      text: question.question_text,
      options: (options ?? [])
        .filter((option) => option.question_id === question.id)
        .map((option) => ({ id: option.id, key: option.option_key, text: option.option_text })),
    };
  });
}

export async function getPracticeSession(
  sessionId: string,
  userId: string,
): Promise<PracticeSession | null | "submitted"> {
  const session = await getOwnedSession(sessionId, userId);
  if (!session) return null;
  if (session.status === "submitted") return "submitted";
  if (session.status !== "in_progress") return null;

  try {
    const questions = await getSafeQuestions(session.id);
    if (questions.length !== session.question_count || questions.some((q) => q.options.length !== 4)) {
      throw new Error("INCOMPLETE_PRACTICE_SESSION");
    }
    return { id: session.id, status: "in_progress", questionCount: session.question_count, questions };
  } catch (error) {
    console.error("Could not load practice questions", error);
    throw new Error("PRACTICE_LOAD_FAILED");
  }
}

export async function getPracticeResult(
  sessionId: string,
  userId: string,
): Promise<PracticeResult | null | "in_progress"> {
  const session = await getOwnedSession(sessionId, userId);
  if (!session) return null;
  if (session.status === "in_progress") return "in_progress";
  if (
    session.status !== "submitted" ||
    session.score_correct === null ||
    session.score_total === null ||
    !session.submitted_at
  ) return null;

  const admin = createAdminClient();
  const safeQuestions = await getSafeQuestions(session.id);
  const questionIds = safeQuestions.map((question) => question.id);
  const [{ data: answers, error: answersError }, { data: solutions, error: solutionsError }] =
    await Promise.all([
      admin
        .from("attempt_answers")
        .select("question_id, selected_option_id, is_correct")
        .eq("session_id", session.id)
        .eq("user_id", userId),
      admin
        .from("question_solutions")
        .select("question_id, correct_option_id, explanation_en, explanation_vi")
        .in("question_id", questionIds),
    ]);

  if (answersError || solutionsError) {
    console.error("Could not load practice review", answersError ?? solutionsError);
    throw new Error("PRACTICE_LOAD_FAILED");
  }

  const answerMap = new Map((answers ?? []).map((answer) => [answer.question_id, answer]));
  const solutionMap = new Map((solutions ?? []).map((solution) => [solution.question_id, solution]));

  return {
    id: session.id,
    scoreCorrect: session.score_correct,
    scoreTotal: session.score_total,
    submittedAt: session.submitted_at,
    questions: safeQuestions.map((question) => {
      const answer = answerMap.get(question.id);
      const solution = solutionMap.get(question.id);
      if (!answer || !solution) throw new Error("INCOMPLETE_PRACTICE_RESULT");
      return {
        ...question,
        selectedOptionId: answer.selected_option_id,
        correctOptionId: solution.correct_option_id,
        isCorrect: answer.is_correct,
        explanationEn: solution.explanation_en,
        explanationVi: solution.explanation_vi,
      };
    }),
  };
}
