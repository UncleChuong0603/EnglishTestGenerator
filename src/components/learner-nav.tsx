import Link from "next/link";
import { ActiveLearnerLinks } from "@/components/active-learner-links";
import { PublicHeader } from "@/components/public-header";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
import { getPremiumAccount } from "@/lib/premium/presentation";

export async function LearnerNav({ locale, showPremiumIdentity = true }: { locale: InterfaceLanguage; showPremiumIdentity?: boolean }) {
  const t = getTranslations(locale);
  const user = await getCurrentUser();
  if (!user) return <PublicHeader locale={locale} />;
  const account = user ? await getPremiumAccount(user.id, user.email) : null;
  const items = [{ href: "/dashboard", label: t.navigation.dashboard }, { href: "/practice", label: t.navigation.practice }, { href: "/mistakes", label: t.mastery.title }, { href: "/progress", label: t.navigation.progress }];
  const secondary = [{ href: "/ranking", label: locale === "vi" ? "Xếp hạng" : "Ranking" }, { href: "/demo-test", label: t.demoTest.shortTitle }, { href: "/full-mock", label: "Full Mock" }, { href: "/blog", label: locale === "vi" ? "Kiến thức" : "Guides" }];
  const status = !showPremiumIdentity ? undefined : account?.isPremium ? (account.expiresAt ? `Premium · ${locale === "vi" ? "đến" : "until"} ${account.expiresAt.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}` : "Premium") : account?.membershipStatus === "EXPIRED" ? (locale === "vi" ? "Premium đã hết hạn" : "Premium expired") : "Free";
  return <header className="flex min-h-14 min-w-0 items-center justify-between gap-3 border-b border-slate-200 lg:min-h-0 lg:pb-4"><Link className="shrink-0 text-lg font-black tracking-tight lg:text-xl" href="/dashboard">{t.common.brand}</Link><ActiveLearnerLinks items={items} secondary={secondary} label={t.navigation.mainLabel} locale={locale} account={account ? { name: account.name, avatarUrl: account.avatarUrl, premium: Boolean(showPremiumIdentity && account.isPremium), status } : null} settingsLabel={t.navigation.settings} signOutLabel={t.navigation.signOut} /></header>;
}
