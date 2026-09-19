"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { PremiumAvatar } from "@/components/premium/premium-avatar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { signOut } from "@/app/dashboard/actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";

type Item = { href: string; label: string };
type Props = { items: readonly Item[]; secondary: readonly Item[]; label: string; locale: InterfaceLanguage; account: { name: string; avatarUrl?: string | null; premium: boolean; status?: "Premium" | "Free" } | null; settingsLabel: string; signOutLabel: string };
const matches = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

function Menu({ children, summary, active = false, className = "" }: { children: React.ReactNode; summary: React.ReactNode; active?: boolean; className?: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape" && ref.current?.open) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); } };
    const outside = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false; };
    document.addEventListener("keydown", keydown); document.addEventListener("click", outside);
    return () => { document.removeEventListener("keydown", keydown); document.removeEventListener("click", outside); };
  }, []);
  return <details ref={ref} className={`group relative ${className}`}><summary aria-current={active ? "page" : undefined} className={`flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700 ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"}`}>{summary}</summary>{children}</details>;
}

export function ActiveLearnerLinks({ items, secondary, label, locale, account, settingsLabel, signOutLabel }: Props) {
  const path = usePathname();
  const moreActive = secondary.some(item => matches(path, item.href));
  const moreLabel = locale === "vi" ? "Thêm" : "More";
  const menuLinks = secondary.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className="block rounded-lg px-3 py-2.5 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-teal-700" href={item.href} key={item.href}>{item.label}</Link>);
  const accountContent = <><Link className="block rounded-lg px-3 py-2.5 hover:bg-slate-100" href="/settings">{settingsLabel}</Link><Link className="block rounded-lg px-3 py-2.5 hover:bg-slate-100" href="/billing">{locale === "vi" ? "Thanh toán và gói" : "Billing & plan"}</Link><div className="border-t border-slate-100 px-3 py-3"><p className="mb-2 text-xs font-semibold text-slate-500">{locale === "vi" ? "Ngôn ngữ" : "Language"}</p><LanguageSwitcher locale={locale} /></div><form action={signOut} className="border-t border-slate-100 pt-2"><button className="min-h-11 w-full rounded-lg px-3 text-left text-red-700 hover:bg-red-50" type="submit">{signOutLabel}</button></form></>;
  return <>
    <nav aria-label={label} className="hidden min-w-0 items-center gap-1 lg:flex">{items.map(item => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-bold whitespace-nowrap outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700 ${matches(path, item.href) ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"}`} href={item.href} key={item.href}>{item.label}</Link>)}<Menu active={moreActive} summary={<>{moreLabel}<span aria-hidden="true">⌄</span></>}><div className="absolute left-0 z-40 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{menuLinks}</div></Menu></nav>
    <nav aria-label={label} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white px-1 pb-[env(safe-area-inset-bottom)] shadow-lg lg:hidden">{items.map((item, index) => <Link aria-current={matches(path, item.href) ? "page" : undefined} className={`flex min-h-14 min-w-0 flex-col items-center justify-center rounded-lg px-0.5 text-[10px] font-bold sm:text-xs ${matches(path, item.href) ? "text-teal-800" : "text-slate-600"}`} href={item.href} key={item.href}><span aria-hidden="true" className="text-lg leading-5">{["⌂", "▶", "◎", "▥"][index]}</span><span className="max-w-full truncate">{locale === "vi" ? ["Trang chủ", "Luyện tập", "Lỗi sai", "Tiến độ"][index] : ["Home", "Practice", "Mistakes", "Progress"][index]}</span></Link>)}<Menu active={moreActive} className="min-w-0" summary={<span className="flex flex-col items-center text-[10px] sm:text-xs"><span aria-hidden="true" className="text-lg leading-5">☰</span>{moreLabel}</span>}><div className="absolute bottom-full right-0 z-40 mb-2 max-h-[70vh] w-[min(19rem,calc(100vw-1rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl">{menuLinks}<div className="mt-2 border-t border-slate-200 pt-2">{account ? <p className="truncate px-3 py-2">{account.name}{account.status ? ` · ${account.status}` : ""}</p> : null}{accountContent}</div></div></Menu></nav>
    <div className="hidden lg:block">{account ? <Menu summary={<><PremiumAvatar avatarUrl={account.avatarUrl} name={account.name} premium={account.premium} size="sm"/><span className="hidden max-w-28 truncate xl:block">{account.name}</span><span aria-hidden="true">⌄</span></>}><div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold shadow-xl"><p className="truncate px-3 py-2">{account.name}{account.status ? ` · ${account.status}` : ""}</p>{accountContent}</div></Menu> : <Link href="/settings">{settingsLabel}</Link>}</div>
  </>;
}
