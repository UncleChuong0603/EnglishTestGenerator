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
  const [selection, setSelection] = useState<{ path: string; groupHref: string } | null>(null);
  const vi = locale === "vi";
  const groups = [
    { name: vi ? "Tổng quan" : "Overview", href: "/admin", links: [["/admin", vi ? "Bảng điều hành" : "Dashboard"], ["/admin/analytics", vi ? "Phân tích" : "Analytics"]] },
    { name: vi ? "Học liệu" : "Content", href: "/admin/content", links: [["/admin/content", vi ? "Ngân hàng câu hỏi" : "Question bank"], ["/admin/listening-lessons", vi ? "Luyện nghe" : "Listening lessons"], ["/admin/content/similarity", vi ? "Trùng lặp" : "Similarity"], ["/admin/content/media", "Media"]] },
    { name: vi ? "Người học" : "Learners", href: "/admin/users", links: [["/admin/users", vi ? "Người dùng" : "Users"], ["/admin/support", vi ? "Phản hồi" : "Feedback"]] },
    { name: vi ? "Vận hành" : "Operations", href: "/admin/challenges", links: [["/admin/posts", vi ? "Bài viết" : "Posts"], ["/admin/challenges", vi ? "Sự kiện" : "Events"], ["/admin/payments", vi ? "Thanh toán" : "Payments"], ["/admin/audit", vi ? "Nhật ký" : "Audit log"], ["/admin/settings", vi ? "Cài đặt" : "Settings"]] },
  ];
  const matchingLinks = groups.flatMap(group => group.links).filter(([href]) => pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`)));
  const activeHref = matchingLinks.sort((a, b) => b[0].length - a[0].length)[0]?.[0];
  const currentGroup = groups.find(group => group.links.some(([href]) => href === activeHref)) ?? groups[0];
  const activeGroup = groups.find(group => group.href === (selection?.path === pathname ? selection.groupHref : currentGroup.href)) ?? currentGroup;
  return <>
    <TableSortEnhancer locale={locale} />
    <header className="admin-navigation">
      <div className="admin-navigation-top">
        <div className="admin-navigation-brand"><Link className="inline-flex items-center gap-2" href="/admin"><Image src="/brand/toeic-gym-mark.png" alt="" width={28} height={28} />TOEIC GYM</Link><span className="admin-identity">ADMIN</span></div>
        <div aria-label={vi ? "Khu vực quản trị" : "Admin sections"} className="admin-navigation-sections" role="group">
          {groups.map(group => <button aria-controls="admin-section-links" aria-expanded={group === activeGroup} key={group.href} onClick={() => setSelection({ path: pathname, groupHref: group.href })} type="button">{group.name}</button>)}
        </div>
        <div className="admin-navigation-actions"><LanguageSwitcher locale={locale} /><Link aria-label={vi ? "Đến khu học tập" : "Go to learner area"} className="admin-learner-link" href="/dashboard"><span className="admin-learner-label">{vi ? "Khu học tập" : "Learner area"}</span> <span aria-hidden="true">↗</span></Link></div>
      </div>
      <nav aria-label={`${vi ? "Mục trong" : "Pages in"} ${activeGroup.name}`} className="admin-navigation-links" id="admin-section-links">
        {activeGroup.links.map(([href, label]) => <Link aria-current={href === activeHref ? "page" : undefined} href={href} key={href}>{label}</Link>)}
      </nav>
    </header>
  </>;
}
