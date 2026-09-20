import "server-only";
import { loadRecommendedWorkoutFromProgress } from "@/lib/diagnosis/service";
import type { WorkoutRecommendation } from "@/lib/diagnosis/types";
import { getToeicProgress } from "@/lib/progress/queries";
import type { ToeicProgress } from "@/lib/progress/types";
import { hasCompletedDiagnostic, shouldRecommendDiagnostic } from "@/lib/diagnostic/service";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { diagnosticRuns } from "@/db/schema";
import { getMistakeOverview, type MistakeOverview } from "@/lib/mastery/queries";

export type DashboardData = { progress: ToeicProgress; recommendation: WorkoutRecommendation | null; recommendDiagnostic: boolean; activeDiagnosticId: string | null; mistakes: MistakeOverview };

/** One progress aggregate is shared with diagnosis; no question content/media is loaded. */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [progress, completed, active, mistakes] = await Promise.all([getToeicProgress(userId), hasCompletedDiagnostic(userId), db.select({ id: diagnosticRuns.id }).from(diagnosticRuns).where(and(eq(diagnosticRuns.userId, userId), eq(diagnosticRuns.status, "IN_PROGRESS"), gt(diagnosticRuns.expiresAt, new Date()))).limit(1), getMistakeOverview(userId)]);
  let recommendation: WorkoutRecommendation | null = null;
  try { recommendation = await loadRecommendedWorkoutFromProgress(userId, progress); }
  catch (error) { console.error("Could not load dashboard recommendation", error); }
  return { progress, recommendation, recommendDiagnostic: shouldRecommendDiagnostic(progress, completed), activeDiagnosticId: active[0]?.id ?? null, mistakes };
}
