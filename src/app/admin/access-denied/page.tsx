import Link from "next/link";
import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function AccessDeniedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/admin");
  const { interfaceLanguage: locale } = await getPreferences(user.id), vi = locale === "vi";
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12 text-slate-900"><div className="w-full max-w-lg"><header className="mb-5 flex items-center justify-between"><Link className="text-lg font-black text-teal-800" href="/dashboard">TOEICGym</Link><LanguageSwitcher locale={locale}/></header><section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10" aria-labelledby="access-title"><p className="text-sm font-black tracking-widest text-teal-700">403</p><h1 id="access-title" className="mt-3 text-3xl font-black">{vi ? "Không có quyền truy cập" : "Access denied"}</h1><p className="mt-3 leading-7 text-slate-600">{vi ? "Trang này chỉ dành cho tài khoản quản trị TOEICGym." : "This page is only available to TOEICGym administrators."}</p><div className="mt-7"><Link className="inline-flex min-h-11 items-center rounded-xl bg-teal-700 px-5 font-bold text-white" href="/dashboard">{vi ? "Về khu học tập" : "Go to learning area"}</Link></div></section></div></main>;
}
