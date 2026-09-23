import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getMarketingTranslations } from "@/lib/i18n/marketing";
import { PUBLIC_ACTIVATION_HREF } from "@/lib/public-product";

const navLink = "px-3 py-2 text-sm font-semibold text-[#42584b] transition hover:text-[#245a43] focus-visible:outline-2";
const mobileLink = "block min-h-11 border-b border-[#e2e9df] px-2 py-3 text-sm font-semibold";

export function PublicHeader({ locale, signedIn = false }: { locale: InterfaceLanguage; signedIn?: boolean }) {
  const t = getMarketingTranslations(locale);
  const accountHref = signedIn ? "/dashboard" : "/sign-in";
  const primaryHref = signedIn ? "/dashboard" : PUBLIC_ACTIVATION_HREF;
  const primaryLabel = signedIn ? t.nav.continue : locale === "vi" ? "Đánh giá miễn phí" : "Free diagnostic";
  return <header className="public-header border-b border-[#dce3d9] bg-[#f7f6f1]">
    <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
      <Link className="shrink-0 text-lg font-black tracking-tight text-[#183e2b]" href="/" aria-label="TOEIC GYM home">TOEIC<span className="font-semibold"> GYM</span><span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#ba7655]" aria-hidden="true" /></Link>
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Public navigation">
        <Link className={navLink} href="/#how-it-works">{t.nav.how}</Link>
        <Link className={navLink} href="/toeic">{locale === "vi" ? "Học TOEIC" : "TOEIC guide"}</Link>
        <Link className={navLink} href="/pricing">{t.nav.pricing}</Link>
        <Link className={navLink} href="/blog">{locale === "vi" ? "Kiến thức" : "Guides"}</Link>
        <Link className={navLink} href="/support">{locale === "vi" ? "Trợ giúp" : "Support"}</Link>
      </nav>
      <div className="hidden items-center gap-2 lg:flex">
        <LanguageSwitcher locale={locale} />
        <Link className={navLink} href={accountHref}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link>
        <Link className="inline-flex min-h-11 items-center rounded-md bg-[#245a43] px-4 text-center text-sm font-bold text-white hover:bg-[#184631]" href={primaryHref}>{primaryLabel} <span className="ml-3" aria-hidden="true">↗</span></Link>
      </div>
      <details className="group relative lg:hidden">
        <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md border border-[#cbd7cb] text-xl" aria-label={locale === "vi" ? "Mở menu" : "Open menu"}>☰</summary>
        <nav className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] border border-[#cbd7cb] bg-[#f7f6f1] p-3 shadow-lg" aria-label="Public mobile navigation">
          <Link className={mobileLink} href="/#how-it-works">{t.nav.how}</Link>
          <Link className={mobileLink} href="/toeic">{locale === "vi" ? "Học TOEIC" : "TOEIC guide"}</Link>
          <Link className={mobileLink} href="/pricing">{t.nav.pricing}</Link>
          <Link className={mobileLink} href="/blog">{locale === "vi" ? "Kiến thức" : "Guides"}</Link>
          <Link className={mobileLink} href="/support">{locale === "vi" ? "Trợ giúp & phản hồi" : "Support & feedback"}</Link>
          <Link className={mobileLink} href={accountHref}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link>
          <div className="px-2 py-3"><LanguageSwitcher locale={locale} /></div>
          <Link className="flex min-h-12 items-center justify-center rounded-md bg-[#245a43] px-4 font-bold text-white" href={primaryHref}>{primaryLabel}</Link>
        </nav>
      </details>
    </div>
  </header>;
}
