import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function AdminNav({locale}:{locale:InterfaceLanguage}) {
  const vi=locale==="vi";
  const links=[
    ["/admin",vi?"Tổng quan":"Overview"],
    ["/admin/users",vi?"Người dùng":"Users"],
    ["/admin/content",vi?"Nội dung":"Content"],
    ["/admin/content/import",vi?"Nhập câu hỏi":"Question import"],
    ["/admin/content/posts",vi?"Bài viết":"Posts"],
    ["/admin/challenges",vi?"Thử thách":"Challenges"],
    ["/admin/payments",vi?"Thanh toán":"Payments"],
    ["/admin/audit",vi?"Nhật ký":"Audit log"],
  ];
  return <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><Link className="text-xl font-black" href="/admin">TOEIC GYM</Link><span className="ml-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">Admin</span></div><nav aria-label={vi?"Điều hướng quản trị":"Admin navigation"} className="flex flex-wrap gap-2">{links.map(([href,label])=><Link className="rounded-lg px-3 py-2 font-semibold hover:bg-white" href={href} key={href}>{label}</Link>)}<Link className="rounded-lg px-3 py-2 font-semibold text-teal-700" href="/dashboard">{vi?"Khu học tập":"Learner area"}</Link></nav></header>;
}
