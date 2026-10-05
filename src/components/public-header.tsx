import Link from "next/link";
import Image from "next/image";
import { startPart5Challenge } from "@/app/challenge/actions";
import { ChallengeStartButton } from "@/components/challenge-start-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getMarketingTranslations } from "@/lib/i18n/marketing";

const navLink = "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-3 py-2 text-sm font-semibold text-[#42584b] transition hover:text-[#245a43] focus-visible:outline-2";
const mobileLink = "block min-h-11 border-b border-[#e2e9df] px-2 py-3 text-sm font-semibold";
const headerAction = "inline-flex min-h-11 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-md bg-[#245a43] px-4 text-center text-sm font-bold text-white hover:bg-[#184631] disabled:cursor-wait disabled:opacity-70";

export function PublicHeader({ locale, signedIn = false, showPrimary = true }: { locale: InterfaceLanguage; signedIn?: boolean; showPrimary?: boolean }) {
  const t = getMarketingTranslations(locale);
  const accountHref = signedIn ? "/dashboard" : "/sign-in";
  const showAccountLink = !signedIn || !showPrimary;
  const primaryLabel = signedIn ? t.nav.continue : locale === "vi" ? "Thử 10 câu miễn phí" : "Try 10 free questions";
  const pendingLabel = locale === "vi" ? "Đang chuẩn bị bài…" : "Preparing your questions…";
  return <header className="public-header border-b border-[#dce3d9] bg-[#f7f6f1]">
    <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
      <Link className="inline-flex shrink-0 items-center gap-2 text-lg font-black tracking-tight text-[#183e2b]" href="/" aria-label="TOEIC GYM home"><Image src="/brand/toeic-gym-mark.png" alt="" width={36} height={36} /><span>TOEIC<span className="font-semibold"> GYM</span></span></Link>
      <nav className="hidden items-center gap-1 xl:flex" aria-label="Public navigation">
        <Link className={navLink} href="/toeic">{locale === "vi" ? "Luyện TOEIC" : "TOEIC practice"}</Link>
        <Link className={navLink} href="/ngu-phap">{locale === "vi" ? "Ngữ pháp A–Z" : "Grammar A–Z"}</Link>
        <Link className={navLink} href="/vocabulary">{locale === "vi" ? "Từ vựng" : "Vocabulary"}</Link>
        <Link className={navLink} href="/listening-lessons">{locale === "vi" ? "Nghe transcript" : "Audio & transcript"}</Link>
        <Link className={navLink} href="/ranking">{locale === "vi" ? "Xếp hạng" : "Rankings"}</Link>
        <Link className={navLink} href="/blog">Blog</Link>
      </nav>
      <div className="hidden items-center gap-2 xl:flex">
        <LanguageSwitcher locale={locale} />
        {showAccountLink ? <Link className={navLink} href={accountHref}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link> : null}
        {showPrimary && (signedIn ? <Link className={headerAction} href="/dashboard">{primaryLabel} <span className="ml-3" aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge}><ChallengeStartButton className={`${headerAction} gap-3`} label={primaryLabel} pendingLabel={pendingLabel} /></form>)}
      </div>
      <details className="group relative xl:hidden">
        <summary className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md border border-[#cbd7cb] text-xl" aria-label={locale === "vi" ? "Mở menu" : "Open menu"}>☰</summary>
        <nav className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] border border-[#cbd7cb] bg-[#f7f6f1] p-3 shadow-lg" aria-label="Public mobile navigation">
          <Link className={mobileLink} href="/#features">{locale === "vi" ? "Tất cả tính năng miễn phí" : "All free features"}</Link>
          <Link className={mobileLink} href={signedIn ? "/practice" : "/try"}>{locale === "vi" ? "Bài luyện ngắn" : "Short practice"}</Link>
          <Link className={mobileLink} href="/diagnostic">{locale === "vi" ? "Đánh giá đầu vào" : "Diagnostic"}</Link>
          <Link className={mobileLink} href="/toeic">{locale === "vi" ? "Luyện TOEIC theo Part" : "Practice by Part"}</Link>
          <Link className={mobileLink} href="/ngu-phap">{locale === "vi" ? "Ngữ pháp A–Z" : "Grammar A–Z"}</Link>
          <Link className={mobileLink} href="/vocabulary">{locale === "vi" ? "Từ vựng" : "Vocabulary"}</Link>
          <Link className={mobileLink} href="/listening-lessons">{locale === "vi" ? "Nghe theo transcript" : "Listen with a transcript"}</Link>
          <Link className={mobileLink} href="/ranking">{locale === "vi" ? "Bảng xếp hạng tuần" : "Weekly leaderboard"}</Link>
          <Link className={mobileLink} href="/ve-toeic-gym">{locale === "vi" ? "Về TOEIC GYM" : "About TOEIC GYM"}</Link>
          <Link className={mobileLink} href="/blog">Blog</Link>
          {showAccountLink ? <Link className={mobileLink} href={accountHref}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link> : null}
          <div className="px-2 py-3"><LanguageSwitcher locale={locale} /></div>
          {showPrimary && (signedIn ? <Link className="flex min-h-12 items-center justify-center rounded-md bg-[#245a43] px-4 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href="/dashboard">{primaryLabel}</Link> : <form action={startPart5Challenge}><ChallengeStartButton className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-md bg-[#245a43] px-4 font-bold text-white disabled:cursor-wait disabled:opacity-70" label={primaryLabel} pendingLabel={pendingLabel} /></form>)}
        </nav>
      </details>
    </div>
  </header>;
}
