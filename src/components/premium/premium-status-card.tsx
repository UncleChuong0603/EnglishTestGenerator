import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { premiumCopy } from "@/lib/premium/presentation";
import { PremiumBadge } from "./premium-badge";

export function PremiumStatusCard({ locale, isPremium, expiresAt, compact = false }: { locale: InterfaceLanguage; isPremium: boolean; expiresAt: Date | null; compact?: boolean }) {
  const copy=premiumCopy(locale); const date=expiresAt?.toLocaleDateString(locale==="vi"?"vi-VN":"en-US",{year:"numeric",month:"long",day:"numeric",timeZone:"Asia/Ho_Chi_Minh"});
  if(!isPremium)return <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-black">{copy.free}</h2><p className="mt-2 text-sm text-slate-600">{copy.freeBody}</p><Link className="mt-4 inline-flex font-bold text-teal-700" href="/pricing">{locale==="vi"?"Khám phá Premium":"Explore Premium"}</Link></section>;
  return <section className={`rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-sm ${compact?"p-4":"p-6"}`} data-premium-status="active"><div className="flex flex-wrap items-center gap-3"><PremiumBadge/><strong className="text-amber-950">{copy.active}</strong></div>{!compact?<h2 className="mt-4 text-2xl font-black text-slate-950">{copy.member}</h2>:null}{date?<p className="mt-2 text-sm text-slate-700">{copy.expires}: <strong>{date}</strong></p>:null}<Link className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-4 font-bold text-white" href="/billing">{copy.manage}</Link></section>;
}
