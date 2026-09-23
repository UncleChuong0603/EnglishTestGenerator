"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TableSortEnhancer } from "@/components/admin/table-sort-enhancer";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function AdminNav({ locale }: { locale: InterfaceLanguage }) {
  const pathname = usePathname();
  const vi = locale === "vi";
  const groups = [
    { name: vi ? "Tổng quan" : "Overview", links: [["/admin", vi ? "Bảng điều hành" : "Dashboard"], ["/admin/analytics", vi ? "Phân tích" : "Analytics"]] },
    { name: vi ? "Học liệu" : "Content", links: [["/admin/content", vi ? "Ngân hàng câu hỏi" : "Question bank"], ["/admin/content/similarity", vi ? "Trùng lặp" : "Similarity"], ["/admin/content/media", "Media"], ["/admin/content/posts", vi ? "Bài viết" : "Posts"]] },
    { name: vi ? "Người học" : "Learners", links: [["/admin/users", vi ? "Người dùng" : "Users"], ["/admin/support", vi ? "Phản hồi" : "Feedback"]] },
    { name: vi ? "Vận hành" : "Operations", links: [["/admin/challenges", vi ? "Sự kiện" : "Events"], ["/admin/payments", vi ? "Thanh toán" : "Payments"], ["/admin/audit", vi ? "Nhật ký" : "Audit log"], ["/admin/settings", vi ? "Cài đặt" : "Settings"]] },
  ];
  const matchingLinks = groups.flatMap(group => group.links).filter(([href]) => pathname === href || pathname.startsWith(`${href}/`));
  const activeHref = matchingLinks.sort((a, b) => b[0].length - a[0].length)[0]?.[0];
  return <>
    <TableSortEnhancer locale={locale} />
    <header className="admin-navigation">
      <div className="admin-navigation-top">
        <div className="flex items-center gap-3"><Link className="text-xl font-black tracking-tight text-[#183e2b]" href="/admin">TOEIC GYM</Link><span className="admin-identity">ADMIN</span></div>
        <div className="flex flex-wrap items-center gap-3"><LanguageSwitcher locale={locale} /><Link className="text-sm font-semibold text-[#245a43] hover:underline" href="/dashboard">{vi ? "Đến khu học tập ↗" : "Go to learner area ↗"}</Link></div>
      </div>
      <nav aria-label={vi ? "Điều hướng quản trị" : "Admin navigation"} className="admin-navigation-links">
        {groups.map(group => <div className="admin-navigation-group" key={group.name}>
          <p>{group.name}</p>
          <div>{group.links.map(([href, label]) => <Link aria-current={href === activeHref ? "page" : undefined} href={href} key={href}>{label}</Link>)}</div>
        </div>)}
      </nav>
    </header>
  </>;
}
