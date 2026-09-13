import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { getTranslations } from "@/lib/i18n/runtime";

export async function LocalizedLoading({ kind = "general" }: { kind?: "general" | "dashboard" | "practice" | "progress" | "results" | "signIn" }) {
  const t = getTranslations(await getCookieLanguage());
  const message = kind === "practice" ? t.practice.loading : kind === "progress" ? t.progress.loading : kind === "results" ? t.results.loading : kind === "signIn" ? t.auth.loading : kind === "dashboard" ? t.common.loading : t.common.loading;
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><p className="font-semibold text-slate-600">{message}</p></main>;
}
