import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { signOut } from "@/app/dashboard/actions";
import { AccountSecurity } from "@/components/auth/account-security";
import { LearnerNav } from "@/components/learner-nav";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getUserAuthMethods } from "@/lib/auth/service";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { getLearnerGoal } from "@/lib/goals/service";
import { getPremiumAccount } from "@/lib/premium/presentation";
import { saveDisplayName, saveRankingVisibility, signOutOtherSessions } from "./actions";
import { PreferencesForm } from "./preferences-form";
import { GoalForm } from "./goal-form";

const sections = ["profile", "goal", "language", "security", "privacy", "plan"] as const;
type Section = (typeof sections)[number];
const button = "inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const { section } = await searchParams;
  const active: Section = sections.includes(section as Section) ? section as Section : "profile";
  const [preferences, methods, account, [profile], goalResult] = await Promise.all([
    getPreferences(user.id), getUserAuthMethods(user.id), getPremiumAccount(user.id, user.email),
    db.select({ fullName: profiles.fullName, visibility: profiles.rankingVisibility }).from(profiles).where(eq(profiles.id, user.id)).limit(1),
    getLearnerGoal(user.id).then(goal => ({ goal, error: false as const })).catch(() => ({ goal: null, error: true as const })),
  ]);
  const goal = goalResult.goal;
  const t = getTranslations(preferences.interfaceLanguage);
  const vi = preferences.interfaceLanguage === "vi";
  const labels: Record<Section, string> = {
    goal: vi ? "Mục tiêu học tập" : "Learning goal",
    profile: vi ? "Hồ sơ" : "Profile",
    language: vi ? "Ngôn ngữ" : "Language",
    security: vi ? "Tài khoản & bảo mật" : "Account & security",
    privacy: vi ? "Quyền riêng tư" : "Privacy",
    plan: vi ? "Gói & thanh toán" : "Plan & billing",
  };
  const name = profile?.fullName?.trim() || user.email.split("@")[0];
  const initials = name.split(/\s+/).map(part => part[0]).slice(-2).join("").toUpperCase();
  const summary: Record<Section, string> = {
    goal: goal?.targetScore ? `${vi ? "Mục tiêu TOEIC" : "Target TOEIC"} ${goal.targetScore}` : (vi ? "Chưa thiết lập" : "Not set"),
    profile: `${name} · ${user.email}`,
    language: `${preferences.interfaceLanguage === "vi" ? "Tiếng Việt" : "English"} · ${preferences.explanationLanguage === "both" ? "EN + VI" : preferences.explanationLanguage.toUpperCase()}`,
    security: vi ? "Email, Google, mật khẩu và phiên đăng nhập" : "Email, Google, password and sessions",
    privacy: profile?.visibility === "PUBLIC" ? (vi ? "Công khai" : "Public") : profile?.visibility === "HIDDEN" ? (vi ? "Không tham gia" : "Hidden") : (vi ? "Ẩn danh" : "Anonymous"),
    plan: account.isPremium ? "Premium" : "Free",
  };
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-8"><div className="mx-auto max-w-6xl">
    <LearnerNav locale={preferences.interfaceLanguage} />
    <header className="mt-7 sm:mt-10"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">TOEICGym</p><h1 className="mt-1 text-3xl font-black">{t.settings.title}</h1><p className="mt-2 text-sm text-slate-600">{vi ? "Quản lý hồ sơ, lựa chọn học tập và tài khoản của bạn." : "Manage your profile, learning choices and account."}</p></header>
    <div className="mt-7 grid gap-7 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)]">
      <nav aria-label={vi ? "Các mục cài đặt" : "Settings sections"} className="hidden self-start md:sticky md:top-6 md:block"><div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">{sections.map(key => <Link aria-current={active === key ? "page" : undefined} className={`block rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-teal-700 ${active === key ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-50"}`} href={`/settings?section=${key}`} key={key}>{labels[key]}</Link>)}</div></nav>
      <div className="min-w-0 max-w-3xl">
        <nav aria-label={vi ? "Các mục cài đặt" : "Settings sections"} className={`grid gap-2 md:hidden ${section ? "hidden" : ""}`}>{sections.map(key => <Link className="flex min-h-18 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm focus-visible:outline-2 focus-visible:outline-teal-700" href={`/settings?section=${key}`} key={key}><span className="min-w-0"><span className="block font-bold">{labels[key]}</span><span className="mt-1 block truncate text-sm text-slate-500">{summary[key]}</span></span><span aria-hidden className="text-xl text-slate-400">›</span></Link>)}</nav>
        <div className={section ? "md:block" : "hidden md:block"}><Link className="mb-4 inline-flex min-h-11 items-center font-semibold text-teal-800 md:hidden" href="/settings">← {vi ? "Tất cả cài đặt" : "All settings"}</Link>
          <section aria-labelledby="section-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="text-2xl font-black" id="section-title">{labels[active]}</h2>
            {active === "profile" && <div className="mt-6"><div className="flex items-center gap-4"><div aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xl font-black text-teal-800">{initials}</div><div className="min-w-0"><p className="truncate text-lg font-bold">{name}</p><p className="break-all text-sm text-slate-500">{user.email}</p></div></div><form action={saveDisplayName} className="mt-7 max-w-md"><label className="block text-sm font-semibold" htmlFor="displayName">{vi ? "Tên hiển thị" : "Display name"}</label><input className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3" defaultValue={profile?.fullName ?? ""} id="displayName" maxLength={80} minLength={2} name="displayName" required /><p className="mt-2 text-xs text-slate-500">{vi ? "Tên này chỉ xuất hiện trên bảng xếp hạng khi bạn chọn Công khai." : "This name appears on rankings only when you choose Public."}</p><button className={`${button} mt-4`} type="submit">{vi ? "Lưu tên" : "Save name"}</button></form></div>}
            {active === "goal" && (goalResult.error ? <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{vi ? "Không thể tải mục tiêu học tập. Vui lòng tải lại trang." : "We couldn't load your learning goal. Please reload the page."}</p> : <GoalForm goal={goal} locale={preferences.interfaceLanguage} />)}
            {active === "language" && <PreferencesForm preferences={preferences} t={t} />}
            {active === "security" && <div className="mt-6 space-y-7"><div><h3 className="font-bold">{vi ? "Email đăng nhập" : "Sign-in email"}</h3><p className="mt-1 break-all text-sm text-slate-600">{user.email}</p></div><div className="border-t border-slate-100 pt-6"><h3 className="font-bold">{vi ? "Phương thức đăng nhập" : "Sign-in methods"}</h3><div className="mt-4 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">Google</p><p className="text-sm text-slate-500">{methods.google ? (vi ? "Đã liên kết" : "Connected") : (vi ? "Chưa liên kết" : "Not connected")}</p></div>{!methods.google && <a className={button} href="/api/auth/google?mode=link&next=/settings?section=security">{vi ? "Liên kết" : "Connect"}</a>}</div><div><p className="font-semibold">{vi ? "Mật khẩu" : "Password"}</p><p className="text-sm text-slate-500">{methods.password ? (vi ? "Đã thiết lập" : "Enabled") : (vi ? "Chưa thiết lập" : "Not set")}</p></div></div><AccountSecurity hasPassword={methods.password} vi={vi} /></div><div className="border-t border-slate-100 pt-6"><h3 className="font-bold">{vi ? "Phiên đăng nhập" : "Sessions"}</h3><p className="mt-2 text-sm text-slate-600">{vi ? "Bạn đang dùng phiên này. Bạn có thể đăng xuất các phiên khác mà vẫn tiếp tục ở đây." : "This session is active. You can sign out other sessions and stay signed in here."}</p><form action={signOutOtherSessions} className="mt-4"><button className={button}>{vi ? "Đăng xuất khỏi thiết bị khác" : "Sign out other devices"}</button></form></div><div className="border-t border-slate-100 pt-6"><form action={signOut}><button className={button}>{t.navigation.signOut}</button></form></div></div>}
            {active === "privacy" && <form action={saveRankingVisibility} className="mt-6"><fieldset><legend className="font-bold">{vi ? "Hiển thị trên bảng xếp hạng" : "Ranking visibility"}</legend><div className="mt-4 space-y-2">{([["PUBLIC", vi ? "Công khai" : "Public", vi ? "Hiển thị tên của bạn." : "Show your name."], ["ANONYMOUS", vi ? "Ẩn danh" : "Anonymous", vi ? "Vẫn tham gia nhưng không hiển thị tên." : "Participate without showing your name."], ["HIDDEN", vi ? "Không tham gia" : "Hidden", vi ? "Không xuất hiện trên bảng xếp hạng công khai." : "Do not appear on public rankings."]] as const).map(([value, label, help]) => <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 has-checked:border-teal-600 has-checked:bg-teal-50" key={value}><input defaultChecked={(profile?.visibility ?? "ANONYMOUS") === value} name="visibility" type="radio" value={value} /><span><span className="block font-semibold">{label}</span><span className="block text-sm text-slate-600">{help}</span></span></label>)}</div></fieldset><button className={`${button} mt-5`}>{vi ? "Lưu quyền riêng tư" : "Save privacy"}</button></form>}
            {active === "plan" && <div className="mt-6"><p className="text-sm font-semibold text-slate-500">{vi ? "Gói hiện tại" : "Current plan"}</p><p className="mt-1 text-3xl font-black">{account.isPremium ? "Premium" : "Free"}</p>{account.isPremium && account.expiresAt ? <p className="mt-2 text-sm text-slate-600">{vi ? "Hết hạn" : "Expires"}: {account.expiresAt.toLocaleDateString(vi ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh" })}</p> : <p className="mt-2 text-sm text-slate-600">{account.lifecycle === "EXPIRED" ? (vi ? "Premium đã hết hạn. Bạn đang dùng gói Free." : "Premium has expired. You are on Free.") : (vi ? "Bạn đang sử dụng gói Free." : "You are using Free.")}</p>}<div className="mt-6 flex flex-wrap gap-3"><Link className={button} href="/billing">{account.isPremium ? (vi ? "Quản lý gói" : "Manage plan") : (vi ? "Xem Premium" : "Explore Premium")}</Link><Link className={button} href="/billing#payment-history">{vi ? "Lịch sử thanh toán" : "Payment history"}</Link></div></div>}
          </section>
        </div>
      </div>
    </div>
  </div></main>;
}
