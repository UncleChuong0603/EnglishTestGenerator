import "server-only";
import { loadRecommendedWorkoutFromProgress } from "@/lib/diagnosis/service";
import type { WorkoutRecommendation } from "@/lib/diagnosis/types";
import { getToeicProgress } from "@/lib/progress/queries";
import type { ToeicProgress } from "@/lib/progress/types";

export type DashboardData = { progress: ToeicProgress; recommendation: WorkoutRecommendation | null };

/** One progress aggregate is shared with diagnosis; no question content/media is loaded. */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const progress = await getToeicProgress(userId);
  let recommendation: WorkoutRecommendation | null = null;
  try { recommendation = await loadRecommendedWorkoutFromProgress(userId, progress); }
  catch (error) { console.error("Could not load dashboard recommendation", error); }
  return { progress, recommendation };
}
