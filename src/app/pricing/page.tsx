import type { Metadata } from "next";
import Link from "next/link";
import { PricingSection } from "@/components/pricing-section";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { PremiumBadge } from "@/components/premium/premium-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getPaymentCatalog } from "@/lib/payments/catalog";
import { getPremiumAccount, premiumCopy } from "@/lib/premium/presentation";
import { getPremiumPreview } from "@/lib/premium/preview";
import { PersonalizedPremiumSummary } from "@/components/premium/premium-preview";
import { PUBLIC_ACTIVATION_HREF } from "@/lib/public-product";

export const metadata: Metadata = {
  title: "Bảng giá TOEIC GYM",
  description: "So sánh gói Free và Premium của TOEIC GYM để chọn cách luyện TOEIC phù hợp với bạn.",
  alternates: { canonical: "/pricing" },
};
export default async function PricingPage() {
  const user = await getCurrentUser();
  const preferences = await getPreferences(user?.id);
  const locale = preferences.interfaceLanguage;
  const account = user ? await getPremiumAccount(user.id, user.email) : null;
  const copy = premiumCopy(locale);
  const preview = user ? await getPremiumPreview() : null;
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader locale={locale} signedIn={Boolean(user)} />
      <header className="mx-auto max-w-5xl px-5 pt-10 sm:px-6 sm:pt-14">
        <p className="text-sm font-black uppercase tracking-[.16em] text-teal-700">
          {locale === "vi" ? "Gói TOEICGym" : "TOEICGym plans"}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
          {locale === "vi"
            ? "Chọn mức hỗ trợ phù hợp với cách bạn đang học"
            : "Choose the support that fits how you learn"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          {locale === "vi"
            ? "Free giữ trọn trải nghiệm học cốt lõi. Premium mở thêm hạn mức và chiều sâu khi dữ liệu của bạn đã đủ hữu ích."
            : "Free keeps the complete core learning experience. Premium adds capacity and depth when your data can support it."}
        </p>
      </header>
      {account?.isPremium ? (
        <aside className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <PremiumBadge />
            <div>
              <strong>{copy.current}</strong>
              {account.expiresAt ? (
                <p className="mt-1 text-sm text-amber-950">
                  {copy.expires}{" "}
                  {account.expiresAt.toLocaleDateString(
                    locale === "vi" ? "vi-VN" : "en-US",
                    { timeZone: "Asia/Ho_Chi_Minh" },
                  )}
                </p>
              ) : null}
            </div>
          </div>
          <Link className="font-bold text-teal-800 underline" href="/billing">
            {copy.manage}
          </Link>
        </aside>
      ) : account?.membershipStatus === "EXPIRED" ? (
        <aside className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white px-5 py-4">
          <div>
            <strong>
              {locale === "vi" ? "Premium đã hết hạn" : "Premium expired"}
            </strong>
            <p className="mt-1 text-sm text-slate-600">
              {locale === "vi"
                ? "Dữ liệu học tập của bạn vẫn an toàn và các tính năng Free vẫn khả dụng."
                : "Your learning data remains safe and Free capabilities remain available."}
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
            href="/billing"
          >
            {locale === "vi" ? "Khôi phục Premium" : "Restore Premium"}
          </Link>
        </aside>
      ) : null}
      {preview ? (
        <PersonalizedPremiumSummary locale={locale} preview={preview} />
      ) : null}
      <PricingSection
        locale={locale}
        currentPlan={
          account?.isPremium ? "PREMIUM" : account ? "FREE" : undefined
        }
        startHref={user ? "/dashboard" : PUBLIC_ACTIVATION_HREF}
        products={getPaymentCatalog()}
      />
      <PublicFooter locale={locale} />
    </main>
  );
}
