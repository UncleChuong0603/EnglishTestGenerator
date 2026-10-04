import Link from "next/link";
import type { Metadata } from "next";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";

export const metadata: Metadata = {
  title: "Xóa tài khoản | TOEIC GYM",
  description:
    "Cách xóa tài khoản TOEIC GYM và dữ liệu học tập trên web hoặc ứng dụng di động.",
  alternates: { canonical: "/delete-account" },
};

export default async function DeleteAccountPage() {
  const user = await getCurrentUser();
  const { interfaceLanguage: locale } = await getPreferences(user?.id);
  const vi = locale === "vi";
  const actionHref = user ? "/settings?section=data" : "/sign-in";

  return (
    <div className="min-h-screen bg-[#f7f6f1] text-slate-900">
      <PublicHeader locale={locale} signedIn={Boolean(user)} />
      <main className="px-4 py-10 sm:py-14">
        <article className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm font-black uppercase tracking-wider text-teal-700">
            {vi ? "Tài khoản & dữ liệu" : "Account & data"}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            {vi ? "Xóa tài khoản TOEIC GYM" : "Delete your TOEIC GYM account"}
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            {vi
              ? "Bạn có thể bắt đầu và hoàn tất việc xóa tài khoản trong ứng dụng TOEIC GYM, hoặc trên web sau khi đăng nhập."
              : "You can start and complete account deletion in the TOEIC GYM app, or on the web after signing in."}
          </p>
          <ol className="mt-6 list-decimal space-y-3 pl-5 leading-7 text-slate-700">
            <li>
              {vi
                ? "Trong app: mở Cài đặt → Tài khoản & dữ liệu. Trên web: đăng nhập rồi mở Cài đặt → Dữ liệu."
                : "In the app, open Settings → Account & data. On the web, sign in and open Settings → Data."}
            </li>
            <li>
              {vi
                ? "Nhập đúng email tài khoản, xác nhận rằng bạn hiểu thao tác không thể hoàn tác, rồi chọn Xóa tài khoản."
                : "Enter the account email, acknowledge that deletion cannot be undone, then choose Delete account."}
            </li>
            <li>
              {vi
                ? "Hồ sơ, dữ liệu học tập, thông báo và mọi phiên đăng nhập sẽ bị xóa. Hồ sơ giao dịch bắt buộc phải giữ chỉ còn gắn với mã tài khoản đã được ẩn danh hóa."
                : "Your profile, learning data, notifications and every signed-in session are removed. Required transaction records remain only under a pseudonymous account reference."}
            </li>
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-5 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              href={actionHref}
            >
              {user
                ? vi
                  ? "Mở cài đặt dữ liệu"
                  : "Open data settings"
                : vi
                  ? "Đăng nhập để tiếp tục"
                  : "Sign in to continue"}
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              href="/privacy"
            >
              {vi ? "Chính sách quyền riêng tư" : "Privacy policy"}
            </Link>
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-500">
            {vi
              ? "Nếu không thể đăng nhập hoặc tài khoản cần hỗ trợ trước khi xóa, hãy liên hệ qua trang Hỗ trợ."
              : "If you cannot sign in or the account needs assistance before deletion, contact us through Support."}{" "}
            <Link className="font-bold text-teal-700 underline" href="/support">
              {vi ? "Mở Hỗ trợ" : "Open Support"}
            </Link>
          </p>
        </article>
      </main>
      <PublicFooter locale={locale} />
    </div>
  );
}
