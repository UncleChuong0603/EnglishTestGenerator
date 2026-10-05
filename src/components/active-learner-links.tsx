"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PremiumAvatar } from "@/components/premium/premium-avatar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { signOut } from "@/app/dashboard/actions";
import { matchesLearnerRoute } from "@/components/learner-nav-routes";
import type { InterfaceLanguage } from "@/lib/i18n/config";

type Item = { href: string; label: string };
type Props = { items: readonly Item[]; review: readonly Item[]; secondary: readonly Item[]; label: string; locale: InterfaceLanguage; account: { name: string; avatarUrl?: string | null; premium: boolean; status?: string } | null; guest?: boolean; settingsLabel: string; signOutLabel: string };
const matches = matchesLearnerRoute;

function MobileNavIcon({ name }: { name: "today" | "practice" | "progress" | "more" }) {
  const paths = {
    today: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7"/></>,
    practice: <><path d="M6 3.5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"/><path d="m9.5 8 5 4-5 4Z"/></>,
    progress: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    more: <><circle cx="5" cy="12" r="1.25" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.25" fill="currentColor" stroke="none"/></>,
  };
  return <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[name]}</svg>;
}
function Menu({ children, summary, active = false, className = "" }: { children: React.ReactNode; summary: React.ReactNode; active?: boolean; className?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const path = usePathname();
  useEffect(() => { if (ref.current) ref.current.open = false; }, [path]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape" && ref.current?.open) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); } };
    const outside = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false; };
    document.addEventListener("keydown", keydown); document.addEventListener("click", outside);
    return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("click", outside); };
  }, []);
  return <details ref={ref} className={`group relative ${className}`}><summary className={`flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700 ${active ? "learner-menu-active bg-[#245a43] text-white" : "text-slate-700 hover:bg-[#e8eee5]"}`}>{summary}</summary>{children}</details>;
}
export function ActiveLearnerLinks({ items, review, secondary, label, locale, account, guest = false, settingsLabel, signOutLabel }: Props) {
  const path = usePathname();
  const mobileItems = [items[0], items[1], items[2]];
  const mobileMoreItems = [items[3], ...secondary];
  const reviewActive = review.some(item => matches(path, item.href));

  const mobileMoreActive = reviewActive || mobileMoreItems.some(item => matches(path, item.href)) || matches(path, "/settings") || matches(path, "/pricing") || matches(path, "/billing");
  const moreLabel = locale === "vi" ? "Thêm" : "More";
  const reviewLabel = locale === "vi" ? "Ôn tập" : "Review";
  const reviewLinks = review.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-teal-700 ${matches(path, item.href) ? "bg-teal-50 text-teal-900" : "hover:bg-slate-100"}`} href={item.href} key={item.href}>{item.label}</Link>);

  const accountContent = guest ? <><Link className="flex min-h-11 items-center justify-center rounded-lg bg-[#245a43] px-3 font-bold text-white hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href="/sign-in">{locale === "vi" ? "Đăng nhập" : "Sign in"}</Link><Link className="mt-2 flex min-h-11 items-center justify-center rounded-lg border border-[#245a43] px-3 font-bold text-[#245a43] hover:bg-[#eef3eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href="/sign-up">{locale === "vi" ? "Tạo tài khoản miễn phí" : "Create a free account"}</Link><div className="mt-2 border-t border-slate-100 px-3 py-3"><p className="mb-2 text-xs font-semibold text-slate-500">{locale === "vi" ? "Ngôn ngữ" : "Language"}</p><LanguageSwitcher locale={locale} /></div></> : <><Link className="block min-h-11 rounded-lg px-3 py-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" href="/settings">{settingsLabel}</Link><Link className="block min-h-11 rounded-lg px-3 py-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" href="/pricing">{locale === "vi" ? "So sánh gói Premium" : "Compare Premium plans"}</Link><Link className="block min-h-11 rounded-lg px-3 py-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" href="/billing">{locale === "vi" ? "Thanh toán và gói" : "Billing & plan"}</Link><Link className="block min-h-11 rounded-lg px-3 py-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" href="/support">{locale === "vi" ? "Trợ giúp & phản hồi" : "Support & feedback"}</Link><div className="border-t border-slate-100 px-3 py-3"><p className="mb-2 text-xs font-semibold text-slate-500">{locale === "vi" ? "Ngôn ngữ" : "Language"}</p><LanguageSwitcher locale={locale} /></div><form action={signOut} className="border-t border-slate-100 pt-2"><button className="min-h-11 w-full rounded-lg px-3 text-left text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700" type="submit">{signOutLabel}</button></form></>;
  return <>
    <nav aria-label={label} className="learner-sidebar-groups">
      {[{ title: locale === "vi" ? "Học tập" : "Learning", links: items }, { title: reviewLabel, links: review }, { title: locale === "vi" ? "Khám phá" : "Explore", links: secondary }].map(({ title, links }) => <div className="learner-sidebar-group" key={title}>
        <p>{title}</p>
        {links.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className="outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700" href={item.href} key={item.href}>
          <MobileNavIcon name={item.href === "/dashboard" || item.href === "/" ? "today" : item.href === "/progress" || item.href === "/ranking" ? "progress" : "practice"} />
          <span>{item.label}</span>
        </Link>)}
      </div>)}
    </nav>
    <div className="learner-mobile-account">{account ? <Menu summary={<PremiumAvatar avatarUrl={account.avatarUrl} name={account.name} premium={account.premium} size="sm"/>}><div className="absolute right-0 z-40 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl"><p className="truncate px-3 py-2">{account.name}{account.status ? ` · ${account.status}` : ""}</p>{accountContent}</div></Menu> : <Link className="inline-flex min-h-11 items-center font-bold text-[#245a43]" href="/sign-in">{locale === "vi" ? "Đăng nhập" : "Sign in"}</Link>}</div>
    <nav aria-label={label} className="learner-bottom-navigation fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#dce3d9] bg-[#f7f6f1]/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,.08)] backdrop-blur lg:hidden">{mobileItems.map((item, index) => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-bold outline-offset-[-3px] focus-visible:outline-2 focus-visible:outline-teal-700 ${matches(path, item.href) ? "text-[#245a43] after:absolute after:top-0 after:h-0.5 after:w-8 after:rounded-full after:bg-[#245a43]" : "text-slate-600"}`} href={item.href} key={item.href}><MobileNavIcon name={(["today", "practice", "progress"] as const)[index]} /><span className="max-w-full truncate">{locale === "vi" ? ["Hôm nay", "Luyện tập", "Tiến độ"][index] : ["Today", "Practice", "Progress"][index]}</span></Link>)}<Menu active={mobileMoreActive} className="min-w-0" summary={<span className="flex flex-col items-center gap-0.5 text-[11px]"><MobileNavIcon name="more" />{moreLabel}</span>}><div className="absolute bottom-full right-2 z-40 mb-2 max-h-[min(70vh,34rem)] w-[min(19rem,calc(100vw-1rem))] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl"><p className="px-3 py-2 text-xs font-black uppercase tracking-wide text-teal-800">{reviewLabel}</p>{reviewLinks}<div className="mt-2 border-t border-slate-200 pt-2">{mobileMoreItems.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`block min-h-11 rounded-lg px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-teal-700 ${matches(path, item.href) ? "bg-teal-50 text-teal-900" : "hover:bg-slate-100"}`} href={item.href} key={item.href}>{item.label}</Link>)}</div><div className="mt-2 border-t border-slate-200 pt-2">{accountContent}</div></div></Menu></nav>
    <div className="learner-sidebar-account">{account ? <Menu className="learner-account-menu" summary={<><PremiumAvatar avatarUrl={account.avatarUrl} name={account.name} premium={account.premium} size="sm"/><span className="learner-account-copy"><strong>{account.name}</strong>{account.status && <small>{account.status}</small>}</span><span aria-hidden="true">⌃</span></>}><div className="absolute bottom-full left-0 z-40 mb-2 max-h-[70dvh] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 text-sm font-bold shadow-xl">{accountContent}</div></Menu> : <div className="rounded-xl border border-[#cbd7cb] bg-[#f3f8f1] p-3"><p className="text-xs font-bold text-[#45584d]">{locale === "vi" ? "Bạn đang dùng bản xem thử" : "You are using the preview"}</p><Link className="mt-2 flex min-h-11 items-center justify-center rounded-lg bg-[#245a43] px-3 text-sm font-bold text-white hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href="/sign-in">{locale === "vi" ? "Đăng nhập để học tiếp" : "Sign in to keep learning"}</Link></div>}</div>
  </>;
}

