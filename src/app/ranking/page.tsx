import Link from "next/link";
import { LearnerNav } from "@/components/competitive-learner-nav";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getGamificationSummary, getWeeklyLeaderboard } from "@/lib/gamification/queries";
import { getChallengeHistory, listDiscoverableChallenges } from "@/lib/challenges/queries";
import { challengePhase } from "@/lib/challenges/policy";

export default async function RankingPage({ searchParams }: { searchParams: Promise<{ week?: string; tab?: string }> }) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  const preferences = await getPreferences(user?.id);
  const vi = preferences.interfaceLanguage === "vi";
  const [board, summary, challenges, history] = await Promise.all([getWeeklyLeaderboard(query.week === "previous", user?.id), user ? getGamificationSummary(user.id) : null, listDiscoverableChallenges(), user ? getChallengeHistory(user.id) : []]);
  const tabs = [["weekly", vi ? "Học tập tuần" : "Weekly Learning"], ["READING_100", "Reading"], ["LISTENING_100", "Listening"], ["FULL_200", "Full Mock"]];
  const tab = query.tab ?? "weekly";
  const selected = challenges.filter((challenge) => challenge.type === tab).sort((a, b) => {
    const order = (challenge: typeof a) => challengePhase(challenge) === "LIVE" ? 0 : challengePhase(challenge) === "UPCOMING" ? 1 : 2;
    return order(a) - order(b);
  })[0];
  return <main className="min-h-screen overflow-x-hidden bg-slate-50 px-4 py-6 pb-24 text-slate-900 sm:px-6 lg:pb-8"><div className="mx-auto max-w-5xl">
    <LearnerNav locale={preferences.interfaceLanguage} />
    <header className="mt-6 sm:mt-8"><h1 className="text-3xl font-black sm:text-4xl">{vi ? "Bảng xếp hạng" : "Ranking"}</h1><p className="mt-2 text-sm leading-6 text-slate-600">XP = lifetime progress · Rank Points = weekly ranking</p></header>
    {summary && <section aria-label={vi ? "Tóm tắt thành tích" : "Achievement summary"} className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{[["XP", summary.xp], ["Rank Points", summary.weeklyPoints], [vi ? "Chuỗi ngày" : "Streak", summary.currentStreak]].map(([label, value]) => <article className="min-w-0 rounded-xl bg-slate-900 p-3 text-white sm:p-4" key={label}><p className="break-words text-xs text-slate-300 sm:text-sm">{label}</p><strong className="mt-1 block text-xl tabular-nums sm:text-2xl">{value}</strong></article>)}</section>}
    <nav aria-label="Ranking categories" className="-mx-4 mt-6 flex snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:mx-0 sm:px-0">{tabs.map(([key, label]) => <Link aria-current={tab === key ? "page" : undefined} className={`min-h-11 shrink-0 snap-start rounded-xl border px-4 py-3 font-bold ${tab === key ? "border-teal-700 bg-teal-700 text-white" : "border-slate-200 bg-white"}`} href={key === "weekly" ? "/ranking" : `/ranking?tab=${key}`} key={key}>{label}</Link>)}</nav>
    {tab === "weekly" ? <><nav aria-label={vi ? "Khoảng thời gian" : "Time period"} className="mt-3 inline-flex rounded-xl bg-slate-200 p-1 text-sm font-bold"><Link aria-current={!query.week ? "page" : undefined} className={`min-h-11 rounded-lg px-4 py-3 ${!query.week ? "bg-white shadow-sm" : ""}`} href="/ranking">{vi ? "Tuần này" : "This week"}</Link><Link aria-current={query.week === "previous" ? "page" : undefined} className={`min-h-11 rounded-lg px-4 py-3 ${query.week === "previous" ? "bg-white shadow-sm" : ""}`} href="/ranking?week=previous">{vi ? "Tuần trước" : "Previous"}</Link></nav>
      {board.me && <aside className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4"><p className="text-sm font-bold text-teal-900">{vi ? "Vị trí của bạn" : "Your position"}</p><strong className="mt-1 block text-2xl">#{board.me.rank} · {board.me.score} RP</strong><p className="mt-1 text-sm text-slate-700">{board.me.rank === 1 ? (vi ? "Bạn đang dẫn đầu tuần này." : "You are leading this week.") : `${board.me.pointsToNext} ${vi ? "điểm để vượt hạng trên" : "points to overtake the next rank"}`}</p></aside>}
      <section aria-label={vi ? "Danh sách xếp hạng" : "Leaderboard"} className="mt-5 grid gap-2">{board.top.map((row) => <article className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-slate-100 bg-white p-4" key={row.userId}><strong>#{row.rank}</strong><span className="min-w-0 break-words">{row.visibility === "PUBLIC" ? <Link className="font-semibold text-teal-800" href={`/learners/${row.publicProfileId}`}>{row.name}</Link> : vi ? "Người học ẩn danh" : "Anonymous learner"}</span><strong className="whitespace-nowrap tabular-nums">{row.score} RP</strong></article>)}</section>
    </> : <section className="mt-5">{selected ? <Link className="block rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" href={`/ranking/challenges/${selected.id}`}><h2 className="text-xl font-black sm:text-2xl">{vi ? selected.titleVi : selected.titleEn}</h2><p className="mt-2 break-words text-sm text-slate-600">{challengePhase(selected)} · {selected.startsAt?.toLocaleString()} → {selected.endsAt?.toLocaleString()}</p></Link> : <p className="rounded-xl bg-white p-5">{vi ? "Chưa có thử thách." : "No challenge available."}</p>}</section>}
    {user && history.length > 0 && <section className="mt-8"><h2 className="text-2xl font-black">{vi ? "Lịch sử thử thách" : "Challenge history"}</h2><div className="mt-3 grid gap-2">{history.map((item) => <Link className="min-w-0 break-words rounded-xl bg-white p-4" href={`/ranking/challenges/run/${item.runId}/result`} key={item.runId}>{vi ? item.titleVi : item.titleEn} · <strong>{item.total}/{item.type === "FULL_200" ? 200 : 100}</strong></Link>)}</div></section>}
  </div></main>;
}
