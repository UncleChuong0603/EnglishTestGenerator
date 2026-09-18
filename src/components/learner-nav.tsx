import Link from "next/link";
import { ActiveLearnerLinks } from "@/components/active-learner-links";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/get-translations";

export function LearnerNav({ locale }: { locale: InterfaceLanguage }) {
  const t = getTranslations(locale);
  const items = [{ href: "/dashboard", label: t.navigation.dashboard }, { href: "/practice", label: t.navigation.practice }, { href: "/mistakes", label: t.mastery.title }, { href: "/progress", label: t.navigation.progress }, { href: "/ranking", label: locale === "vi" ? "Xếp hạng" : "Ranking" }, { href: "/demo-test", label: t.demoTest.shortTitle }];
  return <header className="grid gap-3 border-b border-slate-200 pb-4 md:grid-cols-[auto_1fr_auto] md:items-center"><Link className="text-xl font-black tracking-tight" href="/dashboard">{t.common.brand}</Link><div className="min-w-0 md:justify-self-center"><ActiveLearnerLinks items={items} label={t.navigation.mainLabel} /></div><div className="flex items-center gap-2"><LanguageSwitcher locale={locale} /><Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-white" href="/settings">{t.navigation.settings}</Link></div></header>;
}
