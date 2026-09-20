import { describe, expect, it } from "vitest";
import { addCommunityLeaderboardRows, type LeaderboardRow } from "./community-leaderboard";

const realRow = (userId: string, score: number): LeaderboardRow => ({
  userId, score, rank: 1, name: userId, avatarUrl: null, publicProfileId: null, visibility: "PUBLIC",
});

describe("community leaderboard rows", () => {
  it("fills a quiet leaderboard without creating database users", () => {
    const rows = addCommunityLeaderboardRows([realRow("real-user", 42)], new Date("2026-09-20T17:00:00.000Z"));
    expect(rows).toHaveLength(12);
    expect(rows.find((row) => row.userId === "real-user")?.isCommunitySeed).not.toBe(true);
    expect(rows.filter((row) => row.isCommunitySeed)).toHaveLength(11);
  });

  it("keeps the weekly fixture deterministic and recalculates competition ranks", () => {
    const week = new Date("2026-09-20T17:00:00.000Z");
    const first = addCommunityLeaderboardRows([realRow("real-user", 188)], week);
    expect(addCommunityLeaderboardRows([realRow("real-user", 188)], week)).toEqual(first);
    expect(first.map((row) => row.rank)).toEqual(first.map((row, index, all) => all.findIndex((candidate) => candidate.score === row.score) + 1));
  });

  it("does not add fixtures once the real community is active enough", () => {
    const real = Array.from({ length: 12 }, (_, index) => realRow(`real-${index}`, 100 - index));
    expect(addCommunityLeaderboardRows(real, new Date()).some((row) => row.isCommunitySeed)).toBe(false);
  });
});
