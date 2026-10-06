import { ActiveLearnerLinks } from "@/components/active-learner-links";
import { LearnerNavigationShell } from "@/components/learner-navigation-shell";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n/get-translations";
import { getCurrentUser } from "@/lib/auth/session";
import { getPremiumAccount } from "@/lib/premium/presentation";

export async function LearnerNav({ locale, showPremiumIdentity = true }: { locale: InterfaceLanguage; showPremiumIdentity?: boolean }) {
  const t = getTranslations(locale);
  const user = await getCurrentUser();
  const account = user ? await getPremiumAccount(user.id, user.email) : null;
  const signInFor = (path: string) => `/sign-in?next=${encodeURIComponent(path)}`;
  const items = [{ href: user ? "/dashboard" : signInFor("/dashboard"), label: t.navigation.dashboard }, { href: user ? "/practice" : signInFor("/practice"), label: t.navigation.practice }, { href: user ? "/progress" : signInFor("/progress"), label: t.navigation.progress }, { href: user ? "/full-mock" : signInFor("/full-mock"), label: locale === "vi" ? "Thi thử" : "Mock Tests" }];
  const review = [{ href: "/listening-lessons", label: locale === "vi" ? "Luyện nghe audio" : "Audio shadowing" }, { href: "/ngu-phap", label: locale === "vi" ? "Ngữ pháp" : "Grammar" }, { href: user ? "/mistakes" : signInFor("/mistakes"), label: t.mastery.title }, { href: "/vocabulary", label: user ? (locale === "vi" ? "Từ của tôi" : "My vocabulary") : (locale === "vi" ? "Từ vựng" : "Vocabulary") }];
  const secondary = [{ href: "/", label: locale === "vi" ? "Trang giới thiệu" : "Public home" }, { href: "/blog", label: locale === "vi" ? "Kiến thức" : "Guides" }, { href: "/ranking", label: locale === "vi" ? "Xếp hạng" : "Ranking" }, { href: "/support", label: locale === "vi" ? "Trợ giúp & phản hồi" : "Support & feedback" }];
  const status = !showPremiumIdentity ? undefined : account?.isTrial ? (locale === "vi" ? "Premium dùng thử" : "Premium trial") : account?.isPremium ? (account.expiresAt ? `Premium · ${locale === "vi" ? "đến" : "until"} ${account.expiresAt.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh" })}` : "Premium") : account?.membershipStatus === "REVOKED" ? (locale === "vi" ? "Premium đã thu hồi" : "Premium revoked") : account?.membershipStatus === "EXPIRED" ? (locale === "vi" ? "Premium đã hết hạn" : "Premium expired") : "Free";
  return <LearnerNavigationShell brand={t.common.brand} locale={locale}>
    <ActiveLearnerLinks items={items} review={review} secondary={secondary} label={t.navigation.mainLabel} locale={locale} account={account ? { name: account.name, avatarUrl: account.avatarUrl, premium: Boolean(showPremiumIdentity && account.isPremium), status } : null} guest={!user} settingsLabel={t.navigation.settings} signOutLabel={t.navigation.signOut} />
  </LearnerNavigationShell>;
}
