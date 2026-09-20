export type ContentCoverage = {
  part: number;
  label: string;
  setType?: "single" | "multiple";
  groups: number;
  questions: number;
  targetGroups: number;
  targetQuestions: number;
};

export type ContentRecommendation = ContentCoverage & {
  groupDeficit: number;
  questionDeficit: number;
  coverage: number;
};

export function recommendContentCoverage(rows: readonly ContentCoverage[]): ContentRecommendation[] {
  return rows
    .map((row) => ({
      ...row,
      groupDeficit: Math.max(0, row.targetGroups - row.groups),
      questionDeficit: Math.max(0, row.targetQuestions - row.questions),
      coverage: Math.min(row.groups / row.targetGroups, row.questions / row.targetQuestions),
    }))
    .filter((row) => row.groupDeficit > 0 || row.questionDeficit > 0)
    .sort((a, b) => a.coverage - b.coverage || b.questionDeficit - a.questionDeficit || a.part - b.part)
    .slice(0, 3);
}
