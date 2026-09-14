import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getMarketingTranslations } from "@/lib/i18n/marketing";

export function PublicHeader({ locale, signedIn = false }: { locale: InterfaceLanguage; signedIn?: boolean }) {
  const t = getMarketingTranslations(locale);
  const destination = signedIn ? "/dashboard" : "/sign-in";
  return <header className="border-b border-slate-200/80 bg-white/90">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6">
      <Link className="flex shrink-0 items-center gap-2 font-black tracking-tight text-slate-950" href="/" aria-label="TOEIC GYM home"><span className="hidden sm:inline">TOEIC GYM</span></Link>
      <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex" aria-label="Public navigation"><Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/#features">{t.nav.features}</Link><Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/#how-it-works">{t.nav.how}</Link><Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/pricing">{t.nav.pricing}</Link><Link className="rounded-lg px-3 py-2 hover:bg-slate-100" href="/#faq">{t.nav.faq}</Link></nav>
      <div className="flex min-w-0 items-center gap-2"><LanguageSwitcher locale={locale} /><Link className="hidden min-h-11 items-center rounded-xl px-4 font-bold text-slate-700 hover:bg-slate-100 md:inline-flex" href={destination}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link><Link className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-3 text-center text-sm font-bold text-white hover:bg-teal-800 sm:px-4" href={destination}>{signedIn ? t.nav.continue : t.nav.start}</Link></div>
    </div>
    <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 lg:hidden" aria-label="Public sections"><Link className="shrink-0 rounded-lg px-3 py-2" href="/#features">{t.nav.features}</Link><Link className="shrink-0 rounded-lg px-3 py-2" href="/#how-it-works">{t.nav.how}</Link><Link className="shrink-0 rounded-lg px-3 py-2" href="/pricing">{t.nav.pricing}</Link><Link className="shrink-0 rounded-lg px-3 py-2" href="/#faq">{t.nav.faq}</Link></nav>
  </header>;
}
