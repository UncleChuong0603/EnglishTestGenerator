"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ActiveLearnerLinks({ items, label }: { items: readonly { href: string; label: string }[]; label: string }) { const pathname = usePathname(); return <nav className="flex gap-1 overflow-x-auto text-sm font-semibold" aria-label={label}>{items.map((item) => { const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href); return <Link aria-current={active ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-2.5 ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white hover:text-slate-950"}`} href={item.href} key={item.href}>{item.label}</Link>; })}</nav>; }
