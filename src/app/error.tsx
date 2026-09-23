"use client";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/components/locale-provider";
import { getTranslations } from "@/lib/i18n/runtime";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const locale = useLocale(); const t = getTranslations(locale);
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="max-w-md text-center"><div className="mb-8 flex justify-center"><LanguageSwitcher locale={locale} /></div><h1 className="text-3xl font-black">{t.errors.title}</h1><p className="mt-3 text-slate-600">{t.errors.body}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button className="min-h-11 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white" onClick={reset} type="button">{t.common.retry}</button><Link className="inline-flex min-h-11 items-center rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800" href="/try">{locale === "vi" ? "Chọn bài khác" : "Choose another practice"}</Link></div><p className="mt-5 text-sm text-slate-600">{locale === "vi" ? "Nếu lỗi tiếp tục, hãy gửi trang gặp lỗi cho hỗ trợ." : "If this keeps happening, send the page URL to support."} <Link className="font-bold text-teal-800 underline" href="/support#feedback">{locale === "vi" ? "Gửi phản hồi" : "Contact support"}</Link></p>{error.digest ? <p className="mt-2 text-xs text-slate-500">{locale === "vi" ? "Mã sự cố" : "Error code"}: {error.digest}</p> : null}</div></main>;
}
