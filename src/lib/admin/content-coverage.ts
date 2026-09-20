export const QUESTION_BANK_TARGET_FORMS = 10;

export type ContentCoverage = {
  part: number;
  label: string;
  setType?: "single" | "multiple";
  groups: number;
  questions: number;
  groupsPerForm: number;
  questionsPerForm: number;
};

export type ContentRecommendation = ContentCoverage & {
  targetForms: number;
  targetGroups: number;
  targetQuestions: number;
  groupDeficit: number;
  questionDeficit: number;
  coverage: number;
  uniqueFormCapacity: number;
};

export function calculateContentCoverage(
  row: ContentCoverage,
  targetForms = QUESTION_BANK_TARGET_FORMS,
): ContentRecommendation {
  const targetGroups = row.groupsPerForm * targetForms;
  const targetQuestions = row.questionsPerForm * targetForms;

  return {
    ...row,
    targetForms,
    targetGroups,
    targetQuestions,
    groupDeficit: Math.max(0, targetGroups - row.groups),
    questionDeficit: Math.max(0, targetQuestions - row.questions),
    coverage: Math.min(row.groups / targetGroups, row.questions / targetQuestions),
    uniqueFormCapacity: Math.floor(
      Math.min(row.groups / row.groupsPerForm, row.questions / row.questionsPerForm),
    ),
  };
}

export function recommendContentCoverage(
  rows: readonly ContentCoverage[],
  targetForms = QUESTION_BANK_TARGET_FORMS,
): ContentRecommendation[] {
  return rows
    .map((row) => calculateContentCoverage(row, targetForms))
    .filter((row) => row.groupDeficit > 0 || row.questionDeficit > 0)
    .sort(
      (a, b) =>
        a.coverage - b.coverage ||
        b.questionDeficit - a.questionDeficit ||
        a.part - b.part,
    )
    .slice(0, 3);
}

export function getQuestionBankCapacity(rows: readonly ContentCoverage[]): number {
  return Math.min(...rows.map((row) => calculateContentCoverage(row).uniqueFormCapacity));
}
