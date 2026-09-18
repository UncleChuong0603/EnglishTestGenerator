import { GAMIFICATION_CATALOG } from "./catalog";
export function competitionRanks(scores: readonly number[]) { let previous: number | undefined; let rank = 0; return scores.map((score, index) => { if (score !== previous) rank = index + 1; previous = score; return rank; }); }
export function percentile(rank: number, participants: number) { return participants < GAMIFICATION_CATALOG.percentileMinimumParticipants ? null : Math.max(1, Math.ceil(rank / participants * 100)); }
export function pointsToOvertake(score: number, nextScore: number | null) { return nextScore == null ? 0 : Math.max(0, nextScore - score + 1); }
