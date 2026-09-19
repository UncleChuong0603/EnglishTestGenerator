import Link from "next/link";
import { ActiveLearnerLinks } from "@/components/active-learner-links";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
import { getPremiumAccount } from "@/lib/premium/presentation";

export async function LearnerNav({ locale, showPremiumIdentity = true }: { locale: InterfaceLanguage; showPremiumIdentity?: boolean }) {
  const t = getTranslations(locale);
  const user = await getCurrentUser();
  const account = user ? await getPremiumAccount(user.id, user.email) : null;
  const items = [{ href: "/dashboard", label: t.navigation.dashboard }, { href: "/practice", label: t.navigation.practice }, { href: "/mistakes", label: t.mastery.title }, { href: "/progress", label: t.navigation.progress }];
  const secondary = [{ href: "/ranking", label: locale === "vi" ? "Xếp hạng" : "Ranking" }, { href: "/demo-test", label: t.demoTest.shortTitle }, { href: "/full-mock", label: "Full Mock" }];
  return <header className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-200 pb-4 lg:gap-4"><Link className="shrink-0 text-xl font-black tracking-tight" href="/dashboard">{t.common.brand}</Link><ActiveLearnerLinks items={items} secondary={secondary} label={t.navigation.mainLabel} locale={locale} account={account ? { name: account.name, avatarUrl: account.avatarUrl, premium: Boolean(showPremiumIdentity && account.isPremium), status: showPremiumIdentity ? account.isPremium ? "Premium" : "Free" : undefined } : null} settingsLabel={t.navigation.settings} signOutLabel={t.navigation.signOut} /></header>;
}
