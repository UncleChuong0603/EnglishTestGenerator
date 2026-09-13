"use client";
import { useLocale } from "@/components/locale-provider";
import { getTranslations } from "@/lib/i18n/runtime";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) { const t = getTranslations(useLocale()); return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="max-w-md text-center"><h1 className="text-3xl font-black">{t.errors.title}</h1><p className="mt-3 text-slate-600">{t.errors.body}</p><button className="mt-7 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" onClick={reset} type="button">{t.common.retry}</button></div></main>; }
