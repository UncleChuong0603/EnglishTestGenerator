import Link from "next/link";
import { getCookieLanguage } from "@/lib/i18n/get-translations";
import { getTranslations } from "@/lib/i18n/runtime";
export default async function NotFound() { const t = getTranslations(await getCookieLanguage()); return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="text-center"><p className="text-sm font-bold uppercase tracking-wider text-teal-700">404</p><h1 className="mt-3 text-4xl font-black">{t.errors.notFound}</h1><p className="mt-3 text-slate-600">{t.errors.notFoundBody}</p><Link className="mt-7 inline-flex rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" href="/dashboard">{t.errors.returnDashboard}</Link></div></main>; }
