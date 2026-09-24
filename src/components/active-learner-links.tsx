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
  const mobileItems = [items[0], items[1], items[2], items[4]];
  const mobileMoreItems = [...review, items[3], ...secondary];
  const reviewActive = review.some(item => matches(path, item.href));
  const moreActive = secondary.some(item => matches(path, item.href));
  const mobileMoreActive = mobileMoreItems.some(item => matches(path, item.href)) || matches(path, "/settings") || matches(path, "/billing");
  const moreLabel = locale === "vi" ? "Thêm" : "More";
  const reviewLabel = locale === "vi" ? "Ôn tập" : "Review";
  const reviewLinks = review.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`block rounded-lg px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-teal-700 ${matches(path, item.href) ? "bg-teal-50 text-teal-900" : "hover:bg-slate-100"}`} href={item.href} key={item.href}>{item.label}</Link>);
  const menuLinks = secondary.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className="block rounded-lg px-3 py-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" href={item.href} key={item.href}>{item.label}</Link>);
  const accountContent = <><Link className="block rounded-lg px-3 py-2.5 hover:bg-slate-100" href="/settings">{settingsLabel}</Link><Link className="block rounded-lg px-3 py-2.5 hover:bg-slate-100" href="/billing">{locale === "vi" ? "Thanh toán và gói" : "Billing & plan"}</Link><Link className="block rounded-lg px-3 py-2.5 hover:bg-slate-100" href="/support">{locale === "vi" ? "Trợ giúp & phản hồi" : "Support & feedback"}</Link><div className="border-t border-slate-100 px-3 py-3"><p className="mb-2 text-xs font-semibold text-slate-500">{locale === "vi" ? "Ngôn ngữ" : "Language"}</p><LanguageSwitcher locale={locale} /></div><form action={signOut} className="border-t border-slate-100 pt-2"><button className="min-h-11 w-full rounded-lg px-3 text-left text-red-700 hover:bg-red-50" type="submit">{signOutLabel}</button></form></>;
  return <>
    <nav aria-label={label} className="hidden min-w-0 items-center gap-0.5 lg:flex">{items.slice(0, 3).map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`flex min-h-11 items-center rounded-xl px-2.5 text-sm font-bold whitespace-nowrap outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700 ${matches(path, item.href) ? "bg-[#245a43] text-white" : "text-slate-700 hover:bg-[#e8eee5]"}`} href={item.href} key={item.href}>{item.label}</Link>)}<Menu active={reviewActive} summary={<>{reviewLabel}<span aria-hidden="true">⌄</span></>}><div className="absolute left-0 z-40 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{reviewLinks}</div></Menu>{items.slice(3).map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`flex min-h-11 items-center rounded-xl px-2.5 text-sm font-bold whitespace-nowrap outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700 ${matches(path, item.href) ? "bg-[#245a43] text-white" : "text-slate-700 hover:bg-[#e8eee5]"}`} href={item.href} key={item.href}>{item.label}</Link>)}<Menu active={moreActive} summary={<>{moreLabel}<span aria-hidden="true">⌄</span></>}><div className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{menuLinks}</div></Menu></nav>
    <div className="lg:hidden">{account ? <Menu summary={<PremiumAvatar avatarUrl={account.avatarUrl} name={account.name} premium={account.premium} size="sm"/>}><div className="absolute right-0 z-40 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl"><p className="truncate px-3 py-2">{account.name}{account.status ? ` · ${account.status}` : ""}</p>{accountContent}</div></Menu> : <Link className="inline-flex min-h-11 items-center font-bold text-[#245a43]" href="/settings">{settingsLabel}</Link>}</div>
    <nav aria-label={label} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#dce3d9] bg-[#f7f6f1]/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,.08)] backdrop-blur lg:hidden">{mobileItems.map((item, index) => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-lg px-1 text-[11px] font-bold ${matches(path, item.href) ? "text-[#245a43]" : "text-slate-600"}`} href={item.href} key={item.href}><span aria-hidden="true" className="text-lg leading-5">{["⌂", "▶", "◎", "▤"][index]}</span><span className="max-w-full truncate">{locale === "vi" ? ["Trang chủ", "Luyện tập", "Luyện nghe", "Thi thử"][index] : ["Home", "Practice", "Listening", "Mocks"][index]}</span></Link>)}<Menu active={mobileMoreActive} className="min-w-0" summary={<span className="flex flex-col items-center text-[11px]"><span aria-hidden="true" className="text-lg leading-5">☰</span>{moreLabel}</span>}><div className="absolute bottom-full right-2 z-40 mb-2 max-h-[70vh] w-[min(19rem,calc(100vw-1rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl">{mobileMoreItems.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`block min-h-11 rounded-lg px-3 py-2.5 ${matches(path, item.href) ? "bg-teal-50 text-teal-900" : "hover:bg-slate-100"}`} href={item.href} key={item.href}>{item.label}</Link>)}<div className="mt-2 border-t border-slate-200 pt-2">{accountContent}</div></div></Menu></nav>
    <div className="hidden shrink-0 lg:block">{account ? <Menu summary={<><span className="sr-only">{locale === "vi" ? "Tài khoản" : "Account"}: {account.name}</span><PremiumAvatar avatarUrl={account.avatarUrl} name={account.name} premium={account.premium} size="sm"/><span aria-hidden="true">⌄</span></>}><div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl"><p className="truncate px-3 py-2">{account.name}{account.status ? ` · ${account.status}` : ""}</p>{accountContent}</div></Menu> : <Link href="/settings">{settingsLabel}</Link>}</div>
  </>;
}
