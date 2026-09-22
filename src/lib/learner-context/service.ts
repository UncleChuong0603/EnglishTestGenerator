import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { learnerContexts } from "@/db/schema";
import { meaningfulLearningSessionSql } from "@/lib/learning/query-policy";
import { learnerContextSchema, type LearnerContext, type LearnerContextInput } from "./domain";

export async function getLearnerContext(userId: string): Promise<LearnerContext | null> {
  const [row] = await db.select().from(learnerContexts).where(eq(learnerContexts.userId, userId)).limit(1);
  return row ? { studyPurpose: row.studyPurpose as LearnerContext["studyPurpose"], studyPurposeOther: row.studyPurposeOther, acquisitionSource: row.acquisitionSource as LearnerContext["acquisitionSource"], acquisitionSourceOther: row.acquisitionSourceOther, promptDismissedAt: row.promptDismissedAt?.toISOString() ?? null, updatedAt: row.updatedAt.toISOString() } : null;
}

export async function saveLearnerContext(userId: string, input: LearnerContextInput) {
  const values = learnerContextSchema.parse(input);
  const promptDismissedAt = new Date();
  const [row] = await db.insert(learnerContexts).values({ userId, ...values, promptDismissedAt }).onConflictDoUpdate({ target: learnerContexts.userId, set: { ...values, promptDismissedAt, updatedAt: new Date() } }).returning();
  return row;
}

export async function dismissLearnerContextPrompt(userId: string) {
  await db.insert(learnerContexts).values({ userId, promptDismissedAt: new Date() }).onConflictDoUpdate({ target: learnerContexts.userId, set: { promptDismissedAt: new Date(), updatedAt: new Date() } });
}

export async function shouldPromptForLearnerContext(userId: string) {
  const context = await getLearnerContext(userId);
  if (context?.promptDismissedAt || context?.studyPurpose || context?.acquisitionSource) return false;
  const meaningful = meaningfulLearningSessionSql("practice_sessions");
  const result = await db.execute(sql`select exists(select 1 from practice_sessions where user_id=${userId}::uuid and ${meaningful}) as eligible`);
  return Boolean((result.rows[0] as { eligible?: boolean } | undefined)?.eligible);
}

export type LearnerContextBreakdown = { studyPurposes: { value: string | null; count: number }[]; acquisitionSources: { value: string | null; count: number }[] };
export async function getLearnerContextBreakdown(): Promise<LearnerContextBreakdown> {
  const result = await db.execute(sql`with learner_users as (select u.id from users u where not exists(select 1 from user_roles r where r.user_id=u.id and r.role='ADMIN' and r.revoked_at is null)) select 'purpose' kind, c.study_purpose value, count(*)::int count from learner_users u left join learner_contexts c on c.user_id=u.id group by c.study_purpose union all select 'source', c.acquisition_source, count(*)::int from learner_users u left join learner_contexts c on c.user_id=u.id group by c.acquisition_source`);
  const rows = result.rows as { kind: string; value: string | null; count: number | string }[];
  return { studyPurposes: rows.filter(x => x.kind === "purpose").map(x => ({ value: x.value, count: Number(x.count) })), acquisitionSources: rows.filter(x => x.kind === "source").map(x => ({ value: x.value, count: Number(x.count) })) };
}
