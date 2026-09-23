"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signInAction, signUpAction, type AuthActionState } from "@/app/auth/actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { AuthAlert, AuthDivider, AuthShell, GoogleButton, fieldClassName, linkClassName, primaryButtonClassName } from "./auth-ui";
import { PasswordField } from "./password-field";
import { safeGuestContinuation } from "@/lib/auth/redirect";

const initial: AuthActionState = { ok: false };

function Message({ state, queryError }: { state: AuthActionState; queryError?: string | null }) {
  const googleErrors: Record<string, string> = {
    link_required: "Email này đã có tài khoản. Hãy đăng nhập bằng mật khẩu rồi kết nối Google trong Cài đặt.",
    rate_limited: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ 15 phút rồi thử lại.",
    google_unavailable: "Đăng nhập Google chưa được cấu hình.",
    google_start_failed: "Không thể bắt đầu đăng nhập Google. Vui lòng thử lại sau.",
    oauth_callback_failed: "Google không thể xác minh phiên đăng nhập. Vui lòng thử lại.",
  };
  const error = queryError ? googleErrors[queryError] ?? "Không thể đăng nhập bằng Google." : state.error;
  if (error) return <AuthAlert type="error">{error}</AuthAlert>;
  if (state.message) return <AuthAlert type="success">{state.message}</AuthAlert>;
  return null;
}

export function SignInForm({ locale }: { locale: InterfaceLanguage }) {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(signInAction, initial);
  const vi = locale === "vi";
  const continuation = safeGuestContinuation(params.get("next"));
  return <AuthShell eyebrow="TOEICGym" title={vi ? "Chào mừng trở lại" : "Welcome back"} intro={vi ? "Tiếp tục hành trình TOEIC của bạn." : "Continue your TOEIC journey."}>
    {params.get("verified") ? <AuthAlert type="success">Email đã được xác minh. Bạn có thể đăng nhập ngay.</AuthAlert> : null}
    {continuation ? <AuthAlert type="info">{vi ? "Đăng nhập để lưu kết quả vừa làm và tiếp tục luyện." : "Sign in to save your recent result and continue learning."}</AuthAlert> : null}
    <GoogleButton next={params.get("next")} />
    <AuthDivider />
    <form action={action} aria-busy={pending} className="space-y-4">
      <input name="next" type="hidden" value={params.get("next") ?? ""} />
      <div><label className="text-sm font-bold text-slate-800" htmlFor="sign-in-email">Email</label><input autoComplete="email" className={fieldClassName} id="sign-in-email" name="email" required type="email" /></div>
      <div><div className="mb-1.5 flex items-center justify-between gap-4"><span className="text-sm font-bold text-slate-800">{vi ? "Mật khẩu" : "Password"}</span><Link className={`${linkClassName} text-xs`} href="/forgot-password">{vi ? "Quên mật khẩu?" : "Forgot password?"}</Link></div><PasswordField autoComplete="current-password" hideLabel label={vi ? "Mật khẩu" : "Password"} name="password" minLength={1} /></div>
      <button className={primaryButtonClassName} disabled={pending} type="submit">{pending ? (vi ? "Đang đăng nhập…" : "Signing in…") : (vi ? "Đăng nhập" : "Sign in")}</button>
    </form>
    <Message queryError={params.get("error")} state={state} />
    <p className="mt-6 text-center text-sm text-slate-600">{vi ? "Chưa có tài khoản?" : "New to TOEICGym?"} <Link className={linkClassName} href={continuation ? `/sign-up?from=guest-result&next=${encodeURIComponent(continuation)}` : "/sign-up"}>{vi ? "Tạo tài khoản" : "Create account"}</Link></p>
  </AuthShell>;
}

export function SignUpForm({ locale }: { locale: InterfaceLanguage }) {
  const params = useSearchParams();
  const [state, action, pending] = useActionState(signUpAction, initial);
  const vi = locale === "vi";
  const continuation = safeGuestContinuation(params.get("next"));
  const fromResult = params.get("from") === "guest-result" && Boolean(continuation);
  return <AuthShell eyebrow={vi ? "Bắt đầu cùng TOEICGym" : "Start with TOEICGym"} title={fromResult ? (vi ? "Lưu kết quả của bạn" : "Save your result") : (vi ? "Tạo tài khoản" : "Create your account")} intro={fromResult ? (vi ? "Giữ kết quả vừa làm, nhận bài luyện đề xuất và bắt đầu xây dựng Ngân hàng câu sai." : "Keep this result, receive recommended practice, and start building your Mistake Bank.") : (vi ? "Bắt đầu luyện TOEIC miễn phí." : "Start practicing TOEIC for free.")}>
    {fromResult ? <div className="mt-5 rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-950">✓ {vi ? "Bài luyện thử còn hiệu lực sẽ được lưu sau khi bạn đăng nhập thành công." : "Your guest result will be saved after sign-in if the session is still available."}</div> : null}
    <GoogleButton next={params.get("next")} label={vi ? "Đăng ký với Google" : "Sign up with Google"} />
    <AuthDivider />
    <form action={action} aria-busy={pending} className="space-y-4">
      {continuation ? <input name="next" type="hidden" value={continuation} /> : null}
      <div><label className="text-sm font-bold text-slate-800" htmlFor="sign-up-email">Email</label><input autoComplete="email" className={fieldClassName} id="sign-up-email" name="email" required type="email" /></div>
      <PasswordField autoComplete="new-password" hint={vi ? "Dùng ít nhất 10 ký tự. Bạn có thể dùng cụm từ dễ nhớ với mình." : "Use at least 10 characters."} label={vi ? "Mật khẩu" : "Password"} name="password" />
      <PasswordField autoComplete="new-password" label={vi ? "Xác nhận mật khẩu" : "Confirm password"} name="confirmPassword" />
      <button className={primaryButtonClassName} disabled={pending} type="submit">{pending ? (vi ? "Đang tạo tài khoản…" : "Creating account…") : (vi ? "Tạo tài khoản" : "Create account")}</button>
    </form>
    <Message state={state} />
    <p className="mt-6 text-center text-sm text-slate-600">{vi ? "Đã có tài khoản?" : "Already registered?"} <Link className={linkClassName} href={continuation ? `/sign-in?next=${encodeURIComponent(continuation)}` : "/sign-in"}>{vi ? "Đăng nhập" : "Sign in"}</Link></p>
  </AuthShell>;
}
