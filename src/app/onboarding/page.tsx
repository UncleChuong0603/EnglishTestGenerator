import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getCookieLanguage, getTranslations } from "@/lib/i18n/get-translations";
import { getCurrentProfile } from "@/lib/profiles/profile";
import { saveProfile } from "./actions";

type Props = { searchParams: Promise<{ error?: string }> };
export default async function OnboardingPage({ searchParams }: Props) {
  const [{ error }, user, locale] = await Promise.all([searchParams, getCurrentUser(), getCookieLanguage()]); if (!user) redirect("/sign-in");
  const profile = await getCurrentProfile(user.id); if (profile.status === "found") redirect("/dashboard"); const t = getTranslations(locale);
  const message = error === "invalid_name" ? t.onboarding.invalidName : error === "save_failed" || profile.status === "error" ? t.onboarding.saveError : null;
  const next = locale === "vi" ? "Tiếp theo, hãy làm một bài Reading tổng hợp ngắn để bắt đầu xây dựng hồ sơ điểm mạnh và nội dung cần cải thiện." : "Next, take a short balanced Reading practice so we can begin building your strengths and improvement profile.";
  return <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 sm:px-10"><section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8"><Link className="text-sm font-semibold text-teal-700" href="/">← {t.common.backHome}</Link><p className="mt-6 text-sm font-semibold uppercase tracking-[.18em] text-teal-700">{t.onboarding.eyebrow}</p><h1 className="mt-3 text-3xl font-bold tracking-tight">{t.onboarding.title}</h1><p className="mt-2 text-slate-600">{t.onboarding.intro}</p><p className="mt-5 rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900">{next}</p>{message ? <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}<form action={saveProfile} className="mt-8 space-y-5"><label className="block text-sm font-semibold" htmlFor="fullName">{t.onboarding.fullName}<input autoComplete="name" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5" id="fullName" maxLength={100} minLength={2} name="fullName" required /></label><button className="min-h-12 w-full rounded-lg bg-teal-700 px-4 py-2.5 font-semibold text-white">{t.onboarding.save}</button></form></section></main>;
}
