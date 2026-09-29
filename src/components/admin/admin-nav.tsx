"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { TableSortEnhancer } from "@/components/admin/table-sort-enhancer";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function AdminNav({ locale }: { locale: InterfaceLanguage }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const vi = locale === "vi";
  const groups = [
    { name: vi ? "Tổng quan" : "Overview", links: [["/admin", vi ? "Bảng điều hành" : "Dashboard"], ["/admin/analytics", vi ? "Phân tích" : "Analytics"]] },
    { name: vi ? "Học liệu" : "Content", links: [["/admin/content", vi ? "Ngân hàng câu hỏi" : "Question bank"], ["/admin/listening-lessons", vi ? "Luyện nghe" : "Listening lessons"], ["/admin/content/similarity", vi ? "Trùng lặp" : "Similarity"], ["/admin/content/media", "Media"]] },
    { name: vi ? "Người học" : "Learners", links: [["/admin/users", vi ? "Người dùng" : "Users"], ["/admin/support", vi ? "Phản hồi" : "Feedback"]] },
    { name: vi ? "Vận hành" : "Operations", links: [["/admin/posts", vi ? "Bài viết" : "Posts"], ["/admin/challenges", vi ? "Sự kiện" : "Events"], ["/admin/payments", vi ? "Thanh toán" : "Payments"], ["/admin/email", vi ? "Email học tập" : "Learning email"], ["/admin/audit", vi ? "Nhật ký" : "Audit log"], ["/admin/settings", vi ? "Cài đặt" : "Settings"]] },
  ];
  const matchingLinks = groups.flatMap(group => group.links).filter(([href]) => pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)));
  const activeHref = matchingLinks.sort((a, b) => b[0].length - a[0].length)[0]?.[0];

  return <>
    <TableSortEnhancer locale={locale} />
    <header className="admin-mobile-bar"><Link href="/admin"><Image src="/brand/toeic-gym-mark.png" alt="" width={28} height={28} />TOEIC GYM <span>ADMIN</span></Link><button aria-controls="admin-sidebar" aria-expanded={open} aria-label={open ? (vi ? "Đóng menu quản trị" : "Close admin menu") : (vi ? "Mở menu quản trị" : "Open admin menu")} onClick={() => setOpen(!open)} type="button">{open ? "×" : "☰"}</button></header>
    {open && <button aria-label={vi ? "Đóng menu quản trị" : "Close admin menu"} className="admin-sidebar-scrim" onClick={() => setOpen(false)} type="button" />}
    <aside className="admin-navigation" data-open={open} id="admin-sidebar">
      <div className="admin-navigation-brand"><Link href="/admin"><Image src="/brand/toeic-gym-mark.png" alt="" width={32} height={32} />TOEIC GYM</Link><span className="admin-identity">ADMIN</span></div>
      <nav aria-label={vi ? "Điều hướng quản trị" : "Admin navigation"} className="admin-navigation-groups">
        {groups.map(group => <div className="admin-navigation-group" key={group.name}><h2>{group.name}</h2>{group.links.map(([href, label]) => <Link aria-current={href === activeHref ? "page" : undefined} href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}</div>)}
      </nav>
      <div className="admin-navigation-actions"><LanguageSwitcher locale={locale} /><Link className="admin-learner-link" href="/dashboard">← {vi ? "Khu học tập" : "Learner area"}</Link></div>
    </aside>
  </>;
}
