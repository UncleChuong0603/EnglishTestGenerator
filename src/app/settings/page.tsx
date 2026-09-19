import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { signOutAllAction } from "@/app/auth/actions";
import { signOut } from "@/app/dashboard/actions";
import { AccountSecurity } from "@/components/auth/account-security";
import { LearnerNav } from "@/components/learner-nav";
import { PremiumStatusCard } from "@/components/premium/premium-status-card";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getUserAuthMethods } from "@/lib/auth/service";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { getPremiumAccount } from "@/lib/premium/presentation";
import { saveRankingVisibility } from "./actions";
import { PreferencesForm } from "./preferences-form";

const sectionClass = "group rounded-2xl border border-slate-200 bg-white sm:rounded-3xl sm:[&>div]:block";
const summaryClass = "flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 p-5 text-lg font-black sm:p-6";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const [preferences, methods, account, [ranking]] = await Promise.all([
    getPreferences(user.id), getUserAuthMethods(user.id), getPremiumAccount(user.id, user.email),
    db.select({ visibility: profiles.rankingVisibility }).from(profiles).where(eq(profiles.id, user.id)).limit(1),
  ]);
  const t = getTranslations(preferences.interfaceLanguage);
  const vi = preferences.interfaceLanguage === "vi";
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl">
    <LearnerNav locale={preferences.interfaceLanguage} />
    <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:mt-10 sm:gap-6">
      <header><p className="text-sm font-bold uppercase text-teal-700">{t.settings.eyebrow}</p><h1 className="mt-1 text-3xl font-black">{t.settings.title}</h1><p className="mt-2 text-sm text-slate-600">{t.settings.intro}</p></header>
      <PremiumStatusCard compact expiresAt={account.expiresAt} isPremium={account.isPremium} locale={preferences.interfaceLanguage} />
      <details className={sectionClass} open><summary className={summaryClass}>{vi ? "Ngôn ngữ" : "Languages"}<span aria-hidden className="text-slate-400 sm:hidden">⌄</span></summary><div className="border-t border-slate-100 p-5 pt-0 sm:p-6 sm:pt-0"><PreferencesForm preferences={preferences} t={t} /></div></details>
      <details className={sectionClass}><summary className={summaryClass}>{vi ? "Tài khoản" : "Account"}<span aria-hidden className="text-slate-400">⌄</span></summary><div className="border-t border-slate-100 p-5 sm:p-6"><p className="text-sm text-slate-500">{vi ? "Email đăng nhập" : "Sign-in email"}</p><p className="mt-1 break-all font-semibold">{user.email}</p><p className="mt-4 font-bold">{vi ? "Gói hiện tại" : "Current plan"}: {account.isPremium ? "Premium" : "Free"}</p><Link className="mt-2 inline-flex min-h-11 items-center font-bold text-teal-700" href="/pricing">{vi ? "Xem chi tiết gói" : "View plan details"}</Link><form action={signOut} className="mt-5 border-t border-slate-100 pt-4"><button className="min-h-11 rounded-xl border border-slate-300 px-5 font-bold">{t.navigation.signOut}</button></form></div></details>
      <details className={sectionClass}><summary className={summaryClass}>{vi ? "Quyền riêng tư / Xếp hạng" : "Privacy / Ranking"}<span aria-hidden className="text-slate-400">⌄</span></summary><div className="border-t border-slate-100 p-5 sm:p-6"><p className="text-sm leading-6 text-slate-600">{vi ? "Công khai hiển thị tên; Ẩn danh vẫn tham gia; Ẩn hoàn toàn không xuất hiện trên bảng công khai." : "Public shows your name; Anonymous still participates; Hidden excludes you from public rankings."}</p><form action={saveRankingVisibility} className="mt-4 grid gap-3">{[["PUBLIC", vi ? "Công khai" : "Public"], ["ANONYMOUS", vi ? "Ẩn danh" : "Anonymous"], ["HIDDEN", vi ? "Ẩn hoàn toàn" : "Hidden"]].map(([value, label]) => <label className="flex min-h-11 items-center gap-3 rounded-xl border p-3 has-checked:border-teal-600 has-checked:bg-teal-50" key={value}><input defaultChecked={ranking?.visibility === value} name="visibility" type="radio" value={value} /><span className="font-semibold">{label}</span></label>)}<button className="min-h-12 rounded-xl bg-slate-900 px-5 font-bold text-white">{vi ? "Lưu quyền riêng tư" : "Save privacy"}</button></form></div></details>
      <details className={sectionClass}><summary className={summaryClass}>{vi ? "Bảo mật / Phương thức đăng nhập" : "Security / Login methods"}<span aria-hidden className="text-slate-400">⌄</span></summary><div className="border-t border-slate-100 p-5 sm:p-6"><div className="flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-slate-100 px-3 py-1">Google: {methods.google ? "Connected" : "Not connected"}</span><span className="rounded-full bg-slate-100 px-3 py-1">Password: {methods.password ? "Enabled" : "Not enabled"}</span></div>{!methods.google && <a className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-teal-700 px-4 font-bold text-teal-800" href="/api/auth/google?mode=link&next=/settings">{vi ? "Kết nối Google" : "Connect Google"}</a>}<AccountSecurity hasPassword={methods.password} vi={vi} /><div className="mt-6 border-t border-red-200 pt-5"><p className="mb-3 text-sm font-bold text-red-700">{vi ? "Phiên đăng nhập" : "Sessions"}</p><form action={signOutAllAction}><button className="min-h-11 rounded-xl border border-red-200 px-5 font-bold text-red-700">{vi ? "Đăng xuất mọi thiết bị" : "Sign out all devices"}</button></form></div></div></details>
      <section className={`${sectionClass} p-5 sm:p-6`}><h2 className="text-lg font-black">{vi ? "Premium / Thanh toán" : "Premium / Billing"}</h2><p className="mt-2 text-sm text-slate-600">{vi ? "Xem ngày hết hạn và lịch sử thanh toán." : "View expiry and billing history."}</p><Link className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-5 font-bold text-white" href="/billing">{vi ? "Mở trang thanh toán" : "Open billing"}</Link></section>
    </div>
  </div></main>;
}
