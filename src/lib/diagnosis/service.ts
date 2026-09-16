import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { practiceSessions, questions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { getToeicProgress } from "@/lib/progress/queries";
import type { PartBearingSkillArea, ToeicPart } from "@/lib/toeic/domain";
import { calculateToeicDiagnosis } from "./calculate";
import { recommendWorkout } from "./recommendation";
import type { ToeicDiagnosis, WorkoutRecommendation } from "./types";

async function contextFor(userId: string) {
  const [available, recent] = await Promise.all([
    db.selectDistinct({ skillArea: questions.skillArea, part: questions.toeicPart }).from(questions).where(and(eq(questions.status, "published"), inArray(questions.skillArea, ["LISTENING", "READING"]))),
    db.select({ skillArea: practiceSessions.skillArea }).from(practiceSessions).where(and(eq(practiceSessions.userId, userId), eq(practiceSessions.status, "submitted"))).orderBy(desc(practiceSessions.submittedAt)).limit(10),
  ]);
  const availableParts: Record<PartBearingSkillArea, number[]> = { LISTENING: [], READING: [] };
  for (const row of available) if ((row.skillArea === "LISTENING" || row.skillArea === "READING") && !availableParts[row.skillArea].includes(row.part)) availableParts[row.skillArea].push(row.part);
  availableParts.LISTENING.sort(); availableParts.READING.sort();
  return { availableParts, recentPractice: { LISTENING: recent.filter((x) => x.skillArea === "LISTENING").length, READING: recent.filter((x) => x.skillArea === "READING").length } };
}

/** Internal DAL helper. Callers at an application boundary must authenticate first. */
export async function loadToeicDiagnosis(userId: string): Promise<ToeicDiagnosis> { return calculateToeicDiagnosis(await getToeicProgress(userId)); }
export async function loadRecommendedWorkout(userId: string): Promise<WorkoutRecommendation> { const [diagnosis, context] = await Promise.all([loadToeicDiagnosis(userId), contextFor(userId)]); return recommendWorkout(diagnosis, context); }
export async function getCurrentToeicDiagnosis(): Promise<ToeicDiagnosis | null> { const user = await getCurrentUser(); return user ? loadToeicDiagnosis(user.id) : null; }
export async function getCurrentRecommendedWorkout(): Promise<WorkoutRecommendation | null> { const user = await getCurrentUser(); return user ? loadRecommendedWorkout(user.id) : null; }

export function isListeningPart(part: ToeicPart | null): part is 1 | 2 | 3 | 4 { return part !== null && part >= 1 && part <= 4; }
