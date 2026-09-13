import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const preferences = await getPreferences(user?.id);
  const t = getTranslations(preferences.interfaceLanguage);
  const href = user ? "/dashboard" : "/sign-in";
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6" aria-label={t.navigation.mainLabel}><Link className="text-xl font-black" href="/">{t.common.brand}</Link><div className="flex items-center gap-3"><LanguageSwitcher locale={preferences.interfaceLanguage} /><Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold" href={href}>{user ? t.navigation.dashboard : t.landing.signIn}</Link></div></nav>
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-24"><div><p className="text-sm font-bold uppercase tracking-[.18em] text-teal-700">{t.landing.eyebrow}</p><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{t.landing.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{t.landing.intro}</p><Link className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-6 py-3 font-bold text-white" href={href}>{user ? t.landing.continue : t.landing.start}</Link><p className="mt-4 text-sm text-slate-500">{t.landing.disclaimer}</p></div><aside className="rounded-3xl bg-slate-900 p-7 text-white sm:p-8"><p className="text-sm font-bold text-teal-300">{t.landing.asideLabel}</p><h2 className="mt-3 text-2xl font-bold">{t.landing.asideTitle}</h2><p className="mt-4 leading-7 text-slate-300">{t.landing.asideBody}</p></aside></section>
    <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 md:grid-cols-3">{t.landing.features.map(({ title, body }) => <article className="rounded-2xl border border-slate-200 bg-white p-6" key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-slate-600">{body}</p></article>)}</section>
  </main>;
}
