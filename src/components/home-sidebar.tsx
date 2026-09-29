"use client";

import Link from "next/link";
import { useState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";

const icons = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  learn: "m2 9 10-5 10 5-10 5z M6 12v5c4 3 8 3 12 0v-5",
  bank: "M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4",
  skills: "M4 12h3m2-4v8m6-8v8m2-4h3 M7 9v6m10-6v6",
  words: "M3 5h8a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H3z M21 5h-4a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h4z",
  diagnose: "m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z M19 17v4m-2-2h4",
  community: "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M16 5a3 3 0 0 1 0 6m2 3a4 4 0 0 1 4 4v2",
} as const;

function Icon({ name }: { name: keyof typeof icons }) {
  return <svg aria-hidden="true" fill="none" height="21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="21"><path d={icons[name]} /></svg>;
}

export function HomeSidebar({ locale, signedIn }: { locale: InterfaceLanguage; signedIn: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const vi = locale === "vi";
  const links = [
    { href: "/", icon: "home", label: vi ? "Trang chủ" : "Home" },
    { href: "/toeic", icon: "learn", label: vi ? "Cấu trúc TOEIC" : "TOEIC format" },
    { href: signedIn ? "/practice" : "/try", icon: "bank", label: vi ? "Kho đề thi" : "Question bank" },
    { href: "/listening-lessons", icon: "skills", label: vi ? "Luyện kỹ năng" : "Skills practice" },
    { href: "/vocabulary", icon: "words", label: vi ? "Kho từ vựng" : "Vocabulary" },
    { href: "/diagnostic", icon: "diagnose", label: vi ? "Bài đánh giá" : "Diagnostic" },
    { href: "/ranking", icon: "community", label: vi ? "Cộng đồng" : "Community" },
  ] as const;

  return <aside className="home-sidebar" data-expanded={expanded}>
    <div className="home-sidebar-head"><span>MENU</span><button aria-expanded={expanded} aria-label={expanded ? (vi ? "Thu gọn menu" : "Collapse menu") : (vi ? "Mở rộng menu" : "Expand menu")} onClick={() => setExpanded(!expanded)} type="button">{expanded ? "‹" : "›"}</button></div>
    <nav aria-label={vi ? "Điều hướng học tập" : "Learning navigation"}>
      {links.map(({ href, icon, label }, index) => <Link aria-current={index === 0 ? "page" : undefined} aria-label={!expanded ? label : undefined} href={href} key={href} title={!expanded ? label : undefined}><Icon name={icon} /><span>{label}</span></Link>)}
    </nav>
    {!signedIn && <div className="home-sidebar-account"><strong>{vi ? "Bắt đầu miễn phí" : "Start for free"}</strong><p>{vi ? "Tạo tài khoản để lưu kết quả và theo dõi tiến độ." : "Save your results and follow your progress."}</p><Link href="/sign-up">{vi ? "Tạo tài khoản" : "Create account"}</Link></div>}
  </aside>;
}
