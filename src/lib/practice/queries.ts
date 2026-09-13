import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import type { PracticeGroup, PracticeQuestion, PracticeResult, PracticeSession, ReadingPracticeMode } from "./types";

type SessionRow = {
  id: string; question_count: number; requested_question_count: number;
  practice_type: ReadingPracticeMode; source: "recommended" | "custom";
  requested_skill: string | null; requested_sub_skill: string | null;
  score_correct: number | null; score_total: number | null;
  status: "in_progress" | "submitted" | "abandoned"; submitted_at: string | null;
};
type AssignmentRow = { question_id: string; display_order: number; passage_set_id: string | null };
type QuestionRow = {
  id: string; question_text: string; skill: string; sub_skill: string;
  toeic_part: 5 | 6 | 7; passage_set_id: string | null; question_order: number;
};

async function getOwnedSession(sessionId: string, userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.from("practice_sessions")
    .select("id, question_count, requested_question_count, practice_type, source, requested_skill, requested_sub_skill, score_correct, score_total, status, submitted_at")
    .eq("id", sessionId).eq("user_id", userId).maybeSingle();
  if (error) {
    console.error("Could not load practice session", error);
    throw new Error("PRACTICE_LOAD_FAILED");
  }
  return data as SessionRow | null;
}

async function getSafeSessionContent(sessionId: string) {
  const admin = createAdminClient();
  const { data: rawAssigned, error: assignedError } = await admin
    .from("practice_session_questions").select("question_id, display_order, passage_set_id")
    .eq("session_id", sessionId).order("display_order");
  if (assignedError) throw assignedError;
  const assigned = (rawAssigned ?? []) as AssignmentRow[];
  const questionIds = assigned.map((row) => row.question_id);
  if (!questionIds.length) return { questions: [], groups: [] };
  const setIds = [...new Set(assigned.flatMap((row) => row.passage_set_id ?? []))];

  const [questionResult, optionResult, setResult, passageResult] = await Promise.all([
    admin.from("questions").select("id, question_text, skill, sub_skill, toeic_part, passage_set_id, question_order").in("id", questionIds),
    admin.from("question_options").select("id, question_id, option_key, option_text, display_order").in("question_id", questionIds).order("display_order"),
    setIds.length ? admin.from("passage_sets").select("id, toeic_part, set_type, title, status").in("id", setIds) : Promise.resolve({ data: [], error: null }),
    setIds.length ? admin.from("passages").select("id, passage_set_id, title, content, position, document_type, status").in("passage_set_id", setIds).order("position") : Promise.resolve({ data: [], error: null }),
  ]);
  const failure = questionResult.error ?? optionResult.error ?? setResult.error ?? passageResult.error;
  if (failure) throw failure;

  const questionMap = new Map(((questionResult.data ?? []) as QuestionRow[]).map((q) => [q.id, q]));
  const questions: PracticeQuestion[] = assigned.map((assignment) => {
    const question = questionMap.get(assignment.question_id);
    if (!question || ![5, 6, 7].includes(question.toeic_part)
      || question.passage_set_id !== assignment.passage_set_id) throw new Error("INVALID_PRACTICE_QUESTION");
    return {
      id: question.id, number: assignment.display_order, part: question.toeic_part,
      text: question.question_text, skill: question.skill, subSkill: question.sub_skill,
      passageSetId: question.passage_set_id,
      options: (optionResult.data ?? []).filter((option) => option.question_id === question.id)
        .map((option) => ({ id: option.id, key: option.option_key, text: option.option_text })),
    };
  });

  const setMap = new Map((setResult.data ?? []).map((set) => [set.id, set]));
  const groups: PracticeGroup[] = [];
  for (const question of questions) {
    if (!question.passageSetId) {
      groups.push({ id: question.id, part: question.part, setType: "standalone", title: null, passages: [], questions: [question] });
      continue;
    }
    if (groups.some((group) => group.id === question.passageSetId)) continue;
    const set = setMap.get(question.passageSetId);
    if (!set || set.status !== "published") throw new Error("INVALID_PASSAGE_SET");
    const passages = (passageResult.data ?? []).filter((passage) => passage.passage_set_id === set.id);
    if (!passages.length || passages.some((passage) => passage.status !== "published" || !passage.content)) {
      throw new Error("INCOMPLETE_PASSAGE_SET");
    }
    groups.push({
      id: set.id, part: set.toeic_part, setType: set.set_type, title: set.title,
      passages: passages.map((passage) => ({
        id: passage.id, title: passage.title, content: passage.content!, position: passage.position!,
        documentType: passage.document_type!,
      })),
      questions: questions.filter((item) => item.passageSetId === set.id),
    });
  }
  return { questions, groups };
}

export async function getPracticeSession(sessionId: string, userId: string): Promise<PracticeSession | null | "submitted"> {
  const session = await getOwnedSession(sessionId, userId);
  if (!session) return null;
  if (session.status === "submitted") return "submitted";
  if (session.status !== "in_progress") return null;
  try {
    const content = await getSafeSessionContent(session.id);
    if (content.questions.length !== session.question_count || content.questions.some((q) => q.options.length !== 4)) {
      throw new Error("INCOMPLETE_PRACTICE_SESSION");
    }
    return {
      id: session.id, status: "in_progress", questionCount: session.question_count,
      requestedQuestionCount: session.requested_question_count, mode: session.practice_type,
      source: session.source, requestedSkill: session.requested_skill,
      requestedSubSkill: session.requested_sub_skill, ...content,
    };
  } catch (error) {
    console.error("Could not load practice questions", error);
    throw new Error("PRACTICE_LOAD_FAILED");
  }
}

export async function getPracticeResult(sessionId: string, userId: string): Promise<PracticeResult | null | "in_progress"> {
  const session = await getOwnedSession(sessionId, userId);
  if (!session) return null;
  if (session.status === "in_progress") return "in_progress";
  if (session.status !== "submitted" || session.score_correct === null || session.score_total === null || !session.submitted_at) return null;
  const admin = createAdminClient();
  const content = await getSafeSessionContent(session.id);
  const questionIds = content.questions.map((question) => question.id);
  const [{ data: answers, error: answersError }, { data: solutions, error: solutionsError }] = await Promise.all([
    admin.from("attempt_answers").select("question_id, selected_option_id, is_correct").eq("session_id", session.id).eq("user_id", userId),
    admin.from("question_solutions").select("question_id, correct_option_id, explanation_en, explanation_vi").in("question_id", questionIds),
  ]);
  if (answersError || solutionsError) throw new Error("PRACTICE_LOAD_FAILED");
  const answerMap = new Map((answers ?? []).map((answer) => [answer.question_id, answer]));
  const solutionMap = new Map((solutions ?? []).map((solution) => [solution.question_id, solution]));
  const reviewQuestions = content.questions.map((question) => {
    const answer = answerMap.get(question.id);
    const solution = solutionMap.get(question.id);
    if (!answer || !solution) throw new Error("INCOMPLETE_PRACTICE_RESULT");
    return { ...question, selectedOptionId: answer.selected_option_id, correctOptionId: solution.correct_option_id,
      isCorrect: answer.is_correct, explanationEn: solution.explanation_en, explanationVi: solution.explanation_vi };
  });
  const reviewMap = new Map(reviewQuestions.map((question) => [question.id, question]));
  return {
    id: session.id, mode: session.practice_type, source: session.source,
    requestedSkill: session.requested_skill, requestedSubSkill: session.requested_sub_skill,
    requestedQuestionCount: session.requested_question_count,
    scoreCorrect: session.score_correct, scoreTotal: session.score_total,
    submittedAt: session.submitted_at, questions: reviewQuestions,
    groups: content.groups.map((group) => ({ ...group, questions: group.questions.map((question) => reviewMap.get(question.id)!) })),
  };
}
