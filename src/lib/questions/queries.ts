import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { LearnerQuestion, ToeicPart } from "./types";

/**
 * Reads only learner-safe tables. RLS independently enforces published status.
 * Answer keys and explanations must be fetched by a separate trusted grading flow.
 */
export async function getPublishedQuestionsByPart(part: ToeicPart, limit = 20) {
  const supabase = await createClient();
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const { data, error } = await supabase
    .from("questions")
    .select("*, options:question_options(*)")
    .eq("toeic_part", part)
    .eq("status", "published")
    .order("created_at")
    .order("display_order", { referencedTable: "question_options" })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Could not load published TOEIC questions: ${error.code}`);
  }

  return (data ?? []) as LearnerQuestion[];
}
