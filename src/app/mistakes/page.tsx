import Link from "next/link";
import { LearnerNav } from "@/components/learner-nav";
import { requireUser } from "@/lib/auth/session";
import { formatMessage, getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { getMistakeBank, getMistakeCounts, type MistakeStatus } from "@/lib/mastery/queries";
import { startMasteryReview } from "./actions";

export default async function MistakesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireUser(); const query = await searchParams; const preferences = await getPreferences(user.id); const t = getTranslations(preferences.interfaceLanguage).mastery;
  const status: MistakeStatus = query.tab === "mastered" ? "MASTERED" : "UNRESOLVED";
  const part = [1,2,3,4,5,6,7].includes(Number(query.part)) ? Number(query.part) : undefined;
  const skillArea = query.area === "LISTENING" || query.area === "READING" ? query.area : undefined;
  const [items, counts] = await Promise.all([getMistakeBank(user.id, status, { part, skillArea }), getMistakeCounts(user.id)]);
  const href = (values: Record<string, string>) => `/mistakes?${new URLSearchParams(values)}`;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-5xl"><LearnerNav locale={preferences.interfaceLanguage} />
    <header className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-wider text-teal-700">TOEIC GYM</p><h1 className="mt-2 text-3xl font-black">{t.title}</h1></div>{counts.unresolved ? <form action={startMasteryReview}><input name="part" type="hidden" value={part ?? ""} /><button className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">{t.review}</button></form> : null}</header>
    <nav className="mt-7 flex gap-2" aria-label={t.title}><Link className={`rounded-full px-4 py-2 font-bold ${status === "UNRESOLVED" ? "bg-slate-900 text-white" : "bg-white"}`} href={href({ tab: "review" })}>{t.toReview} · {counts.unresolved}</Link><Link className={`rounded-full px-4 py-2 font-bold ${status === "MASTERED" ? "bg-slate-900 text-white" : "bg-white"}`} href={href({ tab: "mastered" })}>{t.mastered} · {counts.mastered}</Link></nav>
    <div className="mt-5 flex flex-wrap gap-2">{["ALL","LISTENING","READING"].map((area) => <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold" href={area === "ALL" ? href({ tab: status === "MASTERED" ? "mastered" : "review" }) : href({ tab: status === "MASTERED" ? "mastered" : "review", area })} key={area}>{area === "ALL" ? "All" : area}</Link>)}{[1,2,3,4,5,6,7].map((value) => <Link className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold" href={href({ tab: status === "MASTERED" ? "mastered" : "review", part: String(value) })} key={value}>Part {value}</Link>)}</div>
    {!items.length ? <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center"><h2 className="text-2xl font-black">{t.emptyTitle}</h2><p className="mt-2 text-slate-600">{t.emptyBody}</p><Link className="mt-5 inline-flex rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800" href="/practice">Practice</Link></section> : <div className="mt-6 grid gap-4 sm:grid-cols-2">{items.map((item) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={item.questionId}><p className="text-sm font-black text-teal-700">{item.skillArea} · Part {item.part}</p><h2 className="mt-2 text-lg font-black">{item.skill}</h2><p className="text-sm text-slate-600">{item.subSkill}</p><p className="mt-4 text-sm text-slate-600">{t.lastMissed}: {item.lastMissedAt.toLocaleDateString(preferences.interfaceLanguage)}</p>{item.status === "MASTERED" ? <p className="mt-2 font-bold text-emerald-700">{t.mastered}</p> : <p className="mt-2 font-bold">{formatMessage(t.successfulReviews, { count: item.reviewSuccessStreak })}</p>}{!item.available ? <p className="mt-3 text-sm font-bold text-amber-700">{t.unavailable}</p> : null}</article>)}</div>}
  </div></main>;
}
