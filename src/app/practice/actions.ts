"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { aggregateStoredAnswers } from "@/lib/tests/analysis";
import { selectAdaptiveQuestions } from "@/lib/tests/adaptive";
import { difficulties, skills, type Difficulty, type QuestionCandidate, type Skill } from "@/lib/tests/types";

export type ActionResult = { ok: true; id: string } | { ok: false; message: string };

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createPractice(difficulty: string): Promise<ActionResult> {
  if (!difficulties.includes(difficulty as Difficulty)) return { ok: false, message: "Choose a valid level." };
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Sign in to start practising." };

  try {
  const { data: openAttempt } = await supabase.from("attempts").select("id").eq("difficulty", difficulty).eq("status", "in_progress").maybeSingle();
  if (openAttempt) return { ok: true, id: openAttempt.id };

  const { data: attempts } = await supabase.from("attempts").select("id").eq("status", "submitted");
  const admin = createAdminClient();
  const attemptIds = attempts?.map((attempt) => attempt.id) ?? [];
  const { data: priorAnswers } = attemptIds.length
    ? await admin.from("attempt_answers").select("question_id, is_correct").in("attempt_id", attemptIds)
    : { data: [] };
  const priorQuestionIds = priorAnswers?.map((answer) => answer.question_id) ?? [];
  const { data: priorQuestions } = priorQuestionIds.length
    ? await admin.from("questions").select("id, skill").in("id", priorQuestionIds)
    : { data: [] };
  const skillMap = new Map(priorQuestions?.map((question) => [question.id, question.skill as Skill]));
  const history = aggregateStoredAnswers((priorAnswers ?? []).flatMap((answer) => {
    const skill = skillMap.get(answer.question_id);
    return skill ? [{ skill, isCorrect: answer.is_correct }] : [];
  })).map(({ skill, correct, total }) => ({ skill, correct, total }));
  const usage = new Map<string, number>();
  for (const answer of priorAnswers ?? []) usage.set(answer.question_id, (usage.get(answer.question_id) ?? 0) + 1);

  const candidateResults = await Promise.all(skills.map(async (skill, index) => {
    const filters = () => admin.from("questions").select("id, passage_id, skill, passages!inner(is_active)", { count: "exact" }).eq("difficulty", difficulty).eq("skill", skill).eq("is_active", true).eq("passages.is_active", true);
    const { count } = await filters().limit(1);
    const maximumOffset = Math.max(0, (count ?? 0) - 100);
    const offset = maximumOffset ? (Date.now() + index * 997) % (maximumOffset + 1) : 0;
    return filters().order("id").range(offset, offset + 99);
  }));
  const bankQuestions = candidateResults.flatMap((result) => result.data ?? []);
  if (bankQuestions.length < 10) return { ok: false, message: "There are not enough curated questions at this level yet." };
  const candidates: QuestionCandidate[] = bankQuestions.map((question) => ({ id: question.id, passageId: question.passage_id, skill: question.skill as Skill, previousUses: usage.get(question.id) ?? 0 }));
  const selected = selectAdaptiveQuestions(candidates, history, 10, `${user.id}:${Date.now()}`);
  if (selected.length < 10) return { ok: false, message: "We could not build a balanced practice set. Please try another level." };

  const { data: attemptId, error } = await admin.rpc("create_practice_attempt", {
    p_user_id: user.id,
    p_difficulty: difficulty,
    p_question_ids: selected.map((question) => question.id),
  });
  if (error || !attemptId) {
    const { data: racedAttempt } = await supabase.from("attempts").select("id").eq("difficulty", difficulty).eq("status", "in_progress").maybeSingle();
    if (racedAttempt) return { ok: true, id: racedAttempt.id };
    return { ok: false, message: "We could not start a practice set. Please try again." };
  }
  return { ok: true, id: attemptId as string };
  } catch (error) {
    console.error("Adaptive practice creation failed", error instanceof Error ? error.message : "unknown error");
    return { ok: false, message: "We could not build a practice set right now. Please try again." };
  }
}

export async function submitAttempt(attemptId: string, answers: unknown): Promise<ActionResult> {
  if (typeof attemptId !== "string" || !Array.isArray(answers) || answers.length > 10) return { ok: false, message: "The submitted answers were invalid." };
  const parsed = answers.every(
    (answer) =>
      typeof answer === "object" &&
      answer !== null &&
      "questionId" in answer &&
      "selectedAnswer" in answer &&
      typeof answer.questionId === "string" &&
      (answer.selectedAnswer === null ||
        (typeof answer.selectedAnswer === "string" &&
          ["A", "B", "C", "D"].includes(answer.selectedAnswer))),
  );
  if (!parsed) return { ok: false, message: "Some answers were invalid. Please reload and try again." };
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };
  const { data: attempt } = await supabase.from("attempts").select("id, status").eq("id", attemptId).eq("user_id", user.id).maybeSingle();
  if (!attempt) return { ok: false, message: "This attempt is unavailable." };
  if (attempt.status === "submitted") return { ok: true, id: attemptId };
  const admin = createAdminClient();
  const { error } = await admin.rpc("submit_reading_attempt", { p_attempt_id: attemptId, p_user_id: user.id, p_answers: answers });
  if (error) { console.error("Attempt submission failed", error.code); return { ok: false, message: "We could not submit your answers. Please try again." }; }
  return { ok: true, id: attemptId };
}
