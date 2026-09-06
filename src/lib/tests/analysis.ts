import type { AnswerKey, Skill } from "./types";

export type ScoringInput = { questionId: string; skill: Skill; correctAnswer: AnswerKey; selectedAnswer: AnswerKey | null };
export type SkillResult = { skill: Skill; correct: number; total: number; percent: number };

export function calculateScore(answers: ScoringInput[]) {
  const correct = answers.filter((answer) => answer.selectedAnswer === answer.correctAnswer).length;
  return { correct, total: answers.length, percent: answers.length ? Math.round((correct / answers.length) * 100) : 0 };
}

export function aggregateSkills(answers: ScoringInput[]): SkillResult[] {
  const totals = new Map<Skill, { correct: number; total: number }>();
  for (const answer of answers) {
    const current = totals.get(answer.skill) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (answer.selectedAnswer === answer.correctAnswer) current.correct += 1;
    totals.set(answer.skill, current);
  }
  return [...totals.entries()].map(([skill, result]) => ({
    skill,
    ...result,
    percent: Math.round((result.correct / result.total) * 100),
  }));
}

export function aggregateStoredAnswers(answers: Array<{ skill: Skill; isCorrect: boolean }>): SkillResult[] {
  const totals = new Map<Skill, { correct: number; total: number }>();
  for (const answer of answers) {
    const current = totals.get(answer.skill) ?? { correct: 0, total: 0 };
    current.total += 1;
    if (answer.isCorrect) current.correct += 1;
    totals.set(answer.skill, current);
  }
  return [...totals.entries()].map(([skill, result]) => ({
    skill,
    ...result,
    percent: Math.round((result.correct / result.total) * 100),
  }));
}

const guidance: Record<Skill, string> = {
  vocabulary: "Review vocabulary in context and use nearby clues before choosing an answer.",
  main_idea: "Practise summarising each paragraph in one sentence before choosing the main idea.",
  detail: "Underline names, dates, and qualifying words, then match them carefully to the question.",
  inference: "Practise separating what the passage states from what it reasonably implies.",
  reference: "Trace pronouns and reference words back to the nearest logical noun or idea.",
};

export function getPerformanceInsights(results: SkillResult[]) {
  const strengths = results.filter((result) => result.total >= 2 && result.percent >= 75);
  const areasToImprove = results.filter((result) => result.percent < 60).sort((a, b) => a.percent - b.percent);
  const recommendation = areasToImprove[0]
    ? { skill: areasToImprove[0].skill, message: guidance[areasToImprove[0].skill] }
    : { skill: null, message: "Keep practising mixed reading questions to build a broader evidence base." };
  return { strengths, areasToImprove, recommendation };
}

export function formatSkill(skill: Skill) {
  return skill.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
