import { aggregatePerformance, MIN_ATTEMPTS_FOR_CLASSIFICATION, percentage } from "@/lib/analytics/calculate";
import type { PracticeResult } from "@/lib/practice/types";

export function part5ChallengeResult(result: PracticeResult) {
  if (result.mode !== "part_5" || result.scoreTotal !== 10 || result.questions.length !== 10 || result.questions.some((q) => q.part !== 5)) throw new Error("INVALID_PART_5_CHALLENGE");
  const attempts = result.questions.map((question) => ({
    isCorrect: question.isCorrect,
    skill: question.skill,
    subSkill: question.subSkill,
    part: 5 as const,
    answeredAt: result.submittedAt,
    sessionId: result.id,
  }));
  const skills = aggregatePerformance(attempts, "skill");
  const subskills = aggregatePerformance(attempts, "subSkill");
  const answered = result.questions.filter((question) => question.selectedOptionId);
  const answeredSkillCount = (skill: string) => answered.filter((question) => question.skill === skill).length;
  const answeredSubskillCount = (skill: string, subSkill: string) => answered.filter((question) => question.skill === skill && question.subSkill === subSkill).length;
  const signal = (accuracy: number, attempted: number) => attempted < MIN_ATTEMPTS_FOR_CLASSIFICATION ? "early" as const : accuracy >= 85 ? "strong" as const : accuracy < 70 ? "needs_work" as const : "neutral" as const;
  return {
    correct: result.scoreCorrect,
    total: result.scoreTotal,
    accuracy: percentage(result.scoreCorrect, result.scoreTotal),
    skills: skills.map((metric) => ({ ...metric, answered: answeredSkillCount(metric.name), signal: signal(metric.accuracy, answeredSkillCount(metric.name)) })),
    subskills: subskills.map((metric) => ({ ...metric, answered: answeredSubskillCount(metric.skill!, metric.name), signal: signal(metric.accuracy, answeredSubskillCount(metric.skill!, metric.name)) })),
    mistakes: result.questions.filter((question) => !question.isCorrect),
    signal,
  };
}
