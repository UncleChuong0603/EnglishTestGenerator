import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { learnerGoals } from "@/db/schema";
import { parseGoalProfile, type GoalProfile, type GoalProfileInput } from "./domain";

export async function getLearnerGoal(userId: string): Promise<GoalProfile | null> {
  const [row] = await db.select().from(learnerGoals).where(eq(learnerGoals.userId, userId)).limit(1);
  if (!row) return null;
  return {
    targetScore: row.targetScore,
    examDate: row.examDate,
    dailyStudyMinutes: row.dailyStudyMinutes,
    studyDaysPerWeek: row.studyDaysPerWeek,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function updateLearnerGoal(userId: string, input: GoalProfileInput): Promise<GoalProfile | null> {
  const parsed = parseGoalProfile(input);
  if (!parsed.success) throw parsed.error;
  const goal = parsed.data;
  if (Object.values(goal).every(value => value === null)) {
    await db.delete(learnerGoals).where(eq(learnerGoals.userId, userId));
    return null;
  }
  const [row] = await db.insert(learnerGoals).values({ userId, ...goal }).onConflictDoUpdate({
    target: learnerGoals.userId,
    set: { ...goal, updatedAt: new Date() },
  }).returning();
  return {
    targetScore: row.targetScore,
    examDate: row.examDate,
    dailyStudyMinutes: row.dailyStudyMinutes,
    studyDaysPerWeek: row.studyDaysPerWeek,
    updatedAt: row.updatedAt.toISOString(),
  };
}
