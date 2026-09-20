import { competitionRanks } from "./ranking";

export type LeaderboardRow = {
  userId: string;
  score: number;
  rank: number;
  name: string | null;
  avatarUrl: string | null;
  publicProfileId: string | null;
  visibility: string;
  isCommunitySeed?: boolean;
};

const COMMUNITY_NAMES = [
  "Minh Anh", "Gia Huy", "Ngoc Han", "Quang Minh", "Thu Trang", "Bao Long",
  "Khanh Linh", "Duc Anh", "Phuong Nhi", "Hoang Nam", "Mai Chi", "Tuan Kiet",
] as const;

function stableWeekOffset(weekStart: Date) {
  return [...weekStart.toISOString().slice(0, 10)].reduce((total, character) => total + character.charCodeAt(0), 0);
}

export function addCommunityLeaderboardRows(realRows: LeaderboardRow[], weekStart: Date, minimumRows = 12) {
  const needed = Math.max(0, minimumRows - realRows.length);
  const offset = stableWeekOffset(weekStart);
  const communityRows: LeaderboardRow[] = COMMUNITY_NAMES.slice(0, needed).map((name, index) => ({
    userId: `community-seed-${index + 1}`,
    score: Math.max(8, 188 - index * 13 + ((offset + index * 7) % 11) - 5),
    rank: 0,
    name,
    avatarUrl: null,
    publicProfileId: null,
    visibility: "PUBLIC",
    isCommunitySeed: true,
  }));

  const rows = [...realRows, ...communityRows].sort((left, right) => right.score - left.score || left.userId.localeCompare(right.userId));
  const ranks = competitionRanks(rows.map((row) => row.score));
  return rows.map((row, index) => ({ ...row, rank: ranks[index] }));
}
