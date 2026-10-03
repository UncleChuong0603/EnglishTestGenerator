"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { deleteAccountAction, type DeleteAccountActionState } from "./account-data-actions";

const initialState: DeleteAccountActionState = { ok: false };

export function AccountDataPanel({ email, locale }: { email: string; locale: InterfaceLanguage }) {
  const [state, action, pending] = useActionState(deleteAccountAction, initialState);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [exportPending, setExportPending] = useState(false);
  const [exportError, setExportError] = useState(false);
  useEffect(() => { if (state.error) errorRef.current?.focus(); }, [state]);
  async function downloadExport() {
    setExportPending(true);
    setExportError(false);
    try {
      const response = await fetch("/api/account/data-export", { cache: "no-store" });
      if (!response.ok) throw new Error("EXPORT_UNAVAILABLE");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `toeicgym-learning-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setExportError(true); }
    finally { setExportPending(false); }
  }
  const vi = locale === "vi";
  const error = state.error === "confirmation_mismatch"
    ? (vi ? "Email xác nhận không khớp với tài khoản đang đăng nhập." : "The confirmation email does not match the signed-in account.")
    : state.error === "rate_limited"
      ? (vi ? "Bạn đã thử nhiều lần. Vui lòng đợi một giờ rồi thử lại." : "Too many attempts. Please wait one hour and try again.")
    : state.error === "private_data_handoff_required"
      ? (vi ? "Hãy xóa ảnh đại diện trong mục Hồ sơ rồi thử lại. Nếu vẫn gặp lỗi, hãy liên hệ hỗ trợ để xóa toàn bộ dữ liệu." : "Remove your profile photo in Profile, then try again. If the issue remains, contact support to erase all data.")
    : state.error === "admin_handoff_required"
      ? (vi ? "Tài khoản quản trị cần được bàn giao quyền trước khi xóa. Hãy liên hệ quản trị viên khác." : "An administrator must hand off access before deleting this account.")
      : state.error === "invalid"
        ? (vi ? "Nhập đúng email và xác nhận rằng bạn hiểu dữ liệu sẽ bị xóa." : "Enter the exact email and confirm that you understand the deletion.")
        : state.error
          ? (vi ? "Chưa thể xác nhận việc xóa tài khoản. Hãy kiểm tra trạng thái đăng nhập hoặc liên hệ hỗ trợ trước khi thử lại." : "We could not confirm deletion. Check your sign-in status or contact support before retrying.")
          : null;

  return <div data-account-data-page className="mt-6 space-y-8">
    <section aria-labelledby="export-learning-data">
      <h3 className="font-bold" id="export-learning-data">{vi ? "Xuất dữ liệu học tập" : "Export learning data"}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        {vi ? "Tải một tệp JSON có thể đọc bằng máy gồm hồ sơ, mục tiêu, lịch sử luyện tập, tiến độ, lỗi sai, từ vựng, kế hoạch và dữ liệu gói của bạn. Tệp không chứa mật khẩu, token phiên hay khóa nội bộ." : "Download a machine-readable JSON file containing your profile, goals, practice history, progress, mistakes, vocabulary, plans and plan data. Passwords, session tokens and internal keys are excluded."}
      </p>
      <button type="button" disabled={exportPending} onClick={downloadExport} className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:opacity-60">
        {exportPending ? (vi ? "Đang chuẩn bị dữ liệu…" : "Preparing your data…") : (vi ? "Tải dữ liệu JSON" : "Download JSON data")}
      </button>
      {exportError ? <p className="mt-3 text-sm text-red-800" role="alert">{vi ? "Chưa tải được dữ liệu. Vui lòng thử lại hoặc liên hệ hỗ trợ." : "The data could not be downloaded. Please retry or contact support."}</p> : null}
    </section>

    <Link href="/support" className="inline-flex min-h-11 items-center font-semibold text-teal-800 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
      {vi ? "Cần hỗ trợ về dữ liệu tài khoản?" : "Need help with your account data?"}
    </Link>
    <section aria-labelledby="delete-account" className="border-t border-slate-200 pt-8">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
        <h3 className="text-lg font-black text-red-950" id="delete-account">{vi ? "Xóa tài khoản" : "Delete account"}</h3>
        <p className="mt-2 text-sm leading-6 text-red-950">
          {vi ? "Hành động này đăng xuất mọi thiết bị và xóa vĩnh viễn hồ sơ, lịch sử học, tiến độ, lỗi sai, từ vựng, lựa chọn, liên kết Google và email vòng đời. Hồ sơ thanh toán bắt buộc phải lưu sẽ được giữ dưới danh tính ẩn danh." : "This signs out every device and permanently removes your profile, learning history, progress, mistakes, vocabulary, preferences, Google link and lifecycle email data. Required payment records are retained under a pseudonymous account reference."}
        </p>
        <form action={action} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-red-950" htmlFor="confirmationEmail">
              {vi ? <>Nhập <span className="break-all">{email}</span> để xác nhận</> : <>Enter <span className="break-all">{email}</span> to confirm</>}
            </label>
            <input
              aria-describedby="delete-account-help"
              autoComplete="email"
              className="mt-2 min-h-12 w-full max-w-lg rounded-xl border border-red-300 bg-white px-3 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              id="confirmationEmail"
              name="confirmationEmail"
              required
              spellCheck={false}
              type="email"
            />
            <p className="mt-2 text-xs leading-5 text-red-900" id="delete-account-help">
              {vi ? "Không thể hoàn tác. Hãy xuất dữ liệu trước nếu bạn muốn giữ một bản sao." : "This cannot be undone. Export your data first if you want to keep a copy."}
            </p>
          </div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-red-200 bg-white p-3 text-sm text-red-950 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-red-700">
            <input className="mt-1 size-4 shrink-0" name="acknowledge" required type="checkbox" value="yes" />
            <span>{vi ? "Tôi hiểu dữ liệu học tập sẽ bị xóa vĩnh viễn và tất cả phiên đăng nhập sẽ hết hiệu lực." : "I understand that learning data will be permanently deleted and every session will be invalidated."}</span>
          </label>
          {error ? <p ref={errorRef} tabIndex={-1} className="rounded-xl border border-red-300 bg-white p-3 text-sm font-semibold text-red-800 focus-visible:outline-2 focus-visible:outline-red-800" role="alert">{error}</p> : null}
          <button className="min-h-12 rounded-xl bg-red-800 px-5 py-3 font-bold text-white hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">
            {pending ? (vi ? "Đang xóa tài khoản…" : "Deleting account…") : (vi ? "Xóa vĩnh viễn tài khoản" : "Permanently delete account")}
          </button>
        </form>
      </div>
    </section>
  </div>;
}
