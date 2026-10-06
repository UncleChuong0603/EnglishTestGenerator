"use client";

import { useActionState } from "react";
import { changePasswordAction, type AuthActionState } from "@/app/auth/actions";

const initial: AuthActionState = { ok: false };
const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#aebcb2] bg-white px-4 text-base outline-none focus:border-[#245a43] focus:ring-2 focus:ring-[#245a43]/20";

export function AccountSecurity({ hasPassword, vi }: { hasPassword: boolean; vi: boolean }) {
  const [state, action, pending] = useActionState(changePasswordAction, initial);
  return (
    <form action={action} aria-busy={pending} className="mt-6 border-t border-[#e3e9e1] pt-6">
      <h4 className="font-bold">{hasPassword ? (vi ? "Đổi mật khẩu" : "Change password") : (vi ? "Đặt mật khẩu" : "Set password")}</h4>
      <p className="mt-1 text-sm leading-6 text-[#52645a]">{vi ? "Mật khẩu mới cần có ít nhất 10 ký tự. Các phiên khác sẽ được đăng xuất sau khi đổi." : "Your new password must have at least 10 characters. Other sessions will be signed out after the change."}</p>
      <div className="mt-4 grid gap-4">
        {hasPassword ? <div>
          <label className="text-sm font-semibold" htmlFor="currentPassword">{vi ? "Mật khẩu hiện tại" : "Current password"}</label>
          <input autoComplete="current-password" className={inputClass} id="currentPassword" name="currentPassword" required type="password" />
        </div> : null}
        <div>
          <label className="text-sm font-semibold" htmlFor="newPassword">{vi ? "Mật khẩu mới" : "New password"}</label>
          <input aria-describedby="new-password-help" autoComplete="new-password" className={inputClass} id="newPassword" minLength={10} name="password" required type="password" />
          <p className="mt-2 text-xs text-[#66776d]" id="new-password-help">{vi ? "Tối thiểu 10 ký tự." : "At least 10 characters."}</p>
        </div>
        <div>
          <label className="text-sm font-semibold" htmlFor="confirmPassword">{vi ? "Xác nhận mật khẩu mới" : "Confirm new password"}</label>
          <input autoComplete="new-password" className={inputClass} id="confirmPassword" minLength={10} name="confirmPassword" required type="password" />
        </div>
      </div>
      {state.error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">{vi ? state.error : "We couldn't update your password. Check the values and try again."}</p> : state.message ? <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800" role="status">{vi ? state.message : "Password updated. Other sessions have been signed out."}</p> : null}
      <button className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#245a43] px-5 py-3 font-bold text-white transition-colors hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43] disabled:cursor-not-allowed disabled:opacity-50" disabled={pending} type="submit">{pending ? (vi ? "Đang lưu…" : "Saving…") : (vi ? "Lưu mật khẩu" : "Save password")}</button>
    </form>
  );
}
