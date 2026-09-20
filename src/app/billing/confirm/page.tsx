import Link from "next/link";
import { notFound } from "next/navigation";
import { createCheckoutAction } from "../actions";
import { requireUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getRenewalQuote } from "@/lib/payments/service";

export default async function RenewalConfirmationPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const user = await requireUser();
  const [prefs, params] = await Promise.all([getPreferences(user.id), searchParams]);
  let quote; try { quote = await getRenewalQuote(user.id, params.product ?? ""); } catch { notFound(); }
  const vi = prefs.interfaceLanguage === "vi";
  const formatDate = (date: Date) => date.toLocaleDateString(vi ? "vi-VN" : "en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-4 text-slate-900"><section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <p className="text-xs font-black uppercase tracking-[.18em] text-teal-700">Premium</p><h1 className="mt-2 text-2xl font-black">{vi ? `Gia hạn Premium ${quote!.durationDays} ngày` : `Add ${quote!.durationDays} days of Premium`}</h1>
    <dl className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm">{quote!.currentExpiry ? <div><dt className="text-slate-500">{vi ? "Hiện tại hết hạn" : "Current expiry"}</dt><dd className="mt-1 font-bold">{formatDate(quote!.currentExpiry)}</dd></div> : null}<div><dt className="text-slate-500">{vi ? "Sau khi thanh toán thành công" : "After confirmed payment"}</dt><dd className="mt-1 font-bold">{formatDate(quote!.resultingExpiry)}</dd></div><div><dt className="text-slate-500">{vi ? "Tổng thanh toán" : "Total"}</dt><dd className="mt-1 text-xl font-black">{new Intl.NumberFormat("vi-VN").format(quote!.amount)} ₫</dd></div></dl>
    <p className="mt-5 text-sm font-semibold text-slate-700">{vi ? "Thanh toán một lần · Không tự động gia hạn" : "One-time payment · No automatic renewal"}</p><p className="mt-2 text-xs text-slate-500">{vi ? "Ngày hết hạn trên đây là dự kiến tại thời điểm xem; thời điểm xác nhận thanh toán quyết định ngày thực tế." : "Expiry is estimated at quote time; the confirmed payment determines the actual expiry."}</p>{quote!.currentExpiry ? <p className="mt-2 text-sm text-slate-600">{vi ? "Thời gian mới sẽ được cộng sau ngày hết hạn hiện tại." : "New time is added after your current expiry date."}</p> : null}
    <form action={createCheckoutAction} className="mt-6"><input name="productKey" type="hidden" value={quote!.productKey}/><button className="min-h-12 w-full rounded-xl bg-teal-800 px-5 font-bold text-white">{vi ? "Tiếp tục thanh toán" : "Continue to payment"}</button></form><Link className="mt-4 flex min-h-11 items-center justify-center font-bold text-teal-800" href="/billing">{vi ? "Quay lại" : "Back"}</Link>
  </section></main>;
}
