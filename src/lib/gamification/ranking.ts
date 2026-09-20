import { GAMIFICATION_CATALOG } from "./catalog";
export function competitionRanks(scores: readonly number[]) { let previous: number | undefined; let rank = 0; return scores.map((score, index) => { if (score !== previous) rank = index + 1; previous = score; return rank; }); }
export function percentile(rank: number, participants: number) { return participants < GAMIFICATION_CATALOG.percentileMinimumParticipants ? null : Math.max(1, Math.ceil(rank / participants * 100)); }
export function pointsToOvertake(score: number, nextScore: number | null) { return nextScore == null ? 0 : Math.max(0, nextScore - score + 1); }
export function nextRankTarget(rows: readonly {score:number;rank:number}[], me: {score:number;rank:number}) {
  const above = rows.filter(row => row.score > me.score);
  if (!above.length) return null;
  const next = above[above.length - 1];
  return {rank: next.rank, score: next.score, points: pointsToOvertake(me.score, next.score)};
}
