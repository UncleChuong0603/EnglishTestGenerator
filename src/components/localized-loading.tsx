import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { getTranslations } from "@/lib/i18n/runtime";

export async function LocalizedLoading({ kind = "general" }: { kind?: "general" | "dashboard" | "practice" | "progress" | "results" | "signIn" | "demoTest" }) {
  const t = getTranslations(await getCookieLanguage());
  const message = kind === "practice" ? t.practice.loading : kind === "progress" ? t.progress.loading : kind === "results" ? t.results.loading : kind === "signIn" ? t.auth.loading : kind === "demoTest" ? t.demoTest.loading : kind === "dashboard" ? t.common.loading : t.common.loading;
  return <main className="min-h-screen bg-slate-50 px-5 py-8" aria-busy="true" aria-live="polite"><div className="mx-auto max-w-6xl"><span className="sr-only">{message}</span><div className="h-10 w-44 animate-pulse rounded-xl bg-slate-200" /><div className="mt-10 h-44 animate-pulse rounded-3xl bg-slate-200" /><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((item) => <div className="h-28 animate-pulse rounded-2xl bg-slate-200" key={item} />)}</div></div></main>;
}
