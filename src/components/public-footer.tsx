import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getMarketingTranslations } from "@/lib/i18n/marketing";

export function PublicFooter({ locale }: { locale: InterfaceLanguage }) {
  const t = getMarketingTranslations(locale);
  return <footer className="border-t border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1fr_auto_auto]"><div><p className="font-black">TOEIC GYM</p><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{t.footer.note}</p></div><div><p className="text-sm font-black">{t.footer.product}</p><div className="mt-3 grid gap-2 text-sm text-slate-600"><Link href="/practice">{t.footer.practice}</Link><Link href="/pricing">{t.footer.pricing}</Link><Link href="/sign-in">{t.footer.signIn}</Link></div></div><div><p className="text-sm font-black">{t.footer.legal}</p><div className="mt-3 grid gap-2 text-sm text-slate-600"><Link href="/privacy">{t.footer.privacy}</Link><Link href="/terms">{t.footer.terms}</Link></div></div></div><div className="border-t border-slate-100 px-5 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} TOEIC GYM. {t.footer.rights}</div></footer>;
}
