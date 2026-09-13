import Link from "next/link";

import { signOut } from "@/app/dashboard/actions";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/get-translations";

export function LearnerNav({ locale }: { locale: InterfaceLanguage }) {
  const t = getTranslations(locale);
  return <header className="flex flex-wrap items-center justify-between gap-4">
    <Link className="text-xl font-black tracking-tight" href="/dashboard">{t.common.brand}</Link>
    <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold sm:gap-2" aria-label={t.navigation.mainLabel}>
      <Link className="rounded-lg px-2.5 py-2 hover:bg-white sm:px-3" href="/dashboard">{t.navigation.dashboard}</Link>
      <Link className="rounded-lg px-2.5 py-2 hover:bg-white sm:px-3" href="/practice">{t.navigation.practice}</Link>
      <Link className="rounded-lg px-2.5 py-2 hover:bg-white sm:px-3" href="/progress">{t.navigation.progress}</Link>
      <Link className="rounded-lg px-2.5 py-2 hover:bg-white sm:px-3" href="/settings">{t.navigation.settings}</Link>
      <LanguageSwitcher locale={locale} />
      <form action={signOut}><button className="rounded-lg px-2.5 py-2 text-slate-600 hover:bg-white sm:px-3" type="submit">{t.navigation.signOut}</button></form>
    </nav>
  </header>;
}
