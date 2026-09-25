import { DIAGNOSIS_SAMPLE_THRESHOLDS } from "@/lib/diagnosis/calculate";
import type { PlanActivity } from "@/lib/weekly-plan/policy";

export type ReviewBreakdown = { part: number; skill: string | null; subskill: string | null; answered: number; correct: number; accuracy: number };
export type ActivityCounts = Partial<Record<PlanActivity, number>>;
export type ReviewFacts = {
  weekStart: string;
  learningDays: number;
  completedSessions: number;
  answered: number;
  correct: number;
  activities: ActivityCounts;
  breakdown: Array<{ part: number; skill: string; subskill: string; answered: number; correct: number }>;
  unresolvedMistakes: number;
  repeatedMistakes: number;
  masteredMistakes: number;
  plannedActivities: PlanActivity[] | null;
};
export type WeeklyReview = {
  weekStart: string;
  hasActivity: boolean;
  learningDays: number;
  completedSessions: number;
  answered: number;
  accuracy: number | null;
  activities: ActivityCounts;
  planCompletion: { completed: number; planned: number; missed: PlanActivity[] } | null;
  parts: ReviewBreakdown[];
  skills: ReviewBreakdown[];
  subskills: ReviewBreakdown[];
  weakness: ReviewBreakdown | null;
  unresolvedMistakes: number;
  repeatedMistakes: number;
  masteredMistakes: number;
  comparison: { questionDelta: number; accuracyDelta: number; learningDayDelta: number } | null;
  focus: string[];
};

const accuracy = (correct: number, answered: number) => answered ? Math.round(correct / answered * 100) : null;
const enough = (answered: number) => answered >= DIAGNOSIS_SAMPLE_THRESHOLDS.supported;

function rows(facts: ReviewFacts, level: "part" | "skill" | "subskill"): ReviewBreakdown[] {
  const groups = new Map<string, ReviewBreakdown>();
  for (const row of facts.breakdown) {
    const key = level === "part" ? `${row.part}` : level === "skill" ? `${row.part}\0${row.skill}` : `${row.part}\0${row.skill}\0${row.subskill}`;
    const current = groups.get(key) ?? { part: row.part, skill: level === "part" ? null : row.skill, subskill: level === "subskill" ? row.subskill : null, answered: 0, correct: 0, accuracy: 0 };
    current.answered += row.answered;
    current.correct += row.correct;
    groups.set(key, current);
  }
  return [...groups.values()].filter(row => enough(row.answered)).map(row => ({ ...row, accuracy: accuracy(row.correct, row.answered)! }))
    .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered || a.part - b.part || (a.skill ?? "").localeCompare(b.skill ?? ""));
}

export function buildWeeklyReview(current: ReviewFacts, previous: ReviewFacts | null): WeeklyReview {
  const hasActivity = current.answered > 0 || current.completedSessions > 0;
  const parts = rows(current, "part");
  const skills = rows(current, "skill");
  const subskills = rows(current, "subskill");
  const weakness = [...subskills, ...skills, ...parts].filter(row => row.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy || b.answered - a.answered)[0] ?? null;
  const remaining = { ...current.activities };
  let completed = 0;
  const missed: PlanActivity[] = [];
  for (const activity of current.plannedActivities ?? []) {
    if ((remaining[activity] ?? 0) > 0) {
      remaining[activity]!--;
      completed++;
    } else missed.push(activity);
  }
  const planCompletion = hasActivity && current.plannedActivities ? { completed, planned: current.plannedActivities.length, missed } : null;
  const comparison = previous && enough(current.answered) && enough(previous.answered)
    ? { questionDelta: current.answered - previous.answered, accuracyDelta: accuracy(current.correct, current.answered)! - accuracy(previous.correct, previous.answered)!, learningDayDelta: current.learningDays - previous.learningDays }
    : null;
  const focus: string[] = [];
  if (hasActivity) {
    if (current.repeatedMistakes > 0) focus.push("review_repeated");
    if (weakness) focus.push(`part_${weakness.part}`);
    if (!focus.length && missed.length) focus.push("resume_plan");
    if (!focus.length) focus.push("keep_balanced");
  }
  return { weekStart: current.weekStart, hasActivity, learningDays: current.learningDays, completedSessions: current.completedSessions,
    answered: current.answered, accuracy: accuracy(current.correct, current.answered), activities: current.activities,
    planCompletion, parts, skills, subskills, weakness, unresolvedMistakes: current.unresolvedMistakes,
    repeatedMistakes: current.repeatedMistakes, masteredMistakes: current.masteredMistakes, comparison, focus: focus.slice(0, 2) };
}
