"use client";

import Link from "next/link";
import { useActionState } from "react";
import { activateAccountAction, forgotPasswordAction, resetPasswordAction, type AuthActionState } from "@/app/auth/actions";
import { AuthAlert, AuthShell, AuthSuccessState, fieldClassName, linkClassName, primaryButtonClassName } from "./auth-ui";
import { PasswordField } from "./password-field";

const initial: AuthActionState = { ok: false };

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initial);
  return <AuthShell eyebrow="Khôi phục tài khoản" title="Quên mật khẩu?" intro="Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.">
    {state.ok ? <AuthSuccessState title="Hãy kiểm tra hộp thư"><p>Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.</p></AuthSuccessState> : <form action={action} aria-busy={pending} className="mt-7 space-y-5"><div><label className="text-sm font-bold text-slate-800" htmlFor="recovery-email">Email</label><input autoComplete="email" className={fieldClassName} id="recovery-email" name="email" required type="email" /></div><button className={primaryButtonClassName} disabled={pending}>{pending ? "Đang gửi…" : "Gửi hướng dẫn"}</button></form>}
    {state.error ? <AuthAlert type="error">{state.error}</AuthAlert> : null}
    <p className="mt-6 text-center text-sm"><Link className={linkClassName} href="/sign-in">← Quay lại đăng nhập</Link></p>
  </AuthShell>;
}

function PasswordForm({ token, activation = false }: { token: string; activation?: boolean }) {
  const [state, action, pending] = useActionState(activation ? activateAccountAction : resetPasswordAction, initial);
  const title = activation ? "Kích hoạt tài khoản" : "Đặt lại mật khẩu";
  const intro = activation ? "Tạo mật khẩu an toàn để hoàn tất thiết lập tài khoản." : "Tạo mật khẩu mới cho tài khoản TOEICGym của bạn.";
  return <AuthShell eyebrow={activation ? "Chào mừng đến TOEICGym" : "Bảo mật tài khoản"} title={title} intro={intro}>
    {state.ok ? <AuthSuccessState title={activation ? "Tài khoản đã được kích hoạt" : "Mật khẩu đã được cập nhật"}><p>{state.message}</p><Link className={`${primaryButtonClassName} mt-5`} href="/sign-in">Đăng nhập</Link></AuthSuccessState> : <form action={action} aria-busy={pending} className="mt-7 space-y-4"><input name="token" type="hidden" value={token} /><PasswordField autoComplete="new-password" hint="Mật khẩu cần có ít nhất 10 ký tự." label="Mật khẩu mới" name="password" /><PasswordField autoComplete="new-password" label="Xác nhận mật khẩu" name="confirmPassword" /><button className={primaryButtonClassName} disabled={pending}>{pending ? "Đang lưu…" : activation ? "Kích hoạt tài khoản" : "Lưu mật khẩu mới"}</button></form>}
    {state.error ? <AuthAlert type="error">{state.error}</AuthAlert> : null}
    {!state.ok ? <p className="mt-6 text-center text-sm"><Link className={linkClassName} href="/sign-in">← Quay lại đăng nhập</Link></p> : null}
  </AuthShell>;
}

export const ResetForm = ({ token }: { token: string }) => <PasswordForm token={token} />;
export const ActivationForm = ({ token }: { token: string }) => <PasswordForm activation token={token} />;
