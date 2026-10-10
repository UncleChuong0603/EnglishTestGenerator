import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getLeaderboard: vi.fn(),
  locale: "vi" as "vi" | "en",
}));

vi.mock("@/components/competitive-learner-nav", () => ({
  LearnerNav: () => <nav>Learner navigation</nav>,
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/i18n/get-translations", () => ({
  getPreferences: vi.fn().mockImplementation(async () => ({
    explanationLanguage: "both",
    interfaceLanguage: mocks.locale,
  })),
}));
vi.mock("@/lib/gamification/queries", () => ({
  getGamificationSummary: vi.fn(),
  getLeaderboard: mocks.getLeaderboard,
}));
vi.mock("@/lib/challenges/queries", () => ({
  getChallengeHistory: vi.fn().mockResolvedValue([]),
  listDiscoverableChallenges: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/lib/full-mock/service", () => ({
  getFullMockReadiness: vi.fn().mockResolvedValue({ ready: false }),
}));

import RankingPage from "./page";

function board(period: "week" | "month" | "all") {
  const generatedAt = new Date("2026-10-08T12:00:00+07:00");
  const end = period === "week"
    ? new Date("2026-10-12T00:00:00+07:00")
    : new Date("2026-11-01T00:00:00+07:00");
  return {
    around: [],
    generatedAt,
    me: null,
    top: [],
    window: period === "all" ? null : { end, endDate: "", start: generatedAt, startDate: "" },
  };
}

describe("RankingPage periods", () => {
  beforeEach(() => {
    mocks.locale = "vi";
    mocks.getLeaderboard.mockReset();
    mocks.getLeaderboard.mockImplementation(async (period: "week" | "month" | "all") => board(period));
  });

  it("shows Tuần, Tháng and Tất cả with a deep-linked active month", async () => {
    const page = await RankingPage({ searchParams: Promise.resolve({ period: "month" }) });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Bảng xếp hạng");
    expect(html).toContain('href="/ranking">Tuần</a>');
    expect(html).toMatch(/<a aria-current="page"[^>]*href="\/ranking\?period=month">Tháng<\/a>/);
    expect(html).toContain('href="/ranking?period=all">Tất cả</a>');
    expect(html).toContain("Dẫn đầu tháng");
    expect(mocks.getLeaderboard).toHaveBeenCalledWith("month", undefined);
  });

  it("renders the English all-time state and passes the period to the query", async () => {
    mocks.locale = "en";
    const page = await RankingPage({ searchParams: Promise.resolve({ period: "all" }) });
    const html = renderToStaticMarkup(page);

    expect(html).toMatch(/<a aria-current="page"[^>]*href="\/ranking\?period=all">All time<\/a>/);
    expect(html).toContain("All-time leaders");
    expect(html).toContain("Lifetime RP");
    expect(mocks.getLeaderboard).toHaveBeenCalledWith("all", undefined);
  });

  it("falls back to the weekly leaderboard for an invalid period", async () => {
    const page = await RankingPage({ searchParams: Promise.resolve({ period: "invalid" }) });
    const html = renderToStaticMarkup(page);

    expect(html).toMatch(/<a aria-current="page"[^>]*href="\/ranking">Tuần<\/a>/);
    expect(mocks.getLeaderboard).toHaveBeenCalledWith("week", undefined);
  });
});
