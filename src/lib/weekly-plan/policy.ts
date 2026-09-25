import type { GoalProfile } from "@/lib/goals/domain";
import type { PlanKey } from "@/lib/entitlements/catalog";
import type { WorkoutRecommendation } from "@/lib/diagnosis/types";
import type { WeeklyReview } from "@/lib/weekly-review/policy";

export type PlanActivity = "WORKOUT" | "FOCUSED_READING" | "REVIEW" | "READING" | "LISTENING" | "MOCK_LISTENING";
export function activityForSession(source: string, skillArea: string, part: number | null): PlanActivity | null {
  return source === "recommended" ? "WORKOUT"
    : source === "target_weakness" && skillArea === "READING" ? "FOCUSED_READING"
    : source === "mastery_review" ? "REVIEW"
    : source === "custom" && skillArea === "READING" && part === 5 ? "READING"
    : source === "custom" && skillArea === "LISTENING" && part === 2 ? "LISTENING" : null;
}
export type WeeklyPlanItem = { slot: number; activity: PlanActivity; minutes: number; completed: boolean; available: boolean; reason: "recommendation" | "mistakes" | "balance" | "mock" };
export type WeeklyPlan = { weekStart: string; studyDays: 3 | 5 | 7; studyMinutes: 10 | 20 | 30 | 45 | 60; learningDays: number; items: WeeklyPlanItem[]; preview: WeeklyPlanItem[]; history: Array<{ weekStart: string; completedSessions: number }>; adjustmentReasons: string[] };

/** Monday-based product week, represented as a plain date so no weekday is assigned to a study slot. */
export function productWeekStart(now = new Date()) {
  const vietnam = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const day = vietnam.getUTCDay();
  vietnam.setUTCDate(vietnam.getUTCDate() - ((day + 6) % 7));
  return vietnam.toISOString().slice(0, 10);
}

export function productWeekWindow(now = new Date()) {
  const [year, month, day] = productWeekStart(now).split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day) - 7 * 60 * 60 * 1000);
  return { start, end: new Date(start.getTime() + 7 * 86_400_000) };
}

type Input = {
  now?: Date; goal: GoalProfile | null; plan: PlanKey;
  recommendation: WorkoutRecommendation | null;
  reviewableMistakes: number; repeatedMistakes: number;
  recommendedReady: boolean; readingReady: boolean; focusedReadingReady: boolean; listeningReady: boolean; mockListeningReady: boolean;
  workoutAvailable: boolean; reviewAvailable: boolean; manualAvailable: boolean; mockAvailable: boolean;
  learningDays: number; completedActivities: number; completedByActivity?: Partial<Record<PlanActivity, number>>; history?: WeeklyPlan["history"];
  review?: WeeklyReview | null;
};

export function buildWeeklyPlan(input: Input): WeeklyPlan {
  const requestedDays = input.goal?.studyDaysPerWeek;
  const studyDays: 3 | 5 | 7 = requestedDays === 3 || requestedDays === 5 || requestedDays === 7 ? requestedDays : 5;
  const requestedMinutes = input.goal?.dailyStudyMinutes;
  const studyMinutes: 10 | 20 | 30 | 45 | 60 = requestedMinutes === 10 || requestedMinutes === 20 || requestedMinutes === 30 || requestedMinutes === 45 || requestedMinutes === 60 ? requestedMinutes : 20;
  const pool: Array<{ activity: PlanActivity; reason: WeeklyPlanItem["reason"]; available: boolean }> = [
    { activity: "WORKOUT", reason: "recommendation", available: input.recommendedReady && input.workoutAvailable },
  ];
  if (input.plan === "PREMIUM" && input.focusedReadingReady && input.recommendation?.reasonCode === "SUPPORTED_WEAKNESS" && input.recommendation.skillArea === "READING") pool.push({ activity: "FOCUSED_READING", reason: "recommendation", available: input.manualAvailable });
  if (input.reviewableMistakes > 0) pool.push({ activity: "REVIEW", reason: "mistakes", available: input.reviewAvailable });
  if (input.readingReady) pool.push({ activity: "READING", reason: "balance", available: input.manualAvailable });
  if (input.listeningReady && studyMinutes >= 20) pool.push({ activity: "LISTENING", reason: "balance", available: input.manualAvailable });
  if (input.plan === "PREMIUM" && studyMinutes >= 45 && input.mockListeningReady && input.mockAvailable) pool.push({ activity: "MOCK_LISTENING", reason: "mock", available: true });
  // Quota exhaustion disables a CTA without reshuffling the whole week.
  const choices = pool.filter(item => item.activity !== "WORKOUT" || input.recommendedReady);
  const reasons: string[] = [];
  const review = input.review;
  if (review?.hasActivity) {
    if (review.repeatedMistakes > 0 && choices.some(item => item.activity === "REVIEW")) {
      choices.sort((a, b) => Number(b.activity === "REVIEW") - Number(a.activity === "REVIEW"));
      reasons.push("repeated_mistakes");
    }
    if (review.weakness && input.recommendation?.reasonCode === "SUPPORTED_WEAKNESS" && input.recommendation.part === review.weakness.part) {
      const target = choices.find(item => item.activity === "FOCUSED_READING") ?? choices.find(item => item.activity === "WORKOUT");
      if (target) {
        choices.splice(choices.indexOf(target), 1);
        choices.unshift(target);
        reasons.push("supported_weakness");
      }
    }
    if (review.planCompletion?.missed.length) {
      const missed = new Set(review.planCompletion.missed);
      const candidate = choices.find(item => missed.has(item.activity) && item.available);
      if (candidate && !reasons.includes("repeated_mistakes") && !reasons.includes("supported_weakness")) {
        choices.splice(choices.indexOf(candidate), 1);
        choices.unshift(candidate);
        reasons.push("resume_unfinished");
      }
    }
    if (review.masteredMistakes > 0 && review.unresolvedMistakes === 0) reasons.push("mastered_review");
    if (review.learningDays < studyDays) reasons.push("keep_capacity");
  }
  const weekStart = productWeekStart(input.now);
  const remainingCompletions = { ...input.completedByActivity };
  const items: WeeklyPlanItem[] = Array.from({ length: choices.length ? studyDays : 0 }, (_, index) => {
    let choice = choices[index % choices.length];
    if (input.plan === "PREMIUM" && input.reviewableMistakes > 0 && input.repeatedMistakes > 0 && index === Math.min(studyDays - 1, input.completedActivities)) {
      choice = choices.find(item => item.activity === "REVIEW") ?? choice;
    }
    const completed = (remainingCompletions[choice.activity] ?? 0) > 0;
    if (completed) remainingCompletions[choice.activity]!--;
    return { slot: index + 1, activity: choice.activity, minutes: choice.activity === "MOCK_LISTENING" ? 45 : choice.activity === "REVIEW" ? Math.min(studyMinutes, input.plan === "PREMIUM" ? 20 : 10) : studyMinutes, completed, available: choice.available, reason: choice.reason };
  });
  return { weekStart, studyDays, studyMinutes, learningDays: input.learningDays, items, preview: input.plan === "FREE" ? items.slice(0, 3) : items, history: input.plan === "PREMIUM" ? input.history ?? [] : [], adjustmentReasons: reasons };
}
