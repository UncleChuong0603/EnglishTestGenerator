import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getMarketingTranslations } from "@/lib/i18n/marketing";

export function PublicHeader({ locale, signedIn = false }: { locale: InterfaceLanguage; signedIn?: boolean }) {
  const t = getMarketingTranslations(locale);
  const destination = signedIn ? "/dashboard" : "/sign-in";
  return <header className="border-b border-slate-200/80 bg-white/90">
    <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
      <Link className="flex shrink-0 items-center gap-2 text-sm font-black tracking-tight text-slate-950 sm:text-base" href="/" aria-label="TOEIC GYM home">TOEIC GYM</Link>
      <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex" aria-label="Public navigation"><Link className="rounded-lg px-3 py-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" href="/blog">{locale === "vi" ? "Kiến thức" : "Guides"}</Link><Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/#features">{t.nav.features}</Link><Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/#how-it-works">{t.nav.how}</Link><Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/pricing">{t.nav.pricing}</Link><Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/#faq">{t.nav.faq}</Link></nav>
      <div className="hidden min-w-0 items-center gap-2 lg:flex"><LanguageSwitcher locale={locale} /><Link className="inline-flex min-h-11 items-center rounded-xl px-4 font-bold text-slate-700 hover:bg-slate-100" href={destination}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link><Link className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-4 text-center text-sm font-bold text-white hover:bg-teal-800" href={destination}>{signedIn ? t.nav.continue : t.nav.start}</Link></div>
      <details className="group relative lg:hidden"><summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 text-xl font-black text-slate-800" aria-label={locale === "vi" ? "Mở menu" : "Open menu"}>☰</summary><nav className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl" aria-label="Public mobile navigation"><Link className="block min-h-11 rounded-lg px-3 py-3 hover:bg-slate-50" href="/blog">{locale === "vi" ? "Kiến thức" : "Guides"}</Link><Link className="block min-h-11 rounded-lg px-3 py-3 hover:bg-slate-50" href="/#features">{t.nav.features}</Link><Link className="block min-h-11 rounded-lg px-3 py-3 hover:bg-slate-50" href="/#how-it-works">{t.nav.how}</Link><Link className="block min-h-11 rounded-lg px-3 py-3 hover:bg-slate-50" href="/pricing">{t.nav.pricing}</Link><Link className="block min-h-11 rounded-lg px-3 py-3 hover:bg-slate-50" href={destination}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link><div className="border-t border-slate-100 px-3 py-3"><LanguageSwitcher locale={locale} /></div><Link className="flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-4 text-center text-white" href={destination}>{signedIn ? t.nav.continue : t.nav.start}</Link></nav></details>
    </div>
  </header>;
}
