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
}
