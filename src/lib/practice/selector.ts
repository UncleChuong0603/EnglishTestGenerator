import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { MIXED_PART_WEIGHTS, READING_TAXONOMY } from "./constants";
import { flattenUniqueQuestionIds, selectClosestUnits, shuffle, type SelectionUnit } from "./selection";
import type { PracticeConfig, ReadingPart } from "./types";

type CandidateQuestion = {
  id: string;
  toeic_part: ReadingPart;
  passage_set_id: string | null;
  question_order: number;
};

function partForMode(mode: PracticeConfig["mode"]): ReadingPart | null {
  if (mode === "part_5") return 5;
  if (mode === "part_6") return 6;
  if (mode === "part_7") return 7;
  return null;
}

export function validatePracticeConfig(config: PracticeConfig) {
  const part = partForMode(config.mode);
  if (![10, 15, 20].includes(config.targetQuestionCount)) return false;
  if (!part && (config.skill || config.subSkill)) return false;
  if (!part) return true;
  if (config.skill && !(config.skill in READING_TAXONOMY[part])) return false;
  if (config.subSkill && (!config.skill || !READING_TAXONOMY[part][config.skill]?.includes(config.subSkill))) return false;
  return true;
}

async function loadUnits(part: ReadingPart, skill?: string, subSkill?: string): Promise<SelectionUnit[]> {
  const admin = createAdminClient();
  let query = admin
    .from("questions")
    .select("id, toeic_part, passage_set_id, question_order")
    .eq("toeic_part", part)
    .eq("status", "published");
  if (skill) query = query.eq("skill", skill);
  if (subSkill) query = query.eq("sub_skill", subSkill);
  const { data: matching, error } = await query.limit(500);
  if (error) {
    console.error("Could not load Reading selection candidates", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      part,
      skill: skill ?? null,
      subSkill: subSkill ?? null,
    });
    if (error.code === "PGRST303") throw new Error("ADMIN_CREDENTIAL_INVALID");
    throw new Error(`READING_SELECTION_FAILED:${error.code}`);
  }

  const matched = (matching ?? []) as CandidateQuestion[];
  const candidateSetIds = [...new Set(matched.flatMap((question) => question.passage_set_id ?? []))];
  let candidateQuestions: CandidateQuestion[];
  if (part === 5) {
    candidateQuestions = matched;
  } else if (candidateSetIds.length) {
    const [{ data: publishedSets, error: setError }, { data: passages, error: passageError }] = await Promise.all([
      admin.from("passage_sets").select("id, set_type").in("id", candidateSetIds).eq("status", "published"),
      admin.from("passages").select("passage_set_id, status").in("passage_set_id", candidateSetIds),
    ]);
    if (setError || passageError) throw new Error("READING_SELECTION_FAILED");
    const expectedDocuments: Record<string, number> = { part6: 1, single: 1, double: 2, triple: 3 };
    const validSetIds = new Set((publishedSets ?? []).flatMap((set) => {
      const setPassages = (passages ?? []).filter((passage) => passage.passage_set_id === set.id);
      return setPassages.length === expectedDocuments[set.set_type]
        && setPassages.every((passage) => passage.status === "published") ? [set.id] : [];
    }));
    if (!validSetIds.size) return [];
    const { data, error: completeError } = await admin
      .from("questions")
      .select("id, toeic_part, passage_set_id, question_order")
      .eq("toeic_part", part)
      .eq("status", "published")
      .in("passage_set_id", [...validSetIds])
      .order("question_order");
    if (completeError) throw new Error(`READING_SELECTION_FAILED:${completeError.code}`);
    candidateQuestions = (data ?? []) as CandidateQuestion[];
  } else {
    return [];
  }

  const questionIds = candidateQuestions.map((question) => question.id);
  if (!questionIds.length) return [];
  const [{ data: options, error: optionError }, { data: solutions, error: solutionError }] = await Promise.all([
    admin.from("question_options").select("question_id").in("question_id", questionIds),
    admin.from("question_solutions").select("question_id").in("question_id", questionIds),
  ]);
  if (optionError || solutionError) throw new Error("READING_SELECTION_FAILED");
  const optionCounts = new Map<string, number>();
  for (const option of options ?? []) optionCounts.set(option.question_id, (optionCounts.get(option.question_id) ?? 0) + 1);
  const solutionIds = new Set((solutions ?? []).map((solution) => solution.question_id));
  const validQuestions = candidateQuestions.filter((question) =>
    optionCounts.get(question.id) === 4 && solutionIds.has(question.id),
  );

  if (part === 5) {
    return validQuestions.map((question) => ({ id: question.id, part, questionIds: [question.id] }));
  }

  const bySet = new Map<string, string[]>();
  for (const question of validQuestions) {
    if (!question.passage_set_id) continue;
    const ids = bySet.get(question.passage_set_id) ?? [];
    ids.push(question.id);
    bySet.set(question.passage_set_id, ids);
  }
  // Reject partially valid sets: content integrity includes four options and a solution for every item.
  const totalBySet = new Map<string, number>();
  for (const question of candidateQuestions) {
    if (question.passage_set_id) totalBySet.set(question.passage_set_id, (totalBySet.get(question.passage_set_id) ?? 0) + 1);
  }
  return [...bySet.entries()].flatMap(([id, ids]) =>
    ids.length === totalBySet.get(id) ? [{ id, part, questionIds: ids }] : [],
  );
}

/** Uses the same integrity checks as session creation, so recommendations cannot point at broken content. */
export async function getAvailableReadingQuestionCount(part: ReadingPart, skill?: string, subSkill?: string) {
  return flattenUniqueQuestionIds(await loadUnits(part, skill, subSkill)).length;
}

export async function selectReadingPractice(config: PracticeConfig) {
  if (!validatePracticeConfig(config)) throw new Error("INVALID_PRACTICE_CONFIG");
  const fixedPart = partForMode(config.mode);
  let selected: SelectionUnit[] = [];

  if (fixedPart) {
    selected = selectClosestUnits(
      await loadUnits(fixedPart, config.skill, config.subSkill),
      config.targetQuestionCount,
    );
  } else {
    const parts: ReadingPart[] = [5, 6, 7];
    const available = await Promise.all(parts.map((part) => loadUnits(part)));
    selected = parts.flatMap((part, index) => selectClosestUnits(
      available[index], Math.max(1, Math.round(config.targetQuestionCount * MIXED_PART_WEIGHTS[part])),
    ));
    selected = shuffle(selected);
  }

  const questionIds = flattenUniqueQuestionIds(selected);
  if (!questionIds.length) throw new Error("NO_PUBLISHED_CONTENT");
  return { units: selected, questionIds, actualQuestionCount: questionIds.length };
}

export async function createReadingPracticeSession(userId: string, config: PracticeConfig) {
  const selection = await selectReadingPractice(config);
  const admin = createAdminClient();
  const part = partForMode(config.mode);

  // There is intentionally one active Reading session per learner. Starting a
  // newly configured session closes the old unfinished one.
  const { error: abandonError } = await admin.from("practice_sessions")
    .update({ status: "abandoned" }).eq("user_id", userId).eq("status", "in_progress");
  if (abandonError) throw new Error("PRACTICE_START_FAILED");

  const { data: session, error: sessionError } = await admin.from("practice_sessions").insert({
    user_id: userId,
    practice_type: config.mode,
    part,
    status: "in_progress",
    question_count: selection.actualQuestionCount,
    source: config.source,
    requested_question_count: config.targetQuestionCount,
    requested_skill: config.skill ?? null,
    requested_sub_skill: config.subSkill ?? null,
  }).select("id").single();
  if (sessionError) {
    console.error("Could not create Reading practice session", {
      code: sessionError.code,
      message: sessionError.message,
      details: sessionError.details,
      hint: sessionError.hint,
    });
    if (sessionError.code === "42703" || sessionError.code === "PGRST204") {
      throw new Error("DATABASE_MIGRATION_REQUIRED");
    }
    throw new Error("PRACTICE_START_FAILED");
  }
  if (!session) throw new Error("PRACTICE_START_FAILED");

  const unitByQuestion = new Map(selection.units.flatMap((unit) =>
    unit.questionIds.map((questionId) => [questionId, unit.part === 5 ? null : unit.id] as const),
  ));
  const assignments = selection.questionIds.map((questionId, index) => ({
    session_id: session.id,
    question_id: questionId,
    display_order: index + 1,
    passage_set_id: unitByQuestion.get(questionId) ?? null,
  }));
  const { error: assignmentError } = await admin.from("practice_session_questions").insert(assignments);
  if (assignmentError) {
    console.error("Could not assign Reading practice questions", {
      code: assignmentError.code,
      message: assignmentError.message,
      details: assignmentError.details,
      hint: assignmentError.hint,
    });
    await admin.from("practice_sessions").delete().eq("id", session.id).eq("user_id", userId);
    if (assignmentError.code === "42703" || assignmentError.code === "PGRST204") {
      throw new Error("DATABASE_MIGRATION_REQUIRED");
    }
    throw new Error("PRACTICE_START_FAILED");
  }
  return session.id as string;
}
