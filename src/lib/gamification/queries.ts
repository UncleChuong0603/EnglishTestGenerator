import "server-only";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { gamificationEvents, profiles, rankedChallengeRuns, rankedChallenges, studyStreaks } from "@/db/schema";
import { getMonthlyRankingWindow, getWeeklyRankingWindow } from "./time";
import { nextRankTarget } from "./ranking";
type LeaderboardRow = { userId: string; score: number; rank: number; name: string | null; avatarUrl: string | null; publicProfileId: string | null; visibility: string };
export type LeaderboardPeriod = "week" | "month" | "all";

export async function getLeaderboard(period: LeaderboardPeriod = "week", userId?: string) {
  const generatedAt = new Date();
  const window = period === "week"
    ? getWeeklyRankingWindow(generatedAt)
    : period === "month"
      ? getMonthlyRankingWindow(generatedAt)
      : null;
  const periodFilter = window
    ? sql`and e.created_at >= ${window.start} and e.created_at < ${window.end}`
    : sql``;
  const result = await db.execute(sql`
    with scores as (
      select e.user_id, sum(e.rank_points_awarded)::int score
      from gamification_events e
      join profiles p on p.id = e.user_id
      where p.ranking_visibility <> 'HIDDEN' ${periodFilter}
      group by e.user_id
    ), ranked as (
      select user_id, score, rank() over(order by score desc)::int rank
      from scores
    )
    select r.user_id, r.score, r.rank, p.full_name, p.avatar_url, p.public_profile_id, p.ranking_visibility
    from ranked r
    join profiles p on p.id = r.user_id
    order by r.rank, r.user_id
  `);
  const all = result.rows as Array<Record<string, unknown>>;
  const shaped: LeaderboardRow[] = all.map((row) => ({
    userId: String(row.user_id),
    score: Number(row.score),
    rank: Number(row.rank),
    name: row.ranking_visibility === "PUBLIC" ? String(row.full_name ?? "Learner") : null,
    avatarUrl: row.ranking_visibility === "PUBLIC" ? row.avatar_url as string | null : null,
    publicProfileId: row.ranking_visibility === "PUBLIC" ? String(row.public_profile_id) : null,
    visibility: String(row.ranking_visibility),
  }));
  const me = userId ? shaped.findIndex((row) => row.userId === userId) : -1;
  return {
    generatedAt,
    window,
    top: shaped.slice(0, 100),
    around: me < 0 ? [] : shaped.slice(Math.max(0, me - 2), me + 3),
    me: me < 0 ? null : {
      ...shaped[me],
      target: nextRankTarget(shaped, shaped[me]),
      tied: shaped.some((row, index) => index !== me && row.score === shaped[me].score),
    },
  };
}

export async function getGamificationSummary(userId:string){const w=getWeeklyRankingWindow();const [[xp],[weekly],[streak]]=await Promise.all([db.select({value:sql<number>`coalesce(sum(${gamificationEvents.xpAwarded}),0)::int`}).from(gamificationEvents).where(eq(gamificationEvents.userId,userId)),db.select({value:sql<number>`coalesce(sum(${gamificationEvents.rankPointsAwarded}),0)::int`}).from(gamificationEvents).where(and(eq(gamificationEvents.userId,userId),gte(gamificationEvents.createdAt,w.start),lt(gamificationEvents.createdAt,w.end))),db.select().from(studyStreaks).where(eq(studyStreaks.userId,userId)).limit(1)]);return{xp:Number(xp.value),weeklyPoints:Number(weekly.value),currentStreak:streak?.currentDays??0,bestStreak:streak?.bestDays??0};}
export async function getPublicLearner(publicId:string){const [p]=await db.select({id:profiles.id,name:profiles.fullName,avatarUrl:profiles.avatarUrl}).from(profiles).where(and(eq(profiles.publicProfileId,publicId),eq(profiles.rankingVisibility,"PUBLIC"))).limit(1);if(!p)return null;const [summary,learning,challenges]=await Promise.all([getGamificationSummary(p.id),getLeaderboard("week",p.id),db.select({type:rankedChallenges.type,total:rankedChallengeRuns.totalScore,completedAt:rankedChallengeRuns.completedAt}).from(rankedChallengeRuns).innerJoin(rankedChallenges,eq(rankedChallenges.id,rankedChallengeRuns.challengeId)).where(and(eq(rankedChallengeRuns.userId,p.id),eq(rankedChallengeRuns.status,"COMPLETED"))).orderBy(desc(rankedChallengeRuns.completedAt)).limit(10)]);return{name:p.name??"Learner",avatarUrl:p.avatarUrl,...summary,weeklyRank:learning.me?.rank??null,challenges};}
