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
type Props = { items: readonly Item[]; review: readonly Item[]; secondary: readonly Item[]; label: string; locale: InterfaceLanguage; account: { name: string; avatarUrl?: string | null; premium: boolean; status?: string } | null; settingsLabel: string; signOutLabel: string };
const matches = matchesLearnerRoute;

const navIcons: Record<string, string> = {
  "/dashboard": "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  "/practice": "M7 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2z M9 8h6 M9 12h6",
  "/progress": "M4 19V9m6 10V5m6 14v-7m4 7H2",
  "/full-mock": "M5 3h14v18H5z M8 8h8 M8 12h5 M8 16h7",
  "/listening-lessons": "M5 14V8a7 7 0 0 1 14 0v6 M5 13H3v5h4v-5zm14 0h2v5h-4v-5z",
  "/mistakes": "M12 3 3.5 19h17z M12 9v4m0 3h.01",
  "/vocabulary": "M3 5h7a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H3z M21 5h-5a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h5z",
  "/": "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  "/blog": "M5 4h14v16H5z M8 8h8 M8 12h8 M8 16h5",
  "/ranking": "M8 21h8 M12 17v4 M7 4h10v3a5 5 0 0 1-10 0z M7 6H4v1a4 4 0 0 0 4 4m9-5h3v1a4 4 0 0 1-4 4",
  "/support": "M4 5h16v11H8l-4 4z M8 9h8 M8 12h5",
};

function NavIcon({ href }: { href: string }) {
  return <svg aria-hidden="true" fill="none" height="19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="19"><path d={navIcons[href] ?? navIcons["/"]} /></svg>;
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
  return <details ref={ref} className={`group relative ${className}`}><summary className={`flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700 ${active ? "bg-[#245a43] text-white" : "text-slate-700 hover:bg-[#e8eee5]"}`}>{summary}</summary>{children}</details>;
}

export function ActiveLearnerLinks({ items, review, secondary, label, locale, account, settingsLabel, signOutLabel }: Props) {
  const path = usePathname();
  const mobileItems = [items[0], items[1], items[3]];
  const mobileMoreItems = [items[2], ...secondary];
  const mobileMoreActive = review.some(item => matches(path, item.href)) || mobileMoreItems.some(item => matches(path, item.href)) || matches(path, "/settings") || matches(path, "/billing");
  const moreLabel = locale === "vi" ? "Thêm" : "More";
  const reviewLabel = locale === "vi" ? "Ôn tập" : "Review";
  const reviewLinks = review.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`block rounded-lg px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-teal-700 ${matches(path, item.href) ? "bg-teal-50 text-teal-900" : "hover:bg-slate-100"}`} href={item.href} key={item.href}>{item.label}</Link>);
  const accountContent = <><Link className="block rounded-lg px-3 py-2.5 hover:bg-slate-100" href="/settings">{settingsLabel}</Link><Link className="block rounded-lg px-3 py-2.5 hover:bg-slate-100" href="/billing">{locale === "vi" ? "Thanh toán và gói" : "Billing & plan"}</Link><Link className="block rounded-lg px-3 py-2.5 hover:bg-slate-100" href="/support">{locale === "vi" ? "Trợ giúp & phản hồi" : "Support & feedback"}</Link><div className="border-t border-slate-100 px-3 py-3"><p className="mb-2 text-xs font-semibold text-slate-500">{locale === "vi" ? "Ngôn ngữ" : "Language"}</p><LanguageSwitcher locale={locale} /></div><form action={signOut} className="border-t border-slate-100 pt-2"><button className="min-h-11 w-full rounded-lg px-3 text-left text-red-700 hover:bg-red-50" type="submit">{signOutLabel}</button></form></>;
  const sidebarGroups = [
    { label: locale === "vi" ? "Học tập" : "Learning", links: items },
    { label: reviewLabel, links: review },
    { label: locale === "vi" ? "Khám phá" : "Explore", links: secondary },
  ];

  return <>
    <nav aria-label={label} className="learner-sidebar-groups">
      {sidebarGroups.map(group => <div className="learner-sidebar-group" key={group.label}>
        <p>{group.label}</p>
        {group.links.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} href={item.href} key={item.href}><NavIcon href={item.href} /><span>{item.label}</span></Link>)}
      </div>)}
    </nav>
    <div className="learner-mobile-account">{account ? <Menu summary={<PremiumAvatar avatarUrl={account.avatarUrl} name={account.name} premium={account.premium} size="sm"/>}><div className="absolute right-0 z-40 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl"><p className="truncate px-3 py-2">{account.name}{account.status ? ` · ${account.status}` : ""}</p>{accountContent}</div></Menu> : <Link className="inline-flex min-h-11 items-center font-bold text-[#245a43]" href="/settings">{settingsLabel}</Link>}</div>
    <nav aria-label={label} className="learner-bottom-navigation">{mobileItems.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} href={item.href} key={item.href}><NavIcon href={item.href} /><span>{item.label}</span></Link>)}<Menu active={mobileMoreActive} className="min-w-0" summary={<span className="flex flex-col items-center text-[11px]"><svg aria-hidden="true" fill="none" height="19" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="19"><path d="M4 7h16M4 12h16M4 17h16" /></svg>{moreLabel}</span>}><div className="absolute bottom-full right-2 z-40 mb-2 max-h-[70vh] w-[min(19rem,calc(100vw-1rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl"><p className="px-3 py-2 text-xs font-black uppercase tracking-wide text-teal-800">{reviewLabel}</p>{reviewLinks}<div className="mt-2 border-t border-slate-200 pt-2">{mobileMoreItems.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`block min-h-11 rounded-lg px-3 py-2.5 ${matches(path, item.href) ? "bg-teal-50 text-teal-900" : "hover:bg-slate-100"}`} href={item.href} key={item.href}>{item.label}</Link>)}</div><div className="mt-2 border-t border-slate-200 pt-2">{accountContent}</div></div></Menu></nav>
    <div className="learner-sidebar-account">{account ? <Menu className="learner-account-menu" summary={<><PremiumAvatar avatarUrl={account.avatarUrl} name={account.name} premium={account.premium} size="sm"/><span className="learner-account-copy"><strong>{account.name}</strong>{account.status ? <small>{account.status}</small> : null}</span><span aria-hidden="true">⌃</span></>}><div className="absolute inset-x-0 bottom-full z-40 mb-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl">{accountContent}</div></Menu> : <Link href="/settings">{settingsLabel}</Link>}</div>
  </>;
}
