import Link from "next/link";
import { redirect } from "next/navigation";
import { signOutAllAction } from "@/app/auth/actions";
import { signOut } from "@/app/dashboard/actions";
import { AccountSecurity } from "@/components/auth/account-security";
import { LearnerNav } from "@/components/learner-nav";
import { getUserAuthMethods } from "@/lib/auth/service";
import { getCurrentUser } from "@/lib/auth/session";
import { getPremiumAccount } from "@/lib/premium/presentation";
import { PremiumStatusCard } from "@/components/premium/premium-status-card";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { PreferencesForm } from "./preferences-form";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { saveRankingVisibility } from "./actions";

export default async function SettingsPage() {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in");
  const [preferences, methods, account, [ranking]] = await Promise.all([getPreferences(user.id), getUserAuthMethods(user.id), getPremiumAccount(user.id,user.email), db.select({ visibility: profiles.rankingVisibility }).from(profiles).where(eq(profiles.id, user.id)).limit(1)]); const plan=account.isPremium?"PREMIUM":"FREE";
  const t = getTranslations(preferences.interfaceLanguage); const vi = preferences.interfaceLanguage === "vi";
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl"><LearnerNav locale={preferences.interfaceLanguage} /><div className="mx-auto mt-10 grid max-w-2xl gap-6"><PremiumStatusCard compact expiresAt={account.expiresAt} isPremium={account.isPremium} locale={preferences.interfaceLanguage}/>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9"><p className="text-sm font-bold uppercase text-teal-700">{t.settings.eyebrow}</p><h1 className="mt-2 text-3xl font-black">{t.settings.title}</h1><p className="mt-3 text-slate-600">{t.settings.intro}</p><PreferencesForm preferences={preferences} t={t} /></section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9"><h2 className="text-xl font-black">{vi ? "Tài khoản" : "Account"}</h2><p className="mt-3 text-sm text-slate-500">{vi ? "Email đăng nhập" : "Sign-in email"}</p><p className="mt-1 break-all font-semibold">{user.email}</p><div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="font-bold">{vi ? "Gói hiện tại" : "Current plan"}: {plan === "PREMIUM" ? "Premium" : "Free"}</p><Link className="mt-2 inline-flex font-bold text-teal-700" href="/pricing">{vi ? "Xem chi tiết gói" : "View plan details"}</Link></div><div className="mt-4 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-slate-100 px-3 py-1">Google: {methods.google ? "Connected" : "Not connected"}</span><span className="rounded-full bg-slate-100 px-3 py-1">Password: {methods.password ? "Enabled" : "Not enabled"}</span></div>{!methods.google ? <a className="mt-4 inline-flex rounded-lg border border-teal-700 px-4 py-2 font-bold text-teal-800" href="/api/auth/google?mode=link&next=/settings">{vi ? "Kết nối Google" : "Connect Google"}</a> : null}<AccountSecurity hasPassword={methods.password} vi={vi} /><div className="mt-6 flex flex-wrap gap-3"><form action={signOut}><button className="min-h-11 rounded-xl border border-red-200 px-5 font-bold text-red-700">{t.navigation.signOut}</button></form><form action={signOutAllAction}><button className="min-h-11 rounded-xl border border-slate-300 px-5 font-bold">{vi ? "Đăng xuất mọi thiết bị" : "Sign out all devices"}</button></form></div></section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9"><h2 className="text-xl font-black">{vi?"Quyền riêng tư xếp hạng":"Ranking privacy"}</h2><p className="mt-2 text-slate-600">{vi?"Công khai hiển thị tên; Ẩn danh vẫn tham gia; Ẩn hoàn toàn không xuất hiện trên bảng công khai.":"Public shows your name; Anonymous still participates; Hidden excludes you from public rankings."}</p><form action={saveRankingVisibility} className="mt-5 grid gap-3">{[["PUBLIC",vi?"Công khai":"Public"],["ANONYMOUS",vi?"Ẩn danh":"Anonymous"],["HIDDEN",vi?"Ẩn hoàn toàn":"Hidden"]].map(([value,label])=><label className="flex min-h-11 items-center gap-3 rounded-xl border p-3" key={value}><input defaultChecked={ranking?.visibility===value} name="visibility" type="radio" value={value}/><span className="font-semibold">{label}</span></label>)}<button className="min-h-11 rounded-xl bg-slate-900 px-5 font-bold text-white">{vi?"Lưu quyền riêng tư":"Save privacy"}</button></form></section>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9"><h2 className="text-xl font-black">{vi?"Gói Premium":"Premium plan"}</h2><p className="mt-2 text-slate-600">{vi?"Xem ngày hết hạn và lịch sử thanh toán an toàn.":"View expiry and secure billing history."}</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-5 font-bold text-white" href="/billing">{vi?"Mở trang thanh toán":"Open billing"}</Link></section>
  </div></div></main>;
}
