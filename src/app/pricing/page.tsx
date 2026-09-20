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

export const metadata: Metadata = { title: "Pricing", description: "Compare Free and Premium TOEICGym plans.", alternates: { canonical: "/pricing" } };
export default async function PricingPage() {
  const user=await getCurrentUser(); const preferences=await getPreferences(user?.id); const locale=preferences.interfaceLanguage;
  const account=user?await getPremiumAccount(user.id,user.email):null; const copy=premiumCopy(locale);
  return <main className="min-h-screen bg-slate-50 text-slate-900"><PublicHeader locale={locale} signedIn={Boolean(user)}/>
    {account?.isPremium?<aside className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"><div className="flex items-center gap-3"><PremiumBadge/><div><strong>{copy.current}</strong>{account.expiresAt?<p className="mt-1 text-sm text-amber-950">{copy.expires} {account.expiresAt.toLocaleDateString(locale==="vi"?"vi-VN":"en-US", { timeZone: "Asia/Ho_Chi_Minh" })}</p>:null}</div></div><Link className="font-bold text-teal-800 underline" href="/billing">{copy.manage}</Link></aside>:account?.membershipStatus==="EXPIRED"?<aside className="mx-auto mt-8 max-w-5xl rounded-2xl border border-slate-300 bg-white px-5 py-4"><strong>{locale==="vi"?"Premium đã hết hạn":"Premium expired"}</strong><p className="mt-1 text-sm text-slate-600">{locale==="vi"?"Dữ liệu học tập của bạn vẫn an toàn và các tính năng Free vẫn khả dụng.":"Your learning data remains safe and Free capabilities remain available."}</p></aside>:null}
    <PricingSection locale={locale} currentPlan={account?.isPremium?"PREMIUM":account?"FREE":undefined} startHref={user?"/dashboard":"/sign-in?next=/pricing"} products={getPaymentCatalog()}/>
    <PublicFooter locale={locale}/>
  </main>;
}
