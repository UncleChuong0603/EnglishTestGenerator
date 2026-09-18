export const GAMIFICATION_CATALOG = {
  timezone: "Asia/Ho_Chi_Minh", questionXp: 1, questionRankPoints: 1, questionDailyCap: 30,
  workoutBonus: { xp: 10, rankPoints: 10 }, masteryBonus: { xp: 10, rankPoints: 10 },
  studyDayRankPoints: 5, streakRankPointsCap: 5, dailyRankPointsCap: 60,
  completionXp: { DIAGNOSTIC: 20, FULL_MOCK: 50, READING_100: 25, LISTENING_100: 25, FULL_200: 50 },
  percentileMinimumParticipants: 20,
} as const;

export type RankingVisibility = "PUBLIC" | "ANONYMOUS" | "HIDDEN";
export type ChallengeType = "READING_100" | "LISTENING_100" | "FULL_200";
