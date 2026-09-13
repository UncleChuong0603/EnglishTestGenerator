import type { ReadingPart } from "@/lib/practice/types";

import type { AnalyticsAttempt, LearnerAnalytics, PerformanceMetric, PerformanceStatus, RecentSession, SkillAnalytics, Trend } from "./types";

export const MIN_ATTEMPTS_FOR_CLASSIFICATION = 5;
export const RECENT_QUESTION_WINDOW = 20;
export const TREND_MIN_WINDOW = 5;
export const TREND_PERCENTAGE_POINT_THRESHOLD = 5;
export const PERFORMANCE_THRESHOLDS = { needsFocus: 50, needsImprovement: 70, good: 85 } as const;
export const PART_TITLES: Record<ReadingPart, string> = {
  5: "Incomplete Sentences",
  6: "Text Completion",
  7: "Reading Comprehension",
};

export function percentage(correct: number, attempted: number) {
  return attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
}

export function classifyPerformance(attempted: number, accuracy: number): PerformanceStatus {
  if (attempted === 0) return "No data";
  if (attempted < MIN_ATTEMPTS_FOR_CLASSIFICATION) return "Early data";
  if (accuracy < PERFORMANCE_THRESHOLDS.needsFocus) return "Needs Focus";
  if (accuracy < PERFORMANCE_THRESHOLDS.needsImprovement) return "Needs Improvement";
  if (accuracy < PERFORMANCE_THRESHOLDS.good) return "Good";
  return "Strong";
}

export function recentPerformance(attempts: AnalyticsAttempt[]) {
  if (!attempts.length) return { recentAccuracy: null, trend: "Not enough data" as Trend };
  const ordered = [...attempts].sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime());
  const recent = ordered.slice(0, RECENT_QUESTION_WINDOW);
  const recentAccuracy = percentage(recent.filter((item) => item.isCorrect).length, recent.length);
  const comparableSize = Math.min(RECENT_QUESTION_WINDOW, Math.floor(ordered.length / 2));
  if (comparableSize < TREND_MIN_WINDOW) return { recentAccuracy, trend: "Not enough data" as Trend };
  const current = ordered.slice(0, comparableSize);
  const previous = ordered.slice(comparableSize, comparableSize * 2);
  const difference = percentage(current.filter((item) => item.isCorrect).length, current.length)
    - percentage(previous.filter((item) => item.isCorrect).length, previous.length);
  const trend: Trend = difference >= TREND_PERCENTAGE_POINT_THRESHOLD
    ? "Improving" : difference <= -TREND_PERCENTAGE_POINT_THRESHOLD ? "Declining" : "Stable";
  return { recentAccuracy, trend };
}

export function makePerformanceMetric(name: string, attempts: AnalyticsAttempt[], context: Pick<PerformanceMetric, "part" | "skill"> = {}): PerformanceMetric {
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  const accuracy = percentage(correct, attempts.length);
  return { name, ...context, attempted: attempts.length, correct, accuracy,
    status: classifyPerformance(attempts.length, accuracy), ...recentPerformance(attempts) };
}

export function aggregatePerformance(attempts: AnalyticsAttempt[], field: "skill" | "subSkill"): PerformanceMetric[] {
  const groups = new Map<string, AnalyticsAttempt[]>();
  for (const attempt of attempts) {
    const name = attempt[field].trim() || "other";
    const key = `${attempt.part}:${field === "subSkill" ? `${attempt.skill}:` : ""}${name}`;
    groups.set(key, [...(groups.get(key) ?? []), attempt]);
  }
  return [...groups.values()].map((items) => makePerformanceMetric(items[0][field], items, {
    part: items[0].part, ...(field === "subSkill" ? { skill: items[0].skill } : {}),
  })).sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted || a.name.localeCompare(b.name));
}

export function calculateLearnerAnalytics(attempts: AnalyticsAttempt[], sessions: RecentSession[]): LearnerAnalytics {
  const overall = makePerformanceMetric("Reading", attempts);
  const partDetails = ([5, 6, 7] as const).map((part) => {
    const partAttempts = attempts.filter((attempt) => attempt.part === part);
    const skillMetrics = aggregatePerformance(partAttempts, "skill");
    const subskillMetrics = aggregatePerformance(partAttempts, "subSkill");
    const skills: SkillAnalytics[] = skillMetrics.map((skill) => ({
      ...skill, subskills: subskillMetrics.filter((subskill) => subskill.skill === skill.name),
    }));
    return { part, title: PART_TITLES[part], metric: makePerformanceMetric(`Part ${part}`, partAttempts, { part }), skills };
  });
  const skills = partDetails.flatMap((part) => part.skills);
  const subskills = partDetails.flatMap((part) => part.skills.flatMap((skill) => skill.subskills));
  const reliable = subskills.filter((metric) => metric.attempted >= MIN_ATTEMPTS_FOR_CLASSIFICATION);
  return {
    totalAttempted: overall.attempted, totalCorrect: overall.correct, overallAccuracy: overall.accuracy,
    recentAccuracy: overall.recentAccuracy, trend: overall.trend, sessionCount: sessions.length,
    skills, subskills, parts: partDetails.map((part) => part.metric), partDetails,
    focusAreas: reliable.filter((metric) => metric.accuracy < PERFORMANCE_THRESHOLDS.needsImprovement).slice(0, 3),
    strongAreas: reliable.filter((metric) => metric.status === "Strong")
      .sort((a, b) => b.accuracy - a.accuracy || b.attempted - a.attempted).slice(0, 3),
    recentSessions: sessions.slice(0, 5),
  };
}
