import Link from "next/link";
import { LearnerNav } from "@/components/learner-nav";
import { PremiumStatusCard } from "@/components/premium/premium-status-card";
import { requireUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getPaymentCatalog } from "@/lib/payments/catalog";
import { listUserOrders } from "@/lib/payments/service";
import { getPremiumAccount, premiumCopy } from "@/lib/premium/presentation";
import { createCheckoutAction } from "./actions";

const money=(value:number)=>new Intl.NumberFormat("vi-VN").format(value)+" ₫";
export default async function BillingPage({searchParams}:{searchParams:Promise<{error?:string}>}) {
  const user=await requireUser();
  const [prefs,account,orders]=await Promise.all([getPreferences(user.id),getPremiumAccount(user.id,user.email),listUserOrders(user.id)]);
  const vi=prefs.interfaceLanguage==="vi",copy=premiumCopy(prefs.interfaceLanguage),error=(await searchParams).error;
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl"><LearnerNav locale={prefs.interfaceLanguage}/><div className="mt-8 grid gap-6">
    <header><p className="text-sm font-black uppercase tracking-wider text-teal-700">TOEICGym</p><h1 className="mt-2 text-3xl font-black">{vi?"Thanh toán và gói":"Billing & plan"}</h1></header>
    <PremiumStatusCard expiresAt={account.expiresAt} isPremium={account.isPremium} locale={prefs.interfaceLanguage}/>
    {error?<p className="rounded-xl bg-amber-50 p-3" role="alert">{vi?"Thanh toán hiện không khả dụng.":"Payment is unavailable."}</p>:null}
    <section aria-labelledby="products-heading"><h2 className="text-2xl font-black" id="products-heading">{account.isPremium?copy.extend:(vi?"Nâng cấp Premium":"Upgrade to Premium")}</h2><p className="mt-2 text-slate-600">{vi?"Mua thêm thời hạn cố định; không tự động gia hạn.":"Add a fixed-duration period; no automatic renewal."}</p><div className="mt-4 grid gap-4 sm:grid-cols-3">{getPaymentCatalog().map(p=><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={p.key}><h3 className="text-xl font-black">{p.days} {vi?"ngày":"days"}</h3><p className="mt-2 font-bold">{p.amountVnd?money(p.amountVnd):(vi?"Chưa mở bán":"Not available")}</p>{p.purchasable?<form action={createCheckoutAction} className="mt-4"><input name="productKey" type="hidden" value={p.key}/><button className="min-h-11 w-full rounded-xl bg-slate-900 px-4 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600">{account.isPremium?copy.extend:(vi?"Thanh toán ngay":"Pay now")}</button></form>:<p className="mt-4 text-sm font-semibold text-slate-500">{vi?"Chưa mở bán":"Payment unavailable"}</p>}</article>)}</div></section>
    <section className="rounded-3xl border bg-white p-6"><h2 className="text-xl font-black">{vi?"Lịch sử thanh toán":"Billing history"}</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[40rem] text-left text-sm"><thead><tr><th className="p-3">{vi?"Sản phẩm":"Product"}</th><th className="p-3">{vi?"Số tiền":"Amount"}</th><th className="p-3">{vi?"Trạng thái":"Status"}</th><th className="p-3">{vi?"Tạo lúc":"Created"}</th><th className="p-3">{vi?"Thanh toán lúc":"Paid"}</th></tr></thead><tbody>{orders.map(o=><tr className="border-t" key={o.id}><td className="p-3"><Link className="font-bold text-teal-700" href={`/billing/return?order=${o.id}`}>{o.productKey}</Link></td><td className="p-3">{money(o.amount)}</td><td className="p-3">{o.status}</td><td className="p-3">{o.createdAt.toLocaleString()}</td><td className="p-3">{o.paidAt?.toLocaleString()??"—"}</td></tr>)}</tbody></table></div></section>
  </div></div></main>;
}
