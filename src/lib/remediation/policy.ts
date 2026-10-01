import {
  rankPreferUnseen,
  type ContentHistory,
  type SelectionUnit,
} from "@/lib/practice/selection";

export type RemediationStage = "NEEDS_REVIEW" | "STRENGTHENING" | "MASTERED";

export function remediationStage(
  status: "UNRESOLVED" | "MASTERED",
  reviewSuccessStreak: number,
): RemediationStage {
  if (status === "MASTERED") return "MASTERED";
  return reviewSuccessStreak > 0 ? "STRENGTHENING" : "NEEDS_REVIEW";
}

/** Keeps complete passage/group units and ranks unseen, then older, then recent. */
export function rankFocusedRemediationUnits<T extends SelectionUnit>(
  units: readonly T[],
  history: ContentHistory,
  excludedUnitId: string,
): T[] {
  return rankPreferUnseen(
    units.filter((unit) => unit.id !== excludedUnitId),
    history,
  );
}

export function chooseRemediationEvidenceQuestion<T extends { id: string; skill: string; subSkill: string }>(
  questions: readonly T[],
  history: ContentHistory,
  taxonomy: { skill: string; subSkill: string },
): T | null {
  const matching = questions.filter(
    (question) =>
      question.skill === taxonomy.skill && question.subSkill === taxonomy.subSkill,
  );
  return (
    rankPreferUnseen(
      matching.map((question) => ({ ...question, part: 0, questionIds: [question.id] })),
      history,
    )[0] ?? null
  );
}
