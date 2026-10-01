import Link from "next/link";
import type { Metadata } from "next";
import { getCookieLanguage } from "@/lib/i18n/get-translations";

export const metadata: Metadata = { title: "Account deleted | TOEICGym", robots: { index: false, follow: false } };

export default async function AccountDeletedPage() {
  const vi = await getCookieLanguage() === "vi";
  return <main data-account-data-page className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h1 className="text-3xl font-black">{vi ? "Tài khoản đã được xóa" : "Account deleted"}</h1>
      <p className="mt-4 leading-7 text-slate-600">{vi ? "Dữ liệu học tập đã được xóa và mọi phiên đăng nhập đã hết hiệu lực. Những hồ sơ thanh toán cần lưu được giữ dưới mã tài khoản đã ẩn danh." : "Your learning data has been removed and every session is invalidated. Required payment records are retained under a pseudonymous account reference."}</p>
      <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-5 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">{vi ? "Về trang chủ" : "Return home"}</Link>
    </div>
  </main>;
}
