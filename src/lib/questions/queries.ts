import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Difficulty,
  LearnerPassageSet,
  LearnerQuestion,
  Passage,
  PassageSet,
  PassageSetType,
  ToeicPart,
} from "./types";

export type ReadingQuestionFilters = {
  skill?: string;
  subSkill?: string;
  difficulty?: Difficulty;
};

export type PassageSetFilters = ReadingQuestionFilters & {
  setType?: PassageSetType;
  limit?: number;
};

/**
 * Reads only learner-safe tables. RLS independently enforces published status.
 * Answer keys and explanations must be fetched by a separate trusted grading flow.
 */
export async function getPublishedQuestionsByPart(
  part: ToeicPart,
  limit = 20,
  filters: ReadingQuestionFilters = {},
) {
  const supabase = await createClient();
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  let query = supabase
    .from("questions")
    .select("*, options:question_options(*)")
    .eq("toeic_part", part)
    .eq("status", "published");
  if (filters.skill) query = query.eq("skill", filters.skill);
  if (filters.subSkill) query = query.eq("sub_skill", filters.subSkill);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
  const { data, error } = await query
    .order("question_order")
    .order("created_at")
    .order("display_order", { referencedTable: "question_options" })
    .limit(safeLimit);

  if (error) {
    throw new Error(`Could not load published TOEIC questions: ${error.code}`);
  }

  return (data ?? []) as LearnerQuestion[];
}

/**
 * Returns complete, ordered Part 6/7 groups. Taxonomy filters choose matching
 * sets, but every question in each chosen set is returned to preserve context.
 */
export async function getPublishedPassageSets(
  part: 6 | 7,
  filters: PassageSetFilters = {},
): Promise<LearnerPassageSet[]> {
  const supabase = await createClient();
  const safeLimit = Math.min(Math.max(filters.limit ?? 20, 1), 50);
  let matchingSetIds: string[] | undefined;

  if (filters.skill || filters.subSkill || filters.difficulty) {
    let matchQuery = supabase
      .from("questions")
      .select("passage_set_id")
      .eq("toeic_part", part)
      .eq("status", "published")
      .not("passage_set_id", "is", null);
    if (filters.skill) matchQuery = matchQuery.eq("skill", filters.skill);
    if (filters.subSkill) matchQuery = matchQuery.eq("sub_skill", filters.subSkill);
    if (filters.difficulty) matchQuery = matchQuery.eq("difficulty", filters.difficulty);
    const { data, error } = await matchQuery;
    if (error) throw new Error(`Could not filter TOEIC passage sets: ${error.code}`);
    matchingSetIds = [...new Set((data ?? []).flatMap((row) => row.passage_set_id ?? []))];
    if (!matchingSetIds.length) return [];
  }

  let setQuery = supabase
    .from("passage_sets")
    .select("*")
    .eq("toeic_part", part)
    .eq("status", "published");
  if (filters.setType) setQuery = setQuery.eq("set_type", filters.setType);
  if (matchingSetIds) setQuery = setQuery.in("id", matchingSetIds);
  const { data: rawSets, error: setError } = await setQuery.order("created_at").limit(safeLimit);
  if (setError) throw new Error(`Could not load TOEIC passage sets: ${setError.code}`);

  const sets = (rawSets ?? []) as PassageSet[];
  const setIds = sets.map((set) => set.id);
  if (!setIds.length) return [];
  const [{ data: rawPassages, error: passageError }, { data: rawQuestions, error: questionError }] =
    await Promise.all([
      supabase.from("passages").select("*").in("passage_set_id", setIds).eq("status", "published").order("position"),
      supabase
        .from("questions")
        .select("*, options:question_options(*)")
        .in("passage_set_id", setIds)
        .eq("status", "published")
        .order("question_order")
        .order("display_order", { referencedTable: "question_options" }),
    ]);
  if (passageError || questionError) {
    throw new Error(`Could not load complete TOEIC passage sets: ${(passageError ?? questionError)?.code}`);
  }

  const passages = (rawPassages ?? []) as Passage[];
  const questions = (rawQuestions ?? []) as LearnerQuestion[];
  return sets.map((set) => ({
    ...set,
    passages: passages.filter((passage) => passage.passage_set_id === set.id),
    questions: questions.filter((question) => question.passage_set_id === set.id),
  }));
}

export const getPart6Sets = (filters?: PassageSetFilters) =>
  getPublishedPassageSets(6, { ...filters, setType: "part6" });

export const getPart7Sets = (filters?: PassageSetFilters) =>
  getPublishedPassageSets(7, filters);
