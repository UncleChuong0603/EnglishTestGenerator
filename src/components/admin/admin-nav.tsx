import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function AdminNav({ locale }: { locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  return <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><Link className="text-xl font-black" href="/admin">TOEIC GYM</Link><span className="ml-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">{vi ? "Quản trị" : "Admin"}</span></div><nav aria-label={vi ? "Điều hướng quản trị" : "Admin navigation"} className="flex flex-wrap gap-2"><Link className="rounded-lg px-3 py-2 font-semibold hover:bg-white" href="/admin">{vi ? "Tổng quan" : "Overview"}</Link><Link className="rounded-lg px-3 py-2 font-semibold hover:bg-white" href="/admin/users">{vi ? "Người dùng" : "Users"}</Link><Link className="rounded-lg px-3 py-2 font-semibold hover:bg-white" href="/admin/audit">{vi ? "Nhật ký kiểm toán" : "Audit log"}</Link><Link className="rounded-lg px-3 py-2 font-semibold text-teal-700 hover:bg-white" href="/dashboard">{vi ? "Khu học tập" : "Learner area"}</Link></nav></header>;
}
