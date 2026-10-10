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
import { getLearnerGoal } from "@/lib/goals/service";
import { getPreferences, getTranslations } from "@/lib/i18n/get-translations";
import { getPremiumAccount } from "@/lib/premium/presentation";
import { AccountDataPanel } from "./account-data-panel";
import {
  saveDisplayName,
  saveRankingVisibility,
  signOutOtherSessions,
} from "./actions";
import { AvatarForm } from "./avatar-form";
import { GoalForm } from "./goal-form";
import { LearningEmailForm } from "./learning-email-form";
import { PreferencesForm } from "./preferences-form";
import { SettingsIcon } from "./settings-icon";

const sections = [
  "profile",
  "goal",
  "language",
  "email",
  "security",
  "privacy",
  "data",
  "plan",
] as const;
type Section = (typeof sections)[number];

const sectionGroups: readonly (readonly Section[])[] = [
  ["profile", "goal", "language", "email"],
  ["security", "privacy", "data", "plan"],
];

const secondaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#aebcb2] bg-white px-4 py-2 font-semibold text-[#294838] transition-colors hover:border-[#708c79] hover:bg-[#f3f8f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]";
const primaryButton =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-[#245a43] px-5 py-3 font-bold text-white transition-colors hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]";
const subcard = "rounded-2xl border border-[#dce3d9] bg-[#fbfcfa] p-4 sm:p-5";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  const { section } = await searchParams;
  const active: Section = sections.includes(section as Section)
    ? (section as Section)
    : "profile";

  const [preferences, methods, account, [profile], goalResult] = await Promise.all([
    getPreferences(user.id),
    getUserAuthMethods(user.id),
    getPremiumAccount(user.id, user.email),
    db
      .select({
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        visibility: profiles.rankingVisibility,
        learningEmailEnabled: profiles.learningEmailEnabled,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1),
    getLearnerGoal(user.id)
      .then((goal) => ({ goal, error: false as const }))
      .catch(() => ({ goal: null, error: true as const })),
  ]);

  const goal = goalResult.goal;
  const t = getTranslations(preferences.interfaceLanguage);
  const vi = preferences.interfaceLanguage === "vi";
  const labels: Record<Section, string> = {
    profile: vi ? "Hồ sơ" : "Profile",
    goal: vi ? "Mục tiêu học tập" : "Learning goal",
    language: vi ? "Ngôn ngữ" : "Language",
    email: vi ? "Email học tập" : "Learning email",
    security: vi ? "Tài khoản & bảo mật" : "Account & security",
    privacy: vi ? "Quyền riêng tư" : "Privacy",
    data: vi ? "Tài khoản & dữ liệu" : "Account & data",
    plan: vi ? "Gói & thanh toán" : "Plan & billing",
  };
  const descriptions: Record<Section, string> = {
    profile: vi ? "Cách tên và ảnh của bạn hiển thị trong TOEIC GYM." : "How your name and photo appear in TOEIC GYM.",
    goal: vi ? "Đặt đích đến và nhịp học phù hợp với lịch của bạn." : "Set a target and a study rhythm that fits your schedule.",
    language: vi ? "Chọn ngôn ngữ giao diện và phần giải thích bài học." : "Choose the interface and explanation languages.",
    email: vi ? "Kiểm soát báo cáo tuần và lời nhắc học hữu ích." : "Control weekly reports and useful study reminders.",
    security: vi ? "Quản lý cách đăng nhập, mật khẩu và các phiên đang hoạt động." : "Manage sign-in methods, password and active sessions.",
    privacy: vi ? "Quyết định cách bạn xuất hiện trên bảng xếp hạng." : "Decide how you appear on public rankings.",
    data: vi ? "Tải bản sao dữ liệu hoặc xóa tài khoản của bạn." : "Download a copy of your data or delete your account.",
    plan: vi ? "Xem trạng thái Premium và lịch sử thanh toán." : "Review Premium status and payment history.",
  };
  const name = profile?.fullName?.trim() || user.email.split("@")[0];
  const rankingVisibility = profile?.visibility ?? "PUBLIC";
  const summary: Record<Section, string> = {
    profile: `${name} · ${user.email}`,
    goal: goal?.targetScore ? `${vi ? "TOEIC mục tiêu" : "TOEIC target"} ${goal.targetScore}` : vi ? "Chưa thiết lập" : "Not set",
    language: `${preferences.interfaceLanguage === "vi" ? "Tiếng Việt" : "English"} · ${preferences.explanationLanguage === "both" ? "EN + VI" : preferences.explanationLanguage.toUpperCase()}`,
    email: profile?.learningEmailEnabled ? (vi ? "Đang bật" : "On") : (vi ? "Đang tắt" : "Off"),
    security: methods.google && methods.password ? (vi ? "Google và mật khẩu" : "Google and password") : methods.google ? "Google" : vi ? "Mật khẩu" : "Password",
    privacy: rankingVisibility === "PUBLIC" ? (vi ? "Công khai" : "Public") : rankingVisibility === "HIDDEN" ? (vi ? "Không tham gia" : "Hidden") : (vi ? "Ẩn danh" : "Anonymous"),
    data: vi ? "Xuất hoặc xóa dữ liệu" : "Export or delete data",
    plan: account.isTrial ? (vi ? "Premium dùng thử" : "Premium trial") : account.isPremium ? "Premium" : "Free",
  };

  const planName = account.isTrial
    ? vi ? "Premium dùng thử" : "Premium trial"
    : account.isPremium ? "Premium" : "Free";

  return (
    <main className="min-h-dvh bg-[#f7f6f1] px-4 pb-28 pt-5 text-[#172821] sm:px-6 sm:pt-7 lg:pb-10">
      <div className="mx-auto max-w-7xl">
        <LearnerNav locale={preferences.interfaceLanguage} />

        <header className="max-w-3xl pt-5 sm:pt-8">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#547060]">{vi ? "Tài khoản của bạn" : "Your account"}</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] sm:text-4xl">{t.settings.title}</h1>
          <p className="mt-3 text-base leading-7 text-[#52645a]">
            {vi ? "Cập nhật trải nghiệm học, thông tin cá nhân và quyền kiểm soát tài khoản tại một nơi." : "Update your learning experience, personal details and account controls in one place."}
          </p>
        </header>

        <div className="mt-8 grid gap-8 xl:grid-cols-[15rem_minmax(0,1fr)]">
          <nav aria-label={vi ? "Các mục cài đặt" : "Settings sections"} className="hidden self-start xl:sticky xl:top-6 xl:block">
            <div className="rounded-2xl border border-[#dce3d9] bg-white p-2">
              {sectionGroups.map((group, groupIndex) => (
                <div className={groupIndex ? "mt-2 border-t border-[#edf1eb] pt-2" : ""} key={groupIndex}>
                  <p className="px-3 pb-1 pt-2 text-[.68rem] font-black uppercase tracking-[.14em] text-[#6d7d73]">
                    {groupIndex === 0 ? (vi ? "Học tập & hồ sơ" : "Learning & profile") : (vi ? "Tài khoản" : "Account")}
                  </p>
                  {group.map((key) => (
                    <Link
                      aria-current={active === key ? "page" : undefined}
                      className={`mt-1 flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#245a43] ${active === key ? "bg-[#e7eee8] text-[#183e2b]" : "text-[#52645a] hover:bg-[#f3f6f2] hover:text-[#172821]"}`}
                      href={`/settings?section=${key}`}
                      key={key}
                    >
                      <SettingsIcon className="size-[1.125rem] shrink-0" name={key} />
                      <span>{labels[key]}</span>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </nav>

          <div className="min-w-0 max-w-4xl">
            <nav aria-label={vi ? "Các mục cài đặt" : "Settings sections"} className={`grid gap-3 xl:hidden ${section ? "hidden" : ""}`}>
              {sectionGroups.map((group, groupIndex) => (
                <section aria-labelledby={`settings-group-${groupIndex}`} className="overflow-hidden rounded-2xl border border-[#dce3d9] bg-white" key={groupIndex}>
                  <h2 className="border-b border-[#edf1eb] bg-[#fbfcfa] px-5 py-3 text-xs font-black uppercase tracking-[.14em] text-[#6d7d73]" id={`settings-group-${groupIndex}`}>
                    {groupIndex === 0 ? (vi ? "Học tập & hồ sơ" : "Learning & profile") : (vi ? "Tài khoản" : "Account")}
                  </h2>
                  {group.map((key, index) => (
                    <Link className={`flex min-h-[4.75rem] min-w-0 items-center gap-4 px-4 py-3 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#245a43] sm:px-5 ${index ? "border-t border-[#edf1eb]" : ""}`} href={`/settings?section=${key}`} key={key}>
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef3eb] text-[#245a43]"><SettingsIcon name={key} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{labels[key]}</span>
                        <span className="mt-1 block truncate text-sm text-[#66776d]">{summary[key]}</span>
                      </span>
                      <SettingsIcon className="size-5 shrink-0 text-[#819087]" name="chevron" />
                    </Link>
                  ))}
                </section>
              ))}
            </nav>

            <div className={section ? "block" : "hidden xl:block"}>
              <Link className="mb-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[#245a43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43] xl:hidden" href="/settings">
                <SettingsIcon className="size-5" name="back" />
                {vi ? "Tất cả cài đặt" : "All settings"}
              </Link>

              <section aria-labelledby="section-title" className="overflow-hidden rounded-3xl border border-[#dce3d9] bg-white">
                <header className="border-b border-[#edf1eb] px-5 py-6 sm:px-8 sm:py-7">
                  <div className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7eee8] text-[#245a43]"><SettingsIcon name={active} /></span>
                    <div>
                      <h2 className="text-2xl font-black tracking-[-.02em] sm:text-[1.7rem]" id="section-title">{labels[active]}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52645a]">{descriptions[active]}</p>
                    </div>
                  </div>
                </header>

                <div className="px-5 py-6 sm:px-8 sm:py-8">
                  {active === "profile" && (
                    <div>
                      <AvatarForm avatarUrl={profile?.avatarUrl ?? null} email={user.email} locale={preferences.interfaceLanguage} name={name} />
                      <form action={saveDisplayName} className="mt-8 border-t border-[#edf1eb] pt-7">
                        <div className="max-w-lg">
                          <label className="block font-bold" htmlFor="displayName">{vi ? "Tên hiển thị" : "Display name"}</label>
                          <p className="mt-1 text-sm leading-6 text-[#52645a]">{vi ? "Tên này được dùng trong hồ sơ và chỉ hiện trên bảng xếp hạng khi bạn chọn Công khai." : "This name is used in your profile and appears on rankings only when you choose Public."}</p>
                          <input autoComplete="name" className="mt-3 min-h-12 w-full rounded-xl border border-[#aebcb2] px-4 text-base outline-none focus:border-[#245a43] focus:ring-2 focus:ring-[#245a43]/20" defaultValue={profile?.fullName ?? ""} id="displayName" maxLength={80} minLength={2} name="displayName" required />
                          <button className={`${primaryButton} mt-4`} type="submit">{vi ? "Lưu tên hiển thị" : "Save display name"}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  {active === "goal" && (goalResult.error ? (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">{vi ? "Không thể tải mục tiêu học tập. Vui lòng tải lại trang." : "We couldn't load your learning goal. Please reload the page."}</p>
                  ) : <GoalForm goal={goal} locale={preferences.interfaceLanguage} />)}

                  {active === "language" && <PreferencesForm preferences={preferences} t={t} />}
                  {active === "email" && <LearningEmailForm enabled={Boolean(profile?.learningEmailEnabled)} locale={preferences.interfaceLanguage} />}

                  {active === "security" && (
                    <div className="space-y-4">
                      <section aria-labelledby="sign-in-email" className={subcard}>
                        <h3 className="font-bold" id="sign-in-email">{vi ? "Email đăng nhập" : "Sign-in email"}</h3>
                        <p className="mt-2 break-all text-sm text-[#52645a]">{user.email}</p>
                      </section>

                      <section aria-labelledby="sign-in-methods" className={subcard}>
                        <h3 className="font-bold" id="sign-in-methods">{vi ? "Phương thức đăng nhập" : "Sign-in methods"}</h3>
                        <div className="mt-4 divide-y divide-[#e3e9e1] rounded-xl border border-[#dce3d9] bg-white">
                          <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3">
                            <div><p className="font-semibold">Google</p><p className="mt-0.5 text-sm text-[#66776d]">{methods.google ? (vi ? "Đã liên kết" : "Connected") : (vi ? "Chưa liên kết" : "Not connected")}</p></div>
                            {methods.google ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7eee8] px-3 py-1.5 text-xs font-bold text-[#245a43]"><SettingsIcon className="size-3.5" name="check" />{vi ? "Đã kết nối" : "Connected"}</span> : <a className={secondaryButton} href="/api/auth/google?mode=link&next=/settings?section=security">{vi ? "Liên kết" : "Connect"}</a>}
                          </div>
                          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
                            <div><p className="font-semibold">{vi ? "Mật khẩu" : "Password"}</p><p className="mt-0.5 text-sm text-[#66776d]">{methods.password ? (vi ? "Đã thiết lập" : "Enabled") : (vi ? "Chưa thiết lập" : "Not set")}</p></div>
                            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${methods.password ? "bg-[#e7eee8] text-[#245a43]" : "bg-[#f1f2ef] text-[#66776d]"}`}>{methods.password ? (vi ? "Đang dùng" : "Active") : (vi ? "Chưa có" : "Not set")}</span>
                          </div>
                        </div>
                        <AccountSecurity hasPassword={methods.password} vi={vi} />
                      </section>

                      <section aria-labelledby="sessions-heading" className={subcard}>
                        <h3 className="font-bold" id="sessions-heading">{vi ? "Phiên đăng nhập" : "Sessions"}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#52645a]">{vi ? "Đăng xuất các thiết bị khác mà không làm gián đoạn phiên bạn đang dùng." : "Sign out other devices without interrupting the session you are using now."}</p>
                        <form action={signOutOtherSessions} className="mt-4"><button className={secondaryButton}>{vi ? "Đăng xuất thiết bị khác" : "Sign out other devices"}</button></form>
                      </section>

                      <section aria-labelledby="sign-out-heading" className="border-t border-[#edf1eb] pt-6">
                        <h3 className="font-bold" id="sign-out-heading">{vi ? "Đăng xuất trên thiết bị này" : "Sign out on this device"}</h3>
                        <p className="mt-1 text-sm text-[#52645a]">{vi ? "Bạn có thể đăng nhập lại bất cứ lúc nào." : "You can sign back in at any time."}</p>
                        <form action={signOut} className="mt-4"><button className={secondaryButton}>{t.navigation.signOut}</button></form>
                      </section>
                    </div>
                  )}

                  {active === "privacy" && (
                    <form action={saveRankingVisibility}>
                      <fieldset>
                        <legend className="font-bold">{vi ? "Hiển thị trên bảng xếp hạng" : "Ranking visibility"}</legend>
                        <p className="mt-2 text-sm leading-6 text-[#52645a]">{vi ? "Lựa chọn này không ảnh hưởng đến tiến độ hay kết quả học của bạn." : "This choice does not affect your learning progress or results."}</p>
                        <div className="mt-5 grid gap-3">
                          {([
                            ["PUBLIC", vi ? "Công khai" : "Public", vi ? "Hiển thị tên và ảnh đại diện của bạn." : "Show your name and profile photo."],
                            ["ANONYMOUS", vi ? "Ẩn danh" : "Anonymous", vi ? "Vẫn tham gia nhưng không hiển thị danh tính." : "Participate without showing your identity."],
                            ["HIDDEN", vi ? "Không tham gia" : "Hidden", vi ? "Không xuất hiện trên bảng xếp hạng công khai." : "Do not appear on public rankings."],
                          ] as const).map(([value, label, help]) => (
                            <label className="group flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border border-[#cbd7cb] p-4 transition-colors hover:bg-[#f7faf6] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#245a43] has-checked:border-[#245a43] has-checked:bg-[#edf5ef]" key={value}>
                              <input className="mt-0.5 size-5 shrink-0 accent-[#245a43]" defaultChecked={rankingVisibility === value} name="visibility" type="radio" value={value} />
                              <span><span className="block font-semibold">{label}</span><span className="mt-1 block text-sm leading-5 text-[#52645a]">{help}</span></span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <button className={`${primaryButton} mt-6`}>{vi ? "Lưu quyền riêng tư" : "Save privacy"}</button>
                    </form>
                  )}

                  {active === "data" && <AccountDataPanel email={user.email} locale={preferences.interfaceLanguage} />}

                  {active === "plan" && (
                    <div>
                      <section className="rounded-2xl border border-[#cbd7cb] bg-[#f3f8f1] p-5 sm:p-6">
                        <p className="text-xs font-black uppercase tracking-[.14em] text-[#547060]">{vi ? "Gói hiện tại" : "Current plan"}</p>
                        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="text-3xl font-black tracking-[-.03em] text-[#183e2b]">{planName}</p>
                            {account.isPremium && account.expiresAt ? <p className="mt-2 text-sm text-[#52645a]">{vi ? "Hết hạn" : "Expires"}: {account.expiresAt.toLocaleString(vi ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "medium", timeStyle: "short" })}</p> : <p className="mt-2 text-sm text-[#52645a]">{account.lifecycle === "REVOKED" ? (vi ? "Quyền Premium đã bị thu hồi. Bạn đang dùng gói Free." : "Premium access was revoked. You are on Free.") : account.lifecycle === "EXPIRED" ? (vi ? "Premium đã hết hạn. Bạn đang dùng gói Free." : "Premium has expired. You are on Free.") : (vi ? "Bạn đang sử dụng gói Free." : "You are using Free.")}</p>}
                          </div>
                          <span className="rounded-full border border-[#a9beae] bg-white px-3 py-1.5 text-xs font-black text-[#245a43]">{account.isPremium ? "PREMIUM" : "FREE"}</span>
                        </div>
                      </section>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link className={primaryButton} href="/billing">{account.isPremium ? (vi ? "Quản lý gói" : "Manage plan") : (vi ? "Xem Premium" : "Explore Premium")}</Link>
                        <Link className={secondaryButton} href="/billing#payment-history">{vi ? "Lịch sử thanh toán" : "Payment history"}</Link>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
