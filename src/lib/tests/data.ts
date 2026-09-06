import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ReadingQuestion } from "./types";

export async function getAttemptContent(attemptId: string, userId: string) {
  const supabase = await createClient();
  const { data: attempt, error } = await supabase
    .from("attempts")
    .select("id, difficulty, status")
    .eq("id", attemptId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !attempt) return null;

  const admin = createAdminClient();
  const { data: selections } = await admin
    .from("attempt_questions")
    .select("question_id, question_order")
    .eq("attempt_id", attemptId)
    .order("question_order");
  if (!selections?.length) return null;

  const { data: questions } = await admin
    .from("questions")
    .select("id, passage_id, question, options, skill, sub_skill, topic, difficulty")
    .in("id", selections.map((selection) => selection.question_id));
  if (!questions) return null;

  const passageIds = [...new Set(questions.map((question) => question.passage_id))];
  const { data: passages } = await admin.from("passages").select("id, title, content").in("id", passageIds);
  if (!passages) return null;

  const orderMap = new Map(selections.map((selection) => [selection.question_id, selection.question_order]));
  const passageMap = new Map(passages.map((passage) => [passage.id, passage]));
  const safeQuestions = questions.map((question) => {
    const passage = passageMap.get(question.passage_id);
    return {
      ...question,
      question_order: orderMap.get(question.id),
      passage_title: passage?.title,
      passage_content: passage?.content,
    } as ReadingQuestion;
  }).sort((a, b) => a.question_order - b.question_order);

  return { attempt, questions: safeQuestions };
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ReadingQuestion, ReadingTest } from "./types";

export async function getOwnedTest(testId: string, userId: string) {
  const supabase = await createClient();
  const { data: test, error } = await supabase.from("tests").select("id, title, passage, difficulty, focus, question_count").eq("id", testId).eq("created_by", userId).maybeSingle();
  if (error || !test) return null;
  const { data: questions, error: questionError } = await supabase.from("questions").select("id, question_order, question, options, skill, sub_skill, difficulty").eq("test_id", testId).order("question_order");
  if (questionError || !questions) return null;
  return { test: test as ReadingTest, questions: questions as ReadingQuestion[] };
}

export async function saveGeneratedTest(userId: string, generated: { title: string; passage: string; questions: Array<{ order: number; question: string; options: unknown; correctAnswer: string; explanation: string; skill: string; subSkill: string; difficulty: string }> }, options: { difficulty: string; focus: string; questionCount: number }) {
  const admin = createAdminClient();
  const { data: test, error } = await admin.from("tests").insert({ title: generated.title, passage: generated.passage, difficulty: options.difficulty, focus: options.focus, question_count: options.questionCount, created_by: userId }).select("id").single();
  if (error || !test) throw new Error("Could not save generated test");

  const { data: questions, error: questionError } = await admin.from("questions").insert(generated.questions.map((q) => ({ test_id: test.id, question_order: q.order, question: q.question, options: q.options, skill: q.skill, sub_skill: q.subSkill, difficulty: q.difficulty }))).select("id, question_order");
  if (questionError || !questions) { await admin.from("tests").delete().eq("id", test.id); throw new Error("Could not save questions"); }

  const ids = new Map(questions.map((q) => [q.question_order, q.id]));
  const { error: keyError } = await admin.from("question_answer_keys").insert(generated.questions.map((q) => ({ question_id: ids.get(q.order), correct_answer: q.correctAnswer, explanation: q.explanation })));
  if (keyError) { await admin.from("tests").delete().eq("id", test.id); throw new Error("Could not save answer keys"); }
  return test.id as string;
}
