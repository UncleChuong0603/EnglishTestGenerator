import type { Metadata } from "next";
import { PricingSection } from "@/components/pricing-section";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { PremiumBadge } from "@/components/premium/premium-badge";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getMarketingTranslations } from "@/lib/i18n/marketing";
import { getPaymentCatalog } from "@/lib/payments/catalog";
import { getPremiumAccount, premiumCopy } from "@/lib/premium/presentation";

export const metadata: Metadata = { title: "Pricing", description: "Compare Free and Premium TOEICGym plans.", alternates: { canonical: "/pricing" } };
export default async function PricingPage() {
  const user=await getCurrentUser(); const preferences=await getPreferences(user?.id); const locale=preferences.interfaceLanguage; const t=getMarketingTranslations(locale).pricing;
  const account=user?await getPremiumAccount(user.id,user.email):null; const copy=premiumCopy(locale);
  return <main className="min-h-screen bg-slate-50 text-slate-900"><PublicHeader locale={locale} signedIn={Boolean(user)}/>
    {account?.isPremium?<aside className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"><div className="flex items-center gap-3"><PremiumBadge/><strong>{copy.current}</strong></div><span className="text-sm font-semibold text-amber-950">{locale==="vi"?"Bạn vẫn có thể mua thêm thời hạn.":"You can still extend your fixed-duration access."}</span></aside>:null}
    <PricingSection locale={locale} startHref={user?"/dashboard":"/sign-in?next=/pricing"} products={getPaymentCatalog()}/>
    <section className="mx-auto max-w-5xl px-5 pb-20 sm:px-6"><h2 className="text-2xl font-black">{t.compare}</h2><div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[38rem] text-left"><thead className="bg-slate-900 text-white"><tr><th className="p-4">{t.feature}</th><th className="p-4">{t.free}</th><th className="p-4">{t.premium}</th></tr></thead><tbody className="divide-y divide-slate-100">{t.rows.map(row=><tr key={row[0]}><th className="p-4 font-bold">{row[0]}</th><td className="p-4 text-slate-600">{row[1]}</td><td className="p-4 text-slate-600">{row[2]}</td></tr>)}</tbody></table></div></section><PublicFooter locale={locale}/>
  </main>;
}
